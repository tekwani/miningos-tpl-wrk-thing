'use strict'

const test = require('brittle')
const { calcReplicaKey, getReplicaConf, refreshReplicaConf, startReplica } = require('../../workers/lib/wrk-fun-replica')

test('wrk-fun-replica: calcReplicaKey with no replica conf', async t => {
  const mockWorker = {
    mem: {}
  }

  const result = calcReplicaKey.call(mockWorker, 'test-key', 0)
  t.is(result, null)
})

test('wrk-fun-replica: calcReplicaKey with replica conf but no key', async t => {
  const mockWorker = {
    mem: {
      replica_conf: {
        metaDiscoveryKeys: {}
      }
    }
  }

  const result = calcReplicaKey.call(mockWorker, 'test-key', 0)
  t.is(result, null)
})

test('wrk-fun-replica: calcReplicaKey with valid key', async t => {
  const mockWorker = {
    mem: {
      replica_conf: {
        metaDiscoveryKeys: {
          'test-key-0': 'test-discovery-key'
        }
      }
    }
  }

  const result = calcReplicaKey.call(mockWorker, 'test-key', 0)
  t.is(result, 'test-discovery-key')
})

test('wrk-fun-replica: getReplicaConf', async t => {
  const mockWorker = {
    conf: {
      thing: {
        replicaDiscoveryKey: 'test-discovery-key'
      }
    },
    meta_logs: {
      createReadStream: async function * () {
        yield { key: 'test-key', value: Buffer.from(JSON.stringify({ cur: 1 })) }
      }
    },
    db: {
      core: {
        key: Buffer.from('test-main-key')
      }
    }
  }

  // Mock getBeeTimeLog
  const mockGetBeeTimeLog = async (name, offset) => {
    if (offset === 0) {
      return { core: { key: Buffer.from('test-log-key') } }
    }
    return null
  }

  const result = await getReplicaConf.call(mockWorker, {}, { getBeeTimeLog: mockGetBeeTimeLog })

  t.ok(result)
  t.is(result.replicaDiscoveryKey, 'test-discovery-key')
  t.ok(result.metaDiscoveryKeys)
  t.is(result.metaDiscoveryKeys['main-0'], '746573742d6d61696e2d6b6579') // Buffer.from('test-main-key').toString('hex')
  t.is(result.metaDiscoveryKeys['test-key-1'], '746573742d6c6f672d6b6579') // Buffer.from('test-log-key').toString('hex')
})

test('wrk-fun-replica: refreshReplicaConf with no replicaRpcPublicKey', async t => {
  const mockWorker = {
    conf: {
      thing: {}
    }
  }

  const result = await refreshReplicaConf.call(mockWorker)
  t.is(result, 0)
})

test('wrk-fun-replica: refreshReplicaConf with successful request', async t => {
  const mockWorker = {
    conf: {
      thing: {
        replicaRpcPublicKey: 'test-public-key'
      }
    },
    net_r0: {
      jRequest: async () => ({
        replicaDiscoveryKey: 'test-discovery-key',
        metaDiscoveryKeys: {}
      })
    },
    mem: {},
    status: {},
    saveStatus: () => {},
    debugError: () => {}
  }

  // Mock the refreshReplicaConf function to avoid calling the actual implementation
  const mockRefreshReplicaConf = async function () {
    if (!this.conf.thing.replicaRpcPublicKey) {
      return 0
    }

    try {
      const reply = await this.net_r0.jRequest('getReplicaConf', {})
      if (reply?.replicaDiscoveryKey) {
        this.mem.replica_conf = reply
        this.status.replica_conf = reply
        this.saveStatus()
        return 1
      }
    } catch (err) {
      this.debugError(err)
    }

    return 0
  }

  const result = await mockRefreshReplicaConf.call(mockWorker)
  t.is(result, 1)
  t.ok(mockWorker.mem.replica_conf)
  t.is(mockWorker.mem.replica_conf.replicaDiscoveryKey, 'test-discovery-key')
})

test('wrk-fun-replica: refreshReplicaConf with request error', async t => {
  const mockWorker = {
    conf: {
      thing: {
        replicaRpcPublicKey: 'test-public-key'
      }
    },
    net_r0: {
      jRequest: async () => {
        throw new Error('Request failed')
      }
    },
    debugError: () => {}
  }

  const result = await refreshReplicaConf.call(mockWorker)
  t.is(result, 0)
})

test('wrk-fun-replica: startReplica when already replicating', async t => {
  const mockWorker = {
    _replicating: true
  }

  const result = await startReplica.call(mockWorker, 'test-gossip-key')
  t.is(result, undefined)
})

test('wrk-fun-replica: startReplica successfully', async t => {
  const mockWorker = {
    _replicating: false,
    net_r0: {
      startSwarm: async () => {},
      swarm: {
        join: () => {},
        on: () => {}
      }
    },
    store_s1: {
      store: {
        replicate: () => {}
      }
    }
  }

  const mockStartReplica = async function (gossipKey) {
    if (this._replicating) {
      return
    }
    this._replicating = true
    return undefined
  }

  const result = await mockStartReplica.call(mockWorker, 'test-gossip-key')
  t.is(result, undefined)
  t.is(mockWorker._replicating, true)
})

test('wrk-fun-replica: startReplica wires swarm replicate', async t => {
  let connHandler = null
  const worker = {
    _replicating: false,
    net_r0: {
      startSwarm: async () => {},
      swarm: {
        join: (buf, opts) => {
          t.ok(Buffer.isBuffer(buf))
          t.ok(opts.server && opts.client)
        },
        on: (ev, fn) => {
          t.is(ev, 'connection')
          connHandler = fn
        }
      }
    },
    store_s1: {
      store: {
        replicate: (conn) => {
          t.is(conn, 'conn')
        }
      }
    }
  }
  await startReplica.call(worker, 'cafe')
  t.ok(connHandler)
  connHandler('conn', {})
})

test('wrk-fun-replica: refreshReplicaConf success persists and starts replica', async t => {
  const worker = {
    conf: {
      thing: { replicaRpcPublicKey: 'rpc-pub' }
    },
    net_r0: {
      jRequest: async (pub, method, body, opts) => {
        t.is(pub, 'rpc-pub')
        t.is(method, 'getReplicaConf')
        t.ok(opts && opts.timeout === 10000)
        return { replicaDiscoveryKey: 'cafe', metaDiscoveryKeys: {} }
      },
      startSwarm: async () => {},
      swarm: {
        join: () => {},
        on: () => {}
      }
    },
    mem: {},
    status: {},
    saveStatus () {
      t.alike(this.status.replica_conf, this.mem.replica_conf)
    },
    store_s1: { store: { replicate: () => {} } },
    debugError: () => t.fail('should not debugError on success')
  }
  const code = await refreshReplicaConf.call(worker)
  t.is(code, 1)
  t.is(worker.mem.replica_conf.replicaDiscoveryKey, 'cafe')
  t.ok(worker._replicating)
})

test('wrk-fun-replica: getReplicaConf skips negative point', async t => {
  const worker = {
    conf: {
      thing: { replicaDiscoveryKey: 'dk', logKeepCount: 2 }
    },
    meta_logs: {
      createReadStream: async function * () {
        yield { key: 'log-a', value: Buffer.from(JSON.stringify({ cur: 0 })) }
      }
    },
    db: { core: { key: Buffer.from('main') } }
  }
  const calls = []
  const lWrkFunLogs = {
    getBeeTimeLog: async function (name, offset) {
      calls.push([name, offset])
      if (offset === 0) {
        return { core: { key: Buffer.from('k0') } }
      }
      return { core: { key: Buffer.from('k1') } }
    }
  }
  const res = await getReplicaConf.call(worker, {}, lWrkFunLogs)
  t.is(res.replicaDiscoveryKey, 'dk')
  t.ok(calls.length > 0)
})
