/**
 * @fileoverview 무료 AI 서비스 통합 관리자
 * 
 * 이 파일은 다양한 AI 기반 색상 생성 서비스를 통합 관리합니다.
 * Mock, 무료 API, 오프라인, 사용자 API 키 4가지 모드를 지원하며,
 * 할당량 추적, 성능 모니터링, 자동 폴백 등의 고급 기능을 제공합니다.
 * 
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 * @since 1.0.0
 * 
 * 지원하는 서비스 모드:
 * - **Mock**: 개발/테스트용 가짜 데이터
 * - **Free**: Colormind, TheColorAPI 등 무료 서비스  
 * - **Offline**: 로컬 색상 이론 알고리즘
 * - **Custom**: 사용자 제공 API 키 (OpenAI 등)
 */

import type { HSLColor, HarmonyType } from '../types/color';

/**
 * AI 서비스 설정을 정의하는 인터페이스
 * 
 * @interface AIServiceConfig
 * @example
 * ```typescript
 * const config: AIServiceConfig = {
 *   mode: 'free',
 *   freeApiKey: 'your-free-api-key',
 *   fallbackToOffline: true,
 *   quotaTracking: true,
 *   retryCount: 3,
 *   timeout: 10000
 * };
 * ```
 */
export interface AIServiceConfig {
  /** 서비스 운영 모드 */
  mode: 'mock' | 'free' | 'offline' | 'custom';
  
  /** 프리미엄 API 키 (custom 모드용) */
  apiKey?: string;
  
  /** 무료 API 서비스 키 (free 모드용, 선택사항) */
  freeApiKey?: string;
  
  /** API 실패 시 오프라인 모드로 자동 전환 여부 */
  fallbackToOffline: boolean;
  
  /** 할당량 추적 활성화 여부 */
  quotaTracking: boolean;
  
  /** API 호출 실패 시 재시도 횟수 */
  retryCount: number;
  
  /** API 호출 타임아웃 (밀리초) */
  timeout: number;
}

/**
 * 할당량 상태를 나타내는 인터페이스
 * 
 * API 호출 제한과 사용량을 추적하여 서비스 남용을 방지하고
 * 사용자에게 명확한 할당량 정보를 제공합니다.
 * 
 * @interface QuotaStatus
 * @example
 * ```typescript
 * const quotaStatus: QuotaStatus = {
 *   daily: { used: 45, limit: 100, resetAt: new Date('2024-01-01T00:00:00Z') },
 *   monthly: { used: 1250, limit: 3000, resetAt: new Date('2024-02-01T00:00:00Z') },
 *   remaining: { daily: 55, monthly: 1750 },
 *   isExhausted: false
 * };
 * ```
 */
export interface QuotaStatus {
  /** 일일 할당량 정보 */
  daily: { used: number; limit: number; resetAt: Date };
  
  /** 월별 할당량 정보 */
  monthly: { used: number; limit: number; resetAt: Date };
  
  /** 남은 할당량 */
  remaining: { daily: number; monthly: number };
  
  /** 할당량 소진 여부 */
  isExhausted: boolean;
}

/**
 * 서비스 상태를 나타내는 인터페이스
 * 
 * AI 서비스의 현재 운영 상태, 성능 지표, 할당량 정보를
 * 종합적으로 제공하여 시스템 모니터링을 지원합니다.
 * 
 * @interface ServiceStatus
 * @example
 * ```typescript
 * const status: ServiceStatus = {
 *   currentMode: 'free',
 *   isOnline: true,
 *   quotaStatus: { ... },
 *   lastError: undefined,
 *   performanceMetrics: {
 *     avgResponseTime: 1250,
 *     successRate: 98.5,
 *     totalRequests: 847
 *   }
 * };
 * ```
 */
export interface ServiceStatus {
  /** 현재 활성화된 서비스 모드 */
  currentMode: AIServiceConfig['mode'];
  
  /** 온라인 상태 여부 */
  isOnline: boolean;
  
  /** 현재 할당량 상태 */
  quotaStatus: QuotaStatus;
  
  /** 마지막 발생 오류 메시지 (있는 경우) */
  lastError?: string;
  
