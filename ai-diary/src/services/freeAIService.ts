interface AIServiceConfig {
  mode: "mock" | "free" | "offline" | "custom";
  apiKey?: string;
  fallbackToOffline: boolean;
}

interface UsageStats {
  daily: number;
  monthly: number;
  lastReset: string;
  currentMode: string;
}

interface AIResponse {
  emotions: string[];
  sentiment: number;
  confidence: number;
  keywords: string[];
}

class FreeAIService {
  private config: AIServiceConfig;
  private usageStats: UsageStats;
  private dailyLimit = 100; // Number(import.meta.env.VITE_DAILY_API_LIMIT) || 100;
  private monthlyLimit = 1000; // Number(import.meta.env.VITE_MONTHLY_API_LIMIT) || 1000;

  constructor() {
    this.config = {
      mode: "offline", // (import.meta.env.VITE_API_MODE as any) || 'offline',
      fallbackToOffline: true,
    };

    this.usageStats = this.loadUsageStats();
    this.checkAndResetUsage();
  }

  private loadUsageStats(): UsageStats {
    const stored = localStorage.getItem("ai_diary_usage_stats");
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      daily: 0,
      monthly: 0,
      lastReset: new Date().toDateString(),
      currentMode: this.config.mode,
    };
  }

  private saveUsageStats(): void {
    localStorage.setItem(
      "ai_diary_usage_stats",
      JSON.stringify(this.usageStats)
    );
  }

  private checkAndResetUsage(): void {
    const today = new Date().toDateString();
    const lastReset = new Date(this.usageStats.lastReset);
    const now = new Date();

    // 일일 리셋
    if (today !== this.usageStats.lastReset) {
      this.usageStats.daily = 0;
      this.usageStats.lastReset = today;
    }

    // 월간 리셋
    if (
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    ) {
      this.usageStats.monthly = 0;
    }

    this.saveUsageStats();
  }

  private canMakeAPICall(): boolean {
    return (
      this.usageStats.daily < this.dailyLimit &&
      this.usageStats.monthly < this.monthlyLimit
    );
  }

  private incrementUsage(): void {
    this.usageStats.daily++;
    this.usageStats.monthly++;
    this.saveUsageStats();
  }

  async analyzeText(text: string): Promise<AIResponse> {
    try {
      switch (this.config.mode) {
        case "mock":
          return this.mockAnalysis(text);
        case "free":
          if (this.canMakeAPICall()) {
            const result = await this.freeAPIAnalysis(text);
            this.incrementUsage();
            return result;
          } else {
            console.warn("API 한도 초과, 오프라인 모드로 전환");
            return this.offlineAnalysis(text);
          }
        case "custom":
          if (this.config.apiKey && this.canMakeAPICall()) {
            const result = await this.customAPIAnalysis(text);
            this.incrementUsage();
            return result;
          } else {
            return this.offlineAnalysis(text);
          }
        case "offline":
        default:
          return this.offlineAnalysis(text);
      }
    } catch (error) {
      console.error("AI 분석 실패:", error);
      if (this.config.fallbackToOffline) {
        console.warn("오프라인 모드로 폴백");
        return this.offlineAnalysis(text);
      }
      throw error;
    }
  }

  private mockAnalysis(text: string): AIResponse {
    const emotions = ["happy", "calm", "excited"];
    const keywords = text.split(" ").slice(0, 3);
    return {
      emotions,
      sentiment: 0.5,
      confidence: 0.8,
      keywords,
    };
  }

  private async freeAPIAnalysis(text: string): Promise<AIResponse> {
    // HuggingFace 무료 API 사용 예시
    const token = import.meta.env.VITE_HUGGINGFACE_TOKEN;
    if (!token) {
      throw new Error("HuggingFace API 토큰이 없습니다");
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      throw new Error(`HuggingFace API 오류: ${response.statusText}`);
    }

    const result = await response.json();
    return this.parseHuggingFaceResult(result, text);
  }

  private async customAPIAnalysis(text: string): Promise<AIResponse> {
    // Gemini API 사용 예시
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API 키가 없습니다");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `다음 텍스트의 감정을 분석해주세요. JSON 형식으로 emotions(감정 배열), sentiment(점수, -1~1), confidence(신뢰도, 0~1), keywords(핵심 단어들)를 반환해주세요: "${text}"`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API 오류: ${response.statusText}`);
    }

    const result = await response.json();
    return this.parseGeminiResult(result, text);
  }

  private offlineAnalysis(text: string): AIResponse {
    // 기본 오프라인 분석 로직
    const positiveWords = [
      "좋",
      "행복",
      "기쁨",
      "즐거",
      "사랑",
      "완벽",
      "최고",
      "대박",
      "환상",
      "멋져",
    ];
    const negativeWords = [
      "나쁘",
      "슬프",
      "화나",
      "짜증",
      "실망",
      "우울",
      "힘들",
      "피곤",
      "스트레스",
      "지겨",
    ];
    const calmWords = ["평온", "차분", "조용", "안정", "편안", "여유", "휴식"];
    const excitedWords = ["신나", "흥미", "재밌", "놀라", "감동", "설레"];

    const words = text.toLowerCase();
    let sentiment = 0;
    const emotions: string[] = [];
    const keywords: string[] = [];

    // 감정 단어 카운팅
    positiveWords.forEach((word) => {
      if (words.includes(word)) {
        sentiment += 0.2;
        if (!emotions.includes("happy")) emotions.push("happy");
        keywords.push(word);
      }
    });

    negativeWords.forEach((word) => {
      if (words.includes(word)) {
        sentiment -= 0.2;
        if (!emotions.includes("sad")) emotions.push("sad");
        keywords.push(word);
      }
    });

    calmWords.forEach((word) => {
      if (words.includes(word)) {
        if (!emotions.includes("calm")) emotions.push("calm");
        keywords.push(word);
      }
    });

    excitedWords.forEach((word) => {
      if (words.includes(word)) {
        if (!emotions.includes("excited")) emotions.push("excited");
        keywords.push(word);
      }
    });

    if (emotions.length === 0) {
      emotions.push("neutral");
    }

    return {
      emotions,
      sentiment: Math.max(-1, Math.min(1, sentiment)),
      confidence: 0.7,
      keywords: keywords.slice(0, 5),
    };
  }

  private parseHuggingFaceResult(result: any, text: string): AIResponse {
    const emotions: string[] = [];
    let sentiment = 0;

    if (result && result[0]) {
      const scores = result[0];
      const positive =
        scores.find((s: any) => s.label === "LABEL_2")?.score || 0;
      const negative =
        scores.find((s: any) => s.label === "LABEL_0")?.score || 0;
      sentiment = positive - negative;

      if (positive > 0.6) emotions.push("happy");
      if (negative > 0.6) emotions.push("sad");
      if (Math.abs(sentiment) < 0.3) emotions.push("neutral");
    }

    return {
      emotions: emotions.length > 0 ? emotions : ["neutral"],
      sentiment,
      confidence: 0.8,
      keywords: text.split(" ").slice(0, 3),
    };
  }

  private parseGeminiResult(result: any, text: string): AIResponse {
    try {
      const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        const jsonMatch = content.match(/\{.*\}/s);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            emotions: parsed.emotions || ["neutral"],
            sentiment: parsed.sentiment || 0,
            confidence: parsed.confidence || 0.7,
            keywords: parsed.keywords || [],
          };
        }
      }
    } catch (error) {
      console.error("Gemini 결과 파싱 실패:", error);
    }

    // 파싱 실패 시 기본값
    return this.offlineAnalysis(text);
  }

  getUsageStats(): UsageStats {
    return { ...this.usageStats };
  }

  getCurrentMode(): string {
    if (!this.canMakeAPICall() && this.config.mode !== "offline") {
      return "offline (한도 초과)";
    }
    return this.config.mode;
  }

  setMode(mode: AIServiceConfig["mode"], apiKey?: string): void {
    this.config.mode = mode;
    if (apiKey) {
      this.config.apiKey = apiKey;
    }
    this.usageStats.currentMode = mode;
    this.saveUsageStats();
  }
}

export const freeAIService = new FreeAIService();
export type { AIServiceConfig, UsageStats, AIResponse };
