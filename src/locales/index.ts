// i18n 설정 및 초기화
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import koTranslations from './ko';
import enTranslations from './en';

// 번역 리소스
const resources = {
  ko: {
    translation: koTranslations
  },
  en: {
    translation: enTranslations
  }
};

// i18n 초기화
i18n
  .use(LanguageDetector) // 브라우저 언어 자동 감지
  .use(initReactI18next) // React와 연동
  .init({
    resources,
    
    // 기본 언어 설정
    fallbackLng: 'ko', // 한국어를 기본값으로
    lng: undefined, // 자동 감지하도록 설정
    
    // 언어 감지 설정
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    
    // 네임스페이스 설정
    defaultNS: 'translation',
    
    // 보간법 설정
    interpolation: {
      escapeValue: false, // React는 기본적으로 XSS 보호됨
    },
    
    // 개발 모드 설정
    debug: import.meta.env.DEV,
    
    // 키가 없을 때의 동작
    saveMissing: true,
    
    // React Suspense 지원
    react: {
      useSuspense: false, // Suspense를 사용하지 않음 (로딩 상태 직접 관리)
    }
  });

export default i18n;