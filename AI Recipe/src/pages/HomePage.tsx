/**
 * 홈페이지 컴포넌트
 * 애플리케이션의 메인 랜딩 페이지로, 주요 기능과 카테고리를 소개합니다.
 * 
 * @description
 * - 애플리케이션 소개 및 환영 메시지
 * - 주요 기능 하이라이트 (AI 추천, 스마트 검색, 빠른 요리)
 * - 인기 요리 카테고리 네비게이션
 * - 레시피 생성 및 검색으로의 빠른 접근
 * - 반응형 디자인과 다크 테마 지원
 * 
 * @features
 * - 그라데이션 배경과 아이콘을 활용한 시각적 매력
 * - 다국어 지원 (한국어/영어)
 * - 호버 효과와 부드러운 전환 애니메이션
 * - 모바일 친화적 반응형 레이아웃
 * 
 * @component
 * @example
 * ```tsx
 * <HomePage />
 * ```
 * 
 * @author AI Recipe Team
 * @version 1.0.0
 */

import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Search, Sparkles, Clock } from "lucide-react";

/**
 * 홈페이지 메인 컴포넌트
 * 
 * @returns {JSX.Element} 홈페이지 UI를 렌더링
 */
export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <ChefHat className="h-16 w-16 text-orange-600 mr-4" />
            <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">{t("home.appTitle")}</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {t("home.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/generate">
              <Button size="lg" className="text-lg px-8 py-3">
                <Sparkles className="w-5 h-5 mr-2" />
                {t("nav.generate")}
              </Button>
            </Link>
            <Link to="/search">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                <Search className="w-5 h-5 mr-2" />
                {t("nav.search")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Link to="/generate" className="block">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/10">
              <CardHeader>
                <Sparkles className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>{t("home.features.aiRecommendation")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {t("home.features.aiRecommendationDesc")}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/search" className="block">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/10">
              <CardHeader>
                <Search className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>{t("home.features.smartSearch")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {t("home.features.smartSearchDesc")}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/search?quick=true" className="block">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/10">
              <CardHeader>
                <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>{t("home.features.quickCooking")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {t("home.features.quickCookingDesc")}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Popular Categories */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            {t("home.popularCategories")}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              t("home.categories.korean"),
              t("home.categories.western"),
              t("home.categories.japanese"),
              t("home.categories.chinese"),
              t("home.categories.dessert"),
              t("home.categories.salad"),
              t("home.categories.soup"),
              t("home.categories.pasta"),
            ].map((category) => (
              <Link key={category} to={`/search?category=${category}`}>
                <Button variant="outline" className="hover:bg-orange-100 dark:hover:bg-orange-900/30">
                  {category}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
