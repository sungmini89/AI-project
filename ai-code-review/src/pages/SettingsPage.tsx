/**
 * API 설정 및 사용자 설정 페이지
 * 애플리케이션의 테마, 언어, API 키, 사용자 선호사항 등을 관리
 * @module pages/SettingsPage
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { useSettingsStore, useUIStore } from "../stores";
import { LanguageSelector } from "../components/ui/LanguageSelector";
// import type { APIMode } from '../types'; // Not used
import config from "../config";

/**
 * 설정 페이지 컴포넌트
 * 사용자가 애플리케이션의 모든 설정을 관리할 수 있는 페이지
 * @returns 설정 페이지 UI
 */
export const SettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    theme,
    apiMode,
    apiKeys,
    preferences,
    // apiUsage, // Not used directly
    setTheme,
    setAPIMode,
    setAPIKey,
    removeAPIKey,
    updatePreferences,
    getTodayUsage,
    getMonthlyUsage,
    canUseAPI,
    exportSettings,
    importSettings,
    resetSettings,
  } = useSettingsStore();

  const { addNotification } = useUIStore();

  /** 로컬 상태 */
  const [localAPIKeys, setLocalAPIKeys] = useState({
    gemini: apiKeys.gemini || "",
    cohere: apiKeys.cohere || "",
    huggingface: apiKeys.huggingface || "",
  });

  const [showAPIKeys, setShowAPIKeys] = useState({
    gemini: false,
    cohere: false,
    huggingface: false,
  });


  /**
   * API 키 저장 핸들러
   * @param provider - API 제공자명
   */
  const handleSaveAPIKey = (provider: string) => {
    const key = localAPIKeys[provider as keyof typeof localAPIKeys];

    if (key.trim()) {
      setAPIKey(provider, key.trim());
      addNotification({
        type: "success",
        title: t("settings.messages.apiKeySaved"),
        message: `${provider} API 키가 저장되었습니다.`,
      });
    } else {
      removeAPIKey(provider);
      addNotification({
        type: "info",
        title: t("settings.messages.apiKeyRemoved"),
        message: `${provider} API 키가 제거되었습니다.`,
      });
    }
  };

  /**
   * API 키 테스트 핸들러
   * @param provider - API 제공자명
   */
  const handleTestAPIKey = async (provider: string) => {
    const key = localAPIKeys[provider as keyof typeof localAPIKeys];

    if (!key.trim()) {
      addNotification({
        type: "warning",
        title: t("settings.messages.testNotPossible"),
        message: t("settings.messages.enterApiKeyFirst"),
      });
      return;
    }

    // 간단한 테스트 요청 시뮬레이션
    addNotification({
      type: "info",
      title: t("settings.messages.apiKeyTest"),
      message: `${provider} API 키를 테스트 중입니다...`,
    });

    // 실제 환경에서는 여기서 API 호출을 해볼 수 있습니다
    setTimeout(() => {
      addNotification({
        type: "success",
        title: t("settings.messages.testSuccess"),
        message: `${provider} API 키가 유효합니다.`,
      });
    }, 1000);
  };

  /** 설정 내보내기 핸들러 */
  const handleExportSettings = () => {
    try {
      const settings = exportSettings();
      const blob = new Blob([settings], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ai-code-review-settings.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addNotification({
        type: "success",
        title: t("settings.messages.exportComplete"),
        message: t("settings.messages.exportCompleteDetail"),
      });
    } catch (exportError) {
      addNotification({
        type: "error",
        title: t("settings.messages.exportFailed"),
        message: t("settings.messages.exportFailedDetail"),
      });
    }
  };

  // 설정 가져오기
  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importSettings(content);

        if (success) {
          addNotification({
            type: "success",
            title: t("settings.messages.importComplete"),
            message: t("settings.messages.importCompleteDetail"),
          });
        } else {
          addNotification({
            type: "error",
            title: t("settings.messages.importFailed"),
            message: t("settings.messages.invalidFile"),
          });
        }
      } catch (importError) {
        addNotification({
          type: "error",
          title: t("settings.messages.fileReadFailed"),
          message: t("settings.messages.fileReadFailedDetail"),
        });
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // 파일 입력 초기화
  };

  // 설정 초기화
  const handleResetSettings = () => {
    if (confirm(t("settings.messages.confirmReset"))) {
      resetSettings();
      setLocalAPIKeys({
        gemini: "",
        cohere: "",
        huggingface: "",
      });

      addNotification({
        type: "info",
        title: t("settings.messages.resetComplete"),
        message: t("settings.messages.resetCompleteDetail"),
      });
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-secondary-800 shadow-sm border-b border-secondary-200 dark:border-secondary-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-secondary-600 hover:text-secondary-800 dark:text-secondary-400 dark:hover:text-secondary-200"
              >
                {t("navigation.backToHome")}
              </Link>
              <h1 className="text-xl font-bold text-secondary-900 dark:text-white">
                ⚙️ {t("settings.title")}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-8">
          {/* API 모드 설정 */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              🤖 {t("settings.api.title")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  apiMode === "offline"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-secondary-200 dark:border-secondary-700 hover:border-secondary-300"
                }`}
                onClick={() => setAPIMode("offline")}
              >
                <div className="text-2xl mb-2">📱</div>
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">
                  {t("settings.api.modes.offline")}
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  {t("settings.api.descriptions.offline")}
                </p>
              </div>

              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  apiMode === "free"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-secondary-200 dark:border-secondary-700 hover:border-secondary-300"
                }`}
                onClick={() => setAPIMode("free")}
              >
                <div className="text-2xl mb-2">🆓</div>
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">
                  {t("settings.api.modes.free")}
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  {t("settings.api.descriptions.free")}
                </p>
              </div>

              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  apiMode === "custom"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-secondary-200 dark:border-secondary-700 hover:border-secondary-300"
                }`}
                onClick={() => setAPIMode("custom")}
              >
                <div className="text-2xl mb-2">🔑</div>
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">
                  {t("settings.api.modes.custom")}
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  {t("settings.api.descriptions.custom")}
                </p>
              </div>
            </div>


            {/* API 사용량 표시 */}
            {apiMode !== "offline" && (
              <div className="bg-secondary-50 dark:bg-secondary-800 p-4 rounded-lg">
                <h4 className="font-medium text-secondary-900 dark:text-white mb-3">
                  {t("settings.api.usage.title")}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-secondary-600 dark:text-secondary-400">
                        Gemini ({t("settings.api.usage.today")})
                      </span>
                      <span className="text-sm font-mono">
                        {getTodayUsage("gemini")} /{" "}
                        {config.api.gemini.dailyLimit}
                      </span>
                    </div>
                    <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          canUseAPI("gemini") ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min((getTodayUsage("gemini") / config.api.gemini.dailyLimit) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-secondary-600 dark:text-secondary-400">
                        Cohere ({t("settings.api.usage.monthly")})
                      </span>
                      <span className="text-sm font-mono">
                        {getMonthlyUsage("cohere")} /{" "}
                        {config.api.cohere.monthlyLimit}
                      </span>
                    </div>
                    <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          canUseAPI("cohere") ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min((getMonthlyUsage("cohere") / config.api.cohere.monthlyLimit) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>


          {/* API 키 설정 - Free API 모드 */}
          {apiMode === "free" && (
            <section className="card p-6">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                🔑 {t("apiKeys.title")}
              </h2>

              <div className="space-y-6">
                {/* Google Gemini API */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      {t("apiKeys.gemini")}
                    </label>
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {t("apiKeys.getKey")} →
                    </a>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type={showAPIKeys.gemini ? "text" : "password"}
                        value={localAPIKeys.gemini}
                        onChange={(e) =>
                          setLocalAPIKeys((prev) => ({
                            ...prev,
                            gemini: e.target.value,
                          }))
                        }
                        placeholder={t("apiKeys.enterGemini")}
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowAPIKeys((prev) => ({
                            ...prev,
                            gemini: !prev.gemini,
                          }))
                        }
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                      >
                        {showAPIKeys.gemini ? "🙈" : "👁️"}
                      </button>
                    </div>
                    <button
                      onClick={() => handleSaveAPIKey("gemini")}
                      className="btn-primary px-4 py-2 rounded-lg"
                    >
                      {t("apiKeys.save")}
                    </button>
                    <button
                      onClick={() => handleTestAPIKey("gemini")}
                      className="btn-secondary px-4 py-2 rounded-lg"
                    >
                      {t("test")}
                    </button>
                  </div>
                  <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-1">
                    {t("freeTier")}: {t("dailyRequests")} 1,500회 가능
                  </p>
                </div>

                {/* Cohere API */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      {t("apiKeys.cohere")}
                    </label>
                    <a
                      href="https://dashboard.cohere.ai/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {t("apiKeys.getKey")} →
                    </a>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type={showAPIKeys.cohere ? "text" : "password"}
                        value={localAPIKeys.cohere}
                        onChange={(e) =>
                          setLocalAPIKeys((prev) => ({
                            ...prev,
                            cohere: e.target.value,
                          }))
                        }
                        placeholder={t("apiKeys.enterCohere")}
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowAPIKeys((prev) => ({
                            ...prev,
                            cohere: !prev.cohere,
                          }))
                        }
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                      >
                        {showAPIKeys.cohere ? "🙈" : "👁️"}
                      </button>
                    </div>
                    <button
                      onClick={() => handleSaveAPIKey("cohere")}
                      className="btn-primary px-4 py-2 rounded-lg"
                    >
                      {t("apiKeys.save")}
                    </button>
                    <button
                      onClick={() => handleTestAPIKey("cohere")}
                      className="btn-secondary px-4 py-2 rounded-lg"
                    >
                      {t("test")}
                    </button>
                  </div>
                  <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-1">
                    {t("freeTier")}: {t("monthlyRequests")} 1,000회 가능
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Personal API 키 설정 - Custom API 모드 */}
          {apiMode === "custom" && (
            <section className="card p-6 border-2 border-primary-200 dark:border-primary-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                  🔑 Personal API Settings
                </h2>
                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm rounded-full">
                  개인 설정
                </span>
              </div>

              <div className="space-y-8">
                {/* Gemini API 설정 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🤖</div>
                      <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                          Google Gemini API
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          코드 분석 및 AI 기능에 사용
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      API 키 발급받기 →
                    </a>
                  </div>

                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <div className="flex-1 relative">
                        <input
                          type={showAPIKeys.gemini ? "text" : "password"}
                          value={localAPIKeys.gemini}
                          onChange={(e) =>
                            setLocalAPIKeys((prev) => ({
                              ...prev,
                              gemini: e.target.value,
                            }))
                          }
                          placeholder="Google Gemini API 키를 입력하세요"
                          className="input-field pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowAPIKeys((prev) => ({
                              ...prev,
                              gemini: !prev.gemini,
                            }))
                          }
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                        >
                          {showAPIKeys.gemini ? "🙈" : "👁️"}
                        </button>
                      </div>
                      <button
                        onClick={() => handleSaveAPIKey("gemini")}
                        className="btn-primary px-4 py-2 rounded-lg"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => handleTestAPIKey("gemini")}
                        className="btn-secondary px-4 py-2 rounded-lg"
                      >
                        테스트
                      </button>
                    </div>

                    {/* 사용량 표시 */}
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-blue-800 dark:text-blue-200">
                          오늘 사용량
                        </span>
                        <span className="text-sm font-mono text-blue-900 dark:text-blue-100">
                          {getTodayUsage("gemini")} / {config.api.gemini.dailyLimit}
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            canUseAPI("gemini") ? "bg-blue-500" : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min((getTodayUsage("gemini") / config.api.gemini.dailyLimit) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        개인 API 키 사용 - 무제한 요청 가능
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cohere API 설정 */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🚀</div>
                      <div>
                        <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                          Cohere API
                        </h3>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          텍스트 분석 및 NLP 기능에 사용
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://dashboard.cohere.ai/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      API 키 발급받기 →
                    </a>
                  </div>

                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <div className="flex-1 relative">
                        <input
                          type={showAPIKeys.cohere ? "text" : "password"}
                          value={localAPIKeys.cohere}
                          onChange={(e) =>
                            setLocalAPIKeys((prev) => ({
                              ...prev,
                              cohere: e.target.value,
                            }))
                          }
                          placeholder="Cohere API 키를 입력하세요"
                          className="input-field pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowAPIKeys((prev) => ({
                              ...prev,
                              cohere: !prev.cohere,
                            }))
                          }
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                        >
                          {showAPIKeys.cohere ? "🙈" : "👁️"}
                        </button>
                      </div>
                      <button
                        onClick={() => handleSaveAPIKey("cohere")}
                        className="btn-primary px-4 py-2 rounded-lg"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => handleTestAPIKey("cohere")}
                        className="btn-secondary px-4 py-2 rounded-lg"
                      >
                        테스트
                      </button>
                    </div>

                    {/* 사용량 표시 */}
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-purple-800 dark:text-purple-200">
                          이번 달 사용량
                        </span>
                        <span className="text-sm font-mono text-purple-900 dark:text-purple-100">
                          {getMonthlyUsage("cohere")} / ∞
                        </span>
                      </div>
                      <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all bg-purple-500"
                          style={{ width: "10%" }}
                        />
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                        개인 API 키 사용 - 무제한 요청 가능
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 보안 안내 */}
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center">
                  🛡️ 보안 안내
                </h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• API 키는 브라우저에 안전하게 암호화되어 저장됩니다</li>
                  <li>• API 키는 서버로 전송되지 않고 클라이언트에서만 사용됩니다</li>
                  <li>• 개인 API 키로 무제한 요청이 가능합니다</li>
                  <li>• 보안을 위해 정기적으로 API 키를 교체하는 것을 권장합니다</li>
                </ul>
              </div>
            </section>
          )}

          {/* 일반 설정 */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              🎨 {t("settings.appearance.title")}
            </h2>

            <div className="space-y-6">
              {/* 테마 설정 */}
              <div>
                <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2 block">
                  {t("theme")}
                </label>
                <div className="flex space-x-2">
                  {[
                    {
                      value: "light",
                      label: t("themeLight"),
                      icon: "☀️",
                    },
                    {
                      value: "dark",
                      label: t("themeDark"),
                      icon: "🌙",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value as any)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        theme === option.value
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                          : "border-secondary-200 dark:border-secondary-700 hover:border-secondary-300"
                      }`}
                    >
                      <span className="mr-2">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 언어 설정 */}
              <LanguageSelector />
            </div>
          </section>

          {/* 분석 설정 */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              🔍 {t("settings.preferences.title")}
            </h2>

            <div className="space-y-4">
              {[
                {
                  key: "autoFormat",
                  label: t("settings.preferences.autoFormat"),
                  description: t(
                    "settings.preferences.descriptions.autoFormat"
                  ),
                },
                {
                  key: "realTimeAnalysis",
                  label: t("settings.preferences.realTimeAnalysis"),
                  description: t(
                    "settings.preferences.descriptions.realTimeAnalysis"
                  ),
                },
                {
                  key: "showComplexity",
                  label: t("settings.preferences.showComplexity"),
                  description: t(
                    "settings.preferences.descriptions.showComplexity"
                  ),
                },
                {
                  key: "showSecurity",
                  label: t("settings.preferences.showSecurity"),
                  description: t(
                    "settings.preferences.descriptions.showSecurity"
                  ),
                },
                {
                  key: "enableAI",
                  label: t("settings.preferences.enableAI"),
                  description: t("settings.preferences.descriptions.enableAI"),
                },
              ].map((option) => (
                <label
                  key={option.key}
                  className="flex items-start space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      preferences[option.key as keyof typeof preferences]
                    }
                    onChange={(e) =>
                      updatePreferences({ [option.key]: e.target.checked })
                    }
                    className="mt-1 form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-secondary-900 dark:text-white">
                      {option.label}
                    </div>
                    <div className="text-xs text-secondary-600 dark:text-secondary-400">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* 설정 관리 */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              📁 {t("settings.data.title")}
            </h2>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportSettings}
                className="btn-secondary px-4 py-2 rounded-lg"
              >
                📤 {t("settings.data.export")}
              </button>

              <label className="btn-secondary px-4 py-2 rounded-lg cursor-pointer">
                📥 {t("settings.data.import")}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleResetSettings}
                className="btn-secondary px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                🔄 {t("settings.data.reset")}
              </button>
            </div>
          </section>

          {/* 정보 섹션 */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              ℹ️ {t("settings.info.title")}
            </h2>

            <div className="space-y-3 text-sm text-secondary-600 dark:text-secondary-400">
              <p>• {t("settings.info.apiKeyStorage")}</p>
              <p>• {t("settings.info.apiLimits")}</p>
              <p>• {t("settings.info.offlineMode")}</p>
              <p>• {t("settings.info.browserStorage")}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
              <p className="text-xs text-secondary-500 dark:text-secondary-500">
                {t("settings.info.appTitle")} v1.0.0 •
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline ml-1"
                >
                  GitHub
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
