// DECISION LOG: vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { templateCompilerOptions } from '@tresjs/core'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'https://nguyenminh.site'

  return {
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
          target: apiTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})