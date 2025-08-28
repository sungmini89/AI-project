import { TextDocument } from "@/types";
import { pdfProcessor } from "./pdfProcessor";
import { aiService } from "./aiService";

export class TextProcessor {
  // PDF 텍스트 추출은 pdfProcessor.ts에서 처리됩니다.

  async summarizeText(
    text: string,
    options: { length?: number } = {}
  ): Promise<string> {
    try {
      // AI 서비스 사용 시도
      const lengthMap: { [key: number]: "short" | "medium" | "long" } = {
        1: "short",
        2: "short",
        3: "medium",
        4: "medium",
        5: "long",
      };

      const { length = 3 } = options;
      const aiLength = lengthMap[Math.min(length, 5)] || "medium";

      return await aiService.summarizeText(text, {
        length: aiLength,
        style: "paragraph",
      });
    } catch (error) {
      console.warn("AI 요약 실패, 오프라인 모드 사용:", error);
      // 폴백으로 기존 로직 사용
      return this.fallbackSummarize(text, options.length || 3);
    }
  }

  private fallbackSummarize(text: string, sentenceCount: number): string {
    const sentences = text.split(/[.!?。]/).filter((s) => s.trim().length > 10);

    if (sentences.length <= sentenceCount) {
      return text;
    }

    const scores: { sentence: string; score: number; position: number }[] = [];

    // 단어 빈도 계산 (한국어 + 영어 지원)
    const words = text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2);

    const wordFreq: { [key: string]: number } = {};
    const totalWords = words.length;

    words.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // 문장별 점수 계산
    sentences.forEach((sentence, index) => {
      const sentenceWords = sentence
        .toLowerCase()
        .replace(/[^\w\s가-힣]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2);

      let frequencyScore = 0;
      let uniqueWords = 0;

      sentenceWords.forEach((word) => {
        if (wordFreq[word]) {
          frequencyScore += wordFreq[word] / totalWords;
          uniqueWords++;
        }
      });

      // 위치 점수 (첫 번째와 마지막 문장에 가중치)
      const positionScore =
        index === 0 || index === sentences.length - 1 ? 1.5 : 1.0;

      // 문장 길이 점수 (너무 짧거나 긴 문장 페널티)
      const lengthScore =
        sentenceWords.length >= 5 && sentenceWords.length <= 30 ? 1.2 : 0.8;

      // 최종 점수
      const totalScore =
        frequencyScore * uniqueWords * positionScore * lengthScore;

      scores.push({
        sentence: sentence.trim(),
        score: totalScore,
        position: index,
      });
    });

