import { Link } from "react-router-dom";
import { Recipe } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { Clock, Users, ChefHat, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRecipeTranslation } from "@/hooks/useRecipeTranslation";
import { useEffect } from "react";

interface RecipeCardProps {
  recipe: Recipe;
  onView?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { t } = useTranslation();
  const { translatedRecipe, isTranslating, translateRecipe } =
    useRecipeTranslation();

  // 컴포넌트가 마운트될 때 번역 시작
  useEffect(() => {
    translateRecipe(recipe);
  }, [recipe, translateRecipe]);

  // 번역된 레시피가 있으면 사용, 없으면 원본 사용
  const displayRecipe = translatedRecipe || recipe;

  // Tag translation mapping
  const translateTag = (tag: string) => {
    const tagMap: Record<string, string> = {
      "샐러드": t("categories.salad"),
      "스프": t("categories.soup"),
      "찌개": t("categories.stew"),
      "구이": t("categories.grilled"),
      "볶음": t("categories.stirFried"),
      "튀김": t("categories.fried"),
      "조림": t("categories.braised"),
      "무침": t("categories.seasoned"),
      "김밥": t("categories.kimbap"),
      "떡": t("categories.riceCake"),
      "전": t("categories.pancake"),
      "국": t("categories.soup"),
      "밥": t("categories.rice"),
      "면": t("categories.noodles"),
      "빵": t("categories.bread"),
      "케이크": t("categories.cake"),
      "쿠키": t("categories.cookie"),
      "아이스크림": t("categories.iceCream"),
      "음료": t("categories.beverage"),
      "주스": t("categories.juice"),
      "차": t("categories.tea"),
      "커피": t("categories.coffee"),
      "와인": t("categories.wine"),
      "맥주": t("categories.beer"),
      "칵테일": t("categories.cocktail")
    };
    return tagMap[tag] || tag;
  };

  return (
    <Link to={`/recipe/${recipe.id}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow animate-fade-in">
        {recipe.image && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <OptimizedImage
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
              lazy={true}
              blur={true}
            />
          </div>
        )}

        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
            {displayRecipe.title}
            {isTranslating && (
              <Languages className="w-4 h-4 text-blue-500 animate-pulse" />
            )}
          </CardTitle>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {displayRecipe.readyInMinutes} {t("recipe.cookingTime")}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>
                {displayRecipe.servings} {t("recipe.servings")}
              </span>
            </div>

            {displayRecipe.healthScore && (
              <div className="flex items-center gap-1">
                <ChefHat className="w-4 h-4" />
                <span>
                  {displayRecipe.healthScore} {t("recipe.healthScore")}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {displayRecipe.dishTypes?.slice(0, 2).map((type, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {translateTag(type)}
              </Badge>
            ))}
          </div>

          {displayRecipe.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {displayRecipe.summary.replace(/<[^>]*>/g, "")}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
