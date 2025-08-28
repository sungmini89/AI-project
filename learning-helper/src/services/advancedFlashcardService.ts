/**
 * 고급 플래시카드 생성 서비스
 * 다양한 유형의 학습 문제를 생성하고 관리합니다
 */

import { Flashcard } from '@/types';
import { aiService } from './aiService';

export type FlashcardType = 
  | 'definition'     // 정의형 (A는 무엇인가?)
  | 'fill-blank'     // 빈칸 채우기 
  | 'true-false'     // 참/거짓
  | 'multiple-choice' // 객관식
  | 'concept-map'    // 개념 연결
  | 'example'        // 예시 제시
  | 'comparison'     // 비교 대조
  | 'cause-effect'   // 원인-결과
  | 'sequence'       // 순서 배열
  | 'application';   // 실제 적용

export interface FlashcardGenerationOptions {
  types: FlashcardType[];
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  focus: 'vocabulary' | 'concept' | 'application' | 'mixed';
  language: 'ko' | 'en';
  includeDifficulty?: boolean;
  includeHints?: boolean;
}

export interface EnhancedFlashcard extends Flashcard {
  type: FlashcardType;
  hints: string[];
  explanation: string;
  examples: string[];
  relatedConcepts: string[];
  source: string;
}

export class AdvancedFlashcardService {
  /**
   * 고급 플래시카드 생성
   */
  async generateAdvancedFlashcards(
    text: string,
    options: FlashcardGenerationOptions
  ): Promise<EnhancedFlashcard[]> {
    try {
      // AI 서비스를 통한 기본 플래시카드 생성
      const basicCards = await aiService.generateFlashcards(text, options.count);
      
      // 고급 처리 및 타입별 변환
      const enhancedCards: EnhancedFlashcard[] = [];
      
      for (const card of basicCards) {
        const enhancedCard = await this.enhanceFlashcard(card, text, options);
        enhancedCards.push(enhancedCard);
      }
      
      // 추가 타입별 카드 생성
      const additionalCards = await this.generateTypeSpecificCards(text, options);
      enhancedCards.push(...additionalCards);
      
      // 중복 제거 및 최종 정리
      const finalCards = this.removeDuplicatesAndFinalize(enhancedCards, options.count);
      
      return finalCards;
    } catch (error) {
      console.warn('고급 플래시카드 생성 실패, 기본 생성으로 폴백:', error);
      return this.generateBasicEnhancedCards(text, options);
    }
  }

  /**
   * 기본 플래시카드를 고급 플래시카드로 변환
   */
  private async enhanceFlashcard(
    basicCard: Flashcard,
    sourceText: string,
    options: FlashcardGenerationOptions
  ): Promise<EnhancedFlashcard> {
    const cardType = this.determineCardType(basicCard.front, basicCard.back);
    const hints = this.generateHints(basicCard.back, options.includeHints);
    const explanation = await this.generateExplanation(basicCard, sourceText);
    const examples = this.generateExamples(basicCard.back, sourceText);
    const relatedConcepts = this.extractRelatedConcepts(basicCard, sourceText);

    return {
      ...basicCard,
      type: cardType,
      hints,
      explanation,
      examples,
      relatedConcepts,
      source: this.extractSource(sourceText),
      difficulty: this.calculateCardDifficulty(basicCard, options.difficulty),
    };
  }

  /**
   * 카드 타입 결정
   */
  private determineCardType(front: string, _back: string): FlashcardType {
    // 질문 패턴 분석을 통한 타입 결정
    const frontLower = front.toLowerCase();

    if (frontLower.includes('무엇') || frontLower.includes('what')) {
      return 'definition';
    }
    if (frontLower.includes('빈칸') || front.includes('___')) {
      return 'fill-blank';
    }
    if (frontLower.includes('참') || frontLower.includes('거짓') || frontLower.includes('true') || frontLower.includes('false')) {
      return 'true-false';
    }
    if (frontLower.includes('예시') || frontLower.includes('example')) {
      return 'example';
    }
    if (frontLower.includes('비교') || frontLower.includes('차이') || frontLower.includes('compare')) {
      return 'comparison';
    }
    if (frontLower.includes('원인') || frontLower.includes('이유') || frontLower.includes('why') || frontLower.includes('because')) {
      return 'cause-effect';
    }
    if (frontLower.includes('순서') || frontLower.includes('단계') || frontLower.includes('sequence')) {
      return 'sequence';
    }
    if (frontLower.includes('적용') || frontLower.includes('사용') || frontLower.includes('apply')) {
      return 'application';
    }
    if (frontLower.includes('관계') || frontLower.includes('연결') || frontLower.includes('connect')) {
      return 'concept-map';
    }

    // 기본값
    return 'definition';
  }

