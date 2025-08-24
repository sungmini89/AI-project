/**
 * AI Recipe 애플리케이션의 국제화(i18n) 설정
 * 다국어 지원을 위한 i18next 설정과 초기화를 담당합니다.
 * 
 * @description
 * - 한국어(ko)와 영어(en) 지원
 * - 브라우저 언어 자동 감지
 * - localStorage를 통한 언어 설정 저장
 * - React 컴포넌트와의 통합
 * 
 * @features
 * - 언어 자동 감지 (localStorage > navigator > htmlTag 순서)
 * - 기본 언어: 한국어
 * - XSS 보호 비활성화 (React 기본 보호 사용)
 * - Suspense 비활성화로 즉시 언어 변경 반영
 * 
 * @author AI Recipe Team
 * @version 1.0.0
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ko from './locales/ko.json';

/**
 * 지원 언어 리소스 정의
 * 각 언어별 번역 파일을 매핑합니다.
 */
const resources = {
  en: {
    translation: en
  },
  ko: {
    translation: ko
  }
};

/**
 * i18next 인스턴스 초기화 및 설정
 * 언어 감지, React 통합, 보안 설정 등을 구성합니다.
 */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko', // 기본 언어를 한국어로 설정
    debug: false, // 개발 환경에서만 true로 설정

    interpolation: {
      escapeValue: false, // React는 기본적으로 XSS 보호를 제공함
    },

    detection: {
      // 언어 감지 설정
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'ai-recipe-language',
    },

    // 네임스페이스 설정 (중첩된 객체 접근을 위해)
    ns: ['translation'],
    defaultNS: 'translation',

    // 키 구분자 설정
    keySeparator: '.',
    nsSeparator: ':',

    // 언어 변경 시 즉시 반영
    react: {
      useSuspense: false,
    },
  });

export default i18n;