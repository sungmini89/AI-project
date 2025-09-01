/**
 * 성능 모니터링 및 Core Web Vitals 최적화 유틸리티
 */

// Core Web Vitals 타입 정의
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Performance Observer 지원 확인
export const supportsPerformanceObserver = (): boolean => {
  return typeof window !== 'undefined' && 'PerformanceObserver' in window;
};

// Core Web Vitals 임계값
export const WEB_VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
} as const;

// 메트릭 레이팅 계산
export const getMetricRating = (
  name: WebVitalsMetric['name'],
  value: number
): WebVitalsMetric['rating'] => {
  const thresholds = WEB_VITALS_THRESHOLDS[name];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
};

// 성능 메트릭 수집기
export class PerformanceMonitor {
  private metrics: Map<string, WebVitalsMetric> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    if (!supportsPerformanceObserver()) return;

    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entries) => {
      const entry = entries[entries.length - 1] as any;
      this.recordMetric('LCP', entry.startTime);
    });

    // First Input Delay (FID)
    this.observeMetric('first-input', (entries) => {
      const entry = entries[0] as any;
      this.recordMetric('FID', entry.processingStart - entry.startTime);
    });

    // Cumulative Layout Shift (CLS)
    this.observeCLS();

    // First Contentful Paint (FCP)
    this.observeMetric('paint', (entries) => {
      const fcpEntry = entries.find((entry: any) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.recordMetric('FCP', fcpEntry.startTime);
      }
    });

    // Time to First Byte (TTFB)
    this.observeNavigation();
  }

  private observeMetric(type: string, callback: (entries: PerformanceEntryList) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  private observeCLS(): void {
    let clsValue = 0;
    let clsEntries: any[] = [];

    this.observeMetric('layout-shift', (entries) => {
      for (const entry of entries as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      }
      this.recordMetric('CLS', clsValue);
    });
  }

  private observeNavigation(): void {
    this.observeMetric('navigation', (entries) => {
      const entry = entries[0] as any;
      if (entry) {
        this.recordMetric('TTFB', entry.responseStart - entry.requestStart);
      }
    });
  }

  private recordMetric(name: WebVitalsMetric['name'], value: number): void {
    const existing = this.metrics.get(name);
    const delta = existing ? value - existing.value : value;
    
    const metric: WebVitalsMetric = {
      name,
      value,
      rating: getMetricRating(name, value),
      delta,
      id: this.generateId(),
    };

    this.metrics.set(name, metric);
    this.onMetricUpdate(metric);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private onMetricUpdate(metric: WebVitalsMetric): void {
    // 개발 환경에서 콘솔에 로그
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}:`, {
        value: Math.round(metric.value),
        rating: metric.rating,
        unit: ['FID', 'FCP', 'LCP', 'TTFB'].includes(metric.name) ? 'ms' : 'score'
      });
    }

    // 메트릭을 로컬 스토리지에 저장 (선택적)
    this.saveMetricToStorage(metric);
  }

  private saveMetricToStorage(metric: WebVitalsMetric): void {
    try {
      const storageKey = `webvitals_${metric.name}`;
      const data = {
        ...metric,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      // 로컬 스토리지 오류 무시
    }
  }

  // 메트릭 조회
  public getMetric(name: WebVitalsMetric['name']): WebVitalsMetric | undefined {
    return this.metrics.get(name);
  }

  // 모든 메트릭 조회
  public getAllMetrics(): WebVitalsMetric[] {
    return Array.from(this.metrics.values());
  }

  // 옵저버 정리
  public disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }

  // 성능 요약 생성
  public getPerformanceSummary(): {
    overall: 'good' | 'needs-improvement' | 'poor';
    metrics: WebVitalsMetric[];
    suggestions: string[];
  } {
    const metrics = this.getAllMetrics();
    const poorMetrics = metrics.filter(m => m.rating === 'poor');
    const needsImprovementMetrics = metrics.filter(m => m.rating === 'needs-improvement');
    
    let overall: 'good' | 'needs-improvement' | 'poor' = 'good';
    if (poorMetrics.length > 0) {
      overall = 'poor';
    } else if (needsImprovementMetrics.length > 0) {
      overall = 'needs-improvement';
    }

    const suggestions = this.generateSuggestions(metrics);

    return {
      overall,
      metrics,
      suggestions,
    };
  }

  private generateSuggestions(metrics: WebVitalsMetric[]): string[] {
    const suggestions: string[] = [];

    metrics.forEach(metric => {
      if (metric.rating === 'poor' || metric.rating === 'needs-improvement') {
        switch (metric.name) {
          case 'LCP':
            suggestions.push('이미지 최적화 및 서버 응답 시간 개선을 고려해보세요.');
            break;
          case 'FID':
            suggestions.push('JavaScript 번들 크기를 줄이고 코드 분할을 고려해보세요.');
            break;
          case 'CLS':
            suggestions.push('이미지 크기를 명시하고 동적 콘텐츠 삽입을 피해보세요.');
            break;
          case 'FCP':
            suggestions.push('중요한 리소스를 우선 로딩하고 렌더링 차단 요소를 줄여보세요.');
            break;
          case 'TTFB':
            suggestions.push('서버 응답 시간을 최적화하고 CDN 사용을 고려해보세요.');
            break;
        }
      }
    });

    return [...new Set(suggestions)]; // 중복 제거
  }
}

// 전역 성능 모니터 인스턴스
let globalMonitor: PerformanceMonitor | null = null;

// 성능 모니터링 시작
export const startPerformanceMonitoring = (): PerformanceMonitor => {
  if (typeof window === 'undefined') {
    throw new Error('Performance monitoring is only available in browser environment');
  }

  if (globalMonitor) {
    return globalMonitor;
  }

  globalMonitor = new PerformanceMonitor();
  return globalMonitor;
};

// 성능 모니터링 중단
export const stopPerformanceMonitoring = (): void => {
  if (globalMonitor) {
    globalMonitor.disconnect();
    globalMonitor = null;
  }
};

// React Hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const monitor = startPerformanceMonitoring();
  
  return {
    getMetric: (name: WebVitalsMetric['name']) => monitor.getMetric(name),
    getAllMetrics: () => monitor.getAllMetrics(),
    getPerformanceSummary: () => monitor.getPerformanceSummary(),
  };
};

// 성능 리포트 내보내기
export const exportPerformanceReport = (): string => {
  if (!globalMonitor) return '{}';
  
  const summary = globalMonitor.getPerformanceSummary();
  const report = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...summary,
  };

  return JSON.stringify(report, null, 2);
};