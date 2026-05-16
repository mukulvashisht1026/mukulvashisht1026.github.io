import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/game/',
  build: {
    rollupOptions: {
      input: 'game.html',
    },
    outDir: 'game',
    emptyOutDir: true,
  },
  server: {
    open: '/game.html',
    host: true,
  },
})