  /**
   * 힌트 생성
   */
  private generateHints(answer: string, includeHints: boolean = true): string[] {
    if (!includeHints || answer.length < 10) return [];

    const hints: string[] = [];
    const words = answer.split(' ').filter(word => word.length > 2);

    // 첫 글자 힌트
    if (answer.length > 5) {
      const firstChar = answer.charAt(0);
      hints.push(`'${firstChar}'로 시작합니다`);
    }

    // 글자 수 힌트
    if (answer.length > 3) {
      hints.push(`${answer.length}글자입니다`);
    }

    // 키워드 힌트 (주요 단어의 일부만 표시)
    if (words.length > 0) {
      const keyWord = words.find(w => w.length > 3) || words[0];
      if (keyWord && keyWord.length > 2) {
        const partialWord = keyWord.slice(0, Math.ceil(keyWord.length / 2)) + '...';
        hints.push(`키워드: ${partialWord}`);
      }
    }

    return hints.slice(0, 2); // 최대 2개 힌트
  }

  /**
   * 설명 생성
   */
  private async generateExplanation(
    card: Flashcard,
    sourceText: string
  ): Promise<string> {
    try {
      // AI를 통한 상세 설명 생성
      const explanationPrompt = `다음 질문과 답변에 대한 상세한 설명을 1-2문장으로 작성해주세요:
질문: ${card.front}
답변: ${card.back}
맥락: ${sourceText.slice(0, 200)}...`;
      
      const explanation = await aiService.summarizeText(explanationPrompt, { 
        length: 'short', 
        style: 'paragraph' 
      });
      
      return explanation || this.generateBasicExplanation(card);
    } catch (error) {
      return this.generateBasicExplanation(card);
    }
  }

  /**
   * 기본 설명 생성 (폴백)
   */
  private generateBasicExplanation(card: Flashcard): string {
    return `${card.back}에 대한 기본 개념입니다.`;
  }

  /**
   * 예시 생성
   */
  private generateExamples(answer: string, sourceText: string): string[] {
    const examples: string[] = [];
    
    // 소스 텍스트에서 관련 예시 찾기
    const sentences = sourceText.split(/[.!?]/).filter(s => s.trim().length > 20);
    
    for (const sentence of sentences) {
      if (sentence.includes(answer) || this.hasSimilarConcept(sentence, answer)) {
        examples.push(sentence.trim());
        if (examples.length >= 2) break;
      }
    }
    
    // 예시가 부족하면 기본 예시 생성
    if (examples.length === 0) {
      examples.push(`${answer}의 실제 적용 예시입니다.`);
    }
    
    return examples;
  }

  /**
   * 유사 개념 확인
   */
  private hasSimilarConcept(sentence: string, concept: string): boolean {
    // 간단한 유사성 검사 (실제로는 더 정교한 NLP 기법 사용)
    const conceptWords = concept.split(' ').filter(w => w.length > 2);
    const sentenceWords = sentence.split(' ').filter(w => w.length > 2);
    
    const commonWords = conceptWords.filter(word => 
      sentenceWords.some(sentWord => 
        sentWord.includes(word) || word.includes(sentWord)
      )
    );
    
    return commonWords.length >= Math.min(2, conceptWords.length * 0.5);
  }

