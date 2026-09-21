# KidKit 开发说明

本文档说明 KidKit 的项目结构、各小工具的改造方式、如何新增小工具，以及本次完成后的验证记录。

## 1. 技术栈与总体设计

- **构建工具**：Vite 8（多页应用 MPA）。
- **框架**：首页与三个小工具使用原生 JS + CSS；「字母小火车」保留 React 18 + TypeScript。
- **语言**：`src/` 下 `.ts/.tsx` 参与 `tsc --noEmit` 类型检查，`.js` 不参与类型检查。
- **后端**：识典古籍检索需要一个代理接口，以 **Vite 插件**的形式挂到 `dev` / `preview` 服务器上，同时保留独立运行能力。

首页是索引页，四个小工具各自是一个独立页面（多页应用），互不干扰、各自独立加载。

### 页面与入口映射

| 页面 | HTML 入口 | 脚本入口 |
| --- | --- | --- |
| 首页（小工具索引） | `index.html` | `src/home/main.js` |
| 认识时钟 | `tools/clock/index.html` | `src/tools/clock/main.js` |
| 学日历 | `tools/calendar/index.html` | `src/tools/clock/calendar.js` |
| 笔顺小屋 | `tools/bishun/index.html` | `src/tools/bishun/main.js` |
| 字母小火车 | `tools/typing/index.html` | `src/tools/typing/main.tsx` |
| 识典古籍检索 | `tools/shidianguji/index.html` | `src/tools/shidianguji/main.js` |

入口 HTML 都在 `vite.config.ts` 的 `build.rollupOptions.input` 中登记；`base: './'` 保证构建产物可以放在任意子路径下。

## 2. 各小工具的改造说明

### 认识时钟 / 学日历（原 `kidslearnclock`）

- 原本已是一个 Vite 小项目（两个 HTML 入口）。现在合并进主项目：两个入口改为 `tools/clock/` 与 `tools/calendar/`，脚本放在 `src/tools/clock/`。
- 原 `main.js` 里的 `Clock` 类被**拆分为独立组件** `src/tools/clock/Clock.js`，`main.js` 只负责页面骨架与「认表挑战 / 自由拨表」逻辑。
- 两个页面之间的跳转由 `index.html` / `calendar.html` 改为 `../calendar/` 与 `../clock/`。

### 笔顺小屋（原 `bishun-game`）

- 原本是「一个 765 行的 `index.html` + 一个静态 `server.js`」。
- 改造：`<style>` 抽到 `src/tools/bishun/bishun.css`，`<script>` 抽到 `src/tools/bishun/main.js`（作为 ES 模块，顶部 `import './bishun.css'`），HTML 只保留结构。
- 原来的静态服务器 `server.js` 不再需要：Vite 本身就能提供开发与预览服务。
- 笔顺数据仍在运行时按需从 CDN（jsdelivr / unpkg / npmmirror 依次尝试）拉取，并缓存到 `localStorage`。

### 字母小火车（原 `kidstypingenglish`）

- 原本就是 React + TypeScript 的 Vite 项目，源码整体搬进 `src/tools/typing/`（`App.tsx`、`components/`、`data/`、`styles/` 保持原结构），入口 HTML 改为 `tools/typing/index.html`。
- 该工具需要 `@vitejs/plugin-react`，已在根 `vite.config.ts` 中统一启用。

### 识典古籍检索（原 `shidianguji-tool`）

- 原本是「`index.html` + `server.js`（Node 代理）」。改造分两步：
  1. 前端：`<style>` → `src/tools/shidianguji/shidianguji.css`，`<script>` → `src/tools/shidianguji/main.js`。因为 ES 模块里没有全局函数，原来 HTML 上的内联 `onclick="doSearch()"`、`javascript:example(...)` 已改为 `addEventListener` 绑定。
  2. 后端：`server.js` 的逻辑整理为 `server/shidianguji.js`，以 Vite 插件 `shidiangujiProxy()` 的形式挂载 `/api/health` 与 `/api/search`，`vite dev` 和 `vite preview` 开箱即用；同时保留 `node server/shidianguji.js` 独立启动的方式。
