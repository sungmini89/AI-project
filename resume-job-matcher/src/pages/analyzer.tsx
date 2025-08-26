/**
 * @fileoverview 이력서-채용공고 매칭 분석 메인 페이지
 * @description 사용자가 이력서를 업로드하고 채용공고를 입력하여 매칭 분석을 수행할 수 있는 핵심 페이지입니다.
 * AI 서비스와 로컬 분석을 모두 지원하며, 분석 결과를 시각적으로 표시합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PlayCircle,
  Loader2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  CheckCircle,
  XCircle,
  Upload,
  Brain,
} from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BorderBeam } from "@/components/ui/border-beam";
import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";
import {
  freeAIService,
  type EnhancedAnalysisResult,
  type APIMode,
} from "@/services/freeAIService";
import { APISettingsDialog } from "@/components/analysis/APISettingsDialog";
import { Navigation } from "@/components/navigation/Navigation";

/**
 * 이력서-채용공고 매칭 분석 페이지 컴포넌트
 * @description 사용자가 이력서와 채용공고를 입력하고 분석을 수행할 수 있는 메인 페이지입니다.
 *
 * @returns {JSX.Element} 분석 페이지 컴포넌트
 *
 * @example
 * ```tsx
 * <Analyzer />
 * ```
 */
export default function Analyzer() {
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<EnhancedAnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentMode, setCurrentMode] = useState<APIMode>("mock");

  /**
   * 현재 AI 서비스 모드를 업데이트하는 함수
   * @description freeAIService의 설정을 확인하여 현재 모드를 동기화합니다.
   */
  const updateCurrentMode = () => {
    const config = freeAIService.getConfig();
    setCurrentMode(config.mode);
  };

  useEffect(() => {
    updateCurrentMode();
  }, []);

  /**
   * AI 서비스 모드에 따른 표시 정보를 반환하는 함수
   * @param {APIMode} mode - AI 서비스 모드
   * @returns {Object} 모드별 표시 텍스트, 스타일 변형, CSS 클래스
   */
  const getModeDisplay = (mode: APIMode) => {
    switch (mode) {
      case "mock":
        return {
          text: "개발 모드",
          variant: "secondary" as const,
          className:
            "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
        };
      case "offline":
        return {
          text: "오프라인",
          variant: "secondary" as const,
          className:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        };
      case "free":
        return {
          text: "무료 API",
          variant: "secondary" as const,
          className:
            "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        };
      case "custom":
        return {
          text: "사용자 API",
          variant: "default" as const,
          className:
            "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        };
      default:
        return {
          text: "알 수 없음",
          variant: "secondary" as const,
          className: "bg-gray-100 text-gray-700",
        };
    }
  };

  /**
   * 이력서-채용공고 매칭 분석을 수행하는 함수
   * @description 입력된 이력서와 채용공고 텍스트를 분석하여 매칭 결과를 생성합니다.
   *
   * @throws {Error} 분석 과정에서 오류가 발생할 경우
   */
  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      alert("이력서를 먼저 업로드해주세요.");
      return;
    }
    if (!jobText.trim()) {
      alert("채용공고 내용을 입력해주세요.");
      return;
    }

    setAnalyzing(true);
    setError("");

    try {
      const analysisResult = await freeAIService.analyzeResumeMatch(
        resumeText,
        jobText,
        {
          language: "ko",
          includeATS: true,
          mode: "comprehensive",
          depth: "detailed",
        }
      );

      setResult(analysisResult);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err instanceof Error ? err.message : "분석 중 오류가 발생했습니다."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const canAnalyze = resumeText.trim() && jobText.trim() && !analyzing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Navigation */}
        <Navigation
          onSettingsClick={() => setShowSettings(true)}
          currentMode={getModeDisplay(currentMode)}
        />

        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-5xl font-bold text-foreground bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            이력서 채용공고 매칭 분석
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AI 기반 이력서와 채용공고 매칭 분석 플랫폼으로 완벽한 매칭을
            찾아보세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
          <MagicCard className="magic-card relative rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <BorderBeam />
            <Card>
              <CardHeader>
                <CardTitle>이력서 업로드</CardTitle>
                <CardDescription>PDF 파일을 업로드하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* File Dropzone */}
                  <div className="border-dashed border-2 border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload
                      className="h-8 w-8 text-muted-foreground mx-auto mb-4"
                      data-lucide="upload"
                    />
                    <p className="text-sm text-muted-foreground mb-2">
                      파일을 선택하거나 드래그하세요
                    </p>
                    <p className="text-xs text-muted-foreground/60 mb-4">
                      또는 파일을 드래그하여 놓으세요
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      id="file-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Mock file processing - in real app would parse PDF
                          setResumeText(
                            `PDF 파일 "${file.name}" 내용:\n\n프론트엔드 개발자 김개발\n경력: React 개발 3년, JavaScript/TypeScript 능숙\n기술스택: React, Vue.js, JavaScript, TypeScript, HTML, CSS\n프로젝트: E-commerce 웹사이트, 관리자 대시보드 개발\n교육: 컴퓨터공학과 졸업`
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      파일 선택
                    </label>
                  </div>

                  {/* Text Area for extracted/manual content */}
                  <textarea
                    placeholder="추출된 텍스트가 여기에 표시됩니다..."
                    className="w-full h-32 p-3 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </MagicCard>

          <MagicCard className="magic-card relative rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <BorderBeam delay={1} />
            <Card>
              <CardHeader>
                <CardTitle>채용공고 내용</CardTitle>
                <CardDescription>
                  분석할 채용공고 내용을 입력하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  placeholder="채용공고 내용을 입력하세요..."
                  className="w-full h-40 p-3 border border-input rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                />
              </CardContent>
            </Card>
          </MagicCard>
        </div>

        <div
          className="flex justify-center animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <ShimmerButton
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="px-8 py-4 text-lg font-medium"
            shimmerColor="#ffffff40"
            background={
              canAnalyze
                ? "linear-gradient(45deg, rgb(59 130 246), rgb(147 51 234))"
                : "rgb(107 114 128)"
            }
          >
            {analyzing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <PlayCircle className="h-5 w-5 mr-2" />
                매칭 분석 시작
              </>
            )}
          </ShimmerButton>
        </div>

        {error && (
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 dark:text-red-300 font-medium">
                    분석 오류
                  </p>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <MagicCard
            className="magic-card relative rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            <BorderBeam delay={2} colorFrom="#10b981" colorTo="#3b82f6" />
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      매칭 분석 결과
                    </CardTitle>
                    <CardDescription>
                      분석 완료 ({result.processingTime}ms) • 전체 매칭 점수:{" "}
                      {result.overallScore}%
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center space-y-3">
                    <AnimatedCircularProgressBar
                      value={result.overallScore}
                      max={100}
                      className="w-24 h-24"
                      gaugePrimaryColor="rgb(34 197 94)"
                      gaugeSecondaryColor="rgb(229 231 235)"
                    />
                    <div className="text-center">
                      <p className="font-medium text-sm">전체 매칭</p>
                      <p className="text-xs text-muted-foreground">
                        Overall Match
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-3">
                    <AnimatedCircularProgressBar
                      value={result.breakdown.keywordMatches.matchRate}
                      max={100}
                      className="w-24 h-24"
                      gaugePrimaryColor="rgb(59 130 246)"
                      gaugeSecondaryColor="rgb(229 231 235)"
                    />
                    <div className="text-center">
                      <p className="font-medium text-sm">키워드 매칭</p>
                      <p className="text-xs text-muted-foreground">Keywords</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-3">
                    <AnimatedCircularProgressBar
                      value={result.breakdown.skillMatches.overallSkillMatch}
                      max={100}
                      className="w-24 h-24"
                      gaugePrimaryColor="rgb(168 85 247)"
                      gaugeSecondaryColor="rgb(229 231 235)"
                    />
                    <div className="text-center">
                      <p className="font-medium text-sm">스킬 매칭</p>
                      <p className="text-xs text-muted-foreground">Skills</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-3">
                    <AnimatedCircularProgressBar
                      value={result.breakdown.atsCompliance.score}
                      max={100}
                      className="w-24 h-24"
                      gaugePrimaryColor="rgb(245 158 11)"
                      gaugeSecondaryColor="rgb(229 231 235)"
                    />
                    <div className="text-center">
                      <p className="font-medium text-sm">ATS 호환성</p>
                      <p className="text-xs text-muted-foreground">ATS Score</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">전체 매칭 점수</span>
                      <span className="font-bold">{result.overallScore}%</span>
                    </div>
                    <Progress
                      value={result.overallScore}
                      className="h-3 animate-pulse"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>키워드 매칭</span>
                      <span>{result.breakdown.keywordMatches.matchRate}%</span>
                    </div>
                    <Progress
                      value={result.breakdown.keywordMatches.matchRate}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>스킬 매칭</span>
                      <span>
                        {result.breakdown.skillMatches.overallSkillMatch}%
                      </span>
                    </div>
                    <Progress
                      value={result.breakdown.skillMatches.overallSkillMatch}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>ATS 호환성</span>
                      <span>{result.breakdown.atsCompliance.score}%</span>
                    </div>
                    <Progress value={result.breakdown.atsCompliance.score} />
                  </div>
                </div>

                {result.breakdown.keywordMatches.matchedKeywords.length > 0 && (
                  <div
                    className="animate-fade-in"
                    style={{ animationDelay: "0.7s" }}
                  >
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      매칭된 키워드
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.breakdown.keywordMatches.matchedKeywords
                        .slice(0, 10)
                        .map((keyword: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors animate-fade-in"
                            style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                          >
                            {keyword}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {result.breakdown.keywordMatches.importantMissing.length >
                  0 && (
                  <div
                    className="animate-fade-in"
                    style={{ animationDelay: "0.9s" }}
                  >
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      중요한 누락 키워드
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.breakdown.keywordMatches.importantMissing.map(
                        (keyword: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-colors animate-fade-in"
                            style={{ animationDelay: `${1.0 + index * 0.1}s` }}
                          >
                            {keyword}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {result.suggestions.length > 0 && (
                  <div
                    className="animate-fade-in"
                    style={{ animationDelay: "1.1s" }}
                  >
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      개선 제안
                    </h4>
                    <div className="space-y-4">
                      {result.suggestions.map(
                        (suggestion: any, index: number) => (
                          <MagicCard
                            key={index}
                            className="magic-card p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 animate-fade-in"
                            style={{ animationDelay: `${1.2 + index * 0.2}s` }}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  suggestion.priority === "high"
                                    ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                                    : suggestion.priority === "medium"
                                    ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                                    : "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                }`}
                              >
                                {suggestion.priority === "high"
                                  ? "높음"
                                  : suggestion.priority === "medium"
                                  ? "보통"
                                  : "낮음"}
                              </span>
                              <h5 className="font-medium text-lg">
                                {suggestion.title}
                              </h5>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {suggestion.description}
                            </p>
                            <ul className="text-sm space-y-2">
                              {suggestion.actionItems.map(
                                (item: string, itemIndex: number) => (
                                  <li
                                    key={itemIndex}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-primary mt-1">→</span>
                                    <span>{item}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </MagicCard>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* AI Insights Section */}
                {result.aiInsights && (
                  <div
                    className="animate-fade-in"
                    style={{ animationDelay: "1.3s" }}
                  >
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      AI 인사이트
                      <Badge variant="secondary" className="text-xs ml-2">
                        {result.aiInsights.provider}
                      </Badge>
                    </h4>

                    <div className="space-y-6">
                      {/* Reliability Score */}
                      <MagicCard className="magic-card p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            신뢰도 점수:
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              result.aiInsights.confidenceScore >= 80
                                ? "text-green-600"
                                : result.aiInsights.confidenceScore >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {result.aiInsights.confidenceScore}%{" "}
                            {result.aiInsights.confidenceScore >= 80
                              ? "높음"
                              : result.aiInsights.confidenceScore >= 60
                              ? "보통"
                              : "낮음"}
                          </span>
                        </div>
                      </MagicCard>

                      {/* AI Summary */}
                      {result.aiInsights.summary && (
                        <MagicCard className="magic-card p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                          <h5 className="font-medium mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                            AI 요약
                          </h5>
                          <p className="text-sm leading-relaxed">
                            {result.aiInsights.summary}
                          </p>
                        </MagicCard>
                      )}

                      {/* Main Strengths */}
                      {result.aiInsights.strengths.length > 0 && (
                        <MagicCard
                          className="magic-card p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 animate-fade-in"
                          style={{ animationDelay: "1.4s" }}
                        >
                          <h5 className="font-medium mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            주요 강점
                          </h5>
                          <div className="space-y-2">
                            {result.aiInsights.strengths.map(
                              (strength: string, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{strength}</span>
                                </div>
                              )
                            )}
                          </div>
                        </MagicCard>
                      )}

                      {/* Weaknesses */}
                      {result.aiInsights.weaknesses.length > 0 && (
                        <MagicCard
                          className="magic-card p-4 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 animate-fade-in"
                          style={{ animationDelay: "1.5s" }}
                        >
                          <h5 className="font-medium mb-3 flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            개선 영역
                          </h5>
                          <div className="space-y-2">
                            {result.aiInsights.weaknesses.map(
                              (weakness: string, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm">{weakness}</span>
                                </div>
                              )
                            )}
                          </div>
                        </MagicCard>
                      )}

                      {/* AI Recommendations */}
                      {result.aiInsights.recommendations.length > 0 && (
                        <MagicCard
                          className="magic-card p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 animate-fade-in"
                          style={{ animationDelay: "1.6s" }}
                        >
                          <h5 className="font-medium mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-600" />
                            AI 추천사항
                          </h5>
                          <div className="space-y-2">
                            {result.aiInsights.recommendations.map(
                              (recommendation: string, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-yellow-500 mt-1">
                                    →
                                  </span>
                                  <span className="text-sm">
                                    {recommendation}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </MagicCard>
                      )}
                    </div>
                  </div>
                )}

                {/* Improvement Areas */}
                <MagicCard
                  className="magic-card p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 animate-fade-in"
                  style={{ animationDelay: "1.5s" }}
                >
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-orange-600" />
                    개선 영역
                  </h4>
                  <div className="space-y-2">
                    {result.breakdown.keywordMatches.importantMissing
                      .slice(0, 3)
                      .map((keyword: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">
                            {keyword} 경험 추가 필요
                          </span>
                        </div>
                      ))}
                  </div>
                </MagicCard>

                {/* AI Suggestions */}
                <MagicCard
                  className="magic-card p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 animate-fade-in"
                  style={{ animationDelay: "1.7s" }}
                >
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    구체적 제안사항
                    <Sparkles className="h-3 w-3 text-purple-500 ml-1" />
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    개선을 위한 구체적인 액션 아이템
                  </p>
                  <div className="space-y-2">
                    {result.suggestions
                      .slice(0, 2)
                      .map((suggestion: any, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">
                              {suggestion.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {suggestion.actionItems[0]}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </MagicCard>

                {/* Additional Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                  <Link to="/keyword-dictionary" className="flex-1">
                    <Button variant="outline" className="w-full">
                      키워드 사전 확인하기
                    </Button>
                  </Link>
                  <Link to="/how-it-works" className="flex-1">
                    <Button variant="outline" className="w-full">
                      분석 원리 알아보기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </MagicCard>
        )}
      </div>

      {/* API Settings Dialog */}
      <APISettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        onConfigUpdate={updateCurrentMode}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 max-w-md mx-4 shadow-2xl animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                분석 완료!
              </h2>
              <p className="text-muted-foreground mb-6">
                이력서와 채용공고 매칭 분석이 성공적으로 완료되었습니다.
                아래에서 결과를 확인해보세요.
              </p>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full"
              >
                결과 확인하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
