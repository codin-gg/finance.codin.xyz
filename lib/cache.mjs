import fs from 'node:fs/promises'
import readline from 'node:readline'
import path from 'node:path'
import process from 'node:process'

import { jsonDateReviver } from './date.mjs'

export function byExchange (exchange) {
  return (file) => file.startsWith(`${exchange},`)
}

export function byInterval (interval) {
  return (file) => file.endsWith(`,${interval}.jsonl`)
}

export async function readCache (predicate = () => true, { env: { npm_package_config_cache: dir } } = process, { join } = path, { readdir } = fs) {
  return (await readdir(dir)).filter(predicate).map(file => join(dir, file))
}

// todo: refactor the following functions

export async function readLastCachedLineOf (input, { createInterface } = readline) { // todo: rename to seekLastLineOf
  let lastLine // todo: explore input.seek(-1, SEEK_END) and input.read() to read last line
  for await (lastLine of createInterface({ input, terminal: false }));
  return lastLine
}

export async function readLastCachedJsonLineOf (input, reviver = jsonDateReviver, { createInterface } = readline) {
  return JSON.parse(await readLastCachedLineOf(input), reviver)
}
