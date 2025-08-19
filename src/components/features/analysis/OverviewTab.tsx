/**
 * 분석 개요 탭 컴포넌트
 * 코드 분석 결과의 전체적인 요약과 주요 이슈들을 한눈에 볼 수 있는 탭
 * @module components/features/analysis/OverviewTab
 */

import React from "react";
import { useLanguage } from "../../../hooks/useLanguage";
import type { CodeAnalysis } from "../../../types";

/**
 * 분석 개요 탭 컴포넌트의 Props 인터페이스
 */
interface OverviewTabProps {
  /** 분석할 코드 분석 결과 */
  analysis: CodeAnalysis;
}

/**
 * 분석 개요 탭 컴포넌트
 * ESLint, 복잡도, 보안, AI 분석 결과를 요약하여 표시
 * @param analysis - 코드 분석 결과
 * @returns 분석 개요 탭 UI
 */
export const OverviewTab: React.FC<OverviewTabProps> = React.memo(
  ({ analysis }) => {
    const { t } = useLanguage();
    const { results } = analysis;

    /** 분석 통계 데이터 */
    const stats = {
      eslintIssues: results.eslint?.length || 0,
      complexityScore: results.complexity?.cyclomatic || 0,
      securityIssues: results.security?.issues.length || 0,
      aiScore: results.ai?.score || 0,
      prettierChanged: results.prettier?.changed || false,
    };

    return (
      <div className="space-y-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            {t("analysis.summary")}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.eslintIssues}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {t("analysis.eslintIssues")}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.complexityScore}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {t("analysis.cyclomaticComplexity")}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.securityIssues}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {t("analysis.securityIssues")}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.aiScore}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {t("analysis.aiScore")}
              </div>
            </div>
          </div>
        </div>

        {results.ai && (
          <div className="card p-6">
            <h4 className="text-md font-semibold text-secondary-900 dark:text-white mb-3">
              🤖 {t("analysis.summary")}
            </h4>
            <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed">
              {results.ai.summary}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="text-md font-semibold text-secondary-900 dark:text-white">
            {t("analysis.mainIssues")}
          </h4>

          {stats.eslintIssues === 0 &&
          stats.securityIssues === 0 &&
          (!results.ai || results.ai.issues.length === 0) ? (
            <div className="card p-6 text-center text-green-600 dark:text-green-400">
              ✅ {t("analysis.noIssuesFound")}
            </div>
          ) : (
            <div className="space-y-2">
              {results.eslint?.slice(0, 3).map((issue, index) => (
                <IssueCard key={index} issue={issue} type="eslint" />
              ))}
              {results.security?.issues.slice(0, 3).map((issue, index) => (
                <IssueCard key={index} issue={issue} type="security" />
              ))}
              {results.ai?.issues.slice(0, 3).map((issue, index) => (
                <IssueCard key={index} issue={issue} type="ai" />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

const IssueCard: React.FC<{ issue: any; type: string }> = ({ issue, type }) => {
  const { t } = useLanguage();

  return (
    <div className="card p-4">
      <div className="flex items-start space-x-3">
        <div
          className={`w-2 h-2 rounded-full mt-2 ${
            issue.severity === "error" || issue.severity === "critical"
              ? "bg-red-500"
              : issue.severity === "warning" || issue.severity === "high"
                ? "bg-yellow-500"
                : "bg-blue-500"
          }`}
        />

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            {issue.line && (
              <span className="font-mono text-sm text-secondary-600 dark:text-secondary-400">
                {t("analysis.line")} {issue.line}
              </span>
            )}
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                issue.severity === "error" || issue.severity === "critical"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : issue.severity === "warning" || issue.severity === "high"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              }`}
            >
              {issue.severity}
            </span>
            <span className="text-xs text-secondary-500 dark:text-secondary-500">
              {type}
            </span>
          </div>

          <p className="text-secondary-700 dark:text-secondary-300">
            {issue.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
