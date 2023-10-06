import { describe, it } from 'node:test'
import { ok, strictEqual } from 'node:assert'

import { INTERVALS, parseInterval, daysBetween, jsonDateReviver, utcDate } from '../../lib/date.mjs'

describe('lib/date', () => {
  describe('.INTERVALS', () => {
    it('is a Map', () => {
      ok(INTERVALS instanceof Map)
    })
    it('has a key of "1y" for years', () => {
      ok(INTERVALS.has('1y'))
    })
    it('has a key of "1m" for months', () => {
      ok(INTERVALS.has('1m'))
    })
    it('has a key of "1d" for days', () => {
      ok(INTERVALS.has('1d'))
    })
    it('has a key of "1h" for hours', () => {
      ok(INTERVALS.has('1h'))
    })
    it('has a key of "1" for minutes', () => {
      ok(INTERVALS.has('1'))
    })
  })
  describe('.daysBetween', () => {
    it('is callable', () => {
      strictEqual(typeof daysBetween, 'function')
    })
    it('returns a number', () => {
      strictEqual(typeof daysBetween(new Date(), new Date()), 'number')
    })
    it('returns the number of days between two dates', () => {
      strictEqual(daysBetween(new Date('2021-09-26'), new Date('2021-09-27')), 1)
    })
    it('returns the number of days between two dates with iso8601 format', () => {
      strictEqual(daysBetween(new Date('2021-09-26T10:30:00.000Z'), new Date('2021-09-27T10:30:00.000Z')), 1)
    })
  })
  describe.todo('.parseInterval', () => {
    it('is callable', () => {
      strictEqual(typeof parseInterval, 'function')
    })
    it('returns a number', () => {
      strictEqual(typeof parseInterval('1y'), 'number')
    })
    it('handles years|y, months|m, weeks|w, days|d, hours|h, and minutes (without any label)', () => {
      strictEqual(parseInterval('1y'), 31536000000)
      strictEqual(parseInterval('1m'), 2592000000)
      strictEqual(parseInterval('1w'), 604800000)
      strictEqual(parseInterval('1d'), 86400000)
      strictEqual(parseInterval('1h'), 3600000)
      strictEqual(parseInterval('1'), 60000)
    })
    it('handles multiples of any given interval', () => {
      strictEqual(parseInterval('2y'), 63072000000)
      strictEqual(parseInterval('3m'), 7776000000)
      strictEqual(parseInterval('2w'), 1209600000)
      strictEqual(parseInterval('3d'), 259200000)
      strictEqual(parseInterval('2h'), 7200000)
      strictEqual(parseInterval('2'), 120000)
    })
  })
  describe('.jsonDateReviver', () => {
    it('is callable', () => {
      strictEqual(typeof jsonDateReviver, 'function')
    })
    it('returns a date when given a string', () => {
      ok(jsonDateReviver(null, '2023-09-26T10:30:00.000Z') instanceof Date)
    })
    it('returns the value when given a non-string', () => {
      strictEqual(jsonDateReviver(null, 42), 42) // Non-string input
    })
    it('returns the value when given a string that does not match the iso8601 regex', () => {
      strictEqual(jsonDateReviver(null, '2023/09/26 10:30:00'), '2023/09/26 10:30:00') // Non-matching format
    })
    it('returns a date when given a string that matches the iso8601 regex', () => {
      ok(jsonDateReviver(null, '2023-09-26T10:30:00.000Z') instanceof Date)
    })
    it('returns a date when given a string that matches the iso8601 regex and a custom regex', () => {
      ok(jsonDateReviver(null, '2023/09/26 10:30:00', /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/) instanceof Date) // Custom format regex
    })
  })
  describe('.utcDate', () => {
    it('is callable', () => {
      strictEqual(typeof utcDate, 'function')
    })
    it('returns a Date', () => {
      ok(utcDate() instanceof Date)
    })
    it('returns a Date that is adjusted to .getTimezoneOffset ', () => {
      const now = new Date()
      strictEqual(utcDate(now).toJSON(), new Date(now.getTime() + (now.getTimezoneOffset() * 6e4)).toJSON())
    })
  })
})