  /**
   * 관련 개념 추출
   */
  private extractRelatedConcepts(card: Flashcard, sourceText: string): string[] {
    const concepts: string[] = [];
    const cardWords = (card.front + ' ' + card.back).split(' ').filter(w => w.length > 3);
    
    // 텍스트에서 관련 개념 찾기
    const sentences = sourceText.split(/[.!?]/).filter(s => s.trim().length > 15);
    
    for (const sentence of sentences) {
      for (const word of cardWords) {
        if (sentence.includes(word) && !concepts.includes(sentence.trim())) {
          // 중요한 명사나 개념을 추출
          const importantTerms = this.extractImportantTerms(sentence);
          concepts.push(...importantTerms);
        }
      }
    }
    
    return [...new Set(concepts)].slice(0, 3); // 중복 제거, 최대 3개
  }

  /**
   * 중요한 용어 추출
   */
  private extractImportantTerms(sentence: string): string[] {
    // 한국어 명사와 전문용어 패턴 매칭
    const terms: string[] = [];
    
    // 한글 명사 (2-8글자)
    const koreanTerms = sentence.match(/[가-힣]{2,8}/g) || [];
    
    // 영어 전문용어
    const englishTerms = sentence.match(/[A-Z][a-zA-Z]{2,10}/g) || [];
    
    // 복합어 (한글+영어)
    const mixedTerms = sentence.match(/[가-힣]+[A-Za-z]+|[A-Za-z]+[가-힣]+/g) || [];
    
    terms.push(...koreanTerms.slice(0, 2));
    terms.push(...englishTerms.slice(0, 1));
    terms.push(...mixedTerms.slice(0, 1));
    
    return terms.filter(term => term.length >= 2 && term.length <= 15);
  }

  /**
   * 소스 추출 (참고 자료)
   */
  private extractSource(text: string): string {
    // 텍스트의 첫 문장을 소스로 사용
    const firstSentence = text.split(/[.!?]/)[0];
    return firstSentence.slice(0, 50) + (firstSentence.length > 50 ? '...' : '');
  }

  /**
   * 카드 난이도 계산
   */
  private calculateCardDifficulty(
    card: Flashcard,
    targetDifficulty: 'easy' | 'medium' | 'hard'
  ): number {
    let baseDifficulty = 2.5; // 기본 난이도
    
    // 목표 난이도에 따른 조정
    const difficultyMap = {
      easy: 1.5,
      medium: 2.5,
      hard: 4.0
    };
    baseDifficulty = difficultyMap[targetDifficulty];
    
    // 텍스트 복잡도에 따른 조정
    const frontComplexity = this.calculateTextComplexity(card.front);
    const backComplexity = this.calculateTextComplexity(card.back);
    const avgComplexity = (frontComplexity + backComplexity) / 2;
    
    const finalDifficulty = baseDifficulty + (avgComplexity - 0.5) * 2;
    
    return Math.min(5, Math.max(0, Math.round(finalDifficulty * 10) / 10));
  }

  /**
   * 텍스트 복잡도 계산
   */
  private calculateTextComplexity(text: string): number {
    const wordCount = text.split(' ').length;
    const avgWordLength = text.length / wordCount;
    const hasSpecialChars = /[^가-힣a-zA-Z0-9\s]/.test(text);
    const hasNumbers = /\d/.test(text);
    
    let complexity = 0.3; // 기본값
    
    // 단어 수에 따른 복잡도
    if (wordCount > 10) complexity += 0.3;
    else if (wordCount > 5) complexity += 0.1;
    
    // 평균 단어 길이
    if (avgWordLength > 8) complexity += 0.3;
    else if (avgWordLength > 5) complexity += 0.1;
    
    // 특수문자 포함
    if (hasSpecialChars) complexity += 0.2;
    if (hasNumbers) complexity += 0.1;
    
    return Math.min(1, complexity);
  }

