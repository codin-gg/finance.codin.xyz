#!/usr/bin/env node

import { createReadStream, createWriteStream } from 'node:fs'
import { EOL } from 'node:os'

import { readCache, allOf, byExchange, byTickers, byInterval, readLastCachedJsonLineOf } from '../lib/cache.mjs'
import { fetchCandlesSince, coinbaseIntervalFor, coinbaseIdFor } from '../lib/coinbase.mjs'
import { daysBetween, jsonDateReviver } from '../lib/date.mjs'
import { availableTickers } from '../openapi.mjs'

console.log('[bin/sync-coinbase] OpenAPI.availableTickers:', availableTickers)
console.log('[bin/sync-coinbase] Date.toJSON:', new Date().toJSON())
console.log('[bin/sync-coinbase] Date.getTimezoneOffset:', new Date().getTimezoneOffset())

for (
  const file of await readCache(
    allOf(
      byExchange('coinbase'),
      byTickers(availableTickers),
      byInterval('1d')
    )
  )
) {
  console.log('[bin/sync-coinbase] Loading: %s', file)

  const [lastCachedCandleDate] = await readLastCachedJsonLineOf(createReadStream(file), jsonDateReviver)
  console.info('↳ lastCachedCandleDate:', toDateString(lastCachedCandleDate))

  const lastCachableCandleDate = lastCachable()
  console.info('↳ lastCachableCandleDate:', toDateString(lastCachableCandleDate))

  if (lastCachedCandleDate.getTime() === lastCachableCandleDate.getTime()) {
    console.info('↳ ( cached )')
    continue // cache is up to date! no further action required
  }

  const nextUncachedCandleDate = nextDay(new Date(lastCachedCandleDate.getTime()))
  console.info('↳ nextUncachedCandleDate:', toDateString(nextUncachedCandleDate))

  const numberOfCandlesToSync = daysBetween(lastCachedCandleDate, lastCachableCandleDate)
  console.info('↳ numberOfCandlesToSync:', numberOfCandlesToSync)

  if (numberOfCandlesToSync === 0) {
    console.info('↳ ( cached )')
    continue
  }

  const stream = createWriteStream(file, { flags: 'a' }) // append

  for await (const [date, open, high, low, close, volume] of fetchCandlesSince(nextUncachedCandleDate, coinbaseIdFor(file), coinbaseIntervalFor(file))) {
    stream.write(JSON.stringify([date, open, high, low, close, volume]) + EOL)
  }
  console.info('↳ ( updated )')
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
