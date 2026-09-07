# 未赴之约 · 霍格沃茨

五语言单机叙事探索 H5，使用 Three.js / WebGL 2。当前版本是可完整游玩的斯内普首章：战后城堡探索、独立的平行救援故事、六个月后的康复日常与礼堂结尾。全程使用预写剧情和本地规则，没有 AI 生成请求、支付接口或后端依赖。

## 当前版本（art-v3，2026-09-07）

- **完整首章**：12 个推进环节、7 个谜题、可回访结尾；分院问答后允许玩家自行选择学院。
- **学院改变玩法**：格兰芬多预先支稳接应通道，拉文克劳标出可靠档案，赫奇帕奇整理柔软垫层，斯莱特林预校准两层星盘。帮助只处理部分步骤，所有学院都能完成全部内容。
- **五语言**：简体中文、繁體中文、English、日本語、한국어，共 222 组界面与剧情条目。顶部或设置中即时切换，谜题草稿、学院、进度和彩蛋保持不变。
- **5 处原著呼应**：巧克力蛙卡片、纳威的糖纸、被保留的沼泽、画像串门、R.A.B. 与克利切的记录。发现后可在故事册回看。
- **9 处空间**：城堡地图的 7 处目的地，加剧情进入的接应处和晨光研究室。完成操作后，断梁移开、保护环点亮、窗扇打开、幼苗长出新叶、茶杯移近、档案被收好。
- **本地进度**：自动存档、上一版本备份、损坏校验、导入/导出、重新开始确认、多标签页更新冲突提示。设备之间可手动迁移 JSON 存档。
- **离线资源**：静态构建打包所有脚本、样式和纹理。首次联网且显示“离线可用”后，支持 Service Worker 的浏览器可断网重开。受限 WebView 会显示对应状态。

只有首章已经实现。小天狼星、双胞胎等完整人物章节仍在后续方案中，不能从本版入口进入未完成章节。战后主线保留原著历史；角色幸存发生在明确标注的原创平行故事中。

## 本轮美术与文案打磨

- 重建教授头型、分层发束和贴合脸部的绘制五官；修正独立眼球与眉毛突出的效果。
- 信封与信纸共用连续的拆封演出，最终呈现带纤维纹理的牛皮纸信件；修复封口内纸露边、动画中断和横屏布局。
- 替换手绘 SVG 图标为 24 格统一插画图集，逐项裁切并留出边距；修复生产包图片地址与星盘内层图标定位。
- 审读原有 221 组文案，42 组同步改写五种语言，新增章节完成标签；减少抽象总结，让动作、细节和人物对话承担叙述。
- 生成的纸张、图标与面部贴图压缩后共 137,038 字节，使用 PicGo / 腾讯云图床（Storvia CDN）托管。
- 提供 9.31 MB 全资源离线包和 4.28 MB 联网包。联网包使用图床 UI 图片及原 BGM 链接，人物纹理继续本地打包；不宣称可断网重开。

[本轮完整说明、素材与验收](./docs/ART-AND-COPY-V3.md)。

## 继续保留的沉浸交互

- BGM 使用用户提供的《Hedwig’s Theme》，本地打包。玩家点击后播放，可独立静音；切入后台暂停，旧存档默认关闭音乐。
- 邀请函先呈现带蜡封的信封，拆封后翻起封口、抽出信纸。阅读完成后才推进剧情，支持系统减少动态效果设置。
- 分院时镜头靠近帽子，字幕和选项在帽子旁边，竖屏位于下方。帽子的嘴部、褶皱和针脚一起变化；可选设备本地语音，无对应语音时保留字幕。
- 学院、药材与谜题使用同一套原创插画图标，调配进度有药液刻度反馈。教授重建为带绘制面部与轻微转头的 Q 版三维角色。
- 玻璃和尖拱共用轮廓，研究室窗台连接完整墙体；礼堂、楼梯大厅使用克制的彩色铅条玻璃，研究室保留清透玻璃。

前版测试证据见 [第二轮打磨记录](./docs/IMMERSION-POLISH-V2.md)。

## 场景与操作

城堡保留前几版的精细化成果：可承载玩家的四段移动楼梯、70 幅带立体边框的画像、原创旗帜纹章、分院帽皮革褶皱与针脚、避开凳腿的红色垂布、瓷盘、空心高脚杯、黄铜烛台、蜡泪、玻璃药瓶、望远镜和星盘。实时火焰、烟雾、烛光、扫描石墙与木纹使用各自的材质设置。魔杖保留，手部与袍袖已移除。

新增研究室使用木护墙、带书脊的书架、铅条窗、可开合窗扇、窗边尘光和程序建模的 Q 版教授角色。人物为艺术化程序模型，没有电影级扫描、表情捕捉或录制配音。分院帽的可选朗读依赖设备已安装的本地语音。

| 操作 | 电脑 | 手机 |
| --- | --- | --- |
| 移动 | WASD / 方向键，Shift 快行 | 左下摇杆 |
| 环视 | 拖动场景 | 右侧滑动 |
| 点亮魔杖 | L 或荧光闪烁按钮 | 荧光闪烁按钮 |
| 施法 | Space 或施法按钮 | 施法按钮 |
| 地图 | M 或地图按钮 | 地图按钮 |
| 查看物件 / 转向楼梯 | E 或场景提示按钮 | 场景提示按钮 |

