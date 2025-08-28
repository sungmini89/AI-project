import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { QuizQuestion } from '../services/quizService';

// 퀴즈 시스템 페이지
export default function Quiz() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState(30); // 30초 제한
  const [timerActive, setTimerActive] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // 퀴즈 데이터 로드
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        // localStorage에서 저장된 퀴즈 세션들을 찾기
        const sessionKeys = Object.keys(localStorage).filter(key => key.startsWith('quiz-session-'));
        
        if (sessionKeys.length > 0) {
          // 가장 최근 세션 사용
          const latestSessionKey = sessionKeys.sort().reverse()[0];
          const sessionData = JSON.parse(localStorage.getItem(latestSessionKey) || '{}');
          
          if (sessionData.questions && sessionData.questions.length > 0) {
            console.log('🔍 업로드된 문서의 퀴즈 로드됨:', sessionData.questions.length, '개 문제');
            console.log('🔍 세션 키:', latestSessionKey);
            console.log('🔍 전체 세션 데이터:', sessionData);
            console.log('🔍 퀴즈 선택지 상세 확인:');
            sessionData.questions.forEach((q: any, qIndex: number) => {
              console.log(`📋 문제 ${qIndex + 1}:`, q.question);
              console.log(`📋 문제 소스:`, q.source);
              console.log(`📋 문제 카테고리:`, q.category);
              q.options?.forEach((option: any, optIndex: number) => {
                console.log(`  ✏️ 선택지 ${optIndex + 1}: "${option}" (길이: ${option.length} 글자)`);
                if (option.includes('수행 한') || option.includes('진행 한') || option.includes('실행 한')) {
                  console.log('⚠️ 잘린 텍스트 발견:', option);
                }
              });
              console.log('---');
            });
            setQuestions(sessionData.questions);
          } else {
            // 저장된 퀴즈가 없으면 샘플 데이터 사용
            console.log('저장된 퀴즈가 없어서 샘플 데이터 사용');
            setQuestions(sampleQuestions);
          }
        } else {
          // 저장된 세션이 없으면 샘플 데이터 사용
          console.log('퀴즈 세션이 없어서 샘플 데이터 사용');
          setQuestions(sampleQuestions);
        }
      } catch (error) {
        console.error('퀴즈 로드 실패:', error);
        setQuestions(sampleQuestions);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  // 샘플 퀴즈 문제들
  const sampleQuestions: QuizQuestion[] = [
    {
      id: '1',
      type: 'multiple-choice',
      question: 'React에서 컴포넌트의 상태를 관리하는 Hook은 무엇인가요?',
      options: [
        'useEffect',
        'useState',
        'useContext',
        'useCallback'
      ],
      correctAnswer: 1,
      explanation: 'useState는 React에서 함수형 컴포넌트에 상태를 추가할 수 있게 해주는 Hook입니다.',
      difficulty: 'medium',
      source: 'sample'
    },
    {
      id: '2',
      type: 'multiple-choice',
      question: 'TypeScript에서 타입을 정의할 때 사용하는 키워드는?',
      options: [
        'interface',
        'class',
        'function',
        'const'
      ],
      correctAnswer: 0,
      explanation: 'interface 키워드를 사용하여 객체의 타입을 정의할 수 있습니다.',
      difficulty: 'medium',
      source: 'sample'
    },
    {
      id: '3',
      type: 'true-false',
      question: 'JavaScript는 정적 타입 언어입니다.',
      options: ['참', '거짓'],
      correctAnswer: 1,
      explanation: 'JavaScript는 동적 타입 언어입니다. 변수의 타입이 런타임에 결정됩니다.',
      difficulty: 'easy',
      source: 'sample'
    }
  ];

  // 타이머 효과
  useEffect(() => {
    if (timerActive && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, timerActive, showResult]);

  const handleTimeUp = () => {
    setShowResult(true);
    setTimerActive(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowResult(true);
    setTimerActive(false);
    
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
    setScore(prev => ({ ...prev, total: prev.total + 1 }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
      setTimerActive(true);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRetryQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizComplete(false);
    setScore({ correct: 0, total: 0 });
    setTimeLeft(30);
    setTimerActive(true);
  };

  const handleNewQuiz = async () => {
    try {
      console.log('🗑️ 기존 퀴즈 세션 삭제 중...');
      // 기존 퀴즈 세션 데이터 삭제
      const sessionKeys = Object.keys(localStorage).filter(key => key.startsWith('quiz-session-'));
      console.log('🗑️ 삭제할 세션들:', sessionKeys);
      sessionKeys.forEach(key => {
        console.log('🗑️ 삭제:', key);
        localStorage.removeItem(key);
      });
      
      // 새로운 퀴즈 생성을 위해 문서 업로드 페이지로 이동
      navigate('/upload');
    } catch (error) {
      console.error('퀴즈 데이터 삭제 실패:', error);
      alert('퀴즈 데이터 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (quizComplete) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">🎉 퀴즈 완료!</h1>
          <div className="text-6xl font-bold text-blue-600 mb-4">
            {Math.round((score.correct / score.total) * 100)}%
          </div>
          <p className="text-xl mb-6">
            {score.correct} / {score.total} 문제를 맞혔습니다!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">정답</h3>
              <p className="text-2xl font-bold text-green-600">{score.correct}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800">오답</h3>
              <p className="text-2xl font-bold text-red-600">{score.total - score.correct}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">정답률</h3>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round((score.correct / score.total) * 100)}%
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={handleRetryQuiz} size="lg">
              다시 도전하기
            </Button>
            <Button variant="outline" size="lg" onClick={handleNewQuiz}>
              새로운 퀴즈
            </Button>
            <Button variant="outline" size="lg" onClick={handleGoToDashboard}>
              대시보드로 이동
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 로딩 중이거나 문제가 없는 경우 처리
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">퀴즈 로딩 중...</p>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">생성된 퀴즈가 없습니다.</p>
          <p className="text-sm text-gray-500 mb-4">문서를 업로드하여 퀴즈를 생성해보세요!</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/upload')}>
              문서 업로드하러 가기
            </Button>
            <Button variant="outline" onClick={handleNewQuiz}>
              기존 퀴즈 새로 생성
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div className="quiz-page p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">퀴즈</h1>
            <p className="text-gray-600">시간 내에 문제를 풀고 실력을 확인해보세요.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleNewQuiz}>
              새 퀴즈 생성
            </Button>
          </div>
        </div>
      </div>

      {/* 진행률 및 타이머 */}
      <Card className="p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium">진행률</span>
          <span className="text-sm text-gray-600">
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>
        <Progress value={progress} className="mb-4" />
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">남은 시간:</span>
            <span className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
              {timeLeft}초
            </span>
          </div>
          <div className="text-sm text-gray-600">
            점수: {score.correct} / {score.total}
          </div>
        </div>
      </Card>

      {/* 문제 카드 */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6 card-content-text">
          Q{currentQuestion + 1}. {question.question}
        </h2>

        <div className="space-y-3">
          {question.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
              className={`w-full p-4 border-2 rounded-xl transition-all duration-200 text-left min-h-[80px] flex items-center gap-6 ${
                selectedAnswer === index
                  ? showResult
                    ? index === question.correctAnswer
                      ? 'bg-green-50 border-green-500 text-green-800 shadow-lg'
                      : 'bg-red-50 border-red-500 text-red-800 shadow-lg'
                    : 'bg-blue-50 border-blue-500 text-blue-800 shadow-md'
                  : showResult && index === question.correctAnswer
                    ? 'bg-green-50 border-green-500 text-green-800 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
              }`}
              style={{ height: 'auto', minHeight: '80px', whiteSpace: 'normal' }}
            >
              {/* 선택지 라벨 (A, B, C, D) */}
              <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center flex-shrink-0 text-sm font-bold">
                {String.fromCharCode(65 + index)}
              </div>
              
              {/* 선택지 텍스트 */}
              <div className="flex-1 text-base font-medium leading-6 py-2" style={{ wordWrap: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word' }}>
                {option}
              </div>
            </button>
          ))}
        </div>

        {/* 설명 (결과 표시 후) */}
        {showResult && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-blue-200 border">
            <h4 className="font-semibold text-blue-800 mb-2">설명</h4>
            <p className="text-blue-700 explanation-text">{question.explanation}</p>
          </div>
        )}
      </Card>

      {/* 버튼 영역 */}
      <div className="flex justify-center">
        {!showResult ? (
          <Button 
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            size="lg"
            variant="outline"
            className="px-8"
          >
            답안 제출
          </Button>
        ) : (
          <Button 
            onClick={handleNextQuestion}
            size="lg"
            variant="outline"
            className="px-8"
          >
            {currentQuestion < sampleQuestions.length - 1 ? '다음 문제' : '결과 보기'}
          </Button>
        )}
      </div>

      {/* 키보드 단축키 안내 */}
      <Card className="p-4 mt-6 bg-gray-50">
        <h4 className="font-semibold mb-2">키보드 단축키</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><kbd className="px-2 py-1 bg-white rounded">1-4</kbd> 선택지 선택</p>
          <p><kbd className="px-2 py-1 bg-white rounded">Enter</kbd> 답안 제출 / 다음 문제</p>
          <p><kbd className="px-2 py-1 bg-white rounded">Space</kbd> 일시정지</p>
        </div>
      </Card>
    </div>
  );
}