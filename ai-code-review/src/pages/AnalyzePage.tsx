/**
 * 메인 코드 분석 페이지
 * 코드 편집, 분석 실행, 결과 표시를 통합한 핵심 페이지
 * @module pages/AnalyzePage
 */

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { useDebounce } from "../hooks/useDebounce";
import CodeEditor from "../components/features/CodeEditor";
import AnalysisResults from "../components/features/AnalysisResults";
import AnalysisControls from "../components/features/AnalysisControls";
import {
  useCodeStore,
  useAnalysisStore,
  useSettingsStore,
  useUIStore,
} from "../stores";
import AnalysisOrchestrator from "../services/analysisOrchestrator";
import type { SupportedLanguage, AIServiceConfig } from "../types";

/**
 * 메인 코드 분석 페이지 컴포넌트
 * 코드 편집기, 분석 제어, 결과 표시를 통합하여 종합적인 코드 분석 환경 제공
 * @returns 분석 페이지 UI
 */
export const AnalyzePage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  /** 스토어 상태 */
  const { currentCode, currentLanguage, setCode, setLanguage, saveToHistory } =
    useCodeStore();

  const {
    isAnalyzing,
    currentAnalysis,
    startAnalysis,
    completeAnalysis,
    failAnalysis,
    clearError,
    error,
  } = useAnalysisStore();

  const { apiMode, apiKeys, preferences, recordAPIUsage, canUseAPI } =
    useSettingsStore();

  const { addNotification, setLoading } = useUIStore();

  /** 로컬 상태 */
  const [orchestrator, setOrchestrator] = useState<AnalysisOrchestrator | null>(
    null
  );
  const [analysisOptions, setAnalysisOptions] = useState({
    includeESLint: true,
    includeComplexity: true,
    includeSecurity: true,
    includeAI: preferences.enableAI && apiMode !== "offline",
    includePrettier: true,
  });

  /** 분석 오케스트레이터 메모이제이션 */
  const orchestratorConfig = useMemo(
    (): AIServiceConfig => ({
      mode: apiMode,
      apiKey: apiKeys.gemini || apiKeys.cohere,
      fallbackToOffline: true,
      provider: apiKeys.gemini
        ? "gemini"
        : apiKeys.cohere
          ? "cohere"
          : undefined,
    }),
    [apiMode, apiKeys]
  );

  /** 분석 오케스트레이터 초기화 */
  useEffect(() => {
    const newOrchestrator = new AnalysisOrchestrator(orchestratorConfig);
    setOrchestrator(newOrchestrator);

    return () => {
      // 정리 작업
    };
  }, [orchestratorConfig]);

  /** 분석 옵션 업데이트 */
  useEffect(() => {
    setAnalysisOptions((prev) => ({
      ...prev,
      includeAI: preferences.enableAI && apiMode !== "offline",
    }));
  }, [preferences.enableAI, apiMode]);

  /** 코드 변경 핸들러 */
  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      clearError();
    },
    [setCode, clearError]
  );

  /** 언어 변경 핸들러 */
  const handleLanguageChange = useCallback(
    (newLanguage: SupportedLanguage) => {
      setLanguage(newLanguage);
      clearError();
    },
    [setLanguage, clearError]
  );

  // 코드 분석 실행
  const handleAnalyze = useCallback(async () => {
    if (!orchestrator) {
      addNotification({
        type: "error",
        title: "분석 오류",
        message: "분석 서비스가 초기화되지 않았습니다.",
      });
      return;
    }

    if (!currentCode.trim()) {
      addNotification({
        type: "warning",
        title: "코드 없음",
        message: "분석할 코드를 입력해주세요.",
      });
      return;
    }

    // AI 분석 전 API 사용량 확인
    if (analysisOptions.includeAI && apiMode !== "offline") {
      const provider = apiKeys.gemini ? "gemini" : "cohere";
      if (!canUseAPI(provider)) {
        addNotification({
          type: "warning",
          title: "API 사용량 초과",
          message: `${provider} API 일일 사용량이 초과되었습니다. 오프라인 모드로 분석합니다.`,
        });
        setAnalysisOptions((prev) => ({ ...prev, includeAI: false }));
      }
    }

    try {
      startAnalysis();
      setLoading("analysis", true);

      console.log("코드 분석 시작:", {
        language: currentLanguage,
        codeLength: currentCode.length,
        options: analysisOptions,
      });

      const analysis = await orchestrator.analyzeCode(
        currentCode,
        currentLanguage,
        analysisOptions
      );

      // API 사용량 기록
      if (analysisOptions.includeAI && analysis.results.ai) {
        const provider = analysis.results.ai.provider;
        if (provider !== "offline" && provider !== "mock") {
          recordAPIUsage(provider, 1);
        }
      }

      completeAnalysis(analysis);

      // 성공 알림
      addNotification({
        type: "success",
        title: "분석 완료",
        message: `${currentLanguage} 코드 분석이 완료되었습니다.`,
      });

      // 히스토리에 저장
      saveToHistory(`${currentLanguage} 코드 분석`);
    } catch (analysisError) {
      console.error("코드 분석 실패:", analysisError);

      failAnalysis(
        analysisError instanceof Error
          ? analysisError.message
          : "알 수 없는 오류"
      );

      addNotification({
        type: "error",
        title: "분석 실패",
        message:
          analysisError instanceof Error
            ? analysisError.message
            : "분석 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading("analysis", false);
    }
  }, [
    orchestrator,
    currentCode,
    currentLanguage,
    analysisOptions,
    apiMode,
    apiKeys,
    startAnalysis,
    completeAnalysis,
    failAnalysis,
    addNotification,
    setLoading,
    canUseAPI,
    recordAPIUsage,
    saveToHistory,
  ]);

  // 실시간 분석 (디바운스된)
  const handleRealtimeAnalysis = useCallback(async () => {
    if (!orchestrator || !preferences.realTimeAnalysis || !currentCode.trim()) {
      return;
    }

    try {
      const results = await orchestrator.analyzeCodeRealtime(
        currentCode,
        currentLanguage
      );

      // 실시간 결과는 현재 분석에 부분적으로 업데이트
      // (전체 분석이 아닌 ESLint, 복잡도만)
      console.log("실시간 분석 결과:", results);
    } catch (error) {
      console.warn("실시간 분석 오류:", error);
    }
  }, [
    orchestrator,
    preferences.realTimeAnalysis,
    currentCode,
    currentLanguage,
  ]);

  // 디바운스된 코드 변경
  const debouncedCode = useDebounce(currentCode, 1000);

  // 디바운스된 실시간 분석
  useEffect(() => {
    if (!preferences.realTimeAnalysis || !debouncedCode.trim()) return;

    handleRealtimeAnalysis();
  }, [debouncedCode, handleRealtimeAnalysis, preferences.realTimeAnalysis]);

  // 분석 옵션 변경
  const handleAnalysisOptionsChange = useCallback(
    (options: Partial<typeof analysisOptions>) => {
      setAnalysisOptions((prev) => ({ ...prev, ...options }));
    },
    []
  );

  // 코드 포맷팅
  const handleFormatCode = useCallback(async () => {
    if (!orchestrator) return;

    try {
      setLoading("formatting", true);

      const result = await orchestrator.formatCode(
        currentCode,
        currentLanguage
      );

      if (result.changed) {
        setCode(result.formatted);
        addNotification({
          type: "success",
          title: "코드 포맷팅 완료",
          message: "코드가 성공적으로 포맷팅되었습니다.",
        });
      } else {
        addNotification({
          type: "info",
          title: "포맷팅 불필요",
          message: "코드가 이미 올바른 형식입니다.",
        });
      }
    } catch (error) {
      addNotification({
        type: "error",
        title: "포맷팅 실패",
        message: "코드 포맷팅 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading("formatting", false);
    }
  }, [
    orchestrator,
    currentCode,
    currentLanguage,
    setCode,
    addNotification,
    setLoading,
  ]);

  // 새 분석 시작
  const handleNewAnalysis = useCallback(() => {
    setCode("");
    clearError();
    addNotification({
      type: "info",
      title: "새 분석",
      message: "새로운 코드 분석을 시작합니다.",
    });
  }, [setCode, clearError, addNotification]);

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-secondary-800 shadow-sm border-b border-secondary-200 dark:border-secondary-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="text-secondary-600 hover:text-secondary-800 dark:text-secondary-400 dark:hover:text-secondary-200"
              >
                {t("navigation.backToHome")}
              </button>
              <h1 className="text-xl font-bold text-secondary-900 dark:text-white">
                {t("analyzer.title")}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              {/* 현재 모드 표시 */}
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  apiMode === "offline"
                    ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    : "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                }`}
              >
                {apiMode === "offline"
                  ? t("analysis.status.offline")
                  : t("analysis.status.apiMode")}
              </span>

              {analysisOptions.includeAI && (
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                  AI 활성화
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
          {/* 코드 에디터 영역 */}
          <div className="card p-0 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* 분석 컨트롤 */}
              <AnalysisControls
                isAnalyzing={isAnalyzing}
                analysisOptions={analysisOptions}
                onAnalysisOptionsChange={handleAnalysisOptionsChange}
                onAnalyze={handleAnalyze}
                onFormat={handleFormatCode}
                onNew={handleNewAnalysis}
                apiMode={apiMode}
                className="border-b border-secondary-200 dark:border-secondary-700"
              />

              {/* 코드 에디터 */}
              <div className="flex-1">
                <CodeEditor
                  value={currentCode}
                  language={currentLanguage}
                  onChange={handleCodeChange}
                  onLanguageChange={handleLanguageChange}
                  theme={
                    useSettingsStore.getState().theme === "dark"
                      ? "dark"
                      : "light"
                  }
                  height={600}
                  showMinimap={true}
                />
              </div>
            </div>
          </div>

          {/* 분석 결과 영역 */}
          <div className="card p-0 overflow-hidden">
            <AnalysisResults
              analysis={currentAnalysis}
              isAnalyzing={isAnalyzing}
              error={error}
              onRetry={handleAnalyze}
              onClearError={clearError}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzePage;
