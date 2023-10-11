import { describe, it } from 'node:test'
import { equal } from 'assert/strict'
import { byExchange, byInterval, readCache, readLastCachedLineOf, readLastCachedJsonLineOf } from '../../lib/cache.mjs'

describe('lib/cache', () => {
  describe('.byExchange', () => {
    it('returns a function', () => {
      equal(typeof byExchange, 'function')
    })
    it('returns a predicate matching the provided exchange name', () => {
      const matchesIfContainsExchange = byExchange('bybit')
      equal(matchesIfContainsExchange('bybit,btc-usd,1d.jsonl'), true)
    })
  })
  describe('.byInterval', () => {
    it('returns a function', () => {
      equal(typeof byInterval, 'function')
    })
    it('returns a predicate matching the provided interval name', () => {
      const matchesIfContainsInterval = byInterval('1d')
      equal(matchesIfContainsInterval('coinbase,btc-usd,1d.jsonl'), true)
    })
  })
  describe('.readCache', () => {
    it('returns a function', () => {
      equal(typeof readCache, 'function')
    })
  })
  describe('.readLastCachedLineOf', () => {
    it('returns a function', () => {
      equal(typeof readLastCachedLineOf, 'function')
    })
  })
  describe('.readLastCachedJsonLineOf', () => {
    it('returns a function', () => {
      equal(typeof readLastCachedJsonLineOf, 'function')
    })
  })
})
