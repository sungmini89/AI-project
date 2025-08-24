import { Recipe } from "../types";

// 번역된 레시피 타입
export interface TranslatedRecipe extends Recipe {
  originalLanguage: "ko" | "en";
  translatedLanguage: "ko" | "en";
  isTranslated: boolean;
}

// 번역 캐시 인터페이스
interface TranslationCache {
  [key: string]: {
    [targetLang: string]: {
      text: string;
      timestamp: number;
    };
  };
}

// 간단한 번역 서비스 (실제로는 Google Translate API 등을 사용할 수 있음)
class TranslationService {
  private cache: TranslationCache = {};
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간

  // 간단한 번역 매핑 (실제로는 API를 사용해야 함)
  private translationMap: { [key: string]: { ko: string; en: string } } = {
    // 레시피 제목
    "토마토 파스타": { ko: "토마토 파스타", en: "Tomato Pasta" },
    김치찌개: { ko: "김치찌개", en: "Kimchi Stew" },
    불고기: { ko: "불고기", en: "Bulgogi" },
    된장찌개: { ko: "된장찌개", en: "Soybean Paste Stew" },
    비빔밥: { ko: "비빔밥", en: "Bibimbap" },
    "치킨 샐러드": { ko: "치킨 샐러드", en: "Chicken Salad" },
    스파게티: { ko: "스파게티", en: "Spaghetti" },
    파스타: { ko: "파스타", en: "Pasta" },

    // 재료
    "스파게티 200g": { ko: "스파게티 200g", en: "200g spaghetti" },
    "토마토 4개 (껍질 벗긴 것)": {
      ko: "토마토 4개 (껍질 벗긴 것)",
      en: "4 peeled tomatoes",
    },
    "마늘 3쪽 (다진 것)": {
      ko: "마늘 3쪽 (다진 것)",
      en: "3 cloves minced garlic",
    },
    "양파 1/2개 (다진 것)": {
      ko: "양파 1/2개 (다진 것)",
      en: "1/2 diced onion",
    },
    "올리브 오일 3큰술": { ko: "올리브 오일 3큰술", en: "3 tbsp olive oil" },
    "바질 잎 10장": { ko: "바질 잎 10장", en: "10 basil leaves" },
    "파르메산 치즈 3큰술": {
      ko: "파르메산 치즈 3큰술",
      en: "3 tbsp parmesan cheese",
    },
    "소금, 후추 적당량": {
      ko: "소금, 후추 적당량",
      en: "Salt and pepper to taste",
    },
    "설탕 1작은술": { ko: "설탕 1작은술", en: "1 tsp sugar" },

    // 요리법
    "끓는 물에 소금을 넣고 스파게티를 포장지 표시 시간보다 1분 짧게 삶습니다.":
      {
        ko: "끓는 물에 소금을 넣고 스파게티를 포장지 표시 시간보다 1분 짧게 삶습니다.",
        en: "Boil spaghetti in salted water for 1 minute less than package instructions.",
      },
    "팬에 올리브 오일을 두르고 다진 마늘과 양파를 볶아 향을 냅니다.": {
      ko: "팬에 올리브 오일을 두르고 다진 마늘과 양파를 볶아 향을 냅니다.",
      en: "Heat olive oil in a pan and sauté minced garlic and onion until fragrant.",
    },
    "토마토를 으깨서 넣고 중불에서 10분간 끓여 소스를 만듭니다.": {
      ko: "토마토를 으깨서 넣고 중불에서 10분간 끓여 소스를 만듭니다.",
      en: "Add crushed tomatoes and simmer on medium heat for 10 minutes to make sauce.",
    },
    "소금, 후추, 설탕으로 간을 맞춥니다.": {
      ko: "소금, 후추, 설탕으로 간을 맞춥니다.",
      en: "Season with salt, pepper, and sugar to taste.",
    },
    "삶은 파스타를 소스에 넣고 파스타 물 2-3큰술과 함께 1분간 볶습니다.": {
      ko: "삶은 파스타를 소스에 넣고 파스타 물 2-3큰술과 함께 1분간 볶습니다.",
      en: "Add cooked pasta to sauce with 2-3 tbsp pasta water and toss for 1 minute.",
    },
    "바질 잎을 넣고 섞은 후 파르메산 치즈를 뿌려 완성합니다.": {
      ko: "바질 잎을 넣고 섞은 후 파르메산 치즈를 뿌려 완성합니다.",
      en: "Add basil leaves, mix, and sprinkle with parmesan cheese to finish.",
    },

    // 설명
    "신선한 토마토와 바질로 만든 클래식한 이탈리아 파스타입니다. 간단하지만 정통의 맛을 느낄 수 있습니다.":
      {
        ko: "신선한 토마토와 바질로 만든 클래식한 이탈리아 파스타입니다. 간단하지만 정통의 맛을 느낄 수 있습니다.",
        en: "A classic Italian pasta made with fresh tomatoes and basil. Simple yet authentic in flavor.",
      },

    // 난이도
    쉬움: { ko: "쉬움", en: "Easy" },
    보통: { ko: "보통", en: "Medium" },
    어려움: { ko: "어려움", en: "Hard" },

    // 기본 재료들
    닭가슴살: { ko: "닭가슴살", en: "Chicken breast" },
    양파: { ko: "양파", en: "Onion" },
    마늘: { ko: "마늘", en: "Garlic" },
    대파: { ko: "대파", en: "Green onion" },
    당근: { ko: "당근", en: "Carrot" },
    감자: { ko: "감자", en: "Potato" },
    김치: { ko: "김치", en: "Kimchi" },
    된장: { ko: "된장", en: "Soybean paste" },
    고추장: { ko: "고추장", en: "Gochujang" },
    간장: { ko: "간장", en: "Soy sauce" },
    참기름: { ko: "참기름", en: "Sesame oil" },
    식용유: { ko: "식용유", en: "Cooking oil" },

    // 카테고리 태그들
    샐러드: { ko: "샐러드", en: "Salad" },
    스프: { ko: "스프", en: "Soup" },
    찌개: { ko: "찌개", en: "Stew" },
    구이: { ko: "구이", en: "Grilled" },
    볶음: { ko: "볶음", en: "Stir-fried" },
    튀김: { ko: "튀김", en: "Fried" },
    조림: { ko: "조림", en: "Braised" },
    무침: { ko: "무침", en: "Seasoned" },
    김밥: { ko: "김밥", en: "Kimbap" },
    떡: { ko: "떡", en: "Rice cake" },
    전: { ko: "전", en: "Pancake" },
    국: { ko: "국", en: "Soup" },
    밥: { ko: "밥", en: "Rice" },
    면: { ko: "면", en: "Noodles" },
    빵: { ko: "빵", en: "Bread" },
    케이크: { ko: "케이크", en: "Cake" },
    쿠키: { ko: "쿠키", en: "Cookie" },
    아이스크림: { ko: "아이스크림", en: "Ice cream" },
    음료: { ko: "음료", en: "Beverage" },
    주스: { ko: "주스", en: "Juice" },
    차: { ko: "차", en: "Tea" },
    커피: { ko: "커피", en: "Coffee" },
    와인: { ko: "와인", en: "Wine" },
    맥주: { ko: "맥주", en: "Beer" },
    칵테일: { ko: "칵테일", en: "Cocktail" },
  };

