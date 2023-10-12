#!/usr/bin/env node --experimental-modules

import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { EOL } from 'node:os'

import { readCache, byExchange, readLastCachedJsonLineOf, byInterval, allOf } from '../lib/cache.mjs'
import { csvDateReplacer, jsonDateReviver } from '../lib/date.mjs'

console.log('bin/build-coinbase-latest load: data/* ')
try {
  console.time('bin/build-coinbase-latest create: @api/{interval}/latest.{format:json,csv} time')

  await mkdir('www/api/1d', { recursive: true })
  console.log('bin/build-coinbase-latest exists: www/api/')

  const latestJson = createWriteStream('www/api/1d/latest.json')
  latestJson.write('[')

  const latestCsv = createWriteStream('www/api/1d/latest.csv')
  latestCsv.write('id,date,open,high,low,close,volume' + EOL)

  let isFirstLine = true
  for (const file of await readCache(allOf(byExchange('coinbase'), byInterval('1d')))) {
    const lastCachedCandle = await readLastCachedJsonLineOf(createReadStream(file), jsonDateReviver)
    const [, , id, interval] = file.split(/[/,.]/)
    console.time(`→ load: ${file} appendLine: @api/${interval}/latest.{format:json,csv} time`)
    if (isFirstLine) {
      isFirstLine = false
      latestJson.write(JSON.stringify([id, ...lastCachedCandle]))
    } else {
      latestJson.write(`,${JSON.stringify([id, ...lastCachedCandle])}`)
    }
    latestCsv.write(`${id},${interval},${JSON.stringify(lastCachedCandle, csvDateReplacer).slice(1, -1).replaceAll('"', '')}${EOL}`)
    console.timeEnd(`→ load: ${file} appendLine: @api/${interval}/latest.{format:json,csv} time`)
  }
  latestJson.write(']' + EOL)
} catch (error) {
  console.error(error)
} finally {
  console.timeEnd('bin/build-coinbase-latest create: @api/{interval}/latest.{format:json,csv} time')
}
