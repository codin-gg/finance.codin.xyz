import fs from 'node:fs/promises'
import readline from 'node:readline'
import path from 'node:path'

import { env } from 'node:process'

export async function readCache(filterFn = () => true, { npm_package_config_data } = env, { readdir } = fs, { join } = path) {
  return (
    await readdir(npm_package_config_data)
  )
    .filter(filterFn)
    .map(file => join(npm_package_config_data, file))
}

export async function readLastCachedLineOf(input, {createInterface} = readline) {
  let lastLine
  for await (lastLine of createInterface({ input, terminal: false })) {}
  return lastLine
}

export async function readLastCachedJsonLineOf(input, jsonDateReviver, {createInterface} = readline) {
  return JSON.parse(await readLastCachedLineOf(input), jsonDateReviver)
}
