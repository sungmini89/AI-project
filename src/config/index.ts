/**
 * AI 코드 리뷰 웹사이트 설정 파일
 * 환경 변수와 애플리케이션 설정을 중앙에서 관리
 * @module config
 */

/**
 * 애플리케이션 전체 설정 객체
 * 환경 변수에서 값을 읽어와 기본값과 함께 설정
 */
export const config = {
  /** API 관련 설정 */
  api: {
    /** API 모드 (offline, mock, free, custom) */
    mode: import.meta.env.VITE_API_MODE || "offline",
    /** Gemini AI 서비스 설정 */
    gemini: {
      /** API 키 (환경 변수에서 가져옴) */
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
      /** 일일 요청 제한 */
      dailyLimit: parseInt(import.meta.env.VITE_GEMINI_DAILY_LIMIT) || 1500,
      /** API 기본 URL */
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    },
    /** Cohere AI 서비스 설정 */
    cohere: {
      /** API 키 (환경 변수에서 가져옴) */
      apiKey: import.meta.env.VITE_COHERE_API_KEY || "",
      /** 월간 요청 제한 */
      monthlyLimit: parseInt(import.meta.env.VITE_COHERE_MONTHLY_LIMIT) || 1000,
      /** API 기본 URL */
      baseUrl: "https://api.cohere.ai/v1",
    },
    /** Hugging Face 서비스 설정 */
    huggingFace: {
      /** API 토큰 (환경 변수에서 가져옴) */
      token: import.meta.env.VITE_HUGGINGFACE_TOKEN || "",
      /** API 기본 URL */
      baseUrl: "https://api-inference.huggingface.co/models",
    },
  },

  /** 개발 환경 설정 */
  dev: {
    /** 목 데이터 사용 여부 */
    useMockData: import.meta.env.VITE_USE_MOCK_DATA === "true",
    /** 디버그 모드 활성화 여부 */
    debugMode: import.meta.env.VITE_DEBUG_MODE === "true",
  },

  /** PWA 설정 */
  pwa: {
    /** PWA 기능 활성화 여부 */
    enabled: import.meta.env.VITE_PWA_ENABLED === "true",
  },

  /** 오프라인 모드 설정 */
  offline: {
    /** 오프라인 모드 활성화 여부 */
    enabled: import.meta.env.VITE_ENABLE_OFFLINE_MODE === "true",
  },

  /** 국제화 설정 */
  i18n: {
    /** 기본 로케일 */
    defaultLocale: import.meta.env.VITE_DEFAULT_LOCALE || "ko",
    /** 지원되는 로케일 목록 */
    supportedLocales: ["ko", "en"],
  },

  /** 코드 분석 설정 */
  analysis: {
    /** ESLint 규칙 설정 */
    eslint: {
      /** ESLint 규칙들 */
      rules: {
        "no-unused-vars": "warn",
        "no-console": "warn",
        "prefer-const": "error",
        "no-var": "error",
        eqeqeq: "error",
        "no-eval": "error",
        "no-implied-eval": "error",
      },
    },

    /** 복잡도 임계값 설정 */
    complexity: {
      /** 순환 복잡도 임계값 */
      cyclomaticThreshold: 10,
      /** 인지 복잡도 임계값 */
      cognitiveThreshold: 15,
    },

    /** 지원되는 프로그래밍 언어 목록 */
    supportedLanguages: [
      "javascript",
      "typescript",
      "python",
      "java",
      "cpp",
      "csharp",
      "go",
      "rust",
      "php",
      "ruby",
      "swift",
      "kotlin",
    ],
  },

  /** 보안 패턴 검사 설정 */
  security: {
    /** 보안 위험 패턴들 */
    patterns: {
      /** SQL 인젝션 패턴 */
      sqlInjection:
        /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bunion\b|\bdrop\b).*(\+|concat|\|\|)/gi,
      /** XSS 공격 패턴 */
      xss: /<script[^>]*>.*?<\/script>/gi,
      /** 하드코딩된 자격 증명 패턴 */
      hardcodedCredentials: /(password|pwd|secret|key|token)\s*[:=]\s*['"]/gi,
      /** 안전하지 않은 eval 사용 패턴 */
      unsafeEval: /\beval\s*\(|\bfunction\s*\(\s*\)\s*\{.*return.*\}/gi,
    },
  },

  /** 로컬 스토리지 키 설정 */
  storage: {
    /** 스토리지에 사용되는 키들 */
    keys: {
      /** API 사용량 저장 키 */
      apiUsage: "ai_code_review_api_usage",
      /** 사용자 설정 저장 키 */
      userSettings: "ai_code_review_settings",
      /** 코드 히스토리 저장 키 */
      codeHistory: "ai_code_review_history",
      /** 테마 설정 저장 키 */
      theme: "ai_code_review_theme",
    },
  },
} as const;

/** 설정 객체의 타입 */
export type Config = typeof config;

export default config;
