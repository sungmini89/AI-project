/**
 * 다국어 지원 스토어
 * 한국어와 영어를 지원하는 국제화(i18n) 기능을 제공
 * @module stores/languageStore
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** 지원되는 언어 타입 */
export type Language = "ko" | "en";
/** 지원되는 언어 타입 (별칭) */
export type SupportedLanguage = Language;

/**
 * 언어별 텍스트 인터페이스
 * 애플리케이션에서 사용되는 모든 텍스트를 언어별로 정의
 */
interface LanguageTexts {
  /** 공통 텍스트 */
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    reset: string;
    clear: string;
    back: string;
    next: string;
    finish: string;
  };

  /** 분석 결과 관련 텍스트 */
  analysis: {
    summary: string;
    eslintIssues: string;
    cyclomaticComplexity: string;
    securityIssues: string;
    aiScore: string;
    noIssuesFound: string;
    mainIssues: string;
    functionComplexity: string;
    totalComplexity: string;
    line: string;
    lineColumn: string;
    cyclomatic: string;
    cognitive: string;
    totalLines: string;
    formattingResult: string;
    formattingApplied: string;
    alreadyFormatted: string;
    changes: string;
    noSecurityIssues: string;
    noComplexityData: string;
    noPrettierData: string;
    noAIData: string;
    foundIssues: string;
    improvements: string;
    fixSuggestion: string;
    status: {
      offline: string;
      apiMode: string;
    };
  };

  /** 에디터 관련 텍스트 */
  editor: {
    language: string;
    sample: string;
    formatting: string;
    clear: string;
    line: string;
    character: string;
    readonly: string;
  };

  /** 분석 컨트롤 관련 텍스트 */
  analysisControls: {
    options: string;
    shortcuts: {
      analyze: string;
      format: string;
      new: string;
    };
    offlineNotice: string;
    aiNotice: string;
  };

  /** 탭 관련 텍스트 */
  tabs: {
    overview: string;
    eslint: string;
    complexity: string;
    security: string;
    ai: string;
    prettier: string;
  };

  /** 홈페이지 기능 설명 텍스트 */
  features: {
    eslint: {
      title: string;
      description: string;
    };
    complexity: {
      title: string;
      description: string;
    };
    security: {
      title: string;
      description: string;
    };
    ai: {
      title: string;
      description: string;
    };
    prettier: {
      title: string;
      description: string;
    };
    offline: {
      title: string;
      description: string;
    };
  };

  /** 홈페이지 관련 텍스트 */
  home: {
    title: string;
    subtitle: string;
    description: {
      line1: string;
      line2: string;
      line3: string;
    };
    features: {
      title: string;
    };
    plans: {
      offline: {
        name: string;
        price: string;
        features: {
          eslint: string;
          complexity: string;
          security: string;
          prettier: string;
          unlimited: string;
        };
      };
      gemini: {
        name: string;
        price: string;
        features: {
          allOffline: string;
          aiReview: string;
          apiCalls: string;
          advanced: string;
        };
      };
      custom: {
        name: string;
        price: string;
        featuress: {
          allFeatures: string;
          noLimit: string;
          personalKey: string;
          highestQuality: string;
        };
      };
    };
    getStarted: string;
    getStartedDesc: string;
    startAnalyzing2: string;
    configureAPI2: string;
    ui: {
      supportedLanguages: string;
      howToUse: string;
      currentlyUsing: string;
      configure: string;
    };
  };

  /** UI 관련 텍스트 */
  ui: {
    aiEnabled: string;
    offlineMode: string;
    apiMode: string;
    supportedLanguages: string;
    dailyFreeCalls: string;
    browserBased: string;
    apiKeyRequired: string;
  };

  /** CTA 관련 텍스트 */
  cta: {
    startAnalyzing: string;
    tryOfflineMode: string;
  };

  /** Footer 관련 텍스트 */
  footer: {
    description: string;
    keyFeatures: string;
    apiProviders: string;
    copyright: string;
    apiLimits: string;
  };

  /** API 키 관련 텍스트 */
  apiKeys: {
    title: string;
    gemini: string;
    cohere: string;
    getKey: string;
    save: string;
    enterGemini: string;
    enterCohere: string;
  };

  /** 네비게이션 관련 텍스트 */
  navigation: {
    backToHome: string;
  };

  /** 테마 관련 텍스트 */
  theme: string;
  themeLight: string;
  themeDark: string;

  /** 일반 텍스트 */
  test: string;
  freeTier: string;
  dailyRequests: string;
  monthlyRequests: string;

  /** 분석 결과 관련 텍스트 */
  analysisResults: {
    loading: string;
    waiting: string;
    waitingDescription: string;
    complexity: string;
    security: string;
    ai: string;
  };

  /** 분석기 관련 텍스트 */
  analyzer: {
    title: string;
  };

  /** 오프라인 페이지 관련 텍스트 */
  offlinePage: {
    noCode: string;
    noCodeMessage: string;
    analysisComplete: string;
    analysisCompleteMessage: string;
    analysisFailed: string;
    analysisFailedMessage: string;
    formattingUnsupported: string;
    formattingUnsupportedMessage: string;
    formattingComplete: string;
    formattingCompleteMessage: string;
    formattingNotNeeded: string;
    formattingNotNeededMessage: string;
    formattingFailed: string;
    sampleLoaded: string;
    sampleLoadedMessage: string;
    modes: {
      offline: string;
      unlimited: string;
    };
    description: {
      title: string;
      content: string;
      features: {
        eslint: string;
        complexity: string;
        security: string;
        formatting: string;
      };
    };
    buttons: {
      analyzing: string;
      analyze: string;
      format: string;
      loadSample: string;
    };
    issues: string;
    aiNotice: string;
    ready: string;
    readyDescription: string;
    analyzing: string;
  };

  /** 오프라인 관련 텍스트 */
  offline: {
    title: string;
  };

  /** 설정 확장 관련 텍스트 */
  settings: {
    title: string;
    appearance: {
      title: string;
      language: string;
    };
    api: {
      title: string;
      modes: {
        offline: string;
        free: string;
        custom: string;
      };
      descriptions: {
        offline: string;
        free: string;
        custom: string;
      };
      usage: {
        title: string;
        today: string;
        monthly: string;
      };
    };
    preferences: {
      title: string;
      autoFormat: string;
      realTimeAnalysis: string;
      showComplexity: string;
      showSecurity: string;
      enableAI: string;
      descriptions: {
        autoFormat: string;
        realTimeAnalysis: string;
        showComplexity: string;
        showSecurity: string;
        enableAI: string;
      };
    };
    data: {
      title: string;
      export: string;
      import: string;
      reset: string;
    };
    info: {
      title: string;
      apiKeyStorage: string;
      apiLimits: string;
      offlineMode: string;
      browserStorage: string;
      appTitle: string;
    };
    messages: {
      apiKeySaved: string;
      apiKeyRemoved: string;
      testNotPossible: string;
      enterApiKeyFirst: string;
      apiKeyTest: string;
      testSuccess: string;
      exportComplete: string;
      exportCompleteDetail: string;
      exportFailed: string;
      exportFailedDetail: string;
      importComplete: string;
      importCompleteDetail: string;
      importFailed: string;
      invalidFile: string;
      fileReadFailed: string;
      fileReadFailedDetail: string;
      confirmReset: string;
      resetComplete: string;
      resetCompleteDetail: string;
    };
  };
}

