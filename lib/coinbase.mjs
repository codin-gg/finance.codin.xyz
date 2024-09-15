import { createHmac } from 'node:crypto'
import { URL } from 'node:url'
import { utcDate, jsonDateReviver } from './date.mjs'

export function withJsonBody (data) {
  return {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  }
}

// declare function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;

export function fetchCoinbase (input, init = { method: 'GET', headers: { 'Content-Type': 'application/json' } }, { npm_config_coinbase_api_key: key, npm_config_coinbase_api_secret: secret, npm_config_coinbase_api_base: base } = process.env) {
  const url = new URL(input, base) // base is set right at https://api.coinbase.com/api/v3/ for easy calls ie. coinbase.fetch('brokerage/products')
  // init.headers['CB-ACCESS-TIMESTAMP'] = Math.floor(1e-3 * Date.now()) // todo: refactor to toUnixTimestamp(Date.now())
  // init.headers['CB-ACCESS-KEY'] = key
  // init.headers['CB-ACCESS-SIGN'] = createHmac('sha256', secret).update(init.headers['CB-ACCESS-TIMESTAMP'] + init.method.toUpperCase() + url.pathname + (init.body || String.prototype)).digest('hex')
  console.time(`[lib/coinbase] fetch: ${url} (${init.headers['Content-Type']}) duration`)

  return fetch(url, init)
    .then(response => {
      console.timeEnd(`[lib/coinbase] fetch: ${url} (${init.headers['Content-Type']}) duration`)
      return response.text()
    })
    .then(text => {
      // console.log(`[lib/coinbase] fetch: ${url} (${init.headers['Content-Type']}) data: %s`, text)
      return JSON.parse(text)
    })
}

export async function * fetchCandlesSince (start, id, size = 'ONE_DAY', env = process.env) {
  const granularity = new Map([
    ['UNKNOWN_GRANULARITY', null],
    ['ONE_MINUTE', 60000],
    ['FIVE_MINUTE', 300000],
    ['FIFTEEN_MINUTE', 900000],
    ['THIRTY_MINUTE', 1800000],
    ['ONE_HOUR', 3600000],
    ['TWO_HOUR', 7200000],
    ['SIX_HOUR', 21600000],
    ['ONE_DAY', 86400000]
  ])
  const yesterday = new Date(utcDate(new Date()).getTime() - granularity.get(size))
  do {
    const end = new Date(
      Math.min(
        start.getTime() + granularity.get(size) * 299, // readme: magic number 299 simply works; while 300, which is the actual limit, does skip candles sometimes!
        yesterday // warning: today's candle is continuously changing!
      )
    )
    // console.log('[lib/coinbase] generateCandles: %s » %s', start.toJSON(), end.toJSON())
    const { candles = [] } = await fetchCoinbase(`brokerage/products/${id.toUpperCase()}/candles?start=${stringifyCoinbaseDate(start)}&end=${stringifyCoinbaseDate(end)}&granularity=${size}`, undefined, env)
    candles.reverse()
    yield * candles.map(parseCoinbaseCandle)
    start = new Date(end.getTime() + granularity.get(size)) // can this assignment be moved in the while condition?
  } while (start < yesterday)
}

// export const fetchCoinbase = (uri, data = '', headers = { 'Content-Type': 'application/json' }, { env: { npm_config_coinbase_api_key: key, npm_config_coinbase_api_secret: secret } } = process) => {
//   const url = new URL(uri, 'https://api.coinbase.com/api/v3/')
//   const timestamp = Math.floor(1e-3 * Date.now())
//   const method = data ? 'POST' : 'GET'
//   const sign = createHmac('sha256', secret)
//     .update(timestamp + method + url.pathname + data)
//     .digest('hex')

//   return fetch(url, { method, data, headers: { 'CB-ACCESS-TIMESTAMP': timestamp, 'CB-ACCESS-KEY': key, 'CB-ACCESS-SIGN': sign, ...headers } })
//     .then((response) => response.json())
// }

export function coinbaseIntervalFor (file) {
  const [,, size] = file.replace('.', ',').split(',')
  return new Map([['1', 'ONE_MINUTE'], ['5', 'FIVE_MINUTE'], ['15', 'FIFTEEN_MINUTE'], ['30', 'THIRTY_MINUTE'], ['1h', 'ONE_HOUR'], ['2h', 'TWO_HOUR'], ['6h', 'SIX_HOUR'], ['1d', 'ONE_DAY']]).get(size)
}

export function coinbaseIdFor (file) {
  const [, id] = file.replace('.', ',').split(',')
  return id.toUpperCase()
}

/*
These are pure functions so they can be tested in isolation.
Reference: https://docs.cloud.coinbase.com/advanced-trade-api/reference/retailbrokerageapi_getcandles
Todo: Might move them to lib/coinbase.mjs later!
*/

export function toUnixTimestamp (date, fromMilliseconds = 1e-3) { // todo: rename to generic utils.toUnixTimestamp
  return Math.floor(fromMilliseconds * date.getTime())
}

export function fromUnixTimestamp (unixTimestamp, toMilliseconds = 1e3) { // todo: rename to generic utils.fromUnixTimestamp
  return new Date(toMilliseconds * unixTimestamp)
}

/*

It makes sense however to keep the following two functions here until refactored away... 🚀

*/

export function stringifyCoinbaseDate (date) {
  return toUnixTimestamp(date)
}

export function parseCoinbaseCandle ({ start, low, high, open, close, volume }) { // this is indeed a mapper for the coinbaseResponse
  return [
    fromUnixTimestamp(start),
    parseFloat(open),
    parseFloat(high),
    parseFloat(low),
    parseFloat(close),
    parseFloat(volume)
  ]
}