  // 텍스트 번역
  async translateText(text: string, targetLang: "ko" | "en"): Promise<string> {
    if (!text || text.trim() === "") return text;

    // 캐시에서 확인
    const cacheKey = text.toLowerCase().trim();
    if (this.cache[cacheKey] && this.cache[cacheKey][targetLang]) {
      const cached = this.cache[cacheKey][targetLang];
      if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.text;
      }
    }

    // 번역 매핑에서 찾기
    let translatedText = text;

    // 정확한 매치 먼저 시도
    if (this.translationMap[text]) {
      translatedText = this.translationMap[text][targetLang];
    } else {
      // 부분 매치 시도 (키워드 기반)
      for (const [key, value] of Object.entries(this.translationMap)) {
        if (text.includes(key)) {
          translatedText = text.replace(key, value[targetLang]);
          break;
        }
      }
    }

    // 캐시에 저장
    if (!this.cache[cacheKey]) {
      this.cache[cacheKey] = {};
    }
    this.cache[cacheKey][targetLang] = {
      text: translatedText,
      timestamp: Date.now(),
    };

    return translatedText;
  }

  // 배열 번역
  async translateArray(
    items: string[],
    targetLang: "ko" | "en"
  ): Promise<string[]> {
    const translations = await Promise.all(
      items.map((item) => this.translateText(item, targetLang))
    );
    return translations;
  }

  // 레시피 전체 번역
  async translateRecipe(
    recipe: Recipe,
    targetLang: "ko" | "en"
  ): Promise<TranslatedRecipe> {
    try {
      const [
        translatedTitle,
        translatedSummary,
        translatedIngredients,
        translatedInstructions,
      ] = await Promise.all([
        this.translateText(recipe.title, targetLang),
        recipe.summary ? this.translateText(recipe.summary, targetLang) : "",
        this.translateArray(recipe.ingredients, targetLang),
        this.translateArray(recipe.instructions, targetLang),
      ]);

      // 난이도 번역
      const translatedDifficulty = recipe.difficulty
        ? await this.translateText(recipe.difficulty, targetLang)
        : recipe.difficulty;

      return {
        ...recipe,
        title: translatedTitle,
        summary: translatedSummary,
        ingredients: translatedIngredients,
        instructions: translatedInstructions,
        difficulty: translatedDifficulty,
        originalLanguage: recipe.title.match(/[가-힣]/) ? "ko" : "en",
        translatedLanguage: targetLang,
        isTranslated: true,
      } as TranslatedRecipe;
    } catch (error) {
      console.error("Translation failed:", error);
      // 번역 실패 시 원본 반환
      return {
        ...recipe,
        originalLanguage: recipe.title.match(/[가-힣]/) ? "ko" : "en",
        translatedLanguage: targetLang,
        isTranslated: false,
      } as TranslatedRecipe;
    }
  }

  // 캐시 클리어
  clearCache(): void {
    this.cache = {};
  }

  // 캐시 크기 확인
  getCacheSize(): number {
    return Object.keys(this.cache).length;
  }

  // 검색 쿼리 번역 (카테고리 태그용)
  async translateSearchQuery(
    query: string,
    targetLang: "ko" | "en"
  ): Promise<string> {
    // 기본 번역 함수 재사용
    return this.translateText(query, targetLang);
  }
}

// 싱글톤 인스턴스
export const translationService = new TranslationService();
