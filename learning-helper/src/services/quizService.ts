import { TextDocument } from '@/types';
import { storageService } from './storageService';

/**
 * 퀴즈 문제 인터페이스
 * 객관식, O/X, 빈칸 채우기 등 다양한 유형의 문제를 지원합니다.
 */
export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  source: string; // 문서 ID
}

/**
 * 퀴즈 생성 옵션 인터페이스
 */
export interface QuizOptions {
  count: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionTypes: ('multiple-choice' | 'true-false' | 'fill-blank')[];
}

/**
 * 퀴즈 생성 및 관리 서비스
 * 한국어 텍스트 패턴을 분석하여 자동으로 퀴즈 문제를 생성합니다.
 */
export class QuizService {
  
  /**
   * 한국어 텍스트를 분석하여 퀴즈 문제들을 자동 생성합니다.
   * 정의, 특징, 인과관계 등의 패턴을 인식하여 객관식과 O/X 문제를 만듭니다.
   * @param {string} text - 분석할 한국어 텍스트
   * @param {number} count - 생성할 문제 개수
   * @returns {QuizQuestion[]} 생성된 퀴즈 문제 배열
   */
  generateKoreanQuiz(text: string, count: number): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const sentences = text.split(/[.!?。]/).filter(s => s.trim().length > 20);
    
