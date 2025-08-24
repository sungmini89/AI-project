// 타입 캐스팅 헬퍼 함수들

export function safeNumber(value: number | undefined): number | undefined {
  return value !== undefined ? value : undefined
}

export function safeString(value: string | undefined): string | undefined {
  return value !== undefined && value !== null ? value : undefined
}

export function safeArray<T>(value: T[] | undefined): T[] | undefined {
  return value !== undefined && Array.isArray(value) ? value : undefined
}