'use strict'

const test = require('brittle')
const BaseThing = require('../../workers/lib/base')

class BaseThingSnapOk extends BaseThing {
  async _prepSnap () {
    return { stats: { status: 'ok' }, config: { a: 1 } }
  }
}

class BaseThingSnapFail extends BaseThing {
  async _prepSnap () {
    throw new Error('ERR_SNAP_FAIL')
  }
}

class BaseThingSnapOffline extends BaseThing {
  async _prepSnap () {
    throw new Error('ERR_OFFLINE')
  }
}

test('BaseThing: constructor', async t => {
  const thing = new BaseThing('test-type', { lastSeenTimeout: 5000 })

  t.is(thing._type, 'test-type')
  t.is(thing.opts.lastSeenTimeout, 5000)
  t.is(thing.opts.timeout, 10000) // default value
  t.ok(thing.debug)
  t.ok(thing.debugError)
  t.is(thing.lastSnap, null)
})

test('BaseThing: updateLastSeen', async t => {
  const thing = new BaseThing('test-type', {})
  const before = Date.now()

  thing.updateLastSeen()

  t.ok(thing._lastSeen >= before)
  t.ok(thing._lastSeen <= Date.now())
})

test('BaseThing: isThingOnline - online', async t => {
  const thing = new BaseThing('test-type', { lastSeenTimeout: 5000 })

  thing.updateLastSeen()
  t.ok(thing.isThingOnline())
})

test('BaseThing: isThingOnline - offline (never seen)', async t => {
  const thing = new BaseThing('test-type', { lastSeenTimeout: 5000 })

  t.not(thing.isThingOnline())
})

test('BaseThing: isThingOnline - offline (timeout)', async t => {
  const thing = new BaseThing('test-type', { lastSeenTimeout: 100 })

  thing.updateLastSeen()

  // Wait for timeout
  await new Promise(resolve => setTimeout(resolve, 150))

  t.not(thing.isThingOnline())
})

test('BaseThing: validateWriteAction throws error', async t => {
  const thing = new BaseThing('test-type', {})

  await t.exception(async () => {
    thing.validateWriteAction()
  }, 'ERR_NO_IMPL')
})

test('BaseThing: _prepSnap throws error', async t => {
  const thing = new BaseThing('test-type', {})

  await t.exception(async () => {
    await thing._prepSnap()
  }, 'ERR_NO_IMPL')
})

test('BaseThing: _handleErrorUpdates', async t => {
  const thing = new BaseThing('test-type', {})
  const errors = ['error1', 'error2']

  thing._handleErrorUpdates(errors)

  t.is(thing._errorLog.length, 2)
  t.is(thing._errorLog[0], 'error1')
  t.is(thing._errorLog[1], 'error2')
})

test('BaseThing: _handleErrorUpdates clears previous errors', async t => {
  const thing = new BaseThing('test-type', {})
  const errors1 = ['error1']
  const errors2 = ['error2', 'error3']

  thing._handleErrorUpdates(errors1)
  t.is(thing._errorLog.length, 1)

  thing._handleErrorUpdates(errors2)
  t.is(thing._errorLog.length, 2)
  t.is(thing._errorLog[0], 'error2')
  t.is(thing._errorLog[1], 'error3')
})

test('BaseThing: getRealtimeData returns lastSnap', async t => {
  const thing = new BaseThing('test-type', {})
  const mockSnap = { success: true, stats: {} }

  thing.lastSnap = mockSnap

  const result = await thing.getRealtimeData()
  t.is(result, mockSnap)
})

test('BaseThing: debugError with alert uses console.error', async t => {
  const thing = new BaseThing('test-type', {})
  const original = console.error
  let called = false
  console.error = (...args) => {
    called = true
    t.ok(args.length >= 1)
  }
  thing.debugError('ctx', new Error('e'), true)
  console.error = original
  t.ok(called)
})

test('BaseThing: getSnap success', async t => {
  const thing = new BaseThingSnapOk('test-type', {})
  thing._handleErrorUpdates(['e1'])
  const snap = await thing.getSnap()
  t.ok(snap.success)
  t.alike(snap.raw_errors, ['e1'])
  t.is(snap.stats.status, 'ok')
  t.is(snap.config.a, 1)
  t.is(thing.lastSnap, snap)
})

test('BaseThing: getSnap error while online', async t => {
  const thing = new BaseThingSnapFail('test-type', { lastSeenTimeout: 60000 })
  thing.updateLastSeen()
  const snap = await thing.getSnap()
  t.not(snap.success)
  t.is(snap.stats.status, 'error')
  t.ok(Array.isArray(snap.stats.errors))
  t.is(snap.stats.errors[0].msg, 'ERR_SNAP_FAIL')
})

test('BaseThing: getSnap ERR_OFFLINE while online maps to offline', async t => {
  const thing = new BaseThingSnapOffline('test-type', { lastSeenTimeout: 60000 })
  thing.updateLastSeen()
  const snap = await thing.getSnap()
  t.not(snap.success)
  t.is(snap.stats.status, 'offline')
})

test('BaseThing: getSnap error while timed out', async t => {
  const thing = new BaseThingSnapFail('test-type', { lastSeenTimeout: 50 })
  thing.updateLastSeen()
  await new Promise(resolve => setTimeout(resolve, 80))
  const snap = await thing.getSnap()
  t.not(snap.success)
  t.is(snap.stats.status, 'offline')
})