- 保留了原有的限流（单 IP 每分钟 30 次）、并发上限（6）、结果缓存（10 分钟）与失败重试（3 次）策略，以及「静态打开时降级为跳转官网」的行为。

### 首页（新增）

- `index.html` + `src/home/main.js` + `src/home/home.css`，工具卡片由 `TOOLS` 数组渲染，新增工具时只需往数组里加一项。
- 各工具页左上角统一的「← 回到 KidKit 首页」入口样式放在 `src/styles/home-link.css`，由各页面 HTML 通过 `<link rel="stylesheet">` 引入。

## 3. 如何新增一个小工具

1. 新建 `tools/<名字>/index.html`，其中用 `<script type="module" src="/src/tools/<名字>/main.js">` 引入脚本，按需加上 `<link rel="stylesheet" href="/src/styles/home-link.css" />` 与「回到首页」链接。
2. 在 `src/tools/<名字>/` 下写脚本与样式（脚本顶部 `import './<名字>.css'`）。
3. 在 `vite.config.ts` 的 `build.rollupOptions.input` 中登记该 HTML。
4. 在 `src/home/main.js` 的 `TOOLS` 数组里加一个卡片，指向 `tools/<名字>/`。

若新工具需要后端接口，可参考 `server/shidianguji.js` 的写法：导出一个 Vite 插件，在 `configureServer` / `configurePreviewServer` 中挂载中间件。

## 4. 验证记录

验证环境：Node v24.14.1、npm 11.11.0、Vite 8.3.0；构建在 Linux/arm64 下完成。

### 构建

`npm run build`（先 `tsc --noEmit` 类型检查，再打包）**通过，无类型错误、无警告**。产物共 6 个 HTML 页面：

```
dist/index.html                 dist/tools/clock/index.html
dist/tools/calendar/index.html  dist/tools/typing/index.html
dist/tools/bishun/index.html    dist/tools/shidianguji/index.html
```

各页面的 JS / CSS 已分别按页面拆分打包（`dist/assets/`）。

### 接口

- `GET /api/health` → `{"ok":true,"service":"shidianguji-proxy"}`（dev 与 preview 均正常）。
- `GET /api/search?q=` → `400`（缺检索词，符合预期）。
- `GET /api/search?q=史记` → `200`，返回约 1000 条出处，前端渲染出书目卡片。

### 页面运行时检查（无头浏览器）

使用 Playwright + Chromium 对 6 个页面做了真实浏览器冒烟测试，**开发模式与预览模式各 22 项，全部通过**：

| 检查项 | 结果 |
| --- | --- |
| 首页渲染 4 个工具卡片、5 个入口链接，链接均可访问 | ✅ |
| 认识时钟：表盘 + 3 根指针、认表挑战出题、数字时间显示、自由拨表随机 | ✅ |
| 学日历：12 个月卡片，2024 年 2 月显示「29 天 · 闰年」 | ✅ |
| 字母小火车：点击开始出现车厢、26 键虚拟键盘、真实键盘打字推进进度 | ✅ |
| 笔顺小屋：默认汉字「大」笔顺分解（3 笔）、笔顺大挑战可点笔画 | ✅ |
| 识典古籍：检测到后端、检索「史记」渲染结果卡片 | ✅ |
| 全部页面无 JS 报错 | ✅ |

## 5. 已知限制

- 笔顺数据依赖 CDN，首次输入某个字需要联网；已缓存到 `localStorage`，之后可离线使用。
- 识典古籍检索依赖上游页面结构，若上游改版则解析会失败（此时页面会提示并引导前往官网）。
- 静态托管（如 GitHub Pages）时没有后端接口，识典古籍工具自动降级为「跳转官网检索」。
