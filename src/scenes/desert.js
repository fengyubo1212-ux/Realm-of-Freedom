import * as THREE from 'three'
import { nextGroundOffset } from '../utils/ground.js'
import { createSkyTexture, createSandTexture, createRoadTexture } from '../utils/textures.js'

const FOG_COLOR = '#e7b97e'
const ROAD_SPEED = 9
const SAND_SPEED = 5.5 // 沙地滚动略慢,形成视差

// 沙漠公路场景。相机跟随飞机的主逻辑在 main.js 的动画循环里
export function createDesertScene({ skybox = null, groundTexture = null, lowPower = false } = {}) {
  const scene = new THREE.Scene()
  if (!lowPower) scene.fog = new THREE.Fog(FOG_COLOR, 45, 190)

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 700)
  camera.position.set(0, 3.5, 9)

  // --- 天空球 ---
  const skyTex = skybox ?? createSkyTexture()
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(400, 32, 16),
    new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, toneMapped: false })
  )
  sky.frustumCulled = false
  scene.add(sky)

  // --- 沙漠地面 ---
  const sandTex = groundTexture ?? createSandTexture()
  sandTex.wrapS = sandTex.wrapT = THREE.RepeatWrapping
  sandTex.repeat.set(30, 40)
  const sand = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 600),
    new THREE.MeshStandardMaterial({ map: sandTex, roughness: 1 })
  )
  sand.rotation.x = -Math.PI / 2
  sand.position.z = -150
  scene.add(sand)

  // --- 公路(带标线的程序化贴图) ---
  const roadTex = createRoadTexture()
  roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping
  roadTex.repeat.set(1, 10)
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 600),
    new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.9 })
  )
  road.rotation.x = -Math.PI / 2
  road.position.set(0, 0.02, -150)
  scene.add(road)

  // --- 光照:下午暖色沙漠阳光 ---
  const hemi = new THREE.HemisphereLight('#bcd3ff', '#b98a55', 0.55)
  scene.add(hemi)
  scene.add(new THREE.AmbientLight('#ffd9a8', 0.35))
  const sun = new THREE.DirectionalLight('#ffe0b0', 2.2)
  sun.position.set(-8, 12, 6)
  if (!lowPower) {
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    const sc = sun.shadow.camera
    sc.near = 1
    sc.far = 60
    sc.left = -14
    sc.right = 14
    sc.top = 14
    sc.bottom = -14
  }
  scene.add(sun)

  const state = { roadTex, sandTex, roadOffset: 0, sandOffset: 0 }

  function update(delta) {
    state.roadOffset = nextGroundOffset(state.roadOffset, ROAD_SPEED, delta, 1)
    roadTex.offset.y = state.roadOffset
    state.sandOffset = nextGroundOffset(state.sandOffset, SAND_SPEED, delta, 1)
    sandTex.offset.y = state.sandOffset
  }

  return { scene, camera, update }
}
