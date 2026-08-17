import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const endpoint = process.env.LIANGXIANG_SNAPSHOT_URL ?? 'https://api.liang.today/v1/snapshot'
const outputDirectory = resolve('public/media/social')
const dataPath = resolve('src/data/today.json')
const allowedStates = new Set([
  'waiting',
  'liang_gong',
  'liang_zong',
  'liang_shen',
  'liang_sheng',
  'liang_zu',
])

const waiting = {
  business_date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date()),
  case_title: '今日梁案待开',
  up_ratio: null,
  total_incense: 0,
  unique_voters: 0,
  liangzi_state: 'waiting',
  snapshot_version: 0,
  updated_at: new Date().toISOString(),
  source: 'fallback',
}

function parseSnapshot(payload) {
  const snapshot = payload?.global_snapshot
  const activeCase = payload?.active_case
  if (!snapshot || !activeCase || !allowedStates.has(snapshot.liangzi_state)) {
    throw new Error('snapshot response is missing the expected Liangxiang fields')
  }
  if (!Number.isSafeInteger(snapshot.total_incense) || !Number.isSafeInteger(snapshot.unique_voters)) {
    throw new Error('snapshot counters are invalid')
  }
  if (snapshot.up_ratio !== null && (typeof snapshot.up_ratio !== 'number' || snapshot.up_ratio < 0 || snapshot.up_ratio > 1)) {
    throw new Error('snapshot ratio is invalid')
  }
  return {
    business_date: String(payload.business_date),
    case_title: String(activeCase.title),
    up_ratio: snapshot.up_ratio,
    total_incense: snapshot.total_incense,
    unique_voters: snapshot.unique_voters,
    liangzi_state: snapshot.liangzi_state,
    snapshot_version: snapshot.sequence,
    updated_at: new Date(payload.server_time).toISOString(),
    source: 'live',
  }
}

let today = waiting
try {
  const response = await fetch(endpoint, {
    headers: { accept: 'application/json', 'user-agent': 'liang.today-pages-build' },
    signal: AbortSignal.timeout(8_000),
  })
  if (!response.ok) throw new Error(`snapshot returned HTTP ${response.status}`)
  today = parseSnapshot(await response.json())
  console.log(`Synced ${today.business_date} ${today.liangzi_state} at snapshot ${today.snapshot_version}.`)
} catch (error) {
  console.warn(`Could not sync the public snapshot; publishing the WAITING fallback. ${error instanceof Error ? error.message : String(error)}`)
}

await mkdir(outputDirectory, { recursive: true })
await copyFile(resolve(outputDirectory, `${today.liangzi_state}.png`), resolve(outputDirectory, 'today.png'))
await writeFile(dataPath, `${JSON.stringify(today, null, 2)}\n`, 'utf8')
