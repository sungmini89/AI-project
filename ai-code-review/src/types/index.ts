/**
 * AI 코드 리뷰 웹사이트 타입 정의
 * 애플리케이션에서 사용되는 모든 인터페이스와 타입 정의
 * @module types
 */

/**
 * API 모드 타입
 * mock: 목 데이터 사용, free: 무료 AI 서비스, offline: 오프라인 분석, custom: 사용자 정의
 */
export type APIMode = "mock" | "free" | "offline" | "custom";

/**
 * 지원되는 프로그래밍 언어 목록
 */
export type SupportedLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "csharp"
  | "go"
  | "rust"
  | "php"
  | "ruby"
  | "swift"
  | "kotlin";

/**
 * AI 서비스 설정 인터페이스
 */
export interface AIServiceConfig {
  /** API 모드 */
  mode: APIMode;
  /** API 키 (선택사항) */
  apiKey?: string;
  /** 오프라인 모드로 폴백할지 여부 */
  fallbackToOffline: boolean;
  /** AI 서비스 제공자 */
  provider?: "gemini" | "cohere" | "huggingface";
}

/**
 * 코드 분석 결과 인터페이스
 */
export interface CodeAnalysis {
  /** 분석 ID */
  id: string;
  /** 분석 타임스탬프 */
  timestamp: number;
  /** 프로그래밍 언어 */
  language: SupportedLanguage;
  /** 분석된 코드 */
  code: string;
  /** 분석 결과들 */
  results: {
    /** ESLint 분석 결과 */
    eslint?: ESLintResult[];
    /** Prettier 포맷팅 결과 */
    prettier?: PrettierResult;
    /** 복잡도 분석 결과 */
    complexity?: ComplexityAnalysis;
    /** 보안 분석 결과 */
    security?: SecurityAnalysis;
    /** AI 분석 결과 */
    ai?: AIAnalysisResult;
  };
  /** 사용된 API 모드 */
  mode: APIMode;
}

/**
 * ESLint 분석 결과 인터페이스
 */
export interface ESLintResult {
  /** 문제가 발생한 라인 번호 */
  line: number;
  /** 문제가 발생한 컬럼 번호 */
  column: number;
  /** 문제의 심각도 */
  severity: "error" | "warning" | "info";
  /** 문제 설명 메시지 */
  message: string;
  /** 위반된 규칙 ID */
  ruleId: string;
  /** 문제가 발생한 소스 */
  source: string;
}

/**
 * Prettier 포맷팅 결과 인터페이스
 */
export interface PrettierResult {
  /** 포맷팅된 코드 */
  formatted: string;
  /** 변경사항이 있는지 여부 */
  changed: boolean;
  /** 변경사항 diff (선택사항) */
  diff?: string;
}

/**
 * 복잡도 분석 결과 인터페이스
 */
export interface ComplexityAnalysis {
  /** 순환 복잡도 */
  cyclomatic: number;
  /** 인지 복잡도 */
  cognitive: number;
  /** 코드 라인 수 */
  lines: number;
  /** 함수별 복잡도 정보 */
  functions: FunctionComplexity[];
  /** 전체 복잡도 수준 */
  overall: "low" | "medium" | "high" | "very-high";
}

/**
 * 함수 복잡도 정보 인터페이스
 */
export interface FunctionComplexity {
  /** 함수명 */
  name: string;
  /** 함수 시작 라인 */
  line: number;
  /** 함수의 순환 복잡도 */
  cyclomatic: number;
  /** 함수의 인지 복잡도 */
  cognitive: number;
}

/**
 * 보안 분석 결과 인터페이스
 */
export interface SecurityAnalysis {
  /** 발견된 보안 이슈들 */
  issues: SecurityIssue[];
  /** 보안 점수 (0-100) */
  score: number;
  /** 보안 수준 */
  level: "safe" | "warning" | "dangerous";
}

/**
 * 보안 이슈 인터페이스
 */
export interface SecurityIssue {
  /** 이슈 타입 */
  type: string;
  /** 이슈가 발생한 라인 */
  line: number;
  /** 이슈가 발생한 컬럼 */
  column: number;
  /** 이슈의 심각도 */
  severity: "low" | "medium" | "high" | "critical";
  /** 이슈 설명 */
  message: string;
  /** 문제가 되는 패턴 */
  pattern: string;
  /** 해결 방안 제안 (선택사항) */
  suggestion?: string;
}

/**
 * AI 분석 결과 인터페이스
 */
export interface AIAnalysisResult {
  /** AI 서비스 제공자 */
  provider: string;
  /** 사용된 AI 모델 */
  model: string;
  /** 분석 요약 */
  summary: string;
  /** 발견된 이슈들 */
  issues: AIIssue[];
  /** 개선 제안사항들 */
  suggestions: AISuggestion[];
  /** 전체 점수 (0-100) */
  score: number;
  /** 분석 신뢰도 (0-1) */
  confidence: number;
}

/**
 * AI가 발견한 이슈 인터페이스
 */
export interface AIIssue {
  /** 이슈 타입 */
  type: "bug" | "performance" | "maintainability" | "style" | "security";
  /** 이슈 심각도 */
  severity: "low" | "medium" | "high" | "critical";
  /** 이슈가 발생한 라인 (선택사항) */
  line?: number;
  /** 이슈 설명 */
  message: string;
  /** 이슈에 대한 자세한 설명 */
  explanation: string;
  /** 수정 방안 (선택사항) */
  fix?: string;
}

/**
 * AI 개선 제안 인터페이스
 */
export interface AISuggestion {
  /** 제안 타입 */
  type: "refactor" | "optimize" | "simplify" | "modernize";
  /** 제안 우선순위 */
  priority: "low" | "medium" | "high";
  /** 제안 내용 설명 */
  description: string;
  /** 예시 코드 (선택사항) */
  example?: string;
}

/**
 * API 사용량 정보 인터페이스
 */
export interface APIUsage {
  /** 서비스 제공자 */
  provider: string;
  /** 사용 날짜 */
  date: string;
  /** 요청 수 */
  requests: number;
  /** 제한된 요청 수 */
  limit: number;
  /** 리셋 시간 (선택사항) */
  resetTime?: number;
}

/**
 * 사용자 설정 인터페이스
 */
export interface UserSettings {
  /** 테마 설정 */
  theme: "light" | "dark";
  /** 언어 설정 */
  language: "ko" | "en";
  /** API 모드 */
  apiMode: APIMode;
  /** API 키들 */
  apiKeys: {
    /** Gemini API 키 */
    gemini?: string;
    /** Cohere API 키 */
    cohere?: string;
    /** Hugging Face API 키 */
    huggingface?: string;
  };
  /** 사용자 선호사항 */
  preferences: {
    /** 자동 포맷팅 여부 */
    autoFormat: boolean;
    /** 실시간 분석 여부 */
    realTimeAnalysis: boolean;
    /** 복잡도 표시 여부 */
    showComplexity: boolean;
    /** 보안 분석 표시 여부 */
    showSecurity: boolean;
    /** AI 분석 활성화 여부 */
    enableAI: boolean;
  };
}

/**
 * 코드 히스토리 인터페이스
 */
export interface CodeHistory {
  /** 히스토리 ID */
  id: string;
  /** 생성 타임스탬프 */
  timestamp: number;
  /** 프로그래밍 언어 */
  language: SupportedLanguage;
  /** 코드 제목 (선택사항) */
  title?: string;
  /** 코드 내용 */
  code: string;
  /** 분석 결과 (선택사항) */
  analysis?: CodeAnalysis;
  /** 북마크 여부 */
  bookmarked: boolean;
}

/**
 * 서비스 상태 인터페이스
 */
export interface ServiceStatus {
  /** 온라인 상태 */
  online: boolean;
  /** 서비스 제공자 */
  provider?: string;
  /** 마지막 체크 시간 */
  lastCheck: number;
  /** 에러 메시지 (선택사항) */
  error?: string;
  /** 남은 할당량 (선택사항) */
  quotaRemaining?: number;
}

/**
 * Monaco Editor 상태 인터페이스
 */
export interface EditorState {
  /** 에디터 내용 */
  value: string;
  /** 프로그래밍 언어 */
  language: SupportedLanguage;
  /** 에디터 테마 */
  theme: "vs-light" | "vs-dark";
  /** 폰트 크기 */
  fontSize: number;
  /** 자동 줄바꿈 설정 */
  wordWrap: "on" | "off";
  /** 미니맵 표시 여부 */
  minimap: boolean;
}

/**
 * 코드 에디터 컴포넌트 Props 인터페이스
 */
export interface CodeEditorProps {
  /** 에디터 내용 */
  value: string;
  /** 프로그래밍 언어 */
  language: SupportedLanguage;
  /** 내용 변경 콜백 */
  onChange: (value: string) => void;
  /** 언어 변경 콜백 */
  onLanguageChange: (language: SupportedLanguage) => void;
  /** 테마 설정 */
  theme?: "light" | "dark";
  /** 에디터 높이 */
  height?: number;
  /** 읽기 전용 여부 */
  readonly?: boolean;
  /** 미니맵 표시 여부 */
  showMinimap?: boolean;
}

/**
 * 분석 결과 컴포넌트 Props 인터페이스
 */
export interface AnalysisResultsProps {
  /** 분석 결과 */
  analysis: CodeAnalysis;
  /** 이슈 클릭 콜백 (선택사항) */
  onIssueClick?: (line: number) => void;
  /** 제안 적용 콜백 (선택사항) */
  onSuggestionApply?: (suggestion: AISuggestion) => void;
}

/**
 * API 설정 컴포넌트 Props 인터페이스
 */
export interface ApiSettingsProps {
  /** 사용자 설정 */
  settings: UserSettings;
  /** 설정 변경 콜백 */
  onSettingsChange: (settings: UserSettings) => void;
  /** API 사용량 정보 */
  usage: APIUsage[];
}

/**
 * API 에러 인터페이스
 */
export interface APIError {
  /** 에러 코드 */
  code: string;
  /** 에러 메시지 */
  message: string;
  /** 상세 정보 (선택사항) */
  details?: any;
  /** 서비스 제공자 (선택사항) */
  provider?: string;
}

/**
 * 서비스 에러 인터페이스
 */
export interface ServiceError extends Error {
  /** 에러 코드 */
  code: string;
  /** 서비스 제공자 (선택사항) */
  provider?: string;
  /** 원본 에러 (선택사항) */
  originalError?: Error;
}
