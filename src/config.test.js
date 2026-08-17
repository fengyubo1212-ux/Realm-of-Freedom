import { describe, it, expect } from 'vitest'
import { scenes, defaultSceneId } from './config.js'

describe('config', () => {
  it('默认场景存在于清单中', () => {
    expect(scenes[defaultSceneId]).toBeTruthy()
  })

  it('每个场景必填字段完整', () => {
    for (const scene of Object.values(scenes)) {
      expect(scene.id).toBeTruthy()
      expect(scene.name).toBeTruthy()
      expect(scene.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })
})
