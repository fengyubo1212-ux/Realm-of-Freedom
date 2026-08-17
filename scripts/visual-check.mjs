// 视觉验证脚本:打开页面,在每个 rAF 帧内(render 后、缓冲被清空前)采样画面颜色,模拟上滑触摸,保存截图
// 用法:node scripts/visual-check.mjs [url] [输出路径]
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const url = process.argv[2] || 'http://localhost:5173/?scene=desert'
const out = process.argv[3] || 'artifacts/visual-check.png'

fs.mkdirSync('artifacts', { recursive: true })

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })

const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()) })
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message))

// 包装 rAF:在应用 render 之后的同一任务里读像素。WebGL 默认 preserveDrawingBuffer=false,
// 帧交换后缓冲被清空,所以必须在此刻读。
await page.evaluateOnNewDocument(() => {
  window.__samples = null
  window.__frameCount = 0
  const orig = window.requestAnimationFrame.bind(window)
  window.requestAnimationFrame = (cb) => orig((t) => {
    try { cb(t) } catch (e) { window.__rafErr = e.message }
    window.__frameCount++
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return
    const w = canvas.width
    const h = canvas.height
    const read = (fx, fy) => {
      const p = new Uint8Array(4)
      gl.readPixels(Math.floor(w * fx), Math.floor(h * fy), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p)
      return `${p[0]},${p[1]},${p[2]}`
    }
    // 注意 readPixels 原点在左下;fx/fy 已按底部原点取
    window.__samples = {
      top: read(0.5, 1 - 0.06),
      horizon: read(0.5, 1 - 0.4),
      ground: read(0.5, 1 - 0.88),
      leftRoad: read(0.45, 1 - 0.8),
      rightRoad: read(0.55, 1 - 0.8)
    }
  })
})

await page.goto(url, { waitUntil: 'load', timeout: 30000 })
await new Promise((r) => setTimeout(r, 2500))

const before = await page.evaluate(() => window.__samples)

await page.screenshot({ path: out })

// 模拟上滑触摸(触发 pointer 事件),验证飞机高度响应且无报错
await page.mouse.move(195, 620)
await page.mouse.down()
await page.mouse.move(195, 380, { steps: 12 })
await new Promise((r) => setTimeout(r, 800))
const after = await page.evaluate(() => window.__samples)
await page.mouse.up()
await page.screenshot({ path: out.replace('.png', '-after.png') })

const stats = await page.evaluate(() => ({
  frameCount: window.__frameCount,
  rafErr: window.__rafErr || null
}))

console.log('SAMPLE_BEFORE:', JSON.stringify(before))
console.log('SAMPLE_AFTER_UP_DRAG:', JSON.stringify(after))
console.log('FRAMES:', stats.frameCount, 'RAF_ERR:', stats.rafErr)
console.log('ERRORS:', errors.length ? errors.join(' | ') : '(none)')
await browser.close()
