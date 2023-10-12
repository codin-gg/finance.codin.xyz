import { describe, it, mock } from 'node:test'
import { ok, equal, deepEqual } from 'node:assert/strict'
import { deepEqual } from 'node:assert'
import { isGeneratorFunction } from 'node:util/types'
import { withJsonBody, fetchCoinbase, fetchCandlesSince, coinbaseIntervalFor, coinbaseIdFor, toUnixTimestamp, fromUnixTimestamp, stringifyCoinbaseDate, parseCoinbaseCandle } from '../../lib/coinbase.mjs'
import { fromAsync } from '../../lib/async.mjs'

describe('lib/coinbase', () => {
  describe('.withJsonBody', () => {
    it('is callable', () => {
      equal(typeof withJsonBody, 'function')
    })
    it('returns an object with a method property set to POST', () => {
      equal(withJsonBody().method, 'POST')
    })
    it('returns an object with a body property set to a JSON string', () => {
      equal(withJsonBody({ foo: 'bar' }).body, '{"foo":"bar"}')
    })
    it('returns an object with a headers property set to an object with a Content-Type property set to application/json', () => {
      equal(withJsonBody().headers['Content-Type'], 'application/json')
    })
  })
  describe('.fetchCoinbase', () => {
    it('is callable', () => {
      equal(typeof fetchCoinbase, 'function')
    })
    it('fetches coinbase urls', async () => {
      const anObject = { status: 'ok' }
      mock.method(global, 'fetch', (url, init) => Promise.resolve({
        status: 200,
        url: url.href,
        text () {
          equal(url.origin, 'https://api.coinbase.com')
          equal(url.pathname, '/api/v3/brokerage/products')
          return Promise.resolve(JSON.stringify(anObject))
        }
      }))
      const data = await fetchCoinbase('brokerage/products', undefined, { npm_config_coinbase_api_key: 'key', npm_config_coinbase_api_secret: 'secret', npm_config_coinbase_api_base: 'https://api.coinbase.com/api/v3/' })
      deepEqual(data, anObject)
      mock.reset(global, 'fetch')
    })
    it('fetches coinbase urls with dates', async () => {
      const anObject = { date: new Date() }
      mock.method(global, 'fetch', (url, init) => Promise.resolve({ text: () => Promise.resolve(JSON.stringify(anObject)) }))
      const data = await fetchCoinbase('brokerage/products', undefined, { npm_config_coinbase_api_key: 'key', npm_config_coinbase_api_secret: 'secret', npm_config_coinbase_api_base: 'https://api.coinbase.com/api/v3/' })
      ok(data.date instanceof Date)
      equal(data.date.toJSON(), anObject.date.toJSON())
      mock.reset(global, 'fetch')
    })
  })
  describe('.fetchCandlesSince', () => {
    it('is a generator function', () => {
      ok(isGeneratorFunction(fetchCandlesSince))
    })
    it('yields an array of coinbase candles', async () => {
      const aDate = new Date()
      const anObject = { candles: [{ start: toUnixTimestamp(aDate), open: 1, high: 2, low: 3, close: 4, volume: 5 }] }
      mock.method(global, 'fetch', (url, init) => Promise.resolve({ text: () => Promise.resolve(JSON.stringify(anObject)) }))
      const data = await fromAsync(fetchCandlesSince(new Date(), 'BTC-USD', 'ONE_DAY', { npm_config_coinbase_api_key: 'key', npm_config_coinbase_api_secret: 'secret', npm_config_coinbase_api_base: 'https://api.coinbase.com/api/v3/' }))
      deepEqual(data, [[fromUnixTimestamp(toUnixTimestamp(aDate)), 1, 2, 3, 4, 5]])
      mock.reset(global, 'fetch')
    })
  })
  describe('.coinbaseIntervalFor', () => {
    it('is callable', () => {
      equal(typeof coinbaseIntervalFor, 'function')
    })
    it('returns a string', () => {
      equal(typeof coinbaseIntervalFor('binance,btc-usd,1d'), 'string')
    })
    it('returns an interval for a given file name', () => {
      equal(coinbaseIntervalFor('coinbase,btc-eur,1h'), 'ONE_HOUR')
    })
  })
  describe('.coinbaseIdFor', () => {
    it('is callable', () => {
      equal(typeof coinbaseIdFor, 'function')
    })
    it('returns a string', () => {
      equal(typeof coinbaseIdFor('binance,btc-usd,1d'), 'string')
    })
    it('returns a ticker id for a given file name', () => {
      equal(coinbaseIdFor('coinbase,btc-eur,1h'), 'BTC-EUR')
    })
  })
  describe('.toUnixTimestamp', () => {
    it('is callable', () => {
      equal(typeof toUnixTimestamp, 'function')
    })
    it('converts a Date to UNIX timestamp correctly', () => {
      equal(toUnixTimestamp(new Date('2021-10-11T00:00:00.000Z')), 1633910400)
    })
  })
  describe('.fromUnixTimestamp', () => {
    it('is callable', () => {
      equal(typeof fromUnixTimestamp, 'function')
    })
    it('converts a UNIX timestamp to Date correctly', () => {
      deepEqual(fromUnixTimestamp(1633910400), new Date('2021-10-11T00:00:00.000Z'))
    })
  })
  describe('.stringifyCoinbaseDate', () => {
    it('is callable', () => {
      equal(typeof stringifyCoinbaseDate, 'function')
    })
    it('is alias of .toUnixTimestamp', () => {
      ok(/return toUnixTimestamp/.test(stringifyCoinbaseDate.toString()))
    })
    it('returns just the same as .toUnixTimestamp', () => {
      const aDate = new Date('2021-10-11T00:00:00.000Z')
      equal(stringifyCoinbaseDate(aDate), toUnixTimestamp(aDate))
    })
  })
  describe('.parseCoinbaseCandle', () => {
    it('is callable', () => {
      equal(typeof parseCoinbaseCandle, 'function')
    })
    it('parses coinbase candle data into jsonl compatible format', () => {
      const start = 1633902000
      const formattedCoinbase = parseCoinbaseCandle({ start, low: '50.25', high: '55.75', open: '52.00', close: '54.50', volume: '1000.25' })
      deepEqual(formattedCoinbase, [new Date(start * 1000), 52.00, 55.75, 50.25, 54.50, 1000.25])
    })
  })
})
