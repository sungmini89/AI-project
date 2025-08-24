import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useRecipes } from "@/hooks/useRecipes";
import { useFavorites } from "@/hooks/useFavorites";
import { storageService } from "@/services/storageService";
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { useTranslation } from "react-i18next";
import { useRecipeTranslation } from "@/hooks/useRecipeTranslation";
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  Heart,
  Loader2,
  AlertCircle,
  Share2,
  Download,
  Languages,
} from "lucide-react";

export default function RecipeDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { getRecipeDetails } = useRecipes();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { translatedRecipe, isTranslating, translateRecipe } =
    useRecipeTranslation();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, forceUpdate] = useState({});

  // Tag translation mapping
  const translateTag = (tag: string) => {
    const tagMap: Record<string, string> = {
      "한식": t("categories.korean"),
      "양식": t("categories.western"),
      "중식": t("categories.chinese"),
      "일식": t("categories.japanese"),
      "이탈리안": t("categories.italian"),
      "파스타": t("categories.pasta"),
      "토마토": t("categories.tomato"),
      "이탈리아": t("categories.italy")
    };
    return tagMap[tag] || tag;
  };

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

  useEffect(() => {
    if (id) {
      loadRecipe(id);
    }
  }, [id]);

  const loadRecipe = async (recipeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const recipeData = await getRecipeDetails(recipeId);
      if (recipeData) {
        setRecipe(recipeData);
        // 레시피 번역 시작
        translateRecipe(recipeData);
        // 조회 기록에 추가
        storageService.addRecipeToHistory(recipeId);
      } else {
        setError(t("recipe.notFound"));
      }
    } catch (err) {
      setError(t("recipe.loadError"));
      console.error(t("errors.loadRecipeError"), err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = () => {
    if (id) {
      toggleFavorite(id);
    }
  };

  const handleShare = async () => {
    if (!recipe) return;

    const shareData = {
      title: recipe.title,
      text: `${recipe.title} - ${t("recipe.shareText")}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // 폴백: 클립보드에 복사
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.url}`
        );
        alert(t("recipe.linkCopied"));
      }
    } catch (err) {
      console.error(t("recipe.shareError"), err);
    }
  };

  const handleDownload = () => {
    if (!recipe) return;

    const recipeText = `
${recipe.title}
${"=".repeat(recipe.title.length)}

${t("recipe.downloadContent.description")} ${
      recipe.description || recipe.summary
    }

${t("recipe.downloadContent.ingredients")}
${recipe.ingredients.map((ingredient) => `- ${ingredient}`).join("\n")}

${t("recipe.downloadContent.instructions")}
${recipe.instructions
  .map((instruction, index) => `${index + 1}. ${instruction}`)
  .join("\n")}

${t("recipe.downloadContent.cookingTime")} ${recipe.readyInMinutes} ${t(
      "recipe.cookingTime"
    )}
${t("recipe.downloadContent.servings")} ${recipe.servings} ${t(
      "recipe.servings"
    )}
${t("recipe.downloadContent.difficulty")} ${
      recipe.difficulty || t("recipe.downloadContent.defaultDifficulty")
    }

${t("recipe.downloadContent.createdDate")} ${new Date().toLocaleDateString()}
${t("recipe.downloadContent.source")}
    `.trim();

    const blob = new Blob([recipeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${recipe.title.replace(/[^a-zA-Z0-9가-힣]/g, "_")}${t(
      "recipe.downloadFilename"
    )}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">{t("recipe.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            {error || t("recipe.notFound")}
          </h2>
          <Link to="/search">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("recipe.backToSearch")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 번역된 레시피가 있으면 사용, 없으면 원본 사용
  const displayRecipe = translatedRecipe || recipe;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link to="/search">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("recipe.backToSearch")}
            </Button>
          </Link>
        </div>

        {/* Recipe Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="relative">
            {recipe.image && (
              <OptimizedImage
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-64 md:h-80 object-cover"
                lazy={false}
                blur={true}
              />
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="bg-white"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="bg-white"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant={isFavorite(id || "") ? "default" : "outline"}
                size="sm"
                onClick={handleFavorite}
                className={
                  isFavorite(id || "")
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-white"
                }
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite(id || "") ? "fill-current" : ""
                  }`}
                />
              </Button>
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3">
              {displayRecipe.title}
              {isTranslating && (
                <Languages className="w-6 h-6 text-blue-500 animate-pulse" />
              )}
            </h1>

            {displayRecipe.summary && (
              <p className="text-gray-600 dark:text-gray-300 mb-4">{displayRecipe.summary}</p>
            )}

            {/* Recipe Meta */}
            <div className="flex flex-wrap gap-4 mb-4">
              {displayRecipe.readyInMinutes && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>
                    {displayRecipe.readyInMinutes} {t("recipe.cookingTime")}
                  </span>
                </div>
              )}

              {displayRecipe.servings && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Users className="w-4 h-4 mr-1" />
                  <span>
                    {displayRecipe.servings} {t("recipe.servings")}
                  </span>
                </div>
              )}

              {displayRecipe.difficulty && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <ChefHat className="w-4 h-4 mr-1" />
                  <span>{displayRecipe.difficulty}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {recipe.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {translateTag(tag)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t("recipe.ingredients")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {displayRecipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">
                      • {ingredient}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Nutrition Info */}
            {recipe.nutrition && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>{t("recipe.nutritionInfo")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t("recipe.calories")}</span>
                      <span>
                        {recipe.nutrition.calories} {t("recipe.nutrition.kcal")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("recipe.protein")}</span>
                      <span>
                        {recipe.nutrition.protein}
                        {t("recipe.nutrition.grams")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("recipe.carbs")}</span>
                      <span>
                        {recipe.nutrition.carbohydrates}
                        {t("recipe.nutrition.grams")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("recipe.fat")}</span>
                      <span>
                        {recipe.nutrition.fat}
                        {t("recipe.nutrition.grams")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("recipe.instructions")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {displayRecipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-orange-700">
                          {index + 1}
                        </span>
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 pt-1">{instruction}</div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
