'use strict'

const test = require('brittle')
const WrkProcVar = require('../../workers/rack.thing.wrk')

test('WrkProcVar: getThingType', async t => {
  // Create a minimal instance for testing
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  // Mock the parent constructor behavior
  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf
  worker.prefix = 'wrk-thing-rack-test-rack'

  const result = worker.getThingType()
  t.is(result, 'thing')
})

test('WrkProcVar: getThingTags', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf

  const result = worker.getThingTags()
  t.alike(result, [])
})

test('WrkProcVar: selectThingInfo', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf

  const result = worker.selectThingInfo()
  t.alike(result, {})
})

test('WrkProcVar: _getWrkExtData', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf

  const result = worker._getWrkExtData({ test: 'args' })
  t.alike(result, {})
})

test('WrkProcVar: _generateThingId', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf

  const result = worker._generateThingId()
  t.ok(typeof result === 'string')
  t.ok(result.length > 0)
})

test('WrkProcVar: _getMaxThingCode with no things', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf
  worker.mem = { things: {} }

  const result = worker._getMaxThingCode()
  t.is(result, 0)
})

test('WrkProcVar: _getMaxThingCode with things', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf
  worker.mem = {
    things: {
      thing1: { code: 'THING-0001' },
      thing2: { code: 'THING-0005' },
      thing3: { code: 'THING-0003' }
    }
  }

  const result = worker._getMaxThingCode()
  t.is(result, 5)
})

test('WrkProcVar: _generateThingCode', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf
  worker.mem = { things: {} }

  const result = worker._generateThingCode({})
  t.ok(result.startsWith('THING-'))
  t.ok(result.endsWith('0001'))
})

test('WrkProcVar: _generateThingCode with seed', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf
  worker.mem = { things: {} }

  const result = worker._generateThingCode({}, 42)
  t.ok(result.startsWith('THING-'))
  t.ok(result.endsWith('0042'))
})

test('WrkProcVar: queryThing - should throw ERR_THING_NOTFOUND when thing does not exist', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf
  worker.mem = { things: {} }

  try {
    await worker.queryThing({ id: 'non-existent-thing', method: 'testMethod', params: [] })
    t.fail('Should have thrown ERR_THING_NOTFOUND')
  } catch (error) {
    t.is(error.message, 'ERR_THING_NOTFOUND')
  }
})

test('WrkProcVar: queryThing - should throw ERR_THING_NOT_INITIALIZED when ctrl is null', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf
  worker.mem = {
    things: {
      'thing-1': {
        id: 'thing-1',
        ctrl: null
      }
    }
  }

  try {
    await worker.queryThing({ id: 'thing-1', method: 'testMethod', params: [] })
    t.fail('Should have thrown ERR_THING_NOT_INITIALIZED')
  } catch (error) {
    t.is(error.message, 'ERR_THING_NOT_INITIALIZED')
  }
})

test('WrkProcVar: queryThing - should throw ERR_THING_NOT_INITIALIZED when ctrl is undefined', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf
  worker.mem = {
    things: {
      'thing-1': {
        id: 'thing-1'
        // ctrl is undefined
      }
    }
  }

  try {
    await worker.queryThing({ id: 'thing-1', method: 'testMethod', params: [] })
    t.fail('Should have thrown ERR_THING_NOT_INITIALIZED')
  } catch (error) {
    t.is(error.message, 'ERR_THING_NOT_INITIALIZED')
  }
})

test('WrkProcVar: queryThing - should throw ERR_THING_METHOD_NOTFOUND when method does not exist', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf
  worker.mem = {
    things: {
      'thing-1': {
        id: 'thing-1',
        ctrl: {
          existingMethod: async () => 'result'
        }
      }
    }
  }

  try {
    await worker.queryThing({ id: 'thing-1', method: 'nonExistentMethod', params: [] })
    t.fail('Should have thrown ERR_THING_METHOD_NOTFOUND')
  } catch (error) {
    t.is(error.message, 'ERR_THING_METHOD_NOTFOUND')
  }
})

