import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings } from "../types";
import { DEFAULT_POMODORO_SETTINGS, STORAGE_KEYS } from "@/constants";

interface SettingsStore extends AppSettings {
  updateTheme: (theme: AppSettings["theme"]) => void;
  updateLanguage: (language: AppSettings["language"]) => void;
  updatePomodoroSettings: (
    settings: Partial<AppSettings["pomodoroSettings"]>
  ) => void;
  updateNotifications: (
    notifications: Partial<AppSettings["notifications"]>
  ) => void;
  updateAISettings: (aiSettings: Partial<AppSettings["aiSettings"]>) => void;
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const defaultSettings: AppSettings = {
  theme: "light",
  language: "ko",
  pomodoroSettings: DEFAULT_POMODORO_SETTINGS,
  notifications: {
    enabled: true,
    taskReminders: true,
    pomodoroAlerts: true,
  },
  aiSettings: {
    mode: "offline",
    fallbackToOffline: true,
    usageTracking: {
      daily: 0,
      monthly: 0,
      lastReset: new Date(),
    },
  },
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => {
      console.log("settingsStore 초기화됨");
      return {
        ...defaultSettings,

        updateTheme: (theme) => {
          console.log("updateTheme 호출됨, 새 테마:", theme);
          set({ theme });

          // 기존 다크 모드 클래스 제거
          document.documentElement.classList.remove("dark");
          console.log("dark 클래스 제거됨");

          if (theme === "dark") {
            document.documentElement.classList.add("dark");
            console.log("dark 클래스 추가됨");
          } else {
            // light 모드
            console.log("light 테마 - dark 클래스 없음");
          }

          console.log(
            "최종 클래스:",
            document.documentElement.classList.toString()
          );
        },

        updateLanguage: (language) => {
          set({ language });
          document.documentElement.lang = language;
        },

        updatePomodoroSettings: (settings) => {
          set((state) => ({
            pomodoroSettings: { ...state.pomodoroSettings, ...settings },
          }));
        },

        updateNotifications: (notifications) => {
          set((state) => ({
            notifications: { ...state.notifications, ...notifications },
          }));
        },

        updateAISettings: (aiSettings) => {
          set((state) => ({
            aiSettings: { ...state.aiSettings, ...aiSettings },
          }));
        },

        resetToDefaults: () => {
          set(defaultSettings);
        },

        exportSettings: () => {
          const settings = get();
          const exportData = {
            theme: settings.theme,
            language: settings.language,
            pomodoroSettings: settings.pomodoroSettings,
            notifications: settings.notifications,
            aiSettings: {
              mode: settings.aiSettings.mode,
              fallbackToOffline: settings.aiSettings.fallbackToOffline,
            },
          };
          return JSON.stringify(exportData, null, 2);
        },

        importSettings: (settingsJson) => {
          try {
            const importedSettings = JSON.parse(settingsJson);

            const validatedSettings = {
              theme: ["light", "dark"].includes(importedSettings.theme)
                ? importedSettings.theme
                : defaultSettings.theme,
              language: ["ko", "en"].includes(importedSettings.language)
                ? importedSettings.language
                : defaultSettings.language,
              pomodoroSettings: {
                ...defaultSettings.pomodoroSettings,
                ...importedSettings.pomodoroSettings,
              },
              notifications: {
                ...defaultSettings.notifications,
                ...importedSettings.notifications,
              },
              aiSettings: {
                ...defaultSettings.aiSettings,
                ...importedSettings.aiSettings,
              },
            };

            set(validatedSettings);
            return true;
          } catch (error) {
            console.error("설정 가져오기 실패:", error);
            return false;
          }
        },
      };
    },
    {
      name: STORAGE_KEYS.SETTINGS,
      onRehydrateStorage: () => (state) => {
        console.log("settingsStore 재구성됨, state:", state);

        // 상태가 없으면 기본값(light) 사용
        const theme = state?.theme || "light";

        // 클래스 초기화
        document.documentElement.classList.remove("dark");

        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        }

        console.log("onRehydrate에서 설정된 테마:", theme);

        if (state) {
          document.documentElement.lang = state.language;
        }
      },
    }
  )
);
