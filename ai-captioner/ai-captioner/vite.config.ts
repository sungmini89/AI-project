import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * Vite 빌드 도구 설정 파일
 *
 * @description
 * - React 애플리케이션을 위한 Vite 설정
 * - 개발 서버 포트 및 호스트 설정
 * - 경로 별칭(@) 설정으로 절대 경로 import 지원
 * - TypeScript 및 JSX 지원
 * - React Router future flag 설정
 *
 * @returns {UserConfig} Vite 설정 객체
 */
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: { port: 5173 },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // @ 별칭을 src 폴더로 매핑
    },
  },
  define: {
    // React Router future flag 설정
    __REACT_ROUTER_FUTURE_FLAGS__: JSON.stringify({
      v7_startTransition: true,
    }),
  },
});
