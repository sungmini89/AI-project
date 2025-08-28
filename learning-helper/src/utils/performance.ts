import React, { useCallback, useRef, useEffect } from 'react';

// 메모이제이션 캐시
class MemoCache<K, V> {
  private cache = new Map<string, { value: V; timestamp: number; hits: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize = 100, ttlMs = 5 * 60 * 1000) { // 기본 5분 TTL
    this.maxSize = maxSize;
    this.ttl = ttlMs;
  }

  private getKey(key: K): string {
    return typeof key === 'string' ? key : JSON.stringify(key);
  }

  get(key: K): V | undefined {
    const keyStr = this.getKey(key);
    const item = this.cache.get(keyStr);
    
    if (!item) return undefined;
    
    // TTL 체크
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(keyStr);
      return undefined;
    }
    
    item.hits++;
    return item.value;
  }

  set(key: K, value: V): void {
    const keyStr = this.getKey(key);
    
    // 캐시 크기 제한
    if (this.cache.size >= this.maxSize && !this.cache.has(keyStr)) {
      this.evictOldest();
    }
    
    this.cache.set(keyStr, {
      value,
      timestamp: Date.now(),
      hits: 1
    });
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, item] of this.cache) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate()
    };
  }

  private calculateHitRate(): number {
    let totalHits = 0;
    let totalAccess = 0;
    
    for (const item of this.cache.values()) {
      totalHits += item.hits - 1; // 첫 set은 miss
      totalAccess += item.hits;
    }
    
    return totalAccess > 0 ? totalHits / totalAccess : 0;
  }
}

// 전역 캐시 인스턴스들
const textProcessingCache = new MemoCache<string, any>(50, 10 * 60 * 1000); // 10분
const aiResponseCache = new MemoCache<string, any>(30, 30 * 60 * 1000); // 30분
const flashcardCache = new MemoCache<string, any>(100, 60 * 60 * 1000); // 1시간

// 메모이제이션 데코레이터/함수
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  cacheInstance?: MemoCache<string, ReturnType<T>>,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = cacheInstance || new MemoCache<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// React 성능 최적화 훅들
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttleRef = useRef<number>();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    ((...args) => {
      if (throttleRef.current) return;
      
      throttleRef.current = window.setTimeout(() => {
        throttleRef.current = undefined;
      }, delay);
      
      return callbackRef.current(...args);
    }) as T,
    [delay]
  );
}

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

export function useDeepMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const depsRef = useRef<React.DependencyList>();
  const valueRef = useRef<T>();

  const depsChanged = !depsRef.current || 
    deps.length !== depsRef.current.length ||
    deps.some((dep, index) => 
      !Object.is(dep, depsRef.current![index])
    );

  if (depsChanged) {
    depsRef.current = deps;
    valueRef.current = factory();
  }

  return valueRef.current!;
}

// 성능 모니터링
export class PerformanceMonitor {
  private static measurements = new Map<string, number[]>();

  static measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    
    try {
      const result = fn();
      
      if (result instanceof Promise) {
        return result.finally(() => {
          this.recordMeasurement(name, performance.now() - start);
        }) as unknown as T;
      }
      
      this.recordMeasurement(name, performance.now() - start);
      return result;
    } catch (error) {
      this.recordMeasurement(name, performance.now() - start);
      throw error;
    }
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      this.recordMeasurement(name, performance.now() - start);
      return result;
    } catch (error) {
      this.recordMeasurement(name, performance.now() - start);
      throw error;
    }
  }

  private static recordMeasurement(name: string, duration: number): void {
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    
    const measurements = this.measurements.get(name)!;
    measurements.push(duration);
    
    // 최대 100개 측정값 유지
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  static getStats(name: string) {
    const measurements = this.measurements.get(name) || [];
    
    if (measurements.length === 0) {
      return null;
    }
    
    const sorted = [...measurements].sort((a, b) => a - b);
    const sum = measurements.reduce((a, b) => a + b, 0);
    
    return {
      count: measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average: sum / measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  static getAllStats() {
    const stats: Record<string, any> = {};
    
    for (const name of this.measurements.keys()) {
      stats[name] = this.getStats(name);
    }
    
    return stats;
  }

  static clear(name?: string): void {
    if (name) {
      this.measurements.delete(name);
    } else {
      this.measurements.clear();
    }
  }
}

// 메모리 사용량 모니터링
export class MemoryMonitor {
  static getUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    
    return null;
  }

  static checkMemoryPressure(): boolean {
    const usage = this.getUsage();
    if (!usage) return false;
    
    return usage.percentage > 80; // 80% 이상 사용시 메모리 부족
  }

  static garbageCollect(): void {
    // 명시적 가비지 컬렉션 (브라우저에서 지원하는 경우)
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }
}

// 캐시 관리
export const CacheManager = {
  textProcessing: textProcessingCache,
  aiResponse: aiResponseCache,
  flashcard: flashcardCache,
  
  clearAll() {
    textProcessingCache.clear();
    aiResponseCache.clear();
    flashcardCache.clear();
  },
  
  getStats() {
    return {
      textProcessing: textProcessingCache.getStats(),
      aiResponse: aiResponseCache.getStats(),
      flashcard: flashcardCache.getStats()
    };
  }
};


// 별도 export 문 제거 - 이미 위에서 export 선언됨