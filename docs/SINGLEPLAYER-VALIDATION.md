# 单机首章验收记录

2026-09-07，singleplayer-v1。验证对象为本地静态产物与游戏源码。本轮没有发布到网站或 Storvia。

## 交付产物

- 本地预览：http://127.0.0.1:4175/
- ZIP：[hogwarts-unkept-promises-singleplayer-v1-5lang-20260907.zip](../outputs/hogwarts-unkept-promises-singleplayer-v1-5lang-20260907.zip)
- 压缩大小：4,257,025 字节，约 4.26 MB；解压后 5,219,322 字节。
- 共 23 个文件；根目录含 index.html 与 sw.js，另外包含图标和 20 个资源文件。所有语言在同一包中。
- ZIP CRC 检查通过；不含源码、开发工具、node_modules、玩家存档和测试数据。
- SHA-256：`8ccdb4cc0916ffcb9b6e637370fb5dd2b077ea75b924769fe46a2c53eec9b995`

## 自动化与实际操作

| 检查 | 结果与边界 |
| --- | --- |
| TypeScript | `npx tsc --noEmit` 通过 |
| 当前游戏代码 lint | 页面、布局、src/game、story-world、engine、props、离线构建插件与配置通过 scoped oxlint |
| 应用构建 | `npm run build` 通过；构建器提示较大的 3D 引擎 chunk 与 vinext 静态路由分类限制 |
| Storvia 静态构建 | `npm run build:storvia` 通过；22 个文件被完整预缓存 |
| 剧情与语言数据 | 四学院完整推进、七题答案唯一、禁止越级、五语言共 209 条文本、切语言保留状态通过 |
| 存档数据 | 版本/类型/大小/非法状态校验、备份恢复、受限存储降级、彩蛋幂等通过 |
| 世界几何 | 1,490,617 个三角形，低于设定的 150 万总量预算；顶点有效，93 个碰撞体 |
| 通行 | 九处安全出生点、桥到礼堂连通、地面房间连通、任务物件可接近、断梁完成后改变碰撞通过 |
| 原有修复 | 餐盘边界、红布与凳子/帽子在三个姿态下无三角形相交通过 |
| 移动楼梯 | 四段双向行走、两种接拢方向、转动时承载玩家、防止掉入中庭通过 |
| 浏览器完整首章 | 从首次进入到分院、七题、平行接应、晨光研究室与礼堂结尾，实际点击及键盘行走通过；未注入完成进度 |
| 中途恢复 | 未完成配方的第一步在关闭面板、刷新与重新进入后保留；手动选择的学院保留 |
| 存档 UI | 实际导出文件、拒绝无效导入、取消/确认新故事、有效存档导入与刷新、双标签页冲突提示通过 |
| 学院帮助 UI | 四个学院在对应关卡的真实帮助效果、重复点击不多推进通过 |
| 彩蛋 UI | 从地图入口实际行走到五处物件，触发并在故事册收录通过；路线正常绕过庭院喷泉 |
| 五语言移动布局 | 390×844 竖屏、844×390 横屏、320×568 窄屏设置通过边界检查与截图复核，长文面板可滚动 |
| 离线 | 首次联网后等待缓存就绪，再由浏览器断网重开，完整资源与 UI 恢复通过；修复了 Vary: Origin 导致脚本缓存未匹配的问题 |
| 运行异常 | 完整游玩、五语言布局及功能操作测试未捕获 JavaScript pageerror |
| 差异格式 | `git diff --check` 通过 |

**全项目 `npm run lint` 仍未通过。** 现有通用组件目录、use-mobile hook 和之前的世界测试脚本有 lint 问题，例如组件的可访问性 role 规则、同步 effect 状态和测试字符串类型。这些不在本轮功能修改范围内；没有通过关闭规则来掩盖。当前游戏实现的 scoped lint 通过，不能据此宣称全仓库 lint 已通过。

## 浏览器证据

测试使用 macOS 上独立的无头 Chromium 配置和 Playwright，不操作用户正在使用的浏览器存档。完整路径用 UI 点击和实际移动；布局、学院分支、存档边界测试使用隔离配置中的合法测试存档作为前置状态。

- [完整游玩报告](../outputs/qa-singleplayer/playthrough.json)
- [五语言与离线报告](../outputs/qa-singleplayer/responsive.json)
- [存档、学院和彩蛋报告](../outputs/qa-singleplayer/features.json)
- [包校验报告](../outputs/qa-singleplayer/package.json)
- [英文竖屏谜题](../outputs/qa-singleplayer/mobile-en-puzzle.png)
- [日文横屏谜题](../outputs/qa-singleplayer/landscape-ja-puzzle.png)
- [韩文窄屏设置](../outputs/qa-singleplayer/narrow-ko-settings.png)
- [康复研究室近景](../outputs/qa-singleplayer/study-refined-close.png)
- [礼堂结尾视野](../outputs/qa-singleplayer/hall-fireworks-framed.png)
- [五处彩蛋完成后的故事册](../outputs/qa-singleplayer/secrets-complete.png)

截图不等于真机性能结果。150 万是场景总几何预算，不是保证每台手机达到某个帧率的依据。

## 明确限制

1. 已完成斯内普首章。小天狼星、双胞胎等完整分支仍在玩法方案中。
2. 支持五语言游戏内切换及浏览器语言初始选择；未接 Storvia 账户语言同步、平台云存档或其 SDK。
3. 已验证浏览器移动尺寸，尚未验证 Storvia 真机 WebView、实际 iOS/Android 的触控与性能。需要平台预览环境做下一轮实机验收。
4. 离线重开依赖安全来源与 Service Worker 支持。存档依赖本地存储；浏览器清理数据或系统回收缓存后需重新加载或导入存档。UI 按实际可用状态提示。
5. 翻译完整性、关键术语和布局已检查；日语、韩语等未经过专业母语编辑审校。
6. 场景和人物为网页艺术化程序建模，沿用已有原创肖像与纹章贴图。人物插画生成被工具输出审核拦截（仅返回 other），没有新插画文件；本版没有配音、表情捕捉或电影级人物扫描。
7. 没有 AI 请求、自动生成或扣费入口；也没有替用户发布本轮版本。
