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

const timer = new THREE.Timer()
function animate() {
  timer.update()
  const dt = Math.min(timer.getDelta(), 0.05) // 后台恢复时防止跳变
  const t = timer.getElapsed()
  plane.update(t)
  plane.setPosition(0, smooth.height, 0)
  plane.setTilt(smooth.tilt)
  updateScene(dt)
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()
