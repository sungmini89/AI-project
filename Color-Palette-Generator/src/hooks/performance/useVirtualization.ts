/**
 * 가상화 렌더링 훅
 * - 대량 팔레트 목록 최적화
 * - Intersection Observer 기반 지연 렌더링
 * - 메모리 효율적 리스트 관리
 * - 스크롤 성능 최적화
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { memoryManager } from '../../utils/performance/memoryManager';

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // 버퍼 항목 수
  threshold?: number; // Intersection Observer 임계값
}

interface VirtualItem<T> {
  index: number;
  data: T;
  isVisible: boolean;
  offsetTop: number;
  height: number;
}

export const useVirtualization = <T>(
  items: T[],
  options: VirtualizationOptions
) => {
  const {
    itemHeight,
    containerHeight,
    overscan = 3,
    threshold = 0.1
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

  // 가시 영역 계산
  const calculateVisibleRange = useCallback(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { start: startIndex, end: endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // 가상화된 항목 생성
  const virtualItems = useMemo<VirtualItem<T>[]>(() => {
    const range = calculateVisibleRange();
    const virtual: VirtualItem<T>[] = [];

    for (let i = range.start; i <= range.end; i++) {
      if (i < items.length) {
        virtual.push({
          index: i,
          data: items[i],
          isVisible: true,
          offsetTop: i * itemHeight,
          height: itemHeight
        });
      }
    }

    return virtual;
  }, [items, calculateVisibleRange, itemHeight]);

  // 스크롤 핸들러 (쓰로틀링 적용)
  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    const newScrollTop = target.scrollTop;
    
    // RAF로 성능 최적화
    requestAnimationFrame(() => {
      setScrollTop(newScrollTop);
    });
  }, []);

  // Intersection Observer 설정
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          const element = itemRefs.current.get(index);
          
          if (element) {
            element.style.visibility = entry.isIntersecting ? 'visible' : 'hidden';
          }
        });
      },
      {
        root: containerRef.current,
        rootMargin: '50px',
        threshold
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold]);

  // 스크롤 이벤트 등록
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // 가시 영역 업데이트
  useEffect(() => {
    const range = calculateVisibleRange();
    setVisibleRange(range);
  }, [calculateVisibleRange]);

  // 메모리 정리 작업 등록
  useEffect(() => {
    const cleanupId = `virtualization-${Date.now()}`;
    
    memoryManager.registerCleanupTask(cleanupId, () => {
      observerRef.current?.disconnect();
      itemRefs.current.clear();
    }, 'low');

    return () => {
      memoryManager.unregisterCleanupTask(cleanupId);
    };
  }, []);

  // 항목 참조 등록
  const registerItem = useCallback((index: number, element: HTMLElement | null) => {
    if (element) {
      itemRefs.current.set(index, element);
      observerRef.current?.observe(element);
    } else {
      const existingElement = itemRefs.current.get(index);
      if (existingElement) {
        observerRef.current?.unobserve(existingElement);
        itemRefs.current.delete(index);
      }
    }
  }, []);

  // 특정 항목으로 스크롤
  const scrollToItem = useCallback((index: number) => {
    if (!containerRef.current) return;

    const offsetTop = index * itemHeight;
    containerRef.current.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }, [itemHeight]);

  // 전체 컨테이너 높이
  const totalHeight = items.length * itemHeight;

  // 스크롤 진행률
  const scrollProgress = totalHeight > containerHeight 
    ? scrollTop / (totalHeight - containerHeight)
    : 0;

  return {
    containerRef,
    virtualItems,
    registerItem,
    scrollToItem,
    visibleRange,
    totalHeight,
    scrollProgress,
    isScrolling: scrollTop > 0
  };
};

/**
 * 지연 로딩 훅 (Lazy Loading)
 */
