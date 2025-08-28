/**
 * 무료 AI 서비스 레이어
 * 다양한 AI 제공자와 오프라인 모드를 지원하는 통합 AI 서비스
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIServiceConfig, Flashcard, QuizQuestion } from '@/types';

export type AIMode = 'mock' | 'free' | 'offline' | 'custom';
export type AIProvider = 'gemini' | 'huggingface' | 'offline';

export interface ServiceError {
  type: 'quota_exceeded' | 'api_error' | 'network_error' | 'config_error' | 'parsing_error';
  message: string;
  provider?: AIProvider;
  canRetry: boolean;
  fallbackMode?: AIMode;
}

export interface FreeAIServiceConfig extends AIServiceConfig {
  provider: AIProvider;
  mode: AIMode;
  huggingfaceToken?: string;
  customEndpoint?: string;
  // 할당량 관리
  dailyQuota: number;
  usedQuota: number;
  monthlyQuota: number;
  usedMonthlyQuota: number;
  lastReset: Date;
  lastMonthlyReset: Date;
}

/**
 * API 사용량 추적 및 관리 클래스
 */
class QuotaManager {
  private config: FreeAIServiceConfig;

  constructor(config: FreeAIServiceConfig) {
    this.config = config;
  }

  /**
   * 일일/월간 할당량 체크
   */
  checkQuota(): { canUse: boolean; reason?: string } {
    this.resetIfNeeded();

    if (this.config.usedQuota >= this.config.dailyQuota) {
      return { 
        canUse: false, 
        reason: `일일 할당량 초과 (${this.config.usedQuota}/${this.config.dailyQuota})` 
      };
    }

    if (this.config.usedMonthlyQuota >= this.config.monthlyQuota) {
      return { 
        canUse: false, 
        reason: `월간 할당량 초과 (${this.config.usedMonthlyQuota}/${this.config.monthlyQuota})` 
      };
    }

    return { canUse: true };
  }

  /**
   * 할당량 사용 기록
   */
  incrementUsage(): void {
    this.config.usedQuota++;
    this.config.usedMonthlyQuota++;
  }

  /**
   * 일일/월간 할당량 리셋
   */
  private resetIfNeeded(): void {
    const now = new Date();
    const lastResetDate = new Date(this.config.lastReset);
    const lastMonthlyResetDate = new Date(this.config.lastMonthlyReset);

    // 일일 리셋
    if (now.toDateString() !== lastResetDate.toDateString()) {
      this.config.usedQuota = 0;
      this.config.lastReset = now;
    }

    // 월간 리셋
    if (now.getMonth() !== lastMonthlyResetDate.getMonth() || 
        now.getFullYear() !== lastMonthlyResetDate.getFullYear()) {
      this.config.usedMonthlyQuota = 0;
      this.config.lastMonthlyReset = now;
    }
  }

  getRemainingQuota(): { daily: number; monthly: number } {
    this.resetIfNeeded();
    return {
      daily: Math.max(0, this.config.dailyQuota - this.config.usedQuota),
      monthly: Math.max(0, this.config.monthlyQuota - this.config.usedMonthlyQuota)
    };
  }
}

/**
 * 무료 AI 서비스 메인 클래스
 */
export class FreeAIService {
  private genAI: GoogleGenerativeAI | null = null;
  private config: FreeAIServiceConfig;
  private quotaManager: QuotaManager;
  private readonly STORAGE_KEY = 'freeAIServiceConfig';

  constructor() {
    this.config = this.loadConfig();
    this.quotaManager = new QuotaManager(this.config);
    this.initializeProvider();
  }

