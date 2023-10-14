#!/usr/bin/env node --experimental-modules
import { Readable } from 'node:stream'
import { createWriteStream } from 'node:fs'
import { EOL } from 'node:os'
import { fetchCoinbase } from '../lib/coinbase.mjs'

const { products } = await fetchCoinbase('brokerage/products')

/* eslint-disable camelcase */
const latestCsv = new Readable()
const latestJson = new Readable()
const count = 0

latestCsv.push(['id', 'base id', 'base name', 'quote id', 'quote name', 'status', 'price', 'volume 24h', 'price % 24h', 'volume % 24h', 'api'].join(',') + EOL)
latestJson.push('[')

for (const product of products) {
  const { product_id, base_currency_id, base_name, quote_currency_id, quote_name, status, price, volume_24h, price_percentage_change_24h, volume_percentage_change_24h } = product
  const jsonObject = {
    id: product_id,
    baseId: base_currency_id,
    baseName: base_name,
    quoteId: quote_currency_id,
    quoteName: quote_name,
    status,
    price,
    volume24h: volume_24h,
    pricePercentageChange24h: price_percentage_change_24h,
    volumePercentageChange24h: volume_percentage_change_24h,
    api: !['USDC', 'USDT', 'GBP'].includes(quote_currency_id)
  }

  if (count === 0) {
    latestJson.push(JSON.stringify(jsonObject))
  } else {
    latestJson.push(`${JSON.stringify(jsonObject)},`)
  }

  latestCsv.push(`${
    product_id.toLowerCase()
  },${
    base_currency_id
  },${
    base_name
  },${
    quote_currency_id
  },${
    quote_name
  },${
    status
  },${
    price
  },${
    volume_24h
  },${
    price_percentage_change_24h
  },${
    volume_percentage_change_24h
  },${
    ['USDC', 'USDT', 'GBP'].includes(quote_currency_id) ? 'FALSE' : 'TRUE'
  }${
    EOL
  }`)
  /* eslint-enable camelcase */
}
latestJson.push(']')
latestJson.push(null)
latestJson.pipe(createWriteStream('www/api/latest.json'))

latestCsv.push(null)
latestCsv.pipe(createWriteStream('www/api/latest.csv'))
