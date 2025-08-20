import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1년
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}?v=1`;
              }
            }
          }
        ]
      },
      includeAssets: ['icons/diary-icon.svg'],
      manifest: {
        name: 'AI 감정 일기장',
        short_name: 'AI 일기장',
        description: 'AI가 분석하는 스마트한 감정 일기장',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/diary-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'icons/diary-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          },
          {
            src: 'icons/diary-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          editor: ['@tiptap/react', '@tiptap/starter-kit'],
          charts: ['chart.js', 'react-chartjs-2'],
          ui: ['lucide-react', 'react-hot-toast'],
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tiptap/react',
      '@tiptap/starter-kit',
      'chart.js',
      'react-chartjs-2'
    ]
  }
})