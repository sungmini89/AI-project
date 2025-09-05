/**
 * 무료 AI 서비스 통합 레이어
 * 여러 무료 AI API를 통합하여 OCR 결과를 개선하고 영수증 분석을 수행
 */

// ===== 인터페이스 정의 =====

export interface AIServiceConfig {
  mode: 'mock' | 'free' | 'offline' | 'custom';
  apiKey?: string;
  fallbackToOffline: boolean;
}

export interface AIEnhancedResult {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    confidence: number;
  }>;
  totalAmount: number;
  confidence: number;
  corrections: string[];
  suggestions: string[];
  usedService: 'mock' | 'gemini' | 'huggingface' | 'offline';
}

export interface UsageInfo {
  service: string;
  dailyUsed: number;
  dailyLimit: number;
  remaining: number;
  resetTime: string;
}

// ===== 무료 AI 서비스 클래스 =====

class FreeAIService {
  private config: AIServiceConfig;
  private currentMode: AIServiceConfig['mode'];
  private usageData: Map<string, any> = new Map();

  constructor() {
    // 환경변수에서 기본 설정 로드
    this.config = {
      mode: (import.meta.env.VITE_API_MODE as AIServiceConfig['mode']) || 'offline',
      apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      fallbackToOffline: true
    };
    
    this.currentMode = this.config.mode;
    this.loadUsageData();
    console.log(`🤖 FreeAI Service 초기화 완료 - 모드: ${this.currentMode}`);
  }

  // ===== 설정 메서드 =====

