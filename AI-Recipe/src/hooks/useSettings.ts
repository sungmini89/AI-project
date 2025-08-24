/**
 * 애플리케이션 설정 관리 훅
 * 사용자 설정을 로드, 저장, 관리하고 테마와 언어를 적용합니다.
 * 
 * @description
 * - API 키 및 서비스 설정 관리
 * - 사용자 선호도 및 식이 제한 설정
 * - 애플리케이션 테마 및 언어 설정
 * - localStorage를 통한 설정 영속성
 * - 실시간 테마 및 언어 변경 적용
 * 
 * @features
 * - 설정 자동 로드 및 저장
 * - 다크/라이트 테마 전환
 * - 한국어/영어 언어 전환
 * - API 서비스 상태 추적
 * - 오류 처리 및 복구
 * 
 * @author AI Recipe Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from "react";
import i18n from "i18next";

/**
 * 애플리케이션 설정 인터페이스
 * 모든 사용자 설정과 애플리케이션 옵션을 정의합니다.
 */
export interface Settings {
  // API Keys
  /** Spoonacular API 키 */
  spoonacularApiKey: string;
  /** Edamam 애플리케이션 ID */
  edamamAppId: string;
  /** Edamam 애플리케이션 키 */
  edamamAppKey: string;
  /** 사용자 정의 AI API 키 */
  customAiApiKey: string;
  /** 사용자 정의 AI API 기본 URL */
  customAiBaseUrl: string;

  // Preferences
  /** 식이 제한 사항 목록 */
  dietaryRestrictions: string[];
  /** 알레르기/알레르기 반응 목록 */
  allergies: string[];
  /** 선호하는 요리 종류 */
  preferredCuisine: string;
  /** 최대 조리 시간 (분) */
  maxCookingTime: number;
  /** 최대 칼로리 */
  maxCalories: number;

  // App Settings
  /** 테마 설정 (라이트/다크) */
  theme: "light" | "dark";
  /** 언어 설정 (한국어/영어) */
  language: "ko" | "en";
  /** 알림 활성화 여부 */
  enableNotifications: boolean;
  /** 분석 데이터 수집 활성화 여부 */
  enableAnalytics: boolean;
}

/**
 * 기본 설정값
 * 애플리케이션 최초 실행 시 사용되는 기본 설정입니다.
 */
const DEFAULT_SETTINGS: Settings = {
  spoonacularApiKey: "",
  edamamAppId: "",
  edamamAppKey: "",
  customAiApiKey: "",
  customAiBaseUrl: "",
  dietaryRestrictions: [],
  allergies: [],
  preferredCuisine: "",
  maxCookingTime: 60,
  maxCalories: 800,
  theme: "light",
  language: "ko",
  enableNotifications: true,
  enableAnalytics: false,
};

/** 설정 저장소 키 */
const STORAGE_KEY = "ai-recipe-settings";
/** API 상태 저장소 키 */
const API_STATUS_KEY = "ai-recipe-api-status";

/**
 * 테마 적용 함수
 * HTML 루트 엘리먼트에 테마 클래스를 추가/제거합니다.
 * 
 * @param {string} theme - 적용할 테마 (light 또는 dark)
 */
const applyTheme = (theme: "light" | "dark") => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

/**
 * 설정 관리 훅
 * 애플리케이션의 모든 설정을 관리하고 적용합니다.
 * 
 * @returns {Object} 설정 상태와 관리 함수들
 */
