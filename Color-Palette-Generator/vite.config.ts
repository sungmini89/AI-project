import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import viteImagemin from 'vite-plugin-imagemin'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - only in analyze mode
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    // 이미지 최적화 - 프로덕션 빌드에서만
    process.env.NODE_ENV === 'production' && viteImagemin({
      // PNG 최적화
      optipng: {
        optimizationLevel: 7,
      },
      // JPEG 최적화
      mozjpeg: {
        quality: 80,
      },
      // SVG 최적화
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
      // GIF 최적화
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      // WebP 변환
      webp: {
        quality: 75,
      },
    }),
    // PWA 설정
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.colormind\.io/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-colormind',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5분
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/www\.thecolorapi\.com/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-thecolor',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 60, // 30분
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30일
              },
            },
          },
        ],
      },
      manifest: {
        name: 'AI 색상 팔레트 생성기',
        short_name: 'ColorPalette',
        description: '한국어 키워드로 AI 기반 색상 팔레트를 생성하는 도구',
        theme_color: '#3B82F6',
        background_color: '#F8FAFC',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            src: '/pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        categories: ['productivity', 'design', 'utilities'],
        lang: 'ko',
        dir: 'ltr',
        shortcuts: [
          {
            name: '새 팔레트 생성',
            short_name: '생성',
            description: '새로운 색상 팔레트 생성',
            url: '/generator',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: '저장된 팔레트',
            short_name: '저장됨',
            description: '저장된 팔레트 보기',
            url: '/saved',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'node-vibrant', 
      'framer-motion', 
      '@radix-ui/react-slot',
      'react',
      'react-dom',
      'react-router-dom'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  
  // 개발 시 빠른 새로고침을 위한 설정
  esbuild: {
    // 개발 모드에서 console.log 유지, 프로덕션에서만 제거
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    // 성능 최적화 설정
    minify: 'terser',
    sourcemap: false, // 프로덕션에서는 소스맵 비활성화
    cssMinify: true,
    
    rollupOptions: {
      output: {
        // 청크 분할 최적화
        manualChunks: (id) => {
          // 벤더 라이브러리 분리
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('framer-motion')) {
              return 'animation'
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor'
            }
            if (id.includes('node-vibrant')) {
              return 'image-processing'
            }
            return 'vendor'
          }
          
          // 컴포넌트별 청크 분리
          if (id.includes('/components/magicui/')) {
            return 'magic-ui'
          }
          if (id.includes('/algorithms/')) {
            return 'algorithms'
          }
          if (id.includes('/services/')) {
            return 'services'
          }
        },
        
        // 파일명 최적화
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.ts', '').replace('.tsx', '')
          : 'chunk'
          return `js/${facadeModuleId}-[hash].js`
        },
        
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash].${ext}`
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        }
      }
    },
    
    // 청크 크기 경고 설정
    chunkSizeWarningLimit: 500,
    
    // 압축 설정
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
      },
      mangle: {
        safari10: true,
      },
    },
  },
  
  // 개발 서버 최적화
  server: {
    hmr: {
      overlay: false
    }
  }
})