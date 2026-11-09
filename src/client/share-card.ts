import { states } from '../data/liangzi.mjs'
import { formatPosition, parsePublishedSnapshot } from '../data/snapshot.mjs'

type Snapshot = ReturnType<typeof parsePublishedSnapshot>
const timeFormat = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

async function loadImage(source: string) {
  const image = new Image()
  image.src = source
  await image.decode()
  return image
}

function lines(context: CanvasRenderingContext2D, text: string, width: number) {
  const result: string[] = []
  let line = ''
  for (const character of text) {
    if (character === '\n' || (line && context.measureText(line + character).width > width)) {
      result.push(line); line = character === '\n' ? '' : character
    } else line += character
  }
  if (line) result.push(line)
  return result
}

/** Export one frozen, validated snapshot; never combine live captions with an hourly image. */
export async function createShareCard(snapshot: Snapshot): Promise<Blob> {
  const frozen = parsePublishedSnapshot({ ...snapshot }, snapshot.source)
  const state = states[frozen.liangzi_state]
  if (!state) throw new Error('Unknown figure')
  const [portrait, qr] = await Promise.all([loadImage(state.image), loadImage('/media/liang-today-qr.png')])
  const canvas = document.createElement('canvas')
  canvas.width = 2400; canvas.height = 1260
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas unavailable')
  const font = (size: number, weight = 600) => `${weight} ${size}px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif`
  context.fillStyle = '#eef6ff'; context.fillRect(0, 0, 2400, 1260)
  context.strokeStyle = '#c5d9f2'; context.lineWidth = 2
  context.beginPath(); context.arc(1820, 450, 380, 0, Math.PI * 2); context.stroke()
  context.beginPath(); context.arc(1820, 450, 350, 0, Math.PI * 2); context.stroke()
  context.fillStyle = '#376baa'; context.font = font(54); context.fillText('梁相', 110, 126)
  context.fillStyle = '#617a99'; context.font = font(28, 500); context.fillText('DeepSeek Harness社区插件', 268, 123)
  context.fillStyle = '#3d70b3'; context.font = font(32); context.fillText(`今日梁案 · ${frozen.business_date}`, 110, 242)
  context.fillStyle = '#203a5c'; context.font = font(104, 700)
  context.fillText('众香成势，', 110, 392); context.fillText('梁子显相。', 110, 520)
  let caseLines: string[] = [], size = 54
  while (size >= 24) {
    context.font = font(size, 500); caseLines = lines(context, frozen.case_title, 1120)
    if (caseLines.length * size * 1.45 <= 330) break
    size -= 2
  }
  context.fillStyle = '#526d8c'
  caseLines.forEach((line, index) => context.fillText(line, 110, 636 + index * size * 1.45))
  context.fillStyle = '#233f63'; context.font = font(72, 700); context.fillText('liang.today', 110, 1098)
  context.font = font(28, 500); context.fillStyle = '#627c99'
  context.fillText(`${timeFormat.format(new Date(frozen.updated_at))} 北京时间`, 110, 1168)
  context.fillText(`快照 ${frozen.snapshot_version} · 扫码查看实时梁相`, 110, 1210)
  context.drawImage(portrait, 1530, 160, 580, 580)
  context.textAlign = 'center'; context.fillStyle = '#263f60'; context.font = font(80, 700)
  context.fillText(state.name, 1820, 850)
  context.fillStyle = '#3d70b3'; context.font = font(44); context.fillText(`梁位 ${formatPosition(frozen)}`, 1820, 922)
  context.textAlign = 'left'; context.strokeStyle = '#c9dcef'
  context.beginPath(); context.moveTo(1430, 972); context.lineTo(2220, 972); context.stroke()
  context.fillStyle = '#627e9e'; context.font = font(30, 500); context.fillText('三界香火', 1450, 1040)
  context.fillStyle = '#263f60'; context.font = font(48, 700)
  context.fillText(`${new Intl.NumberFormat('zh-CN').format(frozen.total_incense)} 炷`, 1450, 1118)
  context.fillStyle = '#fff'; context.fillRect(2020, 1000, 200, 200)
  context.drawImage(qr, 2030, 1010, 180, 180)
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG export failed')), 'image/png'))
}
