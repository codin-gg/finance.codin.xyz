import { describe, it } from 'node:test'
import { equal } from 'assert/strict'
import { byExchange, readCache, readLastCachedLineOf, readLastCachedJsonLineOf} from '../../lib/cache.mjs'

describe('lib/cache', () => {
  describe('.byExchange', () => {
    it('returns a function', () => {
      equal(typeof byExchange, 'function')
    })
    it('returns a predicate matching the provided exchange name', () => {
      const matchesIfStartsWithFooComma = byExchange('foo')
      equal(matchesIfStartsWithFooComma('foo,bar'), true)
    })
  })
  describe('.readCache', () => {
    it('returns a function', () => {
      equal(typeof readCache, 'function')
    })
    it('returns a function that returns an array of strings', async () => {
      const cache = await readCache()
      equal(Array.isArray(cache), true)
      equal(typeof cache[0], 'string')
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
