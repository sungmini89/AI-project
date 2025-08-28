
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { storageService } from '../services/storageService';

/**
 * 메인 대시보드 컴포넌트
 * 학습 현황을 종합적으로 보여주는 화면입니다.
 * 문서, 플래시카드, 퀴즈 통계와 복습 예정 정보를 표시합니다.
 * @returns {JSX.Element} 대시보드 컴포넌트
 */
export default function Dashboard() {
  const [stats, setStats] = useState({
    documentsCount: 0,
    flashcardsCount: 0,
    quizQuestionsCount: 0,
    dueFlashcardsCount: 0,
    recentSessionsCount: 0,
    weeklyFlashcardsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [documents, flashcards, quizQuestions, dueFlashcards, recentSessions] = await Promise.all([
          storageService.getAllDocuments(),
          storageService.getAllFlashcards(),
          storageService.getQuizQuestions(),
          storageService.getDueFlashcards(),
          storageService.getRecentStudySessions(10)
        ]);

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // 이번 주 복습 예정 플래시카드 계산
        const weeklyFlashcards = flashcards.filter(card => {
          const nextReview = new Date(card.nextReview);
          return nextReview >= weekAgo && nextReview <= now;
        });

        setStats({
          documentsCount: documents.length,
          flashcardsCount: flashcards.length,
          quizQuestionsCount: quizQuestions.length,
          dueFlashcardsCount: dueFlashcards.length,
          recentSessionsCount: recentSessions.length,
          weeklyFlashcardsCount: weeklyFlashcards.length
        });
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">학습 대시보드</h1>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">대시보드 로딩 중...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 오늘의 학습 현황 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">오늘의 학습</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">생성된 학습 자료</p>
                <Progress 
                  value={(stats.flashcardsCount + stats.quizQuestionsCount) > 0 ? 100 : 0} 
                  className="mb-2" 
                />
                <p className="text-sm">플래시카드 {stats.flashcardsCount}개</p>
                <p className="text-sm">퀴즈 문제 {stats.quizQuestionsCount}개</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">학습 세션</p>
                <p className="text-2xl font-bold text-blue-600">{stats.recentSessionsCount}개</p>
              </div>
            </div>
          </Card>

          {/* 복습 예정 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">복습 예정</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">오늘 복습</span>
                <span className="text-lg font-bold text-orange-600">{stats.dueFlashcardsCount}개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">이번 주</span>
                <span className="text-lg font-bold">{stats.weeklyFlashcardsCount}개</span>
              </div>
              <Link to="/flashcards">
                <Button variant="outline" className="w-full mt-4" disabled={stats.flashcardsCount === 0}>
                  {stats.flashcardsCount === 0 ? "플래시카드를 먼저 생성하세요" : "복습 시작하기"}
                </Button>
              </Link>
            </div>
          </Card>

          {/* 최근 성과 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">학습 현황</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">총 문서</span>
                <span className="text-lg font-bold text-green-600">{stats.documentsCount}개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">생성된 카드</span>
                <span className="text-lg font-bold">{stats.flashcardsCount}개</span>
              </div>
              <Link to="/quiz">
                <Button variant="outline" className="w-full mt-4" disabled={stats.documentsCount === 0}>
                  {stats.documentsCount === 0 ? "문서를 먼저 업로드하세요" : "새 퀴즈 시작"}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* 학습 자료 현황 */}
      {!loading && (
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">학습 자료 현황</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.documentsCount}</p>
              <p className="text-sm text-gray-600">업로드된 문서</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.flashcardsCount}</p>
              <p className="text-sm text-gray-600">플래시카드</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.quizQuestionsCount}</p>
              <p className="text-sm text-gray-600">퀴즈 문제</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.recentSessionsCount}</p>
              <p className="text-sm text-gray-600">완료한 학습 세션</p>
            </div>
          </div>
          
          {stats.documentsCount === 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <p className="text-blue-800 font-medium mb-2">학습을 시작해보세요!</p>
                <p className="text-blue-600 text-sm mb-4">
                  PDF나 텍스트 파일을 업로드하면 자동으로 플래시카드와 퀴즈가 생성됩니다.
                </p>
                <Link to="/upload">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    첫 문서 업로드하기
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}