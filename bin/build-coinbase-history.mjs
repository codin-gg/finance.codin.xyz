#!/usr/bin/env node --experimental-modules

import { createInterface } from 'node:readline'
import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { EOL } from 'node:os'
import { readCache, allOf, byExchange, byTickers, byInterval } from '../lib/cache.mjs'
import { availableTickers } from '../openapi.mjs'

console.log('[bin/build-coinbase-history] OpenAPI.availableTickers:', availableTickers)
for (
  const file of await readCache(
    allOf(
      byExchange('coinbase'),
      byTickers(availableTickers),
      byInterval('1d')
    )
  )
) {
  const [, , id, interval] = file.split(/[/,.]/)
  console.time(`[bin/build-coinbase-history] Loading: ${file} @api/{ticker}/{?year}/{?month}/{?day}/{interval}.{format:json,csv} time`)
  let currentYear = 0
  let currentMonth = 0
  let currentDay = 0
  let currentYearWritableJson = null
  let currentYearWritableCsv = null
  let currentMonthWritableJson = null
  let currentMonthWritableCsv = null
  let currentDayWritableJson = null
  let currentDayWritableCsv = null

  for await (const line of createInterface({ input: createReadStream(file), crlfDelay: Infinity })) {
    const year = Number.parseInt(line.toString().substring(2, 6))
    const month = Number.parseInt(line.toString().substring(7, 9))
    const day = Number.parseInt(line.toString().substring(10, 12))
    // @api/{ticker}/{year}/{interval}.{format:json}
    if (year > currentYear) {
      await mkdir(`www/api/${id}/${year}`, { recursive: true })
      currentYearWritableJson?.write(']' + EOL)
      currentYearWritableJson?.end()
      currentYearWritableCsv?.end()
      currentYearWritableJson = createWriteStream(`www/api/${id}/${year}/${interval}.json`)
      currentYearWritableCsv = createWriteStream(`www/api/${id}/${year}/${interval}.csv`)
      currentYearWritableJson.write('[' + line)
      currentYearWritableCsv.write('date,open,high,low,close,volume' + EOL + line.toString().substring(2, 12) + line.toString().slice(27, -1) + EOL)
      currentYear = year
    } else {
      currentYearWritableJson.write(',' + line)
      currentYearWritableCsv.write(line.toString().substring(2, 12) + line.toString().slice(27, -1) + EOL)
    }
    // @api/{ticker}/{year}/{month}/{interval}.{format:json}
    if (month !== currentMonth) {
      await mkdir(`www/api/${id}/${year}/${month}`, { recursive: true })
      currentMonthWritableJson?.write(']' + EOL)
      currentMonthWritableJson?.end()
      currentMonthWritableCsv?.end()
      currentMonthWritableJson = createWriteStream(`www/api/${id}/${year}/${month}/${interval}.json`)
      currentMonthWritableCsv = createWriteStream(`www/api/${id}/${year}/${month}/${interval}.csv`)
      currentMonthWritableJson.write('[' + line)
      currentMonthWritableCsv.write('date,open,high,low,close,volume' + EOL + line.toString().substring(2, 12) + line.toString().slice(27, -1) + EOL)
      currentMonth = month
    } else {
      currentMonthWritableJson.write(',' + line)
      currentMonthWritableCsv.write(line.toString().substring(2, 12) + line.toString().slice(27, -1) + EOL)
    }
    // @api/{ticker}/{year}/{month}/{day}/{interval}.{format:json}
    if (day !== currentDay) {
      await mkdir(`www/api/${id}/${year}/${month}/${day}`, { recursive: true })
      currentDayWritableJson?.write(']' + EOL)
      currentDayWritableJson?.end()
      currentDayWritableCsv?.end()
      currentDayWritableJson = createWriteStream(`www/api/${id}/${year}/${month}/${day}/${interval}.json`)
      currentDayWritableCsv = createWriteStream(`www/api/${id}/${year}/${month}/${day}/${interval}.csv`)
      currentDayWritableJson.write('[' + line)
      currentDayWritableCsv.write('date,open,high,low,close,volume' + EOL + line.toString().substring(2, 12) + line.toString().slice(27, -1) + EOL)
      currentDay = day
    } else {
      currentDayWritableJson.write(',' + line)
      currentDayWritableCsv.write(line.toString().substring(2, 12) + line.toString().slice(27, -1) + EOL)
    }
  }
  currentYearWritableJson?.write(']' + EOL)
  currentYearWritableJson?.end()
  currentYearWritableCsv?.end()

  currentMonthWritableJson?.write(']' + EOL)
  currentMonthWritableJson?.end()
  currentMonthWritableCsv?.end()

  currentDayWritableJson?.write(']' + EOL)
  currentDayWritableJson?.end()
  currentDayWritableCsv?.end()
  console.timeEnd(`[bin/build-coinbase-history] Loading: ${file} @api/{ticker}/{?year}/{?month}/{?day}/{interval}.{format:json,csv} time`)
}
