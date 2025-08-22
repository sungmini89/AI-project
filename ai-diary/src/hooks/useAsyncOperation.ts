import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook to handle async operations with proper cleanup
 * Prevents memory leaks and race conditions
 */
export function useAsyncOperation() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeAsync = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
      try {
        const result = await asyncFn();
        if (isMountedRef.current) {
          return result;
        }
        return null;
      } catch (error) {
        if (isMountedRef.current) {
          throw error;
        }
        return null;
      }
    },
    []
  );

  const isMounted = useCallback(() => isMountedRef.current, []);

  return { safeAsync, isMounted };
}

/**
 * Hook for debounced async operations
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

