// 推进地面贴图 offset 并循环,模拟向前滑翔
export function nextGroundOffset(offset, speed, delta, range) {
  const next = offset + speed * delta
  return next >= range ? next % range : next
}
