/**
 * @fileoverview 유틸리티 함수 모음
 * @description 애플리케이션에서 공통으로 사용되는 유틸리티 함수들을 제공합니다.
 * 주로 CSS 클래스 결합과 Tailwind CSS 클래스 병합에 사용됩니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * CSS 클래스 이름을 결합하고 병합하는 유틸리티 함수
 * @description clsx와 tailwind-merge를 사용하여 CSS 클래스들을 안전하게 결합합니다.
 * 중복되는 클래스나 충돌하는 클래스들을 자동으로 처리합니다.
 *
 * @param {...ClassValue[]} inputs - 결합할 CSS 클래스들
 * @returns {string} 결합된 CSS 클래스 문자열
 *
 * @example
 * ```tsx
 * // 기본 사용법
 * const className = cn('text-red-500', 'bg-blue-500');
 *
 * // 조건부 클래스
 * const buttonClass = cn(
 *   'px-4 py-2 rounded',
 *   isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
 * );
 *
 * // Tailwind 클래스 충돌 해결
 * const textClass = cn('text-red-500', 'text-blue-500'); // 'text-blue-500'만 적용됨
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
