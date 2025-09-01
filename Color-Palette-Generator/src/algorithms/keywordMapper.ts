/**
 * 한국어 키워드 기반 색상 매핑 시스템
 * 감정, 자연, 계절, 추상적 개념을 색상으로 변환
 */

import type { HSLColor } from '../types/color';

export interface KeywordMapping {
  keyword: string;
  color: HSLColor;
  category: KeywordCategory;
  description: string;
  synonyms: string[];
}

export type KeywordCategory = 'emotion' | 'nature' | 'season' | 'abstract' | 'object' | 'concept';

export class KeywordMapper {
  private keywordColorMap: Record<string, KeywordMapping> = {
    // === 감정 기반 ===
    '평온함': {
      keyword: '평온함',
      color: { h: 200, s: 70, l: 60 },
      category: 'emotion',
      description: '차분하고 안정적인 파란색 계열',
      synonyms: ['평화', '안정', '고요함', '차분함']
    },
    '열정': {
      keyword: '열정',
      color: { h: 0, s: 80, l: 50 },
      category: 'emotion',
      description: '강렬하고 역동적인 빨간색 계열',
      synonyms: ['정열', '열심', '뜨거움', '강렬함']
    },
    '행복': {
      keyword: '행복',
      color: { h: 50, s: 90, l: 60 },
      category: 'emotion',
      description: '밝고 따뜻한 노란색 계열',
      synonyms: ['기쁨', '즐거움', '쾌활함', '밝음']
    },
    '신뢰': {
      keyword: '신뢰',
      color: { h: 220, s: 70, l: 50 },
      category: 'emotion',
      description: '안정적이고 믿음직한 파란색 계열',
      synonyms: ['믿음', '확신', '안전', '든든함']
    },
    '사랑': {
      keyword: '사랑',
      color: { h: 340, s: 80, l: 60 },
      category: 'emotion',
      description: '따뜻하고 애정어린 핑크색 계열',
      synonyms: ['애정', '연인', '로맨스', '따뜻함']
    },
    '우울': {
      keyword: '우울',
      color: { h: 220, s: 30, l: 30 },
      category: 'emotion',
      description: '침울하고 어두운 파란색 계열',
      synonyms: ['슬픔', '암울함', '침체', '어둠']
    },

    // === 자연 기반 ===
    '숲': {
      keyword: '숲',
      color: { h: 120, s: 80, l: 30 },
      category: 'nature',
      description: '깊고 진한 녹색',
      synonyms: ['나무', '자연', '초록', '산림']
    },
    '바다': {
      keyword: '바다',
      color: { h: 200, s: 90, l: 40 },
      category: 'nature',
      description: '깊고 시원한 바다 파랑',
      synonyms: ['해양', '물', '파도', '바닷가']
    },
    '하늘': {
      keyword: '하늘',
      color: { h: 210, s: 70, l: 70 },
      category: 'nature',
      description: '맑고 높은 하늘 파랑',
      synonyms: ['구름', '청공', '창공', '날씨']
    },
    '노을': {
      keyword: '노을',
      color: { h: 15, s: 85, l: 60 },
      category: 'nature',
      description: '따뜻한 석양의 주황색',
      synonyms: ['석양', '일몰', '황혼', '저녁']
    },
    '꽃': {
      keyword: '꽃',
      color: { h: 320, s: 70, l: 70 },
      category: 'nature',
      description: '부드럽고 아름다운 핑크색',
      synonyms: ['꽃잎', '꽃밭', '장미', '벚꽃']
    },
    '잔디': {
      keyword: '잔디',
      color: { h: 100, s: 60, l: 50 },
      category: 'nature',
      description: '싱싱한 연두색',
      synonyms: ['풀', '초원', '들판', '녹지']
    },

    // === 계절 기반 ===
    '봄': {
      keyword: '봄',
      color: { h: 100, s: 60, l: 70 },
      category: 'season',
      description: '신선하고 생동감 있는 연두색',
      synonyms: ['개화', '새싹', '따뜻함', '생동감']
    },
    '여름': {
      keyword: '여름',
      color: { h: 180, s: 80, l: 50 },
      category: 'season',
      description: '시원하고 강렬한 청록색',
      synonyms: ['더위', '바닷가', '시원함', '활기']
    },
    '가을': {
      keyword: '가을',
      color: { h: 30, s: 70, l: 50 },
      category: 'season',
      description: '따뜻한 갈색과 주황의 조화',
      synonyms: ['단풍', '추수', '풍요', '성숙']
    },
    '겨울': {
      keyword: '겨울',
      color: { h: 210, s: 30, l: 80 },
      category: 'season',
      description: '차갑고 깨끗한 연한 파랑',
      synonyms: ['눈', '추위', '고요', '깨끗함']
    },

    // === 추상적 개념 ===
    '에너지': {
      keyword: '에너지',
      color: { h: 45, s: 100, l: 50 },
      category: 'abstract',
      description: '역동적인 주황과 노랑의 조화',
      synonyms: ['활력', '동력', '힘', '생명력']
    },
    '미니멀': {
      keyword: '미니멀',
      color: { h: 0, s: 0, l: 95 },
      category: 'abstract',
      description: '깔끔하고 단순한 거의 흰색',
      synonyms: ['간소함', '단순함', '깔끔함', '정리']
    },
    '럭셔리': {
      keyword: '럭셔리',
      color: { h: 280, s: 60, l: 30 },
      category: 'abstract',
      description: '고급스러운 진한 보라색',
      synonyms: ['고급', '품격', '세련됨', '우아함']
    },
    '모던': {
      keyword: '모던',
      color: { h: 200, s: 20, l: 50 },
      category: 'abstract',
      description: '현대적이고 세련된 회색 파랑',
      synonyms: ['현대적', '세련된', '트렌디', '도시적']
    },
    '빈티지': {
      keyword: '빈티지',
      color: { h: 25, s: 40, l: 60 },
      category: 'abstract',
      description: '따뜻하고 고풍스러운 베이지',
      synonyms: ['고전적', '레트로', '옛날', '클래식']
    },

    // === 사물/개체 ===
    '태양': {
      keyword: '태양',
      color: { h: 45, s: 100, l: 60 },
      category: 'object',
      description: '밝고 강렬한 태양 색상',
      synonyms: ['햇빛', '빛', '광명', '찬란함']
    },
    '달': {
      keyword: '달',
      color: { h: 50, s: 15, l: 85 },
      category: 'object',
      description: '은은하고 부드러운 달빛 색상',
      synonyms: ['달빛', '은빛', '야간', '로맨틱']
    },
    '불': {
      keyword: '불',
      color: { h: 10, s: 90, l: 55 },
      category: 'object',
      description: '뜨겁고 역동적인 불꽃 색상',
      synonyms: ['화염', '열정', '타오름', '뜨거움']
    },
    '얼음': {
      keyword: '얼음',
      color: { h: 190, s: 40, l: 85 },
      category: 'object',
      description: '차갑고 투명한 얼음 색상',
      synonyms: ['빙하', '차가움', '투명함', '결정']
    },

    // === 개념적 키워드 ===
    '성공': {
      keyword: '성공',
      color: { h: 120, s: 60, l: 45 },
      category: 'concept',
      description: '성취감을 나타내는 녹색',
      synonyms: ['달성', '승리', '완성', '목표']
    },
    '창의': {
      keyword: '창의',
      color: { h: 270, s: 70, l: 60 },
      category: 'concept',
      description: '독창적이고 영감을 주는 보라색',
      synonyms: ['창조', '독창성', '영감', '아이디어']
    },
    '집중': {
      keyword: '집중',
      color: { h: 240, s: 50, l: 40 },
      category: 'concept',
      description: '깊고 안정적인 진한 파랑',
      synonyms: ['몰입', '주의', '노력', '정신력']
    },
    '자유': {
      keyword: '자유',
      color: { h: 200, s: 80, l: 65 },
      category: 'concept',
      description: '넓고 자유로운 하늘색',
      synonyms: ['해방', '독립', '자율', '개방']
    }
  };

