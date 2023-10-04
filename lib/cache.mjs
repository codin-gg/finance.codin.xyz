#!/usr/bin/env node --experimental-modules

import fs from 'node:fs/promises'
import path from 'node:path'
import readline from 'node:readline'
import { env } from 'node:process'

export async function readCacheBy(filterFn = () => true, { npm_package_config_data } = env, { readdir } = fs, { join } = path) {
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

// export async function createFileRecursively (filePath, data = '') {
//   try {
//     const dir = dirname(filePath)
//     await access(dir)
//   } catch (error) {
//     await createDirectoryRecursively(dir)
//   }
//   await writeFile(filePath, data, 'utf8')
// }

// export async function createDirectoryRecursively (directoryPath) {
//   const parentDir = dirname(directoryPath)
//   try {
//     await access(parentDir)
//   } catch (error) {
//     await createDirectoryRecursively(parentDir)
//   }
//   await mkdir(directoryPath)
// }

// Example usage:
// const filePath = './myFolder/mySubFolder/myFile.txt';
// const fileData = 'Hello, World!';
// createFileRecursively(filePath, fileData)
//   .then(() => console.log('File created successfully'))
//   .catch(error => console.error(`Error: ${error.message}`));
