import { URL } from 'node:url'
// import { utcDate } from './date.mjs'

/*
API Docs -> https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Kline-Candlestick-Data
*/

export function fetchBinance (
  input,
  init = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }
) {
  const url = new URL(input, 'https://api.binance.com/api/v3/')
  console.time(`[lib/binance] fetch: ${url} duration`)

  return fetch(url, init)
    .then(response => {
      console.timeEnd(`[lib/binance] fetch: ${url} duration`)
      return response.text()
    })
    .then(text => {
      return JSON.parse(text)
    })
}

// export async function * fetchCandlesSince (start, id, size, env) {

// }

// const result = await fetchBinance('klines?symbol=BNBUSDT&interval=1h')
// console.log(JSON.stringify(result.map(parseBinanceCandle)))

// function parseBinanceCandle ([openTimestamp, open, high, low, close, volume]) {
//   return [new Date(openTimestamp), open, high, low, close, volume]
// }

// export function toUnixTimestamp (date, fromMilliseconds = 1e-3) { // todo: rename to generic utils.toUnixTimestamp
//   return Math.floor(fromMilliseconds * date.getTime())
// }

// export function fromUnixTimestamp (unixTimestamp, toMilliseconds = 1e3) { // todo: rename to generic utils.fromUnixTimestamp
//   return new Date(toMilliseconds * unixTimestamp)
// }

// const https = require('https')

// // Binance API base URL
// const baseUrl = 'https://api.binance.com/api/v3/klines'

// /**
//  * Fetches historical candle data from Binance.
//  *
//  * @param {string} symbol - The trading pair symbol (e.g., 'BTCUSDT').
//  * @param {string} interval - The candle interval (e.g., '1m', '5m', '1h', '1d').
//  * @param {number} [startTime] - The start time in milliseconds (optional).
//  * @param {number} [endTime] - The end time in milliseconds (optional).
//  * @param {number} [limit=500] - The maximum number of candles to return (max 1000).
//  * @returns {Promise<Array>} - A promise that resolves with an array of candle data.
//  */
// async function getHistoricalCandles (symbol, interval, startTime, endTime, limit = 500) {
//   // Construct the query parameters
//   const queryParams = new URLSearchParams({
//     symbol,
//     interval,
//     limit
//   })

//   if (startTime) {
//     queryParams.append('startTime', startTime)
//   }

//   if (endTime) {
//     queryParams.append('endTime', endTime)
//   }

//   // Construct the full API URL
//   const apiUrl = `${baseUrl}?${queryParams.toString()}`

//   // Make the HTTPS request
//   return new Promise((resolve, reject) => {
//     https.get(apiUrl, (response) => {
//       let data = ''

//       response.on('data', (chunk) => {
//         data += chunk
//       })

//       response.on('end', () => {
//         try {
//           const candles = JSON.parse(data)
//           resolve(candles)
//         } catch (error) {
//           reject(error)
//         }
//       })
//     }).on('error', (error) => {
//       reject(error)
//     })
//   })
// }

// // Example usage:
// (async () => {
//   try {
//     const candles = await getHistoricalCandles('BTCUSDT', '1h', Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
//     console.log(candles)
//   } catch (error) {
//     console.error('Error fetching candles:', error)
//   }
// })()
