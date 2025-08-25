/**
 * @fileoverview Vite 빌드 도구 설정 파일
 * @description 이력서-채용공고 매칭 분석 애플리케이션의 빌드 설정을 정의합니다.
 * React 플러그인, PWA 설정, 경로 별칭, 번들 최적화 등의 설정을 포함합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

/**
 * Vite 빌드 도구 설정
 * @description 애플리케이션의 빌드 프로세스와 개발 서버 설정을 정의합니다.
 *
 * 주요 설정:
 * - React 플러그인: JSX 및 React 컴포넌트 지원
 * - PWA 플러그인: Progressive Web App 기능 지원
 * - 경로 별칭: '@'를 src 디렉토리로 매핑
 * - 번들 최적화: 코드 스플리팅 및 청크 분리
 * - 개발 서버: 포트 3000에서 자동 실행
 *
 * @returns {import('vite').UserConfig} Vite 설정 객체
 *
 * @example
 * 이 파일은 Vite 빌드 도구에 의해 자동으로 로드됩니다.
 * 개발 시에는 `npm run dev` 명령으로 실행됩니다.
 */
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.cohere\.ai\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "cohere-api-cache",
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
        ],
      },
      manifest: {
        name: "이력서 채용공고 매칭 분석",
        short_name: "Resume Matcher",
        description: "AI 기반 이력서와 채용공고 매칭 분석 플랫폼",
        theme_color: "#3b82f6",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["pdfjs-dist"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          pdf: ["pdfjs-dist"],
          nlp: ["natural"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-progress",
            "framer-motion",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    open: true,
  },
});
