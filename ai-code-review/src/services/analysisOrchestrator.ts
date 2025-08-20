/**
 * 코드 분석 오케스트레이터 - 모든 분석 서비스를 통합 관리
 * ESLint, Prettier, 복잡도 분석, 보안 분석, AI 분석을 통합하여 실행
 * @module services/analysisOrchestrator
 */

import FreeAIService from "./freeAIService";
import MockAIService from "./mockService";
import OfflineAnalysisService from "./offlineService";
import FormattingService from "./formattingService";
import config from "../config";

import type {
  CodeAnalysis,
  SupportedLanguage,
  AIServiceConfig,
  ESLintResult,
  ComplexityAnalysis,
  SecurityAnalysis,
  AIAnalysisResult,
  PrettierResult,
} from "../types";

/**
 * 코드 분석 오케스트레이터 클래스
 * 다양한 분석 서비스를 통합하여 종합적인 코드 분석을 제공
 */
export class AnalysisOrchestrator {
  /** AI 분석 서비스 (실제 또는 목) */
  private aiService!: FreeAIService | MockAIService;
  /** 오프라인 분석 서비스 */
  private offlineService: OfflineAnalysisService;
  /** 코드 포맷팅 서비스 */
  private formattingService: FormattingService;
  /** 현재 AI 서비스 설정 */
  private currentConfig: AIServiceConfig;

  /**
   * 오케스트레이터 생성자
   * @param serviceConfig - AI 서비스 설정
   */
  constructor(serviceConfig: AIServiceConfig) {
    this.currentConfig = serviceConfig;
    this.offlineService = new OfflineAnalysisService();
    this.formattingService = FormattingService.getInstance();

    // AI 서비스 초기화
    this.initializeAIService();
  }

  /**
   * AI 서비스 초기화
   * 설정에 따라 실제 또는 목 AI 서비스를 선택
   */
  private initializeAIService(): void {
    if (config.dev.useMockData || this.currentConfig.mode === "mock") {
      this.aiService = new MockAIService();
      console.log("Mock AI 서비스로 초기화됨");
    } else {
      this.aiService = new FreeAIService(this.currentConfig);
      console.log(
        `실제 AI 서비스로 초기화됨 (모드: ${this.currentConfig.mode})`
      );
    }
  }

