import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  PieChart,
  Activity,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { Statistics } from "../services/databaseService";
import type { EmotionType } from "../services/emotionAnalysisService";
import {
  EMOTION_EMOJIS,
  EMOTION_COLORS,
} from "../services/emotionAnalysisService";
import { databaseService } from "../services/databaseService";
import EmotionCalendar from "../components/dashboard/EmotionCalendar";
import EmotionChart from "../components/dashboard/EmotionChart";

const AnalyticsPage: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const stats = await databaseService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("통계 로드 실패:", error);
      toast.error("통계를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await databaseService.exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-diary-analytics-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("분석 데이터가 내보내졌습니다.");
    } catch (error) {
      console.error("데이터 내보내기 실패:", error);
      toast.error("데이터 내보내기에 실패했습니다.");
    }
  };

  const getEmotionPercentage = (emotion: EmotionType): number => {
    if (!statistics || statistics.totalEntries === 0) return 0;
    return Math.round(
      (statistics.emotionDistribution[emotion] / statistics.totalEntries) * 100
    );
  };

  const getEmotionTrend = (): "improving" | "declining" | "stable" => {
    if (!statistics || statistics.weeklyTrend.length < 2) return "stable";

    const recent = statistics.weeklyTrend.slice(-3);
    const earlier = statistics.weeklyTrend.slice(-6, -3);

    if (recent.length === 0 || earlier.length === 0) return "stable";

    const recentAvg =
      recent.reduce((sum, item) => sum + item.score, 0) / recent.length;
    const earlierAvg =
      earlier.reduce((sum, item) => sum + item.score, 0) / earlier.length;

    if (recentAvg > earlierAvg + 0.5) return "improving";
    if (recentAvg < earlierAvg - 0.5) return "declining";
    return "stable";
  };

  const getTrendIcon = () => {
    const trend = getEmotionTrend();
    switch (trend) {
      case "improving":
        return "📈";
      case "declining":
        return "📉";
      default:
        return "➡️";
    }
  };

  const getTrendText = () => {
    const trend = getEmotionTrend();
    switch (trend) {
      case "improving":
        return "감정 상태가 개선되고 있습니다";
      case "declining":
        return "감정 상태가 악화되고 있습니다";
      default:
        return "감정 상태가 안정적입니다";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">분석 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!statistics || statistics.totalEntries === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            분석할 데이터가 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            일기를 작성하시면 감정 분석 결과를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
              감정 분석
            </h1>
            <p className="text-lg text-gray-600">
              일기 데이터를 바탕으로 감정 상태를 분석하고 통계를 확인할 수
              있습니다.
            </p>
          </div>

          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>데이터 내보내기</span>
          </button>
        </div>
      </div>

      {/* 메인 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                {EMOTION_EMOJIS[statistics.mostFrequentEmotion]}
              </span>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 capitalize">
                {statistics.mostFrequentEmotion}
              </div>
              <div className="text-sm text-gray-600">가장 빈번한 감정</div>
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
              <span className="text-2xl">{getTrendIcon()}</span>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">감정 트렌드</div>
              <div className="text-xs text-gray-600">{getTrendText()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 콘텐츠 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 감정 분포 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <PieChart className="w-6 h-6 mr-2 text-purple-600" />
              상세 감정 통계
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(statistics.emotionDistribution).map(
                ([emotion, count]) => (
                  <div
                    key={emotion}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {EMOTION_EMOJIS[emotion as EmotionType]}
                      </span>
                      <span className="font-medium text-gray-900 capitalize">
                        {emotion}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{count}회</span>
                      <span className="text-sm font-medium text-gray-900">
                        {getEmotionPercentage(emotion as EmotionType)}%
                      </span>
                    </div>

                    <div className="w-24 bg-gray-200 rounded-full h-2 ml-3">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${getEmotionPercentage(
                            emotion as EmotionType
                          )}%`,
                          backgroundColor:
                            EMOTION_COLORS[emotion as EmotionType],
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* 주간 감정 트렌드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
              주간 감정 트렌드
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                {statistics.weeklyTrend.slice(0, 7).map((item, index) => (
                  <div key={index} className="text-center">
                    {new Date(item.date).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                ))}
              </div>

              <div className="flex items-end justify-between h-32 space-x-1">
                {statistics.weeklyTrend.slice(0, 7).map((item, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full rounded-t transition-all duration-300"
                      style={{
                        height: `${Math.max(
                          0,
                          ((item.score + 5) / 10) * 100
                        )}%`,
                        backgroundColor:
                          item.score > 0
                            ? "#10b981"
                            : item.score < 0
                            ? "#ef4444"
                            : "#6b7280",
                        minHeight: "4px",
                      }}
                    />
                    <div className="text-xs text-gray-600 mt-1">
                      {item.score.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 및 캘린더 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 감정 차트 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-600" />
              감정 차트
            </h2>
          </div>
          <div className="p-6">
            <EmotionChart className="w-full" />
          </div>
        </div>

        {/* 감정 캘린더 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-orange-600" />
              감정 캘린더
            </h2>
          </div>
          <div className="p-6">
            <EmotionCalendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
