// 解析 URL 中的 scene 参数;未知或缺失时回退到默认场景
export function getSceneId(search, validIds, fallback) {
  const params = new URLSearchParams(search)
  const id = (params.get('scene') || '').trim()
  return id && validIds.includes(id) ? id : fallback
}
