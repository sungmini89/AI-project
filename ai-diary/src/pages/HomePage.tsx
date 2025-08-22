import React, { useState, useEffect } from "react";
import {
  BookOpen,
  BarChart3,
  Settings,
  Plus,
  Calendar,
  TrendingUp,
  Heart,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import type { DiaryEntry, Statistics } from "../services/databaseService";
import { databaseService } from "../services/databaseService";
import { getEmotionEmoji, getEmotionColor } from "../constants/emotions";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useApp } from "../contexts/AppContext";
import DebugTest from "../components/debug/DebugTest";
import ComprehensiveDebugPanel from "../components/debug/ComprehensiveDebugPanel";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const HomePage: React.FC = () => {
  const [recentEntries, setRecentEntries] = useState<DiaryEntry[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { safeAsync } = useAsyncOperation();
  const { language, isDark } = useApp();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setIsLoading(true);

    try {
      // 최근 일기 5개 로드
      const entries = await safeAsync(() => databaseService.getAllEntries());
      if (entries) {
        const sortedEntries = entries
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);
        setRecentEntries(sortedEntries);
      } else {
        // 데이터 로딩 실패 시 빈 배열로 설정
        setRecentEntries([]);
      }

      // 통계 로드
      const stats = await safeAsync(() => databaseService.getStatistics());
      if (stats) {
        setStatistics(stats);
      } else {
        // 통계 로딩 실패 시 기본 통계 설정
        setStatistics({
          totalEntries: 0,
          averageEmotionScore: 0,
          mostFrequentEmotion: "neutral",
          emotionDistribution: {
            happy: 0,
            sad: 0,
            angry: 0,
            neutral: 0,
            excited: 0,
            calm: 0,
            anxious: 0,
            proud: 0,
            disappointed: 0,
            grateful: 0,
          },
          weeklyTrend: [],
        });
      }
    } catch (error) {
      console.error("홈 데이터 로드 실패:", error);
      toast.error("데이터를 불러올 수 없습니다.");

      // 에러 발생 시에도 기본값 설정
      setRecentEntries([]);
      setStatistics({
        totalEntries: 0,
        averageEmotionScore: 0,
        mostFrequentEmotion: "neutral",
        emotionDistribution: {
          happy: 0,
          sad: 0,
          angry: 0,
          neutral: 0,
          excited: 0,
          calm: 0,
          anxious: 0,
          proud: 0,
          disappointed: 0,
          grateful: 0,
        },
        weeklyTrend: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "좋은 아침입니다!";
    if (hour < 18) return "좋은 오후입니다!";
    return "좋은 저녁입니다!";
  };

  const getMotivationalMessage = () => {
    const messages = [
      "오늘 하루도 힘내세요! 💪",
      "작은 진전도 큰 성취입니다 ✨",
      "자신을 믿고 나아가세요 🌟",
      "오늘의 감정을 기록해보세요 📝",
      "매일이 새로운 시작입니다 🌅",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${isDark ? "dark" : "light"}`}>
      {/* 디버그 테스트 패널 (개발 모드에서만) */}
      <DebugTest />
      <ComprehensiveDebugPanel />

      {/* 헤더 섹션 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {getGreeting()}
            </h1>
            <p
              className={`text-lg ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {language === "ko"
                ? "오늘 하루는 어떠셨나요?"
                : "How was your day today?"}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/write")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>{language === "ko" ? "일기 작성" : "Write Diary"}</span>
            </button>

            <button
              onClick={() => navigate("/settings")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isDark
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>{language === "ko" ? "설정" : "Settings"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className={`rounded-xl shadow-sm border p-6 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {statistics.totalEntries}
                </div>
                <div
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {language === "ko" ? "총 일기 수" : "Total Entries"}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl shadow-sm border p-6 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <span className="text-2xl">
                  {getEmotionEmoji(statistics.mostFrequentEmotion)}
                </span>
              </div>
              <div>
                <div
                  className={`text-lg font-bold capitalize ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {statistics.mostFrequentEmotion}
                </div>
                <div
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {language === "ko" ? "주요 감정" : "Main Emotion"}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl shadow-sm border p-6 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {statistics.averageEmotionScore.toFixed(1)}
                </div>
                <div
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {language === "ko" ? "평균 감정 점수" : "Avg Emotion Score"}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl shadow-sm border p-6 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg mr-4">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {statistics.weeklyTrend.length}
                </div>
                <div
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {language === "ko" ? "주간 기록" : "Weekly Records"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 최근 일기 섹션 */}
        <div className="lg:col-span-2">
          <div
            className={`rounded-xl shadow-sm border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`p-6 border-b ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2
                  className={`text-xl font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {language === "ko" ? "최근 일기" : "Recent Diaries"}
                </h2>
                <button
                  onClick={() => navigate("/diary")}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {language === "ko" ? "모두 보기" : "View All"}
                </button>
              </div>
            </div>

            <div className="p-6">
              {recentEntries.length > 0 ? (
                <div className="space-y-4">
                  {recentEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                        isDark
                          ? "border-gray-700 hover:bg-gray-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => navigate(`/write/${entry.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3
                          className={`font-medium truncate flex-1 ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {entry.title ||
                            (language === "ko" ? "제목 없음" : "No Title")}
                        </h3>
                        <span
                          className={`text-sm ml-4 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {format(new Date(entry.createdAt), "MM/dd", {
                            locale: language === "ko" ? ko : undefined,
                          })}
                        </span>
                      </div>
                      <p
                        className={`text-sm line-clamp-2 ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {entry.content}
                      </p>
                      {entry.emotionAnalysis && (
                        <div className="flex items-center mt-3">
                          <span className="text-lg mr-2">
                            {getEmotionEmoji(
                              entry.emotionAnalysis.primaryEmotion
                            )}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isDark
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {entry.emotionAnalysis.primaryEmotion}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <p
                    className={`text-lg ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {language === "ko"
                      ? "아직 일기가 없습니다."
                      : "No diaries yet."}
                  </p>
                  <button
                    onClick={() => navigate("/write")}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {language === "ko"
                      ? "첫 번째 일기 작성하기"
                      : "Write Your First Diary"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 빠른 액션 */}
          <div
            className={`rounded-xl shadow-sm border p-6 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {language === "ko" ? "빠른 액션" : "Quick Actions"}
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/write")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isDark
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                }`}
              >
                <Plus className="w-5 h-5 mr-3" />
                {language === "ko" ? "새 일기 작성" : "New Diary"}
              </button>
              <button
                onClick={() => navigate("/analytics")}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                {language === "ko" ? "감정 분석" : "Emotion Analysis"}
              </button>
            </div>
          </div>

          {/* 감정 통계 */}
          <div
            className={`rounded-xl shadow-sm border p-6 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {language === "ko" ? "감정 통계" : "Emotion Stats"}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {language === "ko" ? "긍정적" : "Positive"}
                </span>
                <span
                  className={`font-medium ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {statistics?.emotionDistribution.happy || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {language === "ko" ? "중립적" : "Neutral"}
                </span>
                <span
                  className={`font-medium ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {statistics?.emotionDistribution.neutral || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {language === "ko" ? "부정적" : "Negative"}
                </span>
                <span
                  className={`font-medium ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {statistics?.emotionDistribution.sad || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
