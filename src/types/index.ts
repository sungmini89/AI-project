// AI 코드 리뷰 웹사이트 타입 정의

export type APIMode = 'mock' | 'free' | 'offline' | 'custom';

export type SupportedLanguage = 
  | 'javascript' 
  | 'typescript' 
  | 'python' 
  | 'java' 
  | 'cpp' 
  | 'csharp' 
  | 'go' 
  | 'rust' 
  | 'php' 
  | 'ruby' 
  | 'swift' 
  | 'kotlin';

export interface AIServiceConfig {
  mode: APIMode;
  apiKey?: string;
  fallbackToOffline: boolean;
  provider?: 'gemini' | 'cohere' | 'huggingface';
}

export interface CodeAnalysis {
  id: string;
  timestamp: number;
  language: SupportedLanguage;
  code: string;
  results: {
    eslint?: ESLintResult[];
    prettier?: PrettierResult;
    complexity?: ComplexityAnalysis;
    security?: SecurityAnalysis;
    ai?: AIAnalysisResult;
  };
  mode: APIMode;
}

export interface ESLintResult {
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  ruleId: string;
  source: string;
}

export interface PrettierResult {
  formatted: string;
  changed: boolean;
  diff?: string;
}

export interface ComplexityAnalysis {
  cyclomatic: number;
  cognitive: number;
  lines: number;
  functions: FunctionComplexity[];
  overall: 'low' | 'medium' | 'high' | 'very-high';
}

export interface FunctionComplexity {
  name: string;
  line: number;
  cyclomatic: number;
  cognitive: number;
}

export interface SecurityAnalysis {
  issues: SecurityIssue[];
  score: number;
  level: 'safe' | 'warning' | 'dangerous';
}

export interface SecurityIssue {
  type: string;
  line: number;
  column: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  pattern: string;
  suggestion?: string;
}

export interface AIAnalysisResult {
  provider: string;
  model: string;
  summary: string;
  issues: AIIssue[];
  suggestions: AISuggestion[];
  score: number;
  confidence: number;
}

export interface AIIssue {
  type: 'bug' | 'performance' | 'maintainability' | 'style' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  line?: number;
  message: string;
  explanation: string;
  fix?: string;
}

export interface AISuggestion {
  type: 'refactor' | 'optimize' | 'simplify' | 'modernize';
  priority: 'low' | 'medium' | 'high';
  description: string;
  example?: string;
}

export interface APIUsage {
  provider: string;
  date: string;
  requests: number;
  limit: number;
  resetTime?: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';
  apiMode: APIMode;
  apiKeys: {
    gemini?: string;
    cohere?: string;
    huggingface?: string;
  };
  preferences: {
    autoFormat: boolean;
    realTimeAnalysis: boolean;
    showComplexity: boolean;
    showSecurity: boolean;
    enableAI: boolean;
  };
}

export interface CodeHistory {
  id: string;
  timestamp: number;
  language: SupportedLanguage;
  title?: string;
  code: string;
  analysis?: CodeAnalysis;
  bookmarked: boolean;
}

export interface ServiceStatus {
  online: boolean;
  provider?: string;
  lastCheck: number;
  error?: string;
  quotaRemaining?: number;
}

// Monaco Editor 관련 타입
export interface EditorState {
  value: string;
  language: SupportedLanguage;
  theme: 'vs-light' | 'vs-dark';
  fontSize: number;
  wordWrap: 'on' | 'off';
  minimap: boolean;
}

// 컴포넌트 Props 타입
export interface CodeEditorProps {
  value: string;
  language: SupportedLanguage;
  onChange: (value: string) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
  theme?: 'light' | 'dark';
  height?: number;
  readonly?: boolean;
  showMinimap?: boolean;
}

export interface AnalysisResultsProps {
  analysis: CodeAnalysis;
  onIssueClick?: (line: number) => void;
  onSuggestionApply?: (suggestion: AISuggestion) => void;
}

export interface ApiSettingsProps {
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  usage: APIUsage[];
}

// 에러 타입
export interface APIError {
  code: string;
  message: string;
  details?: any;
  provider?: string;
}

export interface ServiceError extends Error {
  code: string;
  provider?: string;
  originalError?: Error;
}