export const useLazyLoading = <T>(
  items: T[],
  pageSize: number = 20,
  threshold: number = 0.8
) => {
  const [loadedCount, setLoadedCount] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 더 많은 항목 로드
  const loadMore = useCallback(() => {
    if (isLoading || loadedCount >= items.length) return;

    setIsLoading(true);
    
    // 비동기 로딩 시뮬레이션 (실제로는 API 호출 등)
    setTimeout(() => {
      setLoadedCount(prev => Math.min(prev + pageSize, items.length));
      setIsLoading(false);
    }, 100);
  }, [isLoading, loadedCount, items.length, pageSize]);

  // Intersection Observer로 자동 로딩
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoading) {
            loadMore();
          }
        });
      },
      { threshold }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [loadMore, isLoading, threshold]);

  const loadedItems = items.slice(0, loadedCount);
  const hasMore = loadedCount < items.length;

  return {
    loadedItems,
    isLoading,
    hasMore,
    loadMore,
    sentinelRef
  };
};

/**
 * 무한 스크롤 훅
 */
export const useInfiniteScroll = <T>(
  fetchMore: (page: number) => Promise<T[]>,
  pageSize: number = 20
) => {
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 다음 페이지 로드
  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const newData = await fetchMore(nextPage);
      
      if (newData.length < pageSize) {
        setHasMore(false);
      }

      setData(prev => [...prev, ...newData]);
      setCurrentPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 로드 실패');
    } finally {
      setIsLoading(false);
    }
  }, [fetchMore, currentPage, isLoading, hasMore, pageSize]);

  // 데이터 초기화
  const reset = useCallback(() => {
    setData([]);
    setCurrentPage(0);
    setHasMore(true);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    hasMore,
    error,
    loadNextPage,
    reset
  };
};

/**
 * 동적 높이 가상화 훅 (고급)
 */
export const useDynamicVirtualization = <T>(
  items: T[],
  estimatedItemHeight: number,
  containerHeight: number
) => {
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());
  const [scrollTop] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<ResizeObserver | null>(null);

  // 실제 높이 측정
  const measureItem = useCallback((index: number, element: HTMLElement) => {
    const height = element.getBoundingClientRect().height;
    
    setItemHeights(prev => {
      const newMap = new Map(prev);
      newMap.set(index, height);
      return newMap;
    });
  }, []);

  // ResizeObserver 설정
  useEffect(() => {
    measurerRef.current = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const index = parseInt(entry.target.getAttribute('data-index') || '0');
        const height = entry.contentRect.height;
        
        setItemHeights(prev => {
          const newMap = new Map(prev);
          newMap.set(index, height);
          return newMap;
        });
      });
    });

    return () => measurerRef.current?.disconnect();
  }, []);

  // 항목별 오프셋 계산
  const getItemOffset = useCallback((index: number): number => {
    let offset = 0;
    
    for (let i = 0; i < index; i++) {
      offset += itemHeights.get(i) || estimatedItemHeight;
    }
    
    return offset;
  }, [itemHeights, estimatedItemHeight]);

  // 가시 영역 항목 계산
  const getVisibleItems = useCallback(() => {
    const visible: Array<{ index: number; data: T; offsetTop: number; height: number }> = [];
    let currentOffset = 0;
    
    for (let i = 0; i < items.length; i++) {
      const height = itemHeights.get(i) || estimatedItemHeight;
      
      // 가시 영역 체크
      if (currentOffset + height > scrollTop && currentOffset < scrollTop + containerHeight) {
        visible.push({
          index: i,
          data: items[i],
          offsetTop: currentOffset,
          height
        });
      }
      
      currentOffset += height;
      
      // 가시 영역을 벗어나면 중단
      if (currentOffset > scrollTop + containerHeight + 200) break;
    }
    
    return visible;
  }, [items, itemHeights, estimatedItemHeight, scrollTop, containerHeight]);

  const visibleItems = getVisibleItems();
  const totalHeight = items.reduce((sum, _, index) => 
    sum + (itemHeights.get(index) || estimatedItemHeight), 0
  );

  return {
    containerRef,
    visibleItems,
    totalHeight,
    measureItem,
    getItemOffset
  };
};