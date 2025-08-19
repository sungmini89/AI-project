/**
 * 개발용 Mock AI 서비스
 * 실제 AI API 호출 없이 개발 및 테스트를 위한 가짜 분석 결과를 생성
 * @module services/mockService
 */

import type {
  AIAnalysisResult,
  SupportedLanguage,
  ServiceStatus,
  AIIssue,
  AISuggestion,
} from "../types";

/**
 * Mock AI 서비스 클래스
 * 개발 환경에서 실제 AI API 호출을 시뮬레이션하여 테스트 및 개발을 지원
 * 코드 패턴을 분석하여 현실적인 Mock 결과를 생성
 */
export class MockAIService {
  /** API 호출 시뮬레이션을 위한 지연 시간 (밀리초) */
  private delay = 1000; // 1초 지연으로 실제 API 호출 시뮬레이션

  /**
   * 코드 AI 분석 실행 (Mock)
   * 실제 API 호출을 시뮬레이션하고 Mock 분석 결과를 반환
   * @param code - 분석할 코드
   * @param language - 프로그래밍 언어
   * @returns Mock AI 분석 결과
   */
  async analyzeCode(
    code: string,
    language: SupportedLanguage
  ): Promise<AIAnalysisResult> {
    // 개발 환경에서 API 호출을 시뮬레이션하기 위한 지연
    await new Promise((resolve) => setTimeout(resolve, this.delay));

    const analysis = this.generateMockAnalysis(code, language);

    console.log("Mock AI 분석 완료:", analysis);

    return analysis;
  }

  /**
   * Mock 분석 결과 생성
   * 코드 패턴을 분석하여 현실적인 Mock 이슈와 제안사항을 생성
   * @param code - 분석할 코드
   * @param language - 프로그래밍 언어
   * @returns Mock AI 분석 결과
   */
  private generateMockAnalysis(
    code: string,
    language: SupportedLanguage
  ): AIAnalysisResult {
    const lines = code.split("\n");
    const codeLength = code.length;

    // 코드 패턴 기반 Mock 이슈 생성
    const issues: AIIssue[] = [];
    const suggestions: AISuggestion[] = [];

    // JavaScript/TypeScript 특화 검사
    if (language === "javascript" || language === "typescript") {
      if (code.includes("console.log")) {
        issues.push({
          type: "style",
          severity: "low",
          line: this.findLineNumber(code, "console.log"),
          message: "Console.log 사용이 감지되었습니다",
          explanation:
            "프로덕션 환경에서는 console.log를 제거하는 것이 좋습니다. 적절한 로깅 라이브러리를 사용하거나 디버그 목적의 코드는 제거해주세요.",
          fix: "console.log를 제거하거나 적절한 로거로 교체하세요.",
        });
      }

      if (code.includes("var ")) {
        issues.push({
          type: "style",
          severity: "medium",
          line: this.findLineNumber(code, "var "),
          message: "var 키워드 사용",
          explanation:
            "ES6+에서는 블록 스코프를 가지는 let과 const 사용을 권장합니다.",
          fix: "var를 const 또는 let으로 변경하세요.",
        });
      }

      if (code.includes("==") && !code.includes("===")) {
        issues.push({
          type: "bug",
          severity: "medium",
          line: this.findLineNumber(code, "=="),
          message: "느슨한 동등 비교 연산자 사용",
          explanation:
            "타입 강제 변환을 피하기 위해 엄격한 동등 비교 연산자(===)를 사용하세요.",
          fix: "== 대신 ===를 사용하세요.",
        });
      }

      if (code.includes("eval(")) {
        issues.push({
          type: "security",
          severity: "critical",
          line: this.findLineNumber(code, "eval("),
          message: "위험한 eval() 함수 사용",
          explanation:
            "eval() 함수는 보안 위험을 초래할 수 있습니다. 코드 인젝션 공격에 취약합니다.",
          fix: "eval() 사용을 피하고 안전한 대안을 찾아보세요.",
        });
      }

      // 복잡성 기반 제안
      if (lines.length > 50) {
        suggestions.push({
          type: "refactor",
          priority: "high",
          description: "함수가 너무 길어 보입니다",
          example:
            "큰 함수를 더 작고 재사용 가능한 함수들로 분할하는 것을 고려해보세요.",
        });
      }

      if (code.includes("function") && code.split("function").length > 5) {
        suggestions.push({
          type: "modernize",
          priority: "medium",
          description: "Arrow 함수 사용을 고려해보세요",
          example:
            "const myFunc = (param) => { ... } 형태로 작성할 수 있습니다.",
        });
      }
    }

    // Python 특화 검사
    if (language === "python") {
      if (code.includes("print(")) {
        issues.push({
          type: "style",
          severity: "low",
          line: this.findLineNumber(code, "print("),
          message: "Print 문 사용이 감지되었습니다",
          explanation:
            "프로덕션 코드에서는 적절한 로깅을 사용하는 것이 좋습니다.",
          fix: "logging 모듈을 사용하세요.",
        });
      }

      if (code.includes("except:")) {
        issues.push({
          type: "bug",
          severity: "high",
          line: this.findLineNumber(code, "except:"),
          message: "광범위한 예외 처리",
          explanation:
            "모든 예외를 포착하는 것보다 특정 예외를 처리하는 것이 좋습니다.",
          fix: "구체적인 예외 타입을 명시하세요.",
        });
      }
    }

    // Java 특화 검사
    if (language === "java") {
      if (code.includes("System.out.println")) {
        issues.push({
          type: "style",
          severity: "low",
          line: this.findLineNumber(code, "System.out.println"),
          message: "System.out.println 사용",
          explanation: "프로덕션에서는 적절한 로깅 프레임워크를 사용하세요.",
          fix: "Logger를 사용하세요.",
        });
      }
    }

    // 일반적인 성능 제안
    if (codeLength > 2000) {
      suggestions.push({
        type: "optimize",
        priority: "medium",
        description: "코드가 상당히 큽니다",
        example: "모듈화를 통해 코드를 분리하는 것을 고려해보세요.",
      });
    }

    // 점수 계산 (이슈가 많을수록 점수 감소)
    const baseScore = 95;
    const issueDeduction = issues.reduce((total, issue) => {
      return (
        total +
        (issue.severity === "critical"
          ? 15
          : issue.severity === "high"
            ? 10
            : issue.severity === "medium"
              ? 5
              : 2)
      );
    }, 0);

    const score = Math.max(baseScore - issueDeduction, 30);

    return {
      provider: "mock",
      model: "mock-analyzer-v1",
      summary: this.generateSummary(
        issues.length,
        suggestions.length,
        language
      ),
      issues,
      suggestions,
      score,
      confidence: 0.85,
    };
  }

