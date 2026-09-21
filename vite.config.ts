import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { shidiangujiProxy } from './server/shidianguji.js';

const page = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  // 相对路径构建：放到任意子目录部署都能正常加载资源
  base: './',
  plugins: [react(), shidiangujiProxy()],
  server: {
    port: 4173,
  },
  preview: {
    port: 4173,
  },
  build: {
    rollupOptions: {
      input: {
        // 首页：小工具索引
        home: page('./index.html'),
        // 四个小工具（认识时钟含时钟 / 日历两个页面）
        clock: page('./tools/clock/index.html'),
        calendar: page('./tools/calendar/index.html'),
        typing: page('./tools/typing/index.html'),
        bishun: page('./tools/bishun/index.html'),
        shidianguji: page('./tools/shidianguji/index.html'),
      },
    },
  },
});
