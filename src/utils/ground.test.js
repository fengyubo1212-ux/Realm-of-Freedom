import { describe, it, expect } from 'vitest'
import { nextGroundOffset } from './ground.js'

describe('nextGroundOffset', () => {
  it('按速度推进 offset(未超界)', () => {
    expect(nextGroundOffset(0.2, 1, 0.1, 1)).toBeCloseTo(0.3, 5)
  })

  it('超过范围时取模循环', () => {
    expect(nextGroundOffset(0.9, 1, 0.2, 1)).toBeCloseTo(0.1, 5)
  })

  it('delta 为 0 时不变', () => {
    expect(nextGroundOffset(0.4, 6, 0, 1)).toBeCloseTo(0.4, 5)
  })
})
