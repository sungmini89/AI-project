/**
 * 성능 모니터링 시스템
 * - 실시간 성능 메트릭 수집
 * - 색상 계산 시간 측정
 * - 이미지 처리 성능 추적
 */
import React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'color' | 'image' | 'ui' | 'memory' | 'network';
  unit: 'ms' | 'mb' | 'count' | 'ratio';
}

interface PerformanceSummary {
  averageColorGenerationTime: number;
  averageImageProcessingTime: number;
  memoryUsage: {
    current: number;
    peak: number;
    average: number;
  };
  cacheHitRate: number;
  renderingPerformance: {
    fps: number;
    frameDrops: number;
  };
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private maxMetricsHistory = 1000;
  private observers: Map<string, PerformanceObserver> = new Map();
  private isMonitoring = false;

  // 성능 목표치
  private performanceTargets = {
    paletteGeneration: 2000, // 2초
    imageProcessing: 3000,   // 3초
    pageLoad: 2000,         // 2초
    colorConversion: 100,   // 100ms
    memoryUsage: 100,       // 100MB
    cacheHitRate: 0.8       // 80%
  };

  private constructor() {
    this.initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Performance Observers 초기화
   */
  private initializeObservers(): void {
    try {
      // 네비게이션 성능 관찰
      if ('PerformanceObserver' in window) {
        const navigationObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            this.recordMetric('page_load_time', entry.duration, 'ui', 'ms');
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);

        // 사용자 타이밍 관찰
        const measureObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            const category = this.categorizeMetric(entry.name);
            this.recordMetric(entry.name, entry.duration, category, 'ms');
          });
        });
        measureObserver.observe({ entryTypes: ['measure'] });
        this.observers.set('measure', measureObserver);

        // 자원 로딩 관찰
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            this.recordMetric(`resource_${entry.name}`, entry.duration, 'network', 'ms');
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      }
    } catch (error) {
      console.warn('Performance Observer 초기화 실패:', error);
    }
  }

  /**
   * 메트릭 카테고리 분류
   */
  private categorizeMetric(name: string): 'color' | 'image' | 'ui' | 'memory' | 'network' {
    if (name.includes('color') || name.includes('palette')) return 'color';
    if (name.includes('image') || name.includes('vibrant')) return 'image';
    if (name.includes('render') || name.includes('paint')) return 'ui';
    if (name.includes('memory') || name.includes('gc')) return 'memory';
    return 'network';
  }

  /**
   * 모니터링 시작
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    
    // 메모리 사용량 주기적 체크
    setInterval(() => {
      this.recordMemoryMetrics();
    }, 5000);

    // FPS 모니터링
    this.startFPSMonitoring();

    console.log('성능 모니터링 시작');
  }

  /**
   * 모니터링 중지
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    // Observer 정리
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();

    console.log('성능 모니터링 중지');
  }

  /**
   * 메트릭 기록
   */
  recordMetric(
    name: string, 
    value: number, 
    category: 'color' | 'image' | 'ui' | 'memory' | 'network',
    unit: 'ms' | 'mb' | 'count' | 'ratio'
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      category,
      unit
    };

    this.metrics.push(metric);

    // 히스토리 크기 제한
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    // 성능 목표 체크
    this.checkPerformanceTargets(metric);
  }

  /**
   * 색상 생성 성능 측정 시작
   */
  startColorGenerationMeasure(id: string = 'default'): string {
    const measureName = `color_generation_${id}`;
    performance.mark(`${measureName}_start`);
    return measureName;
  }

  /**
   * 색상 생성 성능 측정 종료
   */
  endColorGenerationMeasure(measureName: string): number {
    const endMark = `${measureName}_end`;
    performance.mark(endMark);
    performance.measure(measureName, `${measureName}_start`, endMark);

    const measure = performance.getEntriesByName(measureName)[0] as PerformanceMeasure;
    this.recordMetric(measureName, measure.duration, 'color', 'ms');

    // 정리
    performance.clearMarks(`${measureName}_start`);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);

    return measure.duration;
  }

  /**
   * 이미지 처리 성능 측정 시작
   */
  startImageProcessingMeasure(id: string = 'default'): string {
    const measureName = `image_processing_${id}`;
    performance.mark(`${measureName}_start`);
    return measureName;
  }

  /**
   * 이미지 처리 성능 측정 종료
   */
  endImageProcessingMeasure(measureName: string): number {
    const endMark = `${measureName}_end`;
    performance.mark(endMark);
    performance.measure(measureName, `${measureName}_start`, endMark);

    const measure = performance.getEntriesByName(measureName)[0] as PerformanceMeasure;
    this.recordMetric(measureName, measure.duration, 'image', 'ms');

    // 정리
    performance.clearMarks(`${measureName}_start`);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);

    return measure.duration;
  }

  /**
   * 메모리 메트릭 기록
   */
  private recordMemoryMetrics(): void {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      
      this.recordMetric('memory_used', 
        memory.usedJSHeapSize / (1024 * 1024), 'memory', 'mb');
      this.recordMetric('memory_total', 
        memory.totalJSHeapSize / (1024 * 1024), 'memory', 'mb');
      this.recordMetric('memory_limit', 
        memory.jsHeapSizeLimit / (1024 * 1024), 'memory', 'mb');
      this.recordMetric('memory_usage_ratio', 
        memory.usedJSHeapSize / memory.jsHeapSizeLimit, 'memory', 'ratio');
    }
  }

  /**
   * FPS 모니터링
   */
  private startFPSMonitoring(): void {
    let frames = 0;
    let lastTime = performance.now();

    const countFPS = (currentTime: number) => {
      frames++;
      
      if (currentTime >= lastTime + 1000) {
        this.recordMetric('fps', frames, 'ui', 'count');
        frames = 0;
        lastTime = currentTime;
      }
      
      if (this.isMonitoring) {
        requestAnimationFrame(countFPS);
      }
    };

    requestAnimationFrame(countFPS);
  }

  /**
   * 성능 목표 체크
   */
  private checkPerformanceTargets(metric: PerformanceMetric): void {
    let targetExceeded = false;
    let targetName = '';
    let targetValue = 0;

    switch (metric.name) {
      case 'color_generation':
        if (metric.value > this.performanceTargets.paletteGeneration) {
          targetExceeded = true;
          targetName = '팔레트 생성';
          targetValue = this.performanceTargets.paletteGeneration;
        }
        break;
      
      case 'image_processing':
        if (metric.value > this.performanceTargets.imageProcessing) {
          targetExceeded = true;
          targetName = '이미지 처리';
          targetValue = this.performanceTargets.imageProcessing;
        }
        break;

      case 'memory_used':
        if (metric.value > this.performanceTargets.memoryUsage) {
          targetExceeded = true;
          targetName = '메모리 사용량';
          targetValue = this.performanceTargets.memoryUsage;
        }
        break;
    }

    if (targetExceeded) {
      console.warn(`성능 목표 초과: ${targetName} - 실제: ${metric.value}${metric.unit}, 목표: ${targetValue}${metric.unit}`);
    }
  }

  /**
   * 성능 요약 생성
   */
  getPerformanceSummary(): PerformanceSummary {
    const colorMetrics = this.metrics.filter(m => m.category === 'color');
    const imageMetrics = this.metrics.filter(m => m.category === 'image');
    const memoryMetrics = this.metrics.filter(m => m.category === 'memory' && m.name === 'memory_used');
    const fpsMetrics = this.metrics.filter(m => m.name === 'fps');

    return {
      averageColorGenerationTime: this.calculateAverage(colorMetrics),
      averageImageProcessingTime: this.calculateAverage(imageMetrics),
      memoryUsage: {
        current: memoryMetrics.length > 0 ? (memoryMetrics[memoryMetrics.length - 1]?.value || 0) : 0,
        peak: memoryMetrics.length > 0 ? Math.max(...memoryMetrics.map(m => m.value)) : 0,
        average: this.calculateAverage(memoryMetrics)
      },
      cacheHitRate: this.calculateCacheHitRate(),
      renderingPerformance: {
        fps: this.calculateAverage(fpsMetrics),
        frameDrops: this.calculateFrameDrops(fpsMetrics)
      }
    };
  }

  /**
   * 평균 계산
   */
  private calculateAverage(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
  }

  /**
   * 캐시 히트율 계산 (추정)
   */
  private calculateCacheHitRate(): number {
    // 캐시 관련 메트릭이 있다면 계산, 없으면 추정치
    const cacheMetrics = this.metrics.filter(m => m.name.includes('cache'));
    if (cacheMetrics.length === 0) return 0.75; // 기본 추정치
    
    // 실제 캐시 히트율 계산 로직 (구현 필요)
    return 0.8;
  }

  /**
   * 프레임 드롭 계산
   */
  private calculateFrameDrops(fpsMetrics: PerformanceMetric[]): number {
    return fpsMetrics.filter(m => m.value < 58).length; // 60fps 기준
  }

  /**
   * 상세 메트릭 조회
   */
  getMetrics(
    category?: 'color' | 'image' | 'ui' | 'memory' | 'network',
    timeRange?: { start: number; end: number }
  ): PerformanceMetric[] {
    let filtered = this.metrics;

    if (category) {
      filtered = filtered.filter(m => m.category === category);
    }

    if (timeRange) {
      filtered = filtered.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    return filtered;
  }

  /**
   * 성능 보고서 생성
   */
  generateReport(): {
    summary: PerformanceSummary;
    recommendations: string[];
    targetCompliance: { [key: string]: boolean };
  } {
    const summary = this.getPerformanceSummary();
    const recommendations: string[] = [];
    const targetCompliance: { [key: string]: boolean } = {};

    // 성능 목표 준수 체크 및 권장사항 생성
    if (summary.averageColorGenerationTime > this.performanceTargets.paletteGeneration) {
      targetCompliance.colorGeneration = false;
      recommendations.push('색상 생성 시간 단축을 위해 캐싱 활용 또는 Web Workers 사용을 권장합니다.');
    } else {
      targetCompliance.colorGeneration = true;
    }

    if (summary.averageImageProcessingTime > this.performanceTargets.imageProcessing) {
      targetCompliance.imageProcessing = false;
      recommendations.push('이미지 처리 성능 개선을 위해 이미지 크기 최적화 또는 병렬 처리를 권장합니다.');
    } else {
      targetCompliance.imageProcessing = true;
    }

    if (summary.memoryUsage.current > this.performanceTargets.memoryUsage) {
      targetCompliance.memoryUsage = false;
      recommendations.push('메모리 사용량 감소를 위해 정기적인 캐시 정리 및 가비지 컬렉션을 권장합니다.');
    } else {
      targetCompliance.memoryUsage = true;
    }

    if (summary.renderingPerformance.fps < 55) {
      targetCompliance.renderingPerformance = false;
      recommendations.push('렌더링 성능 개선을 위해 불필요한 리렌더링 최소화를 권장합니다.');
    } else {
      targetCompliance.renderingPerformance = true;
    }

    return {
      summary,
      recommendations,
      targetCompliance
    };
  }

  /**
   * 메트릭 초기화
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * 성능 목표 업데이트
   */
  updatePerformanceTargets(targets: Partial<typeof this.performanceTargets>): void {
    this.performanceTargets = { ...this.performanceTargets, ...targets };
  }

  /**
   * 정리
   */
  destroy(): void {
    this.stopMonitoring();
    this.clearMetrics();
  }
}

