import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { databaseService } from "../services/databaseService";
import { notificationService } from "../services/notificationService";

/**
 * 테마 타입 정의
 * 라이트 모드와 다크 모드를 지원합니다.
 */
export type Theme = "light" | "dark";

/**
 * 언어 타입 정의
 * 한국어와 영어를 지원합니다.
 */
export type Language = "ko" | "en";

/**
 * AppContext의 값 타입 정의
 * 테마, 언어, 자동 백업 등의 전역 상태를 관리합니다.
 */
interface AppContextType {
  /** 현재 테마 (라이트/다크) */
  theme: Theme;
  /** 현재 언어 (한국어/영어) */
  language: Language;
  /** 다크 모드 여부 */
  isDark: boolean;
  /** 데이터 로딩 상태 */
  isLoading: boolean;
  /** 자동 백업 활성화 여부 */
  autoBackup: boolean;
  /** 자동 백업 간격 (분) */
  autoBackupInterval: number;
  /** 알림 활성화 여부 */
  notifications: boolean;
  /** 테마 변경 함수 */
  changeTheme: (theme: Theme) => void;
  /** 언어 변경 함수 */
  changeLanguage: (language: Language) => void;
  /** 자동 백업 설정 변경 함수 */
  changeAutoBackup: (enabled: boolean, interval?: number) => void;
  /** 알림 설정 변경 함수 */
  changeNotifications: (enabled: boolean) => void;
}

/**
 * AppContext 생성
 * 전역 상태 관리를 위한 React Context입니다.
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * AppContext 사용을 위한 커스텀 훅
 *
 * @returns AppContext의 값
 * @throws Context가 Provider로 감싸져 있지 않은 경우 에러
 */
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

