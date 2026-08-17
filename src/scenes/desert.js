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