const koreanTexts: LanguageTexts = {
  common: {
    loading: "로딩 중...",
    error: "오류",
    retry: "다시 시도",
    cancel: "취소",
    save: "저장",
    reset: "초기화",
    clear: "지우기",
    back: "뒤로",
    next: "다음",
    finish: "완료",
  },
  analysis: {
    summary: "분석 요약",
    eslintIssues: "ESLint 이슈",
    cyclomaticComplexity: "순환 복잡도",
    securityIssues: "보안 이슈",
    aiScore: "AI 점수",
    noIssuesFound: "발견된 이슈가 없습니다!",
    mainIssues: "주요 이슈",
    functionComplexity: "함수별 복잡도",
    totalComplexity: "전체 복잡도",
    line: "줄",
    lineColumn: "줄",
    cyclomatic: "순환",
    cognitive: "인지",
    totalLines: "총 줄 수",
    formattingResult: "포맷팅 결과",
    formattingApplied: "코드 포맷팅이 적용되었습니다.",
    alreadyFormatted: "코드가 이미 올바른 형식입니다.",
    changes: "변경 사항:",
    noSecurityIssues: "보안 이슈가 발견되지 않았습니다.",
    noComplexityData: "복잡도 분석 결과가 없습니다.",
    noPrettierData: "Prettier 분석 결과가 없습니다.",
    noAIData: "AI 분석 결과가 없습니다.",
    foundIssues: "발견된 이슈",
    improvements: "개선 제안",
    fixSuggestion: "수정 제안:",
    status: {
      offline: "오프라인 모드",
      apiMode: "API 모드",
    },
  },
  editor: {
    language: "언어",
    sample: "샘플 코드",
    formatting: "포맷팅",
    clear: "지우기",
    line: "줄",
    character: "문자",
    readonly: "읽기 전용",
  },
  analysisControls: {
    options: "분석 옵션",
    shortcuts: {
      analyze: "분석하기",
      format: "포맷팅",
      new: "새로 작성",
    },
    offlineNotice: "오프라인 모드에서는 AI 분석을 사용할 수 없습니다.",
    aiNotice: "AI 분석은 API 키가 필요하며 사용량이 제한될 수 있습니다.",
  },
  tabs: {
    overview: "개요",
    eslint: "ESLint",
    complexity: "복잡도",
    security: "보안",
    ai: "AI 분석",
    prettier: "Prettier",
  },
  features: {
    eslint: {
      title: "ESLint 분석",
      description:
        "JavaScript/TypeScript 코드의 문법 오류와 스타일 문제를 자동으로 검출합니다.",
    },
    complexity: {
      title: "복잡도 분석",
      description:
        "코드의 순환 복잡도와 인지 복잡도를 측정하여 유지보수성을 평가합니다.",
    },
    security: {
      title: "보안 검사",
      description:
        "잠재적인 보안 취약점을 식별하여 안전한 코드 작성을 지원합니다.",
    },
    ai: {
      title: "AI 코드 리뷰",
      description:
        "첨단 AI 기술로 코드 품질을 종합적으로 평가하고 개선 방안을 제시합니다.",
    },
    prettier: {
      title: "Prettier 포맷팅",
      description: "일관된 코드 스타일을 위한 자동 포맷팅 기능을 제공합니다.",
    },
    offline: {
      title: "오프라인 모드",
      description: "인터넷 연결 없이도 기본 분석 기능을 사용할 수 있습니다.",
    },
  },
  home: {
    title: "AI 코드 리뷰",
    subtitle: "스마트한 코드 분석",
    description: {
      line1: "최첨단 AI 기술로 코드를 분석하고",
      line2: "품질을 향상시키세요.",
      line3: "무료로 시작하여 전문가 수준의 리뷰를 받아보세요.",
    },
    features: {
      title: "주요 기능",
    },
    plans: {
      offline: {
        name: "오프라인 모드",
        price: "무료",
        features: {
          eslint: "ESLint 분석",
          complexity: "복잡도 분석",
          security: "보안 검사",
          prettier: "Prettier 포맷팅",
          unlimited: "무제한 사용",
        },
      },
      gemini: {
        name: "Gemini API",
        price: "무료 (제한적)",
        features: {
          allOffline: "모든 오프라인 기능",
          aiReview: "AI 코드 리뷰",
          apiCalls: "일일 1,500회 호출",
          advanced: "고급 분석 기능",
        },
      },
      custom: {
        name: "개인 API",
        price: "사용량에 따라",
        featuress: {
          allFeatures: "모든 기능 포함",
          noLimit: "사용량 제한 없음",
          personalKey: "개인 API 키 사용",
          highestQuality: "최고 품질 분석",
        },
      },
    },
    getStarted: "지금 시작하기",
    getStartedDesc: "몇 초 만에 코드 분석을 시작할 수 있습니다.",
    startAnalyzing2: "분석 시작하기",
    configureAPI2: "API 설정하기",
    ui: {
      supportedLanguages: "지원 언어",
      howToUse: "사용 방법",
      currentlyUsing: "현재 사용 중",
      configure: "설정하기",
    },
  },
  ui: {
    aiEnabled: "AI 활성화",
    offlineMode: "오프라인 모드",
    apiMode: "API 모드",
    supportedLanguages: "지원 언어",
    dailyFreeCalls: "일일 무료 호출",
    browserBased: "브라우저 기반",
    apiKeyRequired: "API 키 필요",
  },
  cta: {
    startAnalyzing: "분석 시작하기",
    tryOfflineMode: "오프라인 모드 체험",
  },
  footer: {
    description: "개발자를 위한 스마트한 코드 분석 도구",
    keyFeatures: "주요 기능",
    apiProviders: "API 제공업체",
    copyright: "© 2024 AI 코드 리뷰. 모든 권리 보유.",
    apiLimits: "API 사용량은 제공업체의 정책에 따라 제한될 수 있습니다.",
  },
  apiKeys: {
    title: "API 키 설정",
    gemini: "Gemini API",
    cohere: "Cohere API",
    getKey: "API 키 발급받기",
    save: "저장",
    enterGemini: "Gemini API 키를 입력하세요",
    enterCohere: "Cohere API 키를 입력하세요",
  },
  navigation: {
    backToHome: "홈으로 돌아가기",
  },
  theme: "테마",
  themeLight: "라이트",
  themeDark: "다크",
  test: "테스트",
  freeTier: "무료 티어",
  dailyRequests: "일일 요청",
  monthlyRequests: "월간 요청",
  analyzer: {
    title: "코드 분석기",
  },
  analysisResults: {
    loading: "분석 중",
    waiting: "분석 결과 대기 중",
    waitingDescription: "코드를 입력하고 분석 버튼을 눌러주세요.",
    complexity: "복잡도 분석",
    security: "보안 검사",
    ai: "AI 분석",
  },
  offlinePage: {
    noCode: "코드가 없습니다",
    noCodeMessage: "분석할 코드를 먼저 입력해 주세요.",
    analysisComplete: "분석 완료",
    analysisCompleteMessage: "코드 분석이 성공적으로 완료되었습니다.",
    analysisFailed: "분석 실패",
    analysisFailedMessage: "코드 분석 중 오류가 발생했습니다.",
    formattingUnsupported: "포맷팅 지원 안함",
    formattingUnsupportedMessage: " 언어는 포맷팅을 지원하지 않습니다.",
    formattingComplete: "포맷팅 완료",
    formattingCompleteMessage: "코드 포맷팅이 완료되었습니다.",
    formattingNotNeeded: "포맷팅 불필요",
    formattingNotNeededMessage: "코드가 이미 올바른 형식입니다.",
    formattingFailed: "포맷팅 실패",
    sampleLoaded: "샘플 로드 완료",
    sampleLoadedMessage: " 샘플 코드가 로드되었습니다.",
    modes: {
      offline: "오프라인 모드",
      unlimited: "무제한 사용",
    },
    description: {
      title: "오프라인 모드 특징",
      content: "인터넷 연결 없이 기본적인 코드 분석 기능을 사용할 수 있습니다.",
      features: {
        eslint: "ESLint를 통한 코드 품질 검사",
        complexity: "복잡도 분석 및 리팩토링 제안",
        security: "기본적인 보안 취약점 검사",
        formatting: "Prettier를 통한 코드 포맷팅",
      },
    },
    buttons: {
      analyzing: "분석 중...",
      analyze: "코드 분석",
      format: "포맷팅",
      loadSample: "샘플 로드",
    },
    issues: "발견된 이슈",
    aiNotice: "AI 기반 분석을 원하신다면 으로 이동하세요.",
    ready: "분석 준비 완료",
    readyDescription: "코드를 입력하고 오프라인 분석을 시작해보세요.",
    analyzing: "오프라인 분석 중...",
  },
  offline: {
    title: "오프라인 모드",
  },
  settings: {
    title: "설정",
    appearance: {
      title: "외관",
      language: "언어",
    },
    api: {
      title: "API 설정",
      modes: {
        offline: "오프라인 모드",
        free: "무료 API",
        custom: "개인 API",
      },
      descriptions: {
        offline: "인터넷 연결 없이 기본 분석만 사용",
        free: "Google AI Studio 무료 API 사용 (제한적)",
        custom: "개인 API 키로 무제한 사용",
      },
      usage: {
        title: "API 사용량",
        today: "오늘",
        monthly: "이번 달",
      },
    },
    preferences: {
      title: "분석 설정",
      autoFormat: "자동 포맷팅",
      realTimeAnalysis: "실시간 분석",
      showComplexity: "복잡도 분석 표시",
      showSecurity: "보안 검사 표시",
      enableAI: "AI 분석 활성화",
      descriptions: {
        autoFormat: "코드를 분석할 때 자동으로 포맷팅 적용",
        realTimeAnalysis: "코드 입력 중 실시간으로 기본 분석 수행",
        showComplexity: "복잡도 분석 결과를 분석 탭에 표시",
        showSecurity: "보안 검사 결과를 분석 탭에 표시",
        enableAI: "API 키가 설정된 경우 AI 기반 코드 리뷰 활성화",
      },
    },
    data: {
      title: "데이터 관리",
      export: "설정 내보내기",
      import: "설정 가져오기",
      reset: "설정 초기화",
    },
    info: {
      title: "정보",
      apiKeyStorage: "API 키는 브라우저에 암호화되어 저장됩니다",
      apiLimits: "API 사용량은 제공업체 정책에 따라 제한됩니다",
      offlineMode: "오프라인 모드에서는 기본 분석만 가능합니다",
      browserStorage: "모든 설정은 브라우저 로컬 스토리지에 저장됩니다",
      appTitle: "AI 코드 리뷰",
    },
    messages: {
      apiKeySaved: "API 키 저장됨",
      apiKeyRemoved: "API 키 제거됨",
      testNotPossible: "테스트 불가",
      enterApiKeyFirst: "API 키를 먼저 입력하세요",
      apiKeyTest: "API 키 테스트",
      testSuccess: "API 키가 올바르게 작동합니다",
      exportComplete: "설정 내보내기 완료",
      exportCompleteDetail: "설정이 파일로 다운로드되었습니다",
      exportFailed: "내보내기 실패",
      exportFailedDetail: "설정을 내보내는데 실패했습니다",
      importComplete: "설정 가져오기 완료",
      importCompleteDetail: "설정이 성공적으로 적용되었습니다",
      importFailed: "가져오기 실패",
      invalidFile: "올바르지 않은 파일 형식입니다",
      fileReadFailed: "파일 읽기 실패",
      fileReadFailedDetail: "파일을 읽는데 실패했습니다",
      confirmReset:
        "모든 설정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      resetComplete: "설정 초기화 완료",
      resetCompleteDetail: "모든 설정이 기본값으로 복원되었습니다",
    },
  },
};

