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
