// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'My PWA App',
        short_name: 'PWA App',
        description: 'My Awesome PWA App',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst'
          }
        ]
      }
    })
  ],
  preview: {
    port: 5173,
    host: true
  },
  server: {
    port: 5173,
    host: true,
    open: 'http://localhost:5173/?viewport=device-width,initial-scale=1,viewport-fit=cover,width=393,height=852'
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      target: 'esnext'
    },
    include: [
      'date-fns',
      'date-fns/_lib/format/longFormatters'
    ]
  }
})