import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit3, 
  BookOpen, 
  BarChart3, 
  Calendar,
  TrendingUp,
  Heart,
  Brain,
  Clock
} from 'lucide-react';
import EmotionChart from '../components/dashboard/EmotionChart';
import { databaseService, DiaryEntry, EmotionHistory } from '../services/databaseService';
import { EMOTION_EMOJIS, EmotionType } from '../services/emotionAnalysisService';

const HomePage: React.FC = () => {
  const [recentEntries, setRecentEntries] = useState<DiaryEntry[]>([]);
  const [emotionHistory, setEmotionHistory] = useState<EmotionHistory[]>([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    thisWeekEntries: 0,
    averageScore: 0,
    writingStreak: 0,
    mostFrequentEmotion: 'neutral' as EmotionType
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // 최근 일기 5개 조회
      const entries = await databaseService.getEntries(5, 0);
      setRecentEntries(entries);

      // 최근 30일 감정 히스토리 조회
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const emotions = await databaseService.getEmotionHistory(thirtyDaysAgo, new Date());
      setEmotionHistory(emotions);

      // 통계 데이터 조회
      const statistics = await databaseService.getStatistics();
      
      // 이번 주 일기 수 계산
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const thisWeekEntries = await databaseService.getEntries(100, 0, {
        startDate: weekStart
      });

      // 평균 점수 계산
      const totalScore = emotions.reduce((sum, emotion) => sum + emotion.overallScore, 0);
      const averageScore = emotions.length > 0 ? totalScore / emotions.length : 0;

      // 가장 빈번한 감정 계산
      const emotionCounts: Record<EmotionType, number> = {
        happy: 0, sad: 0, angry: 0, neutral: 0, excited: 0,
        calm: 0, anxious: 0, proud: 0, disappointed: 0, grateful: 0
      };

      emotions.forEach(emotion => {
        emotionCounts[emotion.primaryEmotion]++;
      });

      const mostFrequentEmotion = Object.entries(emotionCounts).reduce((a, b) =>
        emotionCounts[a[0] as EmotionType] > emotionCounts[b[0] as EmotionType] ? a : b
      )[0] as EmotionType;

      setStats({
        totalEntries: statistics.totalEntries,
        thisWeekEntries: thisWeekEntries.length,
        averageScore,
        writingStreak: statistics.writingStreak,
        mostFrequentEmotion: emotions.length > 0 ? mostFrequentEmotion : 'neutral'
      });

    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요! 🌅';
    if (hour < 18) return '좋은 오후예요! ☀️';
    return '좋은 저녁이에요! 🌙';
  };

  const getEmotionMessage = (emotion: EmotionType) => {
    const messages = {
      happy: '행복한 하루를 보내고 계시는군요! 😊',
      sad: '조금 우울한 날이군요. 괜찮아요, 이런 날도 있어요. 💙',
      angry: '화나는 일이 있으셨나봐요. 잠시 쉬어가세요. 🤗',
      excited: '설레는 일이 있으신 것 같아요! 🎉',
      calm: '평온한 마음이 느껴져요. 좋은 상태네요! 😌',
      anxious: '불안하신가봐요. 깊게 숨을 쉬어보세요. 🫂',
      proud: '뿌듯한 성취가 있으셨군요! 축하해요! 🎊',
      disappointed: '실망스러운 일이 있으셨나요? 다음엔 더 좋을 거예요. 🌈',
      grateful: '감사한 마음이 가득하시군요! 아름다운 마음이에요. 🙏',
      neutral: '평범한 하루를 보내고 계시는군요. 그것만으로도 충분해요. ☺️'
    };
    return messages[emotion];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {getGreeting()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            오늘의 감정을 기록하고 자신을 더 깊이 이해해보세요
          </p>
        </div>

        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 총 일기 수 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">총 일기</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalEntries}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* 이번 주 일기 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">이번 주</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.thisWeekEntries}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* 평균 감정 점수 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">평균 점수</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.averageScore > 0 ? '+' : ''}{stats.averageScore.toFixed(1)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* 연속 작성일 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">연속 작성</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.writingStreak}일
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽 영역 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 감정 상태 카드 */}
            {emotionHistory.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Brain className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                    최근 감정 상태
                  </h2>
                  <span className="text-3xl">
                    {EMOTION_EMOJIS[stats.mostFrequentEmotion]}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {getEmotionMessage(stats.mostFrequentEmotion)}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>주요 감정: <span className="capitalize font-medium">{stats.mostFrequentEmotion}</span></span>
                  <span>•</span>
                  <span>최근 30일 기준</span>
                </div>
              </div>
            )}

            {/* 감정 트렌드 차트 */}
            {emotionHistory.length > 0 && (
              <EmotionChart
                data={emotionHistory}
                type="line"
                title="감정 트렌드 (최근 30일)"
                timeRange="month"
                className="h-96"
              />
            )}

            {/* 빈 상태 */}
            {emotionHistory.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  첫 번째 일기를 작성해보세요!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  일기를 작성하시면 AI가 감정을 분석하여 인사이트를 제공해드려요
                </p>
                <Link
                  to="/write"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  일기 작성하기
                </Link>
              </div>
            )}
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="space-y-6">
            {/* 빠른 액션 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">빠른 액션</h3>
              <div className="space-y-3">
                <Link
                  to="/write"
                  className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">새 일기 작성</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">오늘의 감정을 기록해보세요</div>
                  </div>
                </Link>

                <Link
                  to="/analytics"
                  className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
                >
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">감정 분석</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">상세한 분석 리포트 보기</div>
                  </div>
                </Link>

                <Link
                  to="/diary"
                  className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
                >
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">일기 목록</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">과거 일기들 둘러보기</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* 최근 일기 */}
            {recentEntries.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">최근 일기</h3>
                  <Link 
                    to="/diary"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    전체 보기
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentEntries.slice(0, 3).map((entry) => (
                    <Link
                      key={entry.id}
                      to={`/write/${entry.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {entry.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {entry.content.substring(0, 100)}...
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="text-lg">
                              {EMOTION_EMOJIS[entry.mood]}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(entry.date).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 오늘의 팁 */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 rounded-xl border border-pink-200 dark:border-pink-800 p-6">
              <div className="flex items-center mb-3">
                <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">오늘의 팁</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                감정을 기록할 때는 구체적인 상황과 함께 작성해보세요. 
                "왜 이런 감정을 느꼈는지" 원인을 찾아보면 더 깊은 자기 이해가 가능해요. 🌟
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;