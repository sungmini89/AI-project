/**
 * @fileoverview 무료 AI 서비스 통합 관리 클래스
 * @description 다양한 AI 서비스 제공자(OpenAI, Cohere, Gemini, Hugging Face)를 통합하여
 * 이력서-채용공고 매칭 분석을 수행하는 서비스입니다. 무료 티어 제한을 고려한
 * 사용량 관리와 오프라인 폴백 기능을 제공합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

import type { AnalysisResult, AnalysisOptions } from "@/types/analysis";
import { TextAnalysisService } from "./text-analysis";
import {
  aiEnhancedAnalysisService,
  type EnhancedAnalysisResult,
} from "./ai-enhanced-analysis";

/**
 * AI 서비스 모드 타입
 * @description 사용 가능한 AI 서비스 모드들을 정의합니다.
 */
export type APIMode = "mock" | "free" | "offline" | "custom";
export type { EnhancedAnalysisResult };

/**
 * AI 서비스 설정 인터페이스
 * @description AI 서비스의 동작을 제어하는 설정 옵션들을 정의합니다.
 */
export interface AIServiceConfig {
  /** 현재 사용 중인 AI 서비스 모드 */
  mode: APIMode;
  /** API 키 (사용자 정의 모드에서 사용) */
  apiKey?: string;
  /** 오프라인 폴백 사용 여부 */
  fallbackToOffline: boolean;
  /** 일일 사용량 제한 */
  dailyLimit?: number;
  /** 월간 사용량 제한 */
  monthlyLimit?: number;
}

/**
 * 사용량 통계 인터페이스
 * @description AI 서비스의 사용량을 추적하는 통계 정보를 담습니다.
 */
export interface UsageStats {
  /** 일일 사용량 */
  daily: number;
  /** 월간 사용량 */
  monthly: number;
  /** 마지막 리셋 시간 */
  lastReset: string;
  /** 현재 사용 중인 모드 */
  mode: APIMode;
}

/**
 * API 제공자 정보 인터페이스
 * @description 각 AI 서비스 제공자의 제한사항과 설정을 정의합니다.
 */
interface APIProvider {
  /** 제공자 이름 */
  name: string;
  /** 일일 사용량 제한 */
  dailyLimit: number;
  /** 월간 사용량 제한 */
  monthlyLimit: number;
  /** API 엔드포인트 (선택사항) */
  endpoint?: string;
}

/**
 * 무료 AI 서비스 통합 관리 클래스
 * @description 다양한 AI 서비스 제공자를 통합하여 이력서-채용공고 매칭 분석을 수행합니다.
 * 사용량 제한 관리, 오프라인 폴백, 에러 처리 등의 기능을 제공합니다.
 *
 * @example
 * ```tsx
 * const aiService = new FreeAIService();
 * const result = await aiService.analyzeResumeMatch(resumeText, jobText, options);
 * ```
 */
class FreeAIService {
  /** AI 서비스 설정 */
  private config: AIServiceConfig;

  /** 지원하는 AI 서비스 제공자들의 정보 */
  private readonly providers: Record<string, APIProvider> = {
    cohere: {
      name: "Cohere",
      dailyLimit: 100,
      monthlyLimit: 1000, // Cohere 무료 티어
    },
    openai: {
      name: "OpenAI",
      dailyLimit: 50,
      monthlyLimit: 200, // 보수적인 추정
    },
    gemini: {
      name: "Gemini",
      dailyLimit: 60,
      monthlyLimit: 1500, // Google Gemini 무료 티어
    },
    huggingface: {
      name: "Hugging Face",
      dailyLimit: 1000,
      monthlyLimit: 10000, // Inference API 무료 티어
    },
  };

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * 로컬스토리지에서 설정을 로드하는 함수
   * @description 저장된 설정이 있으면 불러오고, 없으면 기본 설정을 사용합니다.
   *
   * @returns {AIServiceConfig} 로드된 설정 객체
   */
  private loadConfig(): AIServiceConfig {
    const savedConfig = localStorage.getItem("aiServiceConfig");
    const defaultConfig: AIServiceConfig = {
      mode: this.determineDefaultMode(),
      fallbackToOffline: true,
      dailyLimit: 100,
      monthlyLimit: 1000,
    };

    return savedConfig
      ? { ...defaultConfig, ...JSON.parse(savedConfig) }
      : defaultConfig;
  }

