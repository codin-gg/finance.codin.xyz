import os from 'node:os'
import readline from 'node:readline'
import stream, { PassThrough } from 'node:stream'

import { jsonDateReviver, csvDateReplacer } from './date.mjs'

/*
  createReadSteam(file)
    .pipe(parseJsonl())
    ->
    .pipe(
      groupBy(line => line[0].getFullYear())
      -> un readable stream per ogni anno: 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023
    )
    .pipe(
      flatMap(groupReadableStream => groupReadableStream.pipe(writeJsonl()))
    )

*/
export function groupBy (groupFn, options = { objectMode: true }, { Transform } = stream) {
  const groups = new Map()
  return new Transform({
    ...options,
    transform (line, _, next) {
      const group = groupFn(line) // note: when objectMode=false line is a buffer – groupFn must be written accordingly!
      if (!groups.has(group)) {
        const pt = new PassThrough(options)
        pt.write(line)
        groups.set(group, pt)
        next(null, pt)
      } else {
        groups.get(group).write(line)
        next(null)
      }
    }
  })
}

export function parseJsonl ({ objectMode, reviver } = { objectMode: true, reviver: jsonDateReviver }, { createInterface } = readline, { Duplex } = stream) {
  return new Duplex({ objectMode, read () {}, write (_0, _1, next) { next(null) } })
    .on('pipe', function (input) {
      createInterface({ input, terminal: false })
        .on('line', (line) => this.push(objectMode ? JSON.parse(line, reviver) : line))
        .on('close', () => this.push(null))
    })
}

export function writeJsonl ({ objectMode, replacer } = { objectMode: true, replacer: (key, value) => value }, { createInterface } = readline, { Transform } = stream, { EOL } = os) {
  return new Transform({
    objectMode,
    transform (line, _, next) {
      next(null, (objectMode ? JSON.stringify(line, replacer) : line) + EOL)
    }
  })
}

export function writeJson ({ objectMode, replacer } = { objectMode: true, replacer: (_, value) => value }, { Transform } = stream, { EOL } = os) {
  let isFirstLine = true
  return new Transform({
    objectMode: true,
    transform (line, _, next) {
      if (isFirstLine) {
        isFirstLine = false
        next(null, `[${objectMode ? JSON.stringify(line, replacer) : line}`)
      } else {
        next(null, `,${objectMode ? JSON.stringify(line, replacer) : line}`)
      }
    },
    flush (next) {
      next(null, `]${EOL}`)
    }
  })
}
// .pipe( writeCsv(['date', 'open, 'high', 'low, 'close', 'volume', 'metadata']) )
export function writeCsv (headers = null, { objectMode, replacer } = { objectMode: true, replacer: csvDateReplacer }, { Transform } = stream, { EOL } = os) {
  let isFirstLine = true
  return new Transform({
    objectMode: true,
    transform (line, _, next) {
      if (isFirstLine) {
        isFirstLine = false
        this.push(`${
          Array.from(headers ?? Object.keys(line)).join(',')
        }${
          EOL
        }`)
      }
      next(null, `${
        objectMode ? JSON.stringify(Object.values(line), replacer).slice(1, -1).replaceAll('"', '') : line
      }${
        EOL
      }`)
    }
  })
}

// export function writeXml (headers, elementName = 'candle', { objectMode, replacer } = { objectMode: true, replacer: csvDateReplacer }, { Transform } = stream, { EOL } = os) {
//   const isFirstLine = true
//   return new Transform({
//     objectMode: true,
//     transform (line, _, next) {
//       if (isFirstLine) {
//         isFirstLine = false
//         this.push(`<?xml version="1.0" encoding="UTF-8"?>${EOL}`)
//         this.push(`<?xml-stylesheet type="text/xsl" href="/candles.xsl"?>${EOL}`)
//         this.push(`<${elementName}s>${EOL}`)
//         const [date, open, high, low, close, volume] = line
//         return `\t<candle>${EOL}\t\t<date>${date.toJSON().substr(0, 10)}</date>${EOL}\t\t<open>${open}</open>${EOL}\t\t<high>${high}</high>${EOL}\t\t<low>${low}</low>${EOL}\t\t<close>${close}</close>${EOL}\t\t<volume>${volume}</volume>${EOL}\t</candle>${EOL}`

//       // ${(headers ?? Object.keys(line)).join(',')}${EOL}`)
//       // //   return next(null)
//       } else {
//       // //   this.push(`${objectMode ? JSON.stringify(Object.values(line), replacer).slice(1, -1).replaceAll('"', '') : line}${EOL}`)
//       // //   next(null)
//       }
//     },
//     flush (next) {
//       next(null, `</${elementName}s>${EOL}`)
//     }
//   })

//   function toXML () {

//   }
// }
