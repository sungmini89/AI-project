import Sentiment from "sentiment";
import { freeAIService, type AIResponse } from "./freeAIService";

const sentiment = new Sentiment();

export type EmotionType =
  | "happy"
  | "sad"
  | "angry"
  | "neutral"
  | "excited"
  | "calm"
  | "anxious"
  | "proud"
  | "disappointed"
  | "grateful";

export interface EmotionAnalysisResult {
  primaryEmotion: EmotionType;
  score: number;
  confidence: number;
  words: {
    positive: string[];
    negative: string[];
  };
  emotionScores: Record<EmotionType, number>;
}

export const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: "#10b981",
  sad: "#6b7280",
  angry: "#ef4444",
  neutral: "#9ca3af",
  excited: "#f59e0b",
  calm: "#3b82f6",
  anxious: "#8b5cf6",
  proud: "#ec4899",
  disappointed: "#dc2626",
  grateful: "#059669",
};

export const EMOTION_EMOJIS: Record<EmotionType, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  neutral: "😐",
  excited: "🤩",
  calm: "😌",
  anxious: "😰",
  proud: "😎",
  disappointed: "😞",
  grateful: "🙏",
};

class EmotionAnalysisService {
  private koreanEmotionKeywords = {
    happy: [
      "행복",
      "기쁨",
      "즐거움",
      "신남",
      "좋아",
      "최고",
      "완벽",
      "대박",
      "환상적",
      "멋져",
      "사랑해",
      "고마워",
      "감사",
      "만족",
    ],
    sad: [
      "슬픔",
      "우울",
      "외로움",
      "눈물",
      "힘들어",
      "속상",
      "서러워",
      "실망",
      "아쉬워",
      "후회",
      "그리워",
      "안타까워",
    ],
    angry: [
      "화남",
      "짜증",
      "분노",
      "열받아",
      "빡쳐",
      "미쳐",
      "싫어",
      "끔찍",
      "답답",
      "억울",
      "더러워",
    ],
    excited: [
      "신나",
      "흥미",
      "재밌",
      "놀라워",
      "감동",
      "설레",
      "두근두근",
      "기대",
      "환상",
      "대단해",
      "짜릿",
      "스릴",
    ],
    calm: [
      "평온",
      "차분",
      "조용",
      "안정",
      "편안",
      "여유",
      "휴식",
      "고요",
      "평화",
      "포근",
      "따뜻",
    ],
    anxious: [
      "불안",
      "걱정",
      "초조",
      "긴장",
      "스트레스",
      "압박",
      "두려워",
      "무서워",
      "떨려",
      "조마조마",
    ],
    proud: [
      "자랑",
      "뿌듯",
      "성취",
      "보람",
      "대견",
      "기특",
      "자부심",
      "성공",
      "훌륭",
    ],
    disappointed: [
      "실망",
      "아쉬워",
      "후회",
      "안타까워",
      "부족",
      "만족스럽지",
      "별로",
      "그저그래",
    ],
    grateful: [
      "감사",
      "고마워",
      "고맙",
      "은혜",
      "도움",
      "배려",
      "친절",
      "따뜻함",
    ],
    neutral: ["그냥", "보통", "평범", "일상", "무난", "괜찮", "그럭저럭"],
  };

  async analyzeEmotion(text: string): Promise<EmotionAnalysisResult> {
    try {
      // 환경 변수 체크를 제거하고 항상 한국어 분석 활성화
      const enableKorean = true; // import.meta.env.VITE_ENABLE_KOREAN_ANALYSIS === 'true';

      if (enableKorean && this.hasKoreanText(text)) {
        // 한국어 텍스트에 대해 AI 서비스와 키워드 분석 결합
        const [aiResult, keywordResult] = await Promise.all([
          this.getAIAnalysis(text),
          this.analyzeKoreanKeywords(text),
        ]);

        // 결과 병합
        return this.mergeAnalysisResults(aiResult, keywordResult, text);
      } else {
        // 영어 텍스트는 기존 Sentiment.js 사용
        const result = sentiment.analyze(text);
        const primaryEmotion = this.determinePrimaryEmotion(result.score);
        const confidence = Math.min(Math.abs(result.score) / 5, 1);

        return {
          primaryEmotion,
          score: result.score,
          confidence,
          words: {
            positive: result.positive,
            negative: result.negative,
          },
          emotionScores: this.calculateEmotionScores(result.score),
        };
      }
    } catch (error) {
      console.error("감정 분석 실패:", error);
      return this.getDefaultResult();
    }
  }

