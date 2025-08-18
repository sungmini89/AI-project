// 사용자 설정 상태 스토어

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings, APIMode, APIUsage } from '../types';
import config from '../config';

interface SettingsState extends UserSettings {
  // API 사용량 추적
  apiUsage: APIUsage[];
  
  // 액션들
  updateSettings: (settings: Partial<UserSettings>) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'ko' | 'en') => void;
  setAPIMode: (mode: APIMode) => void;
  setAPIKey: (provider: string, key: string) => void;
  removeAPIKey: (provider: string) => void;
  updatePreferences: (preferences: Partial<UserSettings['preferences']>) => void;
  
  // API 사용량 관리
  recordAPIUsage: (provider: string, requests: number) => void;
  getAPIUsage: (provider: string) => APIUsage | undefined;
  getTodayUsage: (provider: string) => number;
  getMonthlyUsage: (provider: string) => number;
  canUseAPI: (provider: string) => boolean;
  resetDailyUsage: (provider: string) => void;
  
  // 유틸리티
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  language: 'ko',
  apiMode: 'offline',
  apiKeys: {},
  preferences: {
    autoFormat: true,
    realTimeAnalysis: true,
    showComplexity: true,
    showSecurity: true,
    enableAI: false // 기본적으로 AI 비활성화 (API 키 필요)
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // 초기 설정
      ...DEFAULT_SETTINGS,
      apiUsage: [],

      // 설정 업데이트
      updateSettings: (newSettings: Partial<UserSettings>) => {
        set((state) => ({
          ...state,
          ...newSettings
        }));
      },

      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
        
        // 시스템 테마인 경우 실제 테마 적용
        if (theme === 'system') {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', isDark);
        } else {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },

      setLanguage: (language: 'ko' | 'en') => {
        set({ language });
      },

      setAPIMode: (apiMode: APIMode) => {
        set({ apiMode });
        
        // API 모드에 따라 AI 기능 자동 활성화/비활성화
        const state = get();
        if (apiMode === 'offline' || apiMode === 'mock') {
          set({
            preferences: {
              ...state.preferences,
              enableAI: false
            }
          });
        } else {
          // free 또는 custom 모드
          if (Object.keys(state.apiKeys).length > 0) {
            set({
              preferences: {
                ...state.preferences,
                enableAI: true
              }
            });
          }
        }
      },

      setAPIKey: (provider: string, key: string) => {
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [provider as keyof typeof state.apiKeys]: key
          },
          // API 키가 설정되면 AI 기능 활성화  
          preferences: {
            ...state.preferences,
            enableAI: (state.apiMode === 'free' || state.apiMode === 'custom') && key.length > 0
          }
        }));
      },

      removeAPIKey: (provider: string) => {
        set((state) => {
          const newApiKeys = { ...state.apiKeys };
          delete newApiKeys[provider as keyof typeof state.apiKeys];
          
          return {
            apiKeys: newApiKeys,
            // API 키가 없으면 AI 기능 비활성화
            preferences: {
              ...state.preferences,
              enableAI: Object.keys(newApiKeys).length > 0 && 
                       (state.apiMode === 'free' || state.apiMode === 'custom')
            }
          };
        });
      },

      updatePreferences: (newPreferences: Partial<UserSettings['preferences']>) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences
          }
        }));
      },

      // API 사용량 관리
      recordAPIUsage: (provider: string, requests: number = 1) => {
        const today = new Date().toDateString();
        
        set((state) => {
          const existingUsage = state.apiUsage.find(
            usage => usage.provider === provider && usage.date === today
          );

          if (existingUsage) {
            return {
              apiUsage: state.apiUsage.map(usage =>
                usage.provider === provider && usage.date === today
                  ? { ...usage, requests: usage.requests + requests }
                  : usage
              )
            };
          } else {
            const limit = provider === 'gemini' 
              ? config.api.gemini.dailyLimit
              : provider === 'cohere'
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
                  resetTime: Date.now() + (24 * 60 * 60 * 1000) // 24시간 후
                }
              ]
            };
          }
        });
      },

      getAPIUsage: (provider: string) => {
        const state = get();
        const today = new Date().toDateString();
        return state.apiUsage.find(
          usage => usage.provider === provider && usage.date === today
        );
      },

      getTodayUsage: (provider: string) => {
        const state = get();
        const usage = state.getAPIUsage(provider);
        return usage?.requests || 0;
      },

      getMonthlyUsage: (provider: string) => {
        const state = get();
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        
        return state.apiUsage
          .filter(usage => 
            usage.provider === provider && 
            usage.date.startsWith(currentMonth)
          )
          .reduce((total, usage) => total + usage.requests, 0);
      },

      canUseAPI: (provider: string) => {
        const state = get();
        
        if (provider === 'gemini') {
          const todayUsage = state.getTodayUsage(provider);
          return todayUsage < config.api.gemini.dailyLimit;
        }
        
        if (provider === 'cohere') {
          const monthlyUsage = state.getMonthlyUsage(provider);
          return monthlyUsage < config.api.cohere.monthlyLimit;
        }
        
        return true;
      },

      resetDailyUsage: (provider: string) => {
        set((state) => ({
          apiUsage: state.apiUsage.filter(
            usage => !(usage.provider === provider && usage.date === new Date().toDateString())
          )
        }));
      },

      // 유틸리티 함수
      exportSettings: () => {
        const state = get();
        const exportData = {
          theme: state.theme,
          language: state.language,
          apiMode: state.apiMode,
          preferences: state.preferences,
          // API 키는 보안상 제외
          exportedAt: new Date().toISOString()
        };
        
        return JSON.stringify(exportData, null, 2);
      },

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
              ...importedSettings.preferences
            }
          }));
          
          return true;
        } catch (error) {
          console.error('설정 가져오기 실패:', error);
          return false;
        }
      },

      resetSettings: () => {
        set({
          ...DEFAULT_SETTINGS,
          apiUsage: [] // 사용량도 리셋
        });
        
        // DOM 테마도 리셋
        document.documentElement.classList.remove('dark');
      }
    }),
    {
      name: config.storage.keys.userSettings,
      version: 1,
      partialize: (state) => ({
        // 민감한 정보 제외하고 저장
        theme: state.theme,
        language: state.language,
        apiMode: state.apiMode,
        preferences: state.preferences,
        apiUsage: state.apiUsage,
        // API 키는 별도 저장소에서 관리 (보안)
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 복원 후 테마 적용
          const theme = state.theme;
          if (theme === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', isDark);
          } else {
            document.documentElement.classList.toggle('dark', theme === 'dark');
          }
        }
      }
    }
  )
);