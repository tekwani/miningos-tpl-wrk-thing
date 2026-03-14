'use strict'

const STAT_RTD = 'stat-rtd'
const MAIN_DB = 'main'

const OPTIONAL_CONFIGS = [
  { name: 'global.config', key: 'globalConfig' }
]

const RPC_METHODS = [
  'getRack',
  'queryThing',
  'listThings',
  'getThingsCount',
  'registerThing',
  'updateThing',
  'saveThingComment',
  'editThingComment',
  'deleteThingComment',
  'forgetThings',
  'applyThings',
  'tailLog',
  'getHistoricalLogs',
  'getReplicaConf',
  'rackReboot',
  'getWrkExtData',
  'getWrkConf',
  'getThingConf',
  'getWrkSettings',
  'saveWrkSettings'
]

const TIME_PERIODS_MS = {
  H: 60 * 60 * 1000,
  D: 24 * 60 * 60 * 1000,
  W: 7 * 24 * 60 * 60 * 1000,
  M: 30 * 24 * 60 * 60 * 1000
}

module.exports = {
  STAT_RTD,
  OPTIONAL_CONFIGS,
  RPC_METHODS,
  MAIN_DB,
  TIME_PERIODS_MS
}
