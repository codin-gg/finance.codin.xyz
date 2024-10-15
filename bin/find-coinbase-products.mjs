#!/usr/bin/env node --experimental-modules

import { fetchCoinbase, parseCoinbaseCandle } from '../lib/coinbase.mjs'
import { writeFileSync } from 'node:fs'
import { EOL } from 'node:os'

const products = await fetchCoinbase('products')
const segments = [[1437436800, 1463270400], [1463356800, 1489190400], [1489276800, 1515110400], [1515196800, 1541030400], [1541116800, 1566950400], [1567036800, 1592870400], [1592956800, 1618790400], [1618876800, 1644710400], [1644796800, 1670630400], [1670716800, 1696550400], [1696636800, 1722470400], [1722556800, 1726271996]]

// writeFileSync('data/test,something.jsonl', 'test')
// process.exit()
let count = 0
for (const { id, base_currency: base, quote_currency: quote } of products.filter(cryptoFilter)) {
  console.log('[%d]', ++count, [id, [base, quote]])
  for (const [start, end] of segments) {
    const candles = await fetchCoinbase(`products/${id}/candles?start=${start}&end=${end}&granularity=86400`)
    if (candles.length === 0) continue
    // candles.reverse()
    console.log(candles, candles[0], candles[candles.length - 1])
    const candleString = JSON.stringify([
      ...parseCoinbaseCandle(candles[0])
    ])
    console.log('%s ->', `data/coinbase,${id.toLowerCase()},1d.jsonl`, candleString)
    writeFileSync(`data/coinbase,${id.toLowerCase()},1d.jsonl`, candleString + EOL)
    break
  }
}

function cryptoFilter (product) {
  return true
}

// console.log('[bin/sync-coinbase] toLocaleTimeString', new Date().toLocaleTimeString())
// console.log('[bin/sync-coinbase] toJSON', new Date().toJSON())
// console.log('[bin/sync-coinbase] toISOString', new Date().toISOString())
// console.log('[bin/sync-coinbase] getTimezoneOffset', new Date().getTimezoneOffset())
// console.log('[bin/sync-coinbase] utcDate(new Date())', utcDate(new Date()))

// for (const file of await readCache(byExchange('coinbase'))) {
//   console.log('[bin/sync-coinbase] Loading:%s', file)
//   const [lastCachedCandleDate] = await readLastCachedJsonLineOf(createReadStream(file), jsonDateReviver)
//   console.log('↳ lastCachedCandleDate:', lastCachedCandleDate)
//   console.log('↳ interval:', intervalFor(file))
//   console.log('↳ coinbaseId:', coinbaseIdFor(file))
//   console.log('↳ coinbaseInterval:', coinbaseIntervalFor(file))
//   const nextUncachedCandleDate = new Date(lastCachedCandleDate.getTime() + INTERVALS.get(intervalFor(file)))
//   const lastCachableCandleDate = new Date(utcDate(new Date()).getTime() - INTERVALS.get(intervalFor(file)))
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
