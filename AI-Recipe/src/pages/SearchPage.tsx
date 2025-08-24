import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchForm } from "@/components/recipe/SearchForm";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { AdvancedFilters } from "@/components/recipe/AdvancedFilters";
import { useRecipes } from "@/hooks/useRecipes";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecipeSearchParams } from "@/types";
import { Loader2, Search, Clock, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { translationService } from "@/services/translationService";

export default function SearchPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const { recipes, loading, error, hasSearched, searchRecipes, clearResults } =
    useRecipes();
  const { addToHistory, getRecentUniqueSearches, getPopularSearches } =
    useSearchHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Partial<RecipeSearchParams>>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [, forceUpdate] = useState({});
  const [translatedQueries, setTranslatedQueries] = useState<{
    [key: string]: string;
  }>({});

  // 언어 변경 시 강제 리렌더링
  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };

    // i18n 언어 변경 이벤트 리스너
    i18n.on("languageChanged", handleLanguageChange);

    // settingsChanged 이벤트 리스너 (언어 변경 감지)
    const handleSettingsChanged = (event: CustomEvent) => {
      if (event.detail?.language) {
        forceUpdate({});
      }
    };

    window.addEventListener(
      "settingsChanged",
      handleSettingsChanged as EventListener
    );

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
      window.removeEventListener(
        "settingsChanged",
        handleSettingsChanged as EventListener
      );
    };
  }, [i18n]);

  // 검색어 번역 함수
  const translateQuery = async (query: string): Promise<string> => {
    const currentLang = i18n.language as "ko" | "en";

    // 이미 번역된 쿼리가 있으면 반환
    const cacheKey = `${query}_${currentLang}`;
    if (translatedQueries[cacheKey]) {
      return translatedQueries[cacheKey];
    }

    try {
      const translated = await translationService.translateSearchQuery(
        query,
        currentLang
      );
      setTranslatedQueries((prev) => ({
        ...prev,
        [cacheKey]: translated,
      }));
      return translated;
    } catch (error) {
      console.error("Query translation failed:", error);
      return query; // 번역 실패 시 원본 반환
    }
  };

  // 언어 변경 시 번역된 쿼리 초기화
  useEffect(() => {
    setTranslatedQueries({});
  }, [i18n.language]);

  useEffect(() => {
    // URL에서 카테고리나 쿼리 파라미터가 있으면 자동 검색
    const category = searchParams.get("category");
    const query = searchParams.get("q");

    if (category) {
      setSearchQuery(category);
      handleSearchWithHistory(category, {});
    } else if (query) {
      setSearchQuery(query);
      handleSearchWithHistory(query, {});
    }
  }, [searchParams]);

  const handleSearchWithHistory = async (
    query: string,
    searchFilters: Partial<RecipeSearchParams> = {}
  ) => {
    setSearchQuery(query);
    const mergedFilters = { ...filters, ...searchFilters };
    await searchRecipes(query, mergedFilters);
    // 검색 완료 후 기록에 추가 (recipes 길이는 다음 렌더링에서 업데이트됨)
    setTimeout(() => {
      addToHistory(query, recipes.length);
    }, 100);
  };

  const handleSearch = (
    query: string,
    searchFilters: Partial<RecipeSearchParams> = {}
  ) => {
    handleSearchWithHistory(query, searchFilters);
  };

  const handleClear = () => {
    setSearchQuery("");
    setFilters({});
    setShowAdvancedFilters(false);
    clearResults();
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    handleSearchWithHistory(query, {});
  };

  const handleFiltersChange = (newFilters: Partial<RecipeSearchParams>) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    if (searchQuery.trim()) {
      handleSearchWithHistory(searchQuery, filters);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    if (searchQuery.trim()) {
      handleSearchWithHistory(searchQuery, {});
    }
  };

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  const recentSearches = getRecentUniqueSearches(5);
  const popularSearches = getPopularSearches(5);

  // 번역된 쿼리를 표시하는 컴포넌트
  const TranslatedQueryBadge = ({
    query,
    variant = "secondary",
    onClick,
  }: {
    query: string;
    variant?: "secondary" | "outline";
    onClick: () => void;
  }) => {
    const [displayText, setDisplayText] = useState(query);

    useEffect(() => {
      translateQuery(query).then(setDisplayText);
    }, [query, i18n.language]);

    return (
      <Badge
        variant={variant}
        className="cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30"
        onClick={onClick}
      >
        {displayText}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <SearchForm onSearch={handleSearch} initialQuery={searchQuery} />

          {/* Advanced Filters */}
          <div className="mt-6">
            <AdvancedFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              isVisible={showAdvancedFilters}
              onToggle={toggleAdvancedFilters}
            />
          </div>
        </div>

        {/* Search Results */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-300">{t("search.searching")}</span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleClear} variant="outline">
                {t("common.retry")}
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && hasSearched && recipes.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t("search.noResults")}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t("search.noResultsDescription")}
            </p>
            <Button onClick={handleClear} variant="outline">
              {t("search.clearSearch")}
            </Button>
          </div>
        )}

        {!loading && !error && !hasSearched && (
          <div>
            <div className="text-center py-12 mb-8">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("search.searchPrompt")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{t("search.placeholder")}</p>
            </div>

            {/* 검색 기록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* 최근 검색 */}
              {recentSearches.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      {t("search.recentSearches")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <TranslatedQueryBadge
                          key={index}
                          query={search.query}
                          variant="secondary"
                          onClick={() => handleQuickSearch(search.query)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 인기 검색 */}
              {popularSearches.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      {t("search.popularSearches")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((query, index) => (
                        <TranslatedQueryBadge
                          key={index}
                          query={query}
                          variant="outline"
                          onClick={() => handleQuickSearch(query)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {recipes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t("search.resultsCount", { count: recipes.length })}
              </h2>
              {hasSearched && (
                <Button onClick={handleClear} variant="outline">
                  {t("search.clearSearch")}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
