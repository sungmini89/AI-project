// AI 서비스 레이어 - 무료 API 티어 관리

import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';
import type { 
  AIServiceConfig, 
  AIAnalysisResult, 
  SupportedLanguage, 
  APIError,
  ServiceStatus
} from '../types';

export class FreeAIService {
  private config: AIServiceConfig;
  private genAI: GoogleGenerativeAI | null = null;
  private quotaManager: QuotaManager;

  constructor(serviceConfig: AIServiceConfig) {
    this.config = serviceConfig;
    this.quotaManager = new QuotaManager();
    
    if (this.config.mode !== 'offline' && this.config.apiKey) {
      this.initializeProviders();
    }
  }

  private initializeProviders(): void {
    try {
      if (this.config.provider === 'gemini' && this.config.apiKey) {
        this.genAI = new GoogleGenerativeAI(this.config.apiKey);
      }
    } catch (error) {
      console.error('AI 서비스 초기화 실패:', error);
    }
  }

  async analyzeCode(
    code: string, 
    language: SupportedLanguage
  ): Promise<AIAnalysisResult> {
    // 오프라인 모드인 경우 오프라인 분석 반환
    if (this.config.mode === 'offline') {
      return this.getOfflineAnalysis(code, language);
    }

    // API 사용량 확인
    const canUseAPI = await this.quotaManager.checkQuota(this.config.provider || 'gemini');
    
    if (!canUseAPI) {
      if (this.config.fallbackToOffline) {
        console.warn('API 할당량 초과, 오프라인 모드로 전환');
        return this.getOfflineAnalysis(code, language);
      } else {
        throw new Error('API 할당량이 초과되었습니다. 내일 다시 시도해주세요.');
      }
    }

    try {
      let result: AIAnalysisResult;

      switch (this.config.provider) {
        case 'gemini':
          result = await this.analyzeWithGemini(code, language);
          break;
        case 'cohere':
          result = await this.analyzeWithCohere(code, language);
          break;
        default:
          result = await this.analyzeWithGemini(code, language);
      }

      // 사용량 기록
      await this.quotaManager.recordUsage(this.config.provider || 'gemini');
      
      return result;

    } catch (error) {
      console.error('AI 분석 중 오류 발생:', error);
      
      if (this.config.fallbackToOffline) {
        console.warn('AI API 오류, 오프라인 모드로 전환');
        return this.getOfflineAnalysis(code, language);
      } else {
        throw this.createAPIError(error as Error);
      }
    }
  }

  private async analyzeWithGemini(
    code: string, 
    language: SupportedLanguage
  ): Promise<AIAnalysisResult> {
    if (!this.genAI) {
      throw new Error('Gemini API가 초기화되지 않았습니다.');
    }

    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = this.createAnalysisPrompt(code, language);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return this.parseGeminiResponse(text);
  }

  private async analyzeWithCohere(
    code: string, 
    language: SupportedLanguage
  ): Promise<AIAnalysisResult> {
    const prompt = this.createAnalysisPrompt(code, language);
    
    const response = await fetch(`${config.api.cohere.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command',
        prompt: prompt,
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere API 오류: ${response.status}`);
    }

