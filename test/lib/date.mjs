import { describe, it } from 'node:test'
import { ok, equal, deepEqual } from 'node:assert/strict'

import {
  INTERVALS,
  parseInterval,
  daysBetween, utcDate,
  jsonDateReviver,
  noopDateReplacer, isoDateReplacer, shortDateFor,
  firstDateOfIntervalUsing, firstDateOfNextIntervalUsing,
  toUnixTimestamp,
  fromUnixTimestamp
} from '../../lib/date.mjs'

describe('lib/date', () => {
  describe('.toUnixTimestamp', () => {
    it('is callable', () => {
      equal(typeof toUnixTimestamp, 'function')
    })
    it('converts a Date to UNIX timestamp correctly', () => {
      equal(toUnixTimestamp(new Date('2021-10-11T00:00:00.000Z')), 1633910400000)
    })
    it('converts a Date to UNIX timestamp correctly with adjusted milliseconds', () => {
      equal(toUnixTimestamp(new Date('2021-10-11T00:00:00.000Z'), 1e-3), 1633910400)
    })
  })
  describe('.fromUnixTimestamp', () => {
    it('is callable', () => {
      equal(typeof fromUnixTimestamp, 'function')
    })
    it('converts a UNIX timestamp to Date correctly', () => {
      deepEqual(fromUnixTimestamp(1633910400000), new Date('2021-10-11T00:00:00.000Z'))
    })
    it('converts a UNIX timestamp to Date correctly with adjusted milliseconds', () => {
      deepEqual(fromUnixTimestamp(1633910400, 1e3), new Date('2021-10-11T00:00:00.000Z'))
    })
  })
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
  describe('.parseInterval', () => {
    it('is callable', () => {
      equal(typeof parseInterval, 'function')
    })
    it('returns a number', () => {
      equal(typeof parseInterval('1y'), 'number')
    })
    it('handles years|y, months|m, weeks|w, days|d, hours|h, and minutes (without any label)', () => {
      equal(parseInterval('1y'), INTERVALS.get('1y'))
      equal(parseInterval('1m'), INTERVALS.get('1m'))
      equal(parseInterval('1w'), INTERVALS.get('1w'))
      equal(parseInterval('1d'), INTERVALS.get('1d'))
      equal(parseInterval('1h'), INTERVALS.get('1h'))
      equal(parseInterval('1'), INTERVALS.get('1'))
    })
    it('also handles multiples of those intervals', () => {
      equal(parseInterval('5y'), INTERVALS.get('5y'))
      equal(parseInterval('3y'), INTERVALS.get('3y'))
      equal(parseInterval('2y'), INTERVALS.get('2y'))
      equal(parseInterval('4m'), INTERVALS.get('4m'))
      equal(parseInterval('3m'), INTERVALS.get('3m'))
      equal(parseInterval('2m'), INTERVALS.get('2m'))
      equal(parseInterval('3w'), INTERVALS.get('3w'))
      equal(parseInterval('2w'), INTERVALS.get('2w'))
      equal(parseInterval('3d'), INTERVALS.get('3d'))
      equal(parseInterval('2d'), INTERVALS.get('2d'))
      equal(parseInterval('12h'), INTERVALS.get('12h'))
      equal(parseInterval('6h'), INTERVALS.get('6h'))
      equal(parseInterval('3h'), INTERVALS.get('3h'))
      equal(parseInterval('2h'), INTERVALS.get('2h'))
      equal(parseInterval('30'), INTERVALS.get('30'))
      equal(parseInterval('15'), INTERVALS.get('15'))
      equal(parseInterval('10'), INTERVALS.get('10'))
      equal(parseInterval('5'), INTERVALS.get('5'))
      equal(parseInterval('3'), INTERVALS.get('3'))
      equal(parseInterval('2'), INTERVALS.get('2'))
    })
  })
  describe('.daysBetween', () => {
    it('is callable', () => {
      equal(typeof daysBetween, 'function')
    })
    it('returns a number', () => {
      equal(typeof daysBetween(new Date(), new Date()), 'number')
    })
    it('returns the number of days between two dates', () => {
      equal(daysBetween(new Date('2021-09-26'), new Date('2021-09-27')), 1)
    })
    it('returns the number of days between two dates with iso8601 format', () => {
      equal(daysBetween(new Date('2021-09-26T10:30:00.000Z'), new Date('2021-09-27T10:30:00.000Z')), 1)
    })
  })
  describe('.utcDate', () => {
    it('is callable', () => {
      equal(typeof utcDate, 'function')
    })
    it('returns a Date', () => {
      ok(utcDate() instanceof Date)
    })
    it('returns a Date that is adjusted to .getTimezoneOffset ', () => {
      const now = new Date()
      equal(utcDate(now).toJSON(), new Date(now.getTime() + (now.getTimezoneOffset() * 6e4)).toJSON())
    })
  })
  describe('.jsonDateReviver', () => {
    it('is callable', () => {
      equal(typeof jsonDateReviver, 'function')
    })
    it('returns a date when given a string', () => {
      ok(jsonDateReviver(null, '2023-09-26T10:30:00.000Z') instanceof Date)
    })
    it('returns the value when given a non-string', () => {
      equal(jsonDateReviver(null, 42), 42) // Non-string input
    })
    it('returns the value when given a string that does not match the iso8601 regex', () => {
      equal(jsonDateReviver(null, '2023/09/26 10:30:00'), '2023/09/26 10:30:00') // Non-matching format
    })
    it('returns a date when given a string that matches the iso8601 regex', () => {
      ok(jsonDateReviver(null, '2023-09-26T10:30:00.000Z') instanceof Date)
    })
    it('returns a date when given a string that matches the iso8601 regex and a custom regex', () => {
      ok(jsonDateReviver(null, '2023/09/26 10:30:00', /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/) instanceof Date) // Custom format regex
    })
  })
  describe('.noopDateReplacer', () => {
    it('is callable', () => {
      ok(noopDateReplacer instanceof Function)
    })
    it('returns without applying any replacement', () => {
      deepEqual(noopDateReplacer('key', 'value'), 'value')
    })
  })
  describe('.isoDateReplacer', () => {
    it('is callable', () => {
      ok(isoDateReplacer instanceof Function)
    })
    it('shortens iso dates down to its date value', () => {
      const aJsonDateString = new Date().toISOString()
      equal(isoDateReplacer(null, aJsonDateString), aJsonDateString.slice(0, 10))
    })
    it('returns the original value otherwise', () => {
      equal(isoDateReplacer(null, 42), 42)
    })
    it('is compatible with JSON.stringify', () => {
      const aDate = new Date() // note: to my understanding .toJSON get's invoked prior calling the replacer function
      equal(JSON.stringify(aDate, isoDateReplacer), JSON.stringify(aDate.toISOString().slice(0, 10)))
    })
  })
  describe('.shortDateFor', () => {
    it('is callable', () => {
      ok(shortDateFor instanceof Function)
    })
    it('returns noopDateReplacer intervals that require hours minutes and seconds', () => {
      equal(shortDateFor('1'), noopDateReplacer)
      equal(shortDateFor('2h'), noopDateReplacer)
    })
    it('returns isoDateReplacer for date intervals that are daily timeframe and above', () => {
      equal(shortDateFor('1d'), isoDateReplacer)
      equal(shortDateFor('2w'), isoDateReplacer)
      equal(shortDateFor('3m'), isoDateReplacer)
      equal(shortDateFor('4y'), isoDateReplacer)
    })
  })
  describe('.firstDateOfIntervalUsing', () => {
    const aDate = new Date('2021-09-26T00:00:00.000Z')
    it('is callable', () => {
      ok(firstDateOfIntervalUsing instanceof Function)
    })
    it('returns the first date of the year when given a year interval', () => {
      equal(firstDateOfIntervalUsing(aDate, '1y').toJSON(), new Date('2021-01-01').toJSON())
    })
    it('returns the first date of the month when given a month interval', () => {
      equal(firstDateOfIntervalUsing(aDate, '1m').toJSON(), new Date('2021-09-01').toJSON())
    })
    it('returns the first date of the week when given a week interval', () => {
      equal(firstDateOfIntervalUsing(aDate, '1w').toJSON(), new Date('2021-09-20').toJSON())
    })
    it('returns the same date when given any other interval', () => {
      equal(firstDateOfIntervalUsing(aDate, '1d').toJSON(), aDate.toJSON())
      equal(firstDateOfIntervalUsing(aDate, '1h').toJSON(), aDate.toJSON())
      equal(firstDateOfIntervalUsing(aDate, '1').toJSON(), aDate.toJSON())
    })
  })
  describe('firstDateOfNextIntervalUsing', () => {
    it('is callable', () => {
      ok(firstDateOfNextIntervalUsing instanceof Function)
    })
    it('returns the first date of the next year when given a year interval', () => {
      equal(firstDateOfNextIntervalUsing(new Date('2021-09-26'), '1y').toJSON(), new Date('2022-01-01').toJSON())
    })
    it('returns the first date of the next month when given a month interval', () => {
      equal(firstDateOfNextIntervalUsing(new Date('2021-09-26'), '1m').toJSON(), new Date('2021-10-01').toJSON())
    })
    it('returns the first date of the next week when given a week interval', () => {
      equal(firstDateOfNextIntervalUsing(new Date('2022-01-01'), '1w').toJSON(), new Date('2022-01-03').toJSON())
    })
    it('returns the same date when given any other interval', () => {
      equal(firstDateOfNextIntervalUsing(new Date('2021-09-26'), '1d').toJSON(), new Date('2021-09-26').toJSON())
      equal(firstDateOfNextIntervalUsing(new Date('2021-09-26'), '1h').toJSON(), new Date('2021-09-26').toJSON())
      equal(firstDateOfNextIntervalUsing(new Date('2021-09-26'), '1').toJSON(), new Date('2021-09-26').toJSON())
    })
  })
})