  /**
   * 타입별 특화 카드 생성
   */
  private async generateTypeSpecificCards(
    text: string,
    options: FlashcardGenerationOptions
  ): Promise<EnhancedFlashcard[]> {
    const cards: EnhancedFlashcard[] = [];
    
    if (options.types.includes('fill-blank')) {
      const fillBlankCards = await this.generateFillBlankCards(text, 2);
      cards.push(...fillBlankCards);
    }
    
    if (options.types.includes('true-false')) {
      const trueFalseCards = await this.generateTrueFalseCards(text, 2);
      cards.push(...trueFalseCards);
    }
    
    if (options.types.includes('multiple-choice')) {
      const mcCards = await this.generateMultipleChoiceCards(text, 2);
      cards.push(...mcCards);
    }
    
    return cards;
  }

  /**
   * 빈칸 채우기 카드 생성
   */
  private async generateFillBlankCards(text: string, count: number): Promise<EnhancedFlashcard[]> {
    const cards: EnhancedFlashcard[] = [];
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 20);
    
    for (let i = 0; i < Math.min(count, sentences.length); i++) {
      const sentence = sentences[i].trim();
      const words = sentence.split(' ').filter(w => w.length > 3);
      
      if (words.length > 0) {
        const keyWord = words[Math.floor(Math.random() * words.length)];
        const front = sentence.replace(keyWord, '___');
        
        cards.push({
          id: `fill_blank_${Date.now()}_${i}`,
          front: `빈칸에 들어갈 단어는? ${front}`,
          back: keyWord,
          difficulty: 3,
          interval: 1,
          repetitions: 0,
          efactor: 2.5,
          nextReview: new Date(),
          created: new Date(),
          tags: ['fill-blank'],
          type: 'fill-blank',
          hints: this.generateHints(keyWord),
          explanation: `"${keyWord}"는 문맥상 중요한 핵심 단어입니다.`,
          examples: [sentence],
          relatedConcepts: [],
          source: sentence.slice(0, 50) + '...'
        });
      }
    }
    
