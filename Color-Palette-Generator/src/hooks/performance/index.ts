/**
 * 성능 최적화 훅 통합 인덱스
 * - 모든 성능 관련 훅 export
 * - 편의 함수 제공
 * - 타입 정의 통합
 */

// 성능 최적화 훅들
export { useOptimizedPalette } from './useOptimizedPalette';
export { useImageOptimization } from './useImageOptimization';
export { 
  useVirtualization, 
  useLazyLoading, 
  useInfiniteScroll, 
  useDynamicVirtualization 
} from './useVirtualization';

// 성능 관련 유틸리티
export { 
  performanceMonitor,
  usePerformanceMonitoring,
  useColorGenerationPerformance
} from '../../utils/performance/performanceMonitor';

export { 
  memoryManager,
  useMemoryCleanup,
  useMemoryMonitoring
} from '../../utils/performance/memoryManager';

export { ColorCache } from '../../utils/performance/colorCache';
export { default as OptimizedColorUtils } from '../../utils/performance/optimizedColorUtils';

// 추가 성능 최적화 훅들

/**
 * 디바운스된 값 반환 훅
 */
import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * 쓰로틀된 함수 반환 훅
 */
import { useCallback, useRef } from 'react';

export const useThrottle = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef<number>(0);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastRun.current >= delay) {
      lastRun.current = now;
      callback(...args);
    }
  }, [callback, delay]) as T;
};

/**
 * RAF 기반 애니메이션 훅
 */
export const useRAF = (callback: (deltaTime: number) => void, deps: React.DependencyList) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  
  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, deps);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, deps);
};

/**
 * 선택적 리렌더링 훅
 */
import { useMemo, useRef as useRefImport } from 'react';

export const useSelectiveUpdate = <T extends object>(
  data: T,
  selector: (data: T) => any
) => {
  const selectorRef = useRefImport(selector);
  selectorRef.current = selector;

  return useMemo(() => {
    return selectorRef.current(data);
  }, [data]);
};

/**
 * 지연된 상태 업데이트 훅
 */
export const useDeferredValue = <T>(value: T, timeout: number = 5000): T => {
  const [deferredValue, setDeferredValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 즉시 업데이트할지 지연할지 결정
    const shouldDefer = typeof value === 'object' && value !== null;
    
    if (shouldDefer) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setDeferredValue(value);
      }, timeout);
    } else {
      setDeferredValue(value);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, timeout]);

  return deferredValue;
};

/**
 * 비용이 많이 드는 계산 최적화 훅
 */
export const useExpensiveCalculation = <T, K extends readonly unknown[]>(
  calculateFn: (...args: K) => T,
  dependencies: K,
  options: {
    cacheSize?: number;
    shouldRecalculate?: (prev: K, current: K) => boolean;
  } = {}
): T => {
  const { cacheSize = 10, shouldRecalculate } = options;
  const cache = useRefImport<Map<string, T>>(new Map()).current;
  const lastDeps = useRefImport<K>();

  return useMemo(() => {
    // 의존성 변경 체크
    if (shouldRecalculate && lastDeps.current) {
      if (!shouldRecalculate(lastDeps.current, dependencies)) {
        const cacheKey = JSON.stringify(lastDeps.current);
        const cached = cache.get(cacheKey);
        if (cached !== undefined) {
          return cached;
        }
      }
    }

    // 캐시 체크
    const cacheKey = JSON.stringify(dependencies);
    const cached = cache.get(cacheKey);
    
    if (cached !== undefined) {
      return cached;
    }

    // 새 계산
    const result = calculateFn(...dependencies);
    
    // 캐시 저장 (크기 제한)
    if (cache.size >= cacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    cache.set(cacheKey, result);
    lastDeps.current = dependencies;
    
    return result;
  }, dependencies);
};

/**
 * 웹워커 훅
 */
export const useWebWorker = <T, R>(
  workerFunction: (data: T) => R,
  dependencies: React.DependencyList = []
) => {
  const [result, setResult] = useState<R | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const workerRef = useRefImport<Worker | null>(null);

  const runWorker = useCallback((data: T) => {
    if (typeof Worker === 'undefined') {
      // Web Worker가 지원되지 않는 경우 동기 실행
      try {
        setIsLoading(true);
        const syncResult = workerFunction(data);
        setResult(syncResult);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '계산 실패');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    const workerCode = `
      self.onmessage = function(e) {
        try {
          const workerFunction = ${workerFunction.toString()};
          const result = workerFunction(e.data);
          self.postMessage({ success: true, result });
        } catch (error) {
          self.postMessage({ success: false, error: error.message });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerURL = URL.createObjectURL(blob);
    const worker = new Worker(workerURL);

    worker.onmessage = (e) => {
      const { success, result: workerResult, error: workerError } = e.data;
      
      if (success) {
        setResult(workerResult);
      } else {
        setError(workerError);
      }
      
      setIsLoading(false);
      worker.terminate();
      URL.revokeObjectURL(workerURL);
    };

    worker.onerror = () => {
      setError('웹워커 실행 실패');
      setIsLoading(false);
      worker.terminate();
    };

    worker.postMessage(data);
    workerRef.current = worker;
  }, dependencies);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  return {
    result,
    error,
    isLoading,
    runWorker
  };
};

/**
 * 성능 프로파일링 훅
 */
export const useProfiler = (name: string) => {
  const startTimeRef = useRefImport<number>(0);
  const measurementsRef = useRefImport<number[]>([]);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const end = useCallback(() => {
    const duration = performance.now() - startTimeRef.current;
    measurementsRef.current.push(duration);
    
    // 최대 100개 측정값 유지
    if (measurementsRef.current.length > 100) {
      measurementsRef.current.shift();
    }

    console.log(`[Profiler] ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }, [name]);

  const getStats = useCallback(() => {
    const measurements = measurementsRef.current;
    if (measurements.length === 0) return null;

    const sum = measurements.reduce((a, b) => a + b, 0);
    const avg = sum / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return { avg, min, max, count: measurements.length };
  }, []);

  const clear = useCallback(() => {
    measurementsRef.current = [];
  }, []);

  return { start, end, getStats, clear };
};