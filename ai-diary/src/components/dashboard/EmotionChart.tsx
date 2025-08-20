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
      (emotion) => `${EMOTION_EMOJIS[emotion as EmotionType]} ${emotion}`
    );
    const data = Object.values(counts);

    return {
      labels,
      datasets: [
        {
          label: "감정 발생 횟수",
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
      (emotion) => `${EMOTION_EMOJIS[emotion as EmotionType]} ${emotion}`
    );
    const data = Object.values(counts);

    return {
      labels,
      datasets: [
        {
          label: "감정 분포",
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
    const labels = overallScores.map((item) => item.emotion);
    const data = overallScores.map((item) => item.score);

    return {
      labels,
      datasets: [
        {
          label: "평균 감정 점수",
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
        },
        title: {
          display: true,
          text: `${
            timeRange === "week"
              ? "주간"
              : timeRange === "month"
              ? "월간"
              : "연간"
          } 감정 분석`,
        },
      },
    };

    switch (chartType) {
      case "bar":
        return {
          ...baseOptions,
          scales: {
            y: {
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
            y: {
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
      <div className="chart-controls">
        <div className="control-group">
          <label className="control-label">차트 유형:</label>
          <select
            value={chartType}
            onChange={(e) =>
              setChartType(e.target.value as "bar" | "doughnut" | "line")
            }
            className="control-select"
          >
            <option value="bar">막대 차트</option>
            <option value="doughnut">도넛 차트</option>
            <option value="line">선 차트</option>
          </select>
        </div>

        <div className="control-group">
          <label className="control-label">시간 범위:</label>
          <select
            value={timeRange}
            onChange={(e) =>
              setTimeRange(e.target.value as "week" | "month" | "year")
            }
            className="control-select"
          >
            <option value="week">주간</option>
            <option value="month">월간</option>
            <option value="year">연간</option>
          </select>
        </div>
      </div>

      {/* 차트 */}
      <div className="chart-container">
        {emotionData.length > 0 ? (
          renderChart()
        ) : (
          <div className="no-data">
            <p>선택한 기간에 감정 데이터가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionChart;
