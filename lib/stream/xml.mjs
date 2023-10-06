import fs from 'node:fs'
import readline from 'node:readline'
import stream from 'node:stream'
import os from 'node:os'
import { jsonDateReviver } from '../date.mjs'

export function fromJsonl (input, { createReadStream } = fs, { createInterface } = readline, { Readable } = stream) {
  const xml = new Readable({ objectMode: false, read () {} })
  xml.setEncoding('utf8')
  xml.push(header())
  createInterface({ input, terminal: false, crlfDelay: Infinity })
    .on('line', buffer => xml.push(toXML(buffer)))
    .on('close', () => {
      xml.push(footer())
      xml.push(null)
    })

  return xml
}

export function header ({ EOL } = os) {
  return `<?xml version="1.0" encoding="UTF-8"?>${EOL}<?xml-stylesheet type="text/xsl" href="/candles.xsl"?>${EOL}<candles interval="1d">${EOL}`
}

export function footer ({ EOL } = os) {
  return `</candles>${EOL}`
}

export function toXML (line, { EOL } = os) {
  const [date, open, high, low, close, volume] = JSON.parse(line, jsonDateReviver)
  return `\t<candle>${EOL}\t\t<date>${date.toJSON().substr(0, 10)}</date>${EOL}\t\t<open>${open}</open>${EOL}\t\t<high>${high}</high>${EOL}\t\t<low>${low}</low>${EOL}\t\t<close>${close}</close>${EOL}\t\t<volume>${volume}</volume>${EOL}\t</candle>${EOL}`
}
