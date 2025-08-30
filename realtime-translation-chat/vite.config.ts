import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// Firebase SDK 최적화를 위한 설정
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectManifest: false,
      generateSW: true,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mymemory\.translated\.net/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'translation-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1일
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Real-time Translation Chat',
        short_name: 'TransChat',
        description: '다국어 실시간 번역 채팅',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Firebase SDK 번들 크기 최적화
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-radix': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-scroll-area', '@radix-ui/react-avatar', '@radix-ui/react-label'],
          'ui-components': ['lucide-react', 'class-variance-authority', 'tailwind-merge'],
          'translation': ['franc'],
          'react-vendor': ['react', 'react-dom']
        }
      }
    },
    // 청크 크기 최적화
    chunkSizeWarningLimit: 600,
    // 소스맵 비활성화로 빌드 최적화
    sourcemap: false,
    // CSS 코드 분할
    cssCodeSplit: true,
    // 압축 최적화
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // console.log 제거
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})