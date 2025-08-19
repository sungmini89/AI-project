/**
 * 오프라인 코드 분석 서비스 - ESLint, 복잡도, 보안 패턴 검사
 * 인터넷 연결 없이도 코드 품질을 분석할 수 있는 독립적인 분석 서비스
 * @module services/offlineService
 */

import type {
  ESLintResult,
  ComplexityAnalysis,
  SecurityAnalysis,
  SupportedLanguage,
  SecurityIssue,
  FunctionComplexity,
} from "../types";
import config from "../config";

/**
 * 오프라인 코드 분석 서비스 클래스
 * ESLint 규칙, 복잡도 계산, 보안 패턴 검사를 오프라인에서 수행
 * 외부 API에 의존하지 않고 로컬에서 모든 분석을 처리
 */
export class OfflineAnalysisService {
  /**
   * ESLint 기반 코드 품질 검사
   * JavaScript/TypeScript 코드에 대해 설정된 ESLint 규칙을 적용하여 품질 이슈를 검출
   * @param code - 분석할 코드
   * @param language - 프로그래밍 언어
   * @returns ESLint 분석 결과 배열
   */
  async analyzeWithESLint(
    code: string,
    language: SupportedLanguage
  ): Promise<ESLintResult[]> {
    // JavaScript/TypeScript에서만 ESLint 규칙 적용
    if (language !== "javascript" && language !== "typescript") {
      return [];
    }

    const results: ESLintResult[] = [];
    const lines = code.split("\n");

    // 설정된 ESLint 규칙 적용
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNumber = lineIndex + 1;

      // no-unused-vars 검사
      if (this.checkUnusedVars(line, lines, lineIndex)) {
        results.push({
          line: lineNumber,
          column: 1,
          severity: "warning",
          message: "사용되지 않는 변수가 있을 수 있습니다",
          ruleId: "no-unused-vars",
          source: line.trim(),
        });
      }

      // no-console 검사
      if (line.includes("console.")) {
        const match = line.match(/console\.(log|warn|error|info|debug)/);
        if (match) {
          results.push({
            line: lineNumber,
            column: line.indexOf("console.") + 1,
            severity: "warning",
            message: `예상치 못한 console.${match[1]}`,
            ruleId: "no-console",
            source: line.trim(),
          });
        }
      }

      // prefer-const 검사
      if (line.includes("let ") && this.shouldBeConst(line, lines, lineIndex)) {
        results.push({
          line: lineNumber,
          column: line.indexOf("let ") + 1,
          severity: "error",
          message: "'let' 대신 'const'를 사용하세요",
          ruleId: "prefer-const",
          source: line.trim(),
        });
      }

      // no-var 검사
      if (line.includes("var ")) {
        results.push({
          line: lineNumber,
          column: line.indexOf("var ") + 1,
          severity: "error",
          message: "'var' 대신 'let' 또는 'const'를 사용하세요",
          ruleId: "no-var",
          source: line.trim(),
        });
      }

      // eqeqeq 검사
      if (
        line.includes("==") &&
        !line.includes("===") &&
        !line.includes("!=")
      ) {
        results.push({
          line: lineNumber,
          column: line.indexOf("==") + 1,
          severity: "error",
          message: "예상되는 '===' 대신 '=='이 있습니다",
          ruleId: "eqeqeq",
          source: line.trim(),
        });
      }

      // no-eval 검사
      if (line.includes("eval(")) {
        results.push({
          line: lineNumber,
          column: line.indexOf("eval(") + 1,
          severity: "error",
          message: "eval() 사용은 피해주세요",
          ruleId: "no-eval",
          source: line.trim(),
        });
      }

      // no-implied-eval 검사
      if (
        line.match(/setTimeout\s*\(\s*['"`]/) ||
        line.match(/setInterval\s*\(\s*['"`]/)
      ) {
        results.push({
          line: lineNumber,
          column: 1,
          severity: "error",
          message: "문자열로 setTimeout/setInterval을 호출하지 마세요",
          ruleId: "no-implied-eval",
          source: line.trim(),
        });
      }
    }

    return results;
  }

  /**
   * 코드 복잡도 계산 (McCabe Cyclomatic Complexity)
   */
  calculateComplexity(
    code: string,
    language: SupportedLanguage
  ): ComplexityAnalysis {
    const lines = code.split("\n");
    const functions = this.extractFunctions(code, language);

    // 전체 순환 복잡도 계산
    let totalCyclomatic = 1; // 기본 경로
    let totalCognitive = 0;

    // 복잡도 증가 키워드들
    const cyclomaticPatterns = this.getCyclomaticPatterns(language);
    const cognitivePatterns = this.getCognitivePatterns(language);

    for (const line of lines) {
      // 순환 복잡도 증가 요소
      for (const pattern of cyclomaticPatterns) {
        const matches = line.match(pattern);
        if (matches) {
          totalCyclomatic += matches.length;
        }
      }

      // 인지 복잡도 증가 요소
      for (const pattern of cognitivePatterns) {
        const matches = line.match(pattern);
        if (matches) {
          totalCognitive += matches.length;
        }
      }
    }

    // 함수별 복잡도 계산
    const functionComplexities = functions.map((func) =>
      this.calculateFunctionComplexity(func, language)
    );

    return {
      cyclomatic: totalCyclomatic,
      cognitive: totalCognitive,
      lines: lines.length,
      functions: functionComplexities,
      overall: this.getComplexityLevel(
        Math.max(totalCyclomatic, totalCognitive)
      ),
    };
  }

  /**
   * 보안 패턴 검사
   */
  analyzeSecurityPatterns(
    code: string,
    language: SupportedLanguage
  ): SecurityAnalysis {
    const issues: SecurityIssue[] = [];
    const lines = code.split("\n");

    // 설정된 보안 패턴 검사
    const patterns = config.security.patterns;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNumber = lineIndex + 1;

      // SQL 인젝션 패턴
      const sqlMatch = line.match(patterns.sqlInjection);
      if (sqlMatch) {
        issues.push({
          type: "sql-injection",
          line: lineNumber,
          column: sqlMatch.index || 0,
          severity: "critical",
          message: "SQL 인젝션 취약점이 감지되었습니다",
          pattern: sqlMatch[0],
          suggestion: "매개변수화된 쿼리를 사용하세요",
        });
      }

      // XSS 패턴
      const xssMatch = line.match(patterns.xss);
      if (xssMatch) {
        issues.push({
          type: "xss",
          line: lineNumber,
          column: xssMatch.index || 0,
          severity: "high",
          message: "Cross-site scripting (XSS) 취약점이 감지되었습니다",
          pattern: xssMatch[0],
          suggestion: "사용자 입력을 적절히 이스케이프 처리하세요",
        });
      }

      // 하드코딩된 인증정보
      const credentialsMatch = line.match(patterns.hardcodedCredentials);
      if (credentialsMatch) {
        issues.push({
          type: "hardcoded-credentials",
          line: lineNumber,
          column: credentialsMatch.index || 0,
          severity: "critical",
          message: "하드코딩된 인증정보가 감지되었습니다",
          pattern: credentialsMatch[0].replace(/['"]/g, "***"),
          suggestion: "환경 변수나 설정 파일을 사용하세요",
        });
      }

      // 안전하지 않은 eval 사용
      const evalMatch = line.match(patterns.unsafeEval);
      if (evalMatch) {
        issues.push({
          type: "unsafe-eval",
          line: lineNumber,
          column: evalMatch.index || 0,
          severity: "high",
          message: "안전하지 않은 eval 사용이 감지되었습니다",
          pattern: evalMatch[0],
          suggestion: "안전한 대안을 사용하세요",
        });
      }

      // 언어별 추가 보안 검사
      this.checkLanguageSpecificSecurity(line, lineNumber, language, issues);
    }

    // 보안 점수 계산
    const score = this.calculateSecurityScore(issues);
    const level = this.getSecurityLevel(score);

    return {
      issues,
      score,
      level,
    };
  }

  // Private helper methods

  private checkUnusedVars(
    line: string,
    lines: string[],
    index: number
  ): boolean {
    const varMatch = line.match(
      /(?:let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/
    );
    if (!varMatch) return false;

    const varName = varMatch[1];
    const codeAfterDeclaration = lines.slice(index + 1).join("\n");

    // 변수가 선언 이후 사용되는지 확인
    const usageRegex = new RegExp(`\\b${varName}\\b`, "g");
    const usages = codeAfterDeclaration.match(usageRegex);

    return !usages || usages.length === 0;
  }

  private shouldBeConst(line: string, lines: string[], index: number): boolean {
    const varMatch = line.match(/let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (!varMatch) return false;

    const varName = varMatch[1];
    const codeAfterDeclaration = lines.slice(index + 1).join("\n");

    // 변수에 재할당이 있는지 확인
    const assignmentRegex = new RegExp(`${varName}\\s*[+\\-*/%^&|]?=`, "g");
    return !assignmentRegex.test(codeAfterDeclaration);
  }

  private getCyclomaticPatterns(language: SupportedLanguage): RegExp[] {
    const commonPatterns = [
      /\bif\s*\(/g,
      /\belse\s+if\b/g,
      /\bwhile\s*\(/g,
      /\bfor\s*\(/g,
      /\bcatch\s*\(/g,
      /\bcase\s+/g,
      /\?.*:/g, // 삼항 연산자
      /&&/g,
      /\|\|/g,
    ];

    switch (language) {
      case "javascript":
      case "typescript":
        return [...commonPatterns, /\bswitch\s*\(/g, /\btry\s*\{/g];

      case "python":
        return [
          ...commonPatterns,
          /\belif\b/g,
          /\bexcept\b/g,
          /\bfinally\b/g,
          /\band\b/g,
          /\bor\b/g,
        ];

      case "java":
        return [
          ...commonPatterns,
          /\bswitch\s*\(/g,
          /\btry\s*\{/g,
          /\bdo\s*\{/g,
        ];

      default:
        return commonPatterns;
    }
  }

  private getCognitivePatterns(language: SupportedLanguage): RegExp[] {
    return this.getCyclomaticPatterns(language).concat([
      /\bnested/g, // 중첩 구조 추가 가중치
    ]);
  }

  private extractFunctions(code: string, language: SupportedLanguage): any[] {
    const functions = [];
    const lines = code.split("\n");

    let functionRegex: RegExp;

    switch (language) {
      case "javascript":
      case "typescript":
        functionRegex =
          /(?:function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:=]\s*(?:function|\([^)]*\)\s*=>))/g;
        break;
      case "python":
        functionRegex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
        break;
      case "java":
        functionRegex =
          /(?:public|private|protected)?\s*(?:static\s+)?[a-zA-Z_<>[\]]+\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
        break;
      default:
        return [];
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = functionRegex.exec(line);
      if (match) {
        const functionName = match[1] || match[2] || "anonymous";
        functions.push({
          name: functionName,
          line: i + 1,
          content: line,
        });
      }
    }

    return functions;
  }

  private calculateFunctionComplexity(
    func: any,
    language: SupportedLanguage
  ): FunctionComplexity {
    // 함수별 복잡도는 전체 복잡도 계산과 유사하게 처리
    const patterns = this.getCyclomaticPatterns(language);
    let complexity = 1;

    for (const pattern of patterns) {
      const matches = func.content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return {
      name: func.name,
      line: func.line,
      cyclomatic: complexity,
      cognitive: complexity, // 간단히 같은 값 사용
    };
  }

  private getComplexityLevel(
    complexity: number
  ): "low" | "medium" | "high" | "very-high" {
    if (complexity <= config.analysis.complexity.cyclomaticThreshold)
      return "low";
    if (complexity <= config.analysis.complexity.cyclomaticThreshold * 1.5)
      return "medium";
    if (complexity <= config.analysis.complexity.cyclomaticThreshold * 2)
      return "high";
    return "very-high";
  }

  private checkLanguageSpecificSecurity(
    line: string,
    lineNumber: number,
    language: SupportedLanguage,
    issues: SecurityIssue[]
  ): void {
    switch (language) {
      case "javascript":
      case "typescript":
        // innerHTML 사용 검사
        if (line.includes(".innerHTML")) {
          issues.push({
            type: "xss",
            line: lineNumber,
            column: line.indexOf(".innerHTML"),
            severity: "medium",
            message: "innerHTML 사용 시 XSS 위험",
            pattern: ".innerHTML",
            suggestion:
              "textContent를 사용하거나 적절한 새니타이제이션을 적용하세요",
          });
        }
        break;

      case "python":
        // exec 사용 검사
        if (line.includes("exec(")) {
          issues.push({
            type: "code-injection",
            line: lineNumber,
            column: line.indexOf("exec("),
            severity: "critical",
            message: "위험한 exec() 사용",
            pattern: "exec(",
            suggestion: "안전한 대안을 사용하세요",
          });
        }
        break;
    }
  }

  private calculateSecurityScore(issues: SecurityIssue[]): number {
    let score = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case "critical":
          score -= 25;
          break;
        case "high":
          score -= 15;
          break;
        case "medium":
          score -= 8;
          break;
        case "low":
          score -= 3;
          break;
      }
    }

    return Math.max(score, 0);
  }

  private getSecurityLevel(score: number): "safe" | "warning" | "dangerous" {
    if (score >= 80) return "safe";
    if (score >= 50) return "warning";
    return "dangerous";
  }
}

export default OfflineAnalysisService;