/**
 * AppProvider 컴포넌트
 *
 * 애플리케이션의 전역 상태를 관리하는 Context Provider입니다.
 * 테마, 언어, 자동 백업 등의 설정을 중앙에서 관리하고
 * 모든 하위 컴포넌트에서 접근할 수 있도록 합니다.
 *
 * @param children - Provider로 감쌀 하위 컴포넌트들
 * @returns AppContext.Provider JSX
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("ko");
  const [isLoading, setIsLoading] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [autoBackupInterval, setAutoBackupInterval] = useState(30);
  const [notifications, setNotifications] = useState(true);

  const isDark = theme === "dark";

  useEffect(() => {
    /**
     * 초기 설정을 로드합니다.
     * 데이터베이스에서 저장된 테마, 언어, 자동 백업 설정을 가져옵니다.
     */
    const loadSettings = async () => {
      try {
        const settings = await databaseService.getSettings();

        // 테마 설정 적용
        if (settings.theme) {
          setTheme(settings.theme);
        }

        // 언어 설정 적용
        if (settings.language) {
          setLanguage(settings.language);
        }

        // 자동 백업 설정 적용
        if (settings.autoSave !== undefined) {
          setAutoBackup(settings.autoSave);
        }
        if (settings.autoSaveInterval !== undefined) {
          setAutoBackupInterval(settings.autoSaveInterval);
        }

        // 알림 설정 적용
        if (settings.notifications !== undefined) {
          setNotifications(settings.notifications);
        }

        console.log("설정 로드 완료:", {
          theme: settings.theme,
          language: settings.language,
          isDark: theme === "dark",
        });
      } catch (error) {
        console.error("설정 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  /**
   * DOM에 테마를 적용합니다.
   * HTML 요소의 class와 data-theme 속성을 설정하여
   * CSS 변수와 테마별 스타일을 적용합니다.
   *
   * @param theme - 적용할 테마
   */
  const applyThemeToDOM = (theme: Theme) => {
    const html = document.documentElement;
    const body = document.body;

    if (theme === "dark") {
      html.classList.add("dark");
      html.setAttribute("data-theme", "dark");
      body.classList.add("dark");
    } else {
      html.classList.remove("dark");
      html.setAttribute("data-theme", "light");
      body.classList.remove("dark");
    }

    console.log("DOM 테마 적용:", theme);
  };

  /**
   * DOM에 언어를 적용합니다.
   * HTML 요소의 lang 속성을 설정하여
   * 접근성과 SEO를 개선합니다.
   *
   * @param language - 적용할 언어
   */
  const applyLanguageToDOM = (language: Language) => {
    document.documentElement.lang = language;
    console.log("DOM 언어 적용:", language);
  };

  // 테마 변경 시 DOM에 즉시 적용
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // 언어 변경 시 DOM에 즉시 적용
  useEffect(() => {
    applyLanguageToDOM(language);
  }, [language]);

  /**
   * 테마를 변경합니다.
   * 상태를 업데이트하고 데이터베이스에 저장하며,
   * DOM에 즉시 적용합니다.
   *
   * @param newTheme - 새로운 테마
   */
  const changeTheme = async (newTheme: Theme) => {
    try {
      setTheme(newTheme);
      await databaseService.updateSettings({ theme: newTheme });
      console.log("테마 변경 완료:", newTheme);
    } catch (error) {
      console.error("테마 변경 실패:", error);
    }
  };

  /**
   * 언어를 변경합니다.
   * 상태를 업데이트하고 데이터베이스에 저장하며,
   * DOM에 즉시 적용합니다.
   *
   * @param newLanguage - 새로운 언어
   */
  const changeLanguage = async (newLanguage: Language) => {
    try {
      setLanguage(newLanguage);
      await databaseService.updateSettings({ language: newLanguage });
      console.log("언어 변경 완료:", newLanguage);
    } catch (error) {
      console.error("언어 변경 실패:", error);
    }
  };

  /**
   * 자동 백업 설정을 변경합니다.
   * 상태를 업데이트하고 데이터베이스에 저장합니다.
   *
   * @param enabled - 자동 백업 활성화 여부
   * @param interval - 백업 간격 (분, 선택사항)
   */
  const changeAutoBackup = async (enabled: boolean, interval?: number) => {
    try {
      setAutoBackup(enabled);
      if (interval !== undefined) {
        setAutoBackupInterval(interval);
      }

      await databaseService.updateSettings({
        autoSave: enabled,
        autoSaveInterval: interval || autoBackupInterval,
      });

      console.log("자동 백업 설정 변경:", {
        enabled,
        interval: interval || autoBackupInterval,
      });
    } catch (error) {
      console.error("자동 백업 설정 변경 실패:", error);
    }
  };

  /**
   * 알림 설정을 변경합니다.
   * 상태를 업데이트하고 데이터베이스에 저장합니다.
   *
   * @param enabled - 알림 활성화 여부
   */
  const changeNotifications = async (enabled: boolean) => {
    try {
      setNotifications(enabled);
      await databaseService.updateSettings({ notifications: enabled });
      console.log("알림 설정 변경:", enabled);
    } catch (error) {
      console.error("알림 설정 변경 실패:", error);
    }
  };

  // 자동 백업 로직
  useEffect(() => {
    if (!autoBackup) return;

    /**
     * 자동 백업을 실행합니다.
     * 설정된 간격마다 데이터를 백업하고
     * 백업 완료 알림을 표시합니다.
     */
    const performAutoBackup = async () => {
      try {
        await databaseService.createBackup();
        console.log("자동 백업 완료");

        // 백업 완료 알림 표시
        if (notifications) {
          await notificationService.notifyBackupCreated();
        }
      } catch (error) {
        console.error("자동 백업 실패:", error);
      }
    };

    // 초기 백업 실행
    performAutoBackup();

    // 설정된 간격마다 백업 실행
    const interval = setInterval(
      performAutoBackup,
      autoBackupInterval * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [autoBackup, autoBackupInterval, notifications]);

  const value: AppContextType = {
    theme,
    language,
    isDark,
    isLoading,
    autoBackup,
    autoBackupInterval,
    notifications,
    changeTheme,
    changeLanguage,
    changeAutoBackup,
    changeNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