    // 패턴 기반 문제 생성
    const patterns = [
      {
        // 기능/역할 패턴 (우선 처리): "A는 B 역할을 수행한다" 
        pattern: /(.{2,20})(?:는|은|이|가)\s*(.{5,40})\s*(역할|기능|업무|임무|책임)\s*(을|를)\s*(수행|담당|처리|관리)(?:한다|합니다|하고 있다)/g,
        type: 'multiple-choice' as const,
        generate: (match: RegExpMatchArray, sentence: string) => {
          console.log('🎯 기능/역할 패턴 매치:', match);
          console.log('🎯 전체 문장:', sentence);
          const subject = match[1].trim();
          const function_desc = match[2].trim();
          const function_type = match[3].trim();
          const verb = match[5].trim();
          console.log('🎯 추출 - 주체:', subject, '기능:', function_desc, '타입:', function_type, '동사:', verb);
          
          const fullFunction = `${function_desc} ${function_type}을 ${verb}한다`;
          const cleanFunction = this.cleanAnswerText(fullFunction);
          
          return {
            question: `${subject}의 ${function_type}으로 올바른 것은?`,
            correctAnswer: cleanFunction,
            category: '기능',
            distractor: this.generateDistractors(cleanFunction, text)
          };
        }
      },
      {
        // 정의 패턴: "A는 B이다" (개선된 버전 - 완전한 문장 종결어미 확보)
        pattern: /(.{2,20})(?:는|은|이|가)\s*(.{15,150}(?:한다|된다|있다|없다|이다|다|입니다))/g,
        type: 'multiple-choice' as const,
        generate: (match: RegExpMatchArray, sentence: string) => {
          console.log('🎯 정의 패턴 매치:', match);
          console.log('🎯 전체 문장:', sentence);
          const subject = match[1].trim();
          const definition = match[2].trim();
          console.log('🎯 추출된 정의:', definition);
          
          // 이미 완전한 문장이므로 최소한의 정리만
          const cleanDefinition = this.cleanAnswerText(definition);
          
          return {
            question: `다음 중 ${subject}에 대한 올바른 설명은?`,
            correctAnswer: cleanDefinition,
            category: '정의',
            distractor: this.generateDistractors(cleanDefinition, text)
          };
        }
      },
      {
        // 특징 패턴: "A의 특징은 B이다" (개선된 버전 - 완전한 문장 종결어미 확보)
        pattern: /(.{2,20})의\s*(?:특징|성질|속성)(?:은|는|이|가)?\s*(.{15,120}(?:한다|된다|있다|없다|이다|다|입니다))/g,
        type: 'multiple-choice' as const,
        generate: (match: RegExpMatchArray, sentence: string) => {
          console.log('🎯 특징 패턴 매치:', match);
          console.log('🎯 전체 문장:', sentence);
          const subject = match[1].trim();
          const feature = match[2].trim();
          console.log('🎯 추출된 특징:', feature);
          
          const cleanFeature = this.cleanAnswerText(feature);
          
          return {
            question: `${subject}의 특징으로 옳은 것은?`,
            correctAnswer: cleanFeature,
            category: '특징',
            distractor: this.generateDistractors(cleanFeature, text)
          };
        }
      },
      {
        // 인과관계 패턴: "A 때문에 B이다" (개선된 버전)
        pattern: /(.{3,30})\s*때문에\s*(.{15,120}(?:한다|된다|있다|없다|이다|다|입니다))/g,
        type: 'multiple-choice' as const,
        generate: (match: RegExpMatchArray, sentence: string) => {
          console.log('🎯 인과관계 패턴 매치:', match);
          console.log('🎯 전체 문장:', sentence);
          const cause = match[1].trim();
          const effect = match[2].trim();
          console.log('🎯 추출 - 원인:', cause, '결과:', effect);
          
          const cleanCause = this.cleanAnswerText(cause);
          
          return {
            question: `${effect}인 이유는 무엇인가요?`,
            correctAnswer: cleanCause,
            category: '인과관계',
            distractor: this.generateDistractors(cleanCause, text)
          };
        }
      },
      {
        // 방법 패턴: "A를 위해 B를 한다" (개선된 버전)
        pattern: /(.{3,30})을?\s*위해(?:서는|서)?\s*(.{15,120}(?:해야 한다|해야만 한다|하면 된다|한다|해야 합니다|합니다))/g,
        type: 'multiple-choice' as const,
        generate: (match: RegExpMatchArray, sentence: string) => {
          console.log('🎯 방법 패턴 매치:', match);
          console.log('🎯 전체 문장:', sentence);
          const purpose = match[1].trim();
          const method = match[2].trim();
          console.log('🎯 추출 - 목적:', purpose, '방법:', method);
          
          const cleanMethod = this.cleanAnswerText(method);
          
          return {
            question: `${purpose}을 위한 방법으로 옳은 것은?`,
            correctAnswer: cleanMethod,
            category: '방법',
            distractor: this.generateDistractors(cleanMethod, text)
          };
        }
      },
      {
        // 용어 정의 패턴: "A란 B이다" (개선된 버전)
        pattern: /(.{2,20})(?:란|라는 것은|이란)\s*(.{15,120}(?:한다|된다|있다|없다|이다|다|입니다))/g,
        type: 'multiple-choice' as const,
        generate: (match: RegExpMatchArray, sentence: string) => {
          console.log('🎯 용어 정의 패턴 매치:', match);
          console.log('🎯 전체 문장:', sentence);
          const term = match[1].trim();
          const definition = match[2].trim();
          console.log('🎯 추출 - 용어:', term, '정의:', definition);
          
          const cleanDefinition = this.cleanAnswerText(definition);
          
          return {
            question: `'${term}'의 의미로 가장 적절한 것은?`,
            correctAnswer: cleanDefinition,
            category: '용어',
            distractor: this.generateDistractors(cleanDefinition, text)
          };
        }
      }
    ];

    // O/X 문제용 패턴 (개선된 버전)
    const trueFalsePatterns = [
      {
        // 단정적 서술: "A는 B이다" (완전한 서술만 매칭)
        pattern: /(.{5,40})(?:는|은|이|가)\s*(.{5,70}(?:한다|된다|있다|없다|이다|다|입니다))/g,
        generate: (match: RegExpMatchArray) => {
          console.log('🎯 O/X 패턴 매치:', match);
          const subject = match[1].trim();
          const predicate = match[2].trim();
          console.log('🎯 O/X 추출 - 주어:', subject, '서술:', predicate);
          
          const cleanSubject = this.cleanAnswerText(subject);
          const cleanPredicate = this.cleanAnswerText(predicate);
          
          return {
            question: `${cleanSubject}는 ${cleanPredicate}. 이 문장이 옳습니까?`,
            correctAnswer: true,
            category: '사실확인'
          };
        }
      }
    ];

