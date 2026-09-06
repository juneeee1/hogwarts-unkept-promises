# 霍格沃茨 · 入夜之后

手机优先的实时 3D 城堡探索 H5。城堡、石桥与室内处于同一世界坐标系，使用 Three.js / WebGL 2 渲染，无 AI 聊天与后端依赖。

## 体验范围

- 可旋转和缩放的城堡全景；从全景进入第一人称。
- 高架石桥 → 钟楼庭院 → 大礼堂、图书馆、魔药教室均可连续行走。
- 庭院星盘前往天文塔；天文塔星盘返回庭院。地图也能快速抵达六个场景。
- 手持魔杖、Lumos 照明、施法粒子、合成风声与脚步声。
- 触控摇杆 + 右侧拖动环视，WASD / 方向键与鼠标拖动兼容。
- 墙体、桌子和桥边碰撞；安全落点和观星台边界。
- 扫描石墙、石地与板岩材质；半分辨率环境遮蔽、柔和泛光、自适应渲染分辨率。

建筑是基于原著魔法学校意象的艺术化重构，并非官方建筑图的逐点复刻。天文塔使用星盘传送，没有可步行的完整螺旋楼梯。当前探索记录仅存于本次页面会话；未接入 Storvia 存档。

## 本地运行与交付

```sh
npm install
npm run dev                 # Sites 预览，默认 localhost:3000
npm run test                # 真实场景几何、落点与连通性检查
npx tsc --noEmit
npm run build               # Sites 部署构建
npm run build:storvia       # 无服务器静态 H5，输出 dist-storvia
npm run preview:storvia     # 静态产物预览
```

Storvia 要求入口 index.html 位于 ZIP 根目录，且压缩包不超过 20MB。本项目的 `vite.storvia.config.ts` 固定 `base: './'`。将 `dist-storvia` 内的内容打包，不包含源码和 node_modules。上传后在 Storvia 创作台执行预览。详情：https://docs.storvia.ai/docs/creation/world-mode/getting-started

## 控制

| 操作 | 电脑 | 手机 |
| --- | --- | --- |
| 移动 | WASD / 方向键，Shift 快行 | 左下摇杆 |
| 环视 | 拖动场景 | 右侧滑动 |
| 点亮魔杖 | L 或荧光闪烁按钮 | 荧光闪烁按钮 |
| 施法 | Space 或施法按钮 | 施法按钮 |
| 地图 | M 或地图按钮 | 地图按钮 |
| 星盘 | E 或场景提示按钮 | 场景提示按钮 |

声音需要点击开启。页面进入后台会暂停渲染和声音。自适应画质在性能不足时降低分辨率并关闭后处理；真机性能仍取决于设备与嵌入 WebView。

## 项目结构

- `app/page.tsx` / `app/globals.css`：中文界面和触控操作。
- `src/world/builder.ts`：可合并的参数化哥特式建筑构件。
- `src/world/castle.ts`：建筑、家具、地形、照明和动态场景。
- `src/world/engine.ts`：渲染、第一人称相机与输入生命周期。
- `src/world/navigation.ts`：目的地、碰撞和行走边界。
- `src/assets/`：随包交付的扫描材质，见 `ASSET-CREDITS.md`。
- `src/webmcp.ts`：可选的浏览器导航工具；不调用任何 AI 模型，普通浏览器忽略。
- `tests/world.test.mjs`：使用实际几何与碰撞表进行连通性验证。