test('WrkProcVar: queryThing - should successfully call method with no params', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf
  worker.mem = {
    things: {
      'thing-1': {
        id: 'thing-1',
        ctrl: {
          testMethod: async () => {
            return { success: true, data: 'test-result' }
          }
        }
      }
    }
  }

  const result = await worker.queryThing({ id: 'thing-1', method: 'testMethod', params: [] })
  t.alike(result, { success: true, data: 'test-result' })
})

test('WrkProcVar: queryThing - should successfully call method with params', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf
  worker.mem = {
    things: {
      'thing-1': {
        id: 'thing-1',
        ctrl: {
          testMethod: async (param1, param2) => {
            return { param1, param2, sum: param1 + param2 }
          }
        }
      }
    }
  }

  const result = await worker.queryThing({ id: 'thing-1', method: 'testMethod', params: [10, 20] })
  t.alike(result, { param1: 10, param2: 20, sum: 30 })
})

test('WrkProcVar: queryThing - should pass ctrl as this context to method', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf

  const mockCtrl = {
    value: 42,
    testMethod: async function () {
      return this.value
    }
  }

  worker.mem = {
    things: {
      'thing-1': {
        id: 'thing-1',
        ctrl: mockCtrl
      }
    }
  }

  const result = await worker.queryThing({ id: 'thing-1', method: 'testMethod', params: [] })
  t.is(result, 42)
})

test('WrkProcVar: queryThing - should handle method that throws error', async t => {
  const conf = { thing: {} }
  const ctx = { rack: 'test-rack' }

  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf
  worker.mem = {
    things: {
      'thing-1': {
        id: 'thing-1',
        ctrl: {
          testMethod: async () => {
            throw new Error('Method execution error')
          }
        }
      }
    }
  }

  try {
    await worker.queryThing({ id: 'thing-1', method: 'testMethod', params: [] })
    t.fail('Should have thrown error from method')
  } catch (error) {
    t.is(error.message, 'Method execution error')
  }
})

function protoWorker (extra = {}) {
  const conf = { thing: { thingQueryConcurrency: 4, logKeepCount: 3 } }
  const ctx = { rack: 'test-rack' }
  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = ctx
  worker.conf = conf
  worker.mem = { things: {}, log_cache: {}, collectingThingSnap: {} }
  worker.rackId = 'thing-test-rack'
  worker.net_r0 = { rpcServer: { publicKey: Buffer.from([1, 2, 3]) } }
  worker.statTimeframes = [['5m', '0 */5 * * * *']]
  Object.assign(worker, extra)
  return worker
}

test('WrkProcVar: _getOfflineSnap', async t => {
  const w = protoWorker()
  const snap = w._getOfflineSnap()
  t.is(snap.success, false)
  t.is(snap.stats.status, 'offline')
})

test('WrkProcVar: getRpcKey and getRack', async t => {
  const w = protoWorker()
  t.alike(w.getRpcKey(), Buffer.from([1, 2, 3]))
  const rack = w.getRack({})
  t.is(rack.id, 'thing-test-rack')
  t.is(rack.rpcPubKey, '010203')
})

test('WrkProcVar: debug helpers', async t => {
  const w = protoWorker()
  w.debugThingError({ id: 't1' }, new Error('e'))
  w.debugError('ctx', new Error('e2'))
  w.debug('msg')
  t.pass()
})

test('WrkProcVar: disconnectThing closes ctrl when present', async t => {
  const w = protoWorker()
  let closed = false
  await w.disconnectThing({ ctrl: { close: () => { closed = true } } })
  t.ok(closed)
  await w.disconnectThing({ ctrl: {} })
  t.pass()
})

test('WrkProcVar: reconnectThing', async t => {
  const w = protoWorker()
  w.disconnectThing = async () => {}
  w.connectThing = async () => {}
  await w.reconnectThing({ ctrl: { close: () => {} } })
  t.pass()
})

