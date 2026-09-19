import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/expense-dashboard/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    // Cloudflare quick tunnels break the HMR websocket and force full page reloads.
    hmr: false,
    watch: {
      // Avoid noisy restarts from inbox/jsonl or other non-src writes
      ignored: ['**/public/inbox/**', '**/dist/**', '**/.git/**'],
    },
  },
  preview: {
    host: true,
    port: 5173,
    allowedHosts: true,
  },
})
