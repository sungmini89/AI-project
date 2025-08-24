import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Recipe } from "../types";
import {
  translationService,
  TranslatedRecipe,
} from "../services/translationService";

interface UseRecipeTranslationResult {
  translatedRecipe: TranslatedRecipe | null;
  isTranslating: boolean;
  translationError: string | null;
  translateRecipe: (recipe: Recipe) => Promise<void>;
  clearTranslation: () => void;
}

export function useRecipeTranslation(): UseRecipeTranslationResult {
  const { i18n } = useTranslation();
  const [translatedRecipe, setTranslatedRecipe] =
    useState<TranslatedRecipe | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const translateRecipe = useCallback(
    async (recipe: Recipe) => {
      if (!recipe) return;

      const currentLang = i18n.language as "ko" | "en";

      // 이미 같은 언어로 번역된 경우 스킵
      if (
        translatedRecipe &&
        translatedRecipe.id === recipe.id &&
        translatedRecipe.translatedLanguage === currentLang
      ) {
        return;
      }

      setIsTranslating(true);
      setTranslationError(null);

      try {
        const translated = await translationService.translateRecipe(
          recipe,
          currentLang
        );
        setTranslatedRecipe(translated);
      } catch (error) {
        setTranslationError(
          error instanceof Error ? error.message : "Translation failed"
        );
        console.error("Recipe translation error:", error);
      } finally {
        setIsTranslating(false);
      }
    },
    [i18n.language, translatedRecipe]
  );

  const clearTranslation = useCallback(() => {
    setTranslatedRecipe(null);
    setTranslationError(null);
  }, []);

  // 언어가 변경되면 다시 번역
  useEffect(() => {
    if (translatedRecipe) {
      const currentLang = i18n.language as "ko" | "en";
      if (translatedRecipe.translatedLanguage !== currentLang) {
        // 원본 레시피로 다시 번역
        const originalRecipe: Recipe = {
          id: translatedRecipe.id,
          title: translatedRecipe.title,
          summary: translatedRecipe.summary,
          ingredients: translatedRecipe.ingredients,
          instructions: translatedRecipe.instructions,
          image: translatedRecipe.image,
          readyInMinutes: translatedRecipe.readyInMinutes,
          servings: translatedRecipe.servings,
          difficulty: translatedRecipe.difficulty,
          tags: translatedRecipe.tags,
          nutrition: translatedRecipe.nutrition,
          healthScore: translatedRecipe.healthScore,
        };
        translateRecipe(originalRecipe);
      }
    }
  }, [i18n.language, translatedRecipe, translateRecipe]);

  return {
    translatedRecipe,
    isTranslating,
    translationError,
    translateRecipe,
    clearTranslation,
  };
}

// 레시피 배열 번역을 위한 훅
export function useRecipeListTranslation() {
  const { i18n } = useTranslation();
  const [translatedRecipes, setTranslatedRecipes] = useState<{
    [key: string]: TranslatedRecipe;
  }>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const translateRecipes = useCallback(
    async (recipes: Recipe[]) => {
      if (!recipes || recipes.length === 0) return;

      const currentLang = i18n.language as "ko" | "en";
      setIsTranslating(true);
      setTranslationError(null);

      try {
        const translations = await Promise.all(
          recipes.map((recipe) =>
            translationService.translateRecipe(recipe, currentLang)
          )
        );

        const translatedMap = translations.reduce((acc, translated) => {
          acc[translated.id] = translated;
          return acc;
        }, {} as { [key: string]: TranslatedRecipe });

        setTranslatedRecipes(translatedMap);
      } catch (error) {
        setTranslationError(
          error instanceof Error ? error.message : "Translations failed"
        );
        console.error("Recipe list translation error:", error);
      } finally {
        setIsTranslating(false);
      }
    },
    [i18n.language]
  );

  const getTranslatedRecipe = useCallback(
    (recipeId: string): TranslatedRecipe | null => {
      return translatedRecipes[recipeId] || null;
    },
    [translatedRecipes]
  );

  const clearTranslations = useCallback(() => {
    setTranslatedRecipes({});
    setTranslationError(null);
  }, []);

  return {
    translatedRecipes,
    isTranslating,
    translationError,
    translateRecipes,
    getTranslatedRecipe,
    clearTranslations,
  };
}

