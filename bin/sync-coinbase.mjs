#!/usr/bin/env node --experimental-modules

// import path from 'node:path'
// import fs from 'node:fs/promises'
// import readline from 'node:readline'

import { createReadStream, createWriteStream } from 'node:fs'
import { EOL } from 'node:os'

import { readCacheBy, readLastCachedJsonLineOf } from '../lib/cache.mjs'
import { fetchCandlesSince, coinbaseIntervalFor, coinbaseIdFor } from '../lib/coinbase.mjs'
import { dateReviver } from '../lib/json.mjs'
import { utcDate, daysBetween, INTERVALS } from '../lib/date.mjs'

console.log('[bin/sync-coinbase] toLocaleTimeString', new Date().toLocaleTimeString())
console.log('[bin/sync-coinbase] toJSON', new Date().toJSON())
console.log('[bin/sync-coinbase] toISOString', new Date().toISOString())
console.log('[bin/sync-coinbase] getTimezoneOffset', new Date().getTimezoneOffset())
console.log('[bin/sync-coinbase] utcDate(new Date())', utcDate(new Date()))

for (const filePath of await readCacheBy(name => name.startsWith('coinbase,'))) {
  console.log('[bin/sync-coinbase] Loading:%s', filePath)
  const [lastCachedCandleDate] = await readLastCachedJsonLineOf(createReadStream(filePath), dateReviver)
  console.log('↳ lastCachedCandleDate:', lastCachedCandleDate)
  console.log('↳ interval:', intervalFor(filePath))
  console.log('↳ coinbaseId:', coinbaseIdFor(filePath))
  console.log('↳ coinbaseInterval:', coinbaseIntervalFor(filePath))
  const nextUncachedCandleDate = new Date(lastCachedCandleDate.getTime() + INTERVALS.get(intervalFor(filePath)))
  const lastCachableCandleDate = new Date(utcDate(new Date()).getTime() - INTERVALS.get(intervalFor(filePath)))
  const numberOfCandlesToSync = daysBetween(nextUncachedCandleDate, lastCachableCandleDate)
  console.log('↳ numberOfCandlesToSync:', numberOfCandlesToSync)
  if (numberOfCandlesToSync === 0) continue
  const stream = createWriteStream(filePath, { flags: 'a' }) // append
  for await (const [date, open, high, low, close, volume] of fetchCandlesSince(nextUncachedCandleDate, coinbaseIdFor(filePath), coinbaseIntervalFor(filePath))) {
    stream.write(JSON.stringify([date, open, high, low, close, volume]) + EOL)
  }
  stream.close()
}

function intervalFor(file) {
  const [,,interval] = file.replace('.', ',').split(',')
  return interval
}
