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
