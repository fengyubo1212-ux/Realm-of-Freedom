import {
  Group,
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshStandardMaterial,
  LineSegments,
  LineBasicMaterial
} from 'three'
import { createPaperTexture } from '../utils/textures.js'

const HALF_SPAN = 0.3 // 半翼展(x 范围 -0.3..0.3)
const LEN = 0.55 // 机长(nose z=-0.3 .. tail z=+0.25)
const WING_FLAP = 0.09
const WING_SPEED = 5
const PAPER_COLOR = '#f6f0e3'

// 测试环境(Node,无 document)退化为纯色纸张
const hasDOM = typeof document !== 'undefined'

// 飞镖式纸飞机的三个关键顶点(共享中心折痕,保证 flap 绕 x 轴旋转时机头/机尾不动)
const NOSE = [0, 0, -0.3]
const TAIL = [0, 0, 0.25]
const WING_TIP_L = [-HALF_SPAN, -0.03, 0.05]
const WING_TIP_R = [HALF_SPAN, -0.03, 0.05]

function triangle(position, uv, material) {
  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(position.flat(), 3))
  geo.setAttribute('uv', new Float32BufferAttribute(uv.flat(), 2))
  geo.computeVertexNormals()
  return new Mesh(geo, material)
}

// 把世界坐标投影到"纸张平面"(XZ 面),让中心折痕纹理正好落在 x=0 处
function paperUV(p) {
  return [(p[0] + HALF_SPAN) / (HALF_SPAN * 2), (p[2] + 0.3) / LEN]
}

// 统一接口:内部实现(几何体 / GLB)可无缝替换,调用方不受影响
export class AirPlane {
  constructor(scene) {
    this.root = new Group()
    this.root.userData.part = 'plane-root'
    this.material = hasDOM
      ? new MeshStandardMaterial({
          map: createPaperTexture(),
          roughness: 0.85,
          side: 2, // DoubleSide,纸张很薄
          metalness: 0
        })
      : new MeshStandardMaterial({ color: PAPER_COLOR, side: 2 })
    this.time = 0
    this.shakeUntil = -1

    // 左右机翼独立成组,绕中心折痕(x 轴)轻摆
    this.flapLeft = new Group()
    this.flapRight = new Group()
    this.flapLeft.userData.part = 'wing-left'
    this.flapRight.userData.part = 'wing-right'

    this.flapLeft.add(this.makeWing(WING_TIP_L))
    this.flapRight.add(this.makeWing(WING_TIP_R))
    this.root.add(this.flapLeft, this.flapRight)

    this.root.add(this.makeTailFlaps())
    this.root.add(this.makeCreases())
    scene.add(this.root)
  }

  // 单侧主翼:机头→翼尖→机尾
  makeWing(tip) {
    const tri = triangle([NOSE, tip, TAIL], [paperUV(NOSE), paperUV(tip), paperUV(TAIL)], this.material)
    tri.userData.part = 'wing-surface'
    return tri
  }

  // 尾部上翻襟翼(纸飞机标志性翘尾)
  makeTailFlaps() {
    const g = new Group()
    g.userData.part = 'tail-flaps'
    const l = [0, 0, 0.13]
    const r = [0, 0, 0.13]
    const apex = [-0.03, 0.055, 0.25]
    const apexR = [0.03, 0.055, 0.25]
    g.add(triangle([[-0.1, 0, 0.13], l, apex], [paperUV([-0.1, 0, 0.13]), paperUV(l), paperUV(apex)], this.material))
    g.add(triangle([[0.1, 0, 0.13], r, apexR], [paperUV([0.1, 0, 0.13]), paperUV(r), paperUV(apexR)], this.material))
    return g
  }

  // 折痕线:中心脊 + 两侧主翼折叠棱
  makeCreases() {
    const pts = [
      0, 0, -0.3, 0, 0, 0.25, // 中心脊
      0, 0, -0.3, ...WING_TIP_L, // 左翼前缘折痕
      0, 0, -0.3, ...WING_TIP_R // 右翼前缘折痕
    ]
    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(pts, 3))
    const line = new LineSegments(geo, new LineBasicMaterial({
      color: '#c2b59c',
      transparent: true,
      opacity: 0.55
    }))
    line.userData.part = 'creases'
    return line
  }

  setPosition(x, y, z) {
    this.root.position.set(x, y, z)
  }

  setTilt(angle) {
    this.root.rotation.x = angle
  }

  // 触发一次 0.6s 的机翼快速抖动(接入掉落/撞击等事件用)
  playWingShake() {
    this.shakeUntil = this.time + 0.6
  }

  getMesh() {
    return this.root
  }

  update(time) {
    this.time = time
    const flap = Math.sin(time * WING_SPEED) * WING_FLAP
    const shaking = time < this.shakeUntil
    const shake = shaking ? Math.sin(time * 42) * Math.max(0, this.shakeUntil - time) * 0.02 : 0
    this.flapLeft.rotation.x = flap + shake
    this.flapRight.rotation.x = -flap + shake
  }
}
