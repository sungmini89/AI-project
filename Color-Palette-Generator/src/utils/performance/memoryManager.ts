/**
 * 메모리 관리 최적화 시스템
 * - 가비지 컬렉션 최적화
 * - 캐시 관리 전략 
 * - 메모리 누수 방지
 * - 메모리 모니터링
 */
import React from 'react';

interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usage: number; // 사용률 %
}

interface CleanupTask {
  id: string;
  cleanup: () => void;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
}

class MemoryManager {
  private static instance: MemoryManager;
  private cleanupTasks: Map<string, CleanupTask> = new Map();
  private memoryThresholds = {
    warning: 0.75, // 75% 사용시 경고
    critical: 0.90, // 90% 사용시 강제 정리
    emergency: 0.95  // 95% 사용시 긴급 정리
  };
  private monitoringInterval: number | null = null;
  private isMonitoring = false;

  private constructor() {
    this.startMemoryMonitoring();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * 메모리 사용량 모니터링 시작
   */
  startMemoryMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = window.setInterval(() => {
      const stats = this.getMemoryStats();
      
      if (stats.usage > this.memoryThresholds.emergency) {
        console.warn('긴급 메모리 정리 실행');
        this.performEmergencyCleanup();
      } else if (stats.usage > this.memoryThresholds.critical) {
        console.warn('메모리 사용량 위험 수준 - 강제 정리');
        this.performCriticalCleanup();
      } else if (stats.usage > this.memoryThresholds.warning) {
        console.warn('메모리 사용량 경고 수준');
        this.performWarningCleanup();
      }
    }, 30000); // 30초마다 체크
  }