  /**
   * 종합적인 코드 분석 실행
   * @param code - 분석할 코드
   * @param language - 프로그래밍 언어
   * @param options - 분석 옵션들
   * @returns 코드 분석 결과
   */
  async analyzeCode(
    code: string,
    language: SupportedLanguage,
    options: {
      includeESLint?: boolean;
      includeComplexity?: boolean;
      includeSecurity?: boolean;
      includeAI?: boolean;
      includePrettier?: boolean;
    } = {}
  ): Promise<CodeAnalysis> {
    const {
      includeESLint = true,
      includeComplexity = true,
      includeSecurity = true,
      includeAI = this.currentConfig.mode !== "offline",
      includePrettier = true,
    } = options;

    const analysisId = this.generateAnalysisId();
    const timestamp = Date.now();

    console.log(
      `코드 분석 시작: ${analysisId} (언어: ${language}, 모드: ${this.currentConfig.mode})`
    );

    // 기본 분석 객체 생성
    const analysis: CodeAnalysis = {
      id: analysisId,
      timestamp,
      language,
      code,
      results: {},
      mode: this.currentConfig.mode,
    };

    try {
      // 병렬로 실행할 수 있는 분석들
      const analysisPromises: Promise<void>[] = [];

      // ESLint 분석
      if (includeESLint) {
        analysisPromises.push(
          this.runESLintAnalysis(code, language)
            .then((results) => {
              analysis.results.eslint = results;
            })
            .catch((error) => console.warn("ESLint 분석 실패:", error))
        );
      }

      // 복잡도 분석
      if (includeComplexity) {
        analysisPromises.push(
          this.runComplexityAnalysis(code, language)
            .then((results) => {
              analysis.results.complexity = results;
            })
            .catch((error) => console.warn("복잡도 분석 실패:", error))
        );
      }

      // 보안 분석
      if (includeSecurity) {
        analysisPromises.push(
          this.runSecurityAnalysis(code, language)
            .then((results) => {
              analysis.results.security = results;
            })
            .catch((error) => console.warn("보안 분석 실패:", error))
        );
      }

      // Prettier 포맷팅
      if (
        includePrettier &&
        this.formattingService.isLanguageSupported(language)
      ) {
        analysisPromises.push(
          this.runPrettierAnalysis(code, language)
            .then((results) => {
              analysis.results.prettier = results;
            })
            .catch((error) => console.warn("Prettier 분석 실패:", error))
        );
      }

      // 오프라인 분석들 실행
      await Promise.allSettled(analysisPromises);

      // AI 분석 (순차 실행 - API 호출 제한 고려)
      if (includeAI) {
        try {
          console.log("AI 분석 시작...");
          analysis.results.ai = await this.runAIAnalysis(code, language);
          console.log("AI 분석 완료");
        } catch (error) {
          console.warn("AI 분석 실패:", error);
          // AI 분석 실패 시 오프라인 대안 제공
          if (this.currentConfig.fallbackToOffline) {
            console.log("오프라인 대안 분석으로 전환");
            const mockService = new MockAIService();
            analysis.results.ai = await mockService.analyzeCode(code, language);
          }
        }
      }

      console.log(`코드 분석 완료: ${analysisId}`);
      return analysis;
    } catch (error) {
      console.error("코드 분석 중 치명적 오류:", error);
      throw new Error(
        `분석 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  }

  /**
   * 실시간 분석 (타이핑 중 가벼운 분석)
   */
  async analyzeCodeRealtime(
    code: string,
    language: SupportedLanguage
  ): Promise<Partial<CodeAnalysis["results"]>> {
    const results: Partial<CodeAnalysis["results"]> = {};

    try {
      // 가벼운 분석만 실행
      const [eslintResults, complexityResults] = await Promise.allSettled([
        this.runESLintAnalysis(code, language),
        this.runComplexityAnalysis(code, language),
      ]);

      if (eslintResults.status === "fulfilled") {
        results.eslint = eslintResults.value;
      }

      if (complexityResults.status === "fulfilled") {
        results.complexity = complexityResults.value;
      }

      return results;
    } catch (error) {
      console.warn("실시간 분석 오류:", error);
      return results;
    }
  }

  /**
   * ESLint 분석 실행
   */
  private async runESLintAnalysis(
    code: string,
    language: SupportedLanguage
  ): Promise<ESLintResult[]> {
    return this.offlineService.analyzeWithESLint(code, language);
  }

  /**
   * 복잡도 분석 실행
   */
  private async runComplexityAnalysis(
    code: string,
    language: SupportedLanguage
  ): Promise<ComplexityAnalysis> {
    return this.offlineService.calculateComplexity(code, language);
  }

  /**
   * 보안 분석 실행
   */
  private async runSecurityAnalysis(
    code: string,
    language: SupportedLanguage
  ): Promise<SecurityAnalysis> {
    return this.offlineService.analyzeSecurityPatterns(code, language);
  }

  /**
   * AI 분석 실행
   */
  private async runAIAnalysis(
    code: string,
    language: SupportedLanguage
  ): Promise<AIAnalysisResult> {
    return this.aiService.analyzeCode(code, language);
  }

  /**
   * Prettier 포맷팅 분석
   */
  private async runPrettierAnalysis(
    code: string,
    language: SupportedLanguage
  ): Promise<PrettierResult> {
    return this.formattingService.formatCode(code, language);
  }

  /**
   * 서비스 설정 업데이트
   */
  updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...newConfig };

    // AI 서비스 재초기화
    this.initializeAIService();

    if (this.aiService instanceof FreeAIService) {
      this.aiService.updateConfig(newConfig);
    }

    console.log("분석 설정 업데이트됨:", this.currentConfig);
  }

  /**
   * 서비스 상태 확인
   */
  async getServiceStatus(): Promise<{
    offline: { available: boolean };
    ai: { available: boolean; provider?: string; quotaRemaining?: number };
    formatting: { available: boolean };
  }> {
    const offlineStatus = { available: true };

    const formattingStatus = { available: true };

    let aiStatus: {
      available: boolean;
      provider?: string;
      quotaRemaining?: number;
    } = {
      available: false,
    };

    try {
      const status = await this.aiService.getServiceStatus();
      aiStatus = {
        available: status.online,
        provider: status.provider,
        quotaRemaining: status.quotaRemaining,
      };
    } catch (error) {
      console.warn("AI 서비스 상태 확인 실패:", error);
    }

    return {
      offline: offlineStatus,
      ai: aiStatus,
      formatting: formattingStatus,
    };
  }

  /**
   * 코드 포맷팅
   */
  async formatCode(
    code: string,
    language: SupportedLanguage
  ): Promise<PrettierResult> {
    return this.formattingService.formatCode(code, language);
  }

  /**
   * 분석 ID 생성
   */
  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 분석 통계 생성
   */
  generateAnalysisStats(analysis: CodeAnalysis): {
    totalIssues: number;
    criticalIssues: number;
    warningIssues: number;
    infoIssues: number;
    complexityScore: number;
    securityScore: number;
    aiScore: number;
    overallScore: number;
  } {
    const eslintIssues = analysis.results.eslint || [];
    const securityIssues = analysis.results.security?.issues || [];
    const aiIssues = analysis.results.ai?.issues || [];

    const criticalIssues = [
      ...eslintIssues.filter((i) => i.severity === "error"),
      ...securityIssues.filter((i) => i.severity === "critical"),
      ...aiIssues.filter((i) => i.severity === "critical"),
    ].length;

    const warningIssues = [
      ...eslintIssues.filter((i) => i.severity === "warning"),
      ...securityIssues.filter(
        (i) => i.severity === "high" || i.severity === "medium"
      ),
      ...aiIssues.filter(
        (i) => i.severity === "high" || i.severity === "medium"
      ),
    ].length;

    const infoIssues = [
      ...eslintIssues.filter((i) => i.severity === "info"),
      ...securityIssues.filter((i) => i.severity === "low"),
      ...aiIssues.filter((i) => i.severity === "low"),
    ].length;

    const totalIssues = criticalIssues + warningIssues + infoIssues;

    const complexityScore = this.calculateComplexityScore(
      analysis.results.complexity
    );
    const securityScore = analysis.results.security?.score || 100;
    const aiScore = analysis.results.ai?.score || 80;

    const overallScore = Math.round(
      (complexityScore + securityScore + aiScore) / 3
    );

    return {
      totalIssues,
      criticalIssues,
      warningIssues,
      infoIssues,
      complexityScore,
      securityScore,
      aiScore,
      overallScore,
    };
  }

  private calculateComplexityScore(complexity?: ComplexityAnalysis): number {
    if (!complexity) return 80;

    const cyclomaticScore = Math.max(0, 100 - (complexity.cyclomatic - 1) * 5);
    const cognitiveScore = Math.max(0, 100 - (complexity.cognitive - 1) * 3);

    return Math.round((cyclomaticScore + cognitiveScore) / 2);
  }
}

export default AnalysisOrchestrator;