  /** 성능 지표 */
  performanceMetrics: {
    /** 평균 응답 시간 (밀리초) */
    avgResponseTime: number;
    /** 성공률 (백분율) */
    successRate: number;
    /** 총 요청 수 */
    totalRequests: number;
  };
}

/**
 * 무료 AI 서비스 통합 클래스
 * 
 * 다양한 AI 기반 색상 생성 서비스를 통합 관리하는 핵심 클래스입니다.
 * localStorage를 활용한 할당량 추적, 성능 모니터링, 자동 폴백 시스템을
 * 제공하여 안정적인 서비스 운영을 보장합니다.
 * 
 * @class FreeAIService
 * 
 * **주요 기능:**
 * - 4가지 서비스 모드 지원 (Mock, Free, Offline, Custom)
 * - 실시간 할당량 추적 및 제한 관리
 * - 자동 폴백 및 오류 복구 시스템
 * - 성능 지표 수집 및 모니터링
 * - 설정 동기화 및 상태 관리
 * 
 * **사용 예시:**
 * ```typescript
 * const config: AIServiceConfig = {
 *   mode: 'free',
 *   freeApiKey: 'your-api-key',
 *   fallbackToOffline: true,
 *   quotaTracking: true,
 *   retryCount: 3,
 *   timeout: 10000
 * };
 * 
 * const aiService = new FreeAIService(config);
 * const result = await aiService.generateColors('바다', 'complementary', {
 *   colorCount: 5
 * });
 * ```
 * 
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 * @since 1.0.0
 */
export class FreeAIService {
  private config: AIServiceConfig;
  private quotaKey = 'ai-color-service-quota';
  private performanceKey = 'ai-color-service-performance';

  constructor(config: AIServiceConfig) {
    this.config = {
      ...config,
      retryCount: config.retryCount || 3,
      timeout: config.timeout || 10000,
      quotaTracking: config.quotaTracking !== false
    };
    
    // 할당량 초기화
    this.initializeQuota();
    this.initializePerformanceTracking();
  }

  /**
   * 메인 색상 생성 엔드포인트
   */
  async generateColors(
    keyword: string, 
    harmonyType: HarmonyType, 
    options: { colorCount?: number; baseColor?: HSLColor } = {}
  ): Promise<{
    colors: HSLColor[];
    source: string;
    processingTime: number;
    confidence: number;
  }> {
    const startTime = Date.now();
    
    // 할당량 확인
    if (this.config.quotaTracking && this.isQuotaExhausted()) {
      console.warn('할당량 초과, 오프라인 모드로 전환');
      return this.generateOfflineColors(keyword, harmonyType, options);
    }

    try {
      let result;
      
      switch (this.config.mode) {
        case 'mock':
          result = await this.generateMockColors(keyword, harmonyType, options);
          break;
          
        case 'free':
          result = await this.generateFreeAPIColors(keyword, harmonyType, options);
          break;
          
        case 'offline':
          result = await this.generateOfflineColors(keyword, harmonyType, options);
          break;
          
        case 'custom':
          result = await this.generateCustomAPIColors(keyword, harmonyType, options);
          break;
          
        default:
          throw new Error(`지원하지 않는 모드: ${this.config.mode}`);
      }

      // 할당량 업데이트
      if (this.config.quotaTracking && this.config.mode !== 'offline') {
        this.updateQuotaUsage();
      }
      
      // 성능 메트릭 업데이트
      this.updatePerformanceMetrics(Date.now() - startTime, true);
      
      return result;
      
    } catch (error) {
      console.error(`색상 생성 실패 (${this.config.mode} 모드):`, error);
      
      // 성능 메트릭 업데이트 (실패)
      this.updatePerformanceMetrics(Date.now() - startTime, false);
      
      // 자동 폴백
      if (this.config.fallbackToOffline && this.config.mode !== 'offline') {
        console.warn('오프라인 모드로 폴백');
        return this.generateOfflineColors(keyword, harmonyType, options);
      }
      
      throw error;
    }
  }

