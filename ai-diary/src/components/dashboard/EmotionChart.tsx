import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import type { EmotionType } from "../../services/emotionAnalysisService";
import {
  EMOTION_COLORS,
  EMOTION_EMOJIS,
} from "../../services/emotionAnalysisService";
import type { EmotionHistory } from "../../services/databaseService";
import { databaseService } from "../../services/databaseService";
import { useApp } from "../../contexts/AppContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface EmotionChartProps {
  className?: string;
}

const EmotionChart: React.FC<EmotionChartProps> = ({ className = "" }) => {
  const [chartType, setChartType] = useState<"bar" | "doughnut" | "line">(
    "bar"
  );
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [emotionData, setEmotionData] = useState<EmotionHistory[]>([]);
  const { language, isDark } = useApp();

  useEffect(() => {
    loadEmotionData();
  }, [timeRange]);

  const loadEmotionData = async () => {
    try {
      const endDate = new Date();
      let startDate = new Date();

      switch (timeRange) {
        case "week":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const data = await databaseService.getEmotionHistoryByDateRange(
        startDate,
        endDate
      );
      setEmotionData(data);
    } catch (error) {
      console.error("감정 데이터 로드 실패:", error);
    }
  };

  // 감정 이름을 한국어로 번역하는 함수
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

  const getEmotionCounts = () => {
    const counts: Record<EmotionType, number> = {
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
    };

    emotionData.forEach((entry) => {
      if (entry.emotion in counts) {
        counts[entry.emotion]++;
      }
    });

    return counts;
  };

  const getEmotionScores = () => {
    const scores: Record<EmotionType, number[]> = {
      happy: [],
      sad: [],
      angry: [],
      neutral: [],
      excited: [],
      calm: [],
      anxious: [],
      proud: [],
      disappointed: [],
      grateful: [],
    };

    emotionData.forEach((entry) => {
      if (entry.emotion in scores) {
        scores[entry.emotion].push(entry.score || 0);
      }
    });

    return scores;
  };

  const getOverallScores = () => {
    const scores = getEmotionScores();
    return Object.entries(scores).map(([emotion, emotionScores]) => {
      const average =
        emotionScores.length > 0
          ? emotionScores.reduce((sum, score) => sum + score, 0) /
            emotionScores.length
          : 0;
      return { emotion: emotion as EmotionType, score: average };
    });
  };

  const getBarChartData = () => {
    const counts = getEmotionCounts();

    const labels = Object.keys(counts).map(
      (emotion) =>
        `${EMOTION_EMOJIS[emotion as EmotionType]} ${getEmotionName(emotion)}`
    );
    const data = Object.values(counts);

    return {
      labels,
      datasets: [
        {
          label: language === "ko" ? "감정 발생 횟수" : "Emotion Frequency",
          data,
          backgroundColor: Object.keys(counts).map(
            (emotion) => EMOTION_COLORS[emotion as EmotionType]
          ),
          borderColor: Object.keys(counts).map(
            (emotion) => EMOTION_COLORS[emotion as EmotionType]
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  const getDoughnutChartData = () => {
    const counts = getEmotionCounts();
    const labels = Object.keys(counts).map(
      (emotion) =>
        `${EMOTION_EMOJIS[emotion as EmotionType]} ${getEmotionName(emotion)}`
    );
    const data = Object.values(counts);

    return {
      labels,
      datasets: [
        {
          label: language === "ko" ? "감정 분포" : "Emotion Distribution",
          data,
          backgroundColor: Object.keys(counts).map(
            (emotion) => EMOTION_COLORS[emotion as EmotionType]
          ),
          borderColor: Object.keys(counts).map(
            (emotion) => EMOTION_COLORS[emotion as EmotionType]
          ),
          borderWidth: 2,
        },
      ],
    };
  };

  const getLineChartData = () => {
    const overallScores = getOverallScores();
    const labels = overallScores.map((item) => getEmotionName(item.emotion));
    const data = overallScores.map((item) => item.score);

    return {
      labels,
      datasets: [
        {
          label: language === "ko" ? "평균 감정 점수" : "Average Emotion Score",
          data,
          backgroundColor: overallScores.map(
            (_score, index) => EMOTION_COLORS[labels[index] as EmotionType]
          ),
          borderColor: overallScores.map(
            (_score, index) => EMOTION_COLORS[labels[index] as EmotionType]
          ),
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
      ],
    };
  };

  const getChartData = () => {
    switch (chartType) {
      case "bar":
        return getBarChartData();
      case "doughnut":
        return getDoughnutChartData();
      case "line":
        return getLineChartData();
      default:
        return getBarChartData();
    }
  };

  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: "top" as const,
          labels: {
            color: isDark ? "#f9fafb" : "#111827",
          },
        },
        title: {
          display: true,
          text: `${
            timeRange === "week"
              ? language === "ko"
                ? "주간"
                : "Weekly"
              : timeRange === "month"
              ? language === "ko"
                ? "월간"
                : "Monthly"
              : language === "ko"
              ? "연간"
              : "Yearly"
          } ${language === "ko" ? "감정 분석" : "Emotion Analysis"}`,
          color: isDark ? "#f9fafb" : "#111827",
        },
      },
      scales: {
        x: {
          ticks: {
            color: isDark ? "#f9fafb" : "#111827",
          },
          grid: {
            color: isDark ? "#374151" : "#e5e7eb",
          },
        },
        y: {
          ticks: {
            color: isDark ? "#f9fafb" : "#111827",
          },
          grid: {
            color: isDark ? "#374151" : "#e5e7eb",
          },
        },
      },
    };

    switch (chartType) {
      case "bar":
        return {
          ...baseOptions,
          scales: {
            ...baseOptions.scales,
            y: {
              ...baseOptions.scales.y,
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        };
      case "line":
        return {
          ...baseOptions,
          scales: {
            ...baseOptions.scales,
            y: {
              ...baseOptions.scales.y,
              beginAtZero: true,
              max: 5,
              ticks: {
                stepSize: 1,
              },
            },
          },
        };
      default:
        return baseOptions;
    }
  };

  const renderChart = () => {
    const data = getChartData();
    const options = getChartOptions();

    switch (chartType) {
      case "bar":
        return <Bar data={data} options={options} />;
      case "doughnut":
        return <Doughnut data={data} options={options} />;
      case "line":
        return <Line data={data} options={options} />;
      default:
        return <Bar data={data} options={options} />;
    }
  };

  return (
    <div className={`emotion-chart ${className}`}>
      {/* 차트 컨트롤 */}
      <div className="chart-controls mb-4">
        <div className="flex flex-wrap gap-4">
          <div className="control-group">
            <label
              className={`control-label block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {language === "ko" ? "차트 유형:" : "Chart Type:"}
            </label>
            <select
              value={chartType}
              onChange={(e) =>
                setChartType(e.target.value as "bar" | "doughnut" | "line")
              }
              className={`control-select px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="bar">
                {language === "ko" ? "막대 차트" : "Bar Chart"}
              </option>
              <option value="doughnut">
                {language === "ko" ? "도넛 차트" : "Doughnut Chart"}
              </option>
              <option value="line">
                {language === "ko" ? "선 차트" : "Line Chart"}
              </option>
            </select>
          </div>

          <div className="control-group">
            <label
              className={`control-label block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {language === "ko" ? "시간 범위:" : "Time Range:"}
            </label>
            <select
              value={timeRange}
              onChange={(e) =>
                setTimeRange(e.target.value as "week" | "month" | "year")
              }
              className={`control-select px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="week">
                {language === "ko" ? "주간" : "Weekly"}
              </option>
              <option value="month">
                {language === "ko" ? "월간" : "Monthly"}
              </option>
              <option value="year">
                {language === "ko" ? "연간" : "Yearly"}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* 차트 */}
      <div className="chart-container">
        {emotionData.length > 0 ? (
          renderChart()
        ) : (
          <div
            className={`no-data text-center py-8 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            <p>
              {language === "ko"
                ? "선택한 기간에 감정 데이터가 없습니다."
                : "No emotion data available for the selected period."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionChart;
