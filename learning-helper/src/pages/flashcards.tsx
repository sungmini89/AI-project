import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FlashcardViewer } from '../components/FlashcardViewer';
import { storageService } from '../services/storageService';
import { Flashcard } from '../types';

// 플래시카드 학습 페이지
export default function Flashcards() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  // 플래시카드 데이터 로드
  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        const savedFlashcards = await storageService.getAllFlashcards();
        console.log('플래시카드 로드됨:', savedFlashcards.length, '개');
        
        if (savedFlashcards.length > 0) {
          setFlashcards(savedFlashcards);
        } else {
          // 저장된 플래시카드가 없으면 샘플 데이터 사용
          setFlashcards(sampleCards);
        }
      } catch (error) {
        console.error('플래시카드 로드 실패:', error);
        // 오류 시 샘플 데이터 사용
        setFlashcards(sampleCards);
      } finally {
        setLoading(false);
      }
    };

    loadFlashcards();
  }, []);

  // 샘플 플래시카드 데이터
  const sampleCards = [
    {
      id: "1",
      front: "React에서 상태를 관리하는 Hook은 무엇인가요?",
      back: "useState Hook을 사용하여 컴포넌트의 상태를 관리할 수 있습니다.",
      difficulty: 2,
      interval: 1,
      repetitions: 0,
      efactor: 2.5,
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
      created: new Date(),
      tags: ["React", "Hooks"]
    },
    {
      id: "2",
      front: "TypeScript의 주요 장점은 무엇인가요?",
      back: "정적 타입 검사, 더 나은 IDE 지원, 런타임 에러 감소, 코드 자동완성 개선 등이 있습니다.",
      difficulty: 3,
      interval: 3,
      repetitions: 1,
      efactor: 2.5,
      nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      created: new Date(),
      tags: ["TypeScript", "언어특징"]
    }
  ];


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">플래시카드 학습</h1>
        <p className="text-gray-600">
          카드를 확인하고 난이도를 평가하여 효과적인 복습 스케줄을 만들어보세요.
        </p>
      </div>


      {/* 플래시카드 뷰어 */}
      {loading ? (
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">플래시카드 로딩 중...</p>
        </Card>
      ) : flashcards.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">생성된 플래시카드가 없습니다.</p>
          <p className="text-sm text-gray-500">문서를 업로드하여 플래시카드를 생성해보세요!</p>
          <Button 
            onClick={() => window.location.href = '/upload'}
            className="mt-4"
          >
            문서 업로드하러 가기
          </Button>
        </Card>
      ) : (
        <div className="mb-6">
          <FlashcardViewer
            cards={flashcards}
            onComplete={(stats) => {
              console.log('학습 완료:', stats);
              // 완료 처리 로직
            }}
            // onBack={() => {
            //   // 뒤로 가기 처리
            // }}
          />
        </div>
      )}



    </div>
  );
}