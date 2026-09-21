import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // 相对路径构建，从任意子路径部署均可正常加载资源
  base: './',
  build: {
    rollupOptions: {
      // 多页入口：时钟主页 + 日历学习页
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        calendar: fileURLToPath(new URL('./calendar.html', import.meta.url)),
      },
    },
  },
});
