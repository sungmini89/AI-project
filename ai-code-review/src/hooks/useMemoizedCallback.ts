/**
 * 메모이제이션된 콜백 훅
 * 콜백 함수를 메모이제이션하여 불필요한 리렌더링을 방지
 * @module hooks/useMemoizedCallback
 */

import { useCallback, useRef } from "react";

/**
 * 메모이제이션된 콜백 훅
 * 의존성 배열이 변경될 때만 콜백을 새로 생성하여 성능 최적화
 * @template T - 콜백 함수의 타입
 * @param callback - 메모이제이션할 콜백 함수
 * @param deps - 의존성 배열
 * @returns 메모이제이션된 콜백 함수
 *
 * @example
 * ```tsx
 * const memoizedCallback = useMemoizedCallback(
 *   (id: string) => {
 *     console.log('Processing:', id);
 *     return processData(id);
 *   },
 *   [processData]
 * );
 * ```
 */
export function useMemoizedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList
): T {
  const ref = useRef<T>(callback);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedCallback = useCallback(callback, deps);

  ref.current = memoizedCallback;

  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args);
  }, []) as T;
}
