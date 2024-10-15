import fs from 'node:fs/promises'
import readline from 'node:readline'
import path from 'node:path'
import process from 'node:process'

import { jsonDateReviver } from './date.mjs'

export function byExchange (exchange) {
  return (file) => file.startsWith(`${exchange},`)
}

export function byFileList (files) {
  return (file) => files.includes(file)
}
export function byTickers (tickers) {
  return (file) => {
    const [/* exchange */, id/*, iterval, format */] = file.split(/[/,.]/)
    return tickers.includes(id)
  }
}

export function byInterval (interval) {
  return (file) => file.endsWith(`,${interval}.jsonl`)
}

export function allOf (...predicates) {
  return (file) => predicates.every(predicate => predicate(file))
}

export async function readCache (predicate = () => true, { env: { npm_package_config_cache: dir } } = process, { join } = path, { readdir } = fs) {
  return (
    await readdir(dir)
  )
    .filter(predicate)
    .map(file => join(dir, file)) // v2 .map(file => createReadStream(join(dir, file)))
}

// todo: refactor the following functions

export async function readLastCachedLineOf (input, { createInterface } = readline) { // todo: rename to seekLastLineOf
  let lastLine // todo: explore input.seek(-1, SEEK_END) and input.read() to read last line
  for await (lastLine of createInterface({ input, terminal: false }));
  return lastLine
}

export async function readLastCachedJsonLineOf (input, reviver = jsonDateReviver) {
  return JSON.parse(await readLastCachedLineOf(input), reviver)
}