    // 점수순 정렬 후 위치순으로 재정렬하여 자연스러운 흐름 유지
    const topSentences = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, sentenceCount)
      .sort((a, b) => a.position - b.position)
      .map((s) => s.sentence);

    return (
      topSentences.join(". ") +
      (topSentences[topSentences.length - 1].endsWith(".") ? "" : ".")
    );
  }

  async extractKeywords(
    text: string,
    options: { limit?: number; lang?: string } = {}
  ): Promise<string[]> {
    try {
      // AI 서비스 사용 시도
      const { limit = 10 } = options;
      return await aiService.extractKeywords(text, limit);
    } catch (error) {
      console.warn("AI 키워드 추출 실패, 오프라인 모드 사용:", error);
      // 폴백으로 기존 로직 사용
      return this.fallbackExtractKeywords(text, options.limit || 10);
    }
  }

  private fallbackExtractKeywords(text: string, limit: number): string[] {
    // 한국어와 영어를 모두 지원하는 키워드 추출
    const words = text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2);

    const frequency: { [key: string]: number } = {};
    const totalWords = words.length;

    // 단어 빈도 계산
    words.forEach((word) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // 한국어 불용어 (확장)
    const koreanStopWords = new Set([
      "이다",
      "있다",
      "되다",
      "하다",
      "그리고",
      "그러나",
      "또한",
      "그래서",
      "때문에",
      "위해서",
      "통해서",
      "대해서",
      "관련",
      "경우",
      "때문",
      "같은",
      "다른",
      "여러",
      "많은",
      "작은",
      "큰",
      "좋은",
      "나쁜",
      "이것",
      "그것",
      "저것",
      "여기",
      "거기",
      "저기",
      "지금",
      "나중",
      "먼저",
      "다시",
      "또",
      "더",
      "가장",
      "매우",
      "정말",
      "아주",
      "조금",
      "약간",
      "전체",
      "부분",
      "일부",
      "모든",
      "각각",
      "서로",
      "그냥",
      "바로",
      "이미",
      "아직",
      "벌써",
      "항상",
      "가끔",
      "자주",
      "잘",
      "못",
      "안",
      "없다",
      "아니다",
      "말다",
      "보다",
      "같다",
      "다르다",
    ]);

    // 영어 불용어
    const englishStopWords = new Set([
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "from",
      "as",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "can",
      "this",
      "that",
      "these",
      "those",
      "here",
      "there",
      "where",
      "when",
      "what",
      "who",
      "how",
      "why",
      "which",
      "all",
      "any",
      "some",
      "many",
      "much",
      "more",
      "most",
      "other",
      "another",
      "such",
    ]);

    // TF-IDF 유사 점수 계산
    const keywordScores = Object.entries(frequency)
      .filter(([word]) => {
        // 불용어 제거
        if (koreanStopWords.has(word) || englishStopWords.has(word)) {
          return false;
        }
        // 너무 짧거나 숫자만 있는 단어 제거
        if (word.length < 3 || /^\d+$/.test(word)) {
          return false;
        }
        return true;
      })
      .map(([word, freq]) => {
        // TF (Term Frequency)
        const tf = freq / totalWords;

        // 단어 길이 보너스 (4-8자 단어에 가중치)
        const lengthBonus = word.length >= 4 && word.length <= 8 ? 1.2 : 1.0;

        // 한글/영어 혼합 용어에 가중치 (전문용어 가능성)
        const mixedBonus =
          /[가-힣]/.test(word) && /[a-zA-Z]/.test(word) ? 1.5 : 1.0;

        // 대문자가 포함된 영어 단어 (고유명사, 약어 가능성)
        const upperBonus = /[A-Z]/.test(word) ? 1.3 : 1.0;

        const score = tf * lengthBonus * mixedBonus * upperBonus;

        return { word, score, frequency: freq };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return keywordScores.map((item) => item.word);
  }

  async analyzeDocument(document: TextDocument): Promise<{
    summary: string;
    keywords: string[];
    difficulty: number;
    readingTime: number;
  }> {
    const [summary, keywords] = await Promise.all([
      this.summarizeText(document.content),
      this.extractKeywords(document.content),
    ]);

    const difficulty = this.calculateDifficulty(document.content);
    const readingTime = this.estimateReadingTime(document.content);

    return {
      summary,
      keywords,
      difficulty,
      readingTime,
    };
  }

  private calculateDifficulty(text: string): number {
    // 한국어 텍스트 난이도 계산 (1-5 스케일)
    const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 5);
    const avgSentenceLength = text.length / sentences.length;
    const complexWords = text.match(/[가-힣]{4,}/g)?.length || 0;
    const totalWords = text.split(/\s+/).length;

    // 문장 길이 점수 (0-2)
    const lengthScore = Math.min(avgSentenceLength / 50, 2);

    // 복잡한 단어 비율 점수 (0-2)
    const complexityScore = Math.min((complexWords / totalWords) * 10, 2);

    // 전문 용어 점수 (0-1)
    const technicalTerms =
      text.match(/[A-Za-z]{3,}|[가-힣]*기술|[가-힣]*이론|[가-힣]*방법/g)
        ?.length || 0;
    const technicalScore = Math.min((technicalTerms / totalWords) * 20, 1);

    const totalScore = lengthScore + complexityScore + technicalScore;
    return Math.min(Math.ceil(totalScore), 5);
  }

  private estimateReadingTime(text: string): number {
    // 한국어 읽기 속도: 평균 분당 200-250자
    const readingSpeed = 225; // 분당 글자 수
    const minutes = text.length / readingSpeed;
    return Math.ceil(minutes);
  }

  async processDocumentWithAnalysis(file: File): Promise<{
    document: TextDocument;
    analysis: {
      summary: string;
      keywords: string[];
      difficulty: number;
      readingTime: number;
    };
  }> {
    try {
      console.log("문서 처리 및 분석 시작:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      // PDF 처리
      const document = await pdfProcessor.processFile(file);
      console.log("PDF 처리 완료:", {
        documentId: document.id,
        title: document.title,
        contentLength: document.content.length,
        fileType: document.fileType,
      });

      // 텍스트 분석
      console.log("텍스트 분석 시작...");
      const analysis = await this.analyzeDocument(document);
      console.log("텍스트 분석 완료:", {
        summaryLength: analysis.summary.length,
        keywordsCount: analysis.keywords.length,
        difficulty: analysis.difficulty,
        readingTime: analysis.readingTime,
      });

      // 문서에 분석 결과 추가
      document.summary = analysis.summary;
      document.keywords = analysis.keywords;

      console.log("문서 처리 및 분석 완료");
      return {
        document,
        analysis,
      };
    } catch (error) {
      console.error("문서 처리 및 분석 실패:", error);
      throw error;
    }
  }
}

export const textProcessor = new TextProcessor();
