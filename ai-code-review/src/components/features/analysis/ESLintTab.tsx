/**
 * ESLint 분석 결과 탭 컴포넌트
 * ESLint 규칙 위반 사항들을 상세하게 표시하는 탭
 * @module components/features/analysis/ESLintTab
 */

import React from "react";
import { useLanguage } from "../../../hooks/useLanguage";
import type { ESLintResult } from "../../../types";

/**
 * ESLint 탭 컴포넌트의 Props 인터페이스
 */
interface ESLintTabProps {
  /** ESLint 분석 결과 배열 */
  results: ESLintResult[];
}

/**
 * ESLint 분석 결과 탭 컴포넌트
 * ESLint 규칙 위반 사항들을 심각도별로 구분하여 표시
 * @param results - ESLint 분석 결과 배열
 * @returns ESLint 탭 UI
 */
export const ESLintTab: React.FC<ESLintTabProps> = React.memo(({ results }) => {
  const { t } = useLanguage();

  /** 결과가 없는 경우 성공 메시지 표시 */
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">✅</div>
        <p className="text-secondary-600 dark:text-secondary-400">
          {t("analysis.noSecurityIssues").replace("보안", "ESLint")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result, index) => (
        <div key={index} className="card p-4">
          <div className="flex items-start space-x-3">
            {/* 심각도 표시 원형 아이콘 */}
            <div
              className={`w-2 h-2 rounded-full mt-2 ${
                result.severity === "error"
                  ? "bg-red-500"
                  : result.severity === "warning"
                    ? "bg-yellow-500"
                    : "bg-blue-500"
              }`}
            />

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {/* 라인:컬럼 정보 */}
                <span className="font-mono text-sm text-secondary-600 dark:text-secondary-400">
                  {t("analysis.line")} {result.line}:{result.column}
                </span>
                {/* 심각도 배지 */}
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    result.severity === "error"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : result.severity === "warning"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {result.severity}
                </span>
                {/* 규칙 ID */}
                <span className="text-xs text-secondary-500 dark:text-secondary-500">
                  {result.ruleId}
                </span>
              </div>

              {/* 에러 메시지 */}
              <p className="text-secondary-700 dark:text-secondary-300 mb-2">
                {result.message}
              </p>

              {/* 문제가 발생한 코드 라인 */}
              <code className="text-xs bg-secondary-100 dark:bg-secondary-800 p-2 rounded block overflow-x-auto">
                {result.source}
              </code>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default ESLintTab;