  /**
   * 기본 AI 서비스 모드를 결정하는 함수
   * @description 환경 변수와 API 키 존재 여부를 확인하여 기본 모드를 결정합니다.
   *
   * @returns {APIMode} 결정된 기본 모드
   */
  private determineDefaultMode(): APIMode {
    const useMock = import.meta.env.VITE_USE_MOCK_DATA === "true";
    const apiMode = import.meta.env.VITE_API_MODE as APIMode;

    if (useMock) return "mock";
    if (apiMode && ["mock", "free", "offline", "custom"].includes(apiMode)) {
      return apiMode;
    }

    // API 키가 있으면 free 모드, 없으면 offline
    const hasApiKey = !!(
      import.meta.env.VITE_OPENAI_API_KEY ||
      import.meta.env.VITE_COHERE_API_KEY ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      import.meta.env.VITE_HUGGINGFACE_TOKEN
    );

    return hasApiKey ? "free" : "offline";
  }

  /**
   * AI 서비스 설정을 업데이트하는 함수
   * @description 새로운 설정을 적용하고 로컬스토리지에 저장합니다.
   * 모드가 변경된 경우 사용량을 초기화합니다.
   *
   * @param {Partial<AIServiceConfig>} newConfig - 업데이트할 설정
   */
  public updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem("aiServiceConfig", JSON.stringify(this.config));

