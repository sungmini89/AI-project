/**
 * AI 분석 결과 탭 컴포넌트
 * AI가 분석한 코드 품질 점수, 발견된 이슈, 개선 제안을 표시하는 탭
 * @module components/features/analysis/AITab
 */

import React from "react";
import { useLanguage } from "../../../hooks/useLanguage";
import type { AIAnalysisResult, AIIssue, AISuggestion } from "../../../types";

/**
 * AI 탭 컴포넌트의 Props 인터페이스
 */
interface AITabProps {
  /** AI 분석 결과 */
  ai?: AIAnalysisResult;
}

/**
 * AI 분석 결과 탭 컴포넌트
 * AI가 제공한 코드 품질 점수, 이슈, 개선 제안을 종합적으로 표시
 * @param ai - AI 분석 결과
 * @returns AI 탭 UI
 */
export const AITab: React.FC<AITabProps> = React.memo(({ ai }) => {
  const { t } = useLanguage();

  /** AI 분석 결과가 없는 경우 안내 메시지 표시 */
  if (!ai) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🤖</div>
        <p className="text-secondary-600 dark:text-secondary-400">
          {t("analysis.noAIData")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI 점수 표시 */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-secondary-900 dark:text-white">
            {t("analysis.aiScore")}
          </h4>
          <span className="text-xs text-secondary-500 dark:text-secondary-500">
            {ai.provider} • {ai.model}
          </span>
        </div>

        <div className="text-center">
          <div
            className={`text-4xl font-bold ${
              ai.score >= 90
                ? "text-green-600"
                : ai.score >= 70
                  ? "text-yellow-600"
                  : "text-red-600"
            }`}
          >
            {ai.score}
          </div>
          <div className="text-sm text-secondary-600 dark:text-secondary-400">
            / 100 점 (신뢰도: {Math.round(ai.confidence * 100)}%)
          </div>
        </div>
      </div>

      {/* 발견된 이슈들 표시 */}
      {ai.issues && ai.issues.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
            {t("analysis.foundIssues")}
          </h4>
          <div className="space-y-3">
            {ai.issues.map((issue: AIIssue, index: number) => (
              <AIIssueCard key={index} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {/* 개선 제안사항들 표시 */}
      {ai.suggestions && ai.suggestions.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
            {t("analysis.improvements")}
          </h4>
          <div className="space-y-3">
            {ai.suggestions.map((suggestion: AISuggestion, index: number) => (
              <AISuggestionCard key={index} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

/**
 * AI 이슈 카드 컴포넌트
 * AI가 발견한 개별 이슈를 표시
 * @param issue - AI 이슈 데이터
 * @returns AI 이슈 카드 UI
 */
const AIIssueCard: React.FC<{ issue: AIIssue }> = ({ issue }) => {
  const { t } = useLanguage();

  return (
    <div className="card p-4">
      <div className="flex items-start space-x-3">
        {/* 심각도 표시 원형 아이콘 */}
        <div
          className={`w-2 h-2 rounded-full mt-2 ${
            issue.severity === "critical"
              ? "bg-red-500"
              : issue.severity === "high"
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
                issue.severity === "critical"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : issue.severity === "high"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              }`}
            >
              {issue.severity}
            </span>
            <span className="text-xs text-secondary-500 dark:text-secondary-500">
              {issue.type}
            </span>
          </div>

          <p className="text-secondary-700 dark:text-secondary-300 mb-2">
            {issue.message}
          </p>

          <div className="text-sm text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-700 p-2 rounded">
            {issue.explanation}
          </div>

          {issue.fix && (
            <div className="mt-2 text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-2 rounded">
              🔧 {t("analysis.fixSuggestion")} {issue.fix}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AISuggestionCard: React.FC<{ suggestion: AISuggestion }> = ({
  suggestion,
}) => (
  <div className="card p-4 border-l-4 border-blue-500">
    <div className="flex items-start space-x-3">
      <span className="text-blue-500 text-lg">💡</span>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              suggestion.priority === "high"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : suggestion.priority === "medium"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            }`}
          >
            {suggestion.priority} priority
          </span>
          <span className="text-xs text-secondary-500 dark:text-secondary-500">
            {suggestion.type}
          </span>
        </div>

        <p className="text-secondary-700 dark:text-secondary-300 mb-2">
          {suggestion.description}
        </p>

        {suggestion.example && (
          <code className="text-xs bg-secondary-100 dark:bg-secondary-800 p-2 rounded block">
            {suggestion.example}
          </code>
        )}
      </div>
    </div>
  </div>
);

export default AITab;