test('WrkProcVar: _prepThingTags', async t => {
  const w = protoWorker()
  const tags = w._prepThingTags(
    { id: 'i1', code: 'THING-0001', info: { pos: 'p1', container: 'c1' } },
    ['aux-a'],
    { tags: ['keep-me'] }
  )
  t.ok(tags.includes('id-i1'))
  t.ok(tags.includes('code-THING-0001'))
  t.ok(tags.includes('aux-a'))
  t.ok(tags.includes('keep-me'))
  t.ok(tags.includes('pos-p1'))
  t.ok(tags.includes('container-c1'))
})

test('WrkProcVar: _prepThingTags rejects invalid aux', async t => {
  const w = protoWorker()
  try {
    w._prepThingTags({ id: 'i', code: 'C' }, 'not-array')
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_THING_TAGS_INVALID')
  }
})

test('WrkProcVar: _validateRegisterThing', async t => {
  const w = protoWorker()
  w.mem.things = { x: { id: 'x' } }
  try {
    w._validateRegisterThing({ id: 'x' })
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_THING_WITH_ID_ALREADY_EXISTS')
  }
  try {
    w._validateRegisterThing({ code: 'BAD' })
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_THING_CODE_INVALID')
  }
  w.mem.things = { a: { code: 'THING-0001' } }
  try {
    w._validateRegisterThing({ code: 'THING-0001' })
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_THING_WITH_CODE_ALREADY_EXISTS')
  }
})

test('WrkProcVar: _validateThingExists and _checkWriteAccessToThing', async t => {
  const w = protoWorker()
  try {
    w._validateThingExists('nope')
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_THING_NOTFOUND')
  }
  w.mem.things = { t1: { id: 't1' } }
  w._validateThingExists('t1')
  w.ctx.slave = true
  try {
    w._checkWriteAccessToThing({ thingId: 't1' })
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_SLAVE_BLOCK')
  }
  w.ctx.slave = false
  w._checkWriteAccessToThing({ thingId: 't1' })
  try {
    w._checkWriteAccessToThing({ thingId: 'missing' })
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_THING_NOTFOUND')
  }
})

test('WrkProcVar: _findCommentIndex and _checkCommentPermission', async t => {
  const w = protoWorker()
  const thg = {
    comments: [
      { id: 'c1', ts: 10, user: 'u1' },
      { id: 'c2', ts: 20, user: 'u2' }
    ]
  }
  t.is(w._findCommentIndex(thg, { id: 'c2' }), 1)
  t.is(w._findCommentIndex(thg, { ts: 10 }), 0)
  t.is(w._findCommentIndex(thg, {}), -1)
  try {
    w._checkCommentPermission(thg, 0, { user: 'other' })
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_COMMENT_ACCESS_DENIED')
  }
  w._checkCommentPermission(thg, 0, { user: 'u1' })
  t.pass()
})

test('WrkProcVar: listThings and getThingsCount', async t => {
  const w = protoWorker()
  w.mem.things = {
    a: {
      id: 'a',
      code: 'THING-0001',
      type: 'thing',
      tags: [],
      info: { n: 1 },
      comments: [],
      last: { snap: { x: 1 } }
    },
    b: {
      id: 'b',
      code: 'THING-0002',
      type: 'thing',
      tags: [],
      info: { n: 2 },
      comments: []
    }
  }
  t.is(w.getThingsCount({}), 2)
  t.is(w.getThingsCount({ query: { 'info.n': 2 } }), 1)
  const listed = w.listThings({ offset: 0, limit: 10, status: true })
  t.is(listed.length, 2)
  t.ok(listed[0].last)
})

test('WrkProcVar: _applyFilters sort offset limit', async t => {
  const w = protoWorker()
  const things = [
    { id: 'b', info: { ord: 'item-2' } },
    { id: 'a', info: { ord: 'item-10' } }
  ]
  const sorted = w._applyFilters(things, { sort: { 'info.ord': 1 }, offset: 0, limit: 1 }, true)
  t.is(sorted.length, 1)
  t.is(sorted[0].id, 'b')
})

