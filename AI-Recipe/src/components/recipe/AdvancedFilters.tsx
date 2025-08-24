import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RecipeSearchParams } from "@/types";
import { useTranslation } from "react-i18next";
import { Filter, X, ChefHat, Clock, Heart, Utensils, Plus } from "lucide-react";

interface AdvancedFiltersProps {
  filters: Partial<RecipeSearchParams>;
  onFiltersChange: (filters: Partial<RecipeSearchParams>) => void;
  onApply: () => void;
  onClear: () => void;
  isVisible: boolean;
  onToggle: () => void;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onApply,
  onClear,
  isVisible,
  onToggle,
}: AdvancedFiltersProps) {
  const { t } = useTranslation();
  const [newDietaryRestriction, setNewDietaryRestriction] = useState("");
  const [newIntolerance, setNewIntolerance] = useState("");

  const cuisines = [
    { value: "korean", label: t("categories.korean") },
    { value: "chinese", label: t("categories.chinese") },
    { value: "japanese", label: t("categories.japanese") },
    { value: "western", label: t("categories.western") },
    { value: "italian", label: t("categories.italian") },
    { value: "mexican", label: t("categories.mexican") },
    { value: "indian", label: t("categories.indian") },
    { value: "thai", label: t("categories.thai") },
    { value: "french", label: t("categories.french") },
    { value: "spanish", label: t("categories.spanish") },
    { value: "greek", label: t("categories.greek") },
    { value: "turkish", label: t("categories.turkish") },
    { value: "brazilian", label: t("categories.brazilian") },
    { value: "vietnamese", label: t("categories.vietnamese") },
  ];

  const diets = [
    { value: "vegetarian", label: t("search.searchForm.vegetarian") },
    { value: "vegan", label: t("search.searchForm.vegan") },
    { value: "pescetarian", label: t("categories.pescetarian") },
    { value: "ketogenic", label: t("search.searchForm.ketogenic") },
    { value: "paleo", label: t("categories.paleo") },
    { value: "gluten-free", label: t("search.searchForm.glutenFree") },
  ];

  const intolerances = [
    "gluten",
    "dairy",
    "egg",
    "peanut",
    "tree-nut",
    "soy",
    "shellfish",
    "sesame",
  ];

  const difficulties = [
    { value: "easy", label: t("search.advancedFilters.easy") },
    { value: "medium", label: t("search.advancedFilters.medium") },
    { value: "hard", label: t("search.advancedFilters.hard") },
  ];

  const sortOptions = [
    { value: "healthiness", label: t("search.advancedFilters.healthiness") },
    { value: "time", label: t("search.advancedFilters.time") },
    { value: "popularity", label: t("search.advancedFilters.popularity") },
    { value: "random", label: t("search.advancedFilters.random") },
  ];

  const updateFilters = (key: keyof RecipeSearchParams, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addDietaryRestriction = () => {
    if (newDietaryRestriction.trim()) {
      const current = filters.dietary || [];
      if (!current.includes(newDietaryRestriction)) {
        updateFilters("dietary", [...current, newDietaryRestriction]);
      }
      setNewDietaryRestriction("");
    }
  };

  const removeDietaryRestriction = (restriction: string) => {
    const current = filters.dietary || [];
    updateFilters(
      "dietary",
      current.filter((d) => d !== restriction)
    );
  };

  const addIntolerance = () => {
    if (newIntolerance.trim()) {
      const current = filters.intolerances || [];
      if (!current.includes(newIntolerance)) {
        updateFilters("intolerances", [...current, newIntolerance]);
      }
      setNewIntolerance("");
    }
  };

  const removeIntolerance = (intolerance: string) => {
    const current = filters.intolerances || [];
    updateFilters(
      "intolerances",
      current.filter((i) => i !== intolerance)
    );
  };

  const toggleIntolerance = (intolerance: string) => {
    const current = filters.intolerances || [];
    if (current.includes(intolerance)) {
      updateFilters(
        "intolerances",
        current.filter((i) => i !== intolerance)
      );
    } else {
      updateFilters("intolerances", [...current, intolerance]);
    }
  };

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof RecipeSearchParams];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== "" && value !== 0;
  });

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          {t("search.advancedFilters.title")}
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {
                Object.keys(filters).filter((key) => {
                  const value = filters[key as keyof RecipeSearchParams];
                  if (Array.isArray(value)) return value.length > 0;
                  return value !== undefined && value !== "" && value !== 0;
                }).length
              }
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="w-4 h-4 mr-1" />
            {t("search.advancedFilters.clearFilters")}
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {isVisible && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("search.advancedFilters.detailedFilters")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 시간 및 서빙 필터 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="maxReadyTime">
                  {t("search.advancedFilters.maxCookingTime")}
                </Label>
                <Input
                  id="maxReadyTime"
                  type="number"
                  min={5}
                  max={180}
                  value={filters.maxReadyTime || ""}
                  onChange={(e) =>
                    updateFilters(
                      "maxReadyTime",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  placeholder="예: 30"
                />
              </div>

              <div>
                <Label htmlFor="servings">
                  {t("search.advancedFilters.servings")}
                </Label>
                <Input
                  id="servings"
                  type="number"
                  min={1}
                  max={12}
                  value={filters.servings || ""}
                  onChange={(e) =>
                    updateFilters(
                      "servings",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  placeholder="예: 2"
                />
              </div>

              <div>
                <Label htmlFor="minHealthScore">
                  {t("search.advancedFilters.minHealthScore")}
                </Label>
                <Input
                  id="minHealthScore"
                  type="number"
                  min={0}
                  max={100}
                  value={filters.minHealthScore || ""}
                  onChange={(e) =>
                    updateFilters(
                      "minHealthScore",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  placeholder="0-100"
                />
              </div>
            </div>

            {/* 칼로리 범위 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minCalories">
                  {t("search.advancedFilters.minCalories")}
                </Label>
                <Input
                  id="minCalories"
                  type="number"
                  min={0}
                  value={filters.minCalories || ""}
                  onChange={(e) =>
                    updateFilters(
                      "minCalories",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  placeholder="예: 200"
                />
              </div>

              <div>
                <Label htmlFor="maxCalories">
                  {t("search.advancedFilters.maxCalories")}
                </Label>
                <Input
                  id="maxCalories"
                  type="number"
                  min={0}
                  value={filters.maxCalories || ""}
                  onChange={(e) =>
                    updateFilters(
                      "maxCalories",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  placeholder="예: 800"
                />
              </div>
            </div>

            {/* 요리 스타일 & 난이도 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cuisine">
                  {t("search.advancedFilters.cuisineStyle")}
                </Label>
                <select
                  id="cuisine"
                  value={filters.cuisine || ""}
                  onChange={(e) =>
                    updateFilters("cuisine", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">
                    {t("search.advancedFilters.noSelection")}
                  </option>
                  {cuisines.map((cuisine) => (
                    <option key={cuisine.value} value={cuisine.value}>
                      {cuisine.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="difficulty">
                  {t("search.advancedFilters.difficulty")}
                </Label>
                <select
                  id="difficulty"
                  value={filters.difficulty || ""}
                  onChange={(e) =>
                    updateFilters(
                      "difficulty",
                      (e.target.value as any) || undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">
                    {t("search.advancedFilters.noSelection")}
                  </option>
                  {difficulties.map((diff) => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="sort">
                  {t("search.advancedFilters.sortBy")}
                </Label>
                <select
                  id="sort"
                  value={filters.sort || ""}
                  onChange={(e) =>
                    updateFilters("sort", (e.target.value as any) || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">
                    {t("search.advancedFilters.default")}
                  </option>
                  {sortOptions.map((sort) => (
                    <option key={sort.value} value={sort.value}>
                      {sort.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 식단 유형 */}
            <div>
              <Label>{t("search.advancedFilters.dietType")}</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {diets.map((diet) => (
                  <Button
                    key={diet.value}
                    variant={
                      filters.diet === diet.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      updateFilters(
                        "diet",
                        filters.diet === diet.value ? undefined : diet.value
                      )
                    }
                  >
                    {diet.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 알레르기/민감 반응 */}
            <div>
              <Label>{t("search.advancedFilters.allergies")}</Label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {intolerances.map((intolerance) => (
                  <Button
                    key={intolerance}
                    variant={
                      (filters.intolerances || []).includes(intolerance)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => toggleIntolerance(intolerance)}
                    className="justify-start"
                  >
                    {intolerance}
                  </Button>
                ))}
              </div>
            </div>

            {/* 사용자 정의 식이 제한 */}
            <div>
              <Label>{t("search.advancedFilters.otherDietary")}</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newDietaryRestriction}
                  onChange={(e) => setNewDietaryRestriction(e.target.value)}
                  placeholder={t("search.advancedFilters.addRestriction")}
                  onKeyPress={(e) =>
                    e.key === "Enter" && addDietaryRestriction()
                  }
                />
                <Button onClick={addDietaryRestriction} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {filters.dietary && filters.dietary.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {filters.dietary.map((restriction) => (
                    <Badge
                      key={restriction}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {restriction}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeDietaryRestriction(restriction)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 적용 버튼들 */}
            <div className="flex gap-2 pt-4">
              <Button onClick={onApply} className="flex-1">
                {t("search.advancedFilters.applyFilters")}
              </Button>
              <Button variant="outline" onClick={onClear}>
                {t("search.advancedFilters.reset")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
