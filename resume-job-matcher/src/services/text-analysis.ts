/**
 * @fileoverview 텍스트 분석 서비스 클래스
 * @description 이력서와 채용공고 텍스트를 분석하여 키워드 매칭, 스킬 분석, ATS 준수성 검사를 수행하는
 * 로컬 분석 서비스입니다. 자연어 처리 라이브러리를 사용하여 오프라인에서도 정확한 분석이 가능합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

import { removeStopwords, kor, eng } from "stopword";
import type {
  AnalysisResult,
  AnalysisOptions,
  KeywordAnalysis,
  SkillAnalysis,
  ATSAnalysis,
  Suggestion,
} from "@/types/analysis";

/**
 * 텍스트 분석 서비스 클래스
 * @description 이력서와 채용공고 간의 매칭을 분석하는 정적 메서드들을 제공합니다.
 * 키워드 분석, 스킬 분석, ATS 준수성 검사 등의 기능을 포함합니다.
 *
 * @example
 * ```tsx
 * const result = await TextAnalysisService.analyzeMatch(resumeText, jobText, options);
 * ```
 */
export class TextAnalysisService {
  /**
   * 스킬 데이터베이스
   * @description 일반적으로 사용되는 기술 스킬들을 카테고리별로 분류하여 저장합니다.
   */
  private static skillsDatabase = {
    programming: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "C++",
      "C#",
      "Go",
      "Rust",
      "PHP",
      "Ruby",
    ],
    frontend: [
      "React",
      "Vue.js",
      "Angular",
      "HTML",
      "CSS",
      "Sass",
      "Webpack",
      "Tailwind CSS",
      "Next.js",
      "Nuxt.js",
    ],
    backend: [
      "Node.js",
      "Express",
      "Django",
      "Flask",
      "Spring",
      "Laravel",
      ".NET",
      "FastAPI",
      "NestJS",
    ],
    database: [
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Oracle",
      "SQLite",
      "Firebase",
      "DynamoDB",
    ],
    cloud: [
      "AWS",
      "Google Cloud",
      "Azure",
      "Docker",
      "Kubernetes",
      "Terraform",
      "Jenkins",
      "CI/CD",
    ],
    tools: [
      "Git",
      "Jira",
      "Slack",
      "Figma",
      "Adobe",
      "Postman",
      "VSCode",
      "IntelliJ",
    ],
    soft_skills: [
      "리더십",
      "팀워크",
      "소통",
      "문제해결",
      "분석",
      "기획",
      "프레젠테이션",
      "협업",
    ],
  };

  /**
   * 이력서와 채용공고 간의 매칭을 분석하는 메인 함수
   * @description 키워드 분석, 스킬 분석, ATS 준수성 검사를 수행하여 종합적인 매칭 결과를 반환합니다.
   *
   * @param {string} resumeText - 분석할 이력서 텍스트
   * @param {string} jobDescription - 분석할 채용공고 텍스트
   * @param {AnalysisOptions} options - 분석 옵션 (언어, ATS 포함 여부 등)
   * @returns {Promise<AnalysisResult>} 분석 결과 객체
   *
   * @throws {Error} 분석 과정에서 오류가 발생할 경우
   *
   * @example
   * ```tsx
   * const options = { language: 'ko', includeATS: true, depth: 'detailed' };
   * const result = await TextAnalysisService.analyzeMatch(resumeText, jobText, options);
   * ```
   */
  static async analyzeMatch(
    resumeText: string,
    jobDescription: string,
    options: AnalysisOptions
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      // 텍스트 전처리
      const processedResume = this.preprocessText(resumeText, options.language);
      const processedJob = this.preprocessText(
        jobDescription,
        options.language
      );

      // 키워드 분석
      const keywordAnalysis = this.analyzeKeywords(
        processedResume,
        processedJob
      );

      // 스킬 분석
      const skillAnalysis = this.analyzeSkills(resumeText, jobDescription);

      // ATS 분석 (옵션)
      const atsAnalysis = options.includeATS
        ? this.analyzeATSCompliance(resumeText)
        : this.getDefaultATSAnalysis();

      // 전체 점수 계산
      const overallScore = this.calculateOverallScore(
        keywordAnalysis,
        skillAnalysis,
        atsAnalysis
      );

      // 개선 제안 생성
      const suggestions = this.generateSuggestions(
        keywordAnalysis,
        skillAnalysis,
        atsAnalysis
      );

      const processingTime = Date.now() - startTime;

      return {
        overallScore,
        breakdown: {
          keywordMatches: keywordAnalysis,
          skillMatches: skillAnalysis,
          atsCompliance: atsAnalysis,
        },
        suggestions,
        processingTime,
        mode: "offline",
      };
    } catch (error) {
      console.error("Text analysis error:", error);
      throw new Error("텍스트 분석 중 오류가 발생했습니다.");
    }
  }

  /**
   * 텍스트 전처리 함수
   * @description 입력된 텍스트를 정리하고 토큰화하며 불용어를 제거합니다.
   *
   * @param {string} text - 전처리할 텍스트
   * @param {'ko' | 'en'} language - 텍스트 언어
   * @returns {string[]} 전처리된 토큰 배열
   *
   * @private
   */
  private static preprocessText(text: string, language: "ko" | "en"): string[] {
    // 텍스트 정리
    const cleanText = text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // 토큰화
    let tokens = cleanText.split(" ");

    // 불용어 제거
    if (language === "ko") {
      tokens = removeStopwords(tokens, kor);
    } else {
      tokens = removeStopwords(tokens, eng);
    }

    // 짧은 단어 제거 (2글자 미만)
    tokens = tokens.filter((token) => token.length >= 2);

    return tokens;
  }

  /**
   * 키워드 분석 함수
   * @description 이력서와 채용공고 간의 키워드 매칭을 분석합니다.
   * TF-IDF 알고리즘을 사용하여 키워드의 중요도를 계산합니다.
   *
   * @param {string[]} resumeTokens - 이력서 토큰 배열
   * @param {string[]} jobTokens - 채용공고 토큰 배열
   * @returns {KeywordAnalysis} 키워드 분석 결과
   *
   * @private
   */
  private static analyzeKeywords(
    resumeTokens: string[],
    jobTokens: string[]
  ): KeywordAnalysis {
    // TF-IDF 계산
    const jobTfidf = this.calculateTFIDF([jobTokens]);

    // 중요 키워드 추출 (TF-IDF 점수 기준 상위 20개)
    const importantJobKeywords = Object.entries(jobTfidf[0])
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);

    // 매칭된 키워드 찾기
    const matchedKeywords = importantJobKeywords.filter((keyword) =>
      resumeTokens.includes(keyword)
    );

    const missingKeywords = importantJobKeywords.filter(
      (keyword) => !resumeTokens.includes(keyword)
    );

    // 중요도가 높은 누락 키워드 (TF-IDF 점수 상위 5개)
    const importantMissing = missingKeywords
      .map((keyword) => ({ keyword, score: jobTfidf[0][keyword] || 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ keyword }) => keyword);

    const matchRate =
      importantJobKeywords.length > 0
        ? (matchedKeywords.length / importantJobKeywords.length) * 100
        : 0;

    return {
      matchedKeywords,
      missingKeywords,
      matchRate: Math.round(matchRate),
      importantMissing,
      details: [],
    };
  }

  private static calculateTFIDF(
    documents: string[][]
  ): Record<string, number>[] {
    const tfidfResults: Record<string, number>[] = [];
    const allWords = new Set<string>();

    // 모든 고유 단어 수집
    documents.forEach((doc) => {
      doc.forEach((word) => allWords.add(word));
    });

    documents.forEach((doc) => {
      const tfidf: Record<string, number> = {};
      const docLength = doc.length;

      allWords.forEach((word) => {
        // TF (Term Frequency) 계산
        const tf = doc.filter((w) => w === word).length / docLength;

        // IDF (Inverse Document Frequency) 계산
        const docsWithWord = documents.filter((d) => d.includes(word)).length;
        const idf = Math.log(documents.length / docsWithWord);

        tfidf[word] = tf * idf;
      });

      tfidfResults.push(tfidf);
    });

    return tfidfResults;
  }

  private static analyzeSkills(
    resumeText: string,
    jobDescription: string
  ): SkillAnalysis {
    const resumeLower = resumeText.toLowerCase();
    const jobLower = jobDescription.toLowerCase();

    const skillCategories = Object.entries(this.skillsDatabase).map(
      ([category, skills]) => {
        const categorySkills = skills.map((skill) => {
          const skillLower = skill.toLowerCase();
          const inResume = resumeLower.includes(skillLower);
          const inJob = jobLower.includes(skillLower);

          return {
            name: skill,
            category,
            importance: inJob ? 1 : 0.5,
            matched: inResume && inJob,
          };
        });

        const matchedCount = categorySkills.filter((s) => s.matched).length;
        const totalRequired =
          categorySkills.filter((s) => s.importance === 1).length ||
          categorySkills.length;
        const matchRate =
          totalRequired > 0 ? (matchedCount / totalRequired) * 100 : 0;

        return {
          name: category,
          skills: categorySkills,
          matchRate: Math.round(matchRate),
        };
      }
    );

    const allSkills = skillCategories.flatMap((cat) => cat.skills);
    const matchedSkills = allSkills.filter((skill) => skill.matched);
    const missingSkills = allSkills.filter(
      (skill) => skill.importance === 1 && !skill.matched
    );

    const overallSkillMatch =
      allSkills.length > 0
        ? Math.round(
            (matchedSkills.length /
              allSkills.filter((s) => s.importance === 1).length) *
              100
          )
        : 0;

    const formattedMatchedSkills = matchedSkills.map((skill) => ({
      skill: skill.name,
      name: skill.name,
      description: skill.category,
      resumeLevel: "intermediate" as const,
      requiredLevel: "intermediate" as const,
      match: true,
    }));

    const formattedMissingSkills = missingSkills.map((skill) => skill.name);

    return {
      matchedSkills: formattedMatchedSkills,
      missingSkills: formattedMissingSkills,
      overallSkillMatch,
    };
  }

  private static analyzeATSCompliance(resumeText: string): ATSAnalysis {
    const issues: any[] = [];
    let score = 100;

    // ATS 호환성 체크 패턴
    const checks = [
      {
        test: () => resumeText.includes("●") || resumeText.includes("•"),
        issue: {
          type: "format" as const,
          severity: "medium" as const,
          description: "특수 문자 불릿 포인트 사용",
          solution: "대신 하이픈(-)이나 별표(*)를 사용하세요",
        },
      },
      {
        test: () => resumeText.split("\n").length < 10,
        issue: {
          type: "structure" as const,
          severity: "low" as const,
          description: "이력서가 너무 짧습니다",
          solution: "더 자세한 경력 및 스킬 정보를 추가하세요",
        },
      },
      {
        test: () => !/\b(경력|경험|프로젝트)\b/i.test(resumeText),
        issue: {
          type: "content" as const,
          severity: "high" as const,
          description: "경력 정보가 명확하지 않습니다",
          solution: "구체적인 경력 및 프로젝트 경험을 추가하세요",
        },
      },
    ];

    checks.forEach((check) => {
      if (check.test()) {
        issues.push(check.issue);
        score -=
          check.issue.severity === "high"
            ? 20
            : check.issue.severity === "medium"
            ? 10
            : 5;
      }
    });

    const complianceLevel =
      score >= 90
        ? "excellent"
        : score >= 70
        ? "good"
        : score >= 50
        ? "fair"
        : "poor";

    return {
      score: Math.max(0, score),
      issues: issues.map((issue) => issue.description),
      recommendations: issues.map((issue) => issue.solution),
      keywordDensity: 0.05,
      formatIssues: [],
      complianceLevel,
    };
  }

  private static getDefaultATSAnalysis(): ATSAnalysis {
    return {
      score: 85,
      issues: [],
      recommendations: [],
      keywordDensity: 0.05,
      formatIssues: [],
      complianceLevel: "good",
    };
  }

  private static calculateOverallScore(
    keywords: KeywordAnalysis,
    skills: SkillAnalysis,
    ats: ATSAnalysis
  ): number {
    // 가중치: 키워드 40%, 스킬 40%, ATS 20%
    const weightedScore =
      keywords.matchRate * 0.4 +
      skills.overallSkillMatch * 0.4 +
      ats.score * 0.2;

    return Math.round(Math.min(100, Math.max(0, weightedScore)));
  }

  private static generateSuggestions(
    keywords: KeywordAnalysis,
    skills: SkillAnalysis,
    ats: ATSAnalysis
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // 키워드 관련 제안
    if (keywords.importantMissing.length > 0) {
      suggestions.push({
        category: "keywords",
        priority: "high",
        title: "핵심 키워드 추가",
        description: "채용공고에서 중요하게 다뤄지는 키워드가 누락되었습니다.",
        actionItems: keywords.importantMissing.map(
          (keyword) => `"${keyword}" 관련 경험이나 스킬을 이력서에 추가하세요`
        ),
      });
    }

    // 스킬 관련 제안
    if (skills.missingSkills.length > 0) {
      const topMissingSkills = skills.missingSkills.slice(0, 5);
      suggestions.push({
        category: "skills",
        priority: "medium",
        title: "필수 스킬 보완",
        description: "채용공고에서 요구하는 기술 스킬을 보완하세요.",
        actionItems: topMissingSkills.map(
          (skill) => `${skill} 관련 프로젝트나 학습 경험을 추가하세요`
        ),
      });
    }

    // ATS 관련 제안
    if (ats.recommendations.length > 0) {
      suggestions.push({
        category: "format",
        priority: "high",
        title: "ATS 호환성 개선",
        description:
          "ATS 시스템에서 올바르게 읽힐 수 있도록 형식을 개선하세요.",
        actionItems: ats.recommendations,
      });
    }

    return suggestions;
  }
}
