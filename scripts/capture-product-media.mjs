import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'

import { chromium } from 'playwright'

const run = promisify(execFile)
const voteUrl = process.env.LIANGXIANG_CAPTURE_VOTE_URL
const liangciUrl = process.env.LIANGXIANG_CAPTURE_LIANGCI_URL
const outputDir = resolve('public/media/product')

if (!voteUrl || !liangciUrl) {
  throw new Error('Set LIANGXIANG_CAPTURE_VOTE_URL and LIANGXIANG_CAPTURE_LIANGCI_URL to authenticated DSH WebUI URLs.')
}

const delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds))

async function dismissIfVisible(locator, timeout = 1_200) {
  const visible = await locator.waitFor({ state: 'visible', timeout }).then(() => true, () => false)
  if (visible) await locator.click()
}

async function bootLiangxiang(page, url) {
  await page.addInitScript(() => {
    localStorage.setItem('liangxiang:welcome:v2', 'seen')
    localStorage.setItem('liangxiang:release-notes:1.2.0', 'seen')
    localStorage.setItem('liangxiang:panel-open:v1', '0')
    localStorage.removeItem('liangxiang:badge-position:v2')
  })
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-liangxiang-root]').waitFor({ state: 'visible', timeout: 20_000 })
  await dismissIfVisible(page.getByRole('dialog', { name: 'Internal Testing Notice' }).getByRole('button', { name: 'Continue' }))
  await dismissIfVisible(page.getByRole('dialog', { name: 'Add an API key to get started' }).getByRole('button', { name: 'Configure later' }))
  const panel = page.locator('[data-liangxiang-panel]')
  if (!await panel.isVisible()) await page.locator('[data-liangxiang-badge]').click()
  await panel.waitFor({ state: 'visible' })
  await page.mouse.move(1, 1)
  return panel
}

async function captureFrames(page, directory, count, actionFrame, action) {
  await mkdir(directory, { recursive: true })
  for (let frame = 0; frame < count; frame += 1) {
    if (frame === actionFrame) await action()
    const path = join(directory, `frame-${String(frame).padStart(3, '0')}.png`)
    await page.screenshot({ path, type: 'png', animations: 'allow' })
    await delay(70)
  }
}

async function encodeFrames(directory, outputName, posterName, posterFrame) {
  const output = join(outputDir, outputName)
  const poster = join(outputDir, posterName)
  await mkdir(dirname(output), { recursive: true })
  await run('ffmpeg', [
    '-y', '-loglevel', 'error', '-framerate', '12', '-i', join(directory, 'frame-%03d.png'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output,
  ])
  await run('ffmpeg', [
    '-y', '-loglevel', 'error', '-i', join(directory, `frame-${String(posterFrame).padStart(3, '0')}.png`),
    '-frames:v', '1', '-q:v', '2', poster,
  ])
}

const temporaryRoot = await mkdtemp(join(tmpdir(), 'liangxiang-product-capture-'))
const browser = await chromium.launch({ headless: true })

try {
  const voteContext = await browser.newContext({
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
    viewport: { width: 2160, height: 2160 },
  })
  const votePage = await voteContext.newPage()
  const panel = await bootLiangxiang(votePage, voteUrl)
  await votePage.addStyleTag({ content: `
    html, body { width: 100%; height: 100%; overflow: hidden !important; background: #0d0f13 !important; }
    [data-liangxiang-root] {
      position: fixed !important; inset: 0 !important; z-index: 2147483000 !important;
      background: radial-gradient(circle at 50% 44%, #29241f 0, #17181d 44%, #0d0f13 100%) !important;
    }
    [data-liangxiang-badge] { display: none !important; }
    [data-liangxiang-panel] {
      position: fixed !important; left: 50% !important; top: 50% !important; right: auto !important; bottom: auto !important;
      transform: translate(-50%, -50%) scale(4.55) !important; transform-origin: center center !important;
      z-index: 2147483640 !important; box-shadow: 0 24px 120px rgba(0, 0, 0, .72) !important;
    }
  ` })
  await delay(900)
  const voteFrames = join(temporaryRoot, 'vote')
  await captureFrames(votePage, voteFrames, 42, 10, async () => {
    await panel.locator('[data-liangxiang-vote="up"]').click()
  })
  await encodeFrames(voteFrames, 'liangxiang-vote-2k.mp4', 'liangxiang-main-2k.jpg', 24)
  await voteContext.close()

  const liangciContext = await browser.newContext({
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
    viewport: { width: 2160, height: 1600 },
  })
  const liangciPage = await liangciContext.newPage()
  const onlinePanel = await bootLiangxiang(liangciPage, liangciUrl)
  await onlinePanel.locator('[data-liangxiang-liangci-entry]').click()
  const dialog = liangciPage.locator('[data-liangci-dialog]')
  await dialog.waitFor({ state: 'visible' })
  await liangciPage.addStyleTag({ content: `
    html, body { width: 100%; height: 100%; overflow: hidden !important; background: #0d0f13 !important; }
    [data-liangci-backdrop] {
      position: fixed !important; inset: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important;
      background: radial-gradient(circle at 50% 45%, #28231f 0, #16181c 48%, #0d0f13 100%) !important;
      backdrop-filter: none !important; z-index: 2147483640 !important;
    }
    [data-liangci-dialog] {
      position: relative !important; inset: auto !important; width: 880px !important; max-width: none !important;
      transform: scale(2.04) !important; transform-origin: center center !important;
      box-shadow: 0 28px 130px rgba(0, 0, 0, .75) !important;
    }
  ` })
  await delay(900)
  const archivedDay = dialog.locator('[data-liangci-day-status="archived"]').first()
  const liangciFrames = join(temporaryRoot, 'liangci')
  await captureFrames(liangciPage, liangciFrames, 42, 13, async () => {
    if (await archivedDay.isVisible()) await archivedDay.click()
    else await dialog.locator('[data-liangci-nav="previous"]').click()
  })
  await encodeFrames(liangciFrames, 'liangxiang-liangci-2k.mp4', 'liangxiang-liangci-2k.jpg', 24)
  await liangciContext.close()
} finally {
  await browser.close()
  await rm(temporaryRoot, { recursive: true, force: true })
}

console.log('Captured focused 2K Liangxiang panel and Liangci media.')
