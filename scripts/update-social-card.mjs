import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const endpoint = process.env.LIANGXIANG_SNAPSHOT_URL ?? 'https://api.liang.today/v1/snapshot'
const publishedEndpoint = process.env.LIANGXIANG_PUBLISHED_SNAPSHOT_URL ?? 'https://liang.today/data/today.json'
const outputDirectory = resolve('public/media/social')
const dataPath = resolve('src/data/today.json')
const publicDataPath = resolve('public/data/today.json')
const allowedStates = new Set([
  'waiting',
  'liang_gong',
  'liang_zong',
  'liang_shen',
  'liang_sheng',
  'liang_zu',
])

function expectedState(upRatio) {
  if (upRatio === null) return 'waiting'
  if (upRatio < 0.5) return 'liang_gong'
  if (upRatio < 0.7) return 'liang_zong'
  if (upRatio < 0.85) return 'liang_shen'
  if (upRatio < 0.95) return 'liang_sheng'
  return 'liang_zu'
}

export function waitingSnapshot(now = new Date()) {
  return {
    business_date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(now),
    case_title: '今日梁案待开',
    up_ratio: null,
    total_incense: 0,
    unique_voters: 0,
    liangzi_state: 'waiting',
    snapshot_version: 0,
    updated_at: now.toISOString(),
    source: 'fallback',
  }
}

export function parsePublishedSnapshot(payload, source = 'cached') {
  if (!payload || typeof payload !== 'object') throw new Error('published snapshot is not an object')
  if (typeof payload.business_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payload.business_date)) {
    throw new Error('published business date is invalid')
  }
  if (typeof payload.case_title !== 'string' || payload.case_title.trim().length === 0) {
    throw new Error('published case title is invalid')
  }
  if (!allowedStates.has(payload.liangzi_state)) throw new Error('published Liangzi state is invalid')
  if (!Number.isSafeInteger(payload.total_incense) || payload.total_incense < 0) {
    throw new Error('published incense counter is invalid')
  }
  if (!Number.isSafeInteger(payload.unique_voters) || payload.unique_voters < 0) {
    throw new Error('published unique-voter counter is invalid')
  }
  if (payload.unique_voters > payload.total_incense) {
    throw new Error('published unique-voter count exceeds total votes')
  }
  if (!Number.isSafeInteger(payload.snapshot_version) || payload.snapshot_version < 0) {
    throw new Error('published snapshot version is invalid')
  }
  if (payload.up_ratio !== null && (typeof payload.up_ratio !== 'number' || payload.up_ratio < 0 || payload.up_ratio > 1)) {
    throw new Error('published ratio is invalid')
  }
  if ((payload.total_incense === 0) !== (payload.up_ratio === null)) {
    throw new Error('published ratio and vote count disagree')
  }
  if (payload.liangzi_state !== expectedState(payload.up_ratio)) {
    throw new Error('published state and ratio disagree')
  }
  if (typeof payload.updated_at !== 'string' || !Number.isFinite(Date.parse(payload.updated_at))) {
    throw new Error('published update time is invalid')
  }

  return {
    business_date: payload.business_date,
    case_title: payload.case_title,
    up_ratio: payload.up_ratio,
    total_incense: payload.total_incense,
    unique_voters: payload.unique_voters,
    liangzi_state: payload.liangzi_state,
    snapshot_version: payload.snapshot_version,
    updated_at: new Date(payload.updated_at).toISOString(),
    source,
  }
}

export function parseSnapshot(payload) {
  const snapshot = payload?.global_snapshot
  const activeCase = payload?.active_case
  if (!snapshot || !activeCase) throw new Error('snapshot response is missing the expected Liangxiang fields')

  const serverTime = new Date(payload.server_time)
  if (!Number.isFinite(serverTime.getTime())) throw new Error('snapshot server time is invalid')

  return parsePublishedSnapshot({
    business_date: payload.business_date,
    case_title: activeCase.title,
    up_ratio: snapshot.up_ratio,
    total_incense: snapshot.total_incense,
    unique_voters: snapshot.unique_voters,
    liangzi_state: snapshot.liangzi_state,
    snapshot_version: snapshot.sequence,
    updated_at: serverTime.toISOString(),
  }, 'live')
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
    headers: { accept: 'application/json', 'user-agent': 'liang.today-pages-build' },
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
  await copyFile(resolve(outputDirectory, `${today.liangzi_state}.png`), resolve(outputDirectory, 'today.png'))
  const serialized = `${JSON.stringify(today, null, 2)}\n`
  await Promise.all([
    writeFile(dataPath, serialized, 'utf8'),
    writeFile(publicDataPath, serialized, 'utf8'),
  ])
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main()
}
