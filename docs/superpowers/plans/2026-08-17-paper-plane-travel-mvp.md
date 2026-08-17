# 纸飞机旅行 · MVP 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 跑通「NFC 触碰 → 打开网页 → 3D 纸飞机在沙漠公路滑翔、手指滑动控制飞行」的纯前端 MVP 闭环。

**Architecture:** Vite + Three.js 单页应用。`main.js` 读 URL 的 `?scene=` 参数 → 从 `config.js` 查配置 → `scenes/desert.js` 构建场景 → `components/paper-plane.js` 创建纸飞机 → `controls/touch-control.js` 绑触控。所有资源相对路径(`base: './'`),模块间只走公共方法(约束 A / 约束 B)。

**Tech Stack:** Vite、Three.js、GSAP、Vitest、TailwindCSS(仅入口样式)

---

## 测试约定

- 测试框架 Vitest,环境 `node`(不测渲染帧,只测纯逻辑与组件接口)
- 运行:`npm test`(单次)、`npm run test:watch`(监听)
- 顺序:先写测试 → 看到失败 → 写实现 → 看到通过 → commit

## 素材说明(MVP 占位)

MVP 阶段**没有真实全景图素材**,因此天空球默认用程序化渐变占位、公路用纯色路面。素材到位后只需改 `config.js` 两行(见 Task 10)。不要因此阻塞「NFC 链路验证」这个核心目标。

---

## 目录结构(最终形态)

```
/
├─ package.json
├─ vite.config.js
├─ vitest.config.js
├─ index.html
├─ .gitignore
└─ src/
   ├─ main.js
   ├─ style.css
   ├─ config.js
   ├─ utils/
   │  ├─ url.js
   │  ├─ url.test.js
   │  ├─ ground.js
   │  ├─ ground.test.js
   │  └─ audio.js
   ├─ scenes/
   │  └─ desert.js
   ├─ components/
   │  ├─ paper-plane.js
   │  └─ paper-plane.test.js
   ├─ controls/
   │  ├─ touch-control.js
   │  └─ touch-control.test.js
   └─ ui/
      └─ overlay.js
```

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `vitest.config.js`
- Create: `index.html`
- Create: `.gitignore`
- Create: `src/style.css`
- Create: `src/main.js`(占位)
- Create: `src/config.js`(占位)

- [ ] **Step 1: 初始化 git 仓库与 package.json**

Run:
```bash
cd "C:/Users/lianxiang/Desktop/123/纸飞机"
git init
```

Create `package.json`:

```json
{
  "name": "paper-plane-travel",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: 安装依赖**

Run:
```bash
npm install three gsap
npm install -D vite vitest tailwindcss @tailwindcss/vite
```

Expected: 安装成功,`package.json` 的 dependencies/devDependencies 出现对应条目。

- [ ] **Step 3: 写配置文件**

Create `vite.config.js`(约束 A:`base: './'` 保证相对路径):

```js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [tailwindcss()]
})
```

Create `vitest.config.js`:

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { environment: 'node' }
})
```

Create `.gitignore`:

```
node_modules
dist
.DS_Store
```

- [ ] **Step 4: 写 HTML 与样式**

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>纸飞机旅行</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

Create `src/style.css`:

```css
@import "tailwindcss";

html, body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  background: #000;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}
canvas { display: block; }

.overlay-loader {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a2e;
  color: #fff;
  font-size: 18px;
  letter-spacing: 2px;
  z-index: 10;
  transition: opacity 0.6s ease;
}
.overlay-loader.hidden {
  opacity: 0;
  pointer-events: none;
}

.overlay-music {
  position: fixed;
  right: 16px;
  bottom: 24px;
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  border: none;
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  font-size: 20px;
  z-index: 9;
  backdrop-filter: blur(4px);
}
```

Create `src/main.js`(占位,后续 Task 8 替换):

```js
console.log('paper-plane-travel boot')
```

Create `src/config.js`(占位,后续 Task 2 替换):

```js
export const scenes = {}
export const defaultSceneId = 'desert'
```

- [ ] **Step 5: 验证脚手架**

Run:
```bash
npm run build
```