    // 설정 변경시 사용량 초기화 (모드 변경시에만)
    if (newConfig.mode && newConfig.mode !== this.config.mode) {
      this.resetUsage();
    }
  }

  private getUsageStats(): UsageStats {
    const saved = localStorage.getItem("apiUsageStats");
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const thisMonth = today.substring(0, 7);

    if (!saved) {
      const newStats: UsageStats = {
        daily: 0,
        monthly: 0,
        lastReset: today,
        mode: this.config.mode,
      };
      localStorage.setItem("apiUsageStats", JSON.stringify(newStats));
      return newStats;
    }

    const stats: UsageStats = JSON.parse(saved);

    // 일일 리셋 체크
    if (stats.lastReset < today) {
      stats.daily = 0;
      stats.lastReset = today;
    }

    // 월간 리셋 체크
    const lastMonth = stats.lastReset.substring(0, 7);
    if (lastMonth < thisMonth) {
      stats.monthly = 0;
    }

    // 모드 변경시 사용량 리셋
    if (stats.mode !== this.config.mode) {
      stats.daily = 0;
      stats.monthly = 0;
      stats.mode = this.config.mode;
    }

    localStorage.setItem("apiUsageStats", JSON.stringify(stats));
    return stats;
  }

  private incrementUsage(): void {
    const stats = this.getUsageStats();
    stats.daily += 1;
    stats.monthly += 1;
    localStorage.setItem("apiUsageStats", JSON.stringify(stats));
  }

  private resetUsage(): void {
    const today = new Date().toISOString().split("T")[0];
    const newStats: UsageStats = {
      daily: 0,
      monthly: 0,
      lastReset: today,
      mode: this.config.mode,
    };
    localStorage.setItem("apiUsageStats", JSON.stringify(newStats));
  }

  private isWithinLimits(): boolean {
    if (this.config.mode === "offline" || this.config.mode === "mock") {
      return true;
    }

    const stats = this.getUsageStats();
    const dailyLimit = this.config.dailyLimit || 100;
    const monthlyLimit = this.config.monthlyLimit || 1000;

    return stats.daily < dailyLimit && stats.monthly < monthlyLimit;
  }

  public async analyzeResumeMatch(
    resumeText: string,
    jobDescription: string,
    options: AnalysisOptions = {
      language: "ko",
      includeATS: true,
      mode: "comprehensive",
      depth: "detailed",
    }
  ): Promise<EnhancedAnalysisResult> {
    const startTime = Date.now();

    try {
      // Mock 모드
      if (this.config.mode === "mock") {
        return this.getMockAnalysis(resumeText, jobDescription, options);
      }

      // 사용량 한도 체크
      if (!this.isWithinLimits() && this.config.fallbackToOffline) {
        console.warn("API usage limit exceeded, falling back to offline mode");
        return this.getOfflineAnalysis(resumeText, jobDescription, options);
      }

      // 오프라인 모드
      if (this.config.mode === "offline") {
        return this.getOfflineAnalysis(resumeText, jobDescription, options);
      }

      // API 모드 (free 또는 custom)
      return this.getAPIAnalysis(resumeText, jobDescription, options);
    } catch (error) {
      console.error("AI analysis failed:", error);

      if (this.config.fallbackToOffline) {
        console.info("Falling back to offline analysis");
        return this.getOfflineAnalysis(resumeText, jobDescription, options);
      }

      throw error;
    } finally {
      const processingTime = Date.now() - startTime;
      console.log(
        `Analysis completed in ${processingTime}ms using ${this.config.mode} mode`
      );
    }
  }

  private async getAPIAnalysis(
    resumeText: string,
    jobDescription: string,
    options: AnalysisOptions
  ): Promise<EnhancedAnalysisResult> {
    // 기본 텍스트 분석 수행
    const baseAnalysis = await TextAnalysisService.analyzeMatch(
      resumeText,
      jobDescription,
      options
    );

    // AI 향상된 분석 수행
    const enhancedResult = await aiEnhancedAnalysisService.enhancedAnalysis(
      resumeText,
      jobDescription,
      baseAnalysis,
      options
    );

    // 성공시 사용량 증가
    this.incrementUsage();

    return {
      ...enhancedResult,
      mode: this.config.mode,
    };
  }

  private async getOfflineAnalysis(
    resumeText: string,
    jobDescription: string,
    options: AnalysisOptions
  ): Promise<EnhancedAnalysisResult> {
    // 순수 로컬 분석
    const baseAnalysis = await TextAnalysisService.analyzeMatch(
      resumeText,
      jobDescription,
      options
    );

    // 로컬 AI 인사이트 생성
    const localInsights = {
      provider: "Local Analysis",
      summary: this.generateLocalSummary(baseAnalysis.overallScore),
      strengths: this.generateLocalStrengths(baseAnalysis),
      weaknesses: this.generateLocalWeaknesses(baseAnalysis),
      recommendations: this.generateLocalRecommendations(baseAnalysis),
      confidenceScore: Math.min(baseAnalysis.overallScore + 5, 100),
    };

    return {
      ...baseAnalysis,
      aiInsights: localInsights,
      mode: "offline",
    };
  }

  private async getMockAnalysis(
    _resumeText: string,
    _jobDescription: string,
    _options: AnalysisOptions
  ): Promise<EnhancedAnalysisResult> {
    // 개발용 Mock 데이터
    const mockResult: EnhancedAnalysisResult = {
      overallScore: Math.floor(Math.random() * 30) + 60, // 60-90 점수
      breakdown: {
        keywordMatches: {
          matchedKeywords: ["React", "JavaScript", "프론트엔드"],
          missingKeywords: ["TypeScript", "Node.js", "AWS"],
          matchRate: Math.floor(Math.random() * 40) + 50,
          importantMissing: ["TypeScript", "Docker"],
          details: [],
        },
        skillMatches: {
          matchedSkills: [
            {
              skill: "React",
              name: "React",
              description: "Frontend framework",
              resumeLevel: "intermediate",
              requiredLevel: "intermediate",
              match: true,
            },
            {
              skill: "JavaScript",
              name: "JavaScript",
              description: "Programming language",
              resumeLevel: "advanced",
              requiredLevel: "intermediate",
              match: true,
            },
          ],
          missingSkills: ["TypeScript", "Node.js"],
          overallSkillMatch: Math.floor(Math.random() * 30) + 60,
        },
        atsCompliance: {
          score: Math.floor(Math.random() * 20) + 75,
          issues: ["특수 문자 사용"],
          recommendations: ["키워드 밀도 개선"],
          keywordDensity: 0.05,
          formatIssues: [],
          complianceLevel: "good" as const,
        },
      },
      suggestions: [
        {
          category: "skills",
          priority: "high",
          title: "TypeScript 스킬 보완",
          description: "TypeScript 관련 경험을 추가하세요.",
          actionItems: ["TypeScript 프로젝트 경험 추가", "관련 자격증 취득"],
        },
      ],
      processingTime: Math.floor(Math.random() * 1000) + 500,
      mode: "mock",
      aiInsights: {
        provider: "Mock Provider",
        summary:
          "개발 모드: 모의 분석 결과입니다. 실제 분석과 다를 수 있습니다.",
        strengths: ["React 개발 경험", "JavaScript 숙련도"],
        weaknesses: ["TypeScript 경험 부족", "Backend 스킬 보완 필요"],
        recommendations: ["TypeScript 학습 권장", "Full-stack 경험 쌓기"],
        confidenceScore: 85,
      },
    };

    // Mock 딜레이 시뮬레이션
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 1000 + 500)
    );

    return mockResult;
  }

  private generateLocalSummary(score: number): string {
    if (score >= 80) {
      return "전체적으로 채용공고 요구사항과 매우 잘 일치하며, 경쟁력이 높습니다.";
    } else if (score >= 60) {
      return "기본 요구사항을 충족하나, 일부 보완이 필요합니다.";
    } else {
      return "요구사항 대비 매칭도 개선이 필요합니다.";
    }
  }

  private generateLocalStrengths(analysis: AnalysisResult): string[] {
    const strengths: string[] = [];

    if (analysis.breakdown.keywordMatches.matchRate >= 70) {
      strengths.push("핵심 키워드 매칭률이 높음");
    }
    if (analysis.breakdown.skillMatches.overallSkillMatch >= 70) {
      strengths.push("기술 스택 매칭도가 우수함");
    }
    if (analysis.breakdown.atsCompliance.score >= 80) {
      strengths.push("ATS 호환성이 좋음");
    }
    if (analysis.overallScore >= 75) {
      strengths.push("전체적인 적합도가 높음");
    }

    return strengths.length > 0 ? strengths : ["기본적인 요구사항을 충족"];
  }

  private generateLocalWeaknesses(analysis: AnalysisResult): string[] {
    const weaknesses: string[] = [];

    if (analysis.breakdown.keywordMatches.matchRate < 50) {
      weaknesses.push("핵심 키워드 부족");
    }
    if (analysis.breakdown.skillMatches.overallSkillMatch < 50) {
      weaknesses.push("필수 기술 스킬 보완 필요");
    }
    if (analysis.breakdown.atsCompliance.score < 70) {
      weaknesses.push("ATS 최적화 부족");
    }

    return weaknesses;
  }

  private generateLocalRecommendations(analysis: AnalysisResult): string[] {
    const recommendations: string[] = [];

    if (analysis.breakdown.keywordMatches.importantMissing.length > 0) {
      recommendations.push(
        `누락된 키워드 추가: ${analysis.breakdown.keywordMatches.importantMissing
          .slice(0, 3)
          .join(", ")}`
      );
    }
    if (analysis.breakdown.skillMatches.missingSkills.length > 0) {
      recommendations.push(
        `필수 스킬 보완: ${analysis.breakdown.skillMatches.missingSkills
          .slice(0, 3)
          .join(", ")}`
      );
    }
    if (analysis.breakdown.atsCompliance.recommendations.length > 0) {
      recommendations.push(analysis.breakdown.atsCompliance.recommendations[0]);
    }

    return recommendations;
  }

  // 공개 메서드들
  public getConfig(): AIServiceConfig {
    return { ...this.config };
  }

  public getUsage(): UsageStats {
    return this.getUsageStats();
  }

  public getRemainingQuota(): { daily: number; monthly: number } {
    const stats = this.getUsageStats();
    const dailyLimit = this.config.dailyLimit || 100;
    const monthlyLimit = this.config.monthlyLimit || 1000;

    return {
      daily: Math.max(0, dailyLimit - stats.daily),
      monthly: Math.max(0, monthlyLimit - stats.monthly),
    };
  }

  public getCurrentMode(): APIMode {
    return this.config.mode;
  }

  public getAvailableProviders(): string[] {
    return Object.keys(this.providers);
  }

  public setCustomAPIKey(_provider: string, apiKey: string): boolean {
    try {
      // API 키 형식 검증 (기본적인 검증만)
      if (!apiKey || apiKey.length < 10) {
        throw new Error("Invalid API key format");
      }

      // 환경 변수 형태로 저장하지 않고 설정에 포함
      this.updateConfig({
        mode: "custom",
        apiKey,
      });

      return true;
    } catch (error) {
      console.error("Failed to set custom API key:", error);
      return false;
    }
  }
}

export const freeAIService = new FreeAIService();
export default freeAIService;
