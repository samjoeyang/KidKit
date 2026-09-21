# KidKit 🧰

好用的课堂、居家学习小工具合集。使用 **Vite** 构建，一个首页作为小工具索引，四个小工具都在同一个项目里，打开浏览器就能用。

## 小工具一览

| 工具 | 说明 | 入口 |
| --- | --- | --- |
| 🕐 认识时钟 | 拖动时针/分针认表，附「认表挑战」与「自由拨表」两种玩法 | `tools/clock/` |
| 🗓️ 学日历 | 查看任意年份 1–12 月的月历，自动标注闰年与今天 | `tools/calendar/` |
| ✏️ 笔顺小屋 | 输入任意汉字，看笔顺分解、播放书写动画、玩笔顺大挑战 | `tools/bishun/` |
| 🚂 字母小火车 | 儿童英语打字：分类词库、语音朗读、指法提示、屏幕时间限制 | `tools/typing/` |
| 📜 识典古籍检索 | 关键词检索识典古籍公开数据，展示原文出处并跳转官网 | `tools/shidianguji/` |

首页 `/` 汇总了以上全部入口（认识时钟工具内含「时钟 + 日历」两个页面）。

## 快速开始

需要 Node.js 20+（开发时使用 Node 24 验证通过）。

```bash
npm install     # 安装依赖
npm run dev     # 开发模式，默认 http://localhost:4173
npm run build   # 类型检查 + 打包到 dist/
npm run preview # 预览打包结果，默认 http://localhost:4173
```

`npm run dev` 与 `npm run preview` 都已经挂好了识典古籍检索接口（`/api/health`、`/api/search`），无需额外启动后端。

## 目录结构

```
.
├─ index.html                 # 首页（小工具索引）
├─ tools/                     # 各工具的 HTML 入口（多页应用）
│  ├─ clock/index.html        # 
│  ├─ calendar/index.html
│  ├─ bishun/index.html
│  ├─ typing/index.html
│  └─ shidianguji/index.html
├─ src/
│  ├─ home/                   # 首页的脚本与样式
│  ├─ styles/                 # 各工具共用的样式（如「回到首页」入口）
│  └─ tools/                  # 各工具的脚本与样式
│     ├─ clock/               # 时钟 + 日历（含 Clock.js 组件）
│     ├─ bishun/
│     ├─ typing/              # React + TypeScript
│     └─ shidianguji/
├─ server/shidianguji.js      # 识典古籍检索后端（Vite 插件 + 可独立运行）
├─ vite.config.ts             # 多页入口配置
└─ docs/                      # 说明文档与原始工具存档
```

## 部署

`npm run build` 产物在 `dist/`，构建使用相对路径（`base: './'`），放到任意子目录都能正常加载资源。

其中「识典古籍检索」需要后端接口：静态托管时接口不存在，该页面会自动降级为「跳转官网检索」，其余功能不受影响；若需要整合结果视图，可用 `node server/shidianguji.js` 单独启动接口服务（默认 4173 端口，可用 `PORT` 覆盖）。

## 更多文档

- [开发说明](docs/GUIDE.md)：项目结构、各工具改造说明、如何新增一个小工具、验证记录。
- `docs/source/`：改造前的原始小工具，仅作存档参考，不参与构建。

## 数据来源与版权

- 笔顺数据来自 [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data)（运行时按需从 CDN 拉取并缓存到 localStorage）。
- 识典古籍检索的正文数据实时来自 [识典古籍](https://www.shidianguji.com) 公开搜索页，版权归原整理者与平台所有，本工具仅作个人检索辅助。
