// DECISION LOG: vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { templateCompilerOptions } from '@tresjs/core'
import path from 'path'

export default defineConfig({
  plugins: [
    vue({
      ...templateCompilerOptions
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/vietrecruit': {
        target: 'https://nguyenminh.site',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})