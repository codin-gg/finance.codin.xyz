
import fs from 'node:fs'
import readline from 'node:readline'
import stream from 'node:stream'

export function fromJsonl (input, { createReadStream } = fs, { createInterface } = readline, { Readable } = stream) {
  const json = new Readable({ objectMode: false, read () {} })
  json.setEncoding('utf8')
  json.push('[')
  createInterface({ input, terminal: false, crlfDelay: Infinity })
    .once('line', function (line) {
      json.push(line)
      this.on('line', (line) => json.push(`,${line}`))
    })
    .on('close', () => {
      json.push(']')
      json.push(null)
    })
  return json
}