    const data = await response.json();
    return this.parseCohereResponse(data.generations[0].text);
  }

  private createAnalysisPrompt(code: string, language: SupportedLanguage): string {
    return `다음 ${language} 코드를 분석하고 JSON 형식으로 결과를 반환해주세요:

코드:
\`\`\`${language}
${code}
\`\`\`

다음 형식으로 분석해주세요:
{
  "summary": "코드 전반적인 요약",
  "issues": [
    {
      "type": "bug|performance|maintainability|style|security",
      "severity": "low|medium|high|critical", 
      "line": 줄번호,
      "message": "문제 설명",
      "explanation": "상세 설명",
      "fix": "수정 방법"
    }
  ],
  "suggestions": [
    {
      "type": "refactor|optimize|simplify|modernize",
      "priority": "low|medium|high",
      "description": "제안 설명",
      "example": "예시 코드"
    }
  ],
  "score": 0-100점,
  "confidence": 0-1
}

한국어로 답변해주세요.`;
  }

  private parseGeminiResponse(text: string): AIAnalysisResult {
    try {
      // JSON 응답 파싱
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          provider: 'gemini',
          model: 'gemini-pro',
          summary: parsed.summary || '분석 완료',
          issues: parsed.issues || [],
          suggestions: parsed.suggestions || [],
          score: parsed.score || 80,
          confidence: parsed.confidence || 0.8,
        };
      }
    } catch (error) {
      console.error('Gemini 응답 파싱 오류:', error);
    }

    // 파싱 실패 시 기본값 반환
    return this.createFallbackResult('gemini', text);
  }

  private parseCohereResponse(text: string): AIAnalysisResult {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          provider: 'cohere',
          model: 'command',
          summary: parsed.summary || '분석 완료',
          issues: parsed.issues || [],
          suggestions: parsed.suggestions || [],
          score: parsed.score || 80,
          confidence: parsed.confidence || 0.8,
        };
      }
    } catch (error) {
      console.error('Cohere 응답 파싱 오류:', error);
    }

    return this.createFallbackResult('cohere', text);
  }

  private createFallbackResult(provider: string, text: string): AIAnalysisResult {
    return {
      provider,
      model: provider === 'gemini' ? 'gemini-pro' : 'command',
      summary: text.substring(0, 200) + '...',
      issues: [],
      suggestions: [],
      score: 75,
      confidence: 0.6,
    };
  }

  private getOfflineAnalysis(
    code: string, 
    _language: SupportedLanguage
  ): AIAnalysisResult {
    // 오프라인 모드에서는 기본 분석만 제공
    const lines = code.split('\n').length;
    const hasConsoleLog = /console\.(log|warn|error)/.test(code);
    const hasVarDeclaration = /\bvar\s+/.test(code);
    
    const issues = [];
    const suggestions = [];

    if (hasConsoleLog) {
      issues.push({
        type: 'style' as const,
        severity: 'low' as const,
        message: 'console.log 사용이 감지되었습니다.',
        explanation: '프로덕션 코드에서는 console.log를 제거하는 것이 좋습니다.',
        fix: 'console.log 구문을 제거하거나 적절한 로깅 라이브러리를 사용하세요.',
      });
    }

    if (hasVarDeclaration) {
      issues.push({
        type: 'style' as const,
        severity: 'medium' as const,
        message: 'var 키워드 사용이 감지되었습니다.',
        explanation: 'ES6+에서는 let 또는 const 사용을 권장합니다.',
        fix: 'var를 const 또는 let으로 변경하세요.',
      });
    }

    if (lines > 50) {
      suggestions.push({
        type: 'refactor' as const,
        priority: 'medium' as const,
        description: '함수가 길어 보입니다. 더 작은 함수로 분할을 고려해보세요.',
        example: '// 큰 함수를 여러 개의 작은 함수로 분할',
      });
    }

    return {
      provider: 'offline',
      model: 'static-analysis',
      summary: `오프라인 분석 완료. ${issues.length}개의 이슈와 ${suggestions.length}개의 제안이 발견되었습니다.`,
      issues,
      suggestions,
      score: Math.max(100 - (issues.length * 10) - (suggestions.length * 5), 60),
      confidence: 0.7,
    };
  }

  private createAPIError(error: Error): APIError {
    return {
      code: 'API_ERROR',
      message: error.message,
      provider: this.config.provider,
      details: error,
    };
  }

  async getServiceStatus(): Promise<ServiceStatus> {
    if (this.config.mode === 'offline') {
      return {
        online: true,
        provider: 'offline',
        lastCheck: Date.now(),
      };
    }

    try {
      const quotaRemaining = await this.quotaManager.getRemainingQuota(
        this.config.provider || 'gemini'
      );

      return {
        online: true,
        provider: this.config.provider,
        lastCheck: Date.now(),
        quotaRemaining,
      };
    } catch (error) {
      return {
        online: false,
        provider: this.config.provider,
        lastCheck: Date.now(),
        error: (error as Error).message,
      };
    }
  }

  updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.apiKey && this.config.mode !== 'offline') {
      this.initializeProviders();
    }
  }
}

// 할당량 관리 클래스
class QuotaManager {
  private readonly STORAGE_KEY = 'ai_service_quota';

  async checkQuota(provider: string): Promise<boolean> {
    const usage = this.getUsageData();
    const today = new Date().toDateString();
    const currentMonth = new Date().toISOString().slice(0, 7);

    switch (provider) {
      case 'gemini':
        const geminiToday = usage.gemini?.daily?.[today] || 0;
        return geminiToday < config.api.gemini.dailyLimit;
        
      case 'cohere':
        const cohereMonth = usage.cohere?.monthly?.[currentMonth] || 0;
        return cohereMonth < config.api.cohere.monthlyLimit;
        
      default:
        return true;
    }
  }

  async recordUsage(provider: string): Promise<void> {
    const usage = this.getUsageData();
    const today = new Date().toDateString();
    const currentMonth = new Date().toISOString().slice(0, 7);

    if (provider === 'gemini') {
      if (!usage.gemini) usage.gemini = { daily: {}, monthly: {} };
      usage.gemini.daily[today] = (usage.gemini.daily[today] || 0) + 1;
      usage.gemini.monthly[currentMonth] = (usage.gemini.monthly[currentMonth] || 0) + 1;
    } else if (provider === 'cohere') {
      if (!usage.cohere) usage.cohere = { daily: {}, monthly: {} };
      usage.cohere.monthly[currentMonth] = (usage.cohere.monthly[currentMonth] || 0) + 1;
    }

    this.saveUsageData(usage);
  }

  async getRemainingQuota(provider: string): Promise<number> {
    const usage = this.getUsageData();
    const today = new Date().toDateString();
    const currentMonth = new Date().toISOString().slice(0, 7);

    switch (provider) {
      case 'gemini':
        const geminiUsed = usage.gemini?.daily?.[today] || 0;
        return Math.max(0, config.api.gemini.dailyLimit - geminiUsed);
        
      case 'cohere':
        const cohereUsed = usage.cohere?.monthly?.[currentMonth] || 0;
        return Math.max(0, config.api.cohere.monthlyLimit - cohereUsed);
        
      default:
        return 0;
    }
  }

  private getUsageData(): any {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveUsageData(data: any): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('사용량 데이터 저장 실패:', error);
    }
  }
}

export default FreeAIService;