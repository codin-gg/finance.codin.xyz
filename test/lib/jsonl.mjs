import { describe, it } from 'node:test'
import { throws, ok, equal, deepEqual } from 'node:assert/strict'
import { Duplex, Readable, Transform } from 'node:stream'
import { EOL } from 'node:os'
import { parseJsonl, groupBy, writeJsonl, writeJson, writeCsv, writeXml } from '../../lib/jsonl.mjs'
import { fromAsync } from '../../lib/async.mjs'
import { noopDateReplacer } from '../../lib/date.mjs'

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
    describe('handles objectMode correclty', () => {
      const anObject = { foo: 'bar' }

      it('parses incoming buffers when true', async () => {
        const aFileStream = new Readable({ objectMode: false })
        aFileStream.push(JSON.stringify(anObject))
        aFileStream.push(null)

        const parsedJsonLines = parseJsonl({ objectMode: true })
        aFileStream.pipe(parsedJsonLines)

        for await (const line of parsedJsonLines) {
          deepEqual(line, anObject)
        }
      })
      it('does not parse incoming buffers, and only splits lines, when false', async () => {
        const aFileStream = new Readable({ objectMode: false })
        aFileStream.push(JSON.stringify(anObject))
        aFileStream.push(null)

        const rawJsonLines = parseJsonl({ objectMode: false })
        aFileStream.pipe(rawJsonLines)

        for await (const line of rawJsonLines) {
          equal(line.toString(), JSON.stringify(anObject))
        }
      })
    })
  })
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
    describe('handles objectMode correclty', () => {
      it('writes objects using JSON.stringify when true', async () => {
        const parsedJsonl = new Readable({ objectMode: true })
        parsedJsonl.push({ foo: 'bar' })
        parsedJsonl.push({ bar: 'baz' })
        parsedJsonl.push(null)

        const parsedJsonLines = writeJsonl({ objectMode: true, replacer: noopDateReplacer })
        parsedJsonl.pipe(parsedJsonLines)

        deepEqual(await fromAsync(await parsedJsonLines), [
          JSON.stringify({ foo: 'bar' }) + EOL,
          JSON.stringify({ bar: 'baz' }) + EOL
        ])
      })
      it('writes buffers directly when false', async () => {
        const unparsedJsonl = new Readable({ objectMode: false })
        unparsedJsonl.push(JSON.stringify({ foo: 'bar' }) + EOL)
        unparsedJsonl.push(JSON.stringify({ bar: 'baz' }) + EOL)
        unparsedJsonl.push(null)

        const rawJsonLines = writeJsonl({ objectMode: false })
        unparsedJsonl.pipe(rawJsonLines)

        deepEqual(await fromAsync(await unparsedJsonl), [
          Buffer.from(JSON.stringify({ foo: 'bar' }) + EOL + JSON.stringify({ bar: 'baz' }) + EOL)
        ])
      })
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
    describe('handles objectMode correclty', () => {
      it('writes objects using JSON.stringify when true', async () => {
        const parsedJsonl = new Readable({ objectMode: true })
        parsedJsonl.push({ foo: 'bar' })
        parsedJsonl.push({ bar: 'baz' })
        parsedJsonl.push(null)

        const parsedJsonLines = writeJson({ objectMode: true, replacer: noopDateReplacer })
        parsedJsonl.pipe(parsedJsonLines)

        deepEqual(await fromAsync(await parsedJsonLines), [
          '[' + JSON.stringify({ foo: 'bar' }),
          ',' + JSON.stringify({ bar: 'baz' }),
          ']' + EOL
        ])
      })
      it('writes buffers directly when false', async () => {
        const unparsedJsonl = new Readable({ objectMode: false })
        unparsedJsonl.push(JSON.stringify({ foo: 'bar' }) + EOL)
        unparsedJsonl.push(JSON.stringify({ bar: 'baz' }) + EOL)
        unparsedJsonl.push(null)

        const rawJsonLines = writeJson({ objectMode: false })
        unparsedJsonl.pipe(rawJsonLines)

        deepEqual(
          await fromAsync(await rawJsonLines), [
            '[' + JSON.stringify({ foo: 'bar' }),
            ',' + JSON.stringify({ bar: 'baz' }),
            ']' + EOL
          ]
        )
      })
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
    describe('handles objectMode correclty', () => {
      it('writes objects using JSON.stringify when true', async () => {
        const parsedJsonl = new Readable({ objectMode: true })
        parsedJsonl.push(['foo', 'bar'])
        parsedJsonl.push(['bar', 'baz'])
        parsedJsonl.push(null)

        const parsedJsonLines = writeCsv(['a', 'b'], { objectMode: true, replacer: noopDateReplacer })
        parsedJsonl.pipe(parsedJsonLines)

        deepEqual(await fromAsync(await parsedJsonLines), [
          'a,b' + EOL,
          'foo,bar' + EOL,
          'bar,baz' + EOL
        ])
      })
      it('writes buffers directly when false', async () => {
        const unparsedJsonl = new Readable({ objectMode: false })
        unparsedJsonl.push(JSON.stringify({ foo: 'bar' }) + EOL)
        unparsedJsonl.push(JSON.stringify({ bar: 'baz' }) + EOL)
        unparsedJsonl.push(null)

        const rawJsonLines = writeCsv(['a', 'b'], { objectMode: false })
        unparsedJsonl.pipe(rawJsonLines)

        deepEqual(await fromAsync(await rawJsonLines), [
          'a,b' + EOL,
          JSON.stringify({ foo: 'bar' }) + EOL,
          JSON.stringify({ bar: 'baz' }) + EOL
        ])
      })
    })
  })
  describe('.writeXml', () => {
    it('is callable', () => {
      ok(writeXml instanceof Function)
    })
    it('returns a stream', () => {
      throws(() => writeXml())
    })
  })
})
