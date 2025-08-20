import Sentiment from "sentiment";

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
  async analyzeEmotion(text: string): Promise<EmotionAnalysisResult> {
    try {
      const result = sentiment.analyze(text);

      // 점수에 따른 기본 감정 결정
      const primaryEmotion = this.determinePrimaryEmotion(result.score);
      const confidence = Math.min(Math.abs(result.score) / 5, 1); // 0-1 범위로 정규화

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
    } catch (error) {
      console.error("감정 분석 실패:", error);
      // 기본값 반환
      return {
        primaryEmotion: "neutral",
        score: 0,
        confidence: 0,
        words: { positive: [], negative: [] },
        emotionScores: this.getDefaultEmotionScores(),
      };
    }
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
