import fs from 'node:fs'
import readline from 'node:readline'
import stream from 'node:stream'
import os from 'node:os'
import { jsonDateReviver } from '../date.mjs'

export function fromJsonl (input, { createReadStream } = fs, { createInterface } = readline, { Readable } = stream) {
  const csv = new Readable({ objectMode: false, read () {} })

  csv.setEncoding('utf8')
  csv.push(headers())

  createInterface({ input, terminal: false, crlfDelay: Infinity })
    .on('line', buffer => csv.push(toCSV(buffer)))
    .on('close', () => csv.push(null)) // ends the readable stream

  return csv
}

// this indirection is useful to be able to stub or mock os.EOL in tests
export function headers ({ EOL } = os) {
  return `date,open,high,low,close,volume${EOL}`
}

export function toCSV (line, { EOL } = os) {
  const [date, open, high, low, close, volume] = JSON.parse(line, jsonDateReviver)
  const [month, day, year] = date.toLocaleDateString('en-US').split('/')
  return `${year}-${month}-${day},${open},${high},${low},${close},${volume}${EOL}`
}
