import Sentiment from 'sentiment';

// 감정 분석 서비스 설정 인터페이스
export interface AIServiceConfig {
  mode: 'mock' | 'free' | 'offline' | 'custom';
  apiKey?: string;
  fallbackToOffline: boolean;
}

// 감정 분석 결과 인터페이스
export interface EmotionAnalysisResult {
  score: number; // -5 ~ 5 점수 (매우 부정적 ~ 매우 긍정적)
  comparative: number; // 단어당 평균 점수
  tokens: string[]; // 분석된 토큰들
  words: {
    positive: string[];
    negative: string[];
  };
  primaryEmotion: EmotionType;
  emotionScores: Record<EmotionType, number>;
  confidence: number; // 분석 신뢰도 (0-1)
}

// 감정 타입 정의
export type EmotionType = 'happy' | 'sad' | 'angry' | 'neutral' | 'excited' | 'calm' | 'anxious' | 'proud' | 'disappointed' | 'grateful';

// 이모지 매핑
export const EMOTION_EMOJIS: Record<EmotionType, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  neutral: '😐',
  excited: '🎉',
  calm: '😌',
  anxious: '😰',
  proud: '😤',
  disappointed: '😞',
  grateful: '🙏',
};

// 감정 색상 매핑
export const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: '#fbbf24',
  sad: '#60a5fa', 
  angry: '#f87171',
  neutral: '#6b7280',
  excited: '#fb7185',
  calm: '#10b981',
  anxious: '#a78bfa',
  proud: '#34d399',
  disappointed: '#94a3b8',
  grateful: '#fde047',
};

// 한국어 감정 키워드 사전
const KOREAN_EMOTION_KEYWORDS: Record<EmotionType, string[]> = {
  happy: ['행복', '기쁨', '즐거움', '신남', '좋음', '만족', '웃음', '활기', '유쾌', '상쾌', '기분좋', '흥미진진', '설렘', '뿌듯', '감사', '고마움'],
  sad: ['슬픔', '우울', '외로움', '실망', '허탈', '아쉬움', '그리움', '애타', '눈물', '울적', '침울', '쓸쓸', '서글픔', '비참'],
  angry: ['화남', '짜증', '분노', '열받', '빡침', '악', '미움', '원망', '성질', '격분', '억울', '분통', '불쾌'],
  neutral: ['그냥', '보통', '평범', '무난', '그저', '평상시', '일반적', '적당', '그럭저럭', '평이'],
  excited: ['신남', '흥분', '들뜸', '설렘', '기대', '두근거림', '활기', '펄떡', '부산', '야호'],
  calm: ['차분', '평온', '고요', '안정', '여유', '평화', '조용', '편안', '느긋', '한가', '마음편'],
  anxious: ['불안', '걱정', '초조', '조급', '긴장', '스트레스', '두려움', '염려', '근심', '답답'],
  proud: ['자랑스', '뿌듯', '자부심', '성취', '성공', '대견', '훌륭', '멋짐', '자신감'],
  disappointed: ['실망', '아쉬움', '허탈', '낙담', '절망', '실패', '좌절', '무너짐', '김빠짐'],
  grateful: ['감사', '고마움', '고맙', '감동', '은혜', '신세', '고마워', '감사해', '고맙다']
};

// Sentiment.js 인스턴스 생성
const sentiment = new Sentiment();

// 한국어 특수 단어 추가 (Sentiment.js 확장)
const KOREAN_AFINN: Record<string, number> = {
  // 긍정적 단어들
  '행복': 3,
  '기쁨': 3,
  '즐거움': 2,
  '좋음': 2,
  '만족': 2,
  '웃음': 2,
  '감사': 2,
  '고마움': 2,
  '성공': 3,
  '뿌듯': 2,
  '자랑스': 2,
  '평온': 1,
  '차분': 1,
  '편안': 2,

  // 부정적 단어들
  '슬픔': -3,
  '우울': -3,
  '외로움': -2,
  '실망': -2,
  '화남': -3,
  '짜증': -2,
  '분노': -3,
  '불안': -2,
  '걱정': -2,
  '스트레스': -2,
  '아픔': -2,
  '힘듦': -2,
  '피곤': -1,
  '실패': -2,
  '좌절': -2,

  // 중성적 단어들
  '그냥': 0,
  '보통': 0,
  '평범': 0,
  '일반': 0,
};