    // 객관식 문제 생성
    sentences.forEach(sentence => {
      if (questions.length >= count) return;
      
      const trimmed = sentence.trim();
      
      for (const patternObj of patterns) {
        const matches = [...trimmed.matchAll(patternObj.pattern)];
        
        for (const match of matches) {
          if (questions.length >= Math.floor(count * 0.8)) break; // 80%는 객관식
          
          try {
            const questionData = patternObj.generate(match, trimmed);
            
            if (questionData.question.length > 10 && questionData.correctAnswer.length > 3) {
              // 선택지 생성 (정답 + 오답 3개)
              const distractors = questionData.distractor || this.generateDistractors(questionData.correctAnswer as string, text);
              const allOptions = [questionData.correctAnswer, ...distractors.slice(0, 3)];
              
              // 선택지 섞기
              const shuffledOptions = this.shuffleArray([...allOptions]);
              const correctIndex = shuffledOptions.indexOf(questionData.correctAnswer);
              
              questions.push({
                id: `quiz_${Date.now()}_${questions.length}`,
                type: patternObj.type,
                question: questionData.question,
                options: shuffledOptions,
                correctAnswer: correctIndex,
                explanation: `원문: "${trimmed}"`,
                difficulty: this.calculateDifficulty(questionData.question, questionData.correctAnswer as string),
                category: questionData.category,
                source: 'document'
              });
              
              break; // 한 문장당 하나의 문제만
            }
          } catch (error) {
            console.warn('문제 생성 중 오류:', error);
          }
        }
        
        if (questions.length >= Math.floor(count * 0.8)) break;
      }
    });

    // O/X 문제 생성 (나머지 20%)
    const remainingCount = count - questions.length;
    if (remainingCount > 0) {
      sentences.forEach(sentence => {
        if (questions.length >= count) return;
        
        const trimmed = sentence.trim();
        
        for (const patternObj of trueFalsePatterns) {
          const matches = [...trimmed.matchAll(patternObj.pattern)];
          
          for (const match of matches) {
            if (questions.length >= count) break;
            
            try {
              const questionData = patternObj.generate(match);
              
              if (questionData.question.length > 15) {
                questions.push({
                  id: `quiz_${Date.now()}_${questions.length}`,
                  type: 'true-false',
                  question: questionData.question,
                  options: ['맞다', '틀리다'],
                  correctAnswer: questionData.correctAnswer ? 0 : 1,
                  explanation: `원문: "${trimmed}"`,
                  difficulty: 'easy',
                  category: questionData.category,
                  source: 'document'
                });
                
                break;
              }
            } catch (error) {
              console.warn('O/X 문제 생성 중 오류:', error);
            }
          }
          
          if (questions.length >= count) break;
        }
      });
    }

