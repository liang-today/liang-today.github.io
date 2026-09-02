import assert from 'node:assert/strict'
import test from 'node:test'

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