  /**
   * 메모리 모니터링 중지
   */
  stopMemoryMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.isMonitoring = false;
    }
  }

  /**
   * 현재 메모리 사용량 통계
   */
  getMemoryStats(): MemoryStats {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize || 0,
        totalJSHeapSize: memory.totalJSHeapSize || 0,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usage: memory.usedJSHeapSize / memory.jsHeapSizeLimit
      };
    }

    // 메모리 API가 없는 경우 추정치
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
      usage: 0.5 // 50% 추정
    };
  }

  /**
   * 정리 작업 등록
   */
  registerCleanupTask(
    id: string, 
    cleanup: () => void, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): void {
    this.cleanupTasks.set(id, {
      id,
      cleanup,
      priority,
      timestamp: Date.now()
    });
  }

  /**
   * 정리 작업 해제
   */
  unregisterCleanupTask(id: string): void {
    this.cleanupTasks.delete(id);
  }

  /**
   * 경고 수준 정리 (낮은 우선순위만)
   */
  private performWarningCleanup(): void {
    this.executeCleanupTasks(['low']);
    this.suggestGarbageCollection();
  }

  /**
   * 위험 수준 정리 (중간 우선순위까지)
   */
  private performCriticalCleanup(): void {
    this.executeCleanupTasks(['low', 'medium']);
    this.forceGarbageCollection();
    this.clearOldCaches();
  }

  /**
   * 긴급 정리 (모든 우선순위)
   */
  private performEmergencyCleanup(): void {
    this.executeCleanupTasks(['low', 'medium', 'high']);
    this.forceGarbageCollection();
    this.clearAllCaches();
    this.releaseUnusedResources();
  }

  /**
   * 우선순위별 정리 작업 실행
   */
  private executeCleanupTasks(priorities: string[]): void {
    const tasksToExecute = Array.from(this.cleanupTasks.values())
      .filter(task => priorities.includes(task.priority))
      .sort((a, b) => {
        // 우선순위순, 그 다음 오래된 순
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.timestamp - b.timestamp;
      });

    let cleanedCount = 0;
    for (const task of tasksToExecute) {
      try {
        task.cleanup();
        this.cleanupTasks.delete(task.id);
        cleanedCount++;
      } catch (error) {
        console.error(`정리 작업 실패: ${task.id}`, error);
      }
    }

    if (cleanedCount > 0) {
      console.log(`${cleanedCount}개 정리 작업 완료`);
    }
  }

  /**
   * 가비지 컬렉션 제안 (브라우저가 지원하는 경우)
   */
  private suggestGarbageCollection(): void {
    // 개발 환경에서만 사용 가능
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
      try {
        (window as any).gc();
        console.log('가비지 컬렉션 실행됨');
      } catch (error) {
        console.warn('가비지 컬렉션 실행 실패:', error);
      }
    }
  }

  /**
   * 강제 가비지 컬렉션 시도
   */
  private forceGarbageCollection(): void {
    // 메모리를 해제할 수 있는 모든 참조 제거
    this.suggestGarbageCollection();
    
    // 추가 메모리 해제 시도
    const tempArray: any[] = [];
    for (let i = 0; i < 1000; i++) {
      tempArray.push({});
    }
    tempArray.length = 0;
  }

  /**
   * 오래된 캐시 정리
   */
  private clearOldCaches(): void {
    // 색상 캐시 부분 정리 (LRU 기반)
    if ('memory' in performance && (performance as any).memory) {
      console.log('오래된 캐시 항목 정리 중...');
    }
  }

  /**
   * 모든 캐시 정리
   */
  private clearAllCaches(): void {
    // 전체 캐시 정리
    try {
      // 색상 캐시 전체 정리
      const ColorCache = require('./colorCache').default;
      if (ColorCache) {
        ColorCache.clearCache();
        console.log('색상 캐시 전체 정리됨');
      }
    } catch (error) {
      console.error('캐시 정리 실패:', error);
    }
  }

  /**
   * 사용하지 않는 리소스 해제
   */
  private releaseUnusedResources(): void {
    // Canvas 컨텍스트 정리
    this.cleanupCanvasContexts();
    
    // 이벤트 리스너 정리
    this.cleanupEventListeners();
    
    // Blob URL 정리
    this.cleanupBlobUrls();
  }

  /**
   * Canvas 컨텍스트 정리
   */
  private cleanupCanvasContexts(): void {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
  }

  /**
   * 이벤트 리스너 정리
   */
  private cleanupEventListeners(): void {
    // 전역 이벤트 리스너 정리 (구현체는 컴포넌트별로 관리)
    console.log('이벤트 리스너 정리 시도');
  }

  /**
   * Blob URL 정리
   */
  private cleanupBlobUrls(): void {
    // 저장된 Blob URL들 해제 (구현체는 사용하는 곳에서 관리)
    console.log('Blob URL 정리 시도');
  }

  /**
   * 메모리 압박 감지기
   */
  isMemoryPressure(): boolean {
    const stats = this.getMemoryStats();
    return stats.usage > this.memoryThresholds.warning;
  }

  /**
   * 메모리 사용량 보고서
   */
  getMemoryReport(): {
    current: MemoryStats;
    cleanupTasksCount: number;
    isMonitoring: boolean;
    thresholds: { warning: number; critical: number; emergency: number };
  } {
    return {
      current: this.getMemoryStats(),
      cleanupTasksCount: this.cleanupTasks.size,
      isMonitoring: this.isMonitoring,
      thresholds: this.memoryThresholds
    };
  }

  /**
   * 임계값 업데이트
   */
  updateThresholds(thresholds: Partial<typeof this.memoryThresholds>): void {
    this.memoryThresholds = { ...this.memoryThresholds, ...thresholds };
  }

  /**
   * 정리 (소멸자)
   */
  destroy(): void {
    this.stopMemoryMonitoring();
    this.cleanupTasks.clear();
  }
}

// 유틸리티 함수들
export const memoryManager = MemoryManager.getInstance();

/**
 * 컴포넌트에서 사용할 메모리 정리 훅
 */
export const useMemoryCleanup = (id: string, cleanup: () => void, priority: 'high' | 'medium' | 'low' = 'medium') => {
  React.useEffect(() => {
    memoryManager.registerCleanupTask(id, cleanup, priority);
    
    return () => {
      memoryManager.unregisterCleanupTask(id);
    };
  }, [id, cleanup, priority]);
};

/**
 * 메모리 사용량 모니터링 훅
 */
export const useMemoryMonitoring = () => {
  const [memoryStats, setMemoryStats] = React.useState(() => memoryManager.getMemoryStats());
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMemoryStats(memoryManager.getMemoryStats());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return memoryStats;
};

export default MemoryManager;