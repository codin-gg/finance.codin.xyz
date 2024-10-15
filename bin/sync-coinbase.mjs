#!/usr/bin/env node

import { createReadStream, createWriteStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { EOL } from 'node:os'
import { parse } from 'yaml'

import { readCache, allOf, byExchange, byInterval, readLastCachedJsonLineOf } from '../lib/cache.mjs'

import { fetchCandlesSince, coinbaseIntervalFor, coinbaseIdFor } from '../lib/coinbase.mjs'
import { daysBetween, jsonDateReviver } from '../lib/date.mjs'

console.log('[bin/sync-coinbase] Date.getTimezoneOffset:', new Date().getTimezoneOffset())
console.log('[bin/sync-coinbase] Date.toJSON:', new Date().toJSON())

const { availableTickers } = parse((await readFile('www/api/openapi.yml', 'utf8')))

console.log('[bin/sync-coinbase] OpenAPI.availableTickers:', availableTickers)
console.log('[bin/sync-coinbase] Cache.files:', availableTickers.map(ticker => `data/coinbase,${ticker},1d.jsonl`))

for (const file of await readCache(allOf(byExchange('coinbase'), byInterval('1d')))) {
  const fileTicker = file.replace(/data\/coinbase,([^,]+),1d.jsonl/, '$1')
  const enabled = availableTickers.includes(fileTicker)
  console.log('[bin/sync-coinbase] Loading: %s', file, { enabled })
  if (!enabled) continue

  const [lastCachedCandleDate] = await readLastCachedJsonLineOf(createReadStream(file), jsonDateReviver)
  console.info('↳ lastCachedCandleDate:', toDateString(lastCachedCandleDate))

  const lastCachableCandleDate = lastCachable()
  console.info('↳ lastCachableCandleDate:', toDateString(lastCachableCandleDate))

  if (lastCachedCandleDate.getTime() === lastCachableCandleDate.getTime()) continue // cache is up to date! no further action required

  const nextUncachedCandleDate = nextDay(new Date(lastCachedCandleDate.getTime()))
  console.info('↳ nextUncachedCandleDate:', toDateString(nextUncachedCandleDate))

  const numberOfCandlesToSync = daysBetween(lastCachedCandleDate, lastCachableCandleDate)
  console.info('↳ numberOfCandlesToSync:', numberOfCandlesToSync)

  if (numberOfCandlesToSync === 0) continue

  const stream = createWriteStream(file, { flags: 'a' }) // append

  for await (const [date, open, high, low, close, volume] of fetchCandlesSince(nextUncachedCandleDate, coinbaseIdFor(file), coinbaseIntervalFor(file))) {
    stream.write(JSON.stringify([date, open, high, low, close, volume]) + EOL)
  }
  stream.close()
}

function lastCachable (date = new Date()) {
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - 1)
  return new Date(date.getTime() - date.getTimezoneOffset() * 6e4)
}

function nextDay (date = new Date()) {
  date.setDate(date.getDate() + 1)
  return new Date(date.getTime())
}

function toDateString (date) {
  return date.toJSON().split('T')[0]
}
