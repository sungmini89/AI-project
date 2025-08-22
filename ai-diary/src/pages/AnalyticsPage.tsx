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
import { useApp } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";

/**
 * 감정 분석 페이지 컴포넌트
 *
 * 사용자의 일기 데이터를 바탕으로 감정 상태를 분석하고 통계를 제공합니다.
 * - 전체 통계 요약 (총 일기 수, 가장 빈번한 감정, 평균 감정 점수, 감정 트렌드)
 * - 상세 감정 통계 (감정별 분포 및 비율)
 * - 주간 감정 트렌드 차트
 * - 감정 캘린더
 * - 날짜별 감정 점수 상세 보기
 *
 * @returns 감정 분석 페이지 JSX
 */
const AnalyticsPage: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmotionScoresModal, setShowEmotionScoresModal] = useState(false);
  const [emotionScoresData, setEmotionScoresData] = useState<
    Array<{ date: string; score: number; emotion: string }>
  >([]);
  const { language, isDark } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    loadStatistics();
  }, []);

  /**
   * 통계 데이터를 로드합니다.
   * 데이터베이스에서 일기 통계 정보를 가져와 상태를 업데이트합니다.
   */
  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const stats = await databaseService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("통계 로드 실패:", error);
      toast.error(
        language === "ko"
          ? "통계를 불러올 수 없습니다."
          : "Failed to load statistics."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 분석 데이터를 JSON 파일로 내보냅니다.
   * 현재까지의 모든 감정 분석 데이터를 다운로드할 수 있습니다.
   */
  const handleExportData = async () => {
    try {
      const data = await databaseService.exportData();
      const blob = new Blob([JSON.stringify(data)], {
        type: "application/json",
      });
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
      toast.success(
        language === "ko"
          ? "분석 데이터가 내보내졌습니다."
          : "Analytics data exported successfully."
      );
    } catch (error) {
      console.error("데이터 내보내기 실패:", error);
      toast.error(
        language === "ko"
          ? "데이터 내보내기에 실패했습니다."
          : "Failed to export data."
      );
    }
  };

  /**
   * 평균 감정 점수 카드 클릭 시 호출됩니다.
   * emotionHistory에서 날짜별 감정 점수 데이터를 가져와 팝업 모달을 표시합니다.
   */
  const handleEmotionScoresClick = async () => {
    try {
      // emotionHistory에서 날짜별 감정 점수 데이터 가져오기
      const emotionHistory = await databaseService.getEmotionHistory();

      // 날짜별로 그룹화하고 평균 점수 계산
      const scoresByDate = emotionHistory.reduce((acc, entry) => {
        const date = new Date(entry.date).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        if (!acc[date]) {
          acc[date] = { scores: [], emotions: [] };
        }

        acc[date].scores.push(entry.score || 0);
        acc[date].emotions.push(entry.emotion);

        return acc;
      }, {} as Record<string, { scores: number[]; emotions: string[] }>);

      // 날짜별 평균 점수와 주요 감정으로 변환
      const processedData = Object.entries(scoresByDate).map(
        ([date, data]) => ({
          date,
          score:
            data.scores.reduce((sum, score) => sum + score, 0) /
            data.scores.length,
          emotion: data.emotions[0], // 첫 번째 감정을 주요 감정으로 사용
        })
      );

      // 날짜순으로 정렬
      processedData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setEmotionScoresData(processedData);
      setShowEmotionScoresModal(true);
    } catch (error) {
      console.error("감정 점수 데이터 로드 실패:", error);
      toast.error(
        language === "ko"
          ? "감정 점수 데이터를 불러올 수 없습니다."
          : "Failed to load emotion score data."
      );
    }
  };

  /**
   * 특정 감정의 발생 비율을 계산합니다.
   *
   * @param emotion - 계산할 감정 타입
   * @returns 해당 감정의 발생 비율 (0-100%)
   */
  const getEmotionPercentage = (emotion: EmotionType): number => {
    if (!statistics) return 0;
    const total = Object.values(statistics.emotionDistribution).reduce(
      (sum, count) => sum + count,
      0
    );
    return total > 0
      ? Math.round((statistics.emotionDistribution[emotion] / total) * 100)
      : 0;
  };

  /**
   * 감정 상태의 전반적인 트렌드를 분석합니다.
   * 최근 3일과 이전 3일의 평균 감정 점수를 비교하여 개선/악화/안정 상태를 판단합니다.
   *
   * @returns "improving" | "declining" | "stable" - 감정 상태 트렌드
   */
  const getEmotionTrend = () => {
    if (!statistics || statistics.weeklyTrend.length < 2) return "stable";
    const recent = statistics.weeklyTrend.slice(-3);
    const older = statistics.weeklyTrend.slice(-6, -3);

    if (recent.length === 0 || older.length === 0) return "stable";

    const recentAvg =
      recent.reduce((sum, item) => sum + item.score, 0) / recent.length;
    const olderAvg =
      older.reduce((sum, item) => sum + item.score, 0) / older.length;

    if (recentAvg > olderAvg + 0.5) return "improving";
    if (recentAvg < olderAvg - 0.5) return "declining";
    return "stable";
  };

  /**
   * 감정 트렌드에 따른 아이콘을 반환합니다.
   *
   * @returns 트렌드를 나타내는 이모지 아이콘
   */
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

  /**
   * 감정 트렌드에 따른 설명 텍스트를 반환합니다.
   * 현재 언어 설정에 맞는 텍스트를 제공합니다.
   *
   * @returns 감정 트렌드 설명 텍스트
   */
  const getTrendText = () => {
    const trend = getEmotionTrend();
    switch (trend) {
      case "improving":
        return language === "ko"
          ? "감정 상태가 개선되고 있습니다"
          : "Emotional state is improving";
      case "declining":
        return language === "ko"
          ? "감정 상태가 악화되고 있습니다"
          : "Emotional state is declining";
      default:
        return language === "ko"
          ? "감정 상태가 안정적입니다"
          : "Emotional state is stable";
    }
  };

  /**
   * 감정 이름을 현재 언어에 맞게 번역합니다.
   * 한국어/영어 감정 이름 매핑을 제공합니다.
   *
   * @param emotion - 번역할 감정 이름 (영어)
   * @returns 현재 언어에 맞는 감정 이름
   */
  const getEmotionName = (emotion: string) => {
    const emotionNames: Record<string, { ko: string; en: string }> = {
      happy: { ko: "행복", en: "Happy" },
      sad: { ko: "슬픔", en: "Sad" },
      angry: { ko: "화남", en: "Angry" },
      neutral: { ko: "중립", en: "Neutral" },
      excited: { ko: "흥분", en: "Excited" },
      calm: { ko: "차분", en: "Calm" },
      anxious: { ko: "불안", en: "Anxious" },
      proud: { ko: "자랑", en: "Proud" },
      disappointed: { ko: "실망", en: "Disappointed" },
      grateful: { ko: "감사", en: "Grateful" },
    };

    const emotionData = emotionNames[emotion] || { ko: emotion, en: emotion };
    return language === "ko" ? emotionData.ko : emotionData.en;
  };

  if (isLoading) {
    return (
      <div
        className={`max-w-7xl mx-auto px-4 py-8 ${isDark ? "dark" : "light"}`}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>
              {language === "ko"
                ? "통계를 불러오는 중..."
                : "Loading statistics..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!statistics || statistics.totalEntries === 0) {
    return (
      <div
        className={`max-w-7xl mx-auto px-4 py-8 ${isDark ? "dark" : "light"}`}
      >
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h2
            className={`text-2xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {language === "ko"
              ? "분석할 데이터가 없습니다"
              : "No data to analyze"}
          </h2>
          <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            {language === "ko"
              ? "일기를 작성하시면 감정 분석 결과를 확인할 수 있습니다."
              : "Write some diaries to see emotion analysis results."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${isDark ? "dark" : "light"}`}>
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1
              className={`text-3xl font-bold mb-2 flex items-center ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
              {language === "ko" ? "감정 분석" : "Emotion Analysis"}
            </h1>
            <p
              className={`text-lg ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {language === "ko"
                ? "일기 데이터를 바탕으로 감정 상태를 분석하고 통계를 확인할 수 있습니다."
                : "Analyze emotional states and view statistics based on your diary data."}
            </p>
          </div>

          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>{language === "ko" ? "데이터 내보내기" : "Export Data"}</span>
          </button>
        </div>
      </div>

      {/* 메인 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          onClick={() => navigate("/diary")}
          className={`rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
            isDark
              ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
              : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
          title={
            language === "ko"
              ? "클릭하여 일기 목록 보기"
              : "Click to view diary list"
          }
        >
          <div className="flex items-center">
            <div
              className={`p-3 rounded-lg mr-4 ${
                isDark ? "bg-blue-900" : "bg-blue-100"
              }`}
            >
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
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`p-3 rounded-lg mr-4 ${
                isDark ? "bg-green-900" : "bg-green-100"
              }`}
            >
              <span className="text-2xl">
                {EMOTION_EMOJIS[statistics.mostFrequentEmotion]}
              </span>
            </div>
            <div>
              <div
                className={`text-lg font-bold capitalize ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {getEmotionName(statistics.mostFrequentEmotion)}
              </div>
              <div
                className={`text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {language === "ko"
                  ? "가장 빈번한 감정"
                  : "Most Frequent Emotion"}
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => handleEmotionScoresClick()}
          className={`rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
            isDark
              ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
              : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
          title={
            language === "ko"
              ? "클릭하여 날짜별 감정 점수 보기"
              : "Click to view emotion scores by date"
          }
        >
          <div className="flex items-center">
            <div
              className={`p-3 rounded-lg mr-4 ${
                isDark ? "bg-purple-900" : "bg-purple-100"
              }`}
            >
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
                {language === "ko" ? "평균 감정 점수" : "Average Emotion Score"}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl shadow-sm border p-6 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`p-3 rounded-lg mr-4 ${
                isDark ? "bg-orange-900" : "bg-orange-100"
              }`}
            >
              <span className="text-2xl">{getTrendIcon()}</span>
            </div>
            <div>
              <div
                className={`text-sm font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {language === "ko" ? "감정 트렌드" : "Emotion Trend"}
              </div>
              <div
                className={`text-xs ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {getTrendText()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 콘텐츠 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 감정 분포 */}
        <div
          className={`rounded-xl shadow-sm border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div
            className={`p-6 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold flex items-center ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              <PieChart className="w-6 h-6 mr-2 text-purple-600" />
              {language === "ko"
                ? "상세 감정 통계"
                : "Detailed Emotion Statistics"}
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
                      <span
                        className={`font-medium capitalize ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {getEmotionName(emotion)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {count}회
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {getEmotionPercentage(emotion as EmotionType)}%
                      </span>
                    </div>

                    <div
                      className={`w-24 rounded-full h-2 ml-3 ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
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
        <div
          className={`rounded-xl shadow-sm border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div
            className={`p-6 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold flex items-center ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
              {language === "ko" ? "주간 감정 트렌드" : "Weekly Emotion Trend"}
            </h2>
          </div>
          <div className="p-6">
            <EmotionChart />
          </div>
        </div>
      </div>

      {/* 감정 캘린더 */}
      <div
        className={`rounded-xl shadow-sm border ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`p-6 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-semibold flex items-center ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            <Calendar className="w-6 h-6 mr-2 text-orange-600" />
            {language === "ko" ? "감정 캘린더" : "Emotion Calendar"}
          </h2>
        </div>
        <div className="p-6">
          <EmotionCalendar />
        </div>
      </div>

      {/* 날짜별 감정 점수 팝업 모달 */}
      {showEmotionScoresModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`max-w-2xl w-full max-h-[80vh] rounded-xl shadow-lg ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border overflow-hidden`}
          >
            {/* 모달 헤더 */}
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
                  {language === "ko"
                    ? "날짜별 감정 점수"
                    : "Emotion Scores by Date"}
                </h2>
                <button
                  onClick={() => setShowEmotionScoresModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 모달 콘텐츠 - 스크롤 가능 */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {emotionScoresData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <p
                    className={`text-lg ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {language === "ko"
                      ? "감정 점수 데이터가 없습니다."
                      : "No emotion score data available."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emotionScoresData.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        isDark
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {EMOTION_EMOJIS[item.emotion as EmotionType] ||
                              "😐"}
                          </span>
                          <div>
                            <div
                              className={`font-medium ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {item.date}
                            </div>
                            <div
                              className={`text-sm ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {language === "ko"
                                ? "주요 감정"
                                : "Primary Emotion"}
                              : {item.emotion}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`text-right ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          <div className="text-2xl font-bold">
                            {item.score > 0 ? "+" : ""}
                            {item.score.toFixed(1)}
                          </div>
                          <div
                            className={`text-sm ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {language === "ko" ? "감정 점수" : "Emotion Score"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
