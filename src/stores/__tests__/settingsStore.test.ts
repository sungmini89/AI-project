/**
 * SettingsStore 테스트 모듈
 * 사용자 설정 상태 관리 스토어의 기능을 검증
 * @module tests/stores/settingsStore
 */

// SettingsStore 테스트

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSettingsStore } from "../settingsStore";

/**
 * SecureStorage 모킹
 * 보안 저장소 의존성을 테스트용으로 대체
 */
vi.mock("../../utils/secureStorage", () => ({
  default: {
    setSecure: vi.fn(),
    getSecure: vi.fn(),
    removeSecure: vi.fn(),
    clearAll: vi.fn(),
    validateAPIKey: vi.fn().mockReturnValue(true),
  },
}));

/**
 * config 모킹
 * 설정 파일 의존성을 테스트용으로 대체
 */
vi.mock("../../config", () => ({
  default: {
    storage: {
      keys: {
        userSettings: "test-settings",
      },
    },
    api: {
      gemini: { dailyLimit: 1500 },
      cohere: { monthlyLimit: 5000 },
    },
  },
}));

/**
 * useSettingsStore 테스트 스위트
 * 설정 스토어의 모든 주요 기능을 검증
 */
describe("useSettingsStore", () => {
  /**
   * 각 테스트 전에 스토어 상태를 초기화
   */
  beforeEach(() => {
    useSettingsStore.setState({
      theme: "light",
      language: "ko",
      apiMode: "offline",
      apiKeys: {},
      preferences: {
        autoFormat: true,
        realTimeAnalysis: true,
        showComplexity: true,
        showSecurity: true,
        enableAI: false,
      },
      apiUsage: [],
    });
  });

  /**
   * 기본 설정값이 올바르게 설정되는지 검증
   */
  it("should have correct default settings", () => {
    const store = useSettingsStore.getState();

    expect(store.theme).toBe("light");
    expect(store.language).toBe("ko");
    expect(store.apiMode).toBe("offline");
    expect(store.preferences.enableAI).toBe(false);
  });

  /**
   * 테마 변경이 올바르게 작동하는지 검증
   */
  it("should update theme correctly", () => {
    const { setTheme } = useSettingsStore.getState();

    setTheme("dark");

    expect(useSettingsStore.getState().theme).toBe("dark");
  });

  /**
   * API 모드와 AI 설정 변경이 올바르게 작동하는지 검증
   */
  it("should update API mode and AI preferences", () => {
    const { setAPIMode } = useSettingsStore.getState();

    setAPIMode("free");

    expect(useSettingsStore.getState().apiMode).toBe("free");
  });

  /**
   * API 사용량 기록이 올바르게 작동하는지 검증
   */
  it("should record API usage correctly", () => {
    const { recordAPIUsage, getTodayUsage } = useSettingsStore.getState();

    recordAPIUsage("gemini", 5);

    expect(getTodayUsage("gemini")).toBe(5);
  });

  /**
   * API 사용량 제한 검증이 올바르게 작동하는지 검증
   */
  it("should validate API usage limits", () => {
    const { recordAPIUsage, canUseAPI } = useSettingsStore.getState();

    // Record usage within limit
    recordAPIUsage("gemini", 1000);
    expect(canUseAPI("gemini")).toBe(true);

    // Record usage exceeding limit
    recordAPIUsage("gemini", 1000);
    expect(canUseAPI("gemini")).toBe(false);
  });

  /**
   * 설정 내보내기와 가져오기가 올바르게 작동하는지 검증
   */
  it("should export and import settings", () => {
    const { exportSettings, importSettings, setTheme } =
      useSettingsStore.getState();

    setTheme("dark");
    const exported = exportSettings();

    setTheme("light");
    const success = importSettings(exported);

    expect(success).toBe(true);
    expect(useSettingsStore.getState().theme).toBe("dark");
  });
});
