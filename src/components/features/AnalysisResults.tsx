/**
 * 분석 결과 표시 컴포넌트
 * 코드 분석 결과를 탭 형태로 구분하여 표시하고 사용자 상호작용을 제공
 * @module components/features/AnalysisResults
 */

import React, { useState } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import {
  OverviewTab,
  ESLintTab,
  ComplexityTab,
  SecurityTab,
  AITab,
  PrettierTab,
} from "./analysis";
import type { CodeAnalysis } from "../../types";

/**
 * 분석 결과 컴포넌트의 Props 인터페이스
 */
interface AnalysisResultsProps {
  /** 분석 결과 데이터 */
  analysis: CodeAnalysis | null;
  /** 분석 진행 중 여부 */
  isAnalyzing: boolean;
  /** 발생한 에러 메시지 */
  error: string | null;
  /** 재시도 콜백 */
  onRetry: () => void;
  /** 에러 클리어 콜백 */
  onClearError: () => void;
}

/**
 * 분석 결과 탭 타입
 * 각 분석 결과를 표시하는 탭들을 구분
 */
type TabType =
  | "overview"
  | "eslint"
  | "complexity"
  | "security"
  | "ai"
  | "prettier";

/**
 * 분석 결과 컴포넌트
 * 코드 분석 결과를 탭 형태로 표시하고 로딩, 에러 상태를 처리
 * @param props - 컴포넌트 Props
 * @returns 분석 결과 UI
 */
export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  isAnalyzing,
  error,
  onRetry,
  onClearError,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  /** 로딩 상태 UI */
  if (isAnalyzing) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400 mb-2">
            {t("analysisResults.loading")}
          </p>
          <p className="text-sm text-secondary-500 dark:text-secondary-500">
            {t("analysisResults.loadingDescription")}
          </p>
        </div>
      </div>
    );
  }

  /** 에러 상태 UI */
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            {t("analysisResults.failed")}
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            {error}
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={onRetry}
              className="btn-primary px-4 py-2 rounded-lg"
            >
              {t("analysisResults.retry")}
            </button>
            <button
              onClick={onClearError}
              className="btn-secondary px-4 py-2 rounded-lg"
            >
              {t("analysisResults.clearError")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /** 분석 결과가 없는 상태 UI */
  if (!analysis) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
            {t("analysisResults.waiting")}
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            {t("analysisResults.waitingDescription")}
          </p>
        </div>
      </div>
    );
  }

  // 탭 목록 생성
  const tabs: Array<{
    key: TabType;
    label: string;
    count?: number;
    available: boolean;
  }> = [
    {
      key: "overview",
      label: t("analysisResults.tabs.overview"),
      available: true,
    },
    {
      key: "eslint",
      label: t("analysisResults.tabs.eslint"),
      count: analysis.results.eslint?.length || 0,
      available: !!analysis.results.eslint,
    },
    {
      key: "complexity",
      label: t("analysisResults.tabs.complexity"),
      available: !!analysis.results.complexity,
    },
    {
      key: "security",
      label: t("analysisResults.tabs.security"),
      count: analysis.results.security?.issues.length || 0,
      available: !!analysis.results.security,
    },
    {
      key: "ai",
      label: t("analysisResults.tabs.ai"),
      count: analysis.results.ai?.issues.length || 0,
      available: !!analysis.results.ai,
    },
    {
      key: "prettier",
      label: t("analysisResults.tabs.prettier"),
      available: !!analysis.results.prettier,
    },
  ];

  const availableTabs = tabs.filter((tab) => tab.available);

  return (
    <div className="h-full flex flex-col">
      {/* 탭 헤더 */}
      <div className="border-b border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
        <div className="flex space-x-1 p-2">
          {availableTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  activeTab === tab.key
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    : "text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                }
              `}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key
                      ? "bg-primary-200 dark:bg-primary-800 text-primary-800 dark:text-primary-200"
                      : "bg-secondary-200 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 내용 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "overview" && <OverviewTab analysis={analysis} />}
        {activeTab === "eslint" && (
          <ESLintTab results={analysis.results.eslint || []} />
        )}
        {activeTab === "complexity" && (
          <ComplexityTab complexity={analysis.results.complexity} />
        )}
        {activeTab === "security" && (
          <SecurityTab security={analysis.results.security} />
        )}
        {activeTab === "ai" && <AITab ai={analysis.results.ai} />}
        {activeTab === "prettier" && (
          <PrettierTab prettier={analysis.results.prettier} />
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
