import { describe, it, mock } from 'node:test'
import { ok, equal, deepEqual } from 'node:assert/strict'
import { isGeneratorFunction } from 'node:util/types'
import { fetchCoinbase, fetchCandlesSince, coinbaseIntervalFor, coinbaseIdFor, parseCoinbaseCandle } from '../../lib/coinbase.mjs'
import { fromAsync } from '../../lib/async.mjs'
import { fromUnixTimestamp, toUnixTimestamp } from '../../lib/date.mjs'

describe('lib/coinbase', () => {
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
          equal(url.origin, 'https://api.exchange.coinbase.com')
          equal(url.pathname, '/products')
          return Promise.resolve(JSON.stringify(anObject))
        }
      }))
      const data = await fetchCoinbase('products', undefined, { npm_config_coinbase_api_base: 'https://api.exchange.coinbase.com' })
      deepEqual(data, anObject)
      mock.reset(global, 'fetch')
    })
  })
  describe('.fetchCandlesSince', () => {
    it('is a generator function', () => {
      ok(isGeneratorFunction(fetchCandlesSince))
    })
    it('yields an array of coinbase candles', async () => {
      const aDate = new Date()
      const anObject = [[toUnixTimestamp(aDate), 1, 2, 3, 4, 5]]
      mock.method(global, 'fetch', (url, init) => Promise.resolve({ text: () => Promise.resolve(JSON.stringify(anObject)) }))
      const data = await fromAsync(fetchCandlesSince(new Date(), 'BTC-USD', 'ONE_DAY', { npm_config_coinbase_api_base: 'https://api.exchange.coinbase.com' }))
      deepEqual(data, [[fromUnixTimestamp(toUnixTimestamp(aDate), 1e3), 3, 2, 1, 4, 5]])
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
  describe('.parseCoinbaseCandle', () => {
    it('is callable', () => {
      equal(typeof parseCoinbaseCandle, 'function')
    })
    it('parses coinbase candle data into jsonl compatible format', () => {
      const start = 1633902000
      const formattedCoinbase = parseCoinbaseCandle([start, 50.25, 55.75, 52.00, 54.50, 1000.25])
      deepEqual(formattedCoinbase, [new Date(start * 1000), 52.00, 55.75, 50.25, 54.50, 1000.25])
    })
  })
})
