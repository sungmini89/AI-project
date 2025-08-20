/**
 * 언어 관리 훅
 * 다국어 지원을 위한 언어 설정과 텍스트 가져오기 기능
 * @module hooks/useLanguage
 */

import { useLanguageStore } from "../stores/languageStore";

/**
 * 언어 관리 훅
 * 현재 언어, 텍스트, 언어 변경 함수 등을 제공
 * @returns 언어 관련 상태와 함수들
 *
 * @example
 * ```tsx
 * const { currentLanguage, t, setLanguage, isKorean } = useLanguage();
 *
 * return (
 *   <div>
 *     <h1>{t('common.title')}</h1>
 *     <button onClick={() => setLanguage('en')}>
 *       {isKorean ? 'English' : '한국어'}
 *     </button>
 *   </div>
 * );
 * ```
 */
export const useLanguage = () => {
  const { currentLanguage, texts, setLanguage, getText } = useLanguageStore();

  /** 텍스트 가져오기 (간단한 버전) */
  const t = (path: string) => getText(path);

  /** 현재 언어 확인 */
  const isKorean = currentLanguage === "ko";
  const isEnglish = currentLanguage === "en";

  return {
    currentLanguage,
    texts,
    setLanguage,
    t,
    isKorean,
    isEnglish,
  };
};
