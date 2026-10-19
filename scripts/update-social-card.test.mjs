import assert from 'node:assert/strict'
import test from 'node:test'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CURRENT_POLICY, LEGACY_POLICY, states } from '../src/data/liangzi.mjs'

import {
  parsePublishedSnapshot,
  parseSnapshot,
  resolveTodaySnapshot,
} from './update-social-card.mjs'

const publicSnapshot = {
  business_date: '2026-09-02',
  case_title: 'DeepSeek Harness 是夯还是拉',
  up_ratio: 0.75,
  total_incense: 4,
  unique_voters: 2,
  liangzi_state: 'liang_shen',
  policy_version: LEGACY_POLICY,
  snapshot_version: 12,
  updated_at: '2026-09-02T08:00:00.000Z',
  source: 'live',
}

test('normalizes a valid backend snapshot as live data', () => {
  const parsed = parseSnapshot({
    business_date: publicSnapshot.business_date,
    // The real backend contract carries epoch milliseconds, not an ISO string.
    server_time: Date.parse(publicSnapshot.updated_at),
    active_case: { title: publicSnapshot.case_title },
    global_snapshot: {
      up_ratio: publicSnapshot.up_ratio,
      total_incense: publicSnapshot.total_incense,
      unique_voters: publicSnapshot.unique_voters,
      liangzi_state: publicSnapshot.liangzi_state,
      policy_version: publicSnapshot.policy_version,
      sequence: publicSnapshot.snapshot_version,
    },
  })

  assert.deepEqual(parsed, publicSnapshot)
})

test('rejects a cached snapshot whose ratio disagrees with its vote count', () => {
  assert.throws(
    () => parsePublishedSnapshot({ ...publicSnapshot, total_incense: 0, unique_voters: 0 }),
    /ratio and vote count disagree/,
  )
})

test('rejects a cached snapshot whose Liangzi state disagrees with its ratio', () => {
  assert.throws(
    () => parsePublishedSnapshot({ ...publicSnapshot, liangzi_state: 'liang_sheng' }),
    /state and ratio disagree/,
  )
})

test('preserves the published snapshot when the live API is unavailable', async () => {
  let localReads = 0
  const result = await resolveTodaySnapshot({
    live: async () => { throw new Error('network unavailable') },
    published: async () => parsePublishedSnapshot(publicSnapshot),
    local: async () => { localReads += 1; return publicSnapshot },
  })

  assert.equal(result.source, 'published')
  assert.equal(result.today.source, 'cached')
  assert.equal(result.today.snapshot_version, publicSnapshot.snapshot_version)
  assert.equal(localReads, 0)
})

test('uses the checked-in snapshot when both network sources are unavailable', async () => {
  const result = await resolveTodaySnapshot({
    live: async () => { throw new Error('live unavailable') },
    published: async () => { throw new Error('published unavailable') },
    local: async () => parsePublishedSnapshot(publicSnapshot),
  })

  assert.equal(result.source, 'local')
  assert.equal(result.today.business_date, publicSnapshot.business_date)
  assert.equal(result.today.source, 'cached')
})

test('keeps old snapshots under their recorded policy instead of retroactively changing their figure', () => {
  const legacy = { ...publicSnapshot, up_ratio: 0.1, liangzi_state: 'liang_gong' }
  assert.equal(parsePublishedSnapshot(legacy).liangzi_state, 'liang_gong')
  const { policy_version, ...oldCache } = legacy
  assert.equal(parsePublishedSnapshot(oldCache).policy_version, LEGACY_POLICY)
  assert.throws(() => parsePublishedSnapshot({ ...legacy, policy_version: CURRENT_POLICY }), /state and ratio disagree/)
  assert.throws(() => parsePublishedSnapshot({ ...legacy, policy_version: 'unknown-policy' }), /unknown Liangzi policy/)
})

for (const [ratio, state] of [[0, 'xiao_nan_liang'], [0.24999999, 'xiao_nan_liang'], [0.25, 'liang_gong'],
  [0.49999999, 'liang_gong'], [0.5, 'liang_zong'], [0.7, 'liang_shen'], [0.85, 'liang_sheng'], [0.95, 'liang_zu']]) {
  test(`accepts current policy boundary ${ratio} as ${state}`, () => {
    const parsed = parseSnapshot({
      business_date: publicSnapshot.business_date, server_time: Date.parse(publicSnapshot.updated_at),
      active_case: { title: publicSnapshot.case_title },
      global_snapshot: { up_ratio: ratio, total_incense: 100_000_000, unique_voters: 2,
        liangzi_state: state, sequence: 1, policy_version: CURRENT_POLICY },
    })
    assert.equal(parsed.liangzi_state, state)
    assert.equal(parsed.policy_version, CURRENT_POLICY)
    assert.ok(states[state].image)
  })
}

test('keeps zero-vote waiting distinct from a voted zero-percent small figure', () => {
  const waiting = { ...publicSnapshot, up_ratio: null, total_incense: 0, unique_voters: 0,
    liangzi_state: 'waiting', policy_version: CURRENT_POLICY }
  assert.equal(parsePublishedSnapshot(waiting).liangzi_state, 'waiting')
  assert.throws(() => parsePublishedSnapshot({ ...waiting, liangzi_state: 'xiao_nan_liang' }), /state and ratio disagree/)
})

test('the build requests current-policy HTTP data and publishes matching figure, policy and card', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'liangxiang-site-test-'))
  let requestedPolicy
  const server = createServer((request, response) => {
    requestedPolicy = request.headers['x-liangxiang-liangzi-policy']
    response.setHeader('content-type', 'application/json')
    response.end(JSON.stringify({ business_date: publicSnapshot.business_date,
      server_time: Date.parse(publicSnapshot.updated_at), active_case: { title: publicSnapshot.case_title },
      global_snapshot: { up_ratio: 0.1, total_incense: 10, unique_voters: 2,
        liangzi_state: 'xiao_nan_liang', sequence: 9, policy_version: CURRENT_POLICY } }))
  })
  try {
    await mkdir(join(directory, 'src/data'), { recursive: true })
    await mkdir(join(directory, 'public/media/social'), { recursive: true })
    await writeFile(join(directory, 'public/media/social/xiao_nan_liang.png'), 'synthetic-card')
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    const url = `http://127.0.0.1:${server.address().port}/v1/snapshot`
    const child = spawn(process.execPath, [fileURLToPath(new URL('./update-social-card.mjs', import.meta.url))], {
      cwd: directory, env: { ...process.env, LIANGXIANG_SNAPSHOT_URL: url, LIANGXIANG_PUBLISHED_SNAPSHOT_URL: url },
      stdio: 'ignore',
    })
    const code = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', resolve) })
    assert.equal(code, 0)
    assert.equal(requestedPolicy, CURRENT_POLICY)
    const data = JSON.parse(await readFile(join(directory, 'public/data/today.json'), 'utf8'))
    assert.equal(data.policy_version, CURRENT_POLICY)
    assert.equal(data.liangzi_state, 'xiao_nan_liang')
    assert.equal(data.up_ratio, 0.1)
    assert.equal(await readFile(join(directory, 'public/media/social/today.png'), 'utf8'), 'synthetic-card')
  } finally {
    server.closeAllConnections()
    if (server.listening) await new Promise(resolve => server.close(resolve))
    await rm(directory, { recursive: true, force: true })
  }
})
