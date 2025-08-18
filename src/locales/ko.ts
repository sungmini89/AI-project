// 한국어 번역 파일
export default {
  common: {
    loading: '로딩 중...',
    error: '오류',
    success: '성공',
    warning: '경고',
    info: '정보',
    cancel: '취소',
    confirm: '확인',
    save: '저장',
    delete: '삭제',
    edit: '편집',
    back: '뒤로',
    next: '다음',
    previous: '이전',
    retry: '다시 시도',
    clear: '지우기',
    reset: '초기화',
    export: '내보내기',
    import: '가져오기',
    close: '닫기'
  },

  navigation: {
    home: '홈',
    analyze: '코드 분석',
    offline: '오프라인 도구',
    settings: '설정',
    backToHome: '← 홈으로'
  },

  home: {
    title: 'AI 코드 리뷰 서비스',
    subtitle: '무료 AI API와 정적 분석으로 코드 품질을 향상시키세요',
    description: {
      line1: '실시간 ESLint 검사, 코드 복잡도 분석, 보안 패턴 검사',
      line2: 'Google Gemini와 Cohere API를 활용한 AI 기반 코드 리뷰',
      line3: '완전한 오프라인 모드와 PWA 지원으로 언제 어디서나 사용 가능'
    },
    features: {
      title: '주요 기능',
      realtime: {
        title: '실시간 분석',
        description: 'ESLint와 Prettier를 활용한 실시간 코드 품질 검사'
      },
      ai: {
        title: 'AI 코드 리뷰',
        description: 'Google Gemini와 Cohere API를 통한 지능형 코드 분석'
      },
      offline: {
        title: '오프라인 지원',
        description: '인터넷 연결 없이도 정적 분석 도구 사용 가능'
      },
      security: {
        title: '보안 분석',
        description: 'SQL 인젝션, XSS 등 보안 취약점 패턴 감지'
      },
      complexity: {
        title: '복잡도 측정',
        description: 'McCabe 복잡도와 인지 복잡도 계산'
      },
      multilang: {
        title: '다중 언어 지원',
        description: '12개 프로그래밍 언어 지원'
      }
    },
    cta: {
      startAnalysis: '코드 분석 시작',
      tryOffline: '오프라인 도구 체험',
      configureAPI: 'API 설정'
    }
  },

  analyzer: {
    title: 'AI 코드 분석',
    newAnalysis: '새 분석',
    analyze: '분석 시작',
    analyzing: '분석 중...',
    format: '코드 포맷팅',
    formatting: '포맷팅 중...',
    
    options: {
      title: '분석 옵션',
      eslint: 'ESLint 검사',
      prettier: 'Prettier 포맷팅',
      complexity: '복잡도 분석',
      security: '보안 검사',
      ai: 'AI 리뷰'
    },

    editor: {
      language: '프로그래밍 언어',
      placeholder: '분석할 코드를 입력하거나 붙여넣어 주세요...',
      loadSample: '샘플 코드 불러오기'
    },

    results: {
      title: '분석 결과',
      noResults: '분석 결과가 없습니다.',
      eslint: 'ESLint 검사 결과',
      prettier: '코드 포맷팅',
      complexity: '복잡도 분석',
      security: '보안 분석',
      ai: 'AI 분석 결과',
      
      tabs: {
        overview: '개요',
        issues: '문제점',
        suggestions: '개선 제안',
        metrics: '지표'
      },

      severity: {
        error: '오류',
        warning: '경고',
        info: '정보',
        low: '낮음',
        medium: '보통',
        high: '높음',
        critical: '심각'
      },

      complexity: {
        cyclomatic: '순환 복잡도',
        cognitive: '인지 복잡도',
        lines: '코드 라인 수',
        functions: '함수별 복잡도',
        overall: '전체 복잡도',
        levels: {
          low: '낮음',
          medium: '보통',
          high: '높음',
          'very-high': '매우 높음'
        }
      },

      security: {
        score: '보안 점수',
        level: '보안 수준',
        issues: '보안 이슈',
        levels: {
          safe: '안전',
          warning: '주의',
          dangerous: '위험'
        }
      }
    },

    status: {
      offline: '오프라인',
      apiMode: 'API 모드',
      aiEnabled: 'AI 활성화',
      aiDisabled: 'AI 비활성화'
    },

    messages: {
      noCode: '분석할 코드를 입력해주세요.',
      analysisComplete: '코드 분석이 완료되었습니다.',
      analysisFailed: '코드 분석 중 오류가 발생했습니다.',
      formattingComplete: '코드가 성공적으로 포맷팅되었습니다.',
      formattingNotNeeded: '코드가 이미 올바른 형식입니다.',
      formattingFailed: '코드 포맷팅 중 오류가 발생했습니다.',
      newAnalysisStarted: '새로운 코드 분석을 시작합니다.',
      quotaExceeded: 'API 일일 사용량이 초과되었습니다. 오프라인 모드로 분석합니다.',
      serviceNotInitialized: '분석 서비스가 초기화되지 않았습니다.'
    }
  },

  offline: {
    title: '오프라인 분석 도구',
    subtitle: '인터넷 연결 없이 사용할 수 있는 정적 분석 도구입니다',
    description: 'ESLint, 코드 복잡도, 보안 패턴 분석을 오프라인에서 수행합니다.',
    
    tools: {
      eslint: {
        title: 'ESLint 분석기',
        description: 'JavaScript/TypeScript 코드 품질 검사'
      },
      complexity: {
        title: '복잡도 계산기',
        description: 'McCabe 순환 복잡도와 인지 복잡도 측정'
      },
      security: {
        title: '보안 스캐너',
        description: '일반적인 보안 취약점 패턴 탐지'
      },
      formatter: {
        title: '코드 포맷터',
        description: 'Prettier를 사용한 코드 정리'
      }
    },

    features: {
      title: '오프라인 기능',
      noInternet: '인터넷 연결 불필요',
      fastAnalysis: '빠른 분석 속도',
      privacy: '완전한 개인정보 보호',
      unlimited: '사용량 제한 없음'
    }
  },

  settings: {
    title: '설정',
    
    appearance: {
      title: '화면 설정',
      theme: '테마',
      language: '언어',
      themes: {
        light: '라이트',
        dark: '다크',
        system: '시스템 설정'
      },
      languages: {
        ko: '한국어',
        en: 'English'
      }
    },

    api: {
      title: 'API 설정',
      mode: 'API 모드',
      modes: {
        offline: '오프라인 전용',
        mock: '목업 모드',
        free: '무료 API',
        custom: '사용자 정의'
      },
      keys: {
        title: 'API 키',
        gemini: 'Google Gemini API 키',
        cohere: 'Cohere API 키',
        huggingface: 'Hugging Face API 키',
        placeholder: 'API 키를 입력하세요...',
        save: 'API 키 저장',
        remove: 'API 키 제거'
      },
      usage: {
        title: 'API 사용량',
        today: '오늘 사용량',
        monthly: '월간 사용량',
        limit: '제한',
        remaining: '남은 사용량',
        reset: '초기화'
      }
    },

    preferences: {
      title: '분석 설정',
      autoFormat: '자동 포맷팅',
      realTimeAnalysis: '실시간 분석',
      showComplexity: '복잡도 표시',
      showSecurity: '보안 분석 표시',
      enableAI: 'AI 분석 활성화'
    },

    data: {
      title: '데이터 관리',
      export: '설정 내보내기',
      import: '설정 가져오기',
      reset: '설정 초기화',
      clearHistory: '분석 히스토리 지우기'
    },

    messages: {
      settingsSaved: '설정이 저장되었습니다.',
      settingsExported: '설정이 내보내기되었습니다.',
      settingsImported: '설정이 가져오기되었습니다.',
      settingsReset: '설정이 초기화되었습니다.',
      historyCleared: '분석 히스토리가 지워졌습니다.',
      apiKeySaved: 'API 키가 저장되었습니다.',
      apiKeyRemoved: 'API 키가 제거되었습니다.',
      invalidSettings: '잘못된 설정 파일입니다.'
    }
  },

  languages: {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    csharp: 'C#',
    go: 'Go',
    rust: 'Rust',
    php: 'PHP',
    ruby: 'Ruby',
    swift: 'Swift',
    kotlin: 'Kotlin'
  },

  errors: {
    generic: '오류가 발생했습니다',
    network: '네트워크 오류가 발생했습니다',
    api: 'API 오류가 발생했습니다',
    parsing: '코드 파싱 오류가 발생했습니다',
    timeout: '요청 시간이 초과되었습니다',
    quota: 'API 사용량이 초과되었습니다',
    unauthorized: '인증되지 않은 요청입니다',
    notFound: '요청한 리소스를 찾을 수 없습니다',
    serverError: '서버 오류가 발생했습니다'
  },

  notifications: {
    titles: {
      success: '성공',
      error: '오류',
      warning: '경고',
      info: '알림'
    }
  }
};