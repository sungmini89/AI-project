/**
 * @fileoverview 실시간 번역 채팅 애플리케이션의 타입 정의
 *
 * 이 파일은 애플리케이션에서 사용되는 모든 주요 타입과 인터페이스를 정의합니다.
 * 언어, 번역, 채팅 메시지, 사용자, 채팅방 등의 타입을 포함합니다.
 *
 * @author 실시간 번역 채팅 팀
 * @version 1.0.0
 */

// Language and Translation Types

/**
 * 언어 정보를 나타내는 인터페이스
 */
export interface Language {
  /** ISO 639-1 언어 코드 (예: 'ko', 'en', 'ja') */
  code: string;
  /** 영어로 된 언어 이름 (예: 'Korean', 'English', 'Japanese') */
  name: string;
  /** 해당 언어로 된 언어 이름 (예: '한국어', 'English', '日本語') */
  native: string;
}

/**
 * 번역 결과를 나타내는 인터페이스
 */
export interface TranslationResult {
  /** 번역된 텍스트 */
  translatedText: string;
  /** 원본 언어 코드 */
  sourceLanguage: string;
  /** 대상 언어 코드 */
  targetLanguage: string;
  /** 번역 신뢰도 (0-1 사이의 값, 선택 사항) */
  confidence?: number;
  /** 번역을 제공한 서비스 ('mymemory', 'libretranslate', 'offline') */
  provider: "mymemory" | "libretranslate" | "offline";
}

/**
 * 번역 오류를 나타내는 인터페이스
 */
export interface TranslationError {
  /** 오류 코드 */
  code: string;
  /** 오류 메시지 */
  message: string;
  /** 오류가 발생한 번역 서비스 */
  provider: string;
}

// Chat Message Types

/**
 * 채팅 메시지를 나타내는 인터페이스
 */
export interface ChatMessage {
  /** 메시지의 고유 ID */
  id: string;
  /** 메시지를 보낸 사용자의 ID */
  userId: string;
  /** 메시지를 보낸 사용자의 이름 */
  userName: string;
  /** 원본 메시지 텍스트 */
  originalText: string;
  /** 원본 메시지의 언어 코드 */
  originalLanguage: string;
  /** 번역된 텍스트들을 언어 코드별로 저장 (langCode -> translatedText) */
  translations: Record<string, string>;
  /** 메시지가 전송된 타임스탬프 (Unix timestamp) */
  timestamp: number;
  /** 현재 번역 중인지 여부 */
  isTranslating?: boolean;
  /** 번역 오류 메시지 (오류가 발생한 경우) */
  translationError?: string;
  /** 현재 완료된 번역 수 */
  translationProgress?: number;
  /** 총 번역할 언어 수 */
  translationTotal?: number;
  /** 메시지가 전달된 타임스탬프 */
  deliveredAt?: number;
  /** 메시지를 읽은 사용자 ID 목록 */
  readBy?: string[];
}

// User and Room Types

/**
 * 채팅 사용자 정보를 나타내는 인터페이스
 */
export interface ChatUser {
  /** 사용자의 고유 ID */
  uid: string;
  /** 사용자의 표시 이름 */
  displayName: string;
  /** 사용자의 프로필 사진 URL (선택 사항) */
  photoURL?: string;
  /** 사용자가 선호하는 언어 코드 */
  preferredLanguage: string;
  /** 사용자의 온라인 상태 */
  isOnline: boolean;
  /** 사용자가 마지막으로 활동한 타임스탬프 */
  lastSeen: number;
}

/**
 * 채팅방 정보를 나타내는 인터페이스
 */
export interface ChatRoom {
  /** 채팅방의 고유 ID */
  id: string;
  /** 채팅방 이름 */
  name: string;
  /** 채팅방에 참여 중인 사용자 ID 목록 */
  participants: string[];
  /** 채팅방이 생성된 타임스탬프 */
  createdAt: number;
  /** 채팅방이 마지막으로 업데이트된 타임스탬프 */
  updatedAt: number;
  /** 채팅방에서 지원하는 언어 코드 배열 */
  supportedLanguages: string[];
  /** 채팅방을 생성한 사용자 ID (레거시 채팅방과의 호환성을 위해 선택 사항) */
  createdBy?: string;
}

// API Response Types

/**
 * MyMemory 번역 API 응답을 나타내는 인터페이스
 */
export interface MyMemoryResponse {
  responseData: {
    /** 번역된 텍스트 */
    translatedText: string;
    /** 번역 품질 매치 점수 */
    match: number;
  };
  /** 응답 상세 정보 */
  responseDetails: string;
  /** 응답 상태 코드 */
  responseStatus: number;
  /** 번역 매치 목록 (선택 사항) */
  matches?: Array<{
    /** 번역 텍스트 */
    translation: string;
    /** 번역 품질 점수 */
    quality: number;
  }>;
}

/**
 * LibreTranslate 번역 API 응답을 나타내는 인터페이스
 */
export interface LibreTranslateResponse {
  /** 번역된 텍스트 */
  translatedText: string;
}

// Free tier quota management

/**
 * API 사용량 제한 관리를 위한 인터페이스
 */
export interface APIQuota {
  /** API 제공자 이름 */
  provider: string;
  /** 일일 사용 제한 */
  dailyLimit: number;
  /** 현재 사용량 */
  currentUsage: number;
  /** 마지막으로 제한이 초기화된 타임스탬프 */
  lastReset: number;
}

// Translation preferences

/**
 * 번역 설정을 나타내는 인터페이스
 */
export interface TranslationSettings {
  /** 선호하는 번역 서비스 ('auto', 'mymemory', 'libretranslate', 'offline') */
  preferredProvider: "auto" | "mymemory" | "libretranslate" | "offline";
  /** 자동 언어 감지 사용 여부 */
  autoDetectLanguage: boolean;
  /** 오프라인 번역으로 폴백할지 여부 */
  fallbackToOffline: boolean;
  /** 번역 결과 캐싱 사용 여부 */
  cacheTranslations: boolean;
}
