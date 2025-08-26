/**
 * @fileoverview 이력서-채용공고 매칭 분석을 위한 타입 정의
 * @description 애플리케이션에서 사용하는 모든 분석 관련 타입과 인터페이스를 정의합니다.
 * 키워드 매칭, 스킬 분석, ATS 준수성 검사 등의 결과를 타입 안전하게 처리할 수 있도록 합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

/**
 * 분석 옵션 인터페이스
 * @description 분석 수행 시 사용할 설정 옵션들을 정의합니다.
 */
export interface AnalysisOptions {
  /** 분석 모드: mock(개발용), free(무료 API), offline(로컬), custom(사용자 API), comprehensive(종합) */
  mode: "mock" | "free" | "offline" | "custom" | "comprehensive";
  /** 분석 깊이: basic(기본), standard(표준), detailed(상세) */
  depth: "basic" | "standard" | "detailed";
  /** 분석 언어: ko(한국어), en(영어) */
  language: "ko" | "en";
  /** AI 분석 깊이 (선택사항) */
  analysisDepth?: "basic" | "standard" | "detailed";
  /** ATS 준수성 검사 포함 여부 */
  includeATS?: boolean;
  /** AI 서비스 사용 여부 */
  useAI?: boolean;
}

/**
 * 키워드 매칭 결과 인터페이스
 * @description 이력서와 채용공고 간의 키워드 매칭 정보를 담습니다.
 */
export interface KeywordMatch {
  /** 매칭된 키워드 */
  keyword: string;
  /** 키워드 빈도수 */
  frequency: number;
  /** 키워드 중요도: high(높음), medium(보통), low(낮음) */
  importance: "high" | "medium" | "low";
  /** 키워드가 사용된 문맥들 */
  context: string[];
}

/**
 * 스킬 매칭 결과 인터페이스
 * @description 이력서와 채용공고 간의 스킬 매칭 정보를 담습니다.
 */
export interface SkillMatch {
  /** 스킬명 */
  skill: string;
  /** 스킬의 대체명 (선택사항) */
  name?: string;
  /** 스킬 설명 (선택사항) */
  description?: string;
  /** 이력서에 명시된 스킬 수준 */
  resumeLevel: "beginner" | "intermediate" | "advanced" | "expert";
  /** 채용공고에서 요구하는 스킬 수준 */
  requiredLevel: "beginner" | "intermediate" | "advanced" | "expert";
  /** 스킬 매칭 여부 */
  match: boolean;
  /** 스킬 수준 간격 (선택사항) */
  gap?: string;
}

/**
 * ATS 준수성 검사 결과 인터페이스
 * @description Applicant Tracking System 준수성 검사 결과를 담습니다.
 */
export interface ATSCompliance {
  /** ATS 준수성 점수 (0-100) */
  score: number;
  /** 발견된 문제점들 */
  issues: string[];
  /** 개선 권장사항들 */
  recommendations: string[];
  /** 키워드 밀도 */
  keywordDensity: number;
  /** 형식 관련 문제점들 */
  formatIssues: string[];
  /** 준수성 수준 (선택사항) */
  complianceLevel?: string;
}

/**
 * 분석 세부 결과 인터페이스
 * @description 분석의 각 영역별 결과를 종합적으로 담습니다.
 */
export interface AnalysisBreakdown {
  /** 키워드 매칭 분석 결과 */
  keywordMatches: {
    /** 매칭된 키워드 목록 */
    matchedKeywords: string[];
    /** 중요하지만 누락된 키워드들 */
    importantMissing: string[];
    /** 키워드 매칭률 (0-100) */
    matchRate: number;
    /** 키워드 매칭 상세 정보 */
    details: KeywordMatch[];
    /** 누락된 키워드들 (선택사항) */
    missingKeywords?: string[];
  };
  /** 스킬 매칭 분석 결과 */
  skillMatches: {
    /** 매칭된 스킬들 */
    matchedSkills: SkillMatch[];
    /** 누락된 스킬들 */
    missingSkills: string[];
    /** 전체 스킬 매칭률 (0-100) */
    overallSkillMatch: number;
  };
  /** ATS 준수성 검사 결과 */
  atsCompliance: ATSCompliance;
}

/**
 * 개선 제안 인터페이스
 * @description 분석 결과를 바탕으로 한 개선 제안을 담습니다.
 */
export interface Suggestion {
  /** 제안 우선순위: high(높음), medium(보통), low(낮음) */
  priority: "high" | "medium" | "low";
  /** 제안 제목 */
  title: string;
  /** 제안 설명 */
  description: string;
  /** 구체적인 실행 항목들 */
  actionItems: string[];
  /** 제안 카테고리: keywords(키워드), skills(스킬), format(형식), content(내용) */
  category: "keywords" | "skills" | "format" | "content";
  /** 제안 유형 (선택사항): improvement(개선), optimization(최적화), compliance(준수) */
  type?: "improvement" | "optimization" | "compliance";
}

/**
 * 분석 결과 인터페이스
 * @description 전체 분석 결과를 담는 최상위 인터페이스입니다.
 */
export interface AnalysisResult {
  /** 전체 매칭 점수 (0-100) */
  overallScore: number;
  /** 분석 세부 결과 */
  breakdown: AnalysisBreakdown;
  /** 개선 제안 목록 */
  suggestions: Suggestion[];
  /** 분석 처리 시간 (밀리초) */
  processingTime: number;
  /** 사용된 분석 모드 */
  mode: string;
}

// 추가 타입 별칭들 (레거시 호환성을 위해)
/** @deprecated KeywordAnalysis 대신 AnalysisBreakdown['keywordMatches'] 사용을 권장합니다 */
export type KeywordAnalysis = AnalysisBreakdown["keywordMatches"];
/** @deprecated SkillAnalysis 대신 AnalysisBreakdown['skillMatches'] 사용을 권장합니다 */
export type SkillAnalysis = AnalysisBreakdown["skillMatches"];
/** @deprecated ATSAnalysis 대신 ATSCompliance 사용을 권장합니다 */
export type ATSAnalysis = ATSCompliance;

// 파일 업로드 관련 타입들
/**
 * 파일 업로드 상태 인터페이스
 * @description 파일 업로드 과정의 상태를 추적합니다.
 */
export interface FileUploadState {
  /** 업로드된 파일 객체 */
  file: File | null;
  /** 업로드 진행 중 여부 */
  uploading: boolean;
  /** 업로드 오류 메시지 */
  error: string | null;
  /** 업로드 진행률 (0-100) */
  progress: number;
  /** 추출된 텍스트 내용 (선택사항) */
  text?: string;
  /** 파일 처리 중 여부 (선택사항) */
  processing?: boolean;
}

/**
 * 채용공고 입력 상태 인터페이스
 * @description 채용공고 텍스트 입력의 상태를 관리합니다.
 */
export interface JobDescriptionState {
  /** 입력된 채용공고 텍스트 */
  text: string;
  /** 단어 수 */
  wordCount: number;
  /** 유효성 검사 통과 여부 */
  isValid: boolean;
  /** 추출된 키워드들 (선택사항) */
  keywords?: string[];
}
