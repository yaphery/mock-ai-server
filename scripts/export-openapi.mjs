#!/usr/bin/env node
/**
 * 将运行中服务的 OpenAPI JSON 导出到 contract/openapi.json
 *
 * 用法:
 *   node scripts/export-openapi.mjs
 *   # 或通过 npm script:
 *   npm run export:openapi
 *
 * 服务需先启动（默认 http://localhost:3000）。
 * 可通过环境变量 PORT 覆盖端口号，例如：
 *   PORT=4000 node scripts/export-openapi.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const port = process.env.PORT || 3000
const url = `http://localhost:${port}/api-json`
const __dirname = dirname(fileURLToPath(import.meta.url))
const outputPath = join(__dirname, '..', 'contract', 'openapi.json')

console.log(`正在从 ${url} 获取 OpenAPI JSON ...`)

const res = await fetch(url)
if (!res.ok) {
  console.error(`请求失败: ${res.status} ${res.statusText}`)
  process.exit(1)
}

const spec = await res.json()
mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, JSON.stringify(spec, null, 2) + '\n', 'utf8')
console.log(`OpenAPI JSON 已写入: ${outputPath}`)
