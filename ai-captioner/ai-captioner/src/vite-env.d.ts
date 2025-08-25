/// <reference types="vite/client" />

/**
 * Vite 환경 변수 타입 정의
 *
 * @description
 * - import.meta.env에서 사용할 수 있는 환경 변수들의 타입 정의
 * - TypeScript 타입 체크 오류 해결
 */
interface ImportMetaEnv {
  readonly VITE_API_MODE: string;
  readonly VITE_USE_MOCK_DATA: string;
  readonly VITE_OLLAMA_BASE_URL: string;
  readonly VITE_OLLAMA_MODEL: string;
  readonly VITE_RATE_LIMIT_PER_MINUTE: string;
  readonly VITE_CUSTOM_API_BASE_URL: string;
  readonly VITE_CUSTOM_API_KEY: string;
  readonly VITE_FREE_API_BASE_URL: string;
  readonly VITE_FREE_API_KEY: string;
  readonly VITE_FREE_DAILY_LIMIT: string;
  readonly VITE_FREE_MONTHLY_LIMIT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
