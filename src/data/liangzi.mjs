// Public presentation policy. Old snapshots keep the policy they were opened under.
export const LEGACY_POLICY = 'liangzi-v0.1-50-70-85-95'
export const CURRENT_POLICY = 'liangzi-v0.2-25-50-70-85-95'
export const POLICY_HEADER = 'x-liangxiang-liangzi-policy'

/** @type {Record<string, { name: string, image: string, range: string }>} */
export const states = {
  waiting: { name: '待开梁', image: '/artwork/waiting.png', range: '--' },
  xiao_nan_liang: { name: '小难梁', image: '/artwork/nan.png', range: '< 25%' },
  liang_gong: { name: '梁工', image: '/artwork/gong.png', range: '25% — <50%' },
  liang_zong: { name: '梁总', image: '/artwork/zong.png', range: '50% — <70%' },
  liang_shen: { name: '梁神', image: '/artwork/shen.png', range: '70% — <85%' },
  liang_sheng: { name: '梁圣', image: '/artwork/sheng.png', range: '85% — <95%' },
  liang_zu: { name: '梁祖', image: '/artwork/zu.png', range: '≥ 95%' },
}
export const votedStates = Object.entries(states).filter(([id]) => id !== 'waiting').map(([, state]) => state)

export function expectedState(upRatio, policy = LEGACY_POLICY) {
  if (policy !== LEGACY_POLICY && policy !== CURRENT_POLICY) throw new Error('unknown Liangzi policy')
  if (upRatio === null) return 'waiting'
  if (policy === CURRENT_POLICY && upRatio < 0.25) return 'xiao_nan_liang'
  if (upRatio < 0.5) return 'liang_gong'
  if (upRatio < 0.7) return 'liang_zong'
  if (upRatio < 0.85) return 'liang_shen'
  if (upRatio < 0.95) return 'liang_sheng'
  return 'liang_zu'
}
