import { access, readFile, readdir } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'

const root = resolve('dist')
const htmlFiles = []

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (extname(entry.name) === '.html') htmlFiles.push(path)
  }
}

function localTarget(value) {
  if (!value || /^(?:https?:|mailto:|tel:|data:|javascript:)/.test(value)) return null
  const path = value.split('#')[0].split('?')[0]
  if (!path) return null
  if (path.startsWith('/')) return resolve(root, `.${path}`)
  return null
}

async function existsAsPage(path) {
  const candidates = extname(path) ? [path] : [path, `${path}.html`, join(path, 'index.html')]
  for (const candidate of candidates) {
    try {
      await access(candidate)
      return true
    } catch {}
  }
  return false
}

await walk(root)
const broken = []

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8')
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const target = localTarget(match[1])
    if (target && !(await existsAsPage(target))) broken.push(`${file}: ${match[1]}`)
  }
}

if (broken.length) {
  console.error(`Broken local links/assets:\n${broken.join('\n')}`)
  process.exit(1)
}

console.log(`Verified ${htmlFiles.length} generated HTML pages and their local links/assets.`)
