import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base './' lets the built site work on any static host or sub-folder
// export default defineConfig({ base: './', plugins: [vue()] })
export default defineConfig({
  base: './',
  plugins: [vue()],
  server: {
    allowedHosts: true
  }
})