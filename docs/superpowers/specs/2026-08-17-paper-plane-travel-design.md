# 纸飞机旅行 · MVP 设计规范

- 日期:2026-08-17
- 状态:已与用户确认
- 范围:纯前端零后端,MVP 单场景闭环

## 1. 项目概述

NFC 标签挂件触碰手机 → 打开带 `?scene=xxx` 参数的网页 → 浏览器加载纯前端静态页面,3D 纸飞机在沙漠公路上滑翔,手指滑动控制飞行高度与倾斜,一碰开启"纸飞机带你旅行"的沉浸体验。

核心商业闭环:挂件 → 碰手机 → 打开对应风景网页 → 拍摄带货短视频。MVP 目标就是跑通这条链路。

## 2. MVP 范围

本次只做以下内容:

- 1 套沙漠公路场景(全景天空球 + 滚动贴图地面)
- 纸飞机:代码几何体拼装 + 飞行动画
- 触控:单指上下滑动控制高度 + 俯仰倾斜
- 路由:URL `?scene=xxx` 读取场景,`config.js` 场景清单
- 配套 UI:加载页、音乐开关(素材待提供)
- 部署 Vercel / GitHub Pages,真机 NFC 联调

## 3. 技术栈

| 用途 | 选型 |
| ---- | ---- |
| 构建 | Vite |
| 3D 渲染 | Three.js |
| 动画 | GSAP |
| 样式 | TailwindCSS |
| 托管 | Vercel(推荐)/ GitHub Pages |

## 4. 编码约束(强制,不可违反)

### 约束 A — 所有资源路径使用相对路径

- `vite.config.js` 设置 `base: './'`,打包产物用相对路径引用资源
- 所有贴图、音频、模型一律通过 Vite `import` 引入,禁止硬编码绝对路径(如 `/assets/xx.png`、`https://...`)
- 目的:适配 Vite 打包 + GitHub Pages / Vercel / 自定义域名任意托管位置,换域名不 404

### 约束 B — 禁止跨模块直接访问内部变量

- 组件之间只通过暴露的公共方法通信
- 示例:纸飞机组件对外暴露 `setPosition(x,y,z)`、`setTilt(angle)`、`playWingShake()`、`getMesh()`,外部**禁止**直接修改其内部 mesh 属性(如 `plane.mesh.position.y = ...`)
- 目的:保证内部实现可替换(几何体 → GLB 模型)而不影响任何调用方

## 5. 目录结构

```
src/
├─ main.js              入口:读 URL → loadScene → 启动动画循环
├─ config.js            场景清单:sceneId → { 名称/天空球/路面贴图/主题色/音乐 }
├─ scenes/
│  └─ desert.js         沙漠公路场景加载器(天空球 + 滚动地面 + 雾效 + 光照)
├─ components/
│  └─ paper-plane.js    AirPlane 抽象类 + 几何体拼装实现
├─ controls/
│  └─ touch-control.js  单指触控 → 高度 + 倾斜
├─ utils/
│  ├─ url.js            URLSearchParams 解析 scene 参数
│  └─ audio.js          背景音乐播放/开关(素材为空时留接口)
├─ ui/
│  └─ overlay.js        加载页、音乐按钮等 DOM 层
└─ assets/
   ├─ textures/         沙漠天空球 WebP、路面贴图
   └─ audio/            背景音乐(待用户提供)
```

## 6. 模块设计

### 6.1 场景系统 `scenes/desert.js`

- **天空球**:`SphereGeometry` 朝内贴 equirectangular 全景图(WebP,≤2048×1024),`MeshBasicMaterial` + `side: BackSide`,包围整个场景,相机置于球心
- **无限公路**:水平大平面 + 可重复路面贴图,`texture.repeat` 沿公路方向,每帧 `texture.offset` 向 `-z` 滚动,模拟向前滑翔;不建真实 3D 地形,成本最低、性能最好
- **光照**:环境光 + 暖色调方向光,营造沙漠氛围
- **雾效**:线性雾增强纵深;低端机(DPR 受限/帧率低)自动关闭
- **云**:MVP 可选,1~2 片半透明平面云,后置不阻塞

### 6.2 纸飞机组件 `components/paper-plane.js`

统一抽象接口,内部实现可无缝替换:

```js
class AirPlane {
  constructor(scene) {}     // 拼装并加入场景
  setPosition(x, y, z) {}   // 设置坐标(高度控制)
  setTilt(angle) {}         // 设置俯仰倾斜角度(飞行感)
  playWingShake() {}        // 机翼抖动动画
  getMesh() {}              // 返回根 mesh(只读用途)
}
```