// 싱글톤 인스턴스 및 유틸리티
export const performanceMonitor = PerformanceMonitor.getInstance();

// React 훅
export const usePerformanceMonitoring = () => {
  const [summary, setSummary] = React.useState<PerformanceSummary | null>(null);
  
  React.useEffect(() => {
    performanceMonitor.startMonitoring();
    
    const interval = setInterval(() => {
      setSummary(performanceMonitor.getPerformanceSummary());
    }, 10000); // 10초마다 업데이트
    
    return () => {
      clearInterval(interval);
      performanceMonitor.stopMonitoring();
    };
  }, []);
  
  return summary;
};

export const useColorGenerationPerformance = () => {
  const [currentMeasure, setCurrentMeasure] = React.useState<string | null>(null);
  
  const startMeasure = React.useCallback(() => {
    const measure = performanceMonitor.startColorGenerationMeasure();
    setCurrentMeasure(measure);
    return measure;
  }, []);
  
  const endMeasure = React.useCallback(() => {
    if (currentMeasure) {
      const duration = performanceMonitor.endColorGenerationMeasure(currentMeasure);
      setCurrentMeasure(null);
      return duration;
    }
    return 0;
  }, [currentMeasure]);
  
  return { startMeasure, endMeasure };
};

export default PerformanceMonitor;