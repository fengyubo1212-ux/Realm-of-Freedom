import * as THREE from 'three'

// 程序化生成沙漠场景所需贴图(素材到位后可整体替换为真实图)

// 天空球 equirectangular 贴图:上深下暖 + 淡云
export function createSkyTexture() {
  const w = 512
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#2b4a6f')
  grad.addColorStop(0.5, '#6a93c4')
  grad.addColorStop(0.78, '#cfa06b')
  grad.addColorStop(1, '#f0c98e')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // 淡云(上半部)
  ctx.globalAlpha = 0.3
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 7; i++) {
    const cx = Math.random() * w
    const cy = Math.random() * h * 0.5
    const r = 18 + Math.random() * 26
    for (let j = 0; j < 4; j++) {
      const ox = (Math.random() - 0.5) * r * 1.6
      const oy = (Math.random() - 0.5) * r * 0.3
      ctx.beginPath()
      ctx.ellipse(cx + ox, cy + oy, r * (0.6 + Math.random() * 0.3), r * 0.24, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// 沙漠地面贴图:基色 + 沙丘色斑 + 颗粒噪声
export function createSandTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#c9995f'
  ctx.fillRect(0, 0, size, size)

  // 沙丘明暗斑块
  for (let i = 0; i < 46; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 12 + Math.random() * 46
    ctx.globalAlpha = 0.05 + Math.random() * 0.09
    ctx.fillStyle = Math.random() > 0.5 ? '#e8c693' : '#a97c4b'
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * (0.35 + Math.random() * 0.5), Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  // 细颗粒噪声
  const img = ctx.getImageData(0, 0, size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 16
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
  ctx.globalAlpha = 1

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

// 公路贴图:沥青基色 + 颗粒 + 中央虚线 + 两侧边缘线
// 横向 w 对应路面宽度,纵向 h 沿公路延伸(虚线沿纵向分布)
export function createRoadTexture() {
  const w = 128
  const h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  const grad = ctx.createLinearGradient(0, 0, w, 0)
  grad.addColorStop(0, '#55493f')
  grad.addColorStop(0.5, '#675a4d')
  grad.addColorStop(1, '#51453b')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // 沥青颗粒
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 24
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)

  const LINE = '#e9dfc6'
  // 两侧边缘线(近边缘内侧加暗磨边增强层次)
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(5, 0, 2, h)
  ctx.fillRect(w - 7, 0, 2, h)
  ctx.fillStyle = LINE
  ctx.fillRect(0, 0, 4, h)
  ctx.fillRect(w - 4, 0, 4, h)

  // 中央虚线
  ctx.fillStyle = LINE
  const dashLen = 60
  const gap = 90
  for (let y = 0; y < h; y += dashLen + gap) {
    ctx.fillRect(w / 2 - 2, y, 4, dashLen)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}
