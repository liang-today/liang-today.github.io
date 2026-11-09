import { states, expectedState, LEGACY_POLICY, CURRENT_POLICY, POLICY_HEADER } from './liangzi.mjs'

export { CURRENT_POLICY, POLICY_HEADER }
export const SNAPSHOT_URL = 'https://api.liang.today/v1/snapshot'

/** @typedef {{business_date:string, case_title:string, case_id?:string, up_ratio:number|null, total_incense:number, unique_voters:number, liangzi_state:string, policy_version:string, snapshot_version:number, updated_at:string, source:string, up_votes?:number, down_votes?:number, server_time?:number, captured_at?:number}} PublicSnapshot */

function integer(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`invalid ${name}`)
  return value
}

/** Validate cached data with its recorded policy; never reinterpret old archives. @returns {PublicSnapshot} */
export function parsePublishedSnapshot(payload, source = 'cached') {
  if (!payload || typeof payload !== 'object') throw new Error('published snapshot is not an object')
  if (typeof payload.business_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payload.business_date)) throw new Error('published business date is invalid')
  if (typeof payload.case_title !== 'string' || !payload.case_title.trim()) throw new Error('published case title is invalid')
  if (!Object.hasOwn(states, payload.liangzi_state)) throw new Error('published Liangzi state is invalid')
  const total = integer(payload.total_incense, 'incense counter')
  const voters = integer(payload.unique_voters, 'unique-voter counter')
  const version = integer(payload.snapshot_version, 'snapshot version')
  if (voters > total) throw new Error('published unique-voter count exceeds total votes')
  if (payload.up_ratio !== null && (!Number.isFinite(payload.up_ratio) || payload.up_ratio < 0 || payload.up_ratio > 1)) throw new Error('published ratio is invalid')
  if ((total === 0) !== (payload.up_ratio === null)) throw new Error('published ratio and vote count disagree')
  const policy = payload.policy_version ?? LEGACY_POLICY
  if (payload.liangzi_state !== expectedState(payload.up_ratio, policy)) throw new Error('published state and ratio disagree')
  if (typeof payload.updated_at !== 'string' || !Number.isFinite(Date.parse(payload.updated_at))) throw new Error('published update time is invalid')
  const hasCounts = payload.up_votes !== undefined || payload.down_votes !== undefined
  if (hasCounts) {
    const up = integer(payload.up_votes, 'up votes'), down = integer(payload.down_votes, 'down votes')
    if (!Number.isSafeInteger(up + down) || up + down !== total) throw new Error('raw vote counts disagree')
    if (total > 0 && Math.abs(up / total - payload.up_ratio) > 1e-12) throw new Error('raw counts and ratio disagree')
    const boundaries = policy === CURRENT_POLICY ? [25, 50, 70, 85, 95] : [50, 70, 85, 95]
    const ids = policy === CURRENT_POLICY ? ['xiao_nan_liang','liang_gong','liang_zong','liang_shen','liang_sheng','liang_zu'] : ['liang_gong','liang_zong','liang_shen','liang_sheng','liang_zu']
    const index = boundaries.findIndex(value => BigInt(up) * 100n < BigInt(total) * BigInt(value))
    const derived = total === 0 ? 'waiting' : ids[index < 0 ? ids.length - 1 : index]
    if (derived !== payload.liangzi_state) throw new Error('raw counts and state disagree')
  }
  return {
    business_date: payload.business_date, case_title: payload.case_title,
    up_ratio: payload.up_ratio, total_incense: total, unique_voters: voters,
    liangzi_state: payload.liangzi_state, policy_version: policy,
    snapshot_version: version, updated_at: new Date(payload.updated_at).toISOString(), source,
    ...(typeof payload.case_id === 'string' ? { case_id: payload.case_id } : {}),
    ...(hasCounts ? { up_votes: payload.up_votes, down_votes: payload.down_votes } : {}),
    ...(Number.isSafeInteger(payload.server_time) ? { server_time: payload.server_time } : {}),
    ...(Number.isSafeInteger(payload.captured_at) ? { captured_at: payload.captured_at } : {}),
  }
}

/** One response supplies the case, counts, figure, policy and version. */
export function parseSnapshot(payload) {
  const snapshot = payload?.global_snapshot, activeCase = payload?.active_case
  if (!snapshot || !activeCase || payload.schema_version !== 1) throw new Error('snapshot response is missing the expected Liangxiang fields')
  const serverTime = integer(payload.server_time, 'server time')
  if (!Number.isFinite(new Date(serverTime).getTime())) throw new Error('snapshot server time is invalid')
  if (!activeCase.id || snapshot.case_id !== activeCase.id || snapshot.business_date !== payload.business_date || activeCase.business_date !== payload.business_date) throw new Error('case and snapshot identities disagree')
  if (snapshot.policy_version !== activeCase.liangzi_policy_version) throw new Error('case and snapshot policies disagree')
  integer(snapshot.up_votes, 'up votes'); integer(snapshot.down_votes, 'down votes')
  const capturedAt = integer(snapshot.captured_at, 'capture time')
  if (capturedAt > serverTime) throw new Error('snapshot is newer than server clock')
  const parsed = parsePublishedSnapshot({
    business_date: payload.business_date, case_title: activeCase.title, case_id: activeCase.id,
    up_votes: snapshot.up_votes, down_votes: snapshot.down_votes,
    up_ratio: snapshot.up_ratio, total_incense: snapshot.total_incense, unique_voters: snapshot.unique_voters,
    liangzi_state: snapshot.liangzi_state, policy_version: snapshot.policy_version,
    snapshot_version: snapshot.sequence, updated_at: new Date(serverTime).toISOString(), server_time: serverTime, captured_at: capturedAt,
  }, 'live')
  if (parsed.total_incense > 0 && (!Number.isFinite(snapshot.down_ratio) || Math.abs(snapshot.down_ratio - (1 - parsed.up_ratio)) > 1e-12)) throw new Error('complementary ratio disagrees')
  if (parsed.total_incense === 0 && snapshot.down_ratio !== null) throw new Error('zero votes require null ratios')
  return parsed
}

/** Truncate the exact integer fraction so a caption cannot cross a state boundary. */
export function formatPosition(snapshot) {
  if (snapshot.up_ratio === null) return '--'
  if (snapshot.up_votes !== undefined && snapshot.total_incense > 0) {
    const value = BigInt(snapshot.up_votes) * 100_000_000n / BigInt(snapshot.total_incense)
    return `${value / 1_000_000n}.${String(value % 1_000_000n).padStart(6, '0')}%`
  }
  return `${(Math.floor(snapshot.up_ratio * 100_000_000) / 1_000_000).toFixed(6)}%`
}

/** Reject delayed replies and conflicting contents without discarding the last good result. */
export function canAdvanceSnapshot(previous, next) {
  if (!previous) return true
  if (next.business_date < previous.business_date) return false
  if (previous.server_time !== undefined && next.server_time !== undefined && next.server_time < previous.server_time) return false
  if (previous.case_id && next.case_id && previous.case_id !== next.case_id) return true
  if (previous.business_date !== next.business_date) return true
  if (next.snapshot_version < previous.snapshot_version) return false
  if (next.snapshot_version === previous.snapshot_version) {
    return next.total_incense === previous.total_incense && next.up_ratio === previous.up_ratio
      && next.liangzi_state === previous.liangzi_state && next.policy_version === previous.policy_version
      && next.unique_voters === previous.unique_voters
  }
  return true
}
