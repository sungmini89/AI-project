import { Flashcard, TextDocument } from "@/types";
import { aiService } from "./aiService";
import { storageService } from "./storageService";

export interface FlashcardGenerationOptions {
  count: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  cardTypes: ("definition" | "concept" | "example" | "application")[];
  useAI: boolean;
}

export class FlashcardService {
  // SM-2 알고리즘 구현
  calculateNextReview(
    card: Flashcard,
    quality: number
  ): {
    interval: number;
    repetitions: number;
    efactor: number;
    nextReview: Date;
  } {
    let { interval, repetitions, efactor } = card;

    if (quality >= 3) {
      // 정답인 경우
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * efactor);
      }
      repetitions += 1;
    } else {
      // 오답인 경우
      repetitions = 0;
      interval = 1;
    }

    // EF (Easiness Factor) 업데이트
    efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
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
      nextReview,
    };
  }

  // 한국어 패턴 기반 플래시카드 생성
  generateKoreanFlashcards(text: string, count: number): any[] {
    const cards: any[] = [];
    const sentences = text.split(/[.!?。]/).filter((s) => s.trim().length > 15);

    // 한국어 패턴 정의
    const patterns = [
      {
        pattern: /(.+?)(?:는|은|이|가)\s*(.+?)(?:이다|다|입니다)/g,
        type: "definition",
        generate: (match: RegExpMatchArray) => ({
          front: `${match[1].trim()}에 대해 설명하세요.`,
          back: match[2].trim(),
          category: "정의",
        }),
      },
      {
        pattern:
          /(.+?)의\s*(?:특징|성질|속성)(?:은|는|이|가)?\s*(.+?)(?:이다|다|입니다)/g,
        type: "characteristic",
        generate: (match: RegExpMatchArray) => ({
          front: `${match[1].trim()}의 특징은 무엇인가요?`,
          back: match[2].trim(),
          category: "특징",
        }),
      },
      {
        pattern: /(.+?)\s*때문에\s*(.+?)(?:이다|다|입니다|한다)/g,
        type: "cause-effect",
        generate: (match: RegExpMatchArray) => ({
          front: `${match[2].trim()}인 이유는 무엇인가요?`,
          back: match[1].trim(),
          category: "인과관계",
        }),
      },
      {
        pattern: /(.+?)을?\s*위해(?:서는|서)?\s*(.+?)(?:해야|하면|한다)/g,
        type: "method",
        generate: (match: RegExpMatchArray) => ({
          front: `${match[1].trim()}을 위한 방법은?`,
          back: match[2].trim(),
          category: "방법",
        }),
      },
      {
        pattern: /(.+?)(?:란|라는 것은|이란)\s*(.+?)(?:이다|다|입니다)/g,
        type: "terminology",
        generate: (match: RegExpMatchArray) => ({
          front: `'${match[1].trim()}'의 의미는?`,
          back: match[2].trim(),
          category: "용어",
        }),
      },
    ];

    // 패턴 매칭으로 카드 생성
    sentences.forEach((sentence) => {
      const trimmed = sentence.trim();
      if (cards.length >= count) return;

      for (const patternObj of patterns) {
        patternObj.pattern.lastIndex = 0; // 정규식 초기화
        const match = patternObj.pattern.exec(trimmed);

        if (match && match[1] && match[2]) {
          const card = patternObj.generate(match);
          if (card.front.length > 5 && card.back.length > 5) {
            cards.push({
              ...card,
              type: patternObj.type,
              source: trimmed,
            });
            break; // 한 문장당 하나의 카드만 생성
          }
        }
      }
    });

    // 부족한 카드는 키워드 기반으로 생성
    if (cards.length < count) {
      const remainingCount = count - cards.length;
      const keywordCards = this.generateKeywordCards(text, remainingCount);
      cards.push(...keywordCards);
    }

    return cards.slice(0, count);
  }

  private generateKeywordCards(text: string, count: number): any[] {
    const cards: any[] = [];
    const sentences = text.split(/[.!?。]/).filter((s) => s.trim().length > 20);

    // 중요한 키워드 추출 (3글자 이상의 한국어 단어)
    const keywords = text.match(/[가-힣]{3,}/g) || [];
    const keywordFreq: { [key: string]: number } = {};

    keywords.forEach((keyword) => {
      keywordFreq[keyword] = (keywordFreq[keyword] || 0) + 1;
    });

    // 빈도순으로 정렬
    const sortedKeywords = Object.entries(keywordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count * 2); // 여유분 확보

    // 키워드 기반 카드 생성
    for (const [keyword, freq] of sortedKeywords) {
      if (cards.length >= count) break;

      // 해당 키워드가 포함된 문장 찾기
      const contextSentence = sentences.find((s) => s.includes(keyword));
      if (contextSentence) {
        cards.push({
          front: `'${keyword}'에 대해 설명하세요.`,
          back: contextSentence.trim(),
          category: "키워드",
          type: "keyword",
          source: contextSentence,
          frequency: freq,
        });
      }
    }

    return cards;
  }

  async generateFlashcardsFromDocument(
    document: TextDocument,
    options: FlashcardGenerationOptions
  ): Promise<Flashcard[]> {
    let rawCards: any[] = [];

    try {
      console.log(`문서 "${document.title}"에 대한 플래시카드 생성 시작...`);

      // 기존 플래시카드 확인 및 제거
      const existingCards = await storageService.getFlashcardsByDocument(
        document.id
      );
      if (existingCards.length > 0) {
        console.log(
          `기존 플래시카드 ${existingCards.length}개 발견, 교체 모드로 진행`
        );
        // 기존 플래시카드 삭제
        await storageService.deleteFlashcardsByDocument(document.id);
        console.log("기존 플래시카드 삭제 완료");
      }

      if (options.useAI && aiService) {
        // AI 서비스 사용
        rawCards = await aiService.generateFlashcards(
          document.content,
          options.count
        );
      } else {
        // 오프라인 패턴 기반 생성
        rawCards = this.generateKoreanFlashcards(
          document.content,
          options.count
        );
      }

      // Flashcard 객체로 변환
      const flashcards: Flashcard[] = rawCards.map((card, index) => {
        const now = new Date();
        return {
          id: this.generateCardId(document.id, index),
          front: card.front,
          back: card.back,
          difficulty: this.calculateCardDifficulty(card),
          interval: 1,
          repetitions: 0,
          efactor: 2.5, // SM-2 알고리즘 기본값
          nextReview: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 하루 후
          created: now,
          tags: this.extractTags(card, document),
          // 문서 ID 추가로 문서별 관리 가능
          documentId: document.id,
        };
      });

      // 저장소에 저장
      await storageService.saveFlashcards(flashcards);

      // 문서의 생성된 카드 수 업데이트
      document.processedCards = flashcards.length;
      await storageService.saveDocument(document);

      console.log(
        `문서 "${document.title}"에 대한 플래시카드 ${flashcards.length}개 생성 및 저장 완료`
      );

      return flashcards;
    } catch (error) {
      console.error("플래시카드 생성 실패:", error);
      throw new Error("플래시카드 생성 중 오류가 발생했습니다.");
    }
  }

  private calculateCardDifficulty(card: any): number {
    let difficulty = 1;

    // 텍스트 길이 기반
    const totalLength = card.front.length + card.back.length;
    if (totalLength > 100) difficulty += 1;
    if (totalLength > 200) difficulty += 1;

    // 전문용어 포함 여부
    const technicalTerms =
      /[A-Za-z]{4,}|[가-힣]*이론|[가-힣]*방법|[가-힣]*기술/g;
    const techCount =
      (card.front + card.back).match(technicalTerms)?.length || 0;
    if (techCount > 0) difficulty += 1;
    if (techCount > 2) difficulty += 1;

    return Math.min(difficulty, 5);
  }

  private extractTags(card: any, document: TextDocument): string[] {
    const tags: string[] = [];

    // 문서 제목에서 태그 추출
    if (document.title) {
      tags.push(document.title.split(".")[0]); // 파일명에서 확장자 제거
    }

    // 카드 카테고리 추가
    if (card.category) {
      tags.push(card.category);
    }

    // 카드 타입 추가
    if (card.type) {
      tags.push(card.type);
    }

    // 키워드에서 태그 추출
    if (document.keywords && document.keywords.length > 0) {
      tags.push(...document.keywords.slice(0, 3)); // 상위 3개 키워드만
    }

    return Array.from(new Set(tags)); // 중복 제거
  }

  private generateCardId(documentId: string, index: number): string {
    return `card_${documentId}_${index}_${Date.now()}`;
  }

  // 복습 카드 업데이트
  async updateCardAfterReview(
    cardId: string,
    quality: number
  ): Promise<Flashcard> {
    const cards = await storageService.getAllFlashcards();
    const card = cards.find((c) => c.id === cardId);

    if (!card) {
      throw new Error("카드를 찾을 수 없습니다.");
    }

    // SM-2 알고리즘 적용
    const update = this.calculateNextReview(card, quality);

    const updatedCard: Flashcard = {
      ...card,
      ...update,
      lastReviewed: new Date(),
    };

    await storageService.saveFlashcard(updatedCard);
    return updatedCard;
  }

  // 오늘 복습할 카드 조회
  async getTodaysReviewCards(): Promise<Flashcard[]> {
    const dueCards = await storageService.getDueFlashcards();
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 오늘 끝까지

    return dueCards.filter((card) => new Date(card.nextReview) <= today);
  }

  // 카드 난이도별 분류
  async getCardsByDifficulty(): Promise<{
    easy: Flashcard[];
    medium: Flashcard[];
    hard: Flashcard[];
  }> {
    const allCards = await storageService.getAllFlashcards();

    return {
      easy: allCards.filter((card) => card.difficulty <= 2),
      medium: allCards.filter(
        (card) => card.difficulty >= 3 && card.difficulty <= 4
      ),
      hard: allCards.filter((card) => card.difficulty >= 5),
    };
  }

  // 학습 통계 생성
  async generateStudyStats(): Promise<{
    totalCards: number;
    masteredCards: number;
    reviewsDue: number;
    averageInterval: number;
  }> {
    const allCards = await storageService.getAllFlashcards();
    const reviewCards = await this.getTodaysReviewCards();

    const masteredCards = allCards.filter(
      (card) => card.repetitions >= 3 && card.interval >= 30
    ).length;

    const averageInterval =
      allCards.length > 0
        ? allCards.reduce((sum, card) => sum + card.interval, 0) /
          allCards.length
        : 0;

    return {
      totalCards: allCards.length,
      masteredCards,
      reviewsDue: reviewCards.length,
      averageInterval: Math.round(averageInterval * 10) / 10,
    };
  }
}

export const flashcardService = new FlashcardService();
