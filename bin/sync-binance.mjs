#!/usr/bin/env node

/*
  this script needs to
  - fetch all available symbols
  - filter whitelisted ones
  - check weather to update cache or download from scratch

  todo:
  - handle cache management via csv files
*/

// import { createReadStream, createWriteStream } from 'node:fs'
// import { EOL } from 'node:os'

// import { readCache, byExchange, readLastCachedJsonLineOf } from '../lib/cache.mjs'

// import { fetchCandlesSince, coinbaseIntervalFor, coinbaseIdFor } from '../lib/coinbase.mjs'
import { utcDate } from '../lib/date.mjs'

console.log('[bin/sync-binance] toLocaleTimeString', new Date().toLocaleTimeString())
console.log('[bin/sync-binance] toJSON', new Date().toJSON())
console.log('[bin/sync-binance] toISOString', new Date().toISOString())
console.log('[bin/sync-binance] getTimezoneOffset', new Date().getTimezoneOffset())
console.log('[bin/sync-binance] utcDate()', utcDate())

// for (const file of await readCache(byExchange('coinbase'))) {
//   console.log('[bin/sync-coinbase] Loading:%s', file)
//   const [lastCachedCandleDate] = await readLastCachedJsonLineOf(createReadStream(file), jsonDateReviver)
//   console.log('↳ lastCachedCandleDate:', lastCachedCandleDate)
//   console.log('↳ interval:', intervalFor(file))
//   console.log('↳ coinbaseId:', coinbaseIdFor(file))
//   console.log('↳ coinbaseInterval:', coinbaseIntervalFor(file))
//   const nextUncachedCandleDate = new Date(lastCachedCandleDate.getTime() + INTERVALS.get(intervalFor(file)))
//   const lastCachableCandleDate = new Date(utcDate(new Date()).getTime() - INTERVALS.get(intervalFor(file)))
//   console.log('↳ nextUncachedCandleDate:', nextUncachedCandleDate)
//   console.log('↳ lastCachableCandleDate:', lastCachableCandleDate)
//   const numberOfCandlesToSync = daysBetween(nextUncachedCandleDate, lastCachableCandleDate)
//   console.log('↳ numberOfCandlesToSync:', numberOfCandlesToSync)
//   if (numberOfCandlesToSync === 0) continue
//   const stream = createWriteStream(file, { flags: 'a' }) // append
//   for await (const [date, open, high, low, close, volume] of fetchCandlesSince(nextUncachedCandleDate, coinbaseIdFor(file), coinbaseIntervalFor(file))) {
//     stream.write(JSON.stringify([date, open, high, low, close, volume]) + EOL)
//   }
//   stream.close()
// }

// function intervalFor (file) {
//   const [,, interval] = file.replace('.', ',').split(',')
//   return interval
// }