  /**
   * 키워드를 색상으로 매핑
   */
  mapKeywordToColor(keyword: string): HSLColor {
    const normalizedKeyword = keyword.trim().toLowerCase();
    
    // 직접 매핑 확인
    const directMatch = this.keywordColorMap[normalizedKeyword];
    if (directMatch) {
      return directMatch.color;
    }

    // 유사 키워드 검색 (동의어 포함)
    const similarMapping = this.findSimilarKeyword(normalizedKeyword);
    if (similarMapping) {
      return similarMapping.color;
    }

    // 부분 매칭 시도
    const partialMatch = this.findPartialMatch(normalizedKeyword);
    if (partialMatch) {
      return partialMatch.color;
    }

    // 기본 색상 반환 (중성 파랑)
    return { h: 200, s: 60, l: 60 };
  }

  /**
   * 유사 키워드 찾기 (동의어 기반)
   */
  private findSimilarKeyword(keyword: string): KeywordMapping | null {
    for (const mapping of Object.values(this.keywordColorMap)) {
      if (mapping.synonyms.some(synonym => 
        synonym.toLowerCase().includes(keyword) || 
        keyword.includes(synonym.toLowerCase())
      )) {
        return mapping;
      }
    }
    return null;
  }

  /**
   * 부분 매칭으로 키워드 찾기
   */
  private findPartialMatch(keyword: string): KeywordMapping | null {
    for (const [key, mapping] of Object.entries(this.keywordColorMap)) {
      if (key.toLowerCase().includes(keyword) || keyword.includes(key.toLowerCase())) {
        return mapping;
      }
    }
    return null;
  }

