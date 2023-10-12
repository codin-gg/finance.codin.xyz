import { describe, it } from 'node:test'
import { ok, deepEqual } from 'node:assert/strict'

import { fromAsync, toAsyncIterator } from '../../lib/async.mjs'

describe('lib/async', () => {
  describe('.toAsyncIterator', () => {
    it('converts synchronous array to asynchronous', async () => {
      const anArray = [1, 2, 3]
      for await (const value of toAsyncIterator(anArray)) {
        ok(anArray.includes(value))
      }
    })
  })
  describe('.fromAsync [polyfill:Array.fromAsync(arrayLike [, !mapFn [, !thisArg ]])]', async () => {
    const anArray = [1, 2, 3]
    deepEqual(await fromAsync(toAsyncIterator(anArray)), anArray)
  })
})
