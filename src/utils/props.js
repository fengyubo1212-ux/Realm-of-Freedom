import { Group, Mesh, MeshStandardMaterial, CylinderGeometry, SphereGeometry, IcosahedronGeometry } from 'three'

// 程序化生成的沙漠环境道具,全部低多边形、共享材质,便于移动端
const cactusMat = new MeshStandardMaterial({ color: '#5d8f4a', roughness: 0.9 })
const shrubMat = new MeshStandardMaterial({ color: '#6e7d50', roughness: 1 })
const rockMat = new MeshStandardMaterial({ color: '#8d7f6c', roughness: 1 })

// 柱状仙人掌:主干 + 左右各一"肘形"手臂
export function createCactus() {
  const g = new Group()
  g.userData.part = 'cactus'
  const trunk = new Mesh(new CylinderGeometry(0.14, 0.17, 2.4, 8), cactusMat)
  trunk.position.y = 1.2
  trunk.castShadow = true
  g.add(trunk)
  for (const side of [-1, 1]) {
    const horiz = new Mesh(new CylinderGeometry(0.09, 0.09, 0.7, 8), cactusMat)
    horiz.position.set(side * 0.4, 1.3, 0)
    horiz.rotation.z = (side * Math.PI) / 2
    horiz.castShadow = true
    g.add(horiz)
    const up = new Mesh(new CylinderGeometry(0.08, 0.09, 0.62, 8), cactusMat)
    up.position.set(side * 0.78, 1.68, 0)
    up.castShadow = true
    g.add(up)
  }
  return g
}

// 灌木丛:几个压扁的小球簇
export function createShrub() {
  const g = new Group()
  g.userData.part = 'shrub'
  for (let i = 0; i < 4; i++) {
    const s = new Mesh(new SphereGeometry(0.22 + Math.random() * 0.14, 8, 6), shrubMat)
    s.position.set((Math.random() - 0.5) * 0.9, 0.16 + Math.random() * 0.18, (Math.random() - 0.5) * 0.9)
    s.scale.y = 0.7
    s.castShadow = true
    g.add(s)
  }
  return g
}

// 岩石:随机旋转的十二面体
export function createRock() {
  const m = new Mesh(new IcosahedronGeometry(0.42, 0), rockMat)
  m.scale.set(1, 0.62, 1.2)
  m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
  m.castShadow = true
  m.userData.part = 'rock'
  return m
}

// 沙丘丘体:宽而扁的球壳(可传入共享沙面材质以复用贴图)
export function createDuneMound(material) {
  const m = new Mesh(new SphereGeometry(1, 16, 12), material)
  m.scale.set(2.2, 0.34, 1.3)
  m.userData.part = 'dune'
  return m
}
