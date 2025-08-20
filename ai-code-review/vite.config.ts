/**
 * Vite 설정 파일
 * React 애플리케이션을 위한 빌드 도구 설정
 * @see https://vite.dev/config/
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite 설정 객체
 * React 플러그인을 사용하여 JSX/TSX 파일을 처리
 */
export default defineConfig({
  plugins: [react()],
});
