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

// 低端设备降级:关闭雾/阴影/后处理,保证帧率
const lowPower =
  window.devicePixelRatio >= 3 ||
  (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4)

const { scene, camera, update: updateScene } = createDesertScene({
  skybox: sceneConfig.skybox,
  groundTexture: sceneConfig.groundTexture,
  lowPower
})

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.05
renderer.shadowMap.enabled = !lowPower
renderer.shadowMap.type = THREE.PCFShadowMap
document.body.appendChild(renderer.domElement)

const plane = new AirPlane(scene)
plane.setPosition(0, 1.5, 0)
plane.getMesh().scale.setScalar(2.2)

// 触控目标,经 GSAP 平滑过渡(保留惯性,不直接跳变)
const smooth = { height: 1.5, tilt: 0 }
const controller = new TouchControl(window, {
  onMove: (dy) => {
    const { height, tilt } = mapDrag(dy, 0.05)
    const targetHeight = clamp(1.5 + height, 0.5, 8)
    const targetTilt = clamp(tilt, -0.5, 0.5)
    gsap.to(smooth, { height: targetHeight, tilt: targetTilt, duration: 0.35, ease: 'power2.out', overwrite: 'auto' })
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

overlay.hide()

const timer = new THREE.Timer()
function animate() {
  timer.update()
  const dt = Math.min(timer.getDelta(), 0.05)
  const t = timer.getElapsed()

  // 纸飞机:轻微上下漂浮 + 机翼摆动 + 随操控倾斜
  const floatY = smooth.height + Math.sin(t * 1.6) * 0.07
  plane.update(t)
  plane.setPosition(0, floatY, 0)
  plane.setTilt(smooth.tilt + Math.sin(t * 1.1) * 0.02)

  updateScene(dt)

  // 相机:跟随飞机后上方,略向下看,带轻微浮动与微摆
  const camTargetY = floatY + 2.1
  const camTargetX = Math.sin(t * 0.4) * 0.5
  camera.position.x += (camTargetX - camera.position.x) * 0.05
  camera.position.y += (camTargetY - camera.position.y) * 0.05
  camera.position.z = 8.5 + Math.sin(t * 0.3) * 0.3
  camera.lookAt(0, floatY - 0.5, -45)

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()