    return questions.slice(0, count);
  }

  /**
   * 정답과 유사한 오답 선택지를 생성합니다.
   * 전체 텍스트에서 비슷한 길이의 구문들을 추출하여 사용합니다.
   * @private
   * @param {string} correctAnswer - 정답
   * @param {string} fullText - 전체 텍스트
   * @returns {string[]} 오답 선택지 배열 (3개)
   */
  private generateDistractors(correctAnswer: string, fullText: string): string[] {
    const distractors: string[] = [];
    
    // 텍스트에서 비슷한 길이의 구문들 추출
    const sentences = fullText.split(/[.!?。]/).filter(s => s.trim().length > 10);
    const phrases: string[] = [];
    
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      
      // 완전한 구문들을 추출 (단어 경계를 고려)
      // 1. 문장 자체가 적당한 길이면 그대로 사용
      if (trimmed.length >= 10 && trimmed.length <= 50) {
        phrases.push(trimmed);
      }
      
      // 2. 긴 문장은 의미있는 단위로 분할
      if (trimmed.length > 50) {
        // 쉼표, 조사, 접속사 등으로 자연스럽게 분할
        const parts = trimmed.split(/[,，、]|\s(?:그리고|또한|하지만|그러나|따라서|그래서|즉|예를 들어)\s/).filter(part => {
          const clean = part.trim();
          return clean.length >= 8 && clean.length <= 60;
        });
        phrases.push(...parts.map(p => p.trim()));
      }
      
      // 3. 명사구, 형용사구 등 의미 단위 추출 (완전한 구문만)
      const meaningfulPhrases = trimmed.match(/[가-힣0-9\s]{8,35}(?:한다|된다|있다|없다|이다|다|하는|되는|인|등|것|점|면|때)/g) || [];
      phrases.push(...meaningfulPhrases.map(p => p.trim()).filter(p => p.length >= 8));
    });
    
    // 정답과 다른 구문들을 오답으로 사용 (중복 제거 및 필터링)
    const uniquePhrases = [...new Set(phrases)]
      .filter(phrase => {
        const clean = phrase.trim();
        return clean !== correctAnswer && 
               clean.length >= Math.max(8, correctAnswer.length * 0.4) &&
               clean.length <= Math.max(80, correctAnswer.length * 2.5) &&
               !clean.includes('undefined') &&
               clean.length > 0;
      })
      .sort(() => Math.random() - 0.5); // 랜덤 정렬
    
    // 랜덤하게 선택
    for (let i = 0; i < 3 && i < uniquePhrases.length; i++) {
      const distractor = uniquePhrases[i];
      if (distractor && !distractors.includes(distractor)) {
        distractors.push(distractor);
      }
    }
    
    // 부족한 경우 일반적인 오답 추가
    while (distractors.length < 3) {
      const genericDistractors = [
        '위의 설명이 모두 맞다',
        '위의 설명이 모두 틀리다', 
        '해당 내용이 문서에 명시되지 않았다',
        '정확한 정보를 확인할 수 없다',
        '문서에서 찾을 수 없는 내용이다',
        '위 보기 중 정답이 없다'
      ];
      
      const notUsed = genericDistractors.filter(d => !distractors.includes(d));
      if (notUsed.length > 0) {
        distractors.push(notUsed[0]);
      } else {
        break;
      }
    }
    
    return distractors;
  }

  /**
   * 답변 텍스트를 정리하고 완전한 문장 형태로 보정합니다.
   * 불필요한 문자 제거, 공백 정리, 불완전한 어미 보정 등을 수행합니다.
   * @private
   * @param {string} text - 정리할 텍스트
   * @returns {string} 정리된 텍스트
   */
  private cleanAnswerText(text: string): string {
    console.log('🔧 cleanAnswerText 호출됨 - 입력:', text);
    let cleaned = text.trim();
    console.log('🔧 trim 후:', cleaned);
    
    // 불필요한 문자 제거
    cleaned = cleaned.replace(/[^\w가-힣\s.,!?()[\]{}'":-]/g, '');
    console.log('🔧 불필요한 문자 제거 후:', cleaned);
    
    // 연속된 공백 정규화
    cleaned = cleaned.replace(/\s+/g, ' ');
    console.log('🔧 공백 정규화 후:', cleaned);
    
    // 불완전한 조사나 어미로 끝나는 경우 완전한 문장으로 보완
    if (cleaned.match(/\s+(을|를|이|가|는|은|의|에|에서|으로|로|와|과)\s*$/)) {
      console.log('🔧 조사로 끝나는 패턴 감지');
      // 조사로만 끝나는 경우 해당 조사 제거
      cleaned = cleaned.replace(/\s+(을|를|이|가|는|은|의|에|에서|으로|로|와|과)\s*$/, '');
      console.log('🔧 조사 제거 후:', cleaned);
    } else if (cleaned.match(/\s+(하|한|할)\s*$/)) {
      console.log('🔧 "하/한/할"로 끝나는 패턴 감지');
      // "한", "하", "할"로 끝나는 경우 "한다"로 완성
      cleaned = cleaned.replace(/\s+(하|한|할)\s*$/, '한다');
      console.log('🔧 "한다"로 완성 후:', cleaned);
    } else if (cleaned.match(/\s+(수행|진행|실행|처리|관리)\s+(하|한)\s*$/)) {
      console.log('🔧 "수행/진행 한" 패턴 감지');
      // "수행 한", "진행 한" 등의 패턴을 "수행한다"로 완성
      cleaned = cleaned.replace(/\s+(수행|진행|실행|처리|관리)\s+(하|한)\s*$/, '$1한다');
      console.log('🔧 "수행한다"로 완성 후:', cleaned);
    } else if (cleaned.match(/\s+(역할|기능|업무|작업)\s*(을|를)\s+(수행|진행|실행)\s+(하|한)\s*$/)) {
      console.log('🔧 "역할을 수행 한" 패턴 감지!');
      // "역할을 수행 한" 패턴을 "역할을 수행한다"로 완성
      cleaned = cleaned.replace(/\s+(역할|기능|업무|작업)\s*(을|를)\s+(수행|진행|실행)\s+(하|한)\s*$/, '$1$2 $3한다');
      console.log('🔧 "역할을 수행한다"로 완성 후:', cleaned);
    } else {
      console.log('🔧 매칭되는 불완전 패턴 없음');
    }
    
    // 너무 긴 텍스트는 의미있는 단위로 자르기 (개선된 로직)
    if (cleaned.length > 70) {
      // 완전한 구문에서 자르기 위한 패턴들
      const completeBreakPoints = [
        /(.{30,65}(?:이다|다|입니다|한다|된다|있다|없다))\s*[,.]?\s*/,
        /(.{30,65}(?:것|점|면|때|경우|상황|조건))\s*[,.]?\s*/,
        /(.{30,65}(?:하고|하며|하거나|그리고|또한|따라서))\s*/,
        /(.{30,65})\s*[,.]\s*/
      ];
      
      for (const pattern of completeBreakPoints) {
        const match = cleaned.match(pattern);
        if (match && match[1]) {
          cleaned = match[1].trim();
          break;
        }
      }
      
      // 여전히 길면 70자에서 완전한 단어로 자르기
      if (cleaned.length > 70) {
        cleaned = cleaned.substring(0, 70);
        // 한국어 조사나 어미에서 자연스럽게 끝나도록
        const koreanEndings = ['다', '요', '음', '기', '것', '데', '데', '면', '때', '게', '지', '니', '고'];
        let found = false;
        
        for (const ending of koreanEndings) {
          const lastIndex = cleaned.lastIndexOf(ending);
          if (lastIndex > 50 && lastIndex < cleaned.length - 2) {
            cleaned = cleaned.substring(0, lastIndex + ending.length);
            found = true;
            break;
          }
        }
        
        // 적절한 끝맺음을 찾지 못했으면 마지막 공백에서 자르기
        if (!found) {
          const lastSpace = cleaned.lastIndexOf(' ');
          if (lastSpace > 50) {
            cleaned = cleaned.substring(0, lastSpace);
          }
        }
        
        cleaned = cleaned.trim();
      }
    }
    
    // 문장 끝 정리 (더 포괄적)
    cleaned = cleaned.replace(/[,\s.]+$/, ''); // 끝의 쉼표, 공백, 마침표 제거
    console.log('🔧 문장 끝 정리 후:', cleaned);
    cleaned = cleaned.replace(/\s+(을|를|이|가|는|은|의|에|으로|로|와|과)$/, ''); // 조사로 끝나면 제거
    console.log('🔧 조사 제거 후:', cleaned);
    
    console.log('🔧 cleanAnswerText 최종 결과:', cleaned);
    return cleaned;
  }

  /**
   * 배열의 요소들을 무작위로 섮습니다.
   * @private
   * @template T
   * @param {T[]} array - 섮을 배열
   * @returns {T[]} 섮인 배열
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 문제와 답변의 길이를 기반으로 난이도를 계산합니다.
   * @private
   * @param {string} question - 문제 텍스트
   * @param {string} answer - 답변 텍스트
   * @returns {'easy' | 'medium' | 'hard'} 계산된 난이도
   */
  private calculateDifficulty(question: string, answer: string): 'easy' | 'medium' | 'hard' {
    const questionLength = question.length;
    const answerLength = answer.length;
    const complexity = questionLength + answerLength;
    
    if (complexity < 30) return 'easy';
    if (complexity < 60) return 'medium';
    return 'hard';
  }

  /**
   * 문서로부터 퀴즈 문제들을 생성합니다.
   * @param {TextDocument} document - 분석할 문서
   * @param {QuizOptions} options - 퀴즈 생성 옵션
   * @returns {Promise<QuizQuestion[]>} 생성된 퀴즈 문제 배열
   */
  async generateQuizFromDocument(
    document: TextDocument,
    options: QuizOptions
  ): Promise<QuizQuestion[]> {
    try {
      console.log('퀴즈 생성 시작:', { documentId: document.id, options });
      
      const questions = this.generateKoreanQuiz(document.content, options.count);
      
      // source 필드에 문서 ID 설정
      questions.forEach(q => {
        q.source = document.id;
      });
      
      console.log('퀴즈 생성 완료:', questions.length, '개 문제');
      return questions;
      
    } catch (error) {
      console.error('퀴즈 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 퀴즈 결과를 localStorage에 저장합니다.
   * @param {string} quizId - 퀴즈 ID
   * @param {QuizQuestion[]} questions - 문제 배열
   * @param {(number | string)[]} answers - 사용자 답변 배열
   * @param {number} score - 점수
   * @returns {Promise<void>}
   */
  async saveQuizResult(quizId: string, questions: QuizQuestion[], answers: (number | string)[], score: number): Promise<void> {
    const result = {
      id: `result_${Date.now()}`,
      quizId,
      questions,
      answers,
      score,
      completedAt: new Date(),
      totalQuestions: questions.length,
      correctAnswers: Math.round(score * questions.length / 100)
    };

    // 퀴즈 결과를 localStorage에 저장 (임시)
    const existingResults = JSON.parse(localStorage.getItem('quiz-results') || '[]');
    existingResults.push(result);
    localStorage.setItem('quiz-results', JSON.stringify(existingResults));
    
    console.log('퀴즈 결과 저장 완료:', result);
  }

  /**
   * 저장된 퀴즈 결과를 모두 조회합니다.
   * @returns {Promise<any[]>} 저장된 퀴즈 결과 배열
   */
  async getQuizResults(): Promise<any[]> {
    return JSON.parse(localStorage.getItem('quiz-results') || '[]');
  }

  /**
   * 지정된 문서로부터 퀴즈 세션을 생성하고 저장합니다.
   * @param {string} documentId - 문서 ID
   * @param {QuizOptions} options - 퀴즈 생성 옵션
   * @returns {Promise<{sessionId: string, questions: QuizQuestion[]}>} 세션 ID와 생성된 문제들
   */
  async createQuizSession(documentId: string, options: QuizOptions): Promise<{
    sessionId: string;
    questions: QuizQuestion[];
  }> {
    // 문서 조회
    const documents = await storageService.getAllDocuments();
    const document = documents.find(d => d.id === documentId);
    
    if (!document) {
      throw new Error('문서를 찾을 수 없습니다.');
    }

    // 퀴즈 생성
    const questions = await this.generateQuizFromDocument(document, options);
    const sessionId = `session_${Date.now()}`;

    // 세션 저장
    const session = {
      id: sessionId,
      documentId,
      questions,
      createdAt: new Date(),
      status: 'active'
    };

    localStorage.setItem(`quiz-session-${sessionId}`, JSON.stringify(session));
    
    return { sessionId, questions };
  }
}

export const quizService = new QuizService();