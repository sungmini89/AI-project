/**
 * 디바운스 훅
 * 연속된 값 변경을 일정 시간 지연시켜 성능 최적화
 * @module hooks/useDebounce
 */

import { useEffect, useState } from "react";

/**
 * 디바운스 훅
 * 연속된 값 변경을 지연시켜 불필요한 API 호출이나 렌더링을 방지
 * @template T - 디바운스할 값의 타입
 * @param value - 디바운스할 값
 * @param delay - 지연 시간 (밀리초)
 * @returns 디바운스된 값
 *
 * @example
 * ```tsx
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     performSearch(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
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
}
