/**
 * 보안 분석 결과 탭 컴포넌트
 * 코드에서 발견된 보안 취약점들을 심각도별로 표시하는 탭
 * @module components/features/analysis/SecurityTab
 */

import React from "react";
import { useLanguage } from "../../../hooks/useLanguage";
import type { SecurityAnalysis, SecurityIssue } from "../../../types";

/**
 * 보안 탭 컴포넌트의 Props 인터페이스
 */
interface SecurityTabProps {
  /** 보안 분석 결과 */
  security?: SecurityAnalysis;
}

/**
 * 보안 분석 결과 탭 컴포넌트
 * 보안 취약점들을 심각도별로 구분하여 표시하고 해결 방안을 제시
 * @param security - 보안 분석 결과
 * @returns 보안 탭 UI
 */
export const SecurityTab: React.FC<SecurityTabProps> = React.memo(
  ({ security }) => {
    const { t } = useLanguage();

    /** 보안 이슈가 없는 경우 안전 메시지 표시 */
    if (!security || security.issues.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🛡️</div>
          <p className="text-secondary-600 dark:text-secondary-400">
            {t("analysis.noSecurityIssues")}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {security.issues.map((issue: SecurityIssue, index: number) => (
          <div key={index} className="card p-4">
            <div className="flex items-start space-x-3">
              {/* 심각도 표시 원형 아이콘 */}
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  issue.severity === "critical"
                    ? "bg-red-500"
                    : issue.severity === "high"
                      ? "bg-orange-500"
                      : issue.severity === "medium"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                }`}
              />

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {/* 라인 번호 */}
                  <span className="font-mono text-sm text-secondary-600 dark:text-secondary-400">
                    {t("analysis.line")} {issue.line}
                  </span>
                  {/* 심각도 배지 */}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      issue.severity === "critical"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : issue.severity === "high"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                          : issue.severity === "medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    }`}
                  >
                    {issue.severity}
                  </span>
                  {/* 이슈 타입 */}
                  <span className="text-xs text-secondary-500 dark:text-secondary-500">
                    {issue.type}
                  </span>
                </div>

                {/* 보안 이슈 설명 */}
                <p className="text-secondary-700 dark:text-secondary-300 mb-2">
                  {issue.message}
                </p>

                {/* 해결 방안 제안 (있는 경우) */}
                {issue.suggestion && (
                  <p className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    💡 {issue.suggestion}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

export default SecurityTab;