test('WrkProcVar: _projection', async t => {
  const w = protoWorker()
  const out = w._projection([{ a: 1, b: 2 }], { a: 1 })
  t.ok(Array.isArray(out))
  t.is(out[0].a, 1)
  t.absent(out[0].b)
})

test('WrkProcVar: _transformAlerts and _transformInfoHistory', async t => {
  const w = protoWorker()
  w.mem.things = {
    t1: { id: 't1', info: { x: 1 }, tags: ['t'], type: 'thing', code: 'C1' }
  }
  const alerts = w._transformAlerts(
    [{ u1: { thingId: 't1', msg: 'a' } }],
    { limit: 5 }
  )
  t.is(alerts.length, 1)
  t.is(alerts[0].thing.id, 't1')
  const hist = w._transformInfoHistory(
    [[{ id: 't1', changes: {} }]],
    { limit: 5, fields: {} }
  )
  t.is(hist.length, 1)
})

test('WrkProcVar: _parseHistLog', async t => {
  const w = protoWorker()
  const log = {
    createReadStream () {
      return (async function * () {
        yield { value: Buffer.from(JSON.stringify({ z: 9 })) }
      })()
    }
  }
  const rows = await w._parseHistLog(log, { reverse: true, limit: 5 })
  t.is(rows.length, 1)
  t.is(rows[0].z, 9)
})

test('WrkProcVar: applyThings', async t => {
  const w = protoWorker()
  w._handler = WrkProcVar.prototype._createApplyThingsProxy.call(w)
  w.mem.things = {
    t1: { id: 't1', ctrl: { ping: async () => 7 } }
  }
  const n = await w.applyThings({ method: 'ping', params: [] })
  t.is(n, 1)
})

test('WrkProcVar: applyThings slave blocks', async t => {
  const w = protoWorker()
  w.ctx.slave = true
  try {
    await w.applyThings({ method: 'm' })
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_SLAVE_BLOCK')
  }
})

test('WrkProcVar: applyThings requires method', async t => {
  const w = protoWorker()
  try {
    await w.applyThings({})
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_METHOD_INVALID')
  }
})

test('WrkProcVar: saveThingComment', async t => {
  const w = protoWorker()
  w.ctx.slave = false
  w.mem.things = { t1: { id: 't1' } }
  w.things = {
    get: async () => ({
      value: Buffer.from(JSON.stringify({ id: 't1', comments: [] }))
    }),
    put: async () => {}
  }
  w._saveThing = async () => {}
  await w.saveThingComment({
    thingId: 't1',
    user: 'u',
    comment: 'hi',
    pos: 1
  })
  t.pass()
})

test('WrkProcVar: editThingComment and deleteThingComment', async t => {
  const w = protoWorker()
  w.ctx.slave = false
  w.mem.things = { t1: { id: 't1' } }
  let stored = {
    id: 't1',
    comments: [{ id: 'c1', ts: 1, user: 'u', comment: 'old' }]
  }
  w.things = {
    get: async () => ({
      value: Buffer.from(JSON.stringify(stored))
    }),
    put: async (_id, buf) => {
      stored = JSON.parse(buf.toString())
    }
  }
  w._saveThing = async (thg) => {
    stored = JSON.parse(JSON.stringify(thg))
    await w.things.put(thg.id, Buffer.from(JSON.stringify(stored)))
  }
  await w.editThingComment({ thingId: 't1', user: 'u', id: 'c1', comment: 'new' })
  t.is(stored.comments[0].comment, 'new')
  await w.deleteThingComment({ thingId: 't1', user: 'u', id: 'c1' })
  t.is(stored.comments.length, 0)
})

test('WrkProcVar: forgetThings with all', async t => {
  const w = protoWorker()
  w.ctx.slave = false
  w.mem.things = { t1: { id: 't1' } }
  w.things = { del: async () => {} }
  w.forgetThingHook0 = async () => {}
  await w.forgetThings({ all: true })
  t.absent(w.mem.things.t1)
})

