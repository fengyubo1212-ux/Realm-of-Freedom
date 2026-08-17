import * as THREE from 'three'
import { nextGroundOffset } from '../utils/ground.js'
import { createSkyTexture, createSandTexture, createRoadTexture } from '../utils/textures.js'
import { createCactus, createShrub, createRock, createDuneMound } from '../utils/props.js'

const FOG_COLOR = '#e7b97e'
const ROAD_SPEED = 9
const SAND_SPEED = 5.5 // 沙地滚动略慢,形成视差
const RIDGE_COLOR = '#d9a76e' // 远山脊色,介于沙地与雾之间,经雾模糊成剪影

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

  road.receiveShadow = true
  sand.receiveShadow = true

  const state = { roadTex, sandTex, roadOffset: 0, sandOffset: 0 }
  const parallax = createParallax(scene, sandTex, lowPower)

  function update(delta) {
    state.roadOffset = nextGroundOffset(state.roadOffset, ROAD_SPEED, delta, 1)
    roadTex.offset.y = state.roadOffset
    state.sandOffset = nextGroundOffset(state.sandOffset, SAND_SPEED, delta, 1)
    sandTex.offset.y = state.sandOffset
    parallax.update(delta)
  }

  return { scene, camera, update }
}

// 视差层:近处道具(快)沿路两侧滚动,中景沙丘(中速)陪衬,远山脊(慢/静态)作雾中剪影。
// 公路 9 > 道具 8-10 > 沙地纹理 5.5 ≈ 沙丘 5 > 远山脊 0,构成由近到远的深度层次
function createParallax(scene, sandTex, lowPower) {
  const KILL_Z = 12 // 越过相机后回收
  const SPAWN_Z = -95
  const ridgeMat = new THREE.MeshStandardMaterial({ color: RIDGE_COLOR, roughness: 1 })
  const duneMat = new THREE.MeshStandardMaterial({ map: sandTex, roughness: 1 })
  const props = []

  function placeAlong(mesh, spawnZ) {
    const side = Math.random() > 0.5 ? 1 : -1
    mesh.position.x = side * (5.5 + Math.random() * 9)
    mesh.position.z = spawnZ
    mesh.rotation.y = Math.random() * Math.PI * 2
    return side
  }

  const KIND_BUILDERS = [createCactus, createShrub, createRock]
  const propCount = lowPower ? 8 : 14
  for (let i = 0; i < propCount; i++) {
    const mesh = KIND_BUILDERS[i % KIND_BUILDERS.length]()
    const z = -12 - Math.random() * 80
    placeAlong(mesh, z)
    const s = 0.75 + Math.random() * 0.6
    mesh.scale.setScalar(s)
    scene.add(mesh)
    props.push({ mesh, speed: 7.5 + Math.random() * 2.5 })
  }

  // 中景沙丘:宽大、平缓,速度接近沙地纹理
  const dunes = []
  const duneCount = lowPower ? 4 : 8
  for (let i = 0; i < duneCount; i++) {
    const m = createDuneMound(duneMat)
    placeAlong(m, -20 - Math.random() * 75)
    m.scale.setScalar(3 + Math.random() * 3)
    scene.add(m)
    dunes.push({ mesh: m, speed: 4.8 + Math.random() * 1 })
  }

  // 远山脊:横贯地平线的静置剪影,置于雾深处
  const ridge = []
  for (let i = 0; i < 7; i++) {
    const m = createDuneMound(ridgeMat)
    const spread = 30 + Math.random() * 26
    m.position.x = (i - 3) * (spread / 4) + (Math.random() - 0.5) * 8
    m.position.z = -150 - Math.random() * 28
    m.scale.setScalar(8 + Math.random() * 9)
    scene.add(m)
    ridge.push(m)
  }

  function update(delta) {
    for (const p of props) {
      p.mesh.position.z += p.speed * delta
      if (p.mesh.position.z > KILL_Z) {
        placeAlong(p.mesh, SPAWN_Z)
        const s = 0.75 + Math.random() * 0.6
        p.mesh.scale.setScalar(s)
      }
    }
    for (const d of dunes) {
      d.mesh.position.z += d.speed * delta
      if (d.mesh.position.z > KILL_Z) {
        placeAlong(d.mesh, SPAWN_Z)
        d.mesh.scale.setScalar(3 + Math.random() * 3)
      }
    }
  }

  return { update }
}
