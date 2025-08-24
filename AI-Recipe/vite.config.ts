/**
 * Vite 빌드 도구 설정 파일
 * AI Recipe 애플리케이션의 개발 및 빌드 환경을 구성합니다.
 * 
 * @description
 * - React 애플리케이션 빌드 설정
 * - PWA(Progressive Web App) 지원 설정
 * - 개발 서버 프록시 및 포트 설정
 * - 경로 별칭 및 모듈 해석 설정
 * - API 캐싱 및 오프라인 지원
 * 
 * @features
 * - PWA 매니페스트 및 서비스 워커 설정
 * - Spoonacular 및 Edamam API 프록시
 * - API 응답 캐싱 (24시간)
 * - 자동 업데이트 및 오프라인 지원
 * - 개발 및 프리뷰 서버 설정
 * 
 * @author AI Recipe Team
 * @version 1.0.0
 */

import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Vite 설정 객체
 * 애플리케이션의 빌드, 개발, PWA 설정을 정의합니다.
 */
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'AI Recipe Generator',
        short_name: 'AI Recipe',
        description: 'Generate recipes with AI using ingredients you have',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
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
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.spoonacular\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'spoonacular-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60 // 24 hours
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\.edamam\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'edamam-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60 // 24 hours
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/spoonacular': {
        target: 'https://api.spoonacular.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/spoonacular/, ''),
        secure: true
      },
      '/api/edamam': {
        target: 'https://api.edamam.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/edamam/, ''),
        secure: true
      }
    }
  },
  preview: {
    port: 4173,
    host: true
  }
})