const englishTexts: LanguageTexts = {
  common: {
    loading: "Loading...",
    error: "Error",
    retry: "Retry",
    cancel: "Cancel",
    save: "Save",
    reset: "Reset",
    clear: "Clear",
    back: "Back",
    next: "Next",
    finish: "Finish",
  },
  analysis: {
    summary: "Analysis Summary",
    eslintIssues: "ESLint Issues",
    cyclomaticComplexity: "Cyclomatic Complexity",
    securityIssues: "Security Issues",
    aiScore: "AI Score",
    noIssuesFound: "No issues found!",
    mainIssues: "Main Issues",
    functionComplexity: "Function Complexity",
    totalComplexity: "Total Complexity",
    line: "Line",
    lineColumn: "Line",
    cyclomatic: "Cyclomatic",
    cognitive: "Cognitive",
    totalLines: "Total Lines",
    formattingResult: "Formatting Result",
    formattingApplied: "Code formatting has been applied.",
    alreadyFormatted: "Code is already properly formatted.",
    changes: "Changes:",
    noSecurityIssues: "No security issues found.",
    noComplexityData: "No complexity analysis data.",
    noPrettierData: "No Prettier analysis data.",
    noAIData: "No AI analysis data.",
    foundIssues: "Found Issues",
    improvements: "Improvements",
    fixSuggestion: "Fix suggestion:",
    status: {
      offline: "Offline Mode",
      apiMode: "API Mode",
    },
  },
  editor: {
    language: "Language",
    sample: "Sample Code",
    formatting: "Format",
    clear: "Clear",
    line: "Line",
    character: "Character",
    readonly: "Read-only",
  },
  analysisControls: {
    options: "Analysis Options",
    shortcuts: {
      analyze: "Analyze",
      format: "Format",
      new: "New",
    },
    offlineNotice: "AI analysis is not available in offline mode.",
    aiNotice: "AI analysis requires API key and usage may be limited.",
  },
  tabs: {
    overview: "Overview",
    eslint: "ESLint",
    complexity: "Complexity",
    security: "Security",
    ai: "AI Analysis",
    prettier: "Prettier",
  },
  features: {
    eslint: {
      title: "ESLint Analysis",
      description:
        "Automatically detect syntax errors and style issues in JavaScript/TypeScript code.",
    },
    complexity: {
      title: "Complexity Analysis",
      description:
        "Measure cyclomatic and cognitive complexity to evaluate code maintainability.",
    },
    security: {
      title: "Security Check",
      description:
        "Identify potential security vulnerabilities to support safe code writing.",
    },
    ai: {
      title: "AI Code Review",
      description:
        "Comprehensively evaluate code quality and suggest improvements using advanced AI technology.",
    },
    prettier: {
      title: "Prettier Formatting",
      description: "Provide automatic formatting for consistent code style.",
    },
    offline: {
      title: "Offline Mode",
      description:
        "Use basic analysis features even without internet connection.",
    },
  },
  home: {
    title: "AI Code Review",
    subtitle: "Smart Code Analysis",
    description: {
      line1: "Analyze your code with cutting-edge AI technology",
      line2: "and improve quality.",
      line3: "Start for free and get professional-level reviews.",
    },
    features: {
      title: "Key Features",
    },
    plans: {
      offline: {
        name: "Offline Mode",
        price: "Free",
        features: {
          eslint: "ESLint Analysis",
          complexity: "Complexity Analysis",
          security: "Security Check",
          prettier: "Prettier Formatting",
          unlimited: "Unlimited Usage",
        },
      },
      gemini: {
        name: "Gemini API",
        price: "Free (Limited)",
        features: {
          allOffline: "All Offline Features",
          aiReview: "AI Code Review",
          apiCalls: "1,500 Daily API Calls",
          advanced: "Advanced Analysis",
        },
      },
      custom: {
        name: "Personal API",
        price: "Based on Usage",
        featuress: {
          allFeatures: "All Features Included",
          noLimit: "No Usage Limits",
          personalKey: "Use Personal API Key",
          highestQuality: "Highest Quality Analysis",
        },
      },
    },
    getStarted: "Get Started Now",
    getStartedDesc: "Start analyzing your code in seconds.",
    startAnalyzing2: "Start Analyzing",
    configureAPI2: "Configure API",
    ui: {
      supportedLanguages: "Supported Languages",
      howToUse: "How to Use",
      currentlyUsing: "Currently Using",
      configure: "Configure",
    },
  },
  ui: {
    aiEnabled: "AI Enabled",
    offlineMode: "Offline Mode",
    apiMode: "API Mode",
    supportedLanguages: "Supported Languages",
    dailyFreeCalls: "Daily Free Calls",
    browserBased: "Browser Based",
    apiKeyRequired: "API Key Required",
  },
  cta: {
    startAnalyzing: "Start Analyzing",
    tryOfflineMode: "Try Offline Mode",
  },
  footer: {
    description: "Smart code analysis tool for developers",
    keyFeatures: "Key Features",
    apiProviders: "API Providers",
    copyright: "© 2024 AI Code Review. All rights reserved.",
    apiLimits: "API usage may be limited according to provider policies.",
  },
  apiKeys: {
    title: "API Key Settings",
    gemini: "Gemini API",
    cohere: "Cohere API",
    getKey: "Get API Key",
    save: "Save",
    enterGemini: "Enter your Gemini API key",
    enterCohere: "Enter your Cohere API key",
  },
  navigation: {
    backToHome: "Back to Home",
  },
  theme: "Theme",
  themeLight: "Light",
  themeDark: "Dark",
  test: "Test",
  freeTier: "Free Tier",
  dailyRequests: "Daily Requests",
  monthlyRequests: "Monthly Requests",
  analyzer: {
    title: "Code Analyzer",
  },
  analysisResults: {
    loading: "Analyzing",
    waiting: "Waiting for Analysis Results",
    waitingDescription: "Please enter code and click the analyze button.",
    complexity: "Complexity Analysis",
    security: "Security Check",
    ai: "AI Analysis",
  },
  offlinePage: {
    noCode: "No Code",
    noCodeMessage: "Please enter code to analyze first.",
    analysisComplete: "Analysis Complete",
    analysisCompleteMessage: "Code analysis completed successfully.",
    analysisFailed: "Analysis Failed",
    analysisFailedMessage: "An error occurred during code analysis.",
    formattingUnsupported: "Formatting Unsupported",
    formattingUnsupportedMessage: " language does not support formatting.",
    formattingComplete: "Formatting Complete",
    formattingCompleteMessage: "Code formatting completed.",
    formattingNotNeeded: "Formatting Not Needed",
    formattingNotNeededMessage: "Code is already properly formatted.",
    formattingFailed: "Formatting Failed",
    sampleLoaded: "Sample Loaded",
    sampleLoadedMessage: " sample code has been loaded.",
    modes: {
      offline: "Offline Mode",
      unlimited: "Unlimited Usage",
    },
    description: {
      title: "Offline Mode Features",
      content: "Use basic code analysis features without internet connection.",
      features: {
        eslint: "Code quality check with ESLint",
        complexity: "Complexity analysis and refactoring suggestions",
        security: "Basic security vulnerability check",
        formatting: "Code formatting with Prettier",
      },
    },
    buttons: {
      analyzing: "Analyzing...",
      analyze: "Analyze Code",
      format: "Format",
      loadSample: "Load Sample",
    },
    issues: "Found Issues",
    aiNotice: "For AI-powered analysis, visit the page.",
    ready: "Analysis Ready",
    readyDescription: "Enter your code and start offline analysis.",
    analyzing: "Analyzing offline...",
  },
  offline: {
    title: "Offline Mode",
  },
  settings: {
    title: "Settings",
    appearance: {
      title: "Appearance",
      language: "Language",
    },
    api: {
      title: "API Settings",
      modes: {
        offline: "Offline Mode",
        free: "Free API",
        custom: "Personal API",
      },
      descriptions: {
        offline: "Use basic analysis only without internet connection",
        free: "Use Google AI Studio free API (limited)",
        custom: "Unlimited usage with personal API key",
      },
      usage: {
        title: "API Usage",
        today: "Today",
        monthly: "This Month",
      },
    },
    preferences: {
      title: "Analysis Settings",
      autoFormat: "Auto Format",
      realTimeAnalysis: "Real-time Analysis",
      showComplexity: "Show Complexity Analysis",
      showSecurity: "Show Security Check",
      enableAI: "Enable AI Analysis",
      descriptions: {
        autoFormat: "Automatically apply formatting when analyzing code",
        realTimeAnalysis: "Perform basic analysis in real-time while typing",
        showComplexity: "Display complexity analysis results in analysis tab",
        showSecurity: "Display security check results in analysis tab",
        enableAI: "Enable AI-based code review when API key is configured",
      },
    },
    data: {
      title: "Data Management",
      export: "Export Settings",
      import: "Import Settings",
      reset: "Reset Settings",
    },
    info: {
      title: "Information",
      apiKeyStorage: "API keys are encrypted and stored in browser",
      apiLimits: "API usage is limited by provider policies",
      offlineMode: "Only basic analysis available in offline mode",
      browserStorage: "All settings are stored in browser local storage",
      appTitle: "AI Code Review",
    },
    messages: {
      apiKeySaved: "API Key Saved",
      apiKeyRemoved: "API Key Removed",
      testNotPossible: "Test Not Possible",
      enterApiKeyFirst: "Please enter API key first",
      apiKeyTest: "API Key Test",
      testSuccess: "API key is working correctly",
      exportComplete: "Export Complete",
      exportCompleteDetail: "Settings have been downloaded as file",
      exportFailed: "Export Failed",
      exportFailedDetail: "Failed to export settings",
      importComplete: "Import Complete",
      importCompleteDetail: "Settings have been successfully applied",
      importFailed: "Import Failed",
      invalidFile: "Invalid file format",
      fileReadFailed: "File Read Failed",
      fileReadFailedDetail: "Failed to read the file",
      confirmReset:
        "Are you sure you want to reset all settings? This action cannot be undone.",
      resetComplete: "Reset Complete",
      resetCompleteDetail: "All settings have been restored to default values",
    },
  },
};

interface LanguageState {
  currentLanguage: Language;
  texts: LanguageTexts;
  setLanguage: (language: Language) => void;
  getText: (path: string) => string;
}

const getTexts = (language: Language): LanguageTexts => {
  return language === "ko" ? koreanTexts : englishTexts;
};

const getNestedValue = (obj: any, path: string): string => {
  return path.split(".").reduce((current, key) => current?.[key], obj) || path;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: "ko",
      texts: koreanTexts,

      setLanguage: (language: Language) => {
        const texts = getTexts(language);
        set({ currentLanguage: language, texts });
      },

      getText: (path: string) => {
        const { texts } = get();
        return getNestedValue(texts, path);
      },
    }),
    {
      name: "language-store",
      version: 1,
    }
  )
);
