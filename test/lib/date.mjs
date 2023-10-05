import { describe, it } from 'node:test'
import { ok, strictEqual } from 'node:assert'

import { INTERVALS, parseInterval, daysBetween, jsonDateReviver } from '../../lib/date.mjs'
import { dateReviver } from '../../lib/json.mjs'

describe('lib/date', () => {
  describe('.INTERVALS', () => {
  })
  describe('.parseInterval', () => {})
  describe('.daysBetween', () => {})
  describe('.jsonDateReviver (deprecated)', () => {
    it('is duplicate of ~/lib/json.mjs:dateReviver', () => {
      strictEqual(jsonDateReviver.toString(), dateReviver.toString().replace(/^function\s+\w+\s*\(/, `function ${jsonDateReviver.name} (`))
    })
  })
})
