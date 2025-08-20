/**
 * 언어 선택기 UI 컴포넌트
 * 사용자가 한국어와 영어 중에서 선택할 수 있는 드롭다운 컴포넌트
 * @module components/ui/LanguageSelector
 */

import React from "react";
import { useLanguageStore } from "../../stores/languageStore";
import type { SupportedLanguage } from "../../stores/languageStore";

/**
 * 언어 선택기 컴포넌트
 * 현재 언어를 표시하고 언어 변경을 위한 드롭다운을 제공
 * @returns 언어 선택기 UI
 */
export const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage, getText } = useLanguageStore();

  /**
   * 언어 변경 핸들러
   * @param language - 선택된 언어
   */
  const handleLanguageChange = (language: SupportedLanguage) => {
    setLanguage(language);
  };

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
        {getText("settings.appearance.language")}
      </label>
      <select
        value={currentLanguage}
        onChange={(e) =>
          handleLanguageChange(e.target.value as SupportedLanguage)
        }
        className="input-field max-w-xs"
      >
        <option value="ko">🇰🇷 한국어</option>
        <option value="en">🇺🇸 English</option>
      </select>
    </div>
  );
};
