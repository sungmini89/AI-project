import { freeAIService } from './freeAIService';
import { Flashcard } from '@/types';

// 기존 코드와의 호환성을 위한 래퍼 클래스
class AIService {
  constructor() {
    // freeAIService를 사용하므로 별도 초기화 불필요
  }

  // freeAIService를 사용한 플래시카드 생성
  async generateFlashcards(text: string, count: number = 5): Promise<Flashcard[]> {
    return await freeAIService.generateFlashcards(text, count);
  }

  // 설정 업데이트 (freeAIService로 위임)
  updateConfig(newConfig: any): void {
    freeAIService.updateConfig(newConfig);
  }

  // 현재 설정 반환 (freeAIService로 위임)
  getConfig(): any {
    return freeAIService.getConfig();
  }

  // 사용량 정보 반환
  getUsageInfo(): any {
    return freeAIService.getUsageInfo();
  }

  // 텍스트 요약 (freeAIService로 위임)
  async summarizeText(
    text: string,
    options?: {
      length?: 'short' | 'medium' | 'long';
      style?: 'bullet' | 'paragraph' | 'key-points';
    }
  ): Promise<string> {
    return await freeAIService.summarizeText(text, options);
  }

  // 키워드 추출 (freeAIService로 위임)
  async extractKeywords(text: string, count: number = 10): Promise<string[]> {
    return await freeAIService.extractKeywords(text, count);
  }

  // 퀴즈 생성 (freeAIService로 위임)
  async generateQuiz(
    text: string,
    count: number = 5,
    type: 'multiple-choice' | 'true-false' | 'mixed' = 'mixed'
  ): Promise<any[]> {
    return await freeAIService.generateQuiz(text, count, type);
  }
}

export const aiService = new AIService();