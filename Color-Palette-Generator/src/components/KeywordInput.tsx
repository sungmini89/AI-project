/**
 * @fileoverview 키워드 입력 및 색상 조화 선택 컴포넌트
 *
 * 사용자가 한국어 키워드를 입력하고 색상 조화 유형을 선택할 수 있는
 * 통합 입력 컴포넌트입니다. 자동완성, 제안 기능, 최근 검색어 등을 지원합니다.
 *
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 * @since 1.0.0
 *
 * **주요 기능:**
 * - 한국어 키워드 입력 및 검색
 * - 5가지 색상 조화 유형 선택
 * - 실시간 자동완성 및 제안
 * - 최근 검색어 표시
 * - 키워드 검색 히스토리 관리
 * - 접근성 지원 (키보드 네비게이션, ARIA)
 * - 로딩 상태 표시
 *
 * **색상 조화 유형:**
 * - 보색 조화 (Complementary)
 * - 유사색 조화 (Analogous)
 * - 삼원색 조화 (Triadic)
 * - 사원색 조화 (Tetradic)
 * - 단색 조화 (Monochromatic)
 *
 * **사용 예시:**
 * ```tsx
 * <KeywordInput
 *   onSearch={handleSearch}
 *   suggestions={keywordSuggestions}
 *   recentKeywords={recentKeywords}
 * />
 * ```
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, X } from "lucide-react";
import { HarmonyType } from "@/types/color";
import { cn } from "@/lib/utils";

/**
 * KeywordInput 컴포넌트의 Props 인터페이스
 *
 * @interface KeywordInputProps
 * @property {Function} onSearch - 키워드 검색 시 콜백 함수
 * @property {boolean} [isLoading=false] - 로딩 상태
 * @property {string} [placeholder] - 입력 필드 플레이스홀더 텍스트
 * @property {string[]} [suggestions=[]] - 키워드 제안 목록
 * @property {string[]} [recentKeywords=[]] - 최근 검색어 목록
 * @property {string} [className] - 추가 CSS 클래스명
 */
interface KeywordInputProps {
  onSearch: (keyword: string, harmonyType: HarmonyType) => void;
  isLoading?: boolean;
  placeholder?: string;
  suggestions?: string[];
  recentKeywords?: string[];
  className?: string;
}

const harmonyOptions: {
  value: HarmonyType;
  label: string;
  description: string;
}[] = [
  {
    value: "complementary",
    label: "보색 조화",
    description: "반대편 색상으로 강한 대비",
  },
  {
    value: "analogous",
    label: "유사색 조화",
    description: "인접한 색상들로 부드러운 조화",
  },
  { value: "triadic", label: "3색 조화", description: "120도 간격의 세 색상" },
  { value: "tetradic", label: "4색 조화", description: "90도 간격의 네 색상" },
  {
    value: "monochromatic",
    label: "단색 조화",
    description: "한 색상의 다양한 명도와 채도",
  },
];

export const KeywordInput: React.FC<KeywordInputProps> = ({
  onSearch,
  isLoading = false,
  placeholder = "색상을 표현하는 한국어 키워드를 입력하세요... (예: 바다, 석양, 봄날)",
  suggestions = [],
  recentKeywords = [],
  className,
}) => {
  const [keyword, setKeyword] = useState("");
  const [selectedHarmony, setSelectedHarmony] =
    useState<HarmonyType>("complementary");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHarmonySelector, setShowHarmonySelector] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  const filteredSuggestions = [...suggestions, ...recentKeywords]
    .filter(
      (suggestion, index, arr) =>
        suggestion.toLowerCase().includes(keyword.toLowerCase()) &&
        arr.indexOf(suggestion) === index // Remove duplicates
    )
    .slice(0, 8);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (keyword.trim() && !isLoading) {
        onSearch(keyword.trim(), selectedHarmony);
        setShowSuggestions(false);
      }
    },
    [keyword, selectedHarmony, isLoading, onSearch]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setKeyword(suggestion);
      setShowSuggestions(false);
      onSearch(suggestion, selectedHarmony);
    },
    [selectedHarmony, onSearch]
  );

  const handleKeywordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setKeyword(value);
      setShowSuggestions(value.length > 0 && filteredSuggestions.length > 0);
    },
    [filteredSuggestions.length]
  );

  const clearKeyword = useCallback(() => {
    setKeyword("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Keyword Input */}
        <div className="relative" ref={suggestionRef}>
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={handleKeywordChange}
              placeholder={placeholder}
              className="pr-20 text-base h-12"
              disabled={isLoading}
              onFocus={() =>
                setShowSuggestions(
                  keyword.length > 0 && filteredSuggestions.length > 0
                )
              }
            />

            {/* Clear button */}
            {keyword && (
              <button
                type="button"
                onClick={clearKeyword}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                disabled={isLoading}
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}

            {/* Search button */}
            <Button
              type="submit"
              size="sm"
              disabled={!keyword.trim() || isLoading}
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
              <div className="py-1">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Harmony Type Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              색상 조화 유형
            </label>
            <button
              type="button"
              onClick={() => setShowHarmonySelector(!showHarmonySelector)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              {showHarmonySelector ? "간단히 보기" : "자세히 보기"}
            </button>
          </div>

          {showHarmonySelector ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {harmonyOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "relative flex flex-col p-3 border rounded-lg cursor-pointer transition-all",
                    selectedHarmony === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <input
                    type="radio"
                    name="harmonyType"
                    value={option.value}
                    checked={selectedHarmony === option.value}
                    onChange={(e) =>
                      setSelectedHarmony(e.target.value as HarmonyType)
                    }
                    className="sr-only"
                  />
                  <span className="font-medium text-sm">{option.label}</span>
                  <span className="text-xs text-gray-600 mt-1">
                    {option.description}
                  </span>
                  {selectedHarmony === option.value && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          ) : (
            <select
              value={selectedHarmony}
              onChange={(e) =>
                setSelectedHarmony(e.target.value as HarmonyType)
              }
              className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              {harmonyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Search Button (Large) */}
        <Button
          type="submit"
          size="lg"
          disabled={!keyword.trim() || isLoading}
          className="w-full h-12 text-base font-medium"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
              색상 팔레트 생성 중...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              AI 색상 팔레트 생성
            </>
          )}
        </Button>
      </form>

      {/* Recent Keywords */}
      {recentKeywords.length > 0 && !showSuggestions && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            최근 검색어
          </h4>
          <div className="flex flex-wrap gap-2">
            {recentKeywords.slice(0, 6).map((recent, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(recent)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                disabled={isLoading}
              >
                {recent}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Example Keywords */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 mb-2">예시 키워드</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["바다", "석양", "봄날", "커피", "라벤더"].map((example) => (
            <button
              key={example}
              onClick={() => handleSuggestionClick(example)}
              className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
              disabled={isLoading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
