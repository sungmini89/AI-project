import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAIRecipeGenerator } from "@/hooks/useAIRecipeGenerator";
import { AIRecipeRequest } from "@/services/aiService";
import { useTranslation } from "react-i18next";
import {
  ChefHat,
  Clock,
  Users,
  Plus,
  X,
  Sparkles,
  Loader2,
  Heart,
  Share2,
  Download,
} from "lucide-react";

export default function GenerateRecipePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    generateRecipe,
    loading,
    error,
    generatedRecipe,
    saveGeneratedRecipe,
  } = useAIRecipeGenerator();

  const [formData, setFormData] = useState<AIRecipeRequest>({
    ingredients: [],
    cuisine: "",
    difficulty: "medium",
    cookingTime: 30,
    servings: 2,
    dietaryRestrictions: [],
    preferredStyle: "",
  });

  const [currentIngredient, setCurrentIngredient] = useState("");
  const [currentRestriction, setCurrentRestriction] = useState("");

  const addIngredient = () => {
    if (
      currentIngredient.trim() &&
      !formData.ingredients.includes(currentIngredient.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, currentIngredient.trim()],
      }));
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((i) => i !== ingredient),
    }));
  };

  const addDietaryRestriction = () => {
    if (
      currentRestriction.trim() &&
      !formData.dietaryRestrictions.includes(currentRestriction.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        dietaryRestrictions: [
          ...prev.dietaryRestrictions,
          currentRestriction.trim(),
        ],
      }));
      setCurrentRestriction("");
    }
  };

  const removeDietaryRestriction = (restriction: string) => {
    setFormData((prev) => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.filter(
        (r) => r !== restriction
      ),
    }));
  };

  const handleGenerate = async () => {
    if (formData.ingredients.length === 0) {
      alert(t("generate.minIngredientsError"));
      return;
    }

    await generateRecipe(formData);
  };

  const handleSaveRecipe = () => {
    saveGeneratedRecipe();
    alert(t("generate.savedToFavorites"));
  };

  const handleShareRecipe = async () => {
    if (!generatedRecipe) return;

    const shareData = {
      title: generatedRecipe.title,
      text: `${generatedRecipe.title} - ${t("generate.shareText")}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.url}`
        );
        alert(t("generate.linkCopied"));
      }
    } catch (err) {
      console.error(t("generate.shareError"), err);
    }
  };

  if (generatedRecipe && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
              className="mb-4"
            >
              {t("generate.newRecipe")}
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* 생성된 레시피 표시 */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                    {generatedRecipe.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShareRecipe}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveRecipe}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-600">{generatedRecipe.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {generatedRecipe.readyInMinutes}{t("generate.timeUnit")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {generatedRecipe.servings}{t("generate.servingUnit")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChefHat className="w-4 h-4" />
                    <span>{generatedRecipe.difficulty}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {generatedRecipe.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 재료 */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("recipe.ingredients")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {generatedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-gray-700">
                        • {ingredient}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* 조리 방법 */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("recipe.instructions")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4">
                      {generatedRecipe.instructions.map(
                        (instruction, index) => (
                          <li key={index} className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-orange-700">
                                {index + 1}
                              </span>
                            </div>
                            <div className="text-gray-700 pt-1">
                              {instruction}
                            </div>
                          </li>
                        )
                      )}
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 영양 정보 */}
            {generatedRecipe.nutrition && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>{t("recipe.nutrition")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {generatedRecipe.nutrition.calories}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t("recipe.calories")}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {generatedRecipe.nutrition.protein}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t("recipe.protein")}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {generatedRecipe.nutrition.carbohydrates}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t("recipe.carbs")}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {generatedRecipe.nutrition.fat}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t("recipe.fat")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              {t("generate.title")}
            </h1>
            <p className="text-xl text-gray-600">{t("generate.subtitle")}</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("generate.recipeSettings")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 재료 입력 */}
              <div>
                <Label htmlFor="ingredients">
                  {t("generate.ingredientsRequired")}
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="ingredients"
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    placeholder={t("generate.ingredientPlaceholder")}
                    onKeyPress={(e) => e.key === "Enter" && addIngredient()}
                  />
                  <Button onClick={addIngredient} type="button">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.ingredients.map((ingredient) => (
                      <Badge
                        key={ingredient}
                        variant="default"
                        className="flex items-center gap-1"
                      >
                        {ingredient}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeIngredient(ingredient)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 요리 스타일 */}
                <div>
                  <Label htmlFor="cuisine">{t("generate.cuisineStyle")}</Label>
                  <Input
                    id="cuisine"
                    value={formData.cuisine}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cuisine: e.target.value,
                      }))
                    }
                    placeholder={t("generate.cuisinePlaceholder")}
                  />
                </div>

                {/* 난이도 */}
                <div>
                  <Label htmlFor="difficulty">{t("generate.difficulty")}</Label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        difficulty: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="easy">{t("generate.difficultyEasy")}</option>
                    <option value="medium">
                      {t("generate.difficultyMedium")}
                    </option>
                    <option value="hard">{t("generate.difficultyHard")}</option>
                  </select>
                </div>

                {/* 조리 시간 */}
                <div>
                  <Label htmlFor="cookingTime">
                    {t("generate.cookingTimeMinutes")}
                  </Label>
                  <Input
                    id="cookingTime"
                    type="number"
                    value={formData.cookingTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cookingTime: parseInt(e.target.value) || 30,
                      }))
                    }
                    min={5}
                    max={180}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 인분 */}
                <div>
                  <Label htmlFor="servings">{t("generate.servings")}</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={formData.servings}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        servings: parseInt(e.target.value) || 2,
                      }))
                    }
                    min={1}
                    max={10}
                  />
                </div>

                {/* 선호 스타일 */}
                <div>
                  <Label htmlFor="preferredStyle">
                    {t("generate.preferredStyle")}
                  </Label>
                  <Input
                    id="preferredStyle"
                    value={formData.preferredStyle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        preferredStyle: e.target.value,
                      }))
                    }
                    placeholder={t("generate.stylePlaceholder")}
                  />
                </div>
              </div>

              {/* 식이 제한 */}
              <div>
                <Label htmlFor="restrictions">
                  {t("generate.dietaryRestrictions")}
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="restrictions"
                    value={currentRestriction}
                    onChange={(e) => setCurrentRestriction(e.target.value)}
                    placeholder={t("generate.restrictionsPlaceholder")}
                    onKeyPress={(e) =>
                      e.key === "Enter" && addDietaryRestriction()
                    }
                  />
                  <Button
                    onClick={addDietaryRestriction}
                    type="button"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.dietaryRestrictions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.dietaryRestrictions.map((restriction) => (
                      <Badge
                        key={restriction}
                        variant="outline"
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

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  onClick={handleGenerate}
                  disabled={loading || formData.ingredients.length === 0}
                  className="px-8 py-3 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t("generate.generatingAI")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {t("generate.generateButton")}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
