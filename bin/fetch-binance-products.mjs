#!/usr/bin/env node

/*
  [v2] workflow

  This means that we process only csv for the sake of saving space.
  - One could always use a conversion service to obtain different formats.
  - Both intermediate builds and final formats should be csv only.
-------------
  - Needs a way for symbol white-listing.
  -

*/

import { fetchBinance } from '../lib/binance.mjs'
import { daysBetween } from '../lib/date.mjs'

console.log('[bin/sync-binance] getTimezoneOffset', new Date().getTimezoneOffset())
console.log('[bin/sync-binance] toLocaleTimeString', new Date().toLocaleString('it-IT'))
console.log('[bin/sync-binance] toJSON', new Date().toJSON())

// console.log('[bin/sync-binance] utcDate()', utcDate(new Date()))
// console.log('[bin/sync-binance] previousDay()', previousDay(new Date()).toJSON())

// const { symbols } = await fetchBinance('exchangeInfo')

// console.log(
//   symbols
//     .filter(({ status }) => status === 'TRADING')
//     .filter(({ quoteAsset }) => quoteAsset === 'USDT')
//     .map(({ symbol, baseAsset, quoteAsset }) => [symbol, [baseAsset, quoteAsset]])
// )

// let count = 0

// for (const { symbol, status, baseAsset, quoteAsset } of symbols) {
//   if (
//     status !== 'TRADING' ||
//     !filterBaseAsset.includes(baseAsset) ||
//     !filterQuoteAsset.includes(quoteAsset)
//   ) continue //  || quoteAsset !== 'USDT') continue
//   console.info('bin/fetch binance products [%d]', ++count, [symbol, [baseAsset, quoteAsset], status])
// }

// todo:
// before you fetch (or initiate) a cache file, make sure the file does not exist already.
// in this procedure create the file backwards, start from yesterday and prepend until headers or simply no headers.

function previousDay (date) {
  const yesterday = new Date(date)

  yesterday.setHours(0, 0, 0, 0)
  yesterday.setDate(yesterday.getDate() - 1)

  return yesterday
}
