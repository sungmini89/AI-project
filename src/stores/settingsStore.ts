/**
 * 사용자 설정 상태 스토어
 * 테마, 언어, API 설정, 사용자 선호사항 등을 관리
 * @module stores/settingsStore
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
// 언어 설정은 별도 languageStore에서 관리됩니다
import type { UserSettings, APIMode, APIUsage } from "../types";
import config from "../config";
import SecureStorage from "../utils/secureStorage";

/**
 * 설정 상태 인터페이스
 * UserSettings를 확장하여 API 사용량과 액션들을 포함
 */
interface SettingsState extends UserSettings {
  /** API 사용량 추적 */
  apiUsage: APIUsage[];

  /** 액션들 */
  updateSettings: (settings: Partial<UserSettings>) => void;
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (language: "ko" | "en") => void;
  setAPIMode: (mode: APIMode) => void;
  setAPIKey: (provider: string, key: string) => void;
  removeAPIKey: (provider: string) => void;
  getAPIKey: (provider: string) => string | null;
  validateAndSetAPIKey: (provider: string, key: string) => boolean;
  updatePreferences: (
    preferences: Partial<UserSettings["preferences"]>
  ) => void;

  /** API 사용량 관리 */
  recordAPIUsage: (provider: string, requests: number) => void;
  getAPIUsage: (provider: string) => APIUsage | undefined;
  getTodayUsage: (provider: string) => number;
  getMonthlyUsage: (provider: string) => number;
  canUseAPI: (provider: string) => boolean;
  resetDailyUsage: (provider: string) => void;

  /** 유틸리티 */
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
  resetSettings: () => void;
}

/**
 * 기본 설정값
 * 새로운 사용자를 위한 초기 설정
 */
const DEFAULT_SETTINGS: UserSettings = {
  theme: "light",
  language: "ko",
  apiMode: "offline",
  apiKeys: {},
  preferences: {
    autoFormat: true,
    realTimeAnalysis: true,
    showComplexity: true,
    showSecurity: true,
    enableAI: false, // 기본적으로 AI 비활성화 (API 키 필요)
  },
};

