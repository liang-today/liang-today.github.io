import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { CURRENT_POLICY, POLICY_HEADER, parseSnapshot, parsePublishedSnapshot } from '../src/data/snapshot.mjs'
export { parseSnapshot, parsePublishedSnapshot } from '../src/data/snapshot.mjs'

const endpoint = process.env.LIANGXIANG_SNAPSHOT_URL ?? 'https://api.liang.today/v1/snapshot'
const publishedEndpoint = process.env.LIANGXIANG_PUBLISHED_SNAPSHOT_URL ?? 'https://liang.today/data/today.json'
const outputDirectory = resolve('public/media/social')
const dataPath = resolve('src/data/today.json')
const publicDataPath = resolve('public/data/today.json')

export function waitingSnapshot(now = new Date()) {
  return {
    business_date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(now),
    case_title: '今日梁案待开',
    up_ratio: null,
    total_incense: 0,
    unique_voters: 0,
    liangzi_state: 'waiting',
    policy_version: CURRENT_POLICY,
    snapshot_version: 0,
    updated_at: now.toISOString(),
    source: 'fallback',
  }
}

export async function resolveTodaySnapshot(loaders, now = new Date()) {
  const failures = []
  for (const [source, load] of [
    ['live', loaders.live],
    ['published', loaders.published],
    ['local', loaders.local],
  ]) {
    try {
      return { today: await load(), source, failures }
    } catch (error) {
      failures.push(`${source}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return { today: waitingSnapshot(now), source: 'fallback', failures }
}

async function fetchJson(url, timeout) {
  const response = await fetch(url, {
    headers: { accept: 'application/json', 'user-agent': 'liang.today-pages-build', [POLICY_HEADER]: CURRENT_POLICY },
    signal: AbortSignal.timeout(timeout),
  })
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`)
  return response.json()
}

async function main() {
  const result = await resolveTodaySnapshot({
    live: async () => parseSnapshot(await fetchJson(endpoint, 8_000)),
    published: async () => parsePublishedSnapshot(await fetchJson(publishedEndpoint, 5_000)),
    local: async () => parsePublishedSnapshot(JSON.parse(await readFile(dataPath, 'utf8'))),
  })
  const { today } = result

  if (result.source === 'live') {
    console.log(`Synced ${today.business_date} ${today.liangzi_state} at snapshot ${today.snapshot_version}.`)
  } else if (result.source === 'fallback') {
    console.warn(`Could not load a live or last-known-good public snapshot; publishing WAITING. ${result.failures.join(' | ')}`)
  } else {
    console.warn(`Live snapshot unavailable; preserving the last-known-good ${result.source} snapshot from ${today.business_date}. ${result.failures.join(' | ')}`)
  }

  await mkdir(outputDirectory, { recursive: true })
  await mkdir(dirname(publicDataPath), { recursive: true })
  const serialized = `${JSON.stringify(today, null, 2)}\n`
  await Promise.all([
    writeFile(dataPath, serialized, 'utf8'),
    writeFile(publicDataPath, serialized, 'utf8'),
  ])
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main()
}
