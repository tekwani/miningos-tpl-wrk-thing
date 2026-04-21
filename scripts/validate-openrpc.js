#!/usr/bin/env node
/**
 * Validates the generated OpenRPC spec against the OpenRPC meta-schema.
 * Catches structural errors, missing fields, and schema violations.
 * Run: npm run openrpc:validate
 */
const { parseOpenRPCDocument } = require('@open-rpc/schema-utils-js')
const fs = require('fs')
const path = require('path')

const SPEC_FILE = path.join(__dirname, '..', 'docs', 'openrpc.json')

async function validate() {
  console.log('OpenRPC Validator\n')
  
  if (!fs.existsSync(SPEC_FILE)) {
    console.error('✗ openrpc.json not found. Run "npm run openrpc:generate" first.')
    process.exit(1)
  }

  console.log(`-> Validating ${SPEC_FILE}...`)
  
  const spec = JSON.parse(fs.readFileSync(SPEC_FILE, 'utf-8'))
  
  try {
    const doc = await parseOpenRPCDocument(spec)
    
    console.log('\n✓ OpenRPC document is valid!')
    console.log(`  Version: ${doc.openrpc}`)
    console.log(`  Title: ${doc.info.title}`)
    console.log(`  Methods: ${doc.methods.length}`)
    
    if (doc.components?.schemas) {
      console.log(`  Schemas: ${Object.keys(doc.components.schemas).length}`)
    }
    
    process.exit(0)
  } catch (err) {
    console.error('\n✗ Validation failed:')
    if (err.errors) {
      err.errors.forEach((e, i) => {
        console.error(`  ${i + 1}. ${e.message || e}`)
      })
    } else {
      console.error(`  ${err.message}`)
    }
    process.exit(1)
  }
}

validate()
