import type { AIServiceConfig, AIServiceMode, TaskInsights, TaskCategory, TaskPriority } from "../types";
import { FREE_API_LIMITS, STORAGE_KEYS } from "@/constants";
import { sleep } from "@/utils";

class FreeAIService {
  private config: AIServiceConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AIServiceConfig {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaultConfig: AIServiceConfig = {
      mode: (import.meta.env.VITE_API_MODE as AIServiceMode) || "offline",
      fallbackToOffline: true,
      usageTracking: {
        daily: 0,
        monthly: 0,
        lastReset: new Date(),
      },
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultConfig, ...parsed.aiSettings };
      } catch {
        return defaultConfig;
      }
    }

    return defaultConfig;
  }

  private saveConfig(): void {
    const settings = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SETTINGS) || "{}"
    );
    settings.aiSettings = this.config;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  private resetUsageIfNeeded(): void {
    const now = new Date();
    const lastReset = new Date(this.config.usageTracking.lastReset);

    if (now.getDate() !== lastReset.getDate()) {
      this.config.usageTracking.daily = 0;
    }

    if (now.getMonth() !== lastReset.getMonth()) {
      this.config.usageTracking.monthly = 0;
    }

    this.config.usageTracking.lastReset = now;
    this.saveConfig();
  }

  private canUseAPI(service: "huggingface" | "gemini"): boolean {
    this.resetUsageIfNeeded();

    const limits = FREE_API_LIMITS[service];
    const usage = this.config.usageTracking;

    return usage.daily < limits.daily && usage.monthly < limits.monthly;
  }

  private trackUsage(): void {
    this.config.usageTracking.daily++;
    this.config.usageTracking.monthly++;
    this.saveConfig();
  }

  private async callHuggingFaceAPI(text: string): Promise<TaskInsights | null> {
    try {
      const token = import.meta.env.VITE_HUGGINGFACE_TOKEN;
      if (!token) {
        console.warn("Hugging Face 토큰이 설정되지 않았습니다.");
        return null;
      }

      if (!this.canUseAPI("huggingface")) {
        console.warn("Hugging Face API 일일 또는 월간 한도를 초과했습니다.");
        return null;
      }

      const response = await fetch(
        "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `할일 분석: ${text}. 카테고리와 우선순위를 한국어로 응답해주세요.`,
            parameters: {
              max_length: 100,
              temperature: 0.3,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this.trackUsage();

      await sleep(100);

      return {
        category: "기타",
        priority: "medium",
        confidence: 0.6,
      };
    } catch (error) {
      console.error("Hugging Face API 호출 실패:", error);
      return null;
    }
  }

  private async callGeminiAPI(text: string): Promise<TaskInsights | null> {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("Gemini API 키가 설정되지 않았습니다.");
        return null;
      }

      if (!this.canUseAPI("gemini")) {
        console.warn("Gemini API 일일 또는 월간 한도를 초과했습니다.");
        return null;
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
                    text: `다음 할일을 분석해서 카테고리와 우선순위를 결정해주세요: "${text}". 응답은 JSON 형태로 해주세요: {"category": "업무|개인|건강|쇼핑|약속|학습|운동|기타", "priority": "low|medium|high|urgent"}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 100,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this.trackUsage();
      const data = await response.json();

      try {
        const content = data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(content);

        return {
          category: parsed.category || "기타",
          priority: parsed.priority || "medium",
          confidence: 0.8,
        };
      } catch {
        return {
          category: "기타",
          priority: "medium",
          confidence: 0.5,
        };
      }
    } catch (error) {
      console.error("Gemini API 호출 실패:", error);
      return null;
    }
  }

  async analyzeTask(text: string): Promise<TaskInsights> {
    await sleep(200);

    switch (this.config.mode) {
      case "mock":
        return this.getMockAnalysis();

      case "free": {
        let result = await this.callGeminiAPI(text);
        if (!result && this.config.fallbackToOffline) {
          result = await this.callHuggingFaceAPI(text);
        }
        return result || this.getOfflineAnalysis(text);
      }

      case "custom":
        return this.getOfflineAnalysis(text);

      case "offline":
      default:
        return this.getOfflineAnalysis(text);
    }
  }

  private getMockAnalysis(): TaskInsights {
    const mockResults = [
      { category: "업무" as const, priority: "high" as const },
      { category: "개인" as const, priority: "medium" as const },
      { category: "건강" as const, priority: "high" as const },
      { category: "쇼핑" as const, priority: "low" as const },
    ];

    const random = mockResults[Math.floor(Math.random() * mockResults.length)];

    return {
      ...random,
      confidence: 0.9,
    };
  }

  private getOfflineAnalysis(text: string): TaskInsights {
    const lowerText = text.toLowerCase();

    const categoryKeywords = {
      업무: ["회의", "미팅", "업무", "일", "프로젝트", "보고서", "이메일"],
      건강: ["병원", "의원", "치과", "검진", "진료", "운동", "헬스"],
      쇼핑: ["쇼핑", "구매", "마트", "주문", "배송"],
      약속: ["약속", "만남", "모임", "식사", "커피"],
      학습: ["공부", "학습", "강의", "수업", "책", "독서"],
      운동: ["운동", "헬스", "요가", "수영", "조깅", "달리기"],
    };

    let category: TaskCategory = "기타";
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        category = cat as TaskCategory;
        break;
      }
    }

    const priorityKeywords = {
      urgent: ["긴급", "급함", "당장", "즉시", "asap"],
      high: ["중요", "우선", "먼저", "빠르게"],
      low: ["나중에", "여유", "틈날때"],
    };

    let priority: TaskPriority = "medium";
    for (const [prio, keywords] of Object.entries(priorityKeywords)) {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        priority = prio as TaskPriority;
        break;
      }
    }

    return {
      category,
      priority,
      confidence: 0.7,
    };
  }

  getUsageStatus() {
    this.resetUsageIfNeeded();
    return {
      mode: this.config.mode,
      usage: this.config.usageTracking,
      limits: FREE_API_LIMITS,
    };
  }

  updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }
}

export const aiService = new FreeAIService();
