import { describe, it } from 'node:test'
import { ok, equal, deepEqual } from 'node:assert/strict'
import { Duplex, Readable, Transform } from 'node:stream'

import { groupBy, parseJsonl, writeJsonl, writeJson, writeCsv } from '../../lib/jsonl.mjs'
import { EOL } from 'node:os'
import { fromAsync } from '../../lib/async.mjs'

function createReadableObjectsWith (...chunks) {
  const data = new Readable({ objectMode: true })
  chunks.forEach(push => data.push(push))
  data.push(null)
  return data
}

function createJsonlWith (...chunks) {
  const data = new Readable({ objectMode: true })
  chunks.map(chunk => JSON.stringify(chunk)).forEach(chunk => data.push(chunk))
  data.push(null)
  return data
}

describe('lib/jsonl', () => {
  describe('.parseJsonl', () => {
    it('is callable', () => {
      equal(typeof parseJsonl, 'function')
    })
    it('returns a stream.Duplex', () => {
      ok(parseJsonl() instanceof Duplex)
    })
    it('parses jsonl.object streams', async () => {
      const anObject = { foo: 'bar' }
      const jsonLines = parseJsonl(/* objectMode: true */)

      createJsonlWith(anObject).pipe(jsonLines)

      for await (const line of jsonLines) {
        deepEqual(line, anObject) // there should only be one line
      }
    })
    it('parses jsonl.array streams', async () => {
      const anArray = ['foo', 'bar']
      const jsonLines = parseJsonl()

      createJsonlWith(anArray).pipe(jsonLines)

      for await (const line of jsonLines) {
        deepEqual(line, anArray) // there should only be one line
      }
    })
    // it handles date attributes
    it('handles date value', async () => {
      const jsonLines = parseJsonl()

      createJsonlWith([new Date().toJSON()]).pipe(jsonLines)

      for await (const [date] of jsonLines) {
        ok(date instanceof Date)
      }
    })
    it('handles date attribute', async () => {
      const jsonLines = parseJsonl()

      createJsonlWith({ date: new Date().toJSON() }).pipe(jsonLines)

      for await (const { date } of jsonLines) {
        ok(date instanceof Date)
      }
    })
    it.todo('handles object mode true -> and converts to objects')
    it.todo('handles object mode false -> splits by line but keeps buffers|strings and does not parse nor rewrite dates')
  })
  describe('.writeJsonl', () => {
    it('is callable', () => {
      equal(typeof writeJsonl, 'function')
    })
    it('returns a stream', () => {
      ok(writeJsonl() instanceof Transform)
    })
    it('transorms object stream to jsonl', async () => {
      const anObject = { foo: 'bar' }
      const jsonLines = writeJsonl(/* objectMode: true */)

      createReadableObjectsWith(anObject).pipe(jsonLines)

      for await (const line of jsonLines) {
        equal(line, JSON.stringify(anObject) + EOL)
      }
    })
    it('uses the provided replacer fn', async () => {
      const anObject = { foo: 'bar' }
      const jsonLines = writeJsonl({ objectMode: true, replacer: () => 'baz' })

      createReadableObjectsWith(anObject).pipe(jsonLines)

      for await (const line of jsonLines) {
        equal(line, JSON.stringify('baz') + EOL)
      }
    })
  })
  describe('.writeJson', () => {
    it('is callable', () => {
      equal(typeof writeJson, 'function')
    })
    it('returns a stream', () => {
      ok(writeJson() instanceof Transform)
    })
    it('transforms object stream to json', async () => {
      const anObject = { foo: 'bar' }
      const jsonLines = writeJson(/* objectMode: true */)

      createReadableObjectsWith(anObject).pipe(jsonLines)

      deepEqual(await fromAsync(jsonLines), ['[' + JSON.stringify(anObject), ']' + EOL])
    })
    it('uses the provided replacer function', async () => {
      const jsLines = [{ foo: 'bar' }, { foo: 'baz' }]
      const jsonLines = writeJson({ objectMode: true, replacer: () => 'baz' })

      createReadableObjectsWith(...jsLines)
        .pipe(jsonLines)

      deepEqual(await fromAsync(await jsonLines), ['["baz"', ',"baz"', ']' + EOL])
    })
  })
  describe('.writeCsv', () => {
    it('is callable', () => {
      equal(typeof writeCsv, 'function')
    })
    it('returns a stream', () => {
      ok(writeCsv() instanceof Transform)
    })
    it('transforms object stream to csv', async () => {
      const anObject = { foo: 'bar' }
      const csvLines = writeCsv()

      createReadableObjectsWith(anObject).pipe(csvLines)

      deepEqual(await fromAsync(csvLines), ['foo' + EOL, 'bar' + EOL])
    })
    it('uses the provided replacer function', async () => {
      const jsLines = [{ foo: 'bar' }, { foo: 'baz' }]
      const csvLines = writeCsv(undefined, { objectMode: true, replacer: () => 'baz' })

      createReadableObjectsWith(...jsLines)
        .pipe(csvLines)

      deepEqual(await fromAsync(await csvLines), ['foo' + EOL, 'baz' + EOL, 'baz' + EOL])
    })
    it('uses the provided headers', async () => {
      const jsLines = [{ foo: 'bar' }, { foo: 'baz' }]
      const csvLines = writeCsv(['xyz'])

      createReadableObjectsWith(...jsLines)
        .pipe(csvLines)

      deepEqual(await fromAsync(await csvLines), ['xyz' + EOL, 'bar' + EOL, 'baz' + EOL])
    })
  })
  describe.todo('.writeXml')
  describe('.groupBy', () => {
    it('is callable', () => {
      equal(typeof groupBy, 'function')
    })
    it('returns a stream.Transform', () => {
      ok(groupBy() instanceof Transform)
    })
    it('groups by a given function', async () => {
      const aByYearPredicate = ([date]) => date.getUTCFullYear()
      const groups = groupBy(aByYearPredicate)

      createReadableObjectsWith(
        [new Date(Date.UTC(2022, 1, 1)), 'foo'],
        [new Date(Date.UTC(2023, 1, 1)), 'bar'],
        [new Date(Date.UTC(2023, 2, 1)), 'baz']
      ).pipe(groups)

      const groupStreams = []
      for await (const group of groups) {
        groupStreams.push(group)
      }

      equal(groupStreams.length, 2)
    })
  })
})
