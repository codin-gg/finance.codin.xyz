#!/usr/bin/env node

import { createReadStream, createWriteStream } from 'node:fs'
import { readCache, allOf, byExchange, byTickers, byInterval, readLastCachedJsonLineOf } from '../lib/cache.mjs'
import { isoDateReplacer } from '../lib/date.mjs'
import { availableTickers } from '../openapi.mjs'
import { writeCsv, writeJson } from '../lib/jsonl.mjs'

console.log('[bin/sync-coinbase] OpenAPI.availableTickers:', availableTickers)
console.log('[bin/sync-coinbase] Date.toJSON:', new Date().toJSON())
console.log('[bin/sync-coinbase] Date.getTimezoneOffset:', new Date().getTimezoneOffset())

//   console.log('[bin/sync-coinbase] Loading: %s', file)
//   const [lastCachedCandleDate] = await readLastCachedJsonLineOf(createReadStream(file), jsonDateReviver)
//   console.info('↳ lastCachedCandleDate:', toDateString(lastCachedCandleDate))

for (const interval of ['1d'/*, '1y', '1m'/*, '1w' */]) {
  const latestCsvWriter = writeCsv(['ticker', 'date', 'open', 'high', 'low', 'close', 'volume'])
  const latestJsonWriter = writeJson()

  for (
    const file of await readCache(
      allOf(
        byExchange('coinbase'),
        byTickers(availableTickers),
        byInterval(interval)
      )
    )
  ) {
    const [,, id] = file.split(/[/,.]/)
    const lastCachedCandle = await readLastCachedJsonLineOf(createReadStream(file))

    latestJsonWriter.write([id, ...lastCachedCandle])
    latestCsvWriter.write([id, ...lastCachedCandle])
  }

  latestJsonWriter.end()
  latestCsvWriter.end()

  console.log(`www/api/${interval}.csv`)
  latestCsvWriter.pipe(createWriteStream(`www/api/${interval}x.csv`))

  console.log(`www/api/${interval}.json`)
  latestJsonWriter.pipe(createWriteStream(`www/api/${interval}x.json`))
}