test('WrkProcVar: getWrkExtData and getWrkConf', async t => {
  const w = protoWorker()
  t.alike(await w.getWrkExtData({}), {})
  try {
    await w.getWrkConf({})
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_GLOBAL_CONFIG_MISSING')
  }
  w.conf.globalConfig = { k: 1 }
  const cfg = await w.getWrkConf({ fields: {} })
  t.is(cfg.k, 1)
})

test('WrkProcVar: getThingConf', async t => {
  const w = protoWorker()
  w.mem.nextAvailableCode = 'THING-0099'
  const code = await w.getThingConf({ requestType: 'nextAvailableCode' })
  t.is(code, 'THING-0099')
  try {
    await w.getThingConf({ requestType: 'other' })
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_INVALID_REQUEST_TYPE')
  }
})

test('WrkProcVar: saveWrkSettings validates entries', async t => {
  const w = protoWorker()
  try {
    await w.saveWrkSettings({})
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_ENTRIES_INVALID')
  }
})

test('WrkProcVar: getHistoricalLogs rejects missing type', async t => {
  const w = protoWorker()
  try {
    await w.getHistoricalLogs({})
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_INFO_HISTORY_LOG_TYPE_INVALID')
  }
})

test('WrkProcVar: tailLog validates key and tag', async t => {
  const w = protoWorker()
  try {
    await w.tailLog({})
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_LOG_KEY_NOTFOUND')
  }
  try {
    await w.tailLog({ key: 'k' })
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_LOG_TAG_INVALID')
  }
})

test('WrkProcVar: registerThing slave blocks', async t => {
  const w = protoWorker()
  w.ctx.slave = true
  try {
    await w.registerThing({})
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_SLAVE_BLOCK')
  }
})

test('WrkProcVar: updateThing slave blocks', async t => {
  const w = protoWorker()
  w.ctx.slave = true
  try {
    await w.updateThing({ id: 'x' })
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_SLAVE_BLOCK')
  }
})

test('WrkProcVar: forgetThings slave blocks', async t => {
  const w = protoWorker()
  w.ctx.slave = true
  try {
    await w.forgetThings({})
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_SLAVE_BLOCK')
  }
})

test('WrkProcVar: collectSnaps returns early on slave', async t => {
  const w = protoWorker()
  w.ctx.slave = true
  await w.collectSnaps()
  t.pass()
})

test('WrkProcVar: loadLib loads project workers/lib module', async t => {
  const path = require('path')
  const w = protoWorker()
  w.ctx.root = path.join(__dirname, '../..')
  const lib = w.loadLib('base')
  t.ok(lib)
})

test('WrkProcVar: loadLib returns null for missing module', async t => {
  const w = protoWorker()
  w.ctx.root = require('path').join(__dirname, '../..')
  const lib = w.loadLib('nonexistent-module-xyz')
  t.is(lib, null)
})

test('WrkProcVar: saveThingData updates mem', async t => {
  const w = protoWorker()
  w.mem.things = {
    t1: { id: 't1', opts: {}, info: {}, tags: [], comments: [] }
  }
  w._saveThingDataToDb = async () => {}
  await w.saveThingData({ id: 't1', opts: { z: 9 } })
  t.is(w.mem.things.t1.opts.z, 9)
})

test('WrkProcVar: updateThing merges info and comment', async t => {
  const w = protoWorker()
  w.ctx.slave = false
  let db = {
    id: 't1',
    code: 'THING-0001',
    opts: { o: 1 },
    info: { a: 1 },
    tags: ['id-t1', 'code-THING-0001'],
    comments: []
  }
  w.mem.things = {
    t1: { id: 't1', code: 'THING-0001', opts: {}, info: {}, tags: [], comments: [], last: {} }
  }
  w.things = {
    get: async () => ({ value: Buffer.from(JSON.stringify(db)) }),
    put: async (_id, buf) => {
      db = JSON.parse(buf.toString())
    }
  }
  w.updateThingHook0 = async () => {}
  w.reconnectThing = async () => {}
  await w.updateThing({
    id: 't1',
    info: { b: 2 },
    user: 'alice',
    comment: 'note'
  })
  t.is(db.info.b, 2)
  t.is(db.info.a, 1)
  t.is(db.comments.length, 1)
  t.is(db.comments[0].user, 'alice')
})