/**
 * 설정 상태 관리 스토어
 * Zustand를 사용하여 상태를 관리하고 로컬 스토리지에 지속
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // 초기 설정
      ...DEFAULT_SETTINGS,
      apiUsage: [],

      /**
       * 설정 업데이트
       * @param newSettings - 업데이트할 설정들
       */
      updateSettings: (newSettings: Partial<UserSettings>) => {
        set((state) => ({
          ...state,
          ...newSettings,
        }));
      },

      /**
       * 테마 설정
       * @param theme - 설정할 테마 (light | dark)
       */
      setTheme: (theme: "light" | "dark") => {
        set({ theme });
        document.documentElement.classList.toggle("dark", theme === "dark");
      },

      /**
       * 언어 설정
       * @param language - 설정할 언어 (ko | en)
       */
      setLanguage: (language: "ko" | "en") => {
        set({ language });
        // 언어 설정은 별도 languageStore에서 관리됩니다
      },

      /**
       * API 모드 설정
       * @param apiMode - 설정할 API 모드
       */
      setAPIMode: (apiMode: APIMode) => {
        set({ apiMode });

        // API 모드에 따라 AI 기능 자동 활성화/비활성화
        const state = get();
        if (apiMode === "offline" || apiMode === "mock") {
          set({
            preferences: {
              ...state.preferences,
              enableAI: false,
            },
          });
        } else {
          // free 또는 custom 모드
          if (Object.keys(state.apiKeys).length > 0) {
            set({
              preferences: {
                ...state.preferences,
                enableAI: true,
              },
            });
          }
        }
      },

      /**
       * API 키 설정
       * @param provider - API 제공자
       * @param key - API 키
       */
      setAPIKey: (provider: string, key: string) => {
        // 보안 스토리지에 암호화하여 저장
        SecureStorage.setSecure(`api_key_${provider}`, key);

        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [provider as keyof typeof state.apiKeys]: key,
          },
          // API 키가 설정되면 AI 기능 활성화
          preferences: {
            ...state.preferences,
            enableAI:
              (state.apiMode === "free" || state.apiMode === "custom") &&
              key.length > 0,
          },
        }));
      },

      /**
       * API 키 가져오기
       * @param provider - API 제공자
       * @returns API 키 또는 null
       */
      getAPIKey: (provider: string) => {
        // 보안 스토리지에서 복호화하여 가져오기
        return SecureStorage.getSecure(`api_key_${provider}`);
      },

      /**
       * API 키 검증 및 설정
       * @param provider - API 제공자
       * @param key - API 키
       * @returns 검증 성공 여부
       */
      validateAndSetAPIKey: (provider: string, key: string) => {
        if (!SecureStorage.validateAPIKey(provider, key)) {
          return false;
        }

        get().setAPIKey(provider, key);
        return true;
      },

      /**
       * API 키 제거
       * @param provider - API 제공자
       */
      removeAPIKey: (provider: string) => {
        // 보안 스토리지에서도 삭제
        SecureStorage.removeSecure(`api_key_${provider}`);

        set((state) => {
          const newApiKeys = { ...state.apiKeys };
          delete newApiKeys[provider as keyof typeof state.apiKeys];

          return {
            apiKeys: newApiKeys,
            // API 키가 없으면 AI 기능 비활성화
            preferences: {
              ...state.preferences,
              enableAI:
                Object.keys(newApiKeys).length > 0 &&
                (state.apiMode === "free" || state.apiMode === "custom"),
            },
          };
        });
      },

      /**
       * 선호사항 업데이트
       * @param newPreferences - 업데이트할 선호사항들
       */
      updatePreferences: (
        newPreferences: Partial<UserSettings["preferences"]>
      ) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
          },
        }));
      },

      /**
       * API 사용량 기록
       * @param provider - API 제공자
       * @param requests - 요청 수 (기본값: 1)
       */
      recordAPIUsage: (provider: string, requests: number = 1) => {
        const today = new Date().toDateString();

        set((state) => {
          const existingUsage = state.apiUsage.find(
            (usage) => usage.provider === provider && usage.date === today
          );

          if (existingUsage) {
            return {
              apiUsage: state.apiUsage.map((usage) =>
                usage.provider === provider && usage.date === today
                  ? { ...usage, requests: usage.requests + requests }
                  : usage
              ),
            };
          } else {
            const limit =
              provider === "gemini"
                ? config.api.gemini.dailyLimit
                : provider === "cohere"
                  ? config.api.cohere.monthlyLimit
                  : 1000;

            return {
              apiUsage: [
                ...state.apiUsage,
                {
                  provider,
                  date: today,
                  requests,
                  limit,
                  resetTime: Date.now() + 24 * 60 * 60 * 1000, // 24시간 후
                },
              ],
            };
          }
        });
      },

      /**
       * 특정 제공자의 API 사용량 가져오기
       * @param provider - API 제공자
       * @returns API 사용량 정보 또는 undefined
       */
      getAPIUsage: (provider: string) => {
        const state = get();
        const today = new Date().toDateString();
        return state.apiUsage.find(
          (usage) => usage.provider === provider && usage.date === today
        );
      },

      /**
       * 오늘 사용량 가져오기
       * @param provider - API 제공자
       * @returns 오늘 사용한 요청 수
       */
      getTodayUsage: (provider: string) => {
        const state = get();
        const usage = state.getAPIUsage(provider);
        return usage?.requests || 0;
      },

      /**
       * 이번 달 사용량 가져오기
       * @param provider - API 제공자
       * @returns 이번 달 사용한 총 요청 수
       */
      getMonthlyUsage: (provider: string) => {
        const state = get();
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

        return state.apiUsage
          .filter(
            (usage) =>
              usage.provider === provider && usage.date.startsWith(currentMonth)
          )
          .reduce((total, usage) => total + usage.requests, 0);
      },

      /**
       * API 사용 가능 여부 확인
       * @param provider - API 제공자
       * @returns 사용 가능 여부
       */
      canUseAPI: (provider: string) => {
        const state = get();

        if (provider === "gemini") {
          const todayUsage = state.getTodayUsage(provider);
          return todayUsage < config.api.gemini.dailyLimit;
        }

        if (provider === "cohere") {
          const monthlyUsage = state.getMonthlyUsage(provider);
          return monthlyUsage < config.api.cohere.monthlyLimit;
        }

        return true;
      },

      /**
       * 일일 사용량 리셋
       * @param provider - API 제공자
       */
      resetDailyUsage: (provider: string) => {
        set((state) => ({
          apiUsage: state.apiUsage.filter(
            (usage) =>
              !(
                usage.provider === provider &&
                usage.date === new Date().toDateString()
              )
          ),
        }));
      },

      /**
       * 설정 내보내기
       * @returns JSON 형태의 설정 문자열
       */
      exportSettings: () => {
        const state = get();
        const exportData = {
          theme: state.theme,
          language: state.language,
          apiMode: state.apiMode,
          preferences: state.preferences,
          // API 키는 보안상 제외
          exportedAt: new Date().toISOString(),
        };

        return JSON.stringify(exportData, null, 2);
      },

      /**
       * 설정 가져오기
       * @param settingsJson - JSON 형태의 설정 문자열
       * @returns 가져오기 성공 여부
       */
      importSettings: (settingsJson: string) => {
        try {
          const importedSettings = JSON.parse(settingsJson);

          set((state) => ({
            ...state,
            theme: importedSettings.theme || state.theme,
            language: importedSettings.language || state.language,
            apiMode: importedSettings.apiMode || state.apiMode,
            preferences: {
              ...state.preferences,
              ...importedSettings.preferences,
            },
          }));

          return true;
        } catch (error) {
          console.error("설정 가져오기 실패:", error);
          return false;
        }
      },

      /**
       * 설정 초기화
       * 모든 설정을 기본값으로 되돌림
       */
      resetSettings: () => {
        // 보안 스토리지의 API 키들도 모두 삭제
        SecureStorage.clearAll();

        set({
          ...DEFAULT_SETTINGS,
          apiUsage: [], // 사용량도 리셋
        });

        // DOM 테마도 리셋
        document.documentElement.classList.remove("dark");
      },
    }),
    {
      name: config.storage.keys.userSettings,
      version: 1,
      partialize: (state) => ({
        // 민감한 정보(API 키) 제외하고 저장 - 보안 스토리지 사용
        theme: state.theme,
        language: state.language,
        apiMode: state.apiMode,
        preferences: state.preferences,
        apiUsage: state.apiUsage,
        // API 키는 SecureStorage에서 암호화하여 별도 관리
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 복원 후 테마 적용
          const theme = state.theme;
          document.documentElement.classList.toggle("dark", theme === "dark");

          // 언어 설정은 별도 languageStore에서 관리됩니다
        }
      },
    }
  )
);
