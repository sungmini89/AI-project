import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Zap, 
  Brain, 
  Target, 
  Settings, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { TextDocument, Flashcard } from '@/types';
import { flashcardService } from '@/services/flashcardService';
import { advancedFlashcardService, FlashcardGenerationOptions, FlashcardType } from '@/services/advancedFlashcardService';

/**
 * 플래시카드 생성 컴포넌트의 props 인터페이스
 */
interface FlashcardGeneratorProps {
  document: TextDocument;
  onCardsGenerated: (_cards: Flashcard[]) => void;
  onError: (_error: string) => void;
}

/**
 * 플래시카드 생성기 컴포넌트
 * 업로드된 문서로부터 다양한 설정으로 플래시카드를 생성할 수 있습니다.
 * 기본 생성과 고급 생성 모드를 지원하며, 난이도와 카드 유형을 설정할 수 있습니다.
 * @param {FlashcardGeneratorProps} props - 컴포넌트 props
 * @returns {JSX.Element} 플래시카드 생성기 컴포넌트
 */
export function FlashcardGenerator({ document, onCardsGenerated, onError }: FlashcardGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // 생성 설정
  const [options, setOptions] = useState<FlashcardGenerationOptions>({
    types: ['definition', 'fill-blank', 'true-false'],
    difficulty: 'medium',
    count: 10,
    focus: 'concept',
    language: 'ko',
    includeDifficulty: true,
    includeHints: true
  });
  
  const [useAdvanced, setUseAdvanced] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      setStep('플래시카드 생성 준비 중...');

      // Step 1: 텍스트 분석
      setProgress(20);
      setStep('문서 내용 분석 중...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: 패턴 추출
      setProgress(40);
      setStep('한국어 패턴 인식 중...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: 카드 생성
      setProgress(60);
      setStep('플래시카드 생성 중...');
      
      let cards: Flashcard[];
      
      if (useAdvanced) {
        // 고급 플래시카드 생성
        const enhancedCards = await advancedFlashcardService.generateAdvancedFlashcards(
          document.content, 
          options
        );
        cards = enhancedCards.map(card => ({
          id: card.id,
          front: card.front,
          back: card.back,
          difficulty: card.difficulty,
          interval: card.interval,
          repetitions: card.repetitions,
          efactor: card.efactor,
          nextReview: card.nextReview,
          created: card.created,
          lastReviewed: card.lastReviewed,
          tags: [...card.tags, card.type]
        }));
      } else {
        // 기본 플래시카드 생성
        cards = await flashcardService.generateFlashcardsFromDocument(document, {
          count: options.count,
          difficulty: options.difficulty,
          cardTypes: options.types.filter(type => ['application', 'definition', 'concept', 'example'].includes(type)) as ('application' | 'definition' | 'concept' | 'example')[],
          useAI: false
        });
      }
      
      if (cards.length === 0) {
        throw new Error('플래시카드를 생성할 수 없습니다. 텍스트가 너무 짧거나 적절한 패턴을 찾을 수 없습니다.');
      }

      // Step 4: 저장 및 완료
      setProgress(80);
      setStep('저장 중...');
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(100);
      setStep('완료!');

      // 결과 전달
      onCardsGenerated(cards);

      // 상태 초기화
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setStep('');
      }, 1000);

    } catch (error) {
      console.error('플래시카드 생성 오류:', error);
      onError(error instanceof Error ? error.message : '플래시카드 생성 중 오류가 발생했습니다.');
      setIsGenerating(false);
      setProgress(0);
      setStep('');
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움 (기본 개념)';
      case 'medium': return '보통 (중요 내용)';
      case 'hard': return '어려움 (심화 학습)';
      case 'mixed': return '혼합 (다양한 난이도)';
      default: return difficulty;
    }
  };

  const getCardTypeLabel = (type: string) => {
    switch (type) {
      case 'definition': return '정의/개념';
      case 'fill-blank': return '빈칸 채우기';
      case 'true-false': return '참/거짓';
      case 'multiple-choice': return '객관식';
      case 'concept-map': return '개념 연결';
      case 'example': return '예시/사례';
      case 'comparison': return '비교 대조';
      case 'cause-effect': return '원인-결과';
      case 'sequence': return '순서 배열';
      case 'application': return '실제 적용';
      default: return type;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          플래시카드 생성기
        </CardTitle>
        <CardDescription>
          문서: <strong>{document.title}</strong> ({document.content.length}자)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {isGenerating ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="font-medium">{step}</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-gray-500 mt-2">{progress}% 완료</p>
            </div>
          </div>
        ) : (
          <>
            {/* 기본 설정 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">생성 설정</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  {showSettings ? '간단히' : '자세히'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">카드 개수</label>
                  <Input
                    type="number"
                    min="5"
                    max="50"
                    value={options.count}
                    onChange={(e) => setOptions(prev => ({ ...prev, count: parseInt(e.target.value) || 10 }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">생성 방식</label>
                  <select
                    value={useAdvanced ? 'advanced' : 'basic'}
                    onChange={(e) => setUseAdvanced(e.target.value === 'advanced')}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    <option value="basic">기본 생성 (빠름)</option>
                    <option value="advanced">고급 생성 (고품질)</option>
                  </select>
                </div>
              </div>

              {showSettings && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">난이도 설정</label>
                    <select
                      value={options.difficulty}
                      onChange={(e) => setOptions(prev => ({ 
                        ...prev, 
                        difficulty: e.target.value as any 
                      }))}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      <option value="easy">쉬움</option>
                      <option value="medium">보통</option>
                      <option value="hard">어려움</option>
                      <option value="mixed">혼합</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {getDifficultyLabel(options.difficulty)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">카드 유형</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['definition', 'fill-blank', 'true-false', 'multiple-choice'] as FlashcardType[]).map(type => (
                        <label key={type} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={options.types.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setOptions(prev => ({
                                  ...prev,
                                  types: [...prev.types, type]
                                }));
                              } else {
                                setOptions(prev => ({
                                  ...prev,
                                  types: prev.types.filter(t => t !== type)
                                }));
                              }
                            }}
                          />
                          <span>{getCardTypeLabel(type)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {useAdvanced && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">학습 초점</label>
                        <select
                          value={options.focus}
                          onChange={(e) => setOptions(prev => ({ 
                            ...prev, 
                            focus: e.target.value as any 
                          }))}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                        >
                          <option value="vocabulary">어휘 중심</option>
                          <option value="concept">개념 이해</option>
                          <option value="application">실제 적용</option>
                          <option value="mixed">종합</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={options.includeHints || false}
                            onChange={(e) => setOptions(prev => ({ 
                              ...prev, 
                              includeHints: e.target.checked 
                            }))}
                          />
                          <span>힌트 포함</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={options.includeDifficulty || false}
                            onChange={(e) => setOptions(prev => ({ 
                              ...prev, 
                              includeDifficulty: e.target.checked 
                            }))}
                          />
                          <span>난이도 계산</span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 정보 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
                <div className="text-sm text-container">
                <div className="font-medium text-blue-900 text-wrap-safe">스마트 패턴 인식</div>
                <div className="text-blue-600 text-wrap-safe">한국어 최적화</div>
                </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="text-sm text-container">
                <div className="font-medium text-green-900 text-wrap-safe">SM-2 알고리즘</div>
                <div className="text-green-600 text-wrap-safe">간격 반복 학습</div>
                </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <div className="text-sm text-container">
                <div className="font-medium text-purple-900 text-wrap-safe">오프라인 지원</div>
                <div className="text-purple-600 text-wrap-safe">언제나 이용 가능</div>
                </div>
              </div>
            </div>

            {/* 고급 생성 시 정보 */}
            {useAdvanced && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-container">
                  <div className="font-medium text-blue-900 text-wrap-safe">고급 생성 모드</div>
                  <div className="text-blue-700 mt-1 explanation-text">
                    • 다양한 카드 유형 생성 (빈칸채우기, 참/거짓 등)<br/>
                    • 힌트와 설명 포함<br/>
                    • AI 설정에 따라 API 사용량 소모 가능
                  </div>
                </div>
              </div>
            )}

            {/* 생성 버튼 */}
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || options.types.length === 0}
              className="w-full"
              size="lg"
              variant="outline"
            >
              <Brain className="h-4 w-4 mr-2" />
              플래시카드 {options.count}개 생성하기
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}