// apps/web/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  base: '/',                 // для Vercel і Telegram WebApp
  plugins: [react(), svgr()],
  server: { port: 5173 }
})
