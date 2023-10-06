import fs from 'fs/promises'
import path from 'path'

async function * getAllFiles (dir, { join } = path, { readdir, stat } = fs) {
  const files = await readdir(dir)
  for (const file of files) {
    const path = join(dir, file)
    const stats = await stat(path)
    if (stats.isDirectory()) {
      yield * getAllFiles(path)
    } else if (stats.isFile()) {
      yield path
    }
  }
}

async function generateSitemap (dir, { relative } = path, { stat } = fs) {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  for await (const file of getAllFiles(dir)) {
    if (['www/sitemap.xml'].includes(file)) continue
    sitemap += `<url><loc>/${relative(dir, file).replace(/\\/g, '/')}</loc><lastmod>${(await stat(file)).mtime.toISOString().split('T')[0]}</lastmod></url>\n`
  }
  return sitemap + '</urlset>'
}

console.time('[bin/build-sitemap] created: www/sitemap.xml time')
await fs.writeFile('www/sitemap.xml', await generateSitemap('www'))
console.timeEnd('[bin/build-sitemap] created: www/sitemap.xml time')

// For when this file will become too big:
// - https://webmasters.stackexchange.com/a/93807
// - https://chat.openai.com/c/ebb14320-2827-423d-8ddd-1dd016c25497 (first thread)
