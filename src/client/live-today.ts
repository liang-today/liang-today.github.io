import { states, CURRENT_POLICY } from '../data/liangzi.mjs'
import { canAdvanceSnapshot, formatPosition, parsePublishedSnapshot, parseSnapshot, POLICY_HEADER } from '../data/snapshot.mjs'
import { createShareCard } from './share-card'

const element = document.querySelector<HTMLElement>('[data-live-today]')
type Snapshot = ReturnType<typeof parsePublishedSnapshot>
const time = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
const number = new Intl.NumberFormat('zh-CN')

if (element) {
  const root = element
  const initial = root.dataset.initialSnapshot
  let latest: Snapshot | undefined
  try { latest = parsePublishedSnapshot(JSON.parse(initial ?? 'null')) } catch { /* SSR remains labelled as a saved snapshot. */ }
  let epoch = 0, timer: ReturnType<typeof setTimeout> | undefined, controller: AbortController | undefined
  let failures = 0, sharing = false, connected = false
  const endpoint = root.dataset.liveEndpoint
  const connection = root.querySelector<HTMLElement>('[data-live-connection]')
  const notice = root.querySelector<HTMLElement>('[data-share-status]')
  const text = (selector: string, value: string) => root.querySelectorAll<HTMLElement>(selector).forEach(node => { if (node.textContent !== value) node.textContent = value })

  function status(live: boolean, message: string) {
    connected = live
    root.dataset.connection = live ? 'live' : 'saved'
    if (connection && connection.textContent !== message) connection.textContent = message
  }

  /** All visible fields are replaced synchronously from one response. */
  function render(snapshot: Snapshot) {
    const state = states[snapshot.liangzi_state]
    if (!state) return
    latest = snapshot
    if (!sharing) root.querySelectorAll<HTMLButtonElement>('[data-share-today], [data-download-today]').forEach(button => { button.disabled = false })
    text('[data-live-date]', snapshot.business_date)
    text('[data-live-case]', snapshot.case_title)
    text('[data-live-state]', state.name)
    text('[data-live-ratio]', formatPosition(snapshot))
    text('[data-live-incense]', number.format(snapshot.total_incense))
    text('[data-live-asof]', `北京时间 ${time.format(new Date(snapshot.updated_at))} · 快照${snapshot.snapshot_version}`)
    root.querySelectorAll<HTMLImageElement>('[data-live-portrait]').forEach(image => {
      const source = new URL(state.image, location.origin).href
      if (image.src !== source) image.src = source
      image.alt = `${state.name}形相`
    })
    root.dataset.snapshotVersion = String(snapshot.snapshot_version)
    root.dataset.caseId = snapshot.case_id ?? ''
    const legend = document.querySelector<HTMLElement>('[data-state-legend]')
    legend?.querySelectorAll<HTMLElement>('[data-policy-state]').forEach(node => {
      const small = node.querySelector('small')
      const id = node.dataset.policyState
      node.hidden = snapshot.policy_version !== CURRENT_POLICY && id === 'xiao_nan_liang'
      node.classList.toggle('is-current-state', id === snapshot.liangzi_state)
      if (small && id === 'liang_gong') small.textContent = snapshot.policy_version === CURRENT_POLICY ? '25% — <50%' : '<50%'
    })
    if (legend) legend.dataset.policy = snapshot.policy_version
    const ruleNote = document.querySelector<HTMLElement>('[data-policy-note]')
    if (ruleNote) ruleNote.textContent = snapshot.policy_version === CURRENT_POLICY
      ? '零票为「待开梁」；有票后按本案梁位显相。'
      : '本案沿用开启时的五态规则；新梁案使用六态规则，历史结果不改写。'
  }

  function savedMessage(prefix: string) {
    return latest ? `${prefix}，显示${time.format(new Date(latest.updated_at))}的快照` : prefix
  }

  async function tick(token: number) {
    if (!endpoint || document.hidden || token !== epoch) return
    const request = new AbortController(); controller = request
    const timeout = setTimeout(() => request.abort(), 8000)
    const began = performance.now()
    try {
      const response = await fetch(endpoint, { headers: { accept: 'application/json', [POLICY_HEADER]: CURRENT_POLICY }, cache: 'no-store', credentials: 'omit', signal: request.signal })
      if (!response.ok) throw new Error('Snapshot unavailable')
      const next = parseSnapshot(await response.json())
      if (document.hidden || token !== epoch) return
      if (!canAdvanceSnapshot(latest?.source === 'live' ? latest : undefined, next)) throw new Error('Delayed or inconsistent snapshot')
      const image = root.querySelector<HTMLImageElement>('[data-live-portrait]')
      const nextImage = states[next.liangzi_state]?.image
      if (image && nextImage && image.src !== new URL(nextImage, location.origin).href) {
        const preload = new Image(); preload.src = nextImage
        let onAbort: (() => void) | undefined
        try {
          await Promise.race([preload.decode(), new Promise<never>((_, reject) => {
            onAbort = () => reject(new Error('Portrait load interrupted'))
            request.signal.addEventListener('abort', onAbort, { once: true })
          })])
        } finally { if (onAbort) request.signal.removeEventListener('abort', onAbort) }
      }
      if (document.hidden || token !== epoch) return
      if (request.signal.aborted) throw new Error('Snapshot expired before rendering')
      render(next); failures = 0
      status(true, '实时同步中')
    } catch {
      if (token !== epoch || document.hidden) return
      failures += 1
      status(false, savedMessage('实时连接暂不可用'))
    } finally {
      clearTimeout(timeout)
      if (controller === request) controller = undefined
      if (token === epoch && !document.hidden) {
        const cadence = failures ? Math.min(10000, 1000 * 2 ** (failures - 1)) : 1000
        timer = setTimeout(() => { void tick(token) }, Math.max(0, cadence - (performance.now() - began)))
      }
    }
  }

  function resume() {
    epoch += 1; clearTimeout(timer); controller?.abort()
    if (document.hidden) status(false, savedMessage('页面已暂停同步'))
    else { status(false, savedMessage('正在连接')); void tick(epoch) }
  }
  if (latest) render(latest)
  document.addEventListener('visibilitychange', resume)
  addEventListener('online', resume)
  addEventListener('pagehide', () => { epoch += 1; clearTimeout(timer); controller?.abort() })
  addEventListener('pageshow', event => { if (event.persisted) resume() })
  resume()

  const exportButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-share-today], [data-download-today]')]
  exportButtons.forEach(button => { button.disabled = !latest })
  for (const button of exportButtons) button.addEventListener('click', async () => {
    if (!latest || sharing) return
    sharing = true; exportButtons.forEach(item => { item.disabled = true })
    const frozen = { ...latest }
    try {
      const blob = await createShareCard(frozen)
      const filename = `今日梁相-${frozen.business_date}-${frozen.snapshot_version}.png`
      const file = new File([blob], filename, { type: 'image/png' })
      if (button.hasAttribute('data-share-today') && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: '今日梁相', text: '众香成势，梁子显相。', files: [file] })
      } else {
        const url = URL.createObjectURL(blob), link = document.createElement('a')
        link.href = url; link.download = filename; link.click()
        setTimeout(() => URL.revokeObjectURL(url), 30000)
      }
      if (notice) notice.textContent = `已生成${time.format(new Date(frozen.updated_at))}的2400×1260分享卡${connected ? '' : '（保留快照）'}`
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      if (notice) notice.textContent = '分享卡暂未生成，请稍后重试；也可复制liang.today分享。'
    } finally { sharing = false; exportButtons.forEach(item => { item.disabled = false }) }
  })
}