  /**
   * 서비스 설정 업데이트
   */
  updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.currentMode = this.config.mode;
    console.log(`🔄 설정 업데이트: ${JSON.stringify(newConfig)}`);
  }

  /**
   * 현재 설정 조회
   */
  getConfig(): AIServiceConfig {
    return { ...this.config };
  }

  // ===== 핵심 AI 기능 =====

  /**
   * OCR 결과 개선
   * 여러 무료 AI 서비스를 시도하여 최적의 결과 제공
   */
  async enhanceOCRResult(
    ocrText: string, 
    items: Array<{
      id: string
      name: string
      price: number
      quantity: number
      confidence: number
    }> = []
  ): Promise<AIEnhancedResult> {
    console.log(`🔍 OCR 결과 개선 시작 - 모드: ${this.currentMode}`);

    try {
      switch (this.currentMode) {
        case 'mock':
          return this.getMockEnhancement(ocrText, items);
          
        case 'free':
          return await this.tryFreeAPIs(ocrText, items);
          
        case 'custom':
          if (this.config.apiKey) {
            return await this.useCustomAPI(ocrText, items);
          }
          // fallthrough to offline
          
        case 'offline':
        default:
          return this.getOfflineEnhancement(ocrText, items);
      }
    } catch (error) {
      console.error('❌ AI 개선 실패:', error);
      
      if (this.config.fallbackToOffline) {
        console.log('🔄 오프라인 모드로 폴백');
        return this.getOfflineEnhancement(ocrText, items);
      }
      
      throw error;
    }
  }

  // ===== 개별 서비스 구현 =====

  /**
   * Mock 모드 - 개발용
   */
  private getMockEnhancement(ocrText: string, items: Array<{id: string; name: string; price: number; quantity: number; confidence: number}>): AIEnhancedResult {
    console.log('🎭 Mock 모드로 결과 생성');
    
    // 간단한 정규식으로 금액 추출
    const priceMatches = ocrText.match(/[\d,]+원?/g) || [];
    const mockItems = priceMatches.slice(0, 5).map((priceStr, index) => {
      const price = parseInt(priceStr.replace(/[^\d]/g, ''));
      return {
        id: `mock-${Date.now()}-${index}`,
        name: `Mock 항목 ${index + 1}`,
        price: price,
        quantity: 1,
        confidence: 0.9
      };
    });

    const totalAmount = mockItems.reduce((sum, item) => sum + item.price, 0);

    return {
      items: mockItems,
      totalAmount,
      confidence: 0.9,
      corrections: ['Mock 모드에서 생성된 데이터입니다'],
      suggestions: ['실제 환경에서는 AI API를 사용해보세요'],
      usedService: 'mock'
    };
  }

  /**
   * 무료 API들을 순차적으로 시도
   */
  private async tryFreeAPIs(ocrText: string, items: Array<{id: string; name: string; price: number; quantity: number; confidence: number}>): Promise<AIEnhancedResult> {
    const services = ['gemini', 'huggingface'];
    
    for (const service of services) {
      try {
        if (this.checkServiceAvailability(service)) {
          console.log(`🔄 ${service} API 시도 중...`);
          
          switch (service) {
            case 'gemini':
              return await this.useGeminiAPI(ocrText, items);
            case 'huggingface':
              return await this.useHuggingFaceAPI(ocrText, items);
          }
        }
      } catch (error) {
        console.warn(`⚠️ ${service} API 실패:`, error);
        this.updateUsageData(service, 'error');
      }
    }

    // 모든 API 실패 시 오프라인 모드로 폴백
    console.log('🔄 모든 무료 API 실패, 오프라인 모드 사용');
    return this.getOfflineEnhancement(ocrText, items);
  }

  /**
   * Gemini API 사용
   */
  private async useGeminiAPI(ocrText: string, items: Array<{id: string; name: string; price: number; quantity: number; confidence: number}>): Promise<AIEnhancedResult> {
    const { geminiService } = await import('./geminiService');
    
    if (!geminiService.getUsageInfo().isAvailable) {
      throw new Error('Gemini API 사용 불가');
    }

    const result = await geminiService.enhanceOCRResult(ocrText, items);
    this.updateUsageData('gemini', 'success');

    return {
      ...result,
      usedService: 'gemini'
    };
  }

  /**
   * Hugging Face API 사용 (예시)
   */
  private async useHuggingFaceAPI(ocrText: string, items: Array<{id: string; name: string; price: number; quantity: number; confidence: number}>): Promise<AIEnhancedResult> {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_TOKEN;
    
    if (!apiKey || apiKey === 'optional') {
      throw new Error('Hugging Face 토큰이 설정되지 않음');
    }

    // Hugging Face API 호출 (실제 구현은 더 복잡할 수 있음)
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `영수증에서 다음 텍스트를 분석하여 항목과 가격을 추출해주세요:\n${ocrText}`
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API 오류: ${response.status}`);
    }

    this.updateUsageData('huggingface', 'success');
    
    // 간단한 파싱 (실제로는 더 정교한 처리 필요)
    return this.getOfflineEnhancement(ocrText, items);
  }

  /**
   * 사용자 제공 API 키 사용
   */
  private async useCustomAPI(ocrText: string, items: Array<{id: string; name: string; price: number; quantity: number; confidence: number}>): Promise<AIEnhancedResult> {
    // 사용자가 제공한 API 키로 Gemini 사용
    const { geminiService } = await import('./geminiService');
    
    if (this.config.apiKey && this.config.apiKey !== 'optional') {
      geminiService.initialize({ apiKey: this.config.apiKey });
      const result = await geminiService.enhanceOCRResult(ocrText, items);
      
      return {
        ...result,
        usedService: 'gemini'
      };
    }

    throw new Error('사용자 API 키가 설정되지 않음');
  }

  /**
   * 오프라인 모드 - 규칙 기반 처리
   */
  private getOfflineEnhancement(ocrText: string, items: Array<{id: string; name: string; price: number; quantity: number; confidence: number}>): AIEnhancedResult {
    console.log('🔧 오프라인 모드로 처리');
    
    const extractedItems = this.extractPricesOffline(ocrText);
    const totalAmount = extractedItems.reduce((sum, item) => sum + item.price, 0);

    return {
      items: extractedItems,
      totalAmount,
      confidence: 0.7,
      corrections: ['오프라인 모드에서 처리됨'],
      suggestions: ['더 정확한 결과를 위해 AI API 사용을 권장합니다'],
      usedService: 'offline'
    };
  }

  // ===== 유틸리티 메서드 =====

  /**
   * 오프라인 금액 추출 (정규식 기반)
   */
  private extractPricesOffline(ocrText: string): Array<{id: string; name: string; price: number; quantity: number; confidence: number}> {
    const lines = ocrText.split('\n').filter(line => line.trim());
    const items: Array<{id: string; name: string; price: number; quantity: number; confidence: number}> = [];
    
    // 한국어 영수증 패턴
    const patterns = {
      // "항목명 12,000" 또는 "항목명 12000원"
      namePrice: /^(.+?)\s+([\d,]+)원?$/,
      // "12,000원 항목명" (역순)
      priceFirst: /^([\d,]+)원?\s+(.+)$/,
      // 단순 금액만
      priceOnly: /([\d,]+)원?/g
    };

    let itemIndex = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.length < 2) continue;
      
      // 패턴 1: 항목명 + 가격
      const namePrice = trimmedLine.match(patterns.namePrice);
      if (namePrice) {
        const [, name, priceStr] = namePrice;
        const price = parseInt(priceStr.replace(/[^\d]/g, ''));
        
        if (price > 0 && name.length > 0) {
          items.push({
            id: `offline-${Date.now()}-${itemIndex++}`,
            name: name.trim(),
            price,
            quantity: 1,
            confidence: 0.8
          });
          continue;
        }
      }
      
      // 패턴 2: 가격 + 항목명 (역순)
      const priceFirst = trimmedLine.match(patterns.priceFirst);
      if (priceFirst) {
        const [, priceStr, name] = priceFirst;
        const price = parseInt(priceStr.replace(/[^\d]/g, ''));
        
        if (price > 0 && name.length > 0) {
          items.push({
            id: `offline-${Date.now()}-${itemIndex++}`,
            name: name.trim(),
            price,
            quantity: 1,
            confidence: 0.7
          });
          continue;
        }
      }
    }

    // 항목이 없으면 단순 금액 추출
    if (items.length === 0) {
      const priceMatches = ocrText.match(patterns.priceOnly) || [];
      
      priceMatches.forEach((priceStr, index) => {
        const price = parseInt(priceStr.replace(/[^\d]/g, ''));
        if (price > 0) {
          items.push({
            id: `offline-${Date.now()}-${index}`,
            name: `항목 ${index + 1}`,
            price,
            quantity: 1,
            confidence: 0.6
          });
        }
      });
    }

    return items.slice(0, 10); // 최대 10개 항목
  }

  /**
   * 서비스 사용 가능 여부 확인
   */
  private checkServiceAvailability(service: string): boolean {
    const usage = this.usageData.get(service) || { used: 0, limit: 1000, lastReset: Date.now() };
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // 일일 리셋 확인
    if (now - usage.lastReset > oneDay) {
      usage.used = 0;
      usage.lastReset = now;
      this.usageData.set(service, usage);
    }
    
    return usage.used < usage.limit;
  }

  /**
   * 사용량 데이터 업데이트
   */
  private updateUsageData(service: string, result: 'success' | 'error'): void {
    const usage = this.usageData.get(service) || { used: 0, limit: 1000, lastReset: Date.now() };
    
    if (result === 'success') {
      usage.used++;
    }
    
    this.usageData.set(service, usage);
    this.saveUsageData();
  }

  /**
   * 사용량 데이터 로드
   */
  private loadUsageData(): void {
    try {
      const saved = localStorage.getItem('freeAI-usage');
      if (saved) {
        const data = JSON.parse(saved);
        this.usageData = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('사용량 데이터 로드 실패:', error);
    }
  }

  /**
   * 사용량 데이터 저장
   */
  private saveUsageData(): void {
    try {
      const data = Object.fromEntries(this.usageData);
      localStorage.setItem('freeAI-usage', JSON.stringify(data));
    } catch (error) {
      console.warn('사용량 데이터 저장 실패:', error);
    }
  }

  // ===== 공개 API =====

  /**
   * 현재 사용량 정보 조회
   */
  getUsageInfo(): UsageInfo[] {
    const services = ['gemini', 'huggingface'];
    
    return services.map(service => {
      const usage = this.usageData.get(service) || { used: 0, limit: 1000, lastReset: Date.now() };
      const resetTime = new Date(usage.lastReset + 24 * 60 * 60 * 1000).toLocaleString('ko-KR');
      
      return {
        service,
        dailyUsed: usage.used,
        dailyLimit: usage.limit,
        remaining: Math.max(0, usage.limit - usage.used),
        resetTime
      };
    });
  }

  /**
   * 현재 모드 조회
   */
  getCurrentMode(): AIServiceConfig['mode'] {
    return this.currentMode;
  }

  /**
   * 사용량 초기화 (테스트용)
   */
  resetUsage(): void {
    this.usageData.clear();
    localStorage.removeItem('freeAI-usage');
    console.log('🔄 사용량 데이터 초기화 완료');
  }
}

// ===== 싱글톤 인스턴스 =====

export const freeAIService = new FreeAIService();
export default freeAIService;