import { createServer } from 'node:http'
import { mkdir, readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, resolve } from 'node:path'
import { chromium } from 'playwright'

const distRoot = resolve('dist')
const [outputArgument, stateArgument] = process.argv.slice(2).filter((argument) => argument !== '--')
const outputPath = resolve(outputArgument ?? 'dist/media/social/today.png')
const allowedStates = new Set(['waiting', 'liang_gong', 'liang_zong', 'liang_shen', 'liang_sheng', 'liang_zu'])
if (stateArgument && !allowedStates.has(stateArgument)) throw new Error(`Unknown Liangxiang state: ${stateArgument}`)
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1')
    let filePath = join(distRoot, `.${decodeURIComponent(url.pathname)}`)
    const fileStats = await stat(filePath)
    if (fileStats.isDirectory()) filePath = join(filePath, 'index.html')
    const content = await readFile(filePath)
    response.writeHead(200, { 'content-type': mimeTypes[extname(filePath)] ?? 'application/octet-stream' })
    response.end(content)
  } catch {
    response.writeHead(404)
    response.end('Not found')
  }
})

await new Promise((resolveListen, rejectListen) => {
  server.once('error', rejectListen)
  server.listen(0, '127.0.0.1', resolveListen)
})

const address = server.address()
if (!address || typeof address === 'string') throw new Error('Could not start the local card renderer')

let browser
try {
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({
    colorScheme: 'light',
    viewport: { width: 2400, height: 1260 },
  })
  const cardUrl = new URL(`http://127.0.0.1:${address.port}/social-card/`)
  if (stateArgument) cardUrl.searchParams.set('state', stateArgument)
  await page.goto(cardUrl.toString(), { waitUntil: 'networkidle' })
  await page.locator('[data-card]').waitFor({ state: 'visible' })
  await mkdir(dirname(outputPath), { recursive: true })
  await page.screenshot({ path: outputPath })
  console.log(`Rendered today's 2400×1260 social card to ${outputPath}.`)
} finally {
  await browser?.close()
  await new Promise((resolveClose) => server.close(resolveClose))
}