  /**
   * 설정 로드
   */
  private loadConfig(): FreeAIServiceConfig {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 날짜 객체 복원
        parsed.lastReset = new Date(parsed.lastReset);
        parsed.lastMonthlyReset = new Date(parsed.lastMonthlyReset);
        return parsed;
      } catch (error) {
        console.warn('설정 로드 실패:', error);
      }
    }

    // 기본 설정
    return {
      provider: 'offline',
      mode: 'offline',
      dailyQuota: 50,
      usedQuota: 0,
      monthlyQuota: 1000,
      usedMonthlyQuota: 0,
      lastReset: new Date(),
      lastMonthlyReset: new Date(),
      apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      huggingfaceToken: import.meta.env.VITE_HUGGINGFACE_TOKEN,
    };
  }

  /**
   * 설정 저장
   */
  private saveConfig(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.warn('설정 저장 실패:', error);
    }
  }

  /**
   * AI 제공자 초기화
   */
  private initializeProvider(): void {
    if (this.config.provider === 'gemini' && this.config.apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(this.config.apiKey);
      } catch (error) {
        console.warn('Gemini 초기화 실패:', error);
        this.fallbackToOffline('Gemini 초기화 실패');
      }
    }
  }

  /**
   * 오프라인 모드로 폴백
   */
  private fallbackToOffline(reason: string): void {
    console.log(`오프라인 모드로 전환: ${reason}`);
    this.config.mode = 'offline';
    this.config.provider = 'offline';
    this.genAI = null;
    this.saveConfig();
  }

  /**
   * 에러 분류 및 복구 전략 결정
   */
  private classifyError(error: any): ServiceError {
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return {
        type: 'quota_exceeded',
        message: '일일/월간 할당량을 초과했습니다.',
        canRetry: false,
        fallbackMode: 'offline'
      };
    }

    if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
      return {
        type: 'network_error',
        message: '네트워크 연결에 문제가 있습니다.',
        canRetry: true,
        fallbackMode: 'offline'
      };
    }

    if (error.message?.includes('API key') || error.status === 401) {
      return {
        type: 'config_error',
        message: 'API 키가 잘못되었거나 만료되었습니다.',
        canRetry: false,
        fallbackMode: 'mock'
      };
    }

    if (error.message?.includes('parse') || error.message?.includes('JSON')) {
      return {
        type: 'parsing_error',
        message: 'AI 응답을 파싱하는데 실패했습니다.',
        canRetry: true,
        fallbackMode: 'offline'
      };
    }

    return {
      type: 'api_error',
      message: `API 호출 중 오류가 발생했습니다: ${error.message}`,
      canRetry: true,
      fallbackMode: 'offline'
    };
  }

  /**
   * 안전한 API 호출 래퍼
   */
  private async safeApiCall<T>(
    operation: () => Promise<T>,
    operationName: string,
    fallback: () => T | Promise<T>
  ): Promise<T> {
    try {
      // 할당량 체크
      const quotaCheck = this.quotaManager.checkQuota();
      if (!quotaCheck.canUse && this.config.mode !== 'offline') {
        console.log(`할당량 초과로 폴백 실행: ${quotaCheck.reason}`);
        return await fallback();
      }

      // API 호출 시도
      const result = await operation();
      this.quotaManager.incrementUsage();
      this.saveConfig();
      return result;
    } catch (error) {
      const serviceError = this.classifyError(error);
      console.warn(`${operationName} 실패:`, serviceError);

      // 폴백 실행
      return await fallback();
    }
  }

  /**
   * 플래시카드 생성
   */
  async generateFlashcards(
    text: string, 
    count: number = 5,
    options: { 
      difficulty?: 'easy' | 'medium' | 'hard';
      focus?: 'definition' | 'concept' | 'application';
    } = {}
  ): Promise<Flashcard[]> {
    // 목 모드
    if (this.config.mode === 'mock') {
      return this.generateMockFlashcards(text, count);
    }

    // 할당량 체크
    const quotaCheck = this.quotaManager.checkQuota();
    if (!quotaCheck.canUse && this.config.mode !== 'offline') {
      console.log(`할당량 초과로 오프라인 모드 사용: ${quotaCheck.reason}`);
      return this.generateOfflineFlashcards(text, count, options);
    }

    // AI 서비스 시도
    if (this.config.mode === 'free' && this.genAI) {
      return await this.safeApiCall(
        () => this.generateWithGemini(text, count, options),
        '플래시카드 생성',
        () => this.generateOfflineFlashcards(text, count, options)
      );
    }

    // 오프라인 모드
    return this.generateOfflineFlashcards(text, count, options);
  }

  /**
   * Gemini를 사용한 플래시카드 생성
   */
  private async generateWithGemini(
    text: string, 
    count: number, 
    options: any
  ): Promise<Flashcard[]> {
    if (!this.genAI) throw new Error('Gemini 미초기화');

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const difficulty = options.difficulty || 'medium';
    const focus = options.focus || 'concept';

    const prompt = `다음 텍스트를 바탕으로 ${count}개의 학습용 플래시카드를 생성해주세요.
    
요구사항:
- 난이도: ${difficulty === 'easy' ? '쉬움' : difficulty === 'medium' ? '보통' : '어려움'}
- 초점: ${focus === 'definition' ? '정의 중심' : focus === 'concept' ? '개념 이해' : '실제 적용'}
- 한국어로 작성
- 질문은 명확하고 구체적으로
- 답변은 정확하고 이해하기 쉽게

텍스트:
${text}

JSON 형식으로만 응답해주세요:
{
  "cards": [
    {
      "front": "질문",
      "back": "답변",
      "difficulty": 1-5
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    try {
      const parsed = JSON.parse(generatedText.replace(/```json\n?|```\n?/g, ''));
      return this.formatFlashcards(parsed.cards || []);
    } catch (parseError) {
      console.warn('JSON 파싱 실패, 오프라인 모드로 폴백:', parseError);
      return this.generateOfflineFlashcards(text, count, options);
    }
  }

  /**
   * 오프라인 플래시카드 생성 (개선된 버전)
   */
  private generateOfflineFlashcards(
    text: string, 
    count: number, 
    options: any = {}
  ): Flashcard[] {
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 15);
    const cards: any[] = [];
    
    // 한국어 패턴 매칭 규칙
    const patterns = [
      { 
        pattern: /(.{2,20})는 (.{5,50})이다/, 
        type: 'definition',
        question: (match: RegExpMatchArray) => `${match[1]}는 무엇인가요?`,
        answer: (match: RegExpMatchArray) => match[2]
      },
      { 
        pattern: /(.{2,20})의 특징은 (.{5,50})이다/, 
        type: 'characteristic',
        question: (match: RegExpMatchArray) => `${match[1]}의 특징을 설명하세요.`,
        answer: (match: RegExpMatchArray) => match[2]
      },
      { 
        pattern: /(.{5,30}) 때문에 (.{5,50})이다/, 
        type: 'cause-effect',
        question: (match: RegExpMatchArray) => `${match[2]}인 이유는 무엇인가요?`,
        answer: (match: RegExpMatchArray) => match[1] + ' 때문입니다'
      },
      { 
        pattern: /(.{5,30})을 위해서는 (.{5,50})해야 한다/, 
        type: 'method',
        question: (match: RegExpMatchArray) => `${match[1]}을 위한 방법은?`,
        answer: (match: RegExpMatchArray) => match[2] + '해야 합니다'
      },
      { 
        pattern: /(.{2,20})는 (.{2,20})와 (.{5,50})다/, 
        type: 'comparison',
        question: (match: RegExpMatchArray) => `${match[1]}와 ${match[2]}의 관계는?`,
        answer: (match: RegExpMatchArray) => match[3] + '습니다'
      }
    ];

    // 패턴 기반 카드 생성
    for (const sentence of sentences.slice(0, count * 2)) {
      if (cards.length >= count) break;
      
      const trimmed = sentence.trim();
      if (trimmed.length < 15) continue;

      let cardGenerated = false;
      
      for (const { pattern, type, question, answer } of patterns) {
        const match = trimmed.match(pattern);
        if (match) {
          cards.push({
            front: question(match),
            back: answer(match),
            difficulty: this.getDifficultyFromOptions(options),
            type: type
          });
          cardGenerated = true;
          break;
        }
      }

      // 패턴 매칭 실패시 일반적인 카드 생성
      if (!cardGenerated && trimmed.length > 25) {
        const words = trimmed.split(' ').filter(w => w.length > 2);
        const keyWord = words.find(w => w.length > 4) || words[0];
        
        if (keyWord) {
          cards.push({
            front: `다음 내용에서 '${keyWord}'에 대해 설명하세요.`,
            back: trimmed,
            difficulty: this.getDifficultyFromOptions(options),
            type: 'general'
          });
        }
      }
    }

    return this.formatFlashcards(cards.slice(0, count));
  }

  /**
   * 목 데이터 생성 (테스트용)
   */
  private generateMockFlashcards(text: string, count: number): Flashcard[] {
    const mockCards = [];
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
    
    for (let i = 0; i < count; i++) {
      // 실제 문장에서 선택하거나 기본 텍스트 사용
      const sampleText = sentences[i % sentences.length] || text;
      const frontText = sampleText.trim().slice(0, 100); // 20글자가 아닌 100글자로 확장
      const backText = sampleText.trim().slice(100, 200) || `이것은 테스트용 답변입니다. ${sampleText.trim().slice(0, 50)}...`;
      
      mockCards.push({
        front: `${frontText}${frontText.length >= 100 ? '...' : ''}에 대해 설명하세요.`,
        back: backText + (backText.length >= 100 ? '...' : ''),
        difficulty: Math.floor(Math.random() * 5) + 1
      });
    }
    return this.formatFlashcards(mockCards);
  }

  /**
   * 플래시카드 표준 형식으로 변환
   */
  private formatFlashcards(cards: any[]): Flashcard[] {
    return cards.map((card, index) => ({
      id: `card_${Date.now()}_${index}`,
      front: card.front || '',
      back: card.back || '',
      difficulty: card.difficulty || 3,
      interval: 1,
      repetitions: 0,
      efactor: 2.5, // SM-2 알고리즘 기본값
      nextReview: new Date(),
      created: new Date(),
      tags: card.type ? [card.type] : []
    }));
  }

  /**
   * 옵션에서 난이도 추출
   */
  private getDifficultyFromOptions(options: any): number {
    const difficultyMap = { easy: 2, medium: 3, hard: 4 };
    return difficultyMap[options.difficulty as keyof typeof difficultyMap] || 3;
  }

  /**
   * 텍스트 요약
   */
  async summarizeText(
    text: string,
    options: {
      length?: 'short' | 'medium' | 'long';
      style?: 'bullet' | 'paragraph' | 'key-points';
    } = {}
  ): Promise<string> {
    // 목 모드
    if (this.config.mode === 'mock') {
      return this.generateMockSummary(text, options);
    }

    // 할당량 체크
    const quotaCheck = this.quotaManager.checkQuota();
    if (!quotaCheck.canUse && this.config.mode !== 'offline') {
      return this.generateOfflineSummary(text, options);
    }

    // AI 서비스 시도
    if (this.config.mode === 'free' && this.genAI) {
      return await this.safeApiCall(
        () => this.summarizeWithGemini(text, options),
        '텍스트 요약',
        () => this.generateOfflineSummary(text, options)
      );
    }

    return this.generateOfflineSummary(text, options);
  }

  /**
   * 키워드 추출
   */
  async extractKeywords(
    text: string,
    count: number = 10
  ): Promise<string[]> {
    // 목 모드
    if (this.config.mode === 'mock') {
      return this.generateMockKeywords(count);
    }

    // 할당량 체크
    const quotaCheck = this.quotaManager.checkQuota();
    if (!quotaCheck.canUse && this.config.mode !== 'offline') {
      return this.extractOfflineKeywords(text, count);
    }

    // AI 서비스 시도
    if (this.config.mode === 'free' && this.genAI) {
      return await this.safeApiCall(
        () => this.extractKeywordsWithGemini(text, count),
        '키워드 추출',
        () => this.extractOfflineKeywords(text, count)
      );
    }

    return this.extractOfflineKeywords(text, count);
  }

  /**
   * 퀴즈 문제 생성
   */
  async generateQuiz(
    text: string, 
    count: number = 5,
    type: 'multiple-choice' | 'true-false' | 'mixed' = 'mixed'
  ): Promise<QuizQuestion[]> {
    // 목 모드
    if (this.config.mode === 'mock') {
      return this.generateMockQuiz(count, type);
    }

    // 할당량 체크
    const quotaCheck = this.quotaManager.checkQuota();
    if (!quotaCheck.canUse && this.config.mode !== 'offline') {
      return this.generateOfflineQuiz(text, count, type);
    }

    // AI 서비스 시도
    if (this.config.mode === 'free' && this.genAI) {
      return await this.safeApiCall(
        () => this.generateQuizWithGemini(text, count, type),
        '퀴즈 생성',
        () => this.generateOfflineQuiz(text, count, type)
      );
    }

    return this.generateOfflineQuiz(text, count, type);
  }

  /**
   * Gemini를 사용한 퀴즈 생성
   */
  private async generateQuizWithGemini(
    text: string, 
    count: number, 
    type: string
  ): Promise<QuizQuestion[]> {
    if (!this.genAI) throw new Error('Gemini 미초기화');

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `다음 텍스트를 바탕으로 ${count}개의 퀴즈 문제를 생성해주세요.
    
문제 유형: ${type === 'multiple-choice' ? '객관식' : type === 'true-false' ? 'O/X' : '혼합'}

텍스트:
${text}

JSON 형식으로만 응답해주세요:
{
  "questions": [
    {
      "type": "multiple-choice",
      "question": "질문",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "correctAnswer": "정답",
      "explanation": "해설",
      "difficulty": 1-5
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    try {
      const parsed = JSON.parse(generatedText.replace(/```json\n?|```\n?/g, ''));
      return this.formatQuizQuestions(parsed.questions || []);
    } catch (parseError) {
      return this.generateOfflineQuiz(text, count, type);
    }
  }

  /**
   * 오프라인 퀴즈 생성
   */
  private generateOfflineQuiz(
    text: string, 
    count: number, 
    type: string
  ): QuizQuestion[] {
    // 간단한 오프라인 퀴즈 생성 로직
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 20);
    const questions: any[] = [];

    for (let i = 0; i < Math.min(count, sentences.length); i++) {
      const sentence = sentences[i].trim();
      const words = sentence.split(' ').filter(w => w.length > 2);
      const keyWord = words[Math.floor(Math.random() * words.length)];

      if (type === 'true-false' || (type === 'mixed' && Math.random() > 0.5)) {
        questions.push({
          type: 'true-false',
          question: sentence,
          correctAnswer: 'true',
          explanation: '제공된 텍스트의 내용입니다.',
          difficulty: 2
        });
      } else {
        const wrongAnswers = ['잘못된 답변 1', '잘못된 답변 2', '잘못된 답변 3'];
        questions.push({
          type: 'multiple-choice',
          question: `다음 중 '${keyWord}'에 대한 올바른 설명은?`,
          options: [sentence, ...wrongAnswers],
          correctAnswer: sentence,
          explanation: '텍스트에서 직접 인용된 내용입니다.',
          difficulty: 3
        });
      }
    }

    return this.formatQuizQuestions(questions);
  }

  /**
   * 목 퀴즈 생성
   */
  private generateMockQuiz(count: number, type: string): QuizQuestion[] {
    const questions = [];
    for (let i = 0; i < count; i++) {
      questions.push({
        type: type === 'mixed' ? (Math.random() > 0.5 ? 'multiple-choice' : 'true-false') : type,
        question: `목 질문 ${i + 1}`,
        options: type !== 'true-false' ? ['답안1', '답안2', '답안3', '답안4'] : undefined,
        correctAnswer: type !== 'true-false' ? '답안1' : 'true',
        explanation: '목 해설입니다.',
        difficulty: Math.floor(Math.random() * 5) + 1
      });
    }
    return this.formatQuizQuestions(questions);
  }

  /**
   * 퀴즈 질문 표준 형식으로 변환
   */
  private formatQuizQuestions(questions: any[]): QuizQuestion[] {
    return questions.map((q, index) => ({
      id: `quiz_${Date.now()}_${index}`,
      type: q.type || 'multiple-choice',
      question: q.question || '',
      options: q.options,
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation,
      difficulty: (q.difficulty || 3) as 1 | 2 | 3 | 4 | 5
    }));
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<FreeAIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    this.initializeProvider();
  }

  /**
   * 현재 설정 반환
   */
  getConfig(): FreeAIServiceConfig {
    return { ...this.config };
  }

  /**
   * 사용량 정보 반환
   */
  getUsageInfo(): {
    daily: { used: number; total: number; remaining: number };
    monthly: { used: number; total: number; remaining: number };
    canUseAI: boolean;
    currentMode: AIMode;
  } {
    const remaining = this.quotaManager.getRemainingQuota();
    const quotaCheck = this.quotaManager.checkQuota();
    
    return {
      daily: {
        used: this.config.usedQuota,
        total: this.config.dailyQuota,
        remaining: remaining.daily
      },
      monthly: {
        used: this.config.usedMonthlyQuota,
        total: this.config.monthlyQuota,
        remaining: remaining.monthly
      },
      canUseAI: quotaCheck.canUse,
      currentMode: this.config.mode
    };
  }

  /**
   * Gemini를 사용한 텍스트 요약
   */
  private async summarizeWithGemini(
    text: string,
    options: any
  ): Promise<string> {
    if (!this.genAI) throw new Error('Gemini 미초기화');

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const length = options.length || 'medium';
    const style = options.style || 'paragraph';

    const lengthInstructions = {
      short: '2-3문장으로 간단히',
      medium: '4-6문장으로 적당히',
      long: '7-10문장으로 자세히'
    };

    const styleInstructions = {
      bullet: '불렛 포인트(• ) 형식으로',
      paragraph: '자연스러운 문단 형태로',
      'key-points': '핵심 포인트를 번호와 함께'
    };

    const prompt = `다음 텍스트를 ${lengthInstructions[length as keyof typeof lengthInstructions]} ${styleInstructions[style as keyof typeof styleInstructions]} 요약해주세요.
    
텍스트:
${text}

요약 지침:
- 핵심 내용만 포함
- 한국어로 작성
- 이해하기 쉽게 작성
- 중요한 정보는 빠뜨리지 않기`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  }

  /**
   * 오프라인 텍스트 요약
   */
  private generateOfflineSummary(
    text: string,
    options: any
  ): string {
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
    const length = options.length || 'medium';
    const style = options.style || 'paragraph';
    
    let summaryCount: number;
    switch (length) {
      case 'short': summaryCount = Math.min(2, sentences.length); break;
      case 'long': summaryCount = Math.min(5, sentences.length); break;
      default: summaryCount = Math.min(3, sentences.length); break;
    }

    // 문장 길이와 키워드 빈도를 기준으로 중요한 문장 선별
    const scoredSentences = sentences.map((sentence, index) => {
      const trimmed = sentence.trim();
      let score = 0;
      
      // 길이 점수 (너무 짧거나 길지 않은 문장 선호)
      const length = trimmed.length;
      if (length > 20 && length < 150) score += 2;
      else if (length >= 150 && length < 250) score += 1;
      
      // 위치 점수 (첫 번째와 마지막 문장에 가중치)
      if (index === 0) score += 2;
      if (index === sentences.length - 1) score += 1;
      
      // 키워드 점수 (중요한 단어 포함 여부)
      const importantWords = ['중요', '핵심', '주요', '특징', '방법', '결과', '원인', '목적', '의미'];
      importantWords.forEach(word => {
        if (trimmed.includes(word)) score += 1;
      });

      return { sentence: trimmed, score, index };
    });

    // 점수순으로 정렬 후 상위 문장 선택
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, summaryCount)
      .sort((a, b) => a.index - b.index) // 원래 순서로 재정렬
      .map(item => item.sentence);

    // 스타일에 따라 포맷팅
    switch (style) {
      case 'bullet':
        return topSentences.map(s => `• ${s}`).join('\n');
      case 'key-points':
        return topSentences.map((s, i) => `${i + 1}. ${s}`).join('\n');
      default:
        return topSentences.join(' ');
    }
  }

  /**
   * 목 요약 생성
   */
  private generateMockSummary(_text: string, options: any): string {
    const length = options.length || 'medium';
    const style = options.style || 'paragraph';
    
    const mockSentences = [
      '이것은 테스트용 요약 문장입니다.',
      '주요 내용을 간략하게 정리했습니다.',
      '핵심 포인트들이 포함되어 있습니다.'
    ];
    
    const count = length === 'short' ? 1 : length === 'long' ? 3 : 2;
    const selectedSentences = mockSentences.slice(0, count);
    
    switch (style) {
      case 'bullet':
        return selectedSentences.map(s => `• ${s}`).join('\n');
      case 'key-points':
        return selectedSentences.map((s, i) => `${i + 1}. ${s}`).join('\n');
      default:
        return selectedSentences.join(' ');
    }
  }

  /**
   * Gemini를 사용한 키워드 추출
   */
  private async extractKeywordsWithGemini(
    text: string,
    count: number
  ): Promise<string[]> {
    if (!this.genAI) throw new Error('Gemini 미초기화');

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `다음 텍스트에서 가장 중요한 키워드 ${count}개를 추출해주세요.

텍스트:
${text}

요구사항:
- 단순한 배열 형태로 응답
- 각 키워드는 1-3단어로 구성
- 중요도 순으로 정렬
- 중복 제거
- 한국어 키워드 우선

예시 형식:
["키워드1", "키워드2", "키워드3"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    try {
      // JSON 파싱 시도
      const cleanedText = generatedText.replace(/```json\n?|```\n?/g, '').trim();
      const keywords = JSON.parse(cleanedText);
      
      if (Array.isArray(keywords)) {
        return keywords.slice(0, count);
      } else {
        // JSON이 배열이 아닌 경우 오프라인 방식으로 폴백
        return this.extractOfflineKeywords(text, count);
      }
    } catch (parseError) {
      console.warn('키워드 JSON 파싱 실패, 텍스트에서 추출 시도:', parseError);
      
      // JSON 파싱 실패시 텍스트에서 키워드 추출 시도
      const lines = generatedText.split('\n');
      const keywords: string[] = [];
      
      for (const line of lines) {
        // 따옴표로 둘러싸인 단어 찾기
        const matches = line.match(/"([^"]+)"/g);
        if (matches) {
          matches.forEach(match => {
            const keyword = match.replace(/"/g, '').trim();
            if (keyword.length > 0 && !keywords.includes(keyword)) {
              keywords.push(keyword);
            }
          });
        }
      }
      
      return keywords.slice(0, count);
    }
  }

  /**
   * 오프라인 키워드 추출
   */
  private extractOfflineKeywords(
    text: string,
    count: number
  ): string[] {
    // 기본적인 키워드 추출 알고리즘
    const words = text
      .toLowerCase()
      .replace(/[^\w가-힣\s]/g, ' ') // 특수문자 제거
      .split(/\s+/)
      .filter(word => 
        word.length >= 2 && // 2글자 이상
        word.length <= 10 && // 10글자 이하
        !this.isStopWord(word) // 불용어 제외
      );

    // 단어 빈도 계산
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // 빈도순으로 정렬하여 키워드 추출
    const sortedWords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .map(([word]) => word)
      .slice(0, count);

    return sortedWords;
  }

  /**
   * 불용어 체크 (간단한 한국어 불용어 리스트)
   */
  private isStopWord(word: string): boolean {
    const stopWords = [
      '이', '그', '저', '것', '들', '수', '있', '없', '하', '되', '된', '할',
      '의', '에', '를', '이', '가', '은', '는', '과', '와', '도', '만', '까지',
      '부터', '으로', '로', '에서', '에게', '께', '한테', '더', '가장', '매우',
      '정말', '아주', '너무', '조금', '많이', '잘', '못', '안', '때문', '위해',
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'
    ];
    
    return stopWords.includes(word.toLowerCase());
  }

  /**
   * 목 키워드 생성
   */
  private generateMockKeywords(count: number): string[] {
    const mockKeywords = [
      '인공지능', '머신러닝', '딥러닝', '알고리즘', '데이터',
      '분석', '학습', '모델', '예측', '패턴', '최적화', '자동화',
      '개발', '프로그래밍', '소프트웨어', '시스템', '네트워크',
      '보안', '클라우드', '빅데이터', '시각화', '처리'
    ];
    
    return mockKeywords
      .sort(() => Math.random() - 0.5) // 랜덤 셔플
      .slice(0, count);
  }

  /**
   * 수동으로 모드 전환
   */
  switchMode(mode: AIMode): void {
    this.config.mode = mode;
    if (mode === 'offline') {
      this.config.provider = 'offline';
      this.genAI = null;
    }
    this.saveConfig();
  }

  /**
   * API 키 테스트
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (this.config.provider === 'offline') {
      return { success: true, message: '오프라인 모드는 항상 사용 가능합니다.' };
    }

    if (this.config.provider === 'gemini' && this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        await model.generateContent('안녕하세요');
        return { success: true, message: 'Gemini API 연결 성공' };
      } catch (error) {
        return { success: false, message: `Gemini API 연결 실패: ${error}` };
      }
    }

    return { success: false, message: '설정된 AI 제공자가 없습니다.' };
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const freeAIService = new FreeAIService();