  private generateSummary(
    issueCount: number,
    suggestionCount: number,
    language: SupportedLanguage
  ): string {
    const templates = [
      `${language} 코드 분석이 완료되었습니다. ${issueCount}개의 이슈와 ${suggestionCount}개의 개선 제안이 발견되었습니다.`,
      `코드 품질 검사 결과: 총 ${issueCount}개의 문제점과 ${suggestionCount}개의 최적화 기회가 식별되었습니다.`,
      `${language} 정적 분석 완료. 발견된 이슈: ${issueCount}개, 개선 제안: ${suggestionCount}개입니다.`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  private findLineNumber(code: string, searchTerm: string): number {
    const lines = code.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchTerm)) {
        return i + 1;
      }
    }
    return 1;
  }

  async getServiceStatus(): Promise<ServiceStatus> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      online: true,
      provider: "mock",
      lastCheck: Date.now(),
      quotaRemaining: 999999,
    };
  }

  // Mock 서비스 설정
  setDelay(ms: number): void {
    this.delay = ms;
  }

  // 특정 시나리오를 위한 Mock 응답 생성
  generateScenario(
    scenario: "perfect" | "issues" | "critical"
  ): Partial<AIAnalysisResult> {
    switch (scenario) {
      case "perfect":
        return {
          summary: "완벽한 코드입니다! 발견된 이슈가 없습니다.",
          issues: [],
          suggestions: [
            {
              type: "optimize",
              priority: "low",
              description:
                "코드가 매우 깔끔합니다. 성능 최적화를 고려해볼 수 있습니다.",
              example: "// 이미 우수한 코드 품질을 유지하고 있습니다",
            },
          ],
          score: 98,
          confidence: 0.95,
        };

      case "issues":
        return {
          summary: "여러 개선 사항이 발견되었습니다.",
          issues: [
            {
              type: "bug",
              severity: "high",
              line: 15,
              message: "잠재적인 null 참조 오류",
              explanation:
                "변수가 null일 수 있는 상황에서 안전하지 않은 접근이 발견되었습니다.",
              fix: "null 체크를 추가하거나 옵셔널 체이닝을 사용하세요.",
            },
            {
              type: "performance",
              severity: "medium",
              line: 23,
              message: "비효율적인 반복문",
              explanation: "O(n²) 복잡도의 중첩 반복문이 발견되었습니다.",
              fix: "Map이나 Set을 사용하여 조회 성능을 개선하세요.",
            },
          ],
          score: 72,
          confidence: 0.88,
        };

      case "critical":
        return {
          summary: "심각한 보안 및 안정성 문제가 발견되었습니다.",
          issues: [
            {
              type: "security",
              severity: "critical",
              line: 8,
              message: "SQL 인젝션 취약점",
              explanation:
                "사용자 입력이 SQL 쿼리에 직접 삽입되어 SQL 인젝션 공격에 취약합니다.",
              fix: "매개변수화된 쿼리나 ORM을 사용하세요.",
            },
            {
              type: "security",
              severity: "critical",
              line: 34,
              message: "하드코딩된 패스워드",
              explanation: "소스 코드에 패스워드가 하드코딩되어 있습니다.",
              fix: "환경 변수나 보안 저장소를 사용하세요.",
            },
          ],
          score: 25,
          confidence: 0.92,
        };

      default:
        return {};
    }
  }
}

export default MockAIService;
