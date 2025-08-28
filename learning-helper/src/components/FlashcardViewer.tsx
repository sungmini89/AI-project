import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Star, 
  BarChart3
} from 'lucide-react';
import { Flashcard } from '@/types';
import { flashcardService } from '@/services/flashcardService';
import { useMemoizedCallback } from '@/utils/performance';

interface FlashcardViewerProps {
  cards: Flashcard[];
  onComplete: (_stats: { correct: number; total: number; timeSpent: number }) => void;
  // onBack: () => void;
}

export const FlashcardViewer = memo(function FlashcardViewer({ cards, onComplete }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0,
    startTime: Date.now()
  });
  const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());

  // 현재 카드와 진행률 메모이제이션
  const currentCard = useMemo(() => cards[currentIndex], [cards, currentIndex]);
  const progress = useMemo(() => ((currentIndex + 1) / cards.length) * 100, [currentIndex, cards.length]);

  // 정답률 계산 메모이제이션
  const accuracyRate = useMemo(() => {
    return sessionStats.total > 0 
      ? Math.round((sessionStats.correct / sessionStats.total) * 100)
      : 0;
  }, [sessionStats.correct, sessionStats.total]);

  const toggleCard = useMemoizedCallback(() => {
    setShowBack(prev => !prev);
  }, []);

  const goToNext = useMemoizedCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowBack(false);
    } else {
      // 세션 완료 - 사용자에게 확인 메시지 표시
      const timeSpent = Math.round((Date.now() - sessionStats.startTime) / 1000);
      
      // 완료 콜백 호출
      onComplete({
        correct: sessionStats.correct,
        total: sessionStats.total,
        timeSpent
      });
      
      // 첫 번째 문제로 돌아갈지 확인
      const confirmRestart = confirm('학습을 완료했습니다! 첫 번째 문제로 돌아가시겠습니까?');
      
      if (confirmRestart) {
        // 첫 번째 카드로 돌아가기
        setCurrentIndex(0);
        setShowBack(false);
        setSessionStats({
          correct: 0,
          total: 0,
          startTime: Date.now()
        });
        setReviewedCards(new Set());
      }
    }
  }, [currentIndex, cards.length, sessionStats, onComplete]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowBack(false);
    }
  }, [currentIndex]);

  const handleQualityRating = useCallback(async (quality: number) => {
    try {
      // SM-2 알고리즘으로 카드 업데이트
      await flashcardService.updateCardAfterReview(currentCard.id, quality);
      
      // 세션 통계 업데이트
      if (!reviewedCards.has(currentIndex)) {
        setSessionStats(prev => ({
          ...prev,
          correct: prev.correct + (quality >= 3 ? 1 : 0),
          total: prev.total + 1
        }));
        setReviewedCards(prev => new Set(prev).add(currentIndex));
      }

      // 다음 카드로 이동
      goToNext();
    } catch (error) {
      console.error('카드 업데이트 오류:', error);
      // 에러가 있어도 다음 카드로 진행
      goToNext();
    }
  }, [currentCard, reviewedCards, currentIndex, goToNext]);

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  const getQualityLabel = (quality: number) => {
    switch (quality) {
      case 1: return '전혀 모름';
      case 2: return '어려움';
      case 3: return '보통';
      case 4: return '쉬움';
      case 5: return '매우 쉬움';
      default: return '';
    }
  };

  const getQualityColor = (quality: number) => {
    switch (quality) {
      case 1: return 'bg-red-500 hover:bg-red-600';
      case 2: return 'bg-orange-500 hover:bg-orange-600';
      case 3: return 'bg-yellow-500 hover:bg-yellow-600';
      case 4: return 'bg-green-500 hover:bg-green-600';
      case 5: return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500';
    }
  };

  // 키보드 단축키 설정 - 모든 함수 정의 이후에 배치
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          toggleCard();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          if (showBack) {
            e.preventDefault();
            handleQualityRating(parseInt(e.key));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, showBack, goToNext, goToPrevious, handleQualityRating, toggleCard]);

  return (
    <div className="flashcard-viewer w-full max-w-4xl mx-auto space-y-6">
      {/* 진행률 헤더 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">플래시카드 학습</h2>
              <p className="text-sm text-gray-600">
                {currentIndex + 1} / {cards.length} 카드
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">정답률</div>
              <div className="font-semibold">
                {accuracyRate}%
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* 플래시카드 */}
      <Card className="min-h-[400px]" style={{ minHeight: 'auto', height: 'auto' }}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Star className="h-4 w-4" />
              <span>난이도: {getDifficultyStars(currentCard.difficulty)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <BarChart3 className="h-4 w-4" />
              <span>복습 {currentCard.repetitions}회</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 카드 내용 */}
          <div 
            className="min-h-[250px] p-8 rounded-lg border-2 border-dashed border-gray-200 cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50 flex flex-col justify-start"
            onClick={toggleCard}
            style={{ minHeight: '250px', height: 'auto' }}
          >
            <div className="text-center space-y-6 w-full">
              {!showBack ? (
                <>
                  <div className="text-lg font-medium text-gray-700 mb-4">질문</div>
                  <div className="w-full text-center px-6 py-8 min-h-[150px] flex items-start justify-center">
                    <div 
                      className="text-xl font-medium text-gray-800 leading-relaxed max-w-full"
                      style={{ 
                        wordWrap: 'break-word', 
                        whiteSpace: 'normal', 
                        overflowWrap: 'break-word',
                        display: 'block',
                        width: '100%',
                        minHeight: 'auto',
                        height: 'auto'
                      }}
                    >
                      {currentCard.front}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-500 mt-8">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">클릭하여 답 보기</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-medium text-gray-700 mb-4">답변</div>
                  <div className="w-full text-center px-6 py-8 min-h-[150px] flex items-start justify-center">
                    <div 
                      className="text-xl font-medium text-gray-800 leading-relaxed max-w-full"
                      style={{ 
                        wordWrap: 'break-word', 
                        whiteSpace: 'normal', 
                        overflowWrap: 'break-word',
                        display: 'block',
                        width: '100%',
                        minHeight: 'auto',
                        height: 'auto'
                      }}
                    >
                      {currentCard.back}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-500 mt-8">
                    <EyeOff className="h-4 w-4" />
                    <span className="text-sm">아래에서 난이도를 선택하세요</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 답변 버튼 (답이 표시될 때만) */}
          {showBack && (
            <div className="space-y-4">
              <div className="text-center text-sm text-gray-600 font-medium">
                이 카드의 난이도는 어떠셨나요?
              </div>
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map(quality => (
                  <Button
                    key={quality}
                    onClick={() => handleQualityRating(quality)}
                    className={`${getQualityColor(quality)} text-white h-auto py-4 px-3 min-h-[80px] flex flex-col items-center justify-center`}
                    size="lg"
                  >
                    <div className="text-center space-y-1">
                      <div className="font-bold text-lg">{quality}</div>
                      <div 
                        className="text-sm font-medium leading-tight max-w-full text-center"
                        style={{ 
                          wordWrap: 'break-word', 
                          whiteSpace: 'normal', 
                          overflowWrap: 'break-word' 
                        }}
                      >
                        {getQualityLabel(quality)}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
              <div className="text-xs text-center text-gray-500">
                키보드: 1-5 숫자키 사용 가능
              </div>
            </div>
          )}

          {/* 네비게이션 버튼 */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              이전
            </Button>
            
            <Button 
              variant="outline" 
              onClick={toggleCard}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              {showBack ? '질문 보기' : '답 보기'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={goToNext}
            >
              {currentIndex === cards.length - 1 ? '완료' : '다음'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 키보드 단축키 안내 */}
      <Card className="bg-gray-50">
        <CardContent className="pt-4">
          <div className="text-sm text-gray-600">
            <div className="font-medium mb-2">키보드 단축키:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div><kbd className="bg-white px-2 py-1 rounded">스페이스</kbd> 카드 뒤집기</div>
              <div><kbd className="bg-white px-2 py-1 rounded">←</kbd> 이전 카드</div>
              <div><kbd className="bg-white px-2 py-1 rounded">→</kbd> 다음 카드</div>
              <div><kbd className="bg-white px-2 py-1 rounded">1-5</kbd> 난이도 평가</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});