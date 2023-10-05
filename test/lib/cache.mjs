import { describe, it } from 'node:test'
import { ok, strictEqual } from 'assert'

describe('lib/cache', () => {})

// async function readCoinbaseCache(startsWith = 'coinbase,', directory = 'cache', { readdir } = fs, { join } = path) {
//   return ( await readdir(directory) )
//     .filter(file => file.startsWith(startsWith))
//     .map(file => {
//       const [exchange, id, rest] = file.split(',')
//       const [interval, extension] = rest.split('.')
//       return { exchange, id, interval, extension, path: join(directory, file) }
//     })
// }



// describe('lib/cache', () => {
//   it('returns an array of objects', async () => {
//     const cache = await readCoinbaseCache('coinbase,', '../cache')
//     console.log(cache)
//   })
// })
