// AI 코드 리뷰 웹사이트 설정 파일

export const config = {
  // API 설정
  api: {
    mode: import.meta.env.VITE_API_MODE || 'offline',
    gemini: {
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      dailyLimit: parseInt(import.meta.env.VITE_GEMINI_DAILY_LIMIT) || 1500,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    },
    cohere: {
      apiKey: import.meta.env.VITE_COHERE_API_KEY || '',
      monthlyLimit: parseInt(import.meta.env.VITE_COHERE_MONTHLY_LIMIT) || 1000,
      baseUrl: 'https://api.cohere.ai/v1',
    },
    huggingFace: {
      token: import.meta.env.VITE_HUGGINGFACE_TOKEN || '',
      baseUrl: 'https://api-inference.huggingface.co/models',
    },
  },

  // 개발 환경 설정
  dev: {
    useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  },

  // PWA 설정
  pwa: {
    enabled: import.meta.env.VITE_PWA_ENABLED === 'true',
  },

  // 오프라인 모드 설정
  offline: {
    enabled: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
  },

  // 국제화 설정
  i18n: {
    defaultLocale: import.meta.env.VITE_DEFAULT_LOCALE || 'ko',
    supportedLocales: ['ko', 'en'],
  },

  // 코드 분석 설정
  analysis: {
    // ESLint 규칙 설정
    eslint: {
      rules: {
        'no-unused-vars': 'warn',
        'no-console': 'warn',
        'prefer-const': 'error',
        'no-var': 'error',
        'eqeqeq': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
      },
    },
    
    // 복잡도 임계값
    complexity: {
      cyclomaticThreshold: 10,
      cognitiveThreshold: 15,
    },

    // 지원되는 프로그래밍 언어
    supportedLanguages: [
      'javascript',
      'typescript',
      'python',
      'java',
      'cpp',
      'csharp',
      'go',
      'rust',
      'php',
      'ruby',
      'swift',
      'kotlin',
    ],
  },

  // 보안 패턴 검사 설정
  security: {
    patterns: {
      sqlInjection: /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bunion\b|\bdrop\b).*(\+|concat|\|\|)/gi,
      xss: /<script[^>]*>.*?<\/script>/gi,
      hardcodedCredentials: /(password|pwd|secret|key|token)\s*[:=]\s*['"]/gi,
      unsafeEval: /\beval\s*\(|\bfunction\s*\(\s*\)\s*\{.*return.*\}/gi,
    },
  },

  // localStorage 키
  storage: {
    keys: {
      apiUsage: 'ai_code_review_api_usage',
      userSettings: 'ai_code_review_settings',
      codeHistory: 'ai_code_review_history',
      theme: 'ai_code_review_theme',
    },
  },
} as const;

export type Config = typeof config;
export default config;