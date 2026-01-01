import path from 'path'
import { defineConfig } from 'rolldown-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],
  root: 'src/webview/src',
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist/editor'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/webview/src/index.html'),
    },
    minify: false, // Keeping no-minify as per original parcel command
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src/webview/src'),
    },
  },
})
