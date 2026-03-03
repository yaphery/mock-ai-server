#!/usr/bin/env node
/**
 * Fetches the OpenAPI spec from the running server and writes it to
 * contract/openapi.json.
 *
 * Usage:
 *   npm run export:openapi
 *
 * The server must already be running. Override the base URL via the
 * SERVER_URL environment variable (default: http://localhost:3000).
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const baseUrl = process.env.SERVER_URL ?? 'http://localhost:3000'
const url = `${baseUrl}/openapi.json`

console.log(`Fetching OpenAPI spec from ${url} …`)
const res = await fetch(url)
if (!res.ok) {
  console.error(`Request failed: ${res.status} ${res.statusText}`)
  process.exit(1)
}

const spec = await res.json()
const outDir = join(__dirname, '..', 'contract')
const outFile = join(outDir, 'openapi.json')

mkdirSync(outDir, { recursive: true })
writeFileSync(outFile, JSON.stringify(spec, null, 2) + '\n', 'utf-8')
console.log(`OpenAPI spec written to contract/openapi.json`)