页面没有全屏入口或快捷键字母徽标。横竖切换保留视角、清空按住的移动输入；阅读和解谜时暂停角色移动。声音需要玩家点击开启，后台暂停渲染与声音。

## 本地运行

```sh
npm install
npm run dev                 # 本地应用开发
npm test                    # 剧情、存档、几何、碰撞、楼梯与连通性
npx tsc --noEmit
npm run build               # 应用构建
npm run build:storvia        # 静态 H5 → dist-storvia/
npm run preview:storvia     # 静态产物预览
```

本轮验收预览为 http://127.0.0.1:4175/ 。需要重新启动此地址时运行：

```sh
npx vite preview --config vite.storvia.config.ts --host 127.0.0.1 --port 4175 --strictPort
```

浏览器 QA 使用独立的无头浏览器配置，不写入用户正在使用的浏览器存档：

```sh
node tools/qa-playthrough.mjs # 实际操作走完整章，生成完成存档测试样本
node tools/qa-responsive.mjs  # 依赖上一步样本；五语言横竖屏与离线重开
node tools/qa-features.mjs    # 存档 UI、学院帮助、五处彩蛋
node tools/qa-polish.mjs      # BGM、信封、五语言现场分院与视角恢复
node tools/qa-audio-offline.mjs # 离线音乐、分段请求与设备语音状态
node tools/qa-letter-v3.mjs   # 五语言拆信、中断、横屏与减少动态效果
node tools/qa-assets-v3.mjs   # 离线/联网产物的实际图片及音乐加载
```

QA 可通过 `PLAYWRIGHT_MODULE` 和 `CHROME_PATH` 指定本机工具。脚本默认连接 4175，截图与报告写入 `outputs/qa-singleplayer/` 和 `outputs/qa-polish/`。不需要向普通玩家提供这些工具。

## 交付

- [art-v3 联网小包 · 4.28 MB](./outputs/hogwarts-unkept-promises-art-v3-5lang-linked-20260907.zip)
- [art-v3 全资源离线包 · 9.31 MB](./outputs/hogwarts-unkept-promises-art-v3-5lang-offline-20260907.zip)
- [art-v3 改动、素材与验收](./docs/ART-AND-COPY-V3.md)

- [第二轮沉浸打磨 ZIP](./outputs/hogwarts-unkept-promises-immersion-v2-5lang-20260907.zip)
- [第二轮打磨与验收](./docs/IMMERSION-POLISH-V2.md)
- [前版五语言单机首章 ZIP](./outputs/hogwarts-unkept-promises-singleplayer-v1-5lang-20260907.zip)
- [实施与剧情环节说明](./docs/SINGLEPLAYER-IMPLEMENTATION.md)
- [本版验收记录与限制](./docs/SINGLEPLAYER-VALIDATION.md)
- [玩法总方案与后续章节](./docs/GAMEPLAY-PROPOSAL.md)
- [社交讨论调研及取样限制](./docs/SOCIAL-RESEARCH-20260907.md)
- [原著依据与彩蛋清单](./docs/CANON-AND-EASTER-EGGS.md)
- [纹理来源与许可](./ASSET-CREDITS.md)
- [前版视觉与红布修复记录](./docs/VALIDATION.md)

离线 ZIP 将 `dist-storvia` 的内容放在根目录，包含 `index.html`、`sw.js` 和所有本地资源（包括音乐），使用相对资源路径。源码、测试、调研和开发工具不进入游戏包。本轮没有发布网站或覆盖旧线上版本。

多语言覆盖与 Storvia 的五个语言选项一致，目前在游戏内切换并在首次进入时参考浏览器语言；未接入 Storvia 账户语言和云存档。已经完成浏览器桌面与移动尺寸验证，Storvia 真机 WebView、iOS/Android 性能和母语编辑审校仍需单独验收。

## 主要代码

- `src/game/state.ts` / `use-game.ts`：状态机、版本化存档与恢复。
- `src/game/story.ts`：物件位置、稳定谜题 ID 与答案规则。
- `src/game/copy.ts` / `story-copy.ts`：五语言文本。
- `src/game/StoryPanel.tsx` / `game.css` / `polish.css`：谜题与响应式故事面板。
- `src/game/InvitationLetter.tsx` / `SortingCeremony.tsx` / `StoryIcon.tsx`：信封、现场分院与统一图标。
- `src/game/use-music.ts`：用户操作触发的背景音乐。
- `src/world/chibi-professor.ts` / `sorting-hat.ts`：Q 版教授与分院帽动作。
- `app/page.tsx`：游戏界面、地图、故事册、设置、导入导出。
- `src/world/story-world.ts`：任务物件、接应处、康复研究室和持续环境变化。
- `src/world/castle.ts` / `builder.ts` / `materials.ts`：城堡与材质。
- `src/world/engine.ts` / `navigation.ts` / `staircases.ts`：相机、输入、碰撞与移动楼梯。
- `tools/offline-plugin.ts`：静态构建生成离线缓存版本。
