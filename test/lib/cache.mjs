import { describe, it } from 'node:test'
import { equal, deepEqual } from 'node:assert/strict'
import { Readable } from 'node:stream'

import { byExchange, byInterval, readCache, readLastCachedLineOf, readLastCachedJsonLineOf } from '../../lib/cache.mjs'

describe('lib/cache', () => {
  describe('.byExchange', () => {
    it('is callable', () => {
      equal(typeof byExchange, 'function')
    })
    it('returns a predicate matching the provided exchange name', () => {
      const matchesIfContainsExchange = byExchange('bybit')
      equal(matchesIfContainsExchange('bybit,btc-usd,1d.jsonl'), true)
    })
  })
  describe('.byInterval', () => {
    it('is callable', () => {
      equal(typeof byInterval, 'function')
    })
    it('returns a predicate matching the provided interval name', () => {
      const matchesIfContainsInterval = byInterval('1d')
      equal(matchesIfContainsInterval('coinbase,btc-usd,1d.jsonl'), true)
    })
  })
  describe('.readCache', () => {
    it('is callable', () => {
      equal(typeof readCache, 'function')
    })
    it('returns an array with all files when no predicate is provided', async () => {
      const anEmptyFileList = []
      deepEqual(
        await readCache(undefined, { env: { npm_package_config_cache: '/tmp/test/path' } }, undefined, { readdir: () => anEmptyFileList }),
        anEmptyFileList
      )
    })
    it('uses config cache to prepend file names', async () => {
      const path = '/tmp/test/path'
      const readdir = () => ['file.jsonl']
      deepEqual(
        await readCache(undefined, { env: { npm_package_config_cache: path } }, undefined, { readdir }),
        [`${path}/${readdir()[0]}`]
      )
    })
    it('uses predicate to filter the files array', async () => {
      const aFileList = ['match.jsonl', 'dot-not-match.jsonl']
      const aPredicate = (file) => file.startsWith('match')
      deepEqual(
        await readCache(aPredicate, { env: { npm_package_config_cache: '/tmp/test/path' } }, undefined, { readdir: () => aFileList }),
        ['/tmp/test/path/match.jsonl']
      )
    })
  })
  describe('.readLastCachedLineOf', () => {
    it('is callable', () => {
      equal(typeof readLastCachedLineOf, 'function')
    })
    it('should read the last line from a readable stream', async () => {
      const input = Readable.from(['line1\n', 'line2\n'])
      const lastCachedLine = await readLastCachedLineOf(input)
      equal(lastCachedLine, 'line2')
    })
  })
  describe('.readLastCachedJsonLineOf', () => {
    it('is callable', () => {
      equal(typeof readLastCachedJsonLineOf, 'function')
    })
    it('should read the last line from a readable stream', async () => {
      const input = Readable.from(['{"foo":"bar"}\n', '{"bar": "baz"}\n'])
      const lastCachedJsonLine = await readLastCachedJsonLineOf(input)
      deepEqual(lastCachedJsonLine, { bar: 'baz' })
    })
  })
})