test('WrkProcVar: _filterThings with query', async t => {
  const w = protoWorker()
  w.mem.things = {
    x: { id: 'x', info: { n: 1 } },
    y: { id: 'y', info: { n: 2 } }
  }
  const ids = w._filterThings({ query: { 'info.n': 2 } })
  t.is(ids.length, 1)
  t.is(ids[0], 'y')
})

test('WrkProcVar: _addWhitelistedActions', async t => {
  const w = protoWorker()
  let called = null
  w.miningosThgWriteCalls_0 = {
    whitelistActions: (a) => { called = a }
  }
  w._addWhitelistedActions([['a', 1]])
  t.alike(called, [['a', 1]])
})

test('WrkProcVar: editThingComment errors', async t => {
  const w = protoWorker()
  w.ctx.slave = false
  w.mem.things = { t1: { id: 't1' } }
  w.things = {
    get: async () => ({
      value: Buffer.from(JSON.stringify({ id: 't1', comments: 'bad' }))
    })
  }
  try {
    await w.editThingComment({ thingId: 't1', user: 'u', id: 'c' })
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_THING_COMMENTS_NOTFOUND')
  }
})

test('WrkProcVar: editThingComment not found', async t => {
  const w = protoWorker()
  w.ctx.slave = false
  w.mem.things = { t1: { id: 't1' } }
  w.things = {
    get: async () => ({
      value: Buffer.from(JSON.stringify({ id: 't1', comments: [] }))
    })
  }
  try {
    await w.editThingComment({ thingId: 't1', user: 'u', id: 'missing' })
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_THING_COMMENT_NOTFOUND')
  }
})

test('WrkProcVar: setupThing returns 0 when thing already in mem', async t => {
  const w = protoWorker()
  w.mem.things = { t1: { id: 't1' } }
  const r = await w.setupThing({ id: 't1' })
  t.is(r, 0)
})

test('WrkProcVar: setupThings with empty DB stream', async t => {
  const w = protoWorker()
  w.things = {
    createReadStream () {
      return (async function * () {})()
    }
  }
  w._assignCodesToThings = async () => {}
  await w.setupThings()
  t.pass()
})

test('WrkProcVar: _getTailLogWithOffset single fetch when no range match and no limit', async t => {
  const w = protoWorker()
  w.statTimeframes = [['5m', '0 */5 * * * *']]
  let calls = 0
  w._getLogResponse = async () => {
    calls++
    return [{ v: 1 }]
  }
  const out = await w._getTailLogWithOffset({
    key: 'stat-unknown-key',
    tag: 'miner',
    start: 1,
    end: 2
  }, 0)
  t.is(calls, 1)
  t.is(out.length, 1)
})

test('WrkProcVar: _getTailLogWithOffset continues after partial error', async t => {
  const w = protoWorker()
  w.conf.thing.logKeepCount = 5
  w.statTimeframes = [['5m', '0 */5 * * * *']]
  let n = 0
  w._getLogResponse = async () => {
    n++
    if (n === 1) return [{ a: 1 }]
    throw new Error('eof')
  }
  const out = await w._getTailLogWithOffset({
    key: 'stat-5m',
    tag: 'miner',
    limit: 5
  }, 0)
  t.ok(out.length >= 1)
})

test('WrkProcVar: _parseHistLog applies range and limit options', async t => {
  const w = protoWorker()
  const log = {
    createReadStream (q) {
      t.ok(q)
      return (async function * () {
        yield { value: Buffer.from(JSON.stringify({ ok: true })) }
      })()
    }
  }
  const rows = await w._parseHistLog(log, {
    start: 100,
    end: 200,
    startExcl: 50,
    endExcl: 300,
    limit: 5,
    reverse: true
  })
  t.is(rows.length, 1)
})

