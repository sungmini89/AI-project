// English translation file
export default {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    retry: 'Retry',
    clear: 'Clear',
    reset: 'Reset',
    export: 'Export',
    import: 'Import',
    close: 'Close'
  },

  navigation: {
    home: 'Home',
    analyze: 'Code Analysis',
    offline: 'Offline Tools',
    settings: 'Settings',
    backToHome: '← Back to Home'
  },

  home: {
    title: 'AI Code Review Service',
    subtitle: 'Improve your code quality with free AI APIs and static analysis',
    description: {
      line1: 'Real-time ESLint checks, code complexity analysis, security pattern detection',
      line2: 'AI-powered code review using Google Gemini and Cohere APIs',
      line3: 'Complete offline mode and PWA support for anywhere, anytime usage'
    },
    features: {
      title: 'Key Features',
      realtime: {
        title: 'Real-time Analysis',
        description: 'Instant code quality checks with ESLint and Prettier'
      },
      ai: {
        title: 'AI Code Review',
        description: 'Intelligent code analysis using Google Gemini and Cohere APIs'
      },
      offline: {
        title: 'Offline Support',
        description: 'Use static analysis tools without internet connection'
      },
      security: {
        title: 'Security Analysis',
        description: 'Detect security vulnerabilities like SQL injection and XSS'
      },
      complexity: {
        title: 'Complexity Metrics',
        description: 'Calculate McCabe and cognitive complexity'
      },
      multilang: {
        title: 'Multi-language Support',
        description: 'Support for 12 programming languages'
      }
    },
    cta: {
      startAnalysis: 'Start Code Analysis',
      tryOffline: 'Try Offline Tools',
      configureAPI: 'Configure API'
    }
  },

  analyzer: {
    title: 'AI Code Analysis',
    newAnalysis: 'New Analysis',
    analyze: 'Start Analysis',
    analyzing: 'Analyzing...',
    format: 'Format Code',
    formatting: 'Formatting...',
    
    options: {
      title: 'Analysis Options',
      eslint: 'ESLint Check',
      prettier: 'Prettier Formatting',
      complexity: 'Complexity Analysis',
      security: 'Security Check',
      ai: 'AI Review'
    },

    editor: {
      language: 'Programming Language',
      placeholder: 'Enter or paste your code for analysis...',
      loadSample: 'Load Sample Code'
    },

    results: {
      title: 'Analysis Results',
      noResults: 'No analysis results available.',
      eslint: 'ESLint Results',
      prettier: 'Code Formatting',
      complexity: 'Complexity Analysis',
      security: 'Security Analysis',
      ai: 'AI Analysis Results',
      
      tabs: {
        overview: 'Overview',
        issues: 'Issues',
        suggestions: 'Suggestions',
        metrics: 'Metrics'
      },

      severity: {
        error: 'Error',
        warning: 'Warning',
        info: 'Info',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical'
      },

      complexity: {
        cyclomatic: 'Cyclomatic Complexity',
        cognitive: 'Cognitive Complexity',
        lines: 'Lines of Code',
        functions: 'Function Complexity',
        overall: 'Overall Complexity',
        levels: {
          low: 'Low',
          medium: 'Medium',
          high: 'High',
          'very-high': 'Very High'
        }
      },

      security: {
        score: 'Security Score',
        level: 'Security Level',
        issues: 'Security Issues',
        levels: {
          safe: 'Safe',
          warning: 'Warning',
          dangerous: 'Dangerous'
        }
      }
    },

    status: {
      offline: 'Offline',
      apiMode: 'API Mode',
      aiEnabled: 'AI Enabled',
      aiDisabled: 'AI Disabled'
    },

    messages: {
      noCode: 'Please enter code to analyze.',
      analysisComplete: 'Code analysis completed successfully.',
      analysisFailed: 'An error occurred during code analysis.',
      formattingComplete: 'Code formatted successfully.',
      formattingNotNeeded: 'Code is already properly formatted.',
      formattingFailed: 'An error occurred during code formatting.',
      newAnalysisStarted: 'Starting new code analysis.',
      quotaExceeded: 'Daily API quota exceeded. Switching to offline mode.',
      serviceNotInitialized: 'Analysis service is not initialized.'
    }
  },

  offline: {
    title: 'Offline Analysis Tools',
    subtitle: 'Static analysis tools that work without internet connection',
    description: 'Perform ESLint, code complexity, and security pattern analysis offline.',
    
    tools: {
      eslint: {
        title: 'ESLint Analyzer',
        description: 'JavaScript/TypeScript code quality checks'
      },
      complexity: {
        title: 'Complexity Calculator',
        description: 'McCabe cyclomatic and cognitive complexity measurement'
      },
      security: {
        title: 'Security Scanner',
        description: 'Common security vulnerability pattern detection'
      },
      formatter: {
        title: 'Code Formatter',
        description: 'Code formatting using Prettier'
      }
    },

    features: {
      title: 'Offline Features',
      noInternet: 'No Internet Required',
      fastAnalysis: 'Fast Analysis',
      privacy: 'Complete Privacy',
      unlimited: 'No Usage Limits'
    }
  },

  settings: {
    title: 'Settings',
    
    appearance: {
      title: 'Appearance',
      theme: 'Theme',
      language: 'Language',
      themes: {
        light: 'Light',
        dark: 'Dark',
        system: 'System'
      },
      languages: {
        ko: '한국어',
        en: 'English'
      }
    },

    api: {
      title: 'API Configuration',
      mode: 'API Mode',
      modes: {
        offline: 'Offline Only',
        mock: 'Mock Mode',
        free: 'Free API',
        custom: 'Custom'
      },
      keys: {
        title: 'API Keys',
        gemini: 'Google Gemini API Key',
        cohere: 'Cohere API Key',
        huggingface: 'Hugging Face API Key',
        placeholder: 'Enter your API key...',
        save: 'Save API Key',
        remove: 'Remove API Key'
      },
      usage: {
        title: 'API Usage',
        today: 'Today\'s Usage',
        monthly: 'Monthly Usage',
        limit: 'Limit',
        remaining: 'Remaining',
        reset: 'Reset'
      }
    },

    preferences: {
      title: 'Analysis Preferences',
      autoFormat: 'Auto Format',
      realTimeAnalysis: 'Real-time Analysis',
      showComplexity: 'Show Complexity',
      showSecurity: 'Show Security Analysis',
      enableAI: 'Enable AI Analysis'
    },

    data: {
      title: 'Data Management',
      export: 'Export Settings',
      import: 'Import Settings',
      reset: 'Reset Settings',
      clearHistory: 'Clear Analysis History'
    },

    messages: {
      settingsSaved: 'Settings saved successfully.',
      settingsExported: 'Settings exported successfully.',
      settingsImported: 'Settings imported successfully.',
      settingsReset: 'Settings reset successfully.',
      historyCleared: 'Analysis history cleared.',
      apiKeySaved: 'API key saved successfully.',
      apiKeyRemoved: 'API key removed successfully.',
      invalidSettings: 'Invalid settings file.'
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
    generic: 'An error occurred',
    network: 'Network error occurred',
    api: 'API error occurred',
    parsing: 'Code parsing error occurred',
    timeout: 'Request timeout',
    quota: 'API quota exceeded',
    unauthorized: 'Unauthorized request',
    notFound: 'Requested resource not found',
    serverError: 'Server error occurred'
  },

  notifications: {
    titles: {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    }
  }
};