import { describe, it, expect } from 'vitest'
import { getSceneId } from './url.js'

describe('getSceneId', () => {
  const valid = ['desert']

  it('解析 scene 参数', () => {
    expect(getSceneId('?scene=desert', valid, 'desert')).toBe('desert')
  })

  it('无参数时回退默认', () => {
    expect(getSceneId('', valid, 'desert')).toBe('desert')
  })

  it('未知 scene 回退默认', () => {
    expect(getSceneId('?scene=moon', valid, 'desert')).toBe('desert')
  })

  it('scene 为空字符串时回退', () => {
    expect(getSceneId('?scene=', valid, 'desert')).toBe('desert')
  })
})
