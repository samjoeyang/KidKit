# Repository Guidelines

KidKit is a Vite multi-page app: one index page plus four learning tools, all shipped from this repository.

## Project Structure & Module Organization

- `index.html` + `src/home/` — the tool index page; cards are rendered from the `TOOLS` array in `src/home/main.js`.
- `tools/<tool>/index.html` — page entries: `clock`, `calendar`, `bishun`, `typing`, `shidianguji`.
- `src/tools/<tool>/` — scripts and CSS for that tool. React + TypeScript live only in `src/tools/typing/`.
- `src/styles/home-link.css` — shared "back to home" control used by every tool page.
- `server/shidianguji.js` — 识典古籍 search proxy, mounted as a Vite plugin and runnable standalone.
- `docs/GUIDE.md` — developer guide; `docs/source/` — archived originals, excluded from the build.

New pages must be registered in `vite.config.ts` under `build.rollupOptions.input`, then linked from the homepage.

## Build, Test, and Development Commands

- `npm install` — install dependencies (Node.js 20+).
- `npm run dev` — dev server on `http://localhost:4173`, with `/api/health` and `/api/search` attached.
- `npm run build` — runs `tsc --noEmit` then bundles all six pages into `dist/`.
- `npm run preview` — serves `dist/` on port 4173, API middleware included.
- `node server/shidianguji.js` — starts only the search API (override with `PORT`).

## Coding Style & Naming Conventions

- Two-space indentation. `.js` files use single quotes and semicolons; `.ts`/`.tsx` files omit semicolons — match the file you are editing.
- Components use `PascalCase` (`Clock.js`, `WordTrain.tsx`); modules use `camelCase` (`main.js`, `calendar.js`); stylesheets use `kebab-case` (`home-link.css`).
- No linter or formatter is configured, so consistency with neighbouring files is the standard.
- Comments and user-facing strings are written in Chinese.

## Testing Guidelines

No test framework is configured. Validate changes with `npm run build` (type check + bundle) and manually exercise the affected pages via `npm run dev`. Confirm `/api/health` returns `{"ok":true}` after touching `server/shidianguji.js`. Stroke-order data is fetched from a CDN at runtime, so the 笔顺小屋 page requires network access.

## Commit & Pull Request Guidelines

History currently holds a single `Initial commit`, so keep subjects short and imperative, e.g. `Add PNG export to bishun`. Pull requests should describe the change, list the affected tools, and include screenshots for any UI adjustment. Reference an issue when one exists.
