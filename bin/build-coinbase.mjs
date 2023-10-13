#!/usr/bin/env node --experimental-modules

import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { readCache, byExchange } from '../lib/cache.mjs'
import { writeJson, writeCsv, parseJsonl } from '../lib/jsonl.mjs'
import { dateReplacerFor } from '../lib/date.mjs'

for (const file of await readCache(byExchange('coinbase'))) {
  const [,, id, interval] = file.split(/[/,.]/)
  const source = createReadStream(file) // todo: at some point cache should return streams directly
  console.log('bin/build-coinbase @load readCache:', file)

  await mkdir(`www/api/${id}`, { recursive: true })
  await convertJsonl(writeCsv, source, `www/api/${id}/${interval}.csv`, dateReplacerFor(interval))
  await convertJsonl(writeJson, source, `www/api/${id}/${interval}.json`, dateReplacerFor(interval))
}

function convertJsonl (write, src, dst, replacer) { // todo: this could be maybe better placed in lib/jsonl.mjs or lib/cache.mjs
  console.time(`bin/build-coinbase @async ${write.name}: ${dst} time`)
  return src
    .pipe(parseJsonl({ objectMode: true }))
    .pipe(write({ objectMode: true, replacer }))
    .pipe(createWriteStream(dst))
    .on('close', console.timeEnd.bind(console, `bin/build-coinbase @async ${write.name}: ${dst} time`))
}
