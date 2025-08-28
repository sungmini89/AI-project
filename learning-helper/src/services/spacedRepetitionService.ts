/**
 * Spaced Repetition Service
 * SM-2 알고리즘을 기반으로 한 간격 반복 학습 시스템
 * 
 * SM-2 알고리즘 참고:
 * - https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 * - Anki, SuperMemo 등의 앱에서 사용되는 표준 알고리즘
 */

import { Flashcard, StudySession } from '@/types';

export interface SM2Result {
  interval: number;    // 다음 복습까지의 간격 (일 단위)
  repetitions: number; // 반복 횟수
  efactor: number;     // 용이성 인수 (Easiness Factor)
  nextReview: Date;    // 다음 복습 날짜
}

export interface ReviewResult {
  cardId: string;
  quality: number;     // 0-5 척도의 답변 품질
  responseTime: number; // 응답 시간 (초)
  wasCorrect: boolean;
}

export class SpacedRepetitionService {
  /**
   * SM-2 알고리즘 구현
   * @param card 현재 플래시카드
   * @param quality 응답 품질 (0-5)
   *   5: 완벽 - 정답을 쉽게 기억함
   *   4: 정답 - 약간의 망설임 후 정답
   *   3: 정답 - 상당한 어려움 후 정답  
   *   2: 틀림 - 정답이 쉬워 보임
   *   1: 틀림 - 정답이 어려워 보임
   *   0: 완전 틀림 - 기억나지 않음
   */
  calculateNextReview(card: Flashcard, quality: number): SM2Result {
    let { interval, repetitions, efactor } = card;
    
    // 품질 점수가 3 미만이면 처음부터 다시 시작
    if (quality < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      // 품질이 3 이상인 경우 반복 횟수 증가
      repetitions++;
      
      // 간격 계산
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * efactor);
      }
    }
    
    // 용이성 인수 업데이트
    efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // efactor는 최소 1.3 이상이어야 함
    if (efactor < 1.3) {
      efactor = 1.3;
    }
    
    // 다음 복습 날짜 계산
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    
    return {
      interval,
      repetitions,
      efactor,
      nextReview
    };
  }

  /**
   * 플래시카드 복습 결과 업데이트
   */
  updateCardAfterReview(card: Flashcard, quality: number): Flashcard {
    const sm2Result = this.calculateNextReview(card, quality);
    
    return {
      ...card,
      interval: sm2Result.interval,
      repetitions: sm2Result.repetitions,
      efactor: sm2Result.efactor,
      nextReview: sm2Result.nextReview,
      lastReviewed: new Date(),
      difficulty: this.updateDifficulty(card.difficulty, quality)
    };
  }

  /**
   * 카드 난이도 업데이트 (별도 지표)
   */
  private updateDifficulty(currentDifficulty: number, quality: number): number {
    // 난이도는 0-5 척도로 관리
    let newDifficulty = currentDifficulty;
    
    if (quality >= 4) {
      // 쉬운 답변이면 난이도 감소
      newDifficulty = Math.max(0, newDifficulty - 0.2);
    } else if (quality < 3) {
      // 어려운 답변이면 난이도 증가
      newDifficulty = Math.min(5, newDifficulty + 0.3);
    }
    
    return Math.round(newDifficulty * 10) / 10; // 소수점 1자리로 반올림
  }

  /**
   * 오늘 복습해야 할 카드 필터링
   */
  getCardsForReview(cards: Flashcard[], includeNew: boolean = true): Flashcard[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간 정보 제거
    
    return cards.filter(card => {
      const cardReviewDate = new Date(card.nextReview);
      cardReviewDate.setHours(0, 0, 0, 0);
      
      // 복습 예정일이 오늘 이전이거나 오늘인 경우
      const isReviewDue = cardReviewDate <= today;
      
      // 새 카드도 포함할지 결정
      const isNewCard = card.repetitions === 0;
      
      return isReviewDue || (includeNew && isNewCard);
    });
  }

  /**
   * 학습할 카드들을 난이도와 복습 우선순위에 따라 정렬
   */
  sortCardsForStudy(cards: Flashcard[]): Flashcard[] {
    return cards.sort((a, b) => {
      // 1. 복습 예정일이 지난 카드 우선
      const aDaysOverdue = this.getDaysOverdue(a);
      const bDaysOverdue = this.getDaysOverdue(b);
      
      if (aDaysOverdue !== bDaysOverdue) {
        return bDaysOverdue - aDaysOverdue; // 더 늦은 카드 우선
      }
      
      // 2. 난이도가 높은 카드 우선
      if (a.difficulty !== b.difficulty) {
        return b.difficulty - a.difficulty;
      }
      
      // 3. 반복 횟수가 적은 카드 우선 (새 카드)
      if (a.repetitions !== b.repetitions) {
        return a.repetitions - b.repetitions;
      }
      
      // 4. 생성일이 오래된 카드 우선
      return new Date(a.created).getTime() - new Date(b.created).getTime();
    });
  }

  /**
   * 카드가 몇 일 늦었는지 계산
   */
  private getDaysOverdue(card: Flashcard): number {
    const today = new Date();
    const reviewDate = new Date(card.nextReview);
    const diffTime = today.getTime() - reviewDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * 학습 세션 통계 계산
   */
  calculateSessionStats(session: StudySession): {
    accuracy: number;
    averageTime: number;
    cardsLearned: number;
    cardsReviewed: number;
    streak: number;
  } {
    const { correctAnswers, totalAnswers } = session;
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    
    // 세션 지속 시간 계산
    const sessionDuration = session.endTime 
      ? session.endTime.getTime() - session.startTime.getTime()
      : 0;
    const averageTime = totalAnswers > 0 ? sessionDuration / totalAnswers / 1000 : 0; // 초 단위
    
    // 학습한 카드와 복습한 카드 분류
    const cardsLearned = session.cards.filter(card => card.repetitions <= 1).length;
    const cardsReviewed = session.cards.filter(card => card.repetitions > 1).length;
    
    // 연속 정답 계산 (간단한 구현)
    let streak = 0;
    let maxStreak = 0;
    
    // 실제 구현에서는 답변 순서를 기록해야 하지만, 
    // 여기서는 간단히 정답률 기반으로 추정
    if (accuracy >= 80) {
      streak = Math.floor(totalAnswers * 0.8);
      maxStreak = streak;
    }
    
    return {
      accuracy: Math.round(accuracy * 10) / 10,
      averageTime: Math.round(averageTime * 10) / 10,
      cardsLearned,
      cardsReviewed,
      streak: maxStreak
    };
  }

  /**
   * 다음 복습 세션 추천
   */
  getNextStudyRecommendation(cards: Flashcard[]): {
    recommendedTime: Date;
    cardCount: number;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  } {
    const reviewCards = this.getCardsForReview(cards, false);
    const overdueCards = reviewCards.filter(card => this.getDaysOverdue(card) > 0);
    
    let priority: 'high' | 'medium' | 'low' = 'low';
    let reason = '정기 복습';
    
    if (overdueCards.length > 10) {
      priority = 'high';
      reason = `${overdueCards.length}개의 카드 복습이 밀려 있습니다.`;
    } else if (overdueCards.length > 5) {
      priority = 'medium';
      reason = `${overdueCards.length}개의 카드를 복습할 시간입니다.`;
    } else if (reviewCards.length > 0) {
      priority = 'low';
      reason = `${reviewCards.length}개의 카드가 복습 대기 중입니다.`;
    }
    
    // 다음 권장 시간은 가장 빠른 복습 예정일
    const nextCard = cards
      .filter(card => card.nextReview > new Date())
      .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())[0];
    
    const recommendedTime = nextCard ? new Date(nextCard.nextReview) : new Date();
    
    return {
      recommendedTime,
      cardCount: reviewCards.length,
      priority,
      reason
    };
  }

  /**
   * 카드 복습 품질을 응답 시간과 정답 여부로 추정
   */
  estimateQualityFromResponse(
    wasCorrect: boolean, 
    responseTimeSeconds: number,
    cardDifficulty: number
  ): number {
    if (!wasCorrect) {
      // 틀린 경우 0-2 사이의 점수
      return Math.random() < 0.5 ? 0 : (Math.random() < 0.7 ? 1 : 2);
    }
    
    // 맞은 경우 응답 시간과 카드 난이도를 고려
    const baseScore = 3; // 기본 정답 점수
    
    // 응답 시간 보너스/페널티 (5초 기준)
    let timeBonus = 0;
    if (responseTimeSeconds < 3) {
      timeBonus = 2; // 매우 빠른 응답
    } else if (responseTimeSeconds < 5) {
      timeBonus = 1; // 빠른 응답
    } else if (responseTimeSeconds > 15) {
      timeBonus = -1; // 느린 응답
    }
    
    // 카드 난이도 고려
    const difficultyPenalty = cardDifficulty > 3 ? -0.5 : 0;
    
    const finalScore = baseScore + timeBonus + difficultyPenalty;
    
    // 3-5 범위로 제한
    return Math.min(5, Math.max(3, Math.round(finalScore)));
  }

  /**
   * 학습 진도 계산
   */
  calculateProgress(cards: Flashcard[]): {
    totalCards: number;
    newCards: number;
    learningCards: number;
    reviewCards: number;
    masteredCards: number;
    averageInterval: number;
    retentionRate: number;
  } {
    const totalCards = cards.length;
    const newCards = cards.filter(card => card.repetitions === 0).length;
    const learningCards = cards.filter(card => card.repetitions > 0 && card.repetitions < 3).length;
    const reviewCards = cards.filter(card => card.repetitions >= 3 && card.interval < 21).length;
    const masteredCards = cards.filter(card => card.interval >= 21).length;
    
    // 평균 복습 간격
    const intervalsSum = cards.reduce((sum, card) => sum + card.interval, 0);
    const averageInterval = totalCards > 0 ? intervalsSum / totalCards : 0;
    
    // 보존율 추정 (간격이 긴 카드일수록 잘 기억한다고 가정)
    const totalIntervals = cards.reduce((sum, card) => sum + card.interval, 0);
    const maxPossibleInterval = totalCards * 365; // 1년 간격
    const retentionRate = totalCards > 0 ? (totalIntervals / maxPossibleInterval) * 100 : 0;
    
    return {
      totalCards,
      newCards,
      learningCards,
      reviewCards,
      masteredCards,
      averageInterval: Math.round(averageInterval * 10) / 10,
      retentionRate: Math.min(100, Math.round(retentionRate * 10) / 10)
    };
  }
}

export const spacedRepetitionService = new SpacedRepetitionService();