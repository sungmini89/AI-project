import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiEnhancedResult {
  items: any[];
  totalAmount: number;
  confidence: number;
  corrections: string[];
  suggestions: string[];
}

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private requestCount = 0;
  private dailyLimit = 60; // Gemini API 무료 티어 일일 제한
  private lastRequestTime = 0;
  private minInterval = 1000; // 최소 1초 간격

  constructor() {
    this.loadRequestCount();
  }

  /**
   * Gemini AI 초기화
   */
  initialize(config: GeminiConfig): void {
    if (!config.apiKey || config.apiKey === 'optional') {
      console.warn('Gemini API 키가 설정되지 않았습니다. OCR 결과 개선 기능을 사용할 수 없습니다.');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(config.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: config.model || 'gemini-pro',
        generationConfig: {
          temperature: config.temperature || 0.1,
          maxOutputTokens: config.maxOutputTokens || 1000,
        }
      });
    } catch (error) {
      console.error('Gemini 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * OCR 결과 개선
   */
  async enhanceOCRResult(
    ocrText: string,
    items: any[]
  ): Promise<GeminiEnhancedResult> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API를 사용할 수 없습니다');
    }

    await this.checkRateLimit();

    const prompt = this.createEnhancementPrompt(ocrText, items);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      this.incrementRequestCount();
      return this.parseGeminiResponse(text);
    } catch (error) {
      console.error('Gemini OCR 개선 실패:', error);
      throw error;
    }
  }

  /**
   * 텍스트에서 영수증 정보 직접 추출
   */
  async extractReceiptInfo(ocrText: string): Promise<GeminiEnhancedResult> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API를 사용할 수 없습니다');
    }

    await this.checkRateLimit();

    const prompt = this.createExtractionPrompt(ocrText);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      this.incrementRequestCount();
      return this.parseGeminiResponse(text);
    } catch (error) {
      console.error('Gemini 영수증 추출 실패:', error);
      throw error;
    }
  }

  /**
   * OCR 결과 개선용 프롬프트 생성
   */
  private createEnhancementPrompt(ocrText: string, items: any[]): string {
    return `
다음은 한국어 영수증에서 OCR로 추출한 텍스트와 자동으로 파싱한 항목들입니다.
이를 분석하여 더 정확한 정보를 제공해주세요.

OCR 원본 텍스트:
${ocrText}

현재 파싱된 항목들:
${items.map(item => `- ${item.name}: ${item.price}원`).join('\n')}

요청사항:
1. 항목명이 잘못 인식된 경우 올바른 이름으로 수정
2. 가격이 잘못 추출된 경우 수정
3. 누락된 항목이 있다면 추가
4. 총액 확인 및 수정
5. 개선 사항 및 제안사항 제공

다음 JSON 형식으로 응답해주세요:
{
  "items": [
    {
      "name": "항목명",
      "price": 가격숫자,
      "confidence": 0.9
    }
  ],
  "totalAmount": 총액숫자,
  "confidence": 0.85,
  "corrections": ["수정사항1", "수정사항2"],
  "suggestions": ["제안사항1", "제안사항2"]
}
`;
  }

  /**
   * 영수증 정보 직접 추출용 프롬프트 생성
   */
  private createExtractionPrompt(ocrText: string): string {
    return `
다음은 한국어 영수증에서 추출한 OCR 텍스트입니다.
이 텍스트를 분석하여 구매 항목과 가격을 정확하게 추출해주세요.

OCR 텍스트:
${ocrText}

추출 기준:
1. 메뉴/상품명과 가격이 명확한 항목만 추출
2. 세금, 봉사료, 할인 등은 별도 표시
3. 총액 정확히 계산
4. 애매한 부분은 신뢰도를 낮게 설정

다음 JSON 형식으로 응답해주세요:
{
  "items": [
    {
      "name": "정확한 항목명",
      "price": 가격숫자,
      "confidence": 신뢰도 (0.0-1.0)
    }
  ],
  "totalAmount": 총액숫자,
  "confidence": 전체신뢰도,
  "corrections": ["OCR에서 수정된 부분들"],
  "suggestions": ["추가 확인이 필요한 부분들"]
}
`;
  }

  /**
   * Gemini 응답 파싱
   */
  private parseGeminiResponse(text: string): GeminiEnhancedResult {
    try {
      // JSON 부분 추출
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('유효한 JSON 응답이 없습니다');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // 항목들에 ID 추가
      const itemsWithId = parsed.items.map((item: any, index: number) => ({
        id: `gemini-${Date.now()}-${index}`,
        name: item.name,
        price: item.price,
        quantity: 1,
        confidence: item.confidence || 0.8,
      }));

      return {
        items: itemsWithId,
        totalAmount: parsed.totalAmount || 0,
        confidence: parsed.confidence || 0.8,
        corrections: parsed.corrections || [],
        suggestions: parsed.suggestions || [],
      };
    } catch (error) {
      console.error('Gemini 응답 파싱 실패:', error);
      throw new Error('Gemini 응답을 해석할 수 없습니다');
    }
  }

  /**
   * API 사용 가능 여부 확인
   */
  private isAvailable(): boolean {
    return this.genAI !== null && this.model !== null;
  }

  /**
   * 속도 제한 확인
   */
  private async checkRateLimit(): Promise<void> {
    // 일일 제한 확인
    if (this.requestCount >= this.dailyLimit) {
      throw new Error(`일일 API 사용 한도(${this.dailyLimit}회)를 초과했습니다`);
    }

    // 최소 간격 확인
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * 요청 카운트 증가
   */
  private incrementRequestCount(): void {
    this.requestCount++;
    this.saveRequestCount();
  }

  /**
   * 요청 카운트 로드
   */
  private loadRequestCount(): void {
    try {
      const today = new Date().toDateString();
      const saved = localStorage.getItem('gemini-usage');
      
      if (saved) {
        const data = JSON.parse(saved);
        if (data.date === today) {
          this.requestCount = data.count;
        } else {
          this.requestCount = 0;
        }
      }
    } catch (error) {
      console.warn('Gemini 사용량 로드 실패:', error);
      this.requestCount = 0;
    }
  }

  /**
   * 요청 카운트 저장
   */
  private saveRequestCount(): void {
    try {
      const today = new Date().toDateString();
      const data = { date: today, count: this.requestCount };
      localStorage.setItem('gemini-usage', JSON.stringify(data));
    } catch (error) {
      console.warn('Gemini 사용량 저장 실패:', error);
    }
  }

  /**
   * 현재 API 사용 상태 조회
   */
  getUsageInfo(): {
    requestCount: number;
    dailyLimit: number;
    remaining: number;
    isAvailable: boolean;
  } {
    return {
      requestCount: this.requestCount,
      dailyLimit: this.dailyLimit,
      remaining: this.dailyLimit - this.requestCount,
      isAvailable: this.isAvailable(),
    };
  }

  /**
   * 사용량 초기화 (테스트용)
   */
  resetUsage(): void {
    this.requestCount = 0;
    localStorage.removeItem('gemini-usage');
  }
}

// 싱글톤 인스턴스 생성
export const geminiService = new GeminiService();

// 환경변수에서 API 키 로드 시도
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (apiKey && apiKey !== 'optional') {
  try {
    geminiService.initialize({ apiKey });
  } catch (error) {
    console.warn('Gemini 서비스 자동 초기화 실패:', error);
  }
}

export default geminiService;