class EmotionAnalysisService {
  private config: AIServiceConfig;
  private usageStats = {
    daily: 0,
    monthly: 0,
    lastReset: new Date().toDateString(),
  };

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.loadUsageStats();
    this.extendSentiment();
  }

  // Sentiment.js에 한국어 단어 추가
  private extendSentiment() {
    sentiment.registerLanguage('ko', KOREAN_AFINN);
  }

  // 사용량 통계 로드
  private loadUsageStats() {
    const stored = localStorage.getItem('ai_diary_usage_stats');
    if (stored) {
      const stats = JSON.parse(stored);
      const today = new Date().toDateString();
      
      // 날짜가 바뀌면 일일 사용량 리셋
      if (stats.lastReset !== today) {
        stats.daily = 0;
        stats.lastReset = today;
      }
      
      this.usageStats = stats;
    }
  }

  // 사용량 통계 저장
  private saveUsageStats() {
    localStorage.setItem('ai_diary_usage_stats', JSON.stringify(this.usageStats));
  }

  // 사용량 증가
  private incrementUsage() {
    this.usageStats.daily++;
    this.usageStats.monthly++;
    this.saveUsageStats();
  }

  // 사용량 한도 확인
  private checkUsageLimit(): boolean {
    const dailyLimit = parseInt(import.meta.env.VITE_DAILY_API_LIMIT || '100');
    const monthlyLimit = parseInt(import.meta.env.VITE_MONTHLY_API_LIMIT || '1000');
    
    return this.usageStats.daily < dailyLimit && this.usageStats.monthly < monthlyLimit;
  }

  // 텍스트에서 한국어 감정 분석
  private analyzeKoreanText(text: string): EmotionAnalysisResult {
    const emotionScores: Record<EmotionType, number> = {
      happy: 0, sad: 0, angry: 0, neutral: 0, excited: 0,
      calm: 0, anxious: 0, proud: 0, disappointed: 0, grateful: 0
    };

    let totalScore = 0;
    let matchedWords = 0;

    // 각 감정별 키워드 매칭
    Object.entries(KOREAN_EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
      const emotionType = emotion as EmotionType;
      keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = text.match(regex);
        if (matches) {
          const count = matches.length;
          emotionScores[emotionType] += count;
          matchedWords += count;
          
          // 감정별 점수 가중치 적용
          switch (emotionType) {
            case 'happy':
            case 'excited':
            case 'grateful':
            case 'proud':
              totalScore += count * 2;
              break;
            case 'sad':
            case 'angry':
            case 'anxious':
            case 'disappointed':
              totalScore -= count * 2;
              break;
            case 'calm':
              totalScore += count * 1;
              break;
            default:
              break;
          }
        }
      });
    });

    // 주요 감정 결정
    const primaryEmotion = Object.entries(emotionScores).reduce((a, b) =>
      emotionScores[a[0] as EmotionType] > emotionScores[b[0] as EmotionType] ? a : b
    )[0] as EmotionType || 'neutral';

    // 신뢰도 계산 (매칭된 감정 단어 수에 기반)
    const confidence = Math.min(matchedWords / 3, 1);

    return {
      score: Math.max(-5, Math.min(5, totalScore)),
      comparative: matchedWords > 0 ? totalScore / text.split(' ').length : 0,
      tokens: text.split(' '),
      words: {
        positive: [],
        negative: [],
      },
      primaryEmotion: emotionScores[primaryEmotion] > 0 ? primaryEmotion : 'neutral',
      emotionScores,
      confidence,
    };
  }

  // 영어 텍스트 감정 분석 (Sentiment.js 사용)
  private analyzeEnglishText(text: string): EmotionAnalysisResult {
    const result = sentiment.analyze(text);
    
    // 감정 점수를 기반으로 주요 감정 결정
    let primaryEmotion: EmotionType = 'neutral';
    
    if (result.score > 2) {
      primaryEmotion = result.comparative > 0.5 ? 'excited' : 'happy';
    } else if (result.score < -2) {
      primaryEmotion = result.comparative < -0.5 ? 'angry' : 'sad';
    } else if (result.score > 0) {
      primaryEmotion = 'happy';
    } else if (result.score < 0) {
      primaryEmotion = 'sad';
    }

    // 감정 점수 분배
    const emotionScores: Record<EmotionType, number> = {
      happy: 0, sad: 0, angry: 0, neutral: 0, excited: 0,
      calm: 0, anxious: 0, proud: 0, disappointed: 0, grateful: 0
    };

    emotionScores[primaryEmotion] = Math.abs(result.score);
    
    return {
      score: Math.max(-5, Math.min(5, result.score)),
      comparative: result.comparative,
      tokens: result.tokens,
      words: result.words,
      primaryEmotion,
      emotionScores,
      confidence: Math.min(Math.abs(result.comparative) * 2, 1),
    };
  }

  // 통합 감정 분석 (한국어 + 영어)
  private analyzeMixedText(text: string): EmotionAnalysisResult {
    const koreanResult = this.analyzeKoreanText(text);
    const englishResult = this.analyzeEnglishText(text);

    // 한국어와 영어 결과 가중 평균
    const koreanWeight = this.getKoreanTextRatio(text);
    const englishWeight = 1 - koreanWeight;

    const combinedScore = Math.round(
      koreanResult.score * koreanWeight + englishResult.score * englishWeight
    );

    const combinedEmotionScores: Record<EmotionType, number> = {
      happy: 0, sad: 0, angry: 0, neutral: 0, excited: 0,
      calm: 0, anxious: 0, proud: 0, disappointed: 0, grateful: 0
    };

    // 감정 점수 통합
    Object.keys(combinedEmotionScores).forEach(emotion => {
      const emotionType = emotion as EmotionType;
      combinedEmotionScores[emotionType] = 
        koreanResult.emotionScores[emotionType] * koreanWeight +
        englishResult.emotionScores[emotionType] * englishWeight;
    });

    // 주요 감정 결정
    const primaryEmotion = Object.entries(combinedEmotionScores).reduce((a, b) =>
      combinedEmotionScores[a[0] as EmotionType] > combinedEmotionScores[b[0] as EmotionType] ? a : b
    )[0] as EmotionType || 'neutral';

    return {
      score: combinedScore,
      comparative: (koreanResult.comparative * koreanWeight + englishResult.comparative * englishWeight),
      tokens: [...koreanResult.tokens, ...englishResult.tokens],
      words: englishResult.words,
      primaryEmotion,
      emotionScores: combinedEmotionScores,
      confidence: Math.max(koreanResult.confidence, englishResult.confidence),
    };
  }

  // 텍스트의 한국어 비율 계산
  private getKoreanTextRatio(text: string): number {
    const koreanChars = text.match(/[가-힣]/g);
    const totalChars = text.replace(/\s/g, '').length;
    return totalChars > 0 ? (koreanChars?.length || 0) / totalChars : 0;
  }

  // 메인 분석 메서드
  public async analyzeEmotion(text: string): Promise<EmotionAnalysisResult> {
    if (!text.trim()) {
      return this.getEmptyResult();
    }

    try {
      switch (this.config.mode) {
        case 'mock':
          return this.getMockResult(text);
        
        case 'offline':
          return this.analyzeMixedText(text);
        
        case 'free':
          if (this.checkUsageLimit()) {
            this.incrementUsage();
            // 여기서 무료 API 호출 (예: HuggingFace)
            return await this.callFreeAPI(text);
          } else if (this.config.fallbackToOffline) {
            return this.analyzeMixedText(text);
          } else {
            throw new Error('API 사용량 한도를 초과했습니다.');
          }
        
        case 'custom':
          if (this.config.apiKey) {
            return await this.callCustomAPI(text, this.config.apiKey);
          } else {
            throw new Error('API 키가 제공되지 않았습니다.');
          }
        
        default:
          return this.analyzeMixedText(text);
      }
    } catch (error) {
      console.error('감정 분석 오류:', error);
      
      if (this.config.fallbackToOffline) {
        return this.analyzeMixedText(text);
      } else {
        throw error;
      }
    }
  }

  // 빈 결과 반환
  private getEmptyResult(): EmotionAnalysisResult {
    return {
      score: 0,
      comparative: 0,
      tokens: [],
      words: { positive: [], negative: [] },
      primaryEmotion: 'neutral',
      emotionScores: {
        happy: 0, sad: 0, angry: 0, neutral: 1, excited: 0,
        calm: 0, anxious: 0, proud: 0, disappointed: 0, grateful: 0
      },
      confidence: 0,
    };
  }

  // 목 데이터 반환 (개발용)
  private getMockResult(text: string): EmotionAnalysisResult {
    const emotions: EmotionType[] = ['happy', 'sad', 'angry', 'excited', 'calm'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    return {
      score: Math.floor(Math.random() * 11) - 5,
      comparative: Math.random() * 2 - 1,
      tokens: text.split(' '),
      words: { positive: ['좋은'], negative: ['나쁜'] },
      primaryEmotion: randomEmotion,
      emotionScores: {
        happy: Math.random(), sad: Math.random(), angry: Math.random(),
        neutral: Math.random(), excited: Math.random(), calm: Math.random(),
        anxious: Math.random(), proud: Math.random(), disappointed: Math.random(),
        grateful: Math.random()
      },
      confidence: Math.random(),
    };
  }

  // 무료 API 호출 (HuggingFace 등)
  private async callFreeAPI(text: string): Promise<EmotionAnalysisResult> {
    // HuggingFace API 호출 구현
    // 현재는 오프라인 분석으로 대체
    return this.analyzeMixedText(text);
  }

  // 커스텀 API 호출
  private async callCustomAPI(text: string, apiKey: string): Promise<EmotionAnalysisResult> {
    // OpenAI, Google Gemini 등 커스텀 API 호출 구현
    // 현재는 오프라인 분석으로 대체
    return this.analyzeMixedText(text);
  }

  // 사용량 통계 조회
  public getUsageStats() {
    return { ...this.usageStats };
  }

  // 설정 업데이트
  public updateConfig(newConfig: Partial<AIServiceConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // 사용량 리셋 (테스트용)
  public resetUsage() {
    this.usageStats = {
      daily: 0,
      monthly: 0,
      lastReset: new Date().toDateString(),
    };
    this.saveUsageStats();
  }
}

// 기본 서비스 인스턴스 생성
const defaultConfig: AIServiceConfig = {
  mode: (import.meta.env.VITE_API_MODE as AIServiceConfig['mode']) || 'offline',
  fallbackToOffline: true,
};

export const emotionAnalysisService = new EmotionAnalysisService(defaultConfig);
export default EmotionAnalysisService;