#!/usr/bin/env node

import { createReadStream, createWriteStream } from 'node:fs'
import { readCache, allOf, byExchange, byTickers, byInterval, readLastCachedJsonLineOf } from '../lib/cache.mjs'
import { availableTickers } from '../openapi.mjs'
import { writeCsv, writeJson } from '../lib/jsonl.mjs'

console.log('[bin/build-coinbase-shallow] OpenAPI.availableTickers:', availableTickers)
console.log('[bin/build-coinbase-shallow] Date.toJSON:', new Date().toJSON())
console.log('[bin/build-coinbase-shallow] Date.getTimezoneOffset:', new Date().getTimezoneOffset())

for (const interval of ['1y', '1m'/*, '1w' */, '1d']) {
  console.time(`[bin/build-coinbase-shallow] Write: www/api/${interval}.csv`)
  const latestCsvWriter = writeCsv(['ticker', 'date', 'open', 'high', 'low', 'close', 'volume'])

  console.time(`[bin/build-coinbase-shallow] Write: www/api/${interval}.json`)
  const latestJsonWriter = writeJson()

  for (const file of await readCache(allOf(byExchange('coinbase'), byTickers(availableTickers), byInterval(interval)))) {
    console.log('[bin/build-coinbase-shallow] Loading: %s', file)

    const [,, id] = file.split(/[/,.]/)
    const lastCachedCandle = await readLastCachedJsonLineOf(createReadStream(file))

    latestJsonWriter.write([id, ...lastCachedCandle])
    latestCsvWriter.write([id, ...lastCachedCandle])
  }

  latestJsonWriter.end()
  latestCsvWriter.end()

  console.timeEnd(`[bin/build-coinbase-shallow] Write: www/api/${interval}.csv`)
  latestCsvWriter.pipe(createWriteStream(`www/api/${interval}.csv`))

  console.timeEnd(`[bin/build-coinbase-shallow] Write: www/api/${interval}.json`)
  latestJsonWriter.pipe(createWriteStream(`www/api/${interval}.json`))
}
