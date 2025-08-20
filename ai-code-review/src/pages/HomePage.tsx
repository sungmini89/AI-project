/**
 * AI 코드 리뷰 홈페이지
 * 애플리케이션의 메인 페이지로 기능 소개와 시작점 제공
 * @module pages/HomePage
 */

import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { useSettingsStore } from "../stores";

/**
 * 홈페이지 컴포넌트
 * 애플리케이션의 주요 기능들을 소개하고 사용자가 코드 분석을 시작할 수 있도록 안내
 * @returns 홈페이지 UI
 */
export const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const { apiMode, preferences } = useSettingsStore();

  /** 언어별 기능 설명 */
  const { features: homeFeatures } = useLanguage().texts;

  /** 주요 기능 목록 */
  const features = [
    {
      icon: "🔍",
      title: homeFeatures.eslint.title,
      description: homeFeatures.eslint.description,
      available: true,
    },
    {
      icon: "📊",
      title: homeFeatures.complexity.title,
      description: homeFeatures.complexity.description,
      available: true,
    },
    {
      icon: "🛡️",
      title: homeFeatures.security.title,
      description: homeFeatures.security.description,
      available: true,
    },
    {
      icon: "🤖",
      title: homeFeatures.ai.title,
      description: homeFeatures.ai.description,
      available: preferences.enableAI && apiMode !== "offline",
    },
    {
      icon: "✨",
      title: homeFeatures.prettier.title,
      description: homeFeatures.prettier.description,
      available: true,
    },
    {
      icon: "🌐",
      title: homeFeatures.offline.title,
      description: homeFeatures.offline.description,
      available: true,
    },
  ];

  /** 지원되는 프로그래밍 언어 목록 */
  const supportedLanguages = [
    { name: "JavaScript", icon: "🟨", color: "bg-yellow-100 text-yellow-800" },
    { name: "TypeScript", icon: "🔷", color: "bg-blue-100 text-blue-800" },
    { name: "Python", icon: "🐍", color: "bg-green-100 text-green-800" },
    { name: "Java", icon: "☕", color: "bg-orange-100 text-orange-800" },
    { name: "C++", icon: "⚡", color: "bg-purple-100 text-purple-800" },
    { name: "C#", icon: "🔵", color: "bg-indigo-100 text-indigo-800" },
    { name: "Go", icon: "🐹", color: "bg-cyan-100 text-cyan-800" },
    { name: "Rust", icon: "🦀", color: "bg-red-100 text-red-800" },
  ];

  /** API 플랜 정보 */
  const apiTiers = [
    {
      name: t("home.plans.offline.name"),
      price: t("home.plans.offline.price"),
      features: [
        t("home.plans.offline.features.eslint"),
        t("home.plans.offline.features.complexity"),
        t("home.plans.offline.features.security"),
        t("home.plans.offline.features.prettier"),
        t("home.plans.offline.features.unlimited"),
      ],
      current: apiMode === "offline",
    },
    {
      name: t("home.plans.gemini.name"),
      price: t("home.plans.gemini.price"),
      features: [
        t("home.plans.gemini.features.allOffline"),
        t("home.plans.gemini.features.aiReview"),
        t("home.plans.gemini.features.apiCalls"),
        t("home.plans.gemini.features.advanced"),
      ],
      current: apiMode === "free" && preferences.enableAI,
    },
    {
      name: t("home.plans.custom.name"),
      price: t("home.plans.custom.price"),
      features: [
        t("home.plans.custom.featuress.allFeatures"),
        t("home.plans.custom.featuress.noLimit"),
        t("home.plans.custom.featuress.personalKey"),
        t("home.plans.custom.featuress.highestQuality"),
      ],
      current: apiMode === "custom",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-secondary-900 dark:to-secondary-800">
      {/* 헤더 */}
      <header className="bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm border-b border-secondary-200 dark:border-secondary-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🤖</div>
              <h1 className="text-xl font-bold text-secondary-900 dark:text-white">
                {t("home.title")}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              {apiMode !== "offline" && preferences.enableAI && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {t("ui.aiEnabled")}
                </span>
              )}
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  apiMode === "offline"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-primary-100 text-primary-800"
                }`}
              >
                {apiMode === "offline" ? t("ui.offlineMode") : t("ui.apiMode")}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-secondary-900 dark:text-white mb-6">
            {t("home.title")}
            <span className="block text-primary-600 dark:text-primary-400">
              {t("home.subtitle")}
            </span>
          </h2>

          <p className="text-lg md:text-xl text-secondary-600 dark:text-secondary-300 mb-8 max-w-2xl mx-auto">
            {t("home.description.line1")} {t("home.description.line2")}{" "}
            {t("home.description.line3")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/analyze"
              className="btn-primary text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {t("cta.startAnalyzing")}
            </Link>

            <Link
              to="/offline"
              className="btn-secondary text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {t("cta.tryOfflineMode")}
            </Link>
          </div>

          {/* 실시간 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                12+
              </div>
              <div className="text-secondary-600 dark:text-secondary-400">
                {t("ui.supportedLanguages")}
              </div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                1,500
              </div>
              <div className="text-secondary-600 dark:text-secondary-400">
                {t("ui.dailyFreeCalls")}
              </div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                100%
              </div>
              <div className="text-secondary-600 dark:text-secondary-400">
                {t("ui.browserBased")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-secondary-900 dark:text-white mb-12">
          {t("home.features.title")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`card p-6 hover:shadow-lg transition-shadow ${
                !feature.available ? "opacity-60" : ""
              }`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                {feature.title}
              </h4>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4">
                {feature.description}
              </p>
              {!feature.available && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  {t("ui.apiKeyRequired")}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 지원 언어 */}
      <section className="container mx-auto px-4 py-16 bg-white/50 dark:bg-secondary-800/50 rounded-2xl mx-4">
        <h3 className="text-3xl font-bold text-center text-secondary-900 dark:text-white mb-12">
          {t("home.ui.supportedLanguages")}
        </h3>

        <div className="flex flex-wrap justify-center gap-4">
          {supportedLanguages.map((lang, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full ${lang.color} font-medium`}
            >
              <span className="text-lg">{lang.icon}</span>
              <span>{lang.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 요금제 */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-secondary-900 dark:text-white mb-12">
          {t("home.ui.howToUse")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {apiTiers.map((tier, index) => (
            <div
              key={index}
              className={`card p-8 text-center relative ${
                tier.current
                  ? "ring-2 ring-primary-500 dark:ring-primary-400"
                  : ""
              }`}
            >
              {tier.current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm">
                    {t("home.ui.currentlyUsing")}
                  </span>
                </div>
              )}

              <h4 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
                {tier.name}
              </h4>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-6">
                {tier.price}
              </p>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <span className="text-secondary-600 dark:text-secondary-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {!tier.current && (
                <Link to="/settings" className="btn-primary w-full">
                  {t("home.ui.configure")}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold text-secondary-900 dark:text-white mb-6">
            {t("home.getStarted")}
          </h3>
          <p className="text-lg text-secondary-600 dark:text-secondary-300 mb-8">
            {t("home.getStartedDesc")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/analyze"
              className="btn-primary text-lg px-8 py-3 rounded-xl"
            >
              {t("home.startAnalyzing2")}
            </Link>
            <Link
              to="/settings"
              className="btn-secondary text-lg px-8 py-3 rounded-xl"
            >
              {t("home.configureAPI2")}
            </Link>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-secondary-800 dark:bg-secondary-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">{t("home.title")}</h4>
              <p className="text-secondary-300">{t("footer.description")}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">
                {t("footer.keyFeatures")}
              </h4>
              <ul className="space-y-2 text-secondary-300">
                <li>• {homeFeatures.eslint.title}</li>
                <li>• {homeFeatures.complexity.title}</li>
                <li>• {homeFeatures.security.title}</li>
                <li>• {homeFeatures.ai.title}</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">
                {t("footer.apiProviders")}
              </h4>
              <ul className="space-y-2 text-secondary-300">
                <li>• Google Gemini API</li>
                <li>• Cohere API</li>
                <li>• {homeFeatures.offline.title}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-secondary-700 mt-8 pt-8 text-center text-secondary-400">
            <p>{t("footer.copyright")}</p>
            <p className="text-sm mt-2">{t("footer.apiLimits")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
