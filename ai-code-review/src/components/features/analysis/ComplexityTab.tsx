/**
 * 복잡도 분석 결과 탭 컴포넌트
 * 코드의 순환 복잡도와 인지 복잡도를 시각적으로 표시하는 탭
 * @module components/features/analysis/ComplexityTab
 */

import React from "react";
import { useLanguage } from "../../../hooks/useLanguage";
import type { ComplexityAnalysis, FunctionComplexity } from "../../../types";

/**
 * 복잡도 탭 컴포넌트의 Props 인터페이스
 */
interface ComplexityTabProps {
  /** 복잡도 분석 결과 */
  complexity?: ComplexityAnalysis;
}

/**
 * 복잡도 분석 결과 탭 컴포넌트
 * 전체 코드와 함수별 복잡도를 색상으로 구분하여 표시
 * @param complexity - 복잡도 분석 결과
 * @returns 복잡도 탭 UI
 */
export const ComplexityTab: React.FC<ComplexityTabProps> = React.memo(
  ({ complexity }) => {
    const { t } = useLanguage();

    /** 복잡도 데이터가 없는 경우 안내 메시지 표시 */
    if (!complexity) {
      return (
        <div className="text-center py-12">
          <p className="text-secondary-600 dark:text-secondary-400">
            {t("analysis.noComplexityData")}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="card p-6">
          <h4 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
            {t("analysis.totalComplexity")}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 순환 복잡도 표시 */}
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${
                  complexity.cyclomatic <= 10
                    ? "text-green-600"
                    : complexity.cyclomatic <= 20
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {complexity.cyclomatic}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {t("analysis.cyclomaticComplexity")}
              </div>
            </div>

            {/* 인지 복잡도 표시 */}
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${
                  complexity.cognitive <= 15
                    ? "text-green-600"
                    : complexity.cognitive <= 25
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {complexity.cognitive}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {t("analysis.cognitive")} 복잡도
              </div>
            </div>

            {/* 총 라인 수 표시 */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {complexity.lines}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {t("analysis.totalLines")}
              </div>
            </div>
          </div>
        </div>

        {/* 함수별 복잡도 상세 정보 */}
        {complexity.functions && complexity.functions.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
              {t("analysis.functionComplexity")}
            </h4>
            <div className="space-y-3">
              {complexity.functions.map(
                (func: FunctionComplexity, index: number) => (
                  <div key={index} className="card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-semibold text-secondary-900 dark:text-white">
                          {func.name}
                        </span>
                        <span className="text-sm text-secondary-600 dark:text-secondary-400 ml-2">
                          {t("analysis.line")} {func.line}
                        </span>
                      </div>
                      <div className="flex space-x-4">
                        <div className="text-right">
                          <div
                            className={`font-bold ${
                              func.cyclomatic <= 10
                                ? "text-green-600"
                                : func.cyclomatic <= 20
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {func.cyclomatic}
                          </div>
                          <div className="text-xs text-secondary-500">
                            {t("analysis.cyclomatic")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-bold ${
                              func.cognitive <= 15
                                ? "text-green-600"
                                : func.cognitive <= 25
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {func.cognitive}
                          </div>
                          <div className="text-xs text-secondary-500">
                            {t("analysis.cognitive")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default ComplexityTab;