- **MVP 内部**:机身 + 两片机翼用 BoxGeometry / Triangle 几何体拼装,白色纸张质感材质;颜色参数化,后期可适配不同挂件主题
- 机翼持续轻微摆动动画(render loop 内正弦或 GSAP)
- **升级点**:正式版内部改为加载 GLTF 模型,接口不变,业务代码零改动

### 6.3 触控控制 `controls/touch-control.js`

- 单指**上下滑动** → 改变飞机 Y 高度 + `setTilt()` 俯仰倾斜(前倾/后仰随滑动方向)
- 平滑处理:目标值与实际值之间用 GSAP lerp / 阻尼,避免生硬
- 防冲突:`touch-action: none`、`preventDefault`,禁止页面缩放滚动
- **左右滑动**:MVP 不做偏航,接口预留(`setYaw` 可选),避免范围膨胀

### 6.4 路由与配置

- `config.js` 每条场景:

```js
{
  id: 'desert',
  name: '沙漠公路',
  skybox: '...',        // 全景图 import
  ground: '...',        // 路面贴图 import
  accentColor: '#e8a33d',
  music: null           // 音频 url,未提供为 null
}
```

- `main.js`:`utils/url.js` 解析 `?scene=xxx`,未知 sceneId 回退默认 `desert`,调用 `loadScene()`
- 纯前端,无服务端依赖

### 6.5 UI 层 `ui/overlay.js`

- **加载页**:资源就绪前显示品牌动效/进度,`THREE.LoadingManager` 完成回调后淡出
- **音乐开关**:右下角圆形按钮,点击播放/暂停;`config.music` 为 null 时不显示
- **分享截图**(html2canvas):MVP 后置,不在本次范围

## 7. 数据流

```
NFC 标签写入 https://<host>/<path>/?scene=desert
  → 浏览器加载 index.html
  → main.js:utils/url 读 scene → config 查配置
  → scenes/desert 构建天空球 + 地面
  → components/paper-plane 创建飞机
  → controls/touch-control 绑定滑动
  → 动画循环:滚动地面 + 飞机动画 + 平滑跟随
  → 用户滑动 → setPosition/setTilt → 飞机响应
```

## 8. 性能与兼容

- 天空球 WebP ≤2048×1024,总包体尽量 <1.5MB(MVP)
- DPR 上限 2,低端机降级(关闭雾效、降分辨率)
- 页面隐藏(`visibilitychange`)时暂停 RAF,省电
- 移动端:`viewport` 禁缩放、`touch-action: none`,iPhone/安卓兼容
- 所有交互不依赖服务端,离线也能跑

## 9. 错误处理

| 场景 | 处理 |
| ---- | ---- |
| 资源加载失败 | 加载页显示失败提示 + 重试按钮 |
| `?scene` 未知 | 回退默认 `desert` |
| 浏览器不支持 WebGL | 显示"请升级浏览器"提示页 |
| 无背景音乐素材 | 音乐按钮不渲染,不报错 |

## 10. 测试与验证

1. 本地 `npm run dev`,桌面浏览器 + 开发者工具设备模拟
2. `npm run build && npm run preview`,验证相对路径产物可访问
3. 部署后真机测试:iPhone / 安卓打开链接,验证滑动控制与渲染
4. NFC 联调:写入 HTTPS 链接到 NTAG213,触碰跳转对应场景(需硬件样品)

### MVP 验收清单

- [ ] 手机打开链接即进入沙漠公路场景,纸飞机自动滑翔
- [ ] 手指上下滑动,飞机高度与倾斜平滑响应
- [ ] `?scene=unknown` 正常回退 desert
- [ ] 加载页正常显示并在资源就绪后淡出
- [ ] 全流程无服务端请求,`base: './'` 产物在任意子路径可访问

## 11. 部署

- 优先 Vercel:导入 GitHub 仓库自动识别 Vite,一键部署,国内访问较稳
- 备选 GitHub Actions + Pages
- 由于 `base: './'`,两种平台均无需额外改配置

## 12. MVP 范围外(后置)

- 高精度 GLB 纸飞机模型(需商用授权,替换 `AirPlane` 内部实现)
- 多场景批量接入与各场景素材
- 动态云、昼夜光影、流动雾气(方案 3 混合升级)
- 截图分享 html2canvas
- 左右偏航控制
