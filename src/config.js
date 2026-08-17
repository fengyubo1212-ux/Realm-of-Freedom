// 场景清单:新增场景只需在此追加一条
export const scenes = {
  desert: {
    id: 'desert',
    name: '沙漠公路',
    skybox: null,        // 素材到位后:import 全景 WebP 并替换
    groundTexture: null, // 素材到位后:import 路面贴图并替换
    accentColor: '#e8a33d',
    music: null          // 素材到位后:import 音频 url 并替换
  }
}

export const defaultSceneId = 'desert'
