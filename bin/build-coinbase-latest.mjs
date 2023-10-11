#!/usr/bin/env node --experimental-modules

import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { EOL } from 'node:os'

import { readCache, byExchange, readLastCachedJsonLineOf } from '../lib/cache.mjs'
import { csvDateReplacer, jsonDateReviver } from '../lib/date.mjs'

console.log('bin/build-coinbase-latest load: data/* ')

try {
  console.time('bin/build-coinbase-latest create: @api/latest.{format:json,csv} time')

  await mkdir('www/api', { recursive: true })
  console.log('bin/build-coinbase-latest exists: www/api/')

  const latestJson = createWriteStream('www/api/latest.json')
  latestJson.write('[')

  const latestCsv = createWriteStream('www/api/latest.csv')
  latestCsv.write('id,interval,date,open,high,low,close,volume' + EOL)

  let isFirstLine = true
  for (const file of await readCache(byExchange('coinbase'))) {
    console.time(`→ load: ${file} appendLine: @api/latest.{format:json,csv} time`)
    const lastCachedCandle = await readLastCachedJsonLineOf(createReadStream(file), jsonDateReviver)
    const [, , id, interval] = file.split(/[/,.]/)
    if (isFirstLine) {
      isFirstLine = false
      latestJson.write(JSON.stringify([id, interval, ...lastCachedCandle]))
    } else {
      latestJson.write(`,${JSON.stringify([id, interval, ...lastCachedCandle])}`)
    }
    latestCsv.write(`${id},${interval},${JSON.stringify(lastCachedCandle, csvDateReplacer).slice(1, -1).replaceAll('"', '')}${EOL}`)
    console.timeEnd(`→ load: ${file} appendLine: @api/latest.{format:json,csv} time`)
  }
  latestJson.write(']' + EOL)
} catch (error) {
  console.error(error)
} finally {
  console.timeEnd('bin/build-coinbase-latest create: @api/latest.{format:json,csv} time')
}
