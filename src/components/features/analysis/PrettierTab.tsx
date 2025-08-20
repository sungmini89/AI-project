/**
 * Prettier 포맷팅 결과 탭 컴포넌트
 * 코드 포맷팅 결과와 변경사항을 시각적으로 표시하는 탭
 * @module components/features/analysis/PrettierTab
 */

import React from "react";
import { useLanguage } from "../../../hooks/useLanguage";
import type { PrettierResult } from "../../../types";

/**
 * Prettier 탭 컴포넌트의 Props 인터페이스
 */
interface PrettierTabProps {
  /** Prettier 포맷팅 결과 */
  prettier?: PrettierResult;
}

/**
 * Prettier 포맷팅 결과 탭 컴포넌트
 * 코드 포맷팅 적용 여부와 변경사항을 표시
 * @param prettier - Prettier 포맷팅 결과
 * @returns Prettier 탭 UI
 */
export const PrettierTab: React.FC<PrettierTabProps> = React.memo(
  ({ prettier }) => {
    const { t } = useLanguage();

    /** Prettier 데이터가 없는 경우 안내 메시지 표시 */
    if (!prettier) {
      return (
        <div className="text-center py-12">
          <p className="text-secondary-600 dark:text-secondary-400">
            {t("analysis.noPrettierData")}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="card p-6">
          <h4 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
            {t("analysis.formattingResult")}
          </h4>

          {/* 포맷팅 변경사항이 있는 경우 */}
          {prettier.changed ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">✨</div>
                <p className="text-secondary-700 dark:text-secondary-300">
                  {t("analysis.formattingApplied")}
                </p>
              </div>

              {/* 변경사항 diff 표시 */}
              {prettier.diff && (
                <div className="bg-secondary-100 dark:bg-secondary-800 p-4 rounded">
                  <h5 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                    {t("analysis.changes")}
                  </h5>
                  <pre className="text-xs overflow-x-auto">
                    <code>{prettier.diff}</code>
                  </pre>
                </div>
              )}
            </div>
          ) : (
            /* 포맷팅 변경사항이 없는 경우 */
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">✅</div>
              <p className="text-secondary-700 dark:text-secondary-300">
                {t("analysis.alreadyFormatted")}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default PrettierTab;