Expected: 构建成功,`dist/index.html` 中资源引用为相对路径(含 `./assets/`),无绝对 `/assets/` 路径。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: init vite + three + gsap scaffold"
```

---

## Task 2: config.js 场景清单 + utils/url.js 路由解析

**Files:**
- Test: `src/utils/url.test.js`
- Create: `src/utils/url.js`
- Modify: `src/config.js`(替换占位)
- Test: `src/config.test.js`

- [ ] **Step 1: 写路由解析失败测试**

Create `src/utils/url.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { getSceneId } from './url.js'

describe('getSceneId', () => {
  const valid = ['desert']

  it('解析 scene 参数', () => {
    expect(getSceneId('?scene=desert', valid, 'desert')).toBe('desert')
  })

  it('无参数时回退默认', () => {
    expect(getSceneId('', valid, 'desert')).toBe('desert')
  })

  it('未知 scene 回退默认', () => {
    expect(getSceneId('?scene=moon', valid, 'desert')).toBe('desert')
  })

  it('scene 为空字符串时回退', () => {
    expect(getSceneId('?scene=', valid, 'desert')).toBe('desert')
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL,报 `Failed to resolve import "./url.js"` 或 `Cannot find module`。

- [ ] **Step 3: 实现路由解析**

Create `src/utils/url.js`:

```js
// 解析 URL 中的 scene 参数;未知或缺失时回退到默认场景
export function getSceneId(search, validIds, fallback) {
  const params = new URLSearchParams(search)
  const id = (params.get('scene') || '').trim()
  return id && validIds.includes(id) ? id : fallback
}
```

- [ ] **Step 4: 实现场景清单 config**

Modify `src/config.js`(整体替换):

```js
// 场景清单:新增场景只需在此追加一条
export const scenes = {
  desert: {
    id: 'desert',
    name: '沙漠公路',
    skybox: null,        // 素材到位后:import 全景 WebP 并替换
    groundTexture: null, // 素材到位后:import 路面贴图并替换
    accentColor: '#e8a33d',
    music: null          // 素材到位后:import 音频 url 并替换
  }
}

export const defaultSceneId = 'desert'
```

- [ ] **Step 5: 写 config 完整性测试**

Create `src/config.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { scenes, defaultSceneId } from './config.js'

describe('config', () => {
  it('默认场景存在于清单中', () => {
    expect(scenes[defaultSceneId]).toBeTruthy()
  })

  it('每个场景必填字段完整', () => {
    for (const scene of Object.values(scenes)) {
      expect(scene.id).toBeTruthy()
      expect(scene.name).toBeTruthy()
      expect(scene.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })
})
```

- [ ] **Step 6: 运行全部测试确认通过**

Run: `npm test`
Expected: PASS(2 个测试文件,5 个用例)。

- [ ] **Step 7: Commit**

```bash
git add src/utils/url.js src/utils/url.test.js src/config.js src/config.test.js
git commit -m "feat: scene config + url scene routing"
```

---

## Task 3: utils/ground.js 地面滚动纯函数

**Files:**
- Test: `src/utils/ground.test.js`
- Create: `src/utils/ground.js`

- [ ] **Step 1: 写失败测试**

Create `src/utils/ground.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { nextGroundOffset } from './ground.js'

describe('nextGroundOffset', () => {
  it('按速度推进 offset', () => {
    expect(nextGroundOffset(0, 6, 0.5, 1)).toBeCloseTo(0.3, 5)
  })

  it('超过范围时取模循环', () => {
    expect(nextGroundOffset(0.9, 6, 0.1, 1)).toBeCloseTo(0.0, 5)
  })

  it('delta 为 0 时不变', () => {
    expect(nextGroundOffset(0.4, 6, 0, 1)).toBeCloseTo(0.4, 5)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL,`Cannot find module './ground.js'`。

- [ ] **Step 3: 实现**

Create `src/utils/ground.js`:

```js
// 推进地面贴图 offset 并循环,模拟向前滑翔
export function nextGroundOffset(offset, speed, delta, range) {
  const next = offset + speed * delta
  return next >= range ? next % range : next
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add src/utils/ground.js src/utils/ground.test.js
git commit -m "feat: ground scroll offset helper"
```

---

## Task 4: components/paper-plane.js 纸飞机抽象类

**Files:**
- Test: `src/components/paper-plane.test.js`
- Create: `src/components/paper-plane.js`

- [ ] **Step 1: 写失败测试**

Create `src/components/paper-plane.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { Scene } from 'three'
import { AirPlane } from './paper-plane.js'

function makePlane() {
  const scene = new Scene()
  const plane = new AirPlane(scene)
  return { plane, scene }
}

describe('AirPlane', () => {
  it('创建后加入场景', () => {
    const { plane, scene } = makePlane()
    expect(scene.children).toContain(plane.getMesh())
  })

  it('setPosition 更新坐标', () => {
    const { plane } = makePlane()
    plane.setPosition(1, 2, 3)
    expect(plane.getMesh().position.toArray()).toEqual([1, 2, 3])
  })

  it('setTilt 更新俯仰角', () => {
    const { plane } = makePlane()
    plane.setTilt(Math.PI / 6)
    expect(plane.getMesh().rotation.x).toBeCloseTo(Math.PI / 6, 5)
  })

  it('update 不改变飞机位置', () => {
    const { plane } = makePlane()
    plane.setPosition(0, 1, 0)
    plane.update(1.0)
    expect(plane.getMesh().position.y).toBe(1)
  })

  it('update 按时间驱动机翼摆动', () => {
    const { plane } = makePlane()
    const wing = plane.getMesh().children.find((c) => c.userData.part === 'wing-left')
    expect(wing).toBeTruthy()
    plane.update(0) // sin(0)=0 → 翼角为基准角
    expect(wing.rotation.x).toBeCloseTo(-Math.PI / 2, 5)
    plane.update(Math.PI / 12) // 6*t = PI/2 → sin=1 → 摆幅 WING_FLAP=0.08
    expect(wing.rotation.x).toBeCloseTo(-Math.PI / 2 + 0.08, 5)
  })

  it('playWingShake 不抛错', () => {
    const { plane } = makePlane()
    expect(() => plane.playWingShake()).not.toThrow()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL,`Cannot find module './paper-plane.js'`。

- [ ] **Step 3: 实现几何体拼装纸飞机**

Create `src/components/paper-plane.js`:

```js
import { Group, BoxGeometry, PlaneGeometry, MeshStandardMaterial, Mesh } from 'three'

const PAPER_COLOR = '#f5f0e6'
const WING_SPEED = 6
const WING_FLAP = 0.08

// 统一接口:内部实现(几何体 / GLB)可无缝替换,调用方不受影响
export class AirPlane {
  constructor(scene) {
    this.root = new Group()
    this.root.userData.part = 'plane-root'
    this.material = new MeshStandardMaterial({ color: PAPER_COLOR, side: 2 })
    this.buildBody()
    this.buildWings()
    scene.add(this.root)
  }

  buildBody() {
    const body = new Mesh(new BoxGeometry(0.1, 0.06, 0.4), this.material)
    body.userData.part = 'body'
    this.root.add(body)
  }

  buildWings() {
    const geo = new PlaneGeometry(0.55, 0.16)
    const left = new Mesh(geo, this.material)
    left.position.set(-0.3, 0, 0)
    left.userData.part = 'wing-left'
    const right = new Mesh(geo, this.material)
    right.position.set(0.3, 0, 0)
    right.userData.part = 'wing-right'
    this.root.add(left, right)
    this.wings = { left, right }
  }

  setPosition(x, y, z) {
    this.root.position.set(x, y, z)
  }

  setTilt(angle) {
    this.root.rotation.x = angle
  }

  playWingShake() {
    // MVP 由 update() 持续驱动,此处预留升级接口
  }

  getMesh() {
    return this.root
  }

  update(time) {
    if (!this.wings) return
    const flap = Math.sin(time * WING_SPEED) * WING_FLAP
    this.wings.left.rotation.x = -Math.PI / 2 + flap
    this.wings.right.rotation.x = -Math.PI / 2 - flap
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add src/components/paper-plane.js src/components/paper-plane.test.js
git commit -m "feat: AirPlane abstract class with box-plane impl"
```

---

## Task 5: controls/touch-control.js 触控映射纯函数

**Files:**
- Test: `src/controls/touch-control.test.js`
- Create: `src/controls/touch-control.js`

- [ ] **Step 1: 写失败测试**

Create `src/controls/touch-control.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { clamp, mapDrag } from './touch-control.js'

describe('clamp', () => {
  it('限制在上下界内', () => {
    expect(clamp(5, 0, 3)).toBe(3)
    expect(clamp(-5, 0, 3)).toBe(0)
    expect(clamp(2, 0, 3)).toBe(2)
  })
})

describe('mapDrag', () => {
  it('上滑(dy<0)增加高度', () => {
    expect(mapDrag(-20, 0.05).height).toBeCloseTo(1, 5)
  })

  it('下滑(dy>0)降低高度', () => {
    expect(mapDrag(20, 0.05).height).toBeCloseTo(-1, 5)
  })

  it('倾斜随高度增加', () => {
    expect(mapDrag(-40, 0.05).tilt).toBeGreaterThan(0)
  })

  it('倾斜有上限', () => {
    const { tilt } = mapDrag(-5000, 0.05)
    expect(tilt).toBeLessThanOrEqual(0.5)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL,`Cannot find module './touch-control.js'`。

- [ ] **Step 3: 实现纯函数 + TouchControl 类**

Create `src/controls/touch-control.js`:

```js
export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

// 滑动位移 → 高度/倾斜目标。dy 为两次 touchmove 的纵向增量(上滑为负)
export function mapDrag(dy, sensitivity = 0.05) {
  const height = -dy * sensitivity
  const tilt = clamp(height * 0.12, -0.5, 0.5)
  return { height, tilt }
}

// 绑定单指滑动(用 Pointer Events,鼠标/触摸/笔通用);onMove(dy) 位移增量回调
// 页面滚动的阻止交给 CSS `touch-action: none`(见 style.css),这里不用 preventDefault
export class TouchControl {
  constructor(element, { onMove } = {}) {
    this.element = element
    this.onMove = onMove
    this.lastY = null
    this._down = this._onDown.bind(this)
    this._move = this._onMove.bind(this)
    this._up = this._onUp.bind(this)
    element.addEventListener('pointerdown', this._down)
    element.addEventListener('pointermove', this._move)
    element.addEventListener('pointerup', this._up)
    element.addEventListener('pointercancel', this._up)
  }

  _onDown(e) {
    if (this.lastY !== null) return // 已有指针按住,忽略多点
    this.lastY = e.clientY
    this.element.setPointerCapture?.(e.pointerId)
  }

  _onMove(e) {
    if (this.lastY === null) return
    const dy = e.clientY - this.lastY
    this.lastY = e.clientY
    if (this.onMove) this.onMove(dy)
  }

  _onUp() {
    this.lastY = null
  }

  destroy() {
    this.element.removeEventListener('pointerdown', this._down)
    this.element.removeEventListener('pointermove', this._move)
    this.element.removeEventListener('pointerup', this._up)
    this.element.removeEventListener('pointercancel', this._up)
  }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add src/controls/touch-control.js src/controls/touch-control.test.js
git commit -m "feat: touch drag mapping + TouchControl"
```

---

## Task 6: scenes/desert.js 沙漠公路场景

**Files:**
- Create: `src/scenes/desert.js`

- [ ] **Step 1: 实现场景加载器**

Create `src/scenes/desert.js`:

```js
import * as THREE from 'three'
import { nextGroundOffset } from '../utils/ground.js'

const SKY_TOP = '#3d7ec9'
const SKY_HORIZON = '#f5d9a8'
const GROUND_COLOR = '#d9a066'
const ROAD_COLOR = '#4a4038'
const ROAD_SPEED = 6

export function createDesertScene({ skybox = null, groundTexture = null } = {}) {
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(SKY_HORIZON, 60, 160)

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 500)
  camera.position.set(0, 2.2, 8)

  scene.add(skybox ? createSkyMesh(skybox) : createGradientSkyMesh())

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 400),
    new THREE.MeshStandardMaterial({ color: GROUND_COLOR })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.z = -100
  scene.add(ground)

  const roadMaterial = groundTexture
    ? new THREE.MeshStandardMaterial({ map: groundTexture })
    : new THREE.MeshStandardMaterial({ color: ROAD_COLOR })
  if (groundTexture) {
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping
    groundTexture.repeat.set(1, 10)
  }
  const road = new THREE.Mesh(new THREE.PlaneGeometry(4, 400), roadMaterial)
  road.rotation.x = -Math.PI / 2
  road.position.set(0, 0.01, -80)
  scene.add(road)

  scene.add(new THREE.AmbientLight('#ffffff', 0.9))
  const sun = new THREE.DirectionalLight('#fff2cc', 1.4)
  sun.position.set(5, 10, 3)
  scene.add(sun)

  const state = { roadTexture: groundTexture, offset: 0 }

  function update(delta) {
    if (!state.roadTexture) return
    state.offset = nextGroundOffset(state.offset, ROAD_SPEED, delta, 1)
    state.roadTexture.offset.y = state.offset
  }

  return { scene, camera, update }
}

function createSkyMesh(texture) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(300, 32, 16),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide })
  )
}

// 素材未就绪时的渐变占位天空(浏览器环境运行)
function createGradientSkyMesh() {
  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = 4
  const ctx = canvas.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, 0, 4)
  grad.addColorStop(0, SKY_TOP)
  grad.addColorStop(1, SKY_HORIZON)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 4, 4)
  const texture = new THREE.CanvasTexture(canvas)
  return createSkyMesh(texture)
}
```

- [ ] **Step 2: 确认测试仍通过**

Run: `npm test`
Expected: PASS(desert.js 未引入新测试,但需确认没有破坏既有用例)。

- [ ] **Step 3: Commit**

```bash
git add src/scenes/desert.js
git commit -m "feat: desert scene (sky sphere + scrolling road)"
```

---

## Task 7: ui/overlay.js 加载页与音乐按钮 + utils/audio.js 音乐控制器

**Files:**
- Create: `src/ui/overlay.js`
- Create: `src/utils/audio.js`

- [ ] **Step 1: 实现 Overlay**

Create `src/ui/overlay.js`:

```js
// 加载页 + 音乐开关按钮
export class Overlay {
  constructor({ musicEnabled = false, onToggleMusic = null } = {}) {
    this.loader = document.createElement('div')
    this.loader.className = 'overlay-loader'
    this.loader.textContent = '正在起飞…'
    document.body.appendChild(this.loader)

    if (musicEnabled && onToggleMusic) {
      this.musicBtn = document.createElement('button')
      this.musicBtn.className = 'overlay-music'
      this.musicBtn.textContent = '♪'
      this.musicBtn.addEventListener('click', onToggleMusic)
      document.body.appendChild(this.musicBtn)
    }
  }

  hide() {
    this.loader.classList.add('hidden')
  }
}
```

- [ ] **Step 2: 实现 MusicController**

Create `src/utils/audio.js`:

```js
// 背景音乐;src 为空时所有操作静默,不报错
export class MusicController {
  constructor(src) {
    this.audio = src ? new Audio(src) : null
    if (this.audio) {
      this.audio.loop = true
      this.audio.preload = 'auto'
    }
    this.playing = false
  }

  toggle() {
    if (!this.audio) return false
    if (this.playing) {
      this.audio.pause()
    } else {
      this.audio.play().catch(() => {})
    }
    this.playing = !this.playing
    return this.playing
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/ui/overlay.js src/utils/audio.js
git commit -m "feat: loading overlay + music controller"
```

---

## Task 8: main.js 串联所有模块

**Files:**
- Modify: `src/main.js`(替换占位)

- [ ] **Step 1: 实现入口**

Modify `src/main.js`(整体替换):

```js
import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { scenes, defaultSceneId } from './config.js'
import { getSceneId } from './utils/url.js'
import { createDesertScene } from './scenes/desert.js'
import { AirPlane } from './components/paper-plane.js'
import { TouchControl, mapDrag, clamp } from './controls/touch-control.js'
import { Overlay } from './ui/overlay.js'
import { MusicController } from './utils/audio.js'

const sceneId = getSceneId(window.location.search, Object.keys(scenes), defaultSceneId)
const sceneConfig = scenes[sceneId]

const { scene, camera, update: updateScene } = createDesertScene({
  skybox: sceneConfig.skybox,
  groundTexture: sceneConfig.groundTexture
})

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

const plane = new AirPlane(scene)
plane.setPosition(0, 1.5, 0)

// 触控目标,经 GSAP 平滑过渡
const smooth = { height: 1.5, tilt: 0 }
const controller = new TouchControl(window, {
  onMove: (dy) => {
    const { height, tilt } = mapDrag(dy, 0.05)
    const targetHeight = clamp(1.5 + height, 0.5, 8)
    const targetTilt = clamp(tilt, -0.5, 0.5)
    gsap.to(smooth, { height: targetHeight, tilt: targetTilt, duration: 0.3, overwrite: 'auto' })
  }
})

const music = new MusicController(sceneConfig.music)
const overlay = new Overlay({
  musicEnabled: !!sceneConfig.music,
  onToggleMusic: () => music.toggle()
})

function resize() {
  const w = window.innerWidth
  const h = window.innerHeight
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}
window.addEventListener('resize', resize)
resize()

overlay.hide() // MVP 无异步资源,直接隐藏;接入 LoadingManager 后再走进度

const clock = new THREE.Clock()
function animate() {
  const dt = Math.min(clock.getDelta(), 0.05)
  const t = clock.elapsedTime
  plane.update(t)
  plane.setPosition(0, smooth.height, 0)
  plane.setTilt(smooth.tilt)
  updateScene(dt)
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()

document.addEventListener('visibilitychange', () => {
  if (document.hidden) clock.stop()
  else clock.start()
})
```

- [ ] **Step 2: 本地联调验证**

Run: `npm run dev`

然后在浏览器(建议开发者工具切到手机模拟)打开 `http://localhost:5173/?scene=desert`,Expected:

- 页面出现天空渐变 + 公路 + 纸飞机,纸飞机机翼轻微摆动
- 鼠标/触摸上下拖动,飞机高度与倾斜平滑响应(桌面模拟用鼠标按住拖动)
- `?scene=unknown` 正常回退,不白屏
- 控制台无报错

- [ ] **Step 3: 构建验证相对路径**

Run:
```bash
npm run build
npm run preview
```

打开 `http://localhost:4173`,Expected: 功能与 dev 一致;`dist/index.html` 中资源路径为 `./assets/...`(相对路径,满足约束 A)。

- [ ] **Step 4: Commit**

```bash
git add src/main.js
git commit -m "feat: wire up entry with scene/plane/touch loop"
```

---

## Task 9: MVP 验收

**Files:**
- None(手动验收清单)

- [ ] **Step 1: 过验收清单**

对照 spec 第 10 节:

- [ ] 手机(或模拟器)打开链接即进入沙漠公路场景,纸飞机自动滑翔
- [ ] 手指上下滑动,飞机高度与倾斜平滑响应
- [ ] `?scene=unknown` 正常回退 desert
- [ ] 加载页显示后淡出
- [ ] 全流程无服务端请求(`base: './'` 产物任意子路径可访问)

- [ ] **Step 2: 全量测试收尾**

Run: `npm test`
Expected: 全部 PASS。

- [ ] **Step 3: 部署(可选,需 GitHub/Vercel 账号)**

推送仓库到 GitHub 后,用 Vercel 导入自动部署(或按原计划文档的方案 A GitHub Actions + Pages)。由于 `base: './'`,部署到任意子路径都不会 404。部署后真机打开 HTTPS 链接验证。

- [ ] **Step 4: 最终 Commit(如有遗留改动)**

```bash
git add -A
git commit -m "chore: mvp acceptance"
```

---

## Task 10: 素材替换指引(备忘,非本次执行)

真实全景图/路面/音频素材到位后,只需修改 `src/config.js`:

```js
import desertSky from './assets/textures/desert-sky.webp'
import desertRoad from './assets/textures/desert-road.webp'
import desertMusic from './assets/audio/desert.mp3'

export const scenes = {
  desert: {
    id: 'desert',
    name: '沙漠公路',
    skybox: desertSky,
    groundTexture: desertRoad,
    accentColor: '#e8a33d',
    music: desertMusic
  }
}
```

约束提醒:
- 资源全部经 Vite `import`,保持相对路径(约束 A)
- 全景图转 WebP,≤2048×1024,防低端机卡顿
- 背景音乐为 MP3 时注意文件体积,可考虑压缩
