import { type ClassValue, clsx } from "clsx";

/**
 * 조건부 CSS 클래스를 결합하는 유틸리티 함수
 * @description clsx를 래핑하여 Tailwind CSS와 조건부 스타일링을 쉽게 처리합니다
 * @param {...ClassValue} inputs - 결합할 CSS 클래스들
 * @returns {string} 결합된 CSS 클래스 문자열
 * @example
 * cn("base-class", condition && "conditional-class", { "object-class": isActive })
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * 고유한 ID 문자열을 생성하는 함수
 * @description Math.random()을 이용해 9자리 임의 문자열을 생성합니다
 * @returns {string} 생성된 고유 ID
 * @example
 * const taskId = generateId(); // "abc123def"
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * 날짜를 한국어 형식으로 포맷팅하는 함수
 * @description 다양한 형식으로 날짜를 표시할 수 있습니다
 * @param {Date} date - 포맷팅할 날짜
 * @param {"short" | "long" | "time"} format - 표시 형식
 * @returns {string} 포맷팅된 날짜 문자열
 * @example
 * formatDate(new Date(), "short")   // "2024/01/15"
 * formatDate(new Date(), "long")    // "2024년 1월 15일 월요일"
 * formatDate(new Date(), "time")    // "14:30"
 */
export function formatDate(
  date: Date,
  format: "short" | "long" | "time" = "short"
): string {
  if (format === "time") {
    return new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  if (format === "long") {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date);
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
}

export function isToday(date: Date | undefined): boolean {
  if (!date) return false;

  // date가 Date 객체가 아닌 경우 Date 객체로 변환
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === "string" || typeof date === "number") {
    dateObj = new Date(date);
  } else {
    return false;
  }

  // 유효한 날짜인지 확인
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

export function isTomorrow(date: Date | undefined): boolean {
  if (!date) return false;

  // date가 Date 객체가 아닌 경우 Date 객체로 변환
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === "string" || typeof date === "number") {
    dateObj = new Date(date);
  } else {
    return false;
  }

  // 유효한 날짜인지 확인
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    dateObj.getDate() === tomorrow.getDate() &&
    dateObj.getMonth() === tomorrow.getMonth() &&
    dateObj.getFullYear() === tomorrow.getFullYear()
  );
}

export function isOverdue(date: Date | undefined): boolean {
  if (!date) return false;

  // date가 Date 객체가 아닌 경우 Date 객체로 변환
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === "string" || typeof date === "number") {
    dateObj = new Date(date);
  } else {
    return false;
  }

  // 유효한 날짜인지 확인
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  return dateObj < new Date() && !isToday(date);
}

export function isThisWeek(date: Date | undefined): boolean {
  if (!date) return false;

  // date가 Date 객체가 아닌 경우 Date 객체로 변환
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === "string" || typeof date === "number") {
    dateObj = new Date(date);
  } else {
    return false;
  }

  // 유효한 날짜인지 확인
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  const now = new Date();
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay()
  );
  const endOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + (6 - now.getDay())
  );

  return dateObj >= startOfWeek && dateObj <= endOfWeek;
}

export function isThisMonth(date: Date | undefined): boolean {
  if (!date) return false;

  // date가 Date 객체가 아닌 경우 Date 객체로 변환
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === "string" || typeof date === "number") {
    dateObj = new Date(date);
  } else {
    return false;
  }

  // 유효한 날짜인지 확인
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  const now = new Date();
  return (
    dateObj.getMonth() === now.getMonth() &&
    dateObj.getFullYear() === now.getFullYear()
  );
}

export function getRelativeTimeString(date: Date | undefined): string {
  if (!date) return "날짜 없음";

  // date가 Date 객체가 아닌 경우 Date 객체로 변환
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === "string" || typeof date === "number") {
    dateObj = new Date(date);
  } else {
    return "날짜 없음";
  }

  // 유효한 날짜인지 확인
  if (isNaN(dateObj.getTime())) {
    return "유효하지 않은 날짜";
  }

  if (isToday(dateObj)) {
    return "오늘";
  }

  if (isTomorrow(dateObj)) {
    return "내일";
  }

  if (isOverdue(dateObj)) {
    const daysDiff = Math.floor(
      (new Date().getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${daysDiff}일 전`;
  }

  const daysDiff = Math.floor(
    (dateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff <= 7) {
    return `${daysDiff}일 후`;
  }

  return formatDate(dateObj);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function parseTimeFromString(text: string): number | undefined {
  const timeRegex = /(\d+)\s*(시간|분|hour|minute|h|m)/gi;
  const matches = [...text.matchAll(timeRegex)];

  let totalMinutes = 0;

  for (const match of matches) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    if (unit.includes("시간") || unit.includes("hour") || unit === "h") {
      totalMinutes += value * 60;
    } else if (unit.includes("분") || unit.includes("minute") || unit === "m") {
      totalMinutes += value;
    }
  }

  return totalMinutes > 0 ? totalMinutes : undefined;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
