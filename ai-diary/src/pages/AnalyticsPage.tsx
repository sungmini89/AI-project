import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Clock,
  Heart,
  Activity,
  Download
} from 'lucide-react';
import EmotionChart from '../components/dashboard/EmotionChart';
import EmotionCalendar from '../components/dashboard/EmotionCalendar';
import { databaseService, EmotionHistory, Statistics } from '../services/databaseService';
import { EMOTION_EMOJIS, EMOTION_COLORS, EmotionType } from '../services/emotionAnalysisService';

const AnalyticsPage: React.FC = () => {
  const [emotionHistory, setEmotionHistory] = useState<EmotionHistory[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // 시간 범위에 따른 데이터 조회
      const now = new Date();
      let startDate: Date;
      
      switch (selectedTimeRange) {
        case 'week':
          startDate = new Date();
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date();
          startDate.setDate(now.getDate() - 30);
          break;
        case 'year':
          startDate = new Date();
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      const emotions = await databaseService.getEmotionHistory(startDate, now);
      setEmotionHistory(emotions);
      
      const stats = await databaseService.getStatistics();
      setStatistics(stats);
      
    } catch (error) {
      console.error('분석 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 감정 분포 계산
  const getEmotionDistribution = () => {
    if (!emotionHistory.length) return [];
    
    const distribution = emotionHistory.reduce((acc, emotion) => {
      acc[emotion.primaryEmotion] = (acc[emotion.primaryEmotion] || 0) + 1;
      return acc;
    }, {} as Record<EmotionType, number>);

    return Object.entries(distribution)
      .map(([emotion, count]) => ({
        emotion: emotion as EmotionType,
        count,
        percentage: (count / emotionHistory.length) * 100
      }))
      .sort((a, b) => b.count - a.count);
  };

  // 시간대별 분석
  const getTimeAnalysis = () => {
    if (!emotionHistory.length) return {};
    
    const hourCounts: Record<number, { total: number; positive: number; negative: number }> = {};
    
    emotionHistory.forEach(emotion => {
      const hour = new Date(emotion.date).getHours();
      if (!hourCounts[hour]) {
        hourCounts[hour] = { total: 0, positive: 0, negative: 0 };
      }
      
      hourCounts[hour].total++;
      if (emotion.overallScore > 0) {
        hourCounts[hour].positive++;
      } else if (emotion.overallScore < 0) {
        hourCounts[hour].negative++;
      }
    });

    const mostActiveHour = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b.total - a.total)[0];
    
    const happyHour = Object.entries(hourCounts)
      .sort(([, a], [, b]) => (b.positive / b.total) - (a.positive / a.total))[0];

    return {
      mostActiveHour: mostActiveHour ? parseInt(mostActiveHour[0]) : null,
      happyHour: happyHour ? parseInt(happyHour[0]) : null,
      hourCounts
    };
  };

  // 감정 트렌드 분석
  const getTrendAnalysis = () => {
    if (emotionHistory.length < 7) return null;
    
    const recentWeek = emotionHistory.slice(-7);
    const previousWeek = emotionHistory.slice(-14, -7);
    
    const recentAvg = recentWeek.reduce((sum, e) => sum + e.overallScore, 0) / recentWeek.length;
    const previousAvg = previousWeek.length 
      ? previousWeek.reduce((sum, e) => sum + e.overallScore, 0) / previousWeek.length 
      : 0;
    
    const trend = recentAvg - previousAvg;
    
    return {
      current: recentAvg,
      previous: previousAvg,
      trend,
      isImproving: trend > 0.2,
      isWorsening: trend < -0.2
    };
  };

  const emotionDistribution = getEmotionDistribution();
  const timeAnalysis = getTimeAnalysis();
  const trendAnalysis = getTrendAnalysis();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">분석 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">감정 분석</h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI가 분석한 당신의 감정 패턴과 인사이트를 확인해보세요
            </p>
          </div>
          
          {/* 시간 범위 선택 */}
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {range === 'week' ? '1주일' : range === 'month' ? '1개월' : '1년'}
              </button>
            ))}
          </div>
        </div>

        {emotionHistory.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              분석할 데이터가 없어요
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              일기를 작성하시면 AI가 감정을 분석하여 통계를 제공해드려요
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 핵심 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 총 일기 수 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">총 일기</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {statistics?.totalEntries || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              {/* 평균 감정 점수 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">평균 점수</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {emotionHistory.length > 0 
                        ? (emotionHistory.reduce((sum, e) => sum + e.overallScore, 0) / emotionHistory.length).toFixed(1)
                        : '0.0'
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              {/* 가장 활발한 시간 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">가장 활발한 시간</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {timeAnalysis.mostActiveHour !== null 
                        ? `${timeAnalysis.mostActiveHour}시`
                        : '데이터 없음'
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              {/* 연속 작성일 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">연속 작성</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {statistics?.writingStreak || 0}일
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* 트렌드 분석 카드 */}
            {trendAnalysis && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    감정 트렌드 분석
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    trendAnalysis.isImproving 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : trendAnalysis.isWorsening 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {trendAnalysis.isImproving ? '개선됨' : trendAnalysis.isWorsening ? '악화됨' : '안정적'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">최근 1주일</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {trendAnalysis.current > 0 ? '+' : ''}{trendAnalysis.current.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">이전 1주일</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {trendAnalysis.previous > 0 ? '+' : ''}{trendAnalysis.previous.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">변화량</p>
                    <p className={`text-xl font-bold ${
                      trendAnalysis.trend > 0 ? 'text-green-600' : trendAnalysis.trend < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {trendAnalysis.trend > 0 ? '+' : ''}{trendAnalysis.trend.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 차트 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 감정 트렌드 라인 차트 */}
              <EmotionChart
                data={emotionHistory}
                type="line"
                title="감정 트렌드"
                timeRange={selectedTimeRange}
                className="h-96"
              />

              {/* 감정 분포 도넛 차트 */}
              <EmotionChart
                data={emotionHistory}
                type="doughnut"
                title="감정 분포"
                className="h-96"
              />
            </div>

            {/* 감정 분포 상세 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                감정별 상세 분석
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {emotionDistribution.slice(0, 6).map(({ emotion, count, percentage }) => (
                  <div key={emotion} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{EMOTION_EMOJIS[emotion]}</span>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {emotion}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {count}회
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: EMOTION_COLORS[emotion],
                        }}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 감정 캘린더 */}
            <EmotionCalendar
              data={emotionHistory}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />

            {/* 인사이트 카드 */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI 인사이트</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">감정 패턴</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    {emotionDistribution.length > 0 && (
                      <li>가장 자주 느끼는 감정: {EMOTION_EMOJIS[emotionDistribution[0].emotion]} {emotionDistribution[0].emotion}</li>
                    )}
                    {timeAnalysis.happyHour && (
                      <li>가장 긍정적인 시간대: {timeAnalysis.happyHour}시</li>
                    )}
                    {statistics && (
                      <li>평균 단어 수: {statistics.averageWordsPerEntry}개</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">추천사항</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>• 긍정적인 감정이 많을 때의 패턴을 분석해보세요</li>
                    <li>• 규칙적인 일기 작성으로 감정 인식력을 높여보세요</li>
                    <li>• 부정적인 감정의 원인을 파악해 개선점을 찾아보세요</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;