/**
 * @fileoverview 지원되는 언어 상수 및 유틸리티 함수
 *
 * 이 파일은 애플리케이션에서 지원하는 언어 목록과
 * 언어 코드를 기반으로 한 유틸리티 함수들을 정의합니다.
 *
 * @author 실시간 번역 채팅 팀
 * @version 1.0.0
 */

import type { Language } from "@/types";

/**
 * 애플리케이션에서 지원하는 언어 목록
 *
 * @description
 * 각 언어는 ISO 639-1 코드, 영어 이름, 해당 언어로 된 이름을 포함합니다.
 * 현재 14개 언어를 지원합니다.
 */
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "ko", name: "Korean", native: "한국어" },
  { code: "en", name: "English", native: "English" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "zh", name: "Chinese", native: "中文" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "fr", name: "French", native: "Français" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "it", name: "Italian", native: "Italiano" },
  { code: "pt", name: "Portuguese", native: "Português" },
  { code: "ru", name: "Russian", native: "Русский" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "th", name: "Thai", native: "ไทย" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt" },
];

/**
 * 기본적으로 제공되는 언어 코드 배열
 *
 * @description
 * 새로운 채팅방을 생성할 때 기본적으로 선택되는 언어들입니다.
 * 한국어, 영어, 일본어, 중국어를 포함합니다.
 */
export const DEFAULT_LANGUAGES = ["ko", "en", "ja", "zh"];

/**
 * 언어 코드로 Language 객체를 찾습니다
 *
 * @param {string} code - ISO 639-1 언어 코드 (예: 'ko', 'en', 'ja')
 * @returns {Language | undefined} 해당 언어 객체 또는 undefined
 *
 * @example
 * const korean = getLanguageByCode('ko');
 * console.log(korean.native); // '한국어'
 */
export const getLanguageByCode = (code: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
};

/**
 * 언어 코드로 언어 이름을 가져옵니다
 *
 * @param {string} code - ISO 639-1 언어 코드
 * @returns {string} "한국어 (Korean)" 형식의 언어 이름
 *
 * @example
 * const name = getLanguageName('ko'); // '한국어 (Korean)'
 * const name2 = getLanguageName('en'); // 'English (English)'
 */
export const getLanguageName = (code: string): string => {
  const language = getLanguageByCode(code);
  return language
    ? `${language.native} (${language.name})`
    : code.toUpperCase();
};

/**
 * 언어 코드로 해당 언어의 원어 이름을 가져옵니다
 *
 * @param {string} code - ISO 639-1 언어 코드
 * @returns {string} 해당 언어로 된 언어 이름
 *
 * @example
 * const native = getLanguageNativeName('ko'); // '한국어'
 * const native2 = getLanguageNativeName('ja'); // '日本語'
 */
export const getLanguageNativeName = (code: string): string => {
  const language = getLanguageByCode(code);
  return language ? language.native : code.toUpperCase();
};
