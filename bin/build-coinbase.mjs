#!/usr/bin/env node --experimental-modules

import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { readCache, byExchange } from '../lib/cache.mjs'
import { fromJsonl as jsonlToCsv } from '../lib/stream/csv.mjs'
import { fromJsonl as jsonlToJson } from '../lib/stream/json.mjs'

for (const file of await readCache(byExchange('coinbase'))) {
  console.log('► bin/build-coinbase loading:%s', file)
  const [directory, exchange, id, interval, format] = file.split(/[/,.]/)
  await mkdir(`www/api/${id}`, { recursive: true })
  console.log('↳ exchange:', directory)
  console.log('↳ exchange:', exchange)
  console.log('↳ id:', id)
  console.log('↳ interval:', interval)
  console.log('↳ source:', format)
  // csv
  console.time(`◄ bin/build-coinbase created: ${file} ➡️ www/api/${id}/${interval}.csv elapsed`)
  jsonlToCsv(createReadStream(file))
    .pipe(createWriteStream(`www/api/${id}/${interval}.csv`))
    .on('close', () => console.timeEnd(`◄ bin/build-coinbase created: ${file} ➡️ www/api/${id}/${interval}.csv elapsed`))
  // json
  console.time(`◄ bin/build-coinbase created: ${file} ➡️ www/api/${id}/${interval}.json elapsed`)
  jsonlToJson(createReadStream(file))
    .pipe(createWriteStream(`www/api/${id}/${interval}.json`))
    .on('close', () => console.timeEnd(`◄ bin/build-coinbase created: ${file} ➡️ www/api/${id}/${interval}.json elapsed`))
}
