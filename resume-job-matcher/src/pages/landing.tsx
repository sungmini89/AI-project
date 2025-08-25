/**
 * @fileoverview 랜딩 페이지 컴포넌트
 * @description 애플리케이션의 메인 랜딩 페이지로, 사용자에게 서비스 소개와 주요 기능을 보여줍니다.
 * AI 기반 이력서 분석 도구의 특징과 통계를 시각적으로 표현하며,
 * Magic UI 애니메이션 요소들을 활용하여 매력적인 사용자 경험을 제공합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BorderBeam } from "@/components/ui/border-beam";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Meteors } from "@/components/ui/meteors";
import { SparklesText } from "@/components/ui/sparkles-text";
import { NumberTicker } from "@/components/ui/number-ticker";

import {
  ArrowRight,
  FileText,
  Brain,
  Target,
  Zap,
  TrendingUp,
  Award,
  Rocket,
  BookOpen,
  Search,
} from "lucide-react";
import { Navigation } from "@/components/navigation/Navigation";

/**
 * 랜딩 페이지 컴포넌트
 * @description 애플리케이션의 메인 페이지로, 서비스 소개와 주요 기능을 보여줍니다.
 * Hero 섹션, 기능 소개, 통계, CTA 등의 섹션을 포함하며,
 * Magic UI 애니메이션과 인터랙티브 요소들을 활용합니다.
 *
 * @returns {JSX.Element} 랜딩 페이지 컴포넌트
 *
 * @example
 * ```tsx
 * <Landing />
 * ```
 */
export default function Landing() {
  /** 현재 호버된 카드의 ID를 추적하는 상태 */
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  /**
   * 주요 기능 목록
   * @description 애플리케이션의 핵심 기능들을 정의합니다.
   */
  const features = [
    {
      id: "ai-analysis",
      icon: Brain,
      title: "AI 기반 정밀 분석",
      description:
        "최신 자연어 처리 기술로 이력서와 채용공고를 심층 분석합니다.",
      color: "from-blue-500 to-purple-600",
      delay: 0,
    },
    {
      id: "keyword-matching",
      icon: Target,
      title: "키워드 매칭 최적화",
      description: "ATS 시스템을 통과하는 핵심 키워드 매칭률을 분석합니다.",
      color: "from-green-500 to-teal-600",
      delay: 0.2,
    },
    {
      id: "instant-feedback",
      icon: Zap,
      title: "즉시 피드백 제공",
      description: "실시간으로 개선점과 구체적인 액션 아이템을 제시합니다.",
      color: "from-orange-500 to-red-600",
      delay: 0.4,
    },
  ];

  /**
   * 서비스 통계 데이터
   * @description 애플리케이션의 성과와 사용자 만족도를 보여주는 통계입니다.
   */
  const stats = [
    { label: "누적 분석 건수", value: 15420, suffix: "+" },
    { label: "평균 매칭률 향상", value: 34, suffix: "%" },
    { label: "사용자 만족도", value: 98, suffix: "%" },
    { label: "면접 기회 증가", value: 2.7, suffix: "배" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Navigation */}
      <div className="px-6 pt-6">
        <div className="max-w-6xl mx-auto">
          <Navigation showAPIStatus={false} />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-12 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <Meteors number={20} />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-8 animate-fade-in">
            <SparklesText
              text="완벽한 매칭을 위한"
              className="mb-4 text-5xl font-bold sm:text-6xl"
              sparklesCount={10}
            />
            <h1 className="mb-6 text-5xl font-bold text-foreground sm:text-6xl">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                이력서 분석 도구
              </span>
            </h1>

            <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              AI 기반 정밀 분석으로 채용공고와의 매칭률을 극대화하고,
              <br />
              실시간 피드백으로 면접 기회를 늘려보세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/analyzer">
                <RainbowButton className="px-8 py-4 text-lg font-medium">
                  <Rocket className="mr-2 h-5 w-5" />
                  무료로 시작하기
                </RainbowButton>
              </Link>

              <Link to="/how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  작동 원리 알아보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl font-bold text-primary mb-2">
                  <NumberTicker value={stat.value} />
                  {stat.suffix}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                핵심 기능
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI 기술로 구현된 정밀한 분석 도구로 취업 성공률을 높여보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="transition-transform hover:scale-105"
                style={{ animationDelay: `${feature.delay}s` }}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <MagicCard
                  className={`magic-card relative rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 animate-fade-in`}
                >
                  <BorderBeam
                    delay={feature.delay}
                    colorFrom={`rgb(${
                      feature.color.includes("blue")
                        ? "59 130 246"
                        : feature.color.includes("green")
                        ? "34 197 94"
                        : "249 115 22"
                    })`}
                    colorTo={`rgb(${
                      feature.color.includes("purple")
                        ? "147 51 234"
                        : feature.color.includes("teal")
                        ? "20 184 166"
                        : "239 68 68"
                    })`}
                  />

                  <Card className="border-0 bg-transparent shadow-none">
                    <CardHeader className="text-center pb-4">
                      <div
                        className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${
                          feature.color
                        } flex items-center justify-center mb-4 ${
                          hoveredCard === feature.id ? "animate-pulse" : ""
                        }`}
                      >
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </MagicCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                3단계 간단 분석
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              복잡한 설정 없이 몇 번의 클릭으로 전문적인 분석 결과를 받아보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "이력서 업로드",
                description:
                  "PDF 이력서를 업로드하거나 직접 텍스트를 입력하세요.",
                icon: FileText,
              },
              {
                step: 2,
                title: "채용공고 입력",
                description: "분석하고 싶은 채용공고 내용을 붙여넣기하세요.",
                icon: Search,
              },
              {
                step: 3,
                title: "AI 분석 결과",
                description:
                  "매칭률, 개선점, 구체적인 액션 아이템을 확인하세요.",
                icon: Award,
              },
            ].map((step, index) => (
              <div
                key={step.step}
                className="relative text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-6 text-white text-2xl font-bold shadow-lg">
                  {step.step}
                </div>
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-md">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4 mt-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute top-10 right-0 transform translate-x-1/2 text-muted-foreground h-6 w-6" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/analyzer">
              <ShimmerButton
                className="px-8 py-4 text-lg font-medium"
                shimmerColor="#ffffff40"
                background="linear-gradient(45deg, rgb(59 130 246), rgb(147 51 234))"
              >
                <Zap className="mr-2 h-5 w-5" />
                지금 바로 분석 시작
              </ShimmerButton>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 animate-fade-in">
            지금 바로 시작해보세요
          </h2>
          <p
            className="text-xl mb-8 opacity-90 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            무료로 이력서를 분석하고 취업 성공률을 높여보세요
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <Link to="/analyzer">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-4 text-lg font-medium"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                분석 시작하기
              </Button>
            </Link>

            <Link to="/keyword-dictionary">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-4 text-lg font-medium"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                키워드 사전 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-50 dark:bg-slate-900 border-t">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 이력서 채용공고 매칭 분석. AI 기반 취업 지원 플랫폼.
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <Link
              to="/how-it-works"
              className="text-muted-foreground hover:text-primary"
            >
              작동 원리
            </Link>
            <Link
              to="/keyword-dictionary"
              className="text-muted-foreground hover:text-primary"
            >
              키워드 사전
            </Link>
            <Link
              to="/analyzer"
              className="text-muted-foreground hover:text-primary"
            >
              분석 도구
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
