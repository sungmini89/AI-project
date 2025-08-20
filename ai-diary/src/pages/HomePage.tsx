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
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const HomePage: React.FC = () => {
  const [recentEntries, setRecentEntries] = useState<DiaryEntry[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);

      // 최근 일기 5개 로드
      const entries = await databaseService.getAllEntries();
      const sortedEntries = entries
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);
      setRecentEntries(sortedEntries);

      // 통계 로드
      const stats = await databaseService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("홈 데이터 로드 실패:", error);
      toast.error("데이터를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojis: Record<string, string> = {
      happy: "😊",
      sad: "😢",
      angry: "😠",
      neutral: "😐",
      excited: "🤩",
      calm: "😌",
      anxious: "😰",
      proud: "😎",
      disappointed: "😞",
      grateful: "🙏",
    };
    return emojis[emotion] || "😐";
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: "#10b981",
      sad: "#6b7280",
      angry: "#ef4444",
      neutral: "#9ca3af",
      excited: "#f59e0b",
      calm: "#3b82f6",
      anxious: "#8b5cf6",
      proud: "#ec4899",
      disappointed: "#dc2626",
      grateful: "#059669",
    };
    return colors[emotion] || "#6b7280";
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
    <div className="max-w-7xl mx-auto">
      {/* 헤더 섹션 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getGreeting()}
            </h1>
            <p className="text-lg text-gray-600">
              감정을 기록하고 분석하여 더 나은 하루를 만들어보세요
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/write")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>새 일기 작성</span>
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>설정</span>
            </button>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {statistics.totalEntries}
                </div>
                <div className="text-sm text-gray-600">총 일기 수</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <span className="text-2xl">
                  {getEmotionEmoji(statistics.mostFrequentEmotion)}
                </span>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 capitalize">
                  {statistics.mostFrequentEmotion}
                </div>
                <div className="text-sm text-gray-600">주요 감정</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {statistics.averageEmotionScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">평균 감정 점수</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg mr-4">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {statistics.weeklyTrend.length}
                </div>
                <div className="text-sm text-gray-600">주간 기록</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 최근 일기 섹션 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  최근 일기
                </h2>
                <button
                  onClick={() => navigate("/list")}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  모두 보기
                </button>
              </div>
            </div>

            <div className="p-6">
              {recentEntries.length > 0 ? (
                <div className="space-y-4">
                  {recentEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/write/${entry.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 truncate flex-1">
                          {entry.title || "제목 없음"}
                        </h3>
                        <span className="text-sm text-gray-500 ml-4">
                          {format(new Date(entry.createdAt), "MM/dd", {
                            locale: ko,
                          })}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {entry.content.substring(0, 100)}
                        {entry.content.length > 100 && "..."}
                      </p>

                      <div className="flex items-center">
                        <span
                          className="text-lg mr-2"
                          style={{
                            color: getEmotionColor(
                              entry.emotionAnalysis?.primaryEmotion || "neutral"
                            ),
                          }}
                        >
                          {getEmotionEmoji(
                            entry.emotionAnalysis?.primaryEmotion || "neutral"
                          )}
                        </span>
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {entry.emotionAnalysis?.primaryEmotion || "neutral"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    아직 작성된 일기가 없습니다
                  </h3>
                  <p className="text-gray-600 mb-6">
                    첫 번째 일기를 작성해보세요!
                  </p>
                  <button
                    onClick={() => navigate("/write")}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>일기 작성하기</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 사이드바 섹션 */}
        <div className="space-y-6">
          {/* 오늘의 한마디 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">💭</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                오늘의 한마디
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {getMotivationalMessage()}
              </p>
            </div>
          </div>

          {/* 빠른 실행 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              빠른 실행
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/write")}
                className="w-full flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">새 일기</span>
              </button>

              <button
                onClick={() => navigate("/analytics")}
                className="w-full flex items-center space-x-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Target className="w-5 h-5" />
                <span className="font-medium">감정 분석</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