  /**
   * 키워드 카테고리별 색상 목록 반환
   */
  getColorsByCategory(category: KeywordCategory): KeywordMapping[] {
    return Object.values(this.keywordColorMap).filter(
      mapping => mapping.category === category
    );
  }

  /**
   * 모든 키워드 목록 반환
   */
  getAllKeywords(): string[] {
    return Object.keys(this.keywordColorMap);
  }

  /**
   * 카테고리별 키워드 목록 반환
   */
  getKeywordsByCategory(): Record<KeywordCategory, string[]> {
    const result: Record<KeywordCategory, string[]> = {
      emotion: [],
      nature: [],
      season: [],
      abstract: [],
      object: [],
      concept: []
    };

    for (const [keyword, mapping] of Object.entries(this.keywordColorMap)) {
      result[mapping.category].push(keyword);
    }

    return result;
  }

  /**
   * 키워드 검색 및 추천
   */
  searchKeywords(query: string, limit: number = 5): KeywordMapping[] {
    const normalizedQuery = query.toLowerCase().trim();
    const results: KeywordMapping[] = [];

    // 정확한 매치 우선
    for (const mapping of Object.values(this.keywordColorMap)) {
      if (mapping.keyword.toLowerCase() === normalizedQuery) {
        results.unshift(mapping);
      }
    }

    // 부분 매치
    for (const mapping of Object.values(this.keywordColorMap)) {
      if (mapping.keyword.toLowerCase().includes(normalizedQuery) && 
          !results.includes(mapping)) {
        results.push(mapping);
      }
    }

    // 동의어 매치
    for (const mapping of Object.values(this.keywordColorMap)) {
      if (mapping.synonyms.some(synonym => 
        synonym.toLowerCase().includes(normalizedQuery)) && 
          !results.includes(mapping)) {
        results.push(mapping);
      }
    }

    return results.slice(0, limit);
  }

  /**
   * 랜덤 키워드 추천
   */
  getRandomKeywords(count: number = 5): KeywordMapping[] {
    const allMappings = Object.values(this.keywordColorMap);
    const shuffled = [...allMappings].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * 키워드 정보 가져오기
   */
  getKeywordInfo(keyword: string): KeywordMapping | null {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return this.keywordColorMap[normalizedKeyword] || 
           this.findSimilarKeyword(normalizedKeyword) || 
           this.findPartialMatch(normalizedKeyword);
  }
}