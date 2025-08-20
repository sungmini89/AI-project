import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { EmotionType, EMOTION_COLORS, EMOTION_EMOJIS } from '../../services/emotionAnalysisService';
import { EmotionHistory } from '../../services/databaseService';

// Chart.js 구성 요소 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface EmotionChartProps {
  data: EmotionHistory[];
  type: 'line' | 'bar' | 'doughnut';
  title?: string;
  timeRange?: 'week' | 'month' | 'year';
  className?: string;
}

const EmotionChart: React.FC<EmotionChartProps> = ({
  data,
  type,
  title = '감정 분석',
  timeRange = 'week',
  className = ''
}) => {
  // 데이터 처리 및 차트 데이터 생성
  const processData = () => {
    if (!data.length) {
      return {
        labels: [],
        datasets: []
      };
    }

    // 시간 범위에 따른 라벨 생성
    const getLabels = () => {
      const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      switch (timeRange) {
        case 'week':
          return sortedData.map(item => 
            new Date(item.date).toLocaleDateString('ko-KR', { 
              month: 'short', 
              day: 'numeric' 
            })
          );
        case 'month':
          return sortedData.map(item => 
            new Date(item.date).toLocaleDateString('ko-KR', { 
              month: 'short', 
              day: 'numeric' 
            })
          );
        case 'year':
          return sortedData.map(item => 
            new Date(item.date).toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'short' 
            })
          );
        default:
          return sortedData.map((_, index) => `Day ${index + 1}`);
      }
    };

    const labels = getLabels();

    if (type === 'doughnut') {
      // 도넛 차트용 데이터 (전체 기간 감정 분포)
      const emotionTotals: Record<EmotionType, number> = {
        happy: 0, sad: 0, angry: 0, neutral: 0, excited: 0,
        calm: 0, anxious: 0, proud: 0, disappointed: 0, grateful: 0
      };

      data.forEach(item => {
        Object.entries(item.emotions).forEach(([emotion, score]) => {
          emotionTotals[emotion as EmotionType] += score;
        });
      });

      const emotionLabels = Object.keys(emotionTotals).filter(
        emotion => emotionTotals[emotion as EmotionType] > 0
      );

      const emotionValues = emotionLabels.map(
        emotion => emotionTotals[emotion as EmotionType]
      );

      const emotionColorsArray = emotionLabels.map(
        emotion => EMOTION_COLORS[emotion as EmotionType]
      );

      return {
        labels: emotionLabels.map(emotion => 
          `${EMOTION_EMOJIS[emotion as EmotionType]} ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`
        ),
        datasets: [{
          data: emotionValues,
          backgroundColor: emotionColorsArray.map(color => `${color}80`), // 80% opacity
          borderColor: emotionColorsArray,
          borderWidth: 2,
          hoverBackgroundColor: emotionColorsArray,
          hoverBorderWidth: 3,
        }]
      };
    }

    // 라인/바 차트용 데이터
    const primaryEmotions = data.map(item => item.primaryEmotion);
    const overallScores = data.map(item => item.overallScore);

    const datasets = [];

    if (type === 'line') {
      // 전체 감정 점수 추세
      datasets.push({
        label: '전체 감정 점수',
        data: overallScores,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: overallScores.map(score => {
          if (score > 2) return EMOTION_COLORS.happy;
          if (score < -2) return EMOTION_COLORS.sad;
          return EMOTION_COLORS.neutral;
        }),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        tension: 0.3,
        fill: true,
      });

      // 주요 감정별 개별 선
      const emotionTypes: EmotionType[] = ['happy', 'sad', 'angry', 'calm', 'excited'];
      emotionTypes.forEach(emotionType => {
        const emotionData = data.map(item => item.emotions[emotionType] || 0);
        const hasData = emotionData.some(value => value > 0);
        
        if (hasData) {
          datasets.push({
            label: `${EMOTION_EMOJIS[emotionType]} ${emotionType.charAt(0).toUpperCase() + emotionType.slice(1)}`,
            data: emotionData,
            borderColor: EMOTION_COLORS[emotionType],
            backgroundColor: `${EMOTION_COLORS[emotionType]}20`,
            borderWidth: 1,
            pointRadius: 3,
            tension: 0.3,
            fill: false,
          });
        }
      });
    } else if (type === 'bar') {
      // 바 차트 - 주요 감정 분포
      datasets.push({
        label: '감정 점수',
        data: overallScores,
        backgroundColor: overallScores.map((score, index) => {
          const emotion = primaryEmotions[index];
          return `${EMOTION_COLORS[emotion]}80`;
        }),
        borderColor: overallScores.map((score, index) => {
          const emotion = primaryEmotions[index];
          return EMOTION_COLORS[emotion];
        }),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      });
    }

    return {
      labels,
      datasets
    };
  };

  const chartData = processData();

  // 차트 옵션
  const getOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            size: 16,
            weight: 'bold' as const,
          },
          color: '#374151',
          padding: {
            top: 10,
            bottom: 20,
          },
        },
        legend: {
          display: type !== 'doughnut',
          position: 'top' as const,
          labels: {
            font: {
              size: 12,
            },
            color: '#6B7280',
            usePointStyle: true,
            padding: 20,
          },
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#374151',
          bodyColor: '#6B7280',
          borderColor: '#E5E7EB',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            title: (context: any) => {
              if (type === 'doughnut') {
                return context[0].label;
              }
              return `${context[0].label}`;
            },
            label: (context: any) => {
              if (type === 'doughnut') {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.dataset.label || 'Value'}: ${context.parsed} (${percentage}%)`;
              }
              return `${context.dataset.label}: ${context.parsed.y || context.parsed}`;
            },
          },
        },
      },
    };

    if (type === 'doughnut') {
      return {
        ...baseOptions,
        cutout: '60%',
        plugins: {
          ...baseOptions.plugins,
          legend: {
            display: true,
            position: 'right' as const,
            labels: {
              font: {
                size: 12,
              },
              color: '#6B7280',
              usePointStyle: true,
              padding: 15,
              generateLabels: (chart: any) => {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label: string, i: number) => {
                    const dataset = data.datasets[0];
                    const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const value = dataset.data[i];
                    const percentage = ((value / total) * 100).toFixed(1);
                    
                    return {
                      text: `${label} (${percentage}%)`,
                      fillStyle: dataset.backgroundColor[i],
                      strokeStyle: dataset.borderColor[i],
                      lineWidth: dataset.borderWidth,
                      hidden: chart.getDatasetMeta(0).data[i].hidden,
                      index: i,
                    };
                  });
                }
                return [];
              },
            },
          },
        },
      };
    }

    return {
      ...baseOptions,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: '날짜',
            color: '#6B7280',
            font: {
              size: 12,
            },
          },
          grid: {
            display: false,
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 11,
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: type === 'line' ? '감정 점수' : '강도',
            color: '#6B7280',
            font: {
              size: 12,
            },
          },
          grid: {
            color: '#F3F4F6',
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 11,
            },
          },
          beginAtZero: true,
          suggestedMin: type === 'line' ? -5 : 0,
          suggestedMax: type === 'line' ? 5 : undefined,
        },
      },
    };
  };

  // 데이터가 없는 경우
  if (!data.length) {
    return (
      <div className={`bg-white rounded-lg shadow-soft border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">데이터가 없습니다</h3>
          <p className="text-gray-500">일기를 작성하면 감정 분석 차트가 표시됩니다.</p>
        </div>
      </div>
    );
  }

  const ChartComponent = type === 'line' ? Line : type === 'bar' ? Bar : Doughnut;

  return (
    <div className={`bg-white rounded-lg shadow-soft border border-gray-200 p-6 ${className}`}>
      <div className="h-80">
        <ChartComponent
          data={chartData}
          options={getOptions()}
        />
      </div>
      
      {/* 차트 하단 통계 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {data.length}
            </div>
            <div className="text-xs text-gray-500">총 일기</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-green-600">
              {data.filter(item => item.overallScore > 0).length}
            </div>
            <div className="text-xs text-gray-500">긍정적</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {data.filter(item => item.overallScore === 0).length}
            </div>
            <div className="text-xs text-gray-500">중립적</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-red-600">
              {data.filter(item => item.overallScore < 0).length}
            </div>
            <div className="text-xs text-gray-500">부정적</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionChart;