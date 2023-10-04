export const INTERVALS = new Map([
  ['5y', 157680000000], // → 1d
  ['3y', 94608000000], // → 1d
  ['2y', 63072000000], // → 1d
  ['1y', 31536000000], // → 1d
  ['4m', 10368000000], // → 1d
  ['3m', 7776000000], // → 1d
  ['2m', 5184000000], // → 1d
  ['1m', 2592000000], // → 1d
  ['3w', 1814400000], // → 1d
  ['2w', 1209600000], // → 1d
  ['1w', 604800000], // → 1d
  ['3d', 259200000], // → 1d
  ['2d', 172800000], // → 1d
  ['1d', 86400000],
  ['12h', 43200000], // → 6h
  ['6h', 7200000],
  ['3h', 10800000], // → 1h
  ['2h', 7200000],
  ['1h', 3600000],
  ['30', 1800000],
  ['15', 900000],
  ['10', 600000], // → 5
  ['5', 300000],
  ['3', 180000], // → 1
  ['2', 120000], // → 1
  ['1', 60000]
])

export function parseInterval (interval) {
  const number = parseFloat(interval)
  const unit = interval.replace(number.toString(), '').toLowerCase()
  switch (unit) {
    case 'y':
      return number * 31536000000
    case 'm':
      return number * 2592000000
    case 'w':
      return number * 604800000
    case 'd':
      return number * 86400000
    case 'h':
      return number * 3600000
    default:
      return number * 60000
  }
}

export function daysBetween (date1, date2, oneDay = INTERVALS.get('1d')) {
  return Math.round(
    Math.abs(
      new Date(date1).getTime() - new Date(date2).getTime()
    ) / oneDay
  )
}

export function jsonDateReviver (_, value, iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/) {
  return typeof value === 'string' && iso8601Regex.test(value)
    ? new Date(value)
    : value
}

// async function * generateCandlesSince (since, base, quote, limit = 10, now = new Date()) {
//   //   do {
//   const oneDay = 86400000
//   const firstCachableDate = new Date(oneDay + lastCachedDate.getTime())

//   // since.getTime() + 1 * 86400000 // start the following day to prevent duplicates

//   const url = `brokerage/products/${base.toUpperCase()}-${quote.toUpperCase()}/candles?granularity=ONE_DAY&start=${from}&end=${to}`
//   console.log('url:', url)

//   const candles = await fetchCoinbase(url)
//   console.log('candles:', candles)

//   //     // for (const { start, low, high, open, close, volume } of candles) {
//   //     //   yield {
//   //     //     date: new Date(start * 1000),
//   //     //     ohlcv: [parseFloat(open), parseFloat(high), parseFloat(low), parseFloat(close), parseFloat(volume)]
//   //     //   }
//   //     // }
//   //   } while (candles.length)
//   // }
// }

// // async function * generateCandlesSince (base, quote, limit = 10, now = new Date()) {
// //   do {
// //     const end = new Date(now.getTime() - 1 * 86400000)
// //     const start = new Date(end.getTime() - limit * 86400000)

// //     0

// //     // for (const { start, low, high, open, close, volume } of candles) {
// //     //   yield {
// //     //     date: new Date(start * 1000),
// //     //     ohlcv: [parseFloat(open), parseFloat(high), parseFloat(low), parseFloat(close), parseFloat(volume)]
// //     //   }
// //     // }
// //   } while (candles.length)
// // }

// // // toCodinEntry (candle) {
// // // }
