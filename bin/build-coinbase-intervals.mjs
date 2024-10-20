#!/usr/bin/env node --experimental-modules

import { createReadStream, createWriteStream } from 'node:fs'
import { Transform } from 'node:stream'

import { readCache, allOf, byExchange, byTickers, byInterval } from '../lib/cache.mjs'
import { parseJsonl, writeJsonl } from '../lib/jsonl.mjs'
import { firstDateOfNextIntervalUsing, firstDateOfIntervalUsing } from '../lib/date.mjs'
import { availableTickers } from '../openapi.mjs'

console.log('[bin/build-coinbase-intervals] OpenAPI.availableTickers:', availableTickers)

for (
  const file of await readCache(
    allOf(
      byExchange('coinbase'),
      byTickers(availableTickers),
      byInterval('1d')
    )
  )
) {
  console.log('[bin/build-coinbase-intervals] Loading: %s', file)
  const src = createReadStream(file)
  ;['1y', '1m'/*, '1w' */] // fixme: weekly isnt working as expected so let's cut it off for now!
    .forEach(interval => {
      const dst = src.path.replace(',1d.jsonl', `,${interval}.jsonl`)
      console.info('↳ convertCachedDailyJsonlTo:', dst)
      src
        .pipe(parseJsonl())
        .pipe(convertCachedDailyJsonlTo(interval))
        .pipe(writeJsonl())
        .pipe(createWriteStream(dst))
    })
}

function convertCachedDailyJsonlTo (interval) { // todo: simplify if possible, test and move to somewhere more appropriate, maybe lib/jsonl.mjs or lib/cache.mjs
  let buffer
  return new Transform({
    objectMode: true,
    transform ([date, open, high, low, close, volume], _, next) {
      if (buffer === undefined) { // is first call of transform function
        buffer = [date, open, high, low, close, volume]
      } else
        if (date < firstDateOfNextIntervalUsing(firstDateOfIntervalUsing(buffer[0], interval), interval)) {
          buffer = [buffer[0], buffer[1], Math.max(buffer[2], high), Math.min(buffer[3], low), close, buffer[5] + volume]
        } else {
          this.push(buffer) // this pushes previous candle
          buffer = [date, open, high, low, close, volume]
        }
      next(null)
    },
    flush (next) {
      next(null, buffer)
    }
  })
}