export function useSettings() {
  /** 현재 설정 상태 */
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  /** 설정 로딩 상태 */
  const [loading, setLoading] = useState(true);
  /** 오류 메시지 */
  const [error, setError] = useState<string | null>(null);

  /**
   * 설정 로드 함수
   * localStorage에서 저장된 설정을 불러와 상태에 적용합니다.
   */
  const loadSettings = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
        // 로드된 설정에서 테마 적용
        applyTheme(parsed.theme || DEFAULT_SETTINGS.theme);

        // 로드된 설정에서 언어 적용
        if (parsed.language) {
          i18n.changeLanguage(parsed.language);
        }
      } else {
        // 기본 테마 적용
        applyTheme(DEFAULT_SETTINGS.theme);

        // 기본 언어 적용
        i18n.changeLanguage(DEFAULT_SETTINGS.language);
      }
    } catch (err) {
      setError("설정을 불러오는데 실패했습니다.");
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 설정 저장 함수
   * 새로운 설정을 상태에 적용하고 localStorage에 저장합니다.
   * 
   * @param {Partial<Settings>} newSettings - 저장할 새로운 설정 (부분적 업데이트 가능)
   */
  const saveSettings = useCallback((newSettings?: Partial<Settings>) => {
    try {
      setError(null);

      setSettings((prevSettings) => {
        const updatedSettings = newSettings
          ? { ...prevSettings, ...newSettings }
          : prevSettings;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));

        // 설정 변경 이벤트를 비동기로 발생
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("settingsChanged", { detail: updatedSettings })
          );
        }, 0);

        return updatedSettings;
      });

      return true;
    } catch (err) {
      setError("설정을 저장하는데 실패했습니다.");
      console.error("Failed to save settings:", err);
      return false;
    }
  }, []);

  // 특정 설정 업데이트
  const updateSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => {
        const updatedSettings = { ...prev, [key]: value };

        // 모든 설정 변경 시 즉시 저장
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));

        // 설정 변경 이벤트를 비동기로 발생
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("settingsChanged", { detail: updatedSettings })
          );
        }, 0);

        // 테마 변경 시 즉시 DOM에 적용
        if (key === "theme") {
          applyTheme(value as "light" | "dark");
        }

        // 언어 변경 시 즉시 i18n에 적용
        if (key === "language") {
          i18n.changeLanguage(value as "ko" | "en");
        }

        return updatedSettings;
      });
    },
    []
  );

  // 설정 초기화
  const resetSettings = useCallback(() => {
    try {
      setError(null);

      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem(STORAGE_KEY);

      // 기본 테마 적용
      applyTheme(DEFAULT_SETTINGS.theme);

      // 기본 언어 적용
      i18n.changeLanguage(DEFAULT_SETTINGS.language);

      // 설정 변경 이벤트를 비동기로 발생
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("settingsChanged", { detail: DEFAULT_SETTINGS })
        );
      }, 0);

      return true;
    } catch (err) {
      setError("설정을 초기화하는데 실패했습니다.");
      console.error("Failed to reset settings:", err);
      return false;
    }
  }, []);

  // 설정 내보내기
  const exportSettings = useCallback(() => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ai-recipe-settings.json";
      link.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      setError("설정을 내보내는데 실패했습니다.");
      console.error("Failed to export settings:", err);
      return false;
    }
  }, [settings]);

  // 설정 가져오기
  const importSettings = useCallback((file: File) => {
    try {
      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);

          // 유효성 검사
          if (typeof imported !== "object" || imported === null) {
            throw new Error("Invalid settings file format");
          }

          // 필수 필드 확인
          const requiredFields: (keyof Settings)[] = [
            "spoonacularApiKey",
            "edamamAppId",
            "edamamAppKey",
            "customAiApiKey",
            "customAiBaseUrl",
            "dietaryRestrictions",
            "allergies",
            "preferredCuisine",
            "maxCookingTime",
            "maxCalories",
            "theme",
            "language",
            "enableNotifications",
            "enableAnalytics",
          ];

          for (const field of requiredFields) {
            if (!(field in imported)) {
              throw new Error(`Missing required field: ${field}`);
            }
          }

          setSettings(imported as Settings);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));

          // 가져온 설정에서 테마 적용
          applyTheme(imported.theme || DEFAULT_SETTINGS.theme);

          // 가져온 설정에서 언어 적용
          if (imported.language) {
            i18n.changeLanguage(imported.language);
          }

          // 설정 변경 이벤트를 비동기로 발생
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("settingsChanged", { detail: imported })
            );
          }, 0);
        } catch (err) {
          setError("설정 파일을 읽을 수 없습니다.");
          console.error("Failed to import settings:", err);
        }
      };
      reader.readAsText(file);

      return true;
    } catch (err) {
      setError("설정 파일을 읽을 수 없습니다.");
      console.error("Failed to import settings:", err);
      return false;
    }
  }, []);

  // API 키 유효성 검사
  const validateApiKeys = useCallback(() => {
    const isValidApiKey = (key?: string, minLength = 10): boolean => {
      return (
        typeof key === "string" &&
        key.length >= minLength &&
        !key.includes("your_") &&
        !key.includes("placeholder") &&
        /^[a-zA-Z0-9_-]+$/.test(key) // 알파뉴메릭, 하이픈, 언더스코어만 허용
      );
    };

    const isValidSpoonacularKey = (key?: string): boolean => {
      return (
        typeof key === "string" &&
        key.length >= 32 && // Spoonacular API 키는 보통 32자 이상
        /^[a-f0-9]+$/i.test(key) // 16진수 형태
      );
    };

    const isValidUrl = (url?: string): boolean => {
      if (!url) return false;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    return {
      spoonacular: isValidSpoonacularKey(settings.spoonacularApiKey),
      edamam:
        isValidApiKey(settings.edamamAppId, 8) &&
        isValidApiKey(settings.edamamAppKey, 32),
      customAI:
        isValidApiKey(settings.customAiApiKey) &&
        (!settings.customAiBaseUrl || isValidUrl(settings.customAiBaseUrl)),
    };
  }, [settings]);

  // 초기 로드
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    loadSettings,
    saveSettings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
    validateApiKeys,
  };
}