    return cards;
  }

  /**
   * 참/거짓 카드 생성
   */
  private async generateTrueFalseCards(text: string, count: number): Promise<EnhancedFlashcard[]> {
    const cards: EnhancedFlashcard[] = [];
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 15);
    
    for (let i = 0; i < Math.min(count, sentences.length); i++) {
      const sentence = sentences[i].trim();
      const isTrue = Math.random() > 0.5;
      
      let statement = sentence;
      let answer = 'true';
      
      if (!isTrue) {
        // 문장을 살짝 수정하여 거짓 문장 만들기
        statement = this.createFalseStatement(sentence);
        answer = 'false';
      }
      
      cards.push({
        id: `true_false_${Date.now()}_${i}`,
        front: `다음 문장이 맞으면 O, 틀리면 X를 선택하세요: ${statement}`,
        back: answer === 'true' ? 'O (참)' : 'X (거짓)',
        difficulty: 2,
        interval: 1,
        repetitions: 0,
        efactor: 2.5,
        nextReview: new Date(),
        created: new Date(),
        tags: ['true-false'],
        type: 'true-false',
        hints: [],
        explanation: answer === 'true' ? '원본 텍스트와 일치합니다.' : '원본 텍스트와 다릅니다.',
        examples: [sentence],
        relatedConcepts: [],
        source: sentence.slice(0, 50) + '...'
      });
    }
    
    return cards;
  }

  /**
   * 거짓 문장 생성
   */
  private createFalseStatement(originalSentence: string): string {
    // 간단한 반대말 치환
    const opposites: { [key: string]: string } = {
      '크다': '작다', '작다': '크다',
      '많다': '적다', '적다': '많다', 
      '높다': '낮다', '낮다': '높다',
      '빠르다': '느리다', '느리다': '빠르다',
      '좋다': '나쁘다', '나쁘다': '좋다',
      '증가': '감소', '감소': '증가',
      '상승': '하락', '하락': '상승'
    };
    
    let modifiedSentence = originalSentence;
    
    for (const [original, opposite] of Object.entries(opposites)) {
      if (modifiedSentence.includes(original)) {
        modifiedSentence = modifiedSentence.replace(original, opposite);
        break;
      }
    }
    
    // 변경되지 않았다면 숫자를 바꿔보기
    if (modifiedSentence === originalSentence) {
      modifiedSentence = modifiedSentence.replace(/\d+/g, (match) => {
        const num = parseInt(match);
        return (num + Math.floor(Math.random() * 10) + 1).toString();
      });
    }
    
    return modifiedSentence;
  }

  /**
   * 객관식 카드 생성
   */
  private async generateMultipleChoiceCards(text: string, count: number): Promise<EnhancedFlashcard[]> {
    const cards: EnhancedFlashcard[] = [];
    
    try {
      // AI를 통한 객관식 문제 생성
      const quiz = await aiService.generateQuiz(text, count, 'multiple-choice');
      
      quiz.forEach((question, _index) => {
        if (question.type === 'multiple-choice' && question.options) {
          cards.push({
            id: `multiple_choice_${Date.now()}_${_index}`,
            front: question.question,
            back: question.correctAnswer,
            difficulty: 3,
            interval: 1,
            repetitions: 0,
            efactor: 2.5,
            nextReview: new Date(),
            created: new Date(),
            tags: ['multiple-choice'],
            type: 'multiple-choice',
            hints: [`선택지: ${question.options.join(', ')}`],
            explanation: question.explanation || '객관식 문제입니다.',
            examples: [],
            relatedConcepts: [],
            source: text.slice(0, 50) + '...'
          });
        }
      });
    } catch (error) {
      console.warn('객관식 카드 생성 실패:', error);
    }
    
    return cards;
  }

  /**
   * 중복 제거 및 최종 정리
   */
  private removeDuplicatesAndFinalize(
    cards: EnhancedFlashcard[],
    targetCount: number
  ): EnhancedFlashcard[] {
    // 중복 제거 (질문이 매우 유사한 카드들)
    const uniqueCards = cards.filter((card, index) => {
      return !cards.slice(0, index).some(existingCard => 
        this.isSimilarQuestion(card.front, existingCard.front)
      );
    });
    
    // 품질 점수 기반 정렬
    const sortedCards = uniqueCards.sort((a, b) => {
      const aScore = this.calculateCardQualityScore(a);
      const bScore = this.calculateCardQualityScore(b);
      return bScore - aScore;
    });
    
    return sortedCards.slice(0, targetCount);
  }

  /**
   * 유사한 질문 체크
   */
  private isSimilarQuestion(question1: string, question2: string): boolean {
    const q1Words = question1.toLowerCase().split(' ');
    const q2Words = question2.toLowerCase().split(' ');
    
    const commonWords = q1Words.filter(word => q2Words.includes(word));
    const similarity = commonWords.length / Math.max(q1Words.length, q2Words.length);
    
    return similarity > 0.7; // 70% 이상 유사하면 중복으로 간주
  }

  /**
   * 카드 품질 점수 계산
   */
  private calculateCardQualityScore(card: EnhancedFlashcard): number {
    let score = 50; // 기본 점수
    
    // 질문 길이 (너무 짧거나 길면 감점)
    const questionLength = card.front.length;
    if (questionLength >= 20 && questionLength <= 100) score += 20;
    else if (questionLength < 10) score -= 20;
    
    // 답변 길이
    const answerLength = card.back.length;
    if (answerLength >= 5 && answerLength <= 50) score += 15;
    
    // 힌트 존재 여부
    if (card.hints && card.hints.length > 0) score += 10;
    
    // 설명 존재 여부
    if (card.explanation && card.explanation.length > 10) score += 10;
    
    // 예시 존재 여부
    if (card.examples && card.examples.length > 0) score += 5;
    
    return score;
  }

  /**
   * 기본 고급 카드 생성 (폴백)
   */
  private async generateBasicEnhancedCards(
    text: string,
    options: FlashcardGenerationOptions
  ): Promise<EnhancedFlashcard[]> {
    // 기본 AI 서비스로 카드 생성
    const basicCards = await aiService.generateFlashcards(text, options.count);
    
    return basicCards.map((card, _index): EnhancedFlashcard => ({
      ...card,
      type: 'definition',
      hints: [],
      explanation: '기본 설명입니다.',
      examples: [],
      relatedConcepts: [],
      source: text.slice(0, 50) + '...'
    }));
  }
}

export const advancedFlashcardService = new AdvancedFlashcardService();