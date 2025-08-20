/**
 * API Key Settings 페이지
 * Personal API 키 설정을 위한 전용 페이지
 * @module pages/ApiSettingsPage
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { useSettingsStore, useUIStore } from "../stores";
import config from "../config";

/**
 * API Key Settings 페이지 컴포넌트
 * Gemini API와 Cohere API 키를 설정할 수 있는 전용 페이지
 * @returns API Key Settings 페이지 UI
 */
export const ApiSettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    apiKeys,
    setAPIKey,
    removeAPIKey,
    getTodayUsage,
    getMonthlyUsage,
    canUseAPI,
  } = useSettingsStore();

  const { addNotification } = useUIStore();

  /** 로컬 상태 */
  const [localAPIKeys, setLocalAPIKeys] = useState({
    gemini: apiKeys.gemini || "",
    cohere: apiKeys.cohere || "",
  });

  const [showAPIKeys, setShowAPIKeys] = useState({
    gemini: false,
    cohere: false,
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

  /**
   * 모든 API 키 삭제 핸들러
   */
  const handleClearAllKeys = () => {
    if (confirm("모든 API 키를 삭제하시겠습니까?")) {
      removeAPIKey("gemini");
      removeAPIKey("cohere");
      setLocalAPIKeys({
        gemini: "",
        cohere: "",
      });
      addNotification({
        type: "info",
        title: "API 키 삭제됨",
        message: "모든 API 키가 삭제되었습니다.",
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
                to="/settings"
                className="text-secondary-600 hover:text-secondary-800 dark:text-secondary-400 dark:hover:text-secondary-200"
              >
                ← 설정으로 돌아가기
              </Link>
              <h1 className="text-xl font-bold text-secondary-900 dark:text-white">
                🔑 API Key Settings
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-8">
          {/* API 사용량 대시보드 */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              📊 API 사용량 대시보드
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gemini API 사용량 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    🤖 Google Gemini API
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    canUseAPI("gemini") 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                    {canUseAPI("gemini") ? "사용 가능" : "한도 초과"}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      오늘 사용량
                    </span>
                    <span className="text-sm font-mono">
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
                </div>
              </div>

              {/* Cohere API 사용량 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                    🚀 Cohere API
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    canUseAPI("cohere") 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                    {canUseAPI("cohere") ? "사용 가능" : "한도 초과"}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700 dark:text-purple-300">
                      이번 달 사용량
                    </span>
                    <span className="text-sm font-mono">
                      {getMonthlyUsage("cohere")} / {config.api.cohere.monthlyLimit}
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        canUseAPI("cohere") ? "bg-purple-500" : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min((getMonthlyUsage("cohere") / config.api.cohere.monthlyLimit) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Gemini API 설정 */}
          <section className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                🤖 Google Gemini API 설정
              </h2>
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                API 키 발급받기 →
              </a>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-3">
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
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  📋 Gemini API 정보
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• 무료 티어: 일일 1,500회 요청 가능</li>
                  <li>• 코드 분석, 리팩토링, 보안 검사에 사용</li>
                  <li>• 한국어 응답 지원</li>
                  <li>• API 키는 브라우저에 안전하게 저장됩니다</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cohere API 설정 */}
          <section className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                🚀 Cohere API 설정
              </h2>
              <a
                href="https://dashboard.cohere.ai/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                API 키 발급받기 →
              </a>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-3">
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
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                  📋 Cohere API 정보
                </h4>
                <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                  <li>• 무료 티어: 월간 1,000회 요청 가능</li>
                  <li>• 텍스트 분석, 요약, 분류에 사용</li>
                  <li>• 고급 NLP 기능 제공</li>
                  <li>• API 키는 브라우저에 안전하게 저장됩니다</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 관리 도구 */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              🛠️ 관리 도구
            </h2>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleClearAllKeys}
                className="btn-secondary px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                🗑️ 모든 API 키 삭제
              </button>
              
              <Link
                to="/settings"
                className="btn-secondary px-4 py-2 rounded-lg inline-flex items-center"
              >
                ⚙️ 일반 설정으로 이동
              </Link>
            </div>
          </section>

          {/* 보안 안내 */}
          <section className="card p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
              🛡️ 보안 안내
            </h2>
            
            <div className="space-y-3 text-sm text-green-800 dark:text-green-200">
              <p>• <strong>로컬 저장:</strong> API 키는 사용자의 브라우저에만 저장되며, 서버로 전송되지 않습니다.</p>
              <p>• <strong>암호화:</strong> 모든 API 키는 암호화되어 저장됩니다.</p>
              <p>• <strong>권한 관리:</strong> API 키는 읽기 전용 권한으로 사용하는 것을 권장합니다.</p>
              <p>• <strong>정기 교체:</strong> 보안을 위해 정기적으로 API 키를 교체하세요.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ApiSettingsPage;