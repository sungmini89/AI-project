/**
 * AnalysisOrchestrator 테스트
 * 코드 분석 오케스트레이터의 통합 기능과 동작을 검증하는 테스트 스위트
 * @module services/__tests__/analysisOrchestrator.test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import AnalysisOrchestrator from "../analysisOrchestrator";
import type { AIServiceConfig, SupportedLanguage } from "../../types";

/**
 * 서비스들 모킹
 * 실제 AI 서비스 대신 Mock 서비스를 사용하여 테스트 환경에서 사용
 */
vi.mock("../freeAIService", () => ({
  default: class MockFreeAIService {
    analyzeCode = vi.fn().mockResolvedValue({
      provider: "gemini",
      model: "gemini-pro",
      summary: "Test analysis",
      issues: [],
      suggestions: [],
      score: 85,
      confidence: 0.9,
    });
    getServiceStatus = vi.fn().mockResolvedValue({ online: true });
  },
}));

/**
 * Mock AI 서비스 모킹
 * 개발 환경에서 사용되는 Mock AI 서비스를 시뮬레이션
 */
vi.mock("../mockService", () => ({
  default: class MockService {
    analyzeCode = vi.fn().mockResolvedValue({
      provider: "mock",
      model: "mock-model",
      summary: "Mock analysis",
      issues: [],
      suggestions: [],
      score: 80,
      confidence: 0.8,
    });
  },
}));

/**
 * 오프라인 분석 서비스 모킹
 * 인터넷 연결 없이 동작하는 오프라인 분석 서비스를 시뮬레이션
 */
vi.mock("../offlineService", () => ({
  default: class MockOfflineService {
    analyzeWithESLint = vi.fn().mockResolvedValue([]);
    calculateComplexity = vi.fn().mockResolvedValue({
      cyclomatic: 5,
      cognitive: 3,
      lines: 10,
      functions: [],
      overall: "low",
    });
    analyzeSecurityPatterns = vi.fn().mockResolvedValue({
      issues: [],
      score: 100,
      level: "safe",
    });
  },
}));

/**
 * 포맷팅 서비스 모킹
 * 코드 포맷팅 기능을 시뮬레이션
 */
vi.mock("../formattingService", () => ({
  default: {
    getInstance: () => ({
      formatCode: vi.fn().mockResolvedValue({
        formatted: "formatted code",
        changed: true,
        diff: "+formatted code\\n-original code",
      }),
      isLanguageSupported: vi.fn().mockReturnValue(true),
    }),
  },
}));

/**
 * AnalysisOrchestrator 테스트 스위트
 * 오케스트레이터의 초기화, 분석 실행, 결과 통합 등을 검증
 */
describe("AnalysisOrchestrator", () => {
  /** 테스트용 오케스트레이터 인스턴스 */
  let orchestrator: AnalysisOrchestrator;
  /** 테스트용 AI 서비스 설정 */
  const config: AIServiceConfig = {
    mode: "mock",
    fallbackToOffline: true,
  };

  /**
   * 각 테스트 전에 오케스트레이터 인스턴스를 새로 생성
   */
  beforeEach(() => {
    orchestrator = new AnalysisOrchestrator(config);
  });

  /**
   * 코드 분석 기능 테스트 그룹
   */
  describe("analyzeCode", () => {
    /**
     * 완전한 코드 분석이 수행되는지 테스트
     */
    it("should perform complete code analysis", async () => {
      const code = 'console.log("test");';
      const language: SupportedLanguage = "javascript";

      const result = await orchestrator.analyzeCode(code, language);

      expect(result).toBeDefined();
      expect(result.code).toBe(code);
      expect(result.language).toBe(language);
      expect(result.mode).toBe("mock");
      expect(result.results).toBeDefined();
    });

    /**
     * ESLint 결과가 요청된 경우 포함되는지 테스트
     */
    it("should include ESLint results when requested", async () => {
      const code = 'console.log("test");';
      const language: SupportedLanguage = "javascript";

      const result = await orchestrator.analyzeCode(code, language, {
        includeESLint: true,
      });

      expect(result.results.eslint).toBeDefined();
    });

    it("should include complexity analysis when requested", async () => {
      const code = "function test() { return 1; }";
      const language: SupportedLanguage = "javascript";

      const result = await orchestrator.analyzeCode(code, language, {
        includeComplexity: true,
      });

      expect(result.results.complexity).toBeDefined();
      expect(result.results.complexity?.cyclomatic).toBe(5);
    });

    it("should include AI analysis when requested", async () => {
      const code = 'console.log("test");';
      const language: SupportedLanguage = "javascript";

      const result = await orchestrator.analyzeCode(code, language, {
        includeAI: true,
      });

      expect(result.results.ai).toBeDefined();
      expect(result.results.ai?.provider).toBe("mock");
    });
  });

  describe("analyzeCodeRealtime", () => {
    it("should perform lightweight analysis", async () => {
      const code = 'console.log("test");';
      const language: SupportedLanguage = "javascript";

      const result = await orchestrator.analyzeCodeRealtime(code, language);

      expect(result.eslint).toBeDefined();
      expect(result.complexity).toBeDefined();
      expect(result.ai).toBeUndefined(); // AI should not be included in realtime
    });
  });

  describe("formatCode", () => {
    it("should format code correctly", async () => {
      const code = 'console.log("test")';
      const language: SupportedLanguage = "javascript";

      const result = await orchestrator.formatCode(code, language);

      expect(result.formatted).toBe("formatted code");
      expect(result.changed).toBe(true);
    });
  });

  describe("generateAnalysisStats", () => {
    it("should calculate statistics correctly", () => {
      const mockAnalysis = {
        id: "test",
        timestamp: Date.now(),
        language: "javascript" as SupportedLanguage,
        code: "test code",
        mode: "mock" as const,
        results: {
          eslint: [
            {
              line: 1,
              column: 1,
              severity: "error" as const,
              message: "test",
              ruleId: "test",
              source: "test",
            },
          ],
          security: {
            issues: [
              {
                type: "test",
                line: 1,
                column: 1,
                severity: "high" as const,
                message: "test",
                pattern: "test",
              },
            ],
            score: 80,
            level: "warning" as const,
          },
          ai: {
            provider: "mock",
            model: "test",
            summary: "test",
            issues: [],
            suggestions: [],
            score: 85,
            confidence: 0.9,
          },
        },
      };

      const stats = orchestrator.generateAnalysisStats(mockAnalysis);

      expect(stats.totalIssues).toBe(2);
      expect(stats.criticalIssues).toBe(1);
      expect(stats.warningIssues).toBe(1);
      expect(stats.aiScore).toBe(85);
    });
  });
});
