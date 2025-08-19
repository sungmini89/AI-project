/**
 * 분석 제어 컴포넌트
 * 코드 분석 실행, 포맷팅, 분석 옵션 설정을 담당하는 제어 패널
 * @module components/features/AnalysisControls
 */

import React from "react";
import { useLanguage } from "../../hooks/useLanguage";
import type { APIMode } from "../../types";
import { useUIStore } from "../../stores";

/**
 * 분석 제어 컴포넌트의 Props 인터페이스
 */
interface AnalysisControlsProps {
  /** 분석 진행 중 여부 */
  isAnalyzing: boolean;
  /** 분석 옵션들 */
  analysisOptions: {
    /** ESLint 분석 포함 여부 */
    includeESLint: boolean;
    /** 복잡도 분석 포함 여부 */
    includeComplexity: boolean;
    /** 보안 분석 포함 여부 */
    includeSecurity: boolean;
    /** AI 분석 포함 여부 */
    includeAI: boolean;
    /** Prettier 포맷팅 포함 여부 */
    includePrettier: boolean;
  };
  /** 분석 옵션 변경 콜백 */
  onAnalysisOptionsChange: (
    options: Partial<AnalysisControlsProps["analysisOptions"]>
  ) => void;
  /** 분석 실행 콜백 */
  onAnalyze: () => void;
  /** 포맷팅 실행 콜백 */
  onFormat: () => void;
  /** 새로 시작 콜백 */
  onNew: () => void;
  /** 현재 API 모드 */
  apiMode: APIMode;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 분석 제어 컴포넌트
 * 코드 분석과 관련된 모든 제어 기능을 제공
 * @param props - 컴포넌트 Props
 * @returns 분석 제어 UI
 */
export const AnalysisControls: React.FC<AnalysisControlsProps> = ({
  isAnalyzing,
  analysisOptions,
  onAnalysisOptionsChange,
  onAnalyze,
  onFormat,
  onNew,
  apiMode,
  className = "",
}) => {
  const { t } = useLanguage();
  const { isLoading } = useUIStore();
  const isFormatting = isLoading("formatting");

  /**
   * 분석 옵션 변경 핸들러
   * @param option - 변경할 옵션명
   */
  const handleOptionChange = (option: keyof typeof analysisOptions) => {
    onAnalysisOptionsChange({ [option]: !analysisOptions[option] });
  };

  return (
    <div className={`bg-secondary-50 dark:bg-secondary-800 p-4 ${className}`}>
      {/* 메인 액션 버튼들 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className={`
              btn-primary px-6 py-2 font-medium rounded-lg transition-all
              ${isAnalyzing ? "cursor-not-allowed opacity-50" : "hover:shadow-lg"}
            `}
          >
            {isAnalyzing ? (
              <span className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{t("analysisResults.loading")}</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>🔍</span>
                <span>{t("analyzer.title")}</span>
              </span>
            )}
          </button>

          <button
            onClick={onFormat}
            disabled={isFormatting || isAnalyzing}
            className="btn-secondary px-4 py-2 rounded-lg"
            title={t("analysisControls.shortcuts.format")}
          >
            {isFormatting ? (
              <span className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{t("analysisControls.shortcuts.format")}...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <span>✨</span>
                <span>{t("analysisControls.shortcuts.format")}</span>
              </span>
            )}
          </button>

          <button
            onClick={onNew}
            disabled={isAnalyzing}
            className="btn-secondary px-4 py-2 rounded-lg"
            title={t("analysisControls.shortcuts.new")}
          >
            <span className="flex items-center space-x-1">
              <span>📄</span>
              <span>{t("analysisControls.shortcuts.new")}</span>
            </span>
          </button>
        </div>

        {/* API 모드 표시 */}
        <div className="text-sm text-secondary-600 dark:text-secondary-400">
          {apiMode === "offline"
            ? t("ui.offlineMode")
            : `${t("ui.apiMode")} (${apiMode})`}
        </div>
      </div>

      {/* 분석 옵션 */}
      <div className="border-t border-secondary-200 dark:border-secondary-700 pt-4">
        <div className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
          {t("analysisControls.options")}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* ESLint 옵션 */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={analysisOptions.includeESLint}
              onChange={() => handleOptionChange("includeESLint")}
              disabled={isAnalyzing}
              className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700 dark:text-secondary-300">
              ESLint
            </span>
          </label>

          {/* 복잡도 분석 옵션 */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={analysisOptions.includeComplexity}
              onChange={() => handleOptionChange("includeComplexity")}
              disabled={isAnalyzing}
              className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700 dark:text-secondary-300">
              {t("analysisResults.complexity")}
            </span>
          </label>

          {/* 보안 분석 옵션 */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={analysisOptions.includeSecurity}
              onChange={() => handleOptionChange("includeSecurity")}
              disabled={isAnalyzing}
              className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700 dark:text-secondary-300">
              {t("analysisResults.security")}
            </span>
          </label>

          {/* AI 분석 옵션 */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={analysisOptions.includeAI}
              onChange={() => handleOptionChange("includeAI")}
              disabled={isAnalyzing || apiMode === "offline"}
              className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span
              className={`text-sm ${
                apiMode === "offline"
                  ? "text-secondary-400 dark:text-secondary-600"
                  : "text-secondary-700 dark:text-secondary-300"
              }`}
            >
              {t("analysisResults.ai")}
            </span>
          </label>

          {/* Prettier 옵션 */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={analysisOptions.includePrettier}
              onChange={() => handleOptionChange("includePrettier")}
              disabled={isAnalyzing}
              className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700 dark:text-secondary-300">
              Prettier
            </span>
          </label>
        </div>

        {/* 옵션 설명 */}
        {apiMode === "offline" && (
          <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
            💡 {t("analysisControls.offlineNotice")}
          </div>
        )}

        {analysisOptions.includeAI && apiMode !== "offline" && (
          <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
            {t("analysisControls.aiNotice")}
          </div>
        )}
      </div>

      {/* 단축키 안내 */}
      <div className="mt-4 text-xs text-secondary-500 dark:text-secondary-400 border-t border-secondary-200 dark:border-secondary-700 pt-3">
        <div className="flex flex-wrap gap-4">
          <span>
            <kbd className="px-1 py-0.5 bg-secondary-200 dark:bg-secondary-700 rounded">
              Ctrl+Enter
            </kbd>{" "}
            {t("analysisControls.shortcuts.analyze")}
          </span>
          <span>
            <kbd className="px-1 py-0.5 bg-secondary-200 dark:bg-secondary-700 rounded">
              Ctrl+Shift+F
            </kbd>{" "}
            {t("analysisControls.shortcuts.format")}
          </span>
          <span>
            <kbd className="px-1 py-0.5 bg-secondary-200 dark:bg-secondary-700 rounded">
              Ctrl+N
            </kbd>{" "}
            {t("analysisControls.shortcuts.new")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisControls;
