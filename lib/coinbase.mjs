import { URL } from 'node:url'
import { utcDate } from './date.mjs'

/*
This library has been migrated from v3 -> exchange since v3 has been terminated:
v3 -> https://docs.cloud.coinbase.com/advanced-trade-api/reference/retailbrokerageapi_getcandles
exchange -> https://docs.cdp.coinbase.com/exchange/reference/exchangerestapi_getproductcandles
*/

export function fetchCoinbase (input, init = { method: 'GET', headers: { 'Content-Type': 'application/json' } }, { npm_config_coinbase_api_base: base } = process.env) {
  const url = new URL(input, base)
  console.time(`[lib/coinbase] fetch: ${url} (${init.headers['Content-Type']}) duration`)

  return fetch(url, init)
    .then(response => {
      console.timeEnd(`[lib/coinbase] fetch: ${url} (${init.headers['Content-Type']}) duration`)
      return response.text()
    })
    .then(text => {
      return JSON.parse(text)
    })
}

export async function * fetchCandlesSince (start, id, size = 'ONE_DAY', env = process.env) {
  // note: new granularities (v3 -> exchange) in seconds are {60, 300, 900, 3600, 21600, 86400} as opposed to {60, 300, 900, 1800, 3600, 7200, 21600, 86400}
  const granularity = new Map([
    ['UNKNOWN_GRANULARITY', null],
    ['ONE_MINUTE', 60000],
    ['FIVE_MINUTE', 300000],
    ['FIFTEEN_MINUTE', 900000],
    ['ONE_HOUR', 3600000],
    ['SIX_HOUR', 21600000],
    ['ONE_DAY', 86400000]
  ])
  const yesterday = new Date(utcDate(new Date()).getTime() - granularity.get(size))
  do {
    const end = new Date(
      Math.min(
        start.getTime() + granularity.get(size) * 299, // note: magic number 299 simply works; while 300 is the actual limit, it does skip candles!
        yesterday // note: today's candle is continuously changing! sync needs to be repeatable!
      )
    )
    // note: new response (v3 -> exchange) is [[timestamp, low, high, open, close, volume], ...] as opposed to {candles:[{start, low, high, open, close, volume}]}
    const candles = await fetchCoinbase(`products/${id.toUpperCase()}/candles?start=${stringifyCoinbaseDate(start)}&end=${stringifyCoinbaseDate(end)}&granularity=${granularity.get(size) / 1000}`, undefined, env)
    candles.reverse()
    yield * candles.map(parseCoinbaseCandle)
    start = new Date(end.getTime() + granularity.get(size)) // can this assignment be moved in the while condition?
  } while (start < yesterday)
}

export function coinbaseIntervalFor (file) {
  const [,, size] = file.replace('.', ',').split(',')
  return new Map([['1', 'ONE_MINUTE'], ['5', 'FIVE_MINUTE'], ['15', 'FIFTEEN_MINUTE'], ['30', 'THIRTY_MINUTE'], ['1h', 'ONE_HOUR'], ['2h', 'TWO_HOUR'], ['6h', 'SIX_HOUR'], ['1d', 'ONE_DAY']]).get(size)
}

export function coinbaseIdFor (file) {
  const [, id] = file.replace('.', ',').split(',')
  return id.toUpperCase()
}

// note: new candle schema (v3 -> exchange) is [timestamp, low, high, open, close, volume] as opposed to {start, low, high, open, close, volume}
export function parseCoinbaseCandle ([timestamp, low, high, open, close, volume]) {
  return [fromUnixTimestamp(timestamp), open, high, low, close, volume]
}

// todo: the following functions might be refactored away or moved to somewhere different
export function toUnixTimestamp (date, fromMilliseconds = 1e-3) { // todo: rename to generic utils.toUnixTimestamp
  return Math.floor(fromMilliseconds * date.getTime())
}

export function fromUnixTimestamp (unixTimestamp, toMilliseconds = 1e3) { // todo: rename to generic utils.fromUnixTimestamp
  return new Date(toMilliseconds * unixTimestamp)
}

export function stringifyCoinbaseDate (date) {
  return toUnixTimestamp(date)
}
