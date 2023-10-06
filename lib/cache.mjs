import fs from 'node:fs/promises'
import readline from 'node:readline'
import path from 'node:path'
import process from 'node:process'

export function byExchange (exchange) {
  return (file) => file.startsWith(`${exchange},`)
}

export async function readCache (predicate = () => true, { env: { npm_package_config_cache: dir } } = process, { readdir } = fs, { join } = path) {
  return (await readdir(dir)).filter(predicate).map(file => join(dir, file))
}

export async function readLastCachedLineOf (input, { createInterface } = readline) {
  let lastLine
  for await (lastLine of createInterface({ input, terminal: false }));
  return lastLine
}

export async function readLastCachedJsonLineOf (input, jsonDateReviver, { createInterface } = readline) {
  return JSON.parse(await readLastCachedLineOf(input), jsonDateReviver)
}
