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
    expect(wing.rotation.x).toBeCloseTo(0, 5)
    plane.update(Math.PI / 10) // 5*t = PI/2 → sin=1 → 摆幅 WING_FLAP=0.09
    expect(wing.rotation.x).toBeCloseTo(0.09, 5)
  })

  it('playWingShake 不抛错', () => {
    const { plane } = makePlane()
    expect(() => plane.playWingShake()).not.toThrow()
  })
})