test('WrkProcVar: tailLog with groupRange', async t => {
  const w = protoWorker()
  w._getTailLogWithOffset = async () => [
    { ts: 1_700_000_000_000, v: 10 },
    { ts: 1_700_000_000_000 + 3600_000, v: 20 }
  ]
  w.tailLogHook0 = async () => {}
  const out = await w.tailLog({
    key: 'stat-5m',
    tag: 'miner',
    groupRange: '1H',
    shouldCalculateAvg: false
  })
  t.ok(Array.isArray(out))
  t.ok(out.length >= 1)
})

test('WrkProcVar: tailLog with fields projection', async t => {
  const w = protoWorker()
  w._getTailLogWithOffset = async () => [{ ts: 1, a: 1, b: 2 }]
  w.tailLogHook0 = async () => {}
  const out = await w.tailLog({
    key: 'stat-5m',
    tag: 'miner',
    fields: { a: 1 }
  })
  t.ok(Array.isArray(out))
  t.is(out[0].a, 1)
  t.absent(out[0].b)
})

test('WrkProcVar: deleteThingComment permission denied', async t => {
  const w = protoWorker()
  w.ctx.slave = false
  w.mem.things = { t1: { id: 't1' } }
  w.things = {
    get: async () => ({
      value: Buffer.from(JSON.stringify({
        id: 't1',
        comments: [{ id: 'c1', ts: 1, user: 'owner', comment: 'x' }]
      }))
    })
  }
  try {
    await w.deleteThingComment({ thingId: 't1', user: 'other', id: 'c1' })
    t.fail()
  } catch (e) {
    t.is(e.message, 'ERR_COMMENT_ACCESS_DENIED')
  }
})

test('WrkProcVar: forgetThings default empty query', async t => {
  const w = protoWorker()
  w.ctx.slave = false
  await w.forgetThings({})
  t.pass()
})

test('WrkProcVar: getHistoricalLogs alerts', async t => {
  const w = protoWorker()
  w.mem.things = {
    t1: { id: 't1', info: { n: 1 }, tags: ['x'], type: 'thing', code: 'C1' }
  }
  w._getLogs = async (req, logKey, errMsg, transformFn) => {
    return transformFn([{ u1: { thingId: 't1', createdAt: 1, uuid: 'u1' } }], req)
  }
  const out = await w.getHistoricalLogs({ logType: 'alerts', limit: 10 })
  t.ok(Array.isArray(out))
  t.is(out[0].thing.id, 't1')
})

test('WrkProcVar: getHistoricalLogs info', async t => {
  const w = protoWorker()
  w.mem.things = {
    t1: { id: 't1', info: { n: 1 }, tags: [], type: 'thing', code: 'C1' }
  }
  w._getLogs = async (req, logKey, errMsg, transformFn) => {
    return transformFn([[{ id: 't1', changes: { a: 1 }, ts: 1 }]], req)
  }
  const out = await w.getHistoricalLogs({
    logType: 'info',
    limit: 10,
    offset: 0
  })
  t.ok(Array.isArray(out))
  t.ok(out.length >= 1)
})

test('WrkProcVar: forgetThings removes things matching query', async t => {
  const w = protoWorker()
  w.ctx.slave = false
  w.mem.things = {
    a: { id: 'a', info: { zone: 'z1' } },
    b: { id: 'b', info: { zone: 'z2' } }
  }
  w.things = { del: async () => {} }
  w.forgetThingHook0 = async () => {}
  await w.forgetThings({ query: { 'info.zone': 'z1' } })
  t.absent(w.mem.things.a)
  t.ok(w.mem.things.b)
})

test('WrkProcVar: _storeInfoChangesToDb appends history', async t => {
  const w = protoWorker()
  let putCount = 0
  w._getInfoHistoryLog = async () => ({
    get: async () => null,
    put: async () => {
      putCount++
    },
    close: async () => {},
    discoveryKey: Buffer.from('ab', 'hex')
  })
  w.debugError = () => {}
  await w._storeInfoChangesToDb(
    { info: { a: 1 } },
    { id: 't1', info: { a: 2 } }
  )
  t.is(putCount, 1)
})
