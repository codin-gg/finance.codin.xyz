import { describe, it } from 'node:test'
import { ok, strictEqual } from 'node:assert'

import { dateReviver } from '../../lib/json.mjs'

describe('lib/json', () => {
  describe('.dateReviver', () => {
    it('is callable', () => {
      strictEqual(typeof dateReviver, 'function')
    })
    it('returns a date when given a string', () => {
      ok(dateReviver(null, '2023-09-26T10:30:00.000Z') instanceof Date)
    })
    it('returns the value when given a non-string', () => {
      strictEqual(dateReviver(null, 42), 42) // Non-string input
    })
    it('returns the value when given a string that does not match the iso8601 regex', () => {
      strictEqual(dateReviver(null, '2023/09/26 10:30:00'), '2023/09/26 10:30:00') // Non-matching format
    })
    it('returns a date when given a string that matches the iso8601 regex', () => {
      ok(dateReviver(null, '2023-09-26T10:30:00.000Z') instanceof Date)
    })
    it('returns a date when given a string that matches the iso8601 regex and a custom regex', () => {
      ok(dateReviver(null, '2023/09/26 10:30:00', /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/) instanceof Date) // Custom format regex
    })
  })
})
