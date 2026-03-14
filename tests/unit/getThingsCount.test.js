'use strict'

const test = require('brittle')
const WrkProcVar = require('../../workers/rack.thing.wrk')

function createWorker (things = {}) {
  const worker = Object.create(WrkProcVar.prototype)
  worker.ctx = { rack: 'test-rack' }
  worker.conf = { thing: {} }
  worker.mem = { things }
  worker.rackId = 'test-rack'
  return worker
}

test('getThingsCount - returns count of all things when no query', async (t) => {
  const worker = createWorker({
    't-1': { id: 't-1', tags: ['t-miner'] },
    't-2': { id: 't-2', tags: ['t-miner'] },
    't-3': { id: 't-3', tags: ['t-container'] }
  })

  const result = worker.getThingsCount({})
  t.is(result, 3)
})

test('getThingsCount - returns filtered count with query', async (t) => {
  const worker = createWorker({
    't-1': { id: 't-1', tags: ['t-miner'] },
    't-2': { id: 't-2', tags: ['t-miner'] },
    't-3': { id: 't-3', tags: ['t-container'] }
  })

  const result = worker.getThingsCount({ query: { tags: { $in: ['t-miner'] } } })
  t.is(result, 2)
})

test('getThingsCount - returns 0 when no things match', async (t) => {
  const worker = createWorker({
    't-1': { id: 't-1', tags: ['t-miner'] }
  })

  const result = worker.getThingsCount({ query: { tags: { $in: ['t-container'] } } })
  t.is(result, 0)
})

test('getThingsCount - returns 0 when no things exist', async (t) => {
  const worker = createWorker({})

  const result = worker.getThingsCount({})
  t.is(result, 0)
})
