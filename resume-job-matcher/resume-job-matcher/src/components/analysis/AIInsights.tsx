/**
 * @fileoverview AI 인사이트 표시 컴포넌트
 * @description AI 분석 결과를 시각적으로 표시하는 컴포넌트입니다.
 * 강점, 개선 영역, 추천사항 등을 카테고리별로 구분하여 표시하며,
 * Magic UI 애니메이션과 신뢰도 점수를 포함합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

import React from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MagicCard } from "@/components/ui/magic-card";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  CheckCircle,
  XCircle,
  Target,
  Sparkles,
} from "lucide-react";
import type { EnhancedAnalysisResult } from "@/services/ai-enhanced-analysis";

/**
 * AI 인사이트 컴포넌트의 속성 인터페이스
 * @description 컴포넌트가 받을 수 있는 props를 정의합니다.
 */
interface AIInsightsProps {
  /** 표시할 AI 분석 결과 */
  result: EnhancedAnalysisResult;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * AI 인사이트 컴포넌트
 * @description AI 분석 결과를 시각적으로 표시하는 컴포넌트입니다.
 * 강점, 개선 영역, 추천사항을 카테고리별로 구분하여 표시하며,
 * 각 섹션에 적절한 아이콘과 색상을 적용합니다.
 *
 * @param {AIInsightsProps} props - 컴포넌트 속성
 * @returns {JSX.Element} AI 인사이트 컴포넌트
 *
 * @example
 * ```tsx
 * <AIInsights result={analysisResult} className="mt-6" />
 * ```
 */
export const AIInsights: React.FC<AIInsightsProps> = ({
  result,
  className = "",
}) => {
  const { aiInsights } = result;

  /**
   * 신뢰도 점수에 따른 색상을 반환하는 함수
   * @description 점수에 따라 녹색(높음), 노란색(보통), 빨간색(낮음)을 반환합니다.
   *
   * @param {number} score - 신뢰도 점수 (0-100)
   * @returns {string} CSS 색상 클래스
   */
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  /**
   * 신뢰도 점수에 따른 라벨을 반환하는 함수
   * @description 점수에 따라 '높음', '보통', '낮음' 라벨을 반환합니다.
   *
   * @param {number} score - 신뢰도 점수 (0-100)
   * @returns {string} 신뢰도 라벨
   */
  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return "높음";
    if (score >= 60) return "보통";
    return "낮음";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI 분석 헤더 */}
      <MagicCard className="relative">
        <BorderBeam delay={0.5} colorFrom="#8b5cf6" colorTo="#06b6d4" />
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            AI 인사이트
            <Badge variant="secondary" className="ml-auto">
              {aiInsights.provider}
            </Badge>
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            신뢰도:
            <span
              className={`font-semibold ${getConfidenceColor(
                aiInsights.confidenceScore
              )}`}
            >
              {aiInsights.confidenceScore}% (
              {getConfidenceLabel(aiInsights.confidenceScore)})
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm leading-relaxed">{aiInsights.summary}</p>
          </div>
        </CardContent>
      </MagicCard>

      {/* 강점 */}
      {aiInsights.strengths.length > 0 && (
        <MagicCard
          className="animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <TrendingUp className="h-5 w-5" />
              주요 강점
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.strengths.map((strength, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 animate-fade-in"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-green-800 dark:text-green-200">
                    {strength}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </MagicCard>
      )}

      {/* 개선 영역 */}
      {aiInsights.weaknesses.length > 0 && (
        <MagicCard
          className="animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <TrendingDown className="h-5 w-5" />
              개선 영역
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.weaknesses.map((weakness, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 animate-fade-in"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <XCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-orange-800 dark:text-orange-200">
                    {weakness}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </MagicCard>
      )}

      {/* AI 추천사항 */}
      {aiInsights.recommendations.length > 0 && (
        <MagicCard
          className="animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Lightbulb className="h-5 w-5" />
              AI 추천사항
            </CardTitle>
            <CardDescription>개선을 위한 구체적인 액션 아이템</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiInsights.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 animate-fade-in"
                  style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                >
                  <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      {recommendation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </MagicCard>
      )}
    </div>
  );
};

export default AIInsights;
