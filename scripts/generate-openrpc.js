#!/usr/bin/env node
/**
 * Generates OpenRPC specification from JSDoc annotations in source code.
 * Extracts types via TypeScript, converts to JSON Schema, assembles OpenRPC doc.
 * Run: npm run openrpc:generate
 */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const TYPES_JS = path.join(ROOT, 'workers/lib/types.js')
const TYPES_DIR = path.join(ROOT, 'docs', 'types')
const OUTPUT = path.join(ROOT, 'docs', 'openrpc.json')
const { RPC_METHODS } = require(path.join(ROOT, 'workers/lib/constants'))
const pkg = require(path.join(ROOT, 'package.json'))

const PARAM_MAP = {
  getRack: 'GetRackParams',
  queryThing: 'QueryThingParams',
  listThings: 'ListThingsParams',
  getThingsCount: 'GetThingsCountParams',
  registerThing: 'RegisterThingParams',
  updateThing: 'UpdateThingParams',
  saveThingComment: 'SaveThingCommentParams',
  editThingComment: 'EditThingCommentParams',
  deleteThingComment: 'DeleteThingCommentParams',
  forgetThings: 'ForgetThingsParams',
  applyThings: 'ApplyThingsParams',
  tailLog: 'TailLogParams',
  getHistoricalLogs: 'GetHistoricalLogsParams',
  getReplicaConf: 'GetReplicaConfParams',
  rackReboot: 'RackRebootParams',
  getWrkExtData: 'GetWrkExtDataParams',
  getWrkConf: 'GetWrkConfParams',
  getThingConf: 'GetThingConfParams',
  getWrkSettings: 'GetWrkSettingsParams',
  saveWrkSettings: 'SaveWrkSettingsParams'
}

const RESULT_MAP = {
  getRack: 'GetRackResult',
  queryThing: 'QueryThingResult',
  listThings: 'ListThingsResult',
  getThingsCount: 'GetThingsCountResult',
  registerThing: 'RegisterThingResult',
  updateThing: 'UpdateThingResult',
  saveThingComment: 'SaveThingCommentResult',
  editThingComment: 'EditThingCommentResult',
  deleteThingComment: 'DeleteThingCommentResult',
  forgetThings: 'ForgetThingsResult',
  applyThings: 'ApplyThingsResult',
  tailLog: 'TailLogResult',
  getHistoricalLogs: 'GetHistoricalLogsResult',
  getReplicaConf: 'GetReplicaConfResult',
  rackReboot: 'RackRebootResult',
  getWrkExtData: 'GetWrkExtDataResult',
  getWrkConf: 'GetWrkConfResult',
  getThingConf: 'GetThingConfResult',
  getWrkSettings: 'GetWrkSettingsResult',
  saveWrkSettings: 'SaveWrkSettingsResult'
}

// Fix $ref paths from JSON Schema format to OpenRPC format
function fixRefs (obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(fixRefs)
  const result = {}
  for (const [k, v] of Object.entries(obj)) {
    if (k === '$ref' && typeof v === 'string') {
      result[k] = v.replace('#/definitions/', '#/components/schemas/')
    } else {
      result[k] = fixRefs(v)
    }
  }
  return result
}

// `tsc` preserves the conventional JSDoc ` - description` separator literally
// in emitted `.d.ts` comments, which `ts-json-schema-generator` then surfaces
// as `description: "- <text>"`. Strip that leading separator so schema
// descriptions read cleanly in consumers (docs site, client generators).
function stripDescDash (obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(stripDescDash)
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'description' && typeof v === 'string' && v.startsWith('- ')) {
      out[k] = v.slice(2).trim()
    } else {
      out[k] = stripDescDash(v)
    }
  }
  return out
}

// Extracts a JSON Schema for the named TypeScript type.
// - Inlines any referenced `definitions` into the shared `schemas` bag.
// - Hard-fails (exit 1) when strict=true and the type cannot be extracted.
//   Result types are always strict so a missing/broken Result typedef fails
//   CI instead of silently emitting `{}`.
function extractSchema (typeName, schemas, { strict = false } = {}) {
  try {
    const cmd = `npx ts-json-schema-generator -p ${TYPES_DIR}/types.d.ts -t ${typeName} --no-top-ref`
    const out = execSync(cmd, { cwd: ROOT, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
    const s = JSON.parse(out)
    if (s.definitions) Object.assign(schemas, s.definitions)
    delete s.definitions
    delete s.$schema
    return s
  } catch (e) {
    if (strict) {
      console.error(`\n  FAIL: could not extract schema for "${typeName}".`)
      console.error('  Is it declared as a @typedef in workers/lib/types.js?')
      const stderr = e.stderr && e.stderr.toString().trim()
      if (stderr) console.error(`  ${stderr.split('\n').join('\n  ')}`)
      process.exit(1)
    }
    return { type: 'object' }
  }
}

console.log('OpenRPC Generator\n')

if (!fs.existsSync(TYPES_DIR)) fs.mkdirSync(TYPES_DIR, { recursive: true })
console.log('-> Generating .d.ts from JSDoc...')
execSync(`npx tsc ${TYPES_JS} --declaration --allowJs --emitDeclarationOnly --outDir ${TYPES_DIR}`,
  { cwd: ROOT, stdio: 'inherit' })

console.log('-> Extracting schemas...')
const schemas = {}
const methods = RPC_METHODS.map(name => {
  const ptype = PARAM_MAP[name]
  const rtype = RESULT_MAP[name]

  if (!ptype) {
    console.error(`\nFAIL: no PARAM_MAP entry for RPC method "${name}"`)
    process.exit(1)
  }
  if (!rtype) {
    console.error(`\nFAIL: no RESULT_MAP entry for RPC method "${name}"`)
    console.error(`Add a ${name}Result typedef to workers/lib/types.js and an entry to RESULT_MAP.`)
    process.exit(1)
  }

  process.stdout.write(`  ${name}...`)

  const paramSchema = extractSchema(ptype, schemas)
  schemas[ptype] = paramSchema

  const resultSchema = extractSchema(rtype, schemas, { strict: true })
  schemas[rtype] = resultSchema

  console.log(' ok')

  return {
    name,
    params: [{ name: 'req', schema: { $ref: `#/components/schemas/${ptype}` } }],
    result: { name: `${name}Result`, schema: { $ref: `#/components/schemas/${rtype}` } }
  }
})

// Fix all $ref paths and strip conventional JSDoc `- ` separators from descriptions
const fixedSchemas = stripDescDash(fixRefs(schemas))

const doc = {
  openrpc: '1.4.1',
  info: {
    title: 'MiningOS Thing Worker API',
    version: pkg.version,
    description: 'JSON-RPC 2.0 API for managing Things in MiningOS',
    license: { name: pkg.license }
  },
  methods,
  components: { schemas: fixedSchemas }
}

fs.writeFileSync(OUTPUT, JSON.stringify(doc, null, 2))
console.log(`\n✓ Generated ${OUTPUT} (${methods.length} methods, ${Object.keys(schemas).length} schemas)`)