  /**
   * Mock 모드 - 개발용 가짜 데이터
   */
  private async generateMockColors(
    _keyword: string, 
    _harmonyType: HarmonyType, 
    options: any
  ): Promise<any> {
    // 개발 시 빠른 응답을 위한 Mock 데이터
    await this.simulateDelay(500, 1000);
    
    const mockColors: HSLColor[] = [
      { h: 200, s: 70, l: 50 },
      { h: 230, s: 65, l: 55 },
      { h: 170, s: 75, l: 45 },
      { h: 250, s: 60, l: 60 },
      { h: 140, s: 80, l: 50 }
    ];
    
    return {
      colors: mockColors.slice(0, options.colorCount || 5),
      source: 'mock',
      processingTime: Math.random() * 1000,
      confidence: 0.9
    };
  }

  /**
   * 무료 API 모드 - Colormind, TheColorAPI 등
   */
  private async generateFreeAPIColors(
    keyword: string, 
    harmonyType: HarmonyType, 
    options: any
  ): Promise<any> {
    const baseColor = options.baseColor || this.keywordToBaseColor(keyword);
    
    // 1차 시도: Colormind API
    try {
      return await this.callColormindAPI(baseColor, options.colorCount || 5);
    } catch (error) {
      console.warn('Colormind API 실패:', error);
    }
    
    // 2차 시도: TheColorAPI
    try {
      return await this.callTheColorAPI(baseColor, harmonyType, options.colorCount || 5);
    } catch (error) {
      console.warn('TheColorAPI 실패:', error);
    }
    
    throw new Error('모든 무료 API 호출 실패');
  }

  /**
   * 오프라인 모드 - 로컬 알고리즘
   */
  private async generateOfflineColors(
    keyword: string, 
    harmonyType: HarmonyType, 
    options: any
  ): Promise<any> {
    const baseColor = options.baseColor || this.keywordToBaseColor(keyword);
    const colors = this.generateHarmonyColors(baseColor, harmonyType, options.colorCount || 5);
    
    return {
      colors,
      source: 'offline',
      processingTime: 10, // 매우 빠름
      confidence: 0.7
    };
  }