  private hasKoreanText(text: string): boolean {
    return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);
  }

  private async getAIAnalysis(text: string): Promise<AIResponse | null> {
    try {
      return await freeAIService.analyzeText(text);
    } catch (error) {
      console.warn("AI 분석 실패, 키워드 분석으로 폴백:", error);
      return null;
    }
  }

  private analyzeKoreanKeywords(text: string): EmotionAnalysisResult {
    const emotionCounts: Record<EmotionType, number> =
      this.getDefaultEmotionScores();
    const foundWords: { positive: string[]; negative: string[] } = {
      positive: [],
      negative: [],
    };
    let totalScore = 0;

    // 각 감정 카테고리별로 키워드 검색
    Object.entries(this.koreanEmotionKeywords).forEach(
      ([emotion, keywords]) => {
        const emotionType = emotion as EmotionType;
        let count = 0;

        keywords.forEach((keyword) => {
          const regex = new RegExp(keyword, "gi");
          const matches = text.match(regex);
          if (matches) {
            count += matches.length;

            // 긍정/부정 분류
            if (
              ["happy", "excited", "calm", "proud", "grateful"].includes(
                emotionType
              )
            ) {
              foundWords.positive.push(...matches);
              totalScore += matches.length * 0.5;
            } else if (
              ["sad", "angry", "anxious", "disappointed"].includes(emotionType)
            ) {
              foundWords.negative.push(...matches);
              totalScore -= matches.length * 0.5;
            }
          }
        });

        emotionCounts[emotionType] = Math.min(count * 0.3, 1);
      }
    );

    // 주요 감정 결정
    const primaryEmotion = this.getPrimaryEmotionFromScores(emotionCounts);
    const confidence = Math.min(Math.max(...Object.values(emotionCounts)), 1);

    return {
      primaryEmotion,
      score: Math.max(-5, Math.min(5, totalScore)),
      confidence,
      words: foundWords,
      emotionScores: emotionCounts,
    };
  }

  private mergeAnalysisResults(
    aiResult: AIResponse | null,
    keywordResult: EmotionAnalysisResult,
    text: string
  ): EmotionAnalysisResult {
    if (!aiResult) {
      return keywordResult;
    }

    // AI 결과와 키워드 결과 가중 평균
    const aiWeight = 0.6;
    const keywordWeight = 0.4;

    const mergedScore =
      aiResult.sentiment * 5 * aiWeight + keywordResult.score * keywordWeight;
    const mergedConfidence =
      aiResult.confidence * aiWeight + keywordResult.confidence * keywordWeight;

    // 감정 점수 병합
    const mergedEmotionScores = { ...keywordResult.emotionScores };
    aiResult.emotions.forEach((emotion) => {
      if (emotion in mergedEmotionScores) {
        const currentScore = mergedEmotionScores[emotion as EmotionType];
        mergedEmotionScores[emotion as EmotionType] = Math.min(
          currentScore + aiResult.confidence * aiWeight,
          1
        );
      }
    });

    return {
      primaryEmotion: this.getPrimaryEmotionFromScores(mergedEmotionScores),
      score: mergedScore,
      confidence: mergedConfidence,
      words: keywordResult.words,
      emotionScores: mergedEmotionScores,
    };
  }

  private getPrimaryEmotionFromScores(
    scores: Record<EmotionType, number>
  ): EmotionType {
    let maxEmotion: EmotionType = "neutral";
    let maxScore = 0;

    Object.entries(scores).forEach(([emotion, score]) => {
      if (score > maxScore) {
        maxScore = score;
        maxEmotion = emotion as EmotionType;
      }
    });

    return maxEmotion;
  }

  private getDefaultResult(): EmotionAnalysisResult {
    return {
      primaryEmotion: "neutral",
      score: 0,
      confidence: 0,
      words: { positive: [], negative: [] },
      emotionScores: this.getDefaultEmotionScores(),
    };
  }

  private determinePrimaryEmotion(score: number): EmotionType {
    if (score > 2) return "happy";
    if (score > 0) return "excited";
    if (score > -2) return "neutral";
    if (score > -4) return "sad";
    return "angry";
  }

  private calculateEmotionScores(score: number): Record<EmotionType, number> {
    const scores = this.getDefaultEmotionScores();

    if (score > 0) {
      scores.happy = Math.min(score / 5, 1);
      scores.excited = Math.min(score / 3, 1);
    } else {
      scores.sad = Math.min(Math.abs(score) / 5, 1);
      scores.angry = Math.min(Math.abs(score) / 3, 1);
    }

    return scores;
  }

  private getDefaultEmotionScores(): Record<EmotionType, number> {
    return {
      happy: 0,
      sad: 0,
      angry: 0,
      neutral: 0,
      excited: 0,
      calm: 0,
      anxious: 0,
      proud: 0,
      disappointed: 0,
      grateful: 0,
    };
  }
}

export const emotionAnalysisService = new EmotionAnalysisService();
