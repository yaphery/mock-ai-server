import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const url = `http://localhost:${PORT}/openapi.json`
const outPath = resolve(__dirname, '../contract/openapi.json')

const response = await fetch(url)
if (!response.ok) {
  console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  process.exit(1)
}

const spec = await response.json()
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify(spec, null, 2) + '\n', 'utf8')
console.log(`OpenAPI spec written to ${outPath}`)
