#!/usr/bin/env node --experimental-modules

import { createWriteStream } from 'node:fs'
import { fetchCoinbase } from '../lib/coinbase.mjs'
import { writeCsv, writeJson } from '../lib/jsonl.mjs'

const { products } = await fetchCoinbase('brokerage/products')

const latestCsvWriter = writeCsv(['id', 'base id', 'base name', 'quote id', 'quote name', 'status', 'price', 'volume 24h', 'price % 24h', 'volume % 24h', 'cached'])
const latestJsonWriter = writeJson()

for (const { product_id: id, base_currency_id: baseId, base_name: baseName, quote_currency_id: quoteId, quote_name: quoteName, status, price, volume_24h: volume24h, price_percentage_change_24h: pricePercentageChange24h, volume_percentage_change_24h: volumePercentageChange24h } of products) {
  latestJsonWriter.write({ id: id.toLowerCase(), baseId, baseName, quoteId, quoteName, status, price, volume24h, pricePercentageChange24h, volumePercentageChange24h, cached: !['USDC', 'USDT', 'GBP'].includes(quoteId) })
  latestCsvWriter.write([id.toLowerCase(), baseId, baseName, quoteId, quoteName, status, price, volume24h, pricePercentageChange24h, volumePercentageChange24h, !['USDC', 'USDT', 'GBP'].includes(quoteId)])
}

latestJsonWriter.end()
latestCsvWriter.end()

latestCsvWriter.pipe(createWriteStream('www/api/latest.csv'))
latestJsonWriter.pipe(createWriteStream('www/api/latest.json'))
