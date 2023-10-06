import { describe, it } from 'node:test'
import { equal } from 'assert/strict'
import { withJsonBody, fetchCoinbase, fetchCandlesSince, coinbaseIntervalFor, coinbaseIdFor, toUnixTimestamp, fromUnixTimestamp, stringifyCoinbaseDate, parseCoinbaseCandle } from '../../lib/coinbase.mjs'

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
  })
  describe('.fetchCandlesSince', () => {
    it('is callable', () => {
      equal(typeof fetchCandlesSince, 'function')
    })
  })
  describe('.coinbaseIntervalFor', () => {
    it('returns a function', () => {
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
    it('returns a function', () => {
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
  })
  describe('.fromUnixTimestamp', () => {
    it('is callable', () => {
      equal(typeof fromUnixTimestamp, 'function')
    })
  })
  describe('.stringifyCoinbaseDate', () => {
    it('is callable', () => {
      equal(typeof stringifyCoinbaseDate, 'function')
    })
  })
  describe('.parseCoinbaseCandle', () => {
    it('is callable', () => {
      equal(typeof parseCoinbaseCandle, 'function')
    })
  })
})
