import { readFile } from 'node:fs/promises'
import { parse } from 'yaml'

export const openapi = await readFile('www/api/openapi.yml', 'utf8')
export const { availableTickers } = parse(openapi)
