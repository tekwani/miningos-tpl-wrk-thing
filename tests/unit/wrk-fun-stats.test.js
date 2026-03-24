'use strict'

const test = require('brittle')
const proxyquire = require('proxyquire')
const { aggrStats, buildStats } = require('../../workers/lib/wrk-fun-stats')

test('wrk-fun-stats: aggrStats with no things', async t => {
  const mockWorker = {
    loadLib: () => ({ specs: {} }),
    getSpecTags: () => [],
    mem: { things: {} }
  }

  const result = aggrStats.call(mockWorker, [])
  t.alike(result, {})
})

test('wrk-fun-stats: aggrStats with things but no specs', async t => {
  const mockWorker = {
    loadLib: () => ({ specs: {} }),
    getSpecTags: () => ['miner'],
    mem: { things: {} }
  }

  const result = aggrStats.call(mockWorker, ['thing1', 'thing2'])
  t.alike(result, {})
})

test('wrk-fun-stats: aggrStats with valid specs and things', async t => {
  const mockWorker = {
    loadLib: () => ({
      specs: {
        miner: {
          ops: {
            test_op: {
              op: 'test_operation',
              src: 'last.stats'
            }
          }
        }
      }
    }),
    getSpecTags: () => ['miner'],
    mem: {
      things: {
        thing1: {
          id: 'thing1',
          last: { stats: { test: 'value1' } },
          info: {},
          tags: ['t-miner'],
          opts: {},
          type: 'miner'
        },
        thing2: {
          id: 'thing2',
          last: { stats: { test: 'value2' } },
          info: {},
          tags: ['t-miner'],
          opts: {},
          type: 'miner'
        }
      }
    }
  }

  // Mock gLibStats.applyStats and tallyStats
  const originalApplyStats = require('miningos-lib-stats').applyStats
  const originalTallyStats = require('miningos-lib-stats').tallyStats

  require('miningos-lib-stats').applyStats = (state, acc, data, meta) => {
    acc.test = (acc.test || 0) + 1
  }
  require('miningos-lib-stats').tallyStats = (state, acc) => {
    acc.tally = true
  }

  const result = aggrStats.call(mockWorker, ['thing1', 'thing2'])

  t.ok(result.test)
  t.is(result.test, 2)
  t.ok(result.tally)

  // Restore original functions
  require('miningos-lib-stats').applyStats = originalApplyStats
  require('miningos-lib-stats').tallyStats = originalTallyStats
})

test('wrk-fun-stats: aggrStats with things parameter', async t => {
  const mockWorker = {
    loadLib: () => ({ specs: {} }),
    getSpecTags: () => [],
    mem: { things: {} }
  }

  const things = {
    thing1: { id: 'thing1', last: {}, info: {}, tags: [], opts: {}, type: 'miner' }
  }

  const result = aggrStats.call(mockWorker, ['thing1'], {}, things)
  t.alike(result, {})
})

test('wrk-fun-stats: buildStats skips on slave', async t => {
  const w = { ctx: { slave: true } }
  await buildStats.call(w, 'logk', new Date())
  t.pass()
})

test('wrk-fun-stats: buildStats skips when stats lib missing', async t => {
  const w = { ctx: {}, loadLib: (name) => (name === 'stats' ? null : {}) }
  await buildStats.call(w, 'logk', new Date())
  t.pass()
})

test('wrk-fun-stats: buildStats skips when already building', async t => {
  const w = {
    ctx: {},
    loadLib: () => ({ specs: {}, conf: {} }),
    mem: { things: {} },
    _buildingStats_logk: true
  }
  await buildStats.call(w, 'logk', new Date())
  t.pass()
})

test('wrk-fun-stats: _buildStats skips tags with skipTagPrefixes', async t => {
  const fireTime = new Date('2025-06-01T12:00:00.000Z')
  const w = {
    ctx: {},
    loadLib: (name) =>
      name === 'stats'
        ? { specs: {}, conf: { skipTagPrefixes: ['t-'] } }
        : {},
    mem: {
      things: {
        th1: { id: 'th1', tags: ['t-miner'] }
      }
    }
  }
  await buildStats.call(w, 'agg', fireTime)
  t.pass()
})

test('wrk-fun-stats: _buildStats debugError when log put fails', async t => {
  const buildStatsStub = proxyquire('../../workers/lib/wrk-fun-stats', {
    './wrk-fun-logs': {
      getBeeTimeLog: async () => ({
        put: async () => {
          throw new Error('put-fail')
        }
      }),
      releaseBeeTimeLog: async () => {}
    }
  }).buildStats

  let saw = null
  const fireTime = new Date('2025-06-01T12:00:00.000Z')
  const w = {
    ctx: {},
    loadLib: (name) =>
      name === 'stats' ? { specs: {}, conf: {} } : {},
    getSpecTags: () => [],
    mem: {
      things: {
        th1: { id: 'th1', tags: ['miner-tag'] }
      }
    },
    debugError: (_ctx, err) => {
      saw = err
    }
  }

  await buildStatsStub.call(w, 'stat', fireTime)
  t.ok(saw)
  t.is(saw.message, 'put-fail')
})
