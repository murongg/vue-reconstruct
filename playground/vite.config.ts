import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      assert: require.resolve('assert'),
    },
  },
  define: {
    'process.env': {},
  },
  plugins: [vue(), Unocss()],
  build: {
    rollupOptions: {
      external: ['flow-parser'],
    },
  },
})

