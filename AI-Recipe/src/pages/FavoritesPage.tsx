import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { Button } from "@/components/ui/button";
import { Recipe } from "@/types";
import { useTranslation } from "react-i18next";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";

export default function FavoritesPage() {
  const { t } = useTranslation();
  const { favoriteCount, getFavoriteRecipes } = useFavorites();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoriteRecipes();
  }, [favoriteCount]);

  const loadFavoriteRecipes = async () => {
    try {
      setLoading(true);
      const recipes = await getFavoriteRecipes();
      setFavoriteRecipes(recipes);
    } catch (error) {
      console.error(t("errors.loadFavoritesFailed"), error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">{t("favorites.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t("favorites.title")}
            </h1>
          </div>

          <p className="text-gray-600 dark:text-gray-300">
            {t("favorites.description", { count: favoriteCount })}
          </p>
        </div>

        {/* Content */}
        {favoriteRecipes.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t("favorites.empty")}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t("favorites.emptyDescription")}
            </p>
            <Link to="/search">
              <Button>{t("search.title")}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
