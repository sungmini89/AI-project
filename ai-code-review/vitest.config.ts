/**
 * Vitest 설정 파일
 * React 애플리케이션을 위한 테스트 도구 설정
 * @see https://vitest.dev/config/
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * Vitest 설정 객체
 * jsdom 환경과 React 플러그인 사용
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