  /**
   * 사용자 API 키 모드 - 프리미엄 서비스
   */
  private async generateCustomAPIColors(
    keyword: string, 
    harmonyType: HarmonyType, 
    _options: any
  ): Promise<any> {
    if (!this.config.apiKey) {
      throw new Error('사용자 API 키가 필요합니다');
    }
    
    // 예시: OpenAI DALL-E 색상 분석 (실제 구현 시)
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `'${keyword}' 키워드에 대한 ${this.getHarmonyName(harmonyType)} 색상 팔레트 5개를 HSL 형식으로 생성해줘. JSON 형식으로만 응답: [{"h":값,"s":값,"l":값}, ...]`
          }],
          max_tokens: 200
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API 오류: ${response.status}`);
      }
      
      const data = await response.json();
      const colors = JSON.parse(data.choices[0].message.content);
      
      return {
        colors,
        source: 'openai',
        processingTime: 2000,
        confidence: 0.95
      };
      
    } catch (error) {
      console.error('Custom API 호출 실패:', error);
      throw error;
    }
  }

  /**
   * Colormind API 호출
   */
  private async callColormindAPI(baseColor: HSLColor, colorCount: number): Promise<any> {
    const rgb = this.hslToRgb(baseColor);
    
    const response = await fetch('http://colormind.io/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'default',
        input: [[rgb.r, rgb.g, rgb.b], 'N', 'N', 'N', 'N']
      }),
      signal: AbortSignal.timeout(this.config.timeout)
    });
    
    if (!response.ok) {
      throw new Error(`Colormind API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    const colors = data.result.map((rgbArray: number[]) => 
      this.rgbToHsl({ r: rgbArray[0], g: rgbArray[1], b: rgbArray[2] })
    );
    
    return {
      colors: colors.slice(0, colorCount),
      source: 'colormind',
      processingTime: 800,
      confidence: 0.85
    };
  }

  /**
   * TheColorAPI 호출
   */
  private async callTheColorAPI(baseColor: HSLColor, harmonyType: HarmonyType, colorCount: number): Promise<any> {
    const hex = this.hslToHex(baseColor).replace('#', '');
    const mode = this.getTheColorAPIMode(harmonyType);
    
    // API 키가 있으면 헤더에 추가 (실제 TheColorAPI는 키가 필요하지 않지만 예시로)
    const headers: HeadersInit = {};
    if (this.config.freeApiKey) {
      headers['X-API-Key'] = this.config.freeApiKey;
    }
    
    const response = await fetch(
      `https://www.thecolorapi.com/scheme?hex=${hex}&mode=${mode}&count=${colorCount}`,
      { 
        headers,
        signal: AbortSignal.timeout(this.config.timeout) 
      }
    );
    
    if (!response.ok) {
      throw new Error(`TheColorAPI 오류: ${response.status}`);
    }
    
    const data = await response.json();
    const colors = data.colors.map((colorData: any) => 
      this.hexToHsl(colorData.hex.value)
    );
    
    return {
      colors,
      source: 'thecolorapi',
      processingTime: 1200,
      confidence: 0.8
    };
  }

  /**
   * 할당량 추적 관련 메서드들
   */
  private initializeQuota(): void {
    const stored = localStorage.getItem(this.quotaKey);
    if (!stored) {
      const initialQuota = {
        daily: { used: 0, limit: 100, resetAt: this.getNextDayReset() },
        monthly: { used: 0, limit: 1000, resetAt: this.getNextMonthReset() },
        lastReset: new Date().toISOString()
      };
      localStorage.setItem(this.quotaKey, JSON.stringify(initialQuota));
    } else {
      this.checkAndResetQuota();
    }
  }

  private updateQuotaUsage(): void {
    const quota = this.getQuotaStatus();
    quota.daily.used++;
    quota.monthly.used++;
    localStorage.setItem(this.quotaKey, JSON.stringify({
      daily: quota.daily,
      monthly: quota.monthly,
      lastReset: new Date().toISOString()
    }));
  }

  private isQuotaExhausted(): boolean {
    const quota = this.getQuotaStatus();
    return quota.daily.used >= quota.daily.limit || quota.monthly.used >= quota.monthly.limit;
  }

  /**
   * 서비스 상태 반환
   */
  getServiceStatus(): ServiceStatus {
    const quota = this.getQuotaStatus();
    const performance = this.getPerformanceMetrics();
    
    return {
      currentMode: this.config.mode,
      isOnline: navigator.onLine,
      quotaStatus: {
        daily: quota.daily,
        monthly: quota.monthly,
        remaining: {
          daily: quota.daily.limit - quota.daily.used,
          monthly: quota.monthly.limit - quota.monthly.used
        },
        isExhausted: this.isQuotaExhausted()
      },
      performanceMetrics: performance
    };
  }

  /**
   * 서비스 모드 동적 변경
   */
  switchMode(newMode: AIServiceConfig['mode'], apiKey?: string, freeApiKey?: string): void {
    this.config.mode = newMode;
    if (apiKey) {
      this.config.apiKey = apiKey;
    }
    if (freeApiKey) {
      this.config.freeApiKey = freeApiKey;
    }
    console.log(`서비스 모드 변경: ${newMode}`);
  }

  /**
   * 설정 업데이트 (localStorage에서 최신 설정 로드)
   */
  updateConfig(): void {
    try {
      const savedConfig = localStorage.getItem('ai-service-config');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        this.config = {
          ...this.config,
          ...parsedConfig
        };
        console.log('AI 서비스 설정 업데이트됨:', this.config.mode);
      }
    } catch (error) {
      console.error('설정 업데이트 실패:', error);
    }
  }

  /**
   * 유틸리티 메서드들
   */
  private keywordToBaseColor(keyword: string): HSLColor {
    // 간단한 키워드 매핑
    const keywordMap: Record<string, HSLColor> = {
      '바다': { h: 200, s: 70, l: 50 },
      '하늘': { h: 210, s: 80, l: 60 },
      '숲': { h: 120, s: 60, l: 40 },
      '꽃': { h: 320, s: 70, l: 60 },
      '일몰': { h: 20, s: 80, l: 55 },
      '눈': { h: 200, s: 10, l: 90 },
      '불': { h: 10, s: 90, l: 50 }
    };
    
    return keywordMap[keyword] || { h: 200, s: 60, l: 50 };
  }

  private generateHarmonyColors(baseColor: HSLColor, harmonyType: HarmonyType, count: number): HSLColor[] {
    const colors = [baseColor];
    
    for (let i = 1; i < count; i++) {
      let newColor: HSLColor;
      
      switch (harmonyType) {
        case 'complementary':
          newColor = { ...baseColor, h: (baseColor.h + 180) % 360 };
          break;
        case 'analogous':
          newColor = { ...baseColor, h: (baseColor.h + (i * 30)) % 360 };
          break;
        case 'triadic':
          newColor = { ...baseColor, h: (baseColor.h + (i * 120)) % 360 };
          break;
        default:
          newColor = { ...baseColor, l: Math.max(10, Math.min(90, baseColor.l + (i * 15))) };
      }
      
      colors.push(newColor);
    }
    
    return colors;
  }

  // 색상 변환 유틸리티들
  private hslToRgb(hsl: HSLColor): { r: number; g: number; b: number } {
    const { h, s, l } = hsl;
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;
    
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs((hNorm * 6) % 2 - 1));
    const m = lNorm - c / 2;
    
    let r, g, b;
    if (hNorm < 1/6) [r, g, b] = [c, x, 0];
    else if (hNorm < 2/6) [r, g, b] = [x, c, 0];
    else if (hNorm < 3/6) [r, g, b] = [0, c, x];
    else if (hNorm < 4/6) [r, g, b] = [0, x, c];
    else if (hNorm < 5/6) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  private rgbToHsl(rgb: { r: number; g: number; b: number }): HSLColor {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    
    if (max === min) {
      return { h: 0, s: 0, l: Math.round(l * 100) };
    }
    
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    let h: number;
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  private hslToHex(hsl: HSLColor): string {
    const rgb = this.hslToRgb(hsl);
    return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`;
  }

  private hexToHsl(hex: string): HSLColor {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return this.rgbToHsl({ r, g, b });
  }

  private getHarmonyName(harmonyType: HarmonyType): string {
    const names = {
      complementary: '보색',
      analogous: '유사색',
      triadic: '삼색조',
      tetradic: '사색조',
      monochromatic: '단색조'
    };
    return names[harmonyType] || harmonyType;
  }

  private getTheColorAPIMode(harmonyType: HarmonyType): string {
    const modes = {
      complementary: 'complement',
      analogous: 'analogic',
      triadic: 'triad',
      tetradic: 'quad',
      monochromatic: 'monochrome'
    };
    return modes[harmonyType] || 'complement';
  }

  private async simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private getQuotaStatus(): any {
    return JSON.parse(localStorage.getItem(this.quotaKey) || '{}');
  }

  private checkAndResetQuota(): void {
    const quota = this.getQuotaStatus();
    const now = new Date();
    
    if (new Date(quota.daily.resetAt) <= now) {
      quota.daily.used = 0;
      quota.daily.resetAt = this.getNextDayReset();
    }
    
    if (new Date(quota.monthly.resetAt) <= now) {
      quota.monthly.used = 0;
      quota.monthly.resetAt = this.getNextMonthReset();
    }
    
    localStorage.setItem(this.quotaKey, JSON.stringify(quota));
  }

  private getNextDayReset(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  private getNextMonthReset(): Date {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    return nextMonth;
  }

  private initializePerformanceTracking(): void {
    const stored = localStorage.getItem(this.performanceKey);
    if (!stored) {
      const initial = {
        totalRequests: 0,
        successfulRequests: 0,
        totalResponseTime: 0,
        avgResponseTime: 0,
        successRate: 0
      };
      localStorage.setItem(this.performanceKey, JSON.stringify(initial));
    }
  }

  private updatePerformanceMetrics(responseTime: number, success: boolean): void {
    const metrics = this.getPerformanceMetrics();
    metrics.totalRequests++;
    metrics.totalResponseTime += responseTime;
    
    if (success) {
      metrics.successfulRequests++;
    }
    
    metrics.avgResponseTime = metrics.totalResponseTime / metrics.totalRequests;
    metrics.successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
    
    localStorage.setItem(this.performanceKey, JSON.stringify(metrics));
  }

  private getPerformanceMetrics(): any {
    const stored = localStorage.getItem(this.performanceKey);
    const metrics = JSON.parse(stored || '{}');
    
    return {
      avgResponseTime: metrics.avgResponseTime || 0,
      successRate: metrics.successRate || 0,
      totalRequests: metrics.totalRequests || 0
    };
  }
}