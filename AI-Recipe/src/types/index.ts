/**
 * AI Recipe 애플리케이션의 타입 정의
 * 애플리케이션 전체에서 사용되는 모든 TypeScript 인터페이스와 타입을 정의합니다.
 * 
 * @description
 * - API 서비스 설정 타입
 * - 레시피 관련 타입
 * - 영양 정보 타입
 * - 재료 타입
 * - API 응답 타입
 * - 애플리케이션 상태 타입
 * - 컴포넌트 Props 타입
 * - 폼 타입
 * - 저장소 타입
 * 
 * @author AI Recipe Team
 * @version 1.0.0
 */

// API Service Configuration Types
/**
 * AI 서비스 설정 인터페이스
 * 다양한 AI 서비스 모드와 설정을 정의합니다.
 */
export interface AIServiceConfig {
  /** AI 서비스 모드: mock, free, offline, custom */
  mode: 'mock' | 'free' | 'offline' | 'custom';
  /** API 키 (custom 모드에서 사용) */
  apiKey?: string;
  /** 오프라인 모드로 폴백할지 여부 */
  fallbackToOffline: boolean;
}

// Recipe Types
/**
 * 레시피 정보 인터페이스
 * 레시피의 모든 속성과 메타데이터를 포함합니다.
 */
export interface Recipe {
  /** 레시피 고유 식별자 */
  id: string | number;
  /** 레시피 제목 */
  title: string;
  /** 레시피 설명 */
  description?: string;
  /** 레시피 요약 */
  summary?: string;
  /** 재료 목록 */
  ingredients: string[];
  /** 조리 방법 단계별 설명 */
  instructions: string[];
  /** 조리 시간 (분) */
  cookingTime?: number;
  /** 총 소요 시간 (분) */
  readyInMinutes: number;
  /** 인분 수 */
  servings: number;
  /** 난이도 */
  difficulty?: 'easy' | 'medium' | 'hard' | '쉬움' | '보통' | '어려움';
  /** 영양 정보 */
  nutrition?: NutritionInfo;
  /** 태그 목록 */
  tags?: string[];
  /** 요리 종류 */
  dishTypes?: string[];
  /** 레시피 이미지 URL */
  image?: string;
  /** 건강 점수 */
  healthScore?: number;
  /** 데이터 출처 */
  source?: 'spoonacular' | 'edamam' | 'offline' | 'mock' | 'ai-generated' | 'ai-mock';
  /** 생성 날짜 */
  createdAt?: string;
  /** 즐겨찾기 여부 */
  isFavorite?: boolean;
}

// Nutrition Information
/**
 * 영양 정보 인터페이스
 * 레시피의 영양 성분을 상세히 정의합니다.
 */
export interface NutritionInfo {
  /** 칼로리 (kcal) */
  calories: number;
  /** 단백질 (g) */
  protein: number;
  /** 탄수화물 (g) */
  carbohydrates: number;
  /** 지방 (g) */
  fat: number;
  /** 식이섬유 (g) */
  fiber: number;
  /** 나트륨 (mg) */
  sodium: number;
  /** 설탕 (g) */
  sugar?: number | undefined;
  /** 콜레스테롤 (mg) */
  cholesterol?: number | undefined;
}

// Ingredient Types
/**
 * 재료 정보 인터페이스
 * 재료의 기본 정보와 분류를 정의합니다.
 */
export interface Ingredient {
  /** 재료 고유 식별자 */
  id: string;
  /** 재료 이름 */
  name: string;
  /** 재료 카테고리 */
  category?: string;
  /** 일반적인 다른 이름들 */
  commonNames?: string[];
}

// API Response Types
/**
 * API 응답 인터페이스
 * 모든 API 호출의 표준 응답 형식을 정의합니다.
 */
export interface APIResponse<T> {
  /** 요청 성공 여부 */
  success: boolean;
  /** 응답 데이터 */
  data: T;
  /** 오류 메시지 (실패 시) */
  error?: string;
  /** 데이터 출처 */
  source: 'spoonacular' | 'edamam' | 'offline' | 'mock' | 'ai-generated' | 'ai-mock' | 'cache' | 'unified' | 'hybrid' | 'external-disabled' | 'offline-spoonacular';
  /** 메타데이터 */
  meta?: {
    /** 전체 결과 수 */
    totalResults?: number;
    /** 오프셋 */
    offset?: number;
    /** 기타 메타데이터 */
    [key: string]: any;
  };
}

/**
 * 레시피 검색 파라미터 인터페이스
 * 레시피 검색 시 사용되는 모든 필터 옵션을 정의합니다.
 */
export interface RecipeSearchParams {
  /** 검색할 재료 목록 */
  ingredients?: string[];
  /** 식이 제한 사항 */
  dietary?: string[];
  /** 최대 조리 시간 (분) */
  maxCookingTime?: number;
  /** 최소 조리 시간 (분) */
  minCookingTime?: number;
  /** 최대 칼로리 */
  maxCalories?: number;
  /** 최소 칼로리 */
  minCalories?: number;
  /** 최대 준비 시간 (분) */
  maxReadyTime?: number;
  /** 최소 건강 점수 */
  minHealthScore?: number;
  /** 요리 종류 */
  cuisine?: string;
  /** 음식 타입 */
  type?: string;
  /** 난이도 */
  difficulty?: 'easy' | 'medium' | 'hard';
  /** 식단 타입 (비건, 채식주의 등) */
  diet?: string;
  /** 알레르기/불내성 (글루텐, 유제품 등) */
  intolerances?: string[];
  /** 인분 수 */
  servings?: number;
  /** 정렬 기준 */
  sort?: 'healthiness' | 'time' | 'random' | 'popularity';
  /** 오프셋 (페이지네이션) */
  offset?: number;
  /** 결과 개수 */
  number?: number;
}

// Application State Types
/**
 * 애플리케이션 상태 인터페이스
 * 전역 상태 관리에 사용되는 주요 상태들을 정의합니다.
 */
export interface AppState {
  /** 선택된 재료 목록 */
  selectedIngredients: string[];
  /** 검색된 레시피 목록 */
  recipes: Recipe[];
  /** 즐겨찾기 레시피 목록 */
  favoriteRecipes: Recipe[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 오류 메시지 */
  error: string | null;
  /** API 상태 정보 */
  apiStatus: APIStatus;
}

/**
 * API 상태 인터페이스
 * 각 외부 API 서비스의 가용성과 사용량을 추적합니다.
 */
export interface APIStatus {
  /** Spoonacular API 상태 */
  spoonacular: {
    /** 사용 가능 여부 */
    available: boolean;
    /** 남은 API 호출 횟수 */
    remaining: number;
    /** API 제한 리셋 시간 */
    resetTime?: Date;
  };
  /** Edamam API 상태 */
  edamam: {
    /** 사용 가능 여부 */
    available: boolean;
    /** 남은 API 호출 횟수 */
    remaining: number;
    /** API 제한 리셋 시간 */
    resetTime?: Date;
  };
  /** 오프라인 모드 여부 */
  offline: boolean;
}

// Component Props Types
/**
 * 레시피 카드 컴포넌트 Props 인터페이스
 * 레시피 카드 렌더링에 필요한 데이터를 정의합니다.
 */
export interface RecipeCardProps {
  /** 표시할 레시피 데이터 */
  recipe: Recipe;
  /** 즐겨찾기 토글 콜백 */
  onFavorite?: (recipeId: string) => void;
  /** 레시피 상세보기 콜백 */
  onView?: (recipe: Recipe) => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 재료 입력 컴포넌트 Props 인터페이스
 * 재료 입력 폼에 필요한 데이터를 정의합니다.
 */
export interface IngredientInputProps {
  /** 현재 입력된 재료 목록 */
  ingredients: string[];
  /** 재료 목록 변경 콜백 */
  onIngredientsChange: (ingredients: string[]) => void;
  /** 사용 가능한 재료 목록 */
  availableIngredients?: Ingredient[];
  /** 최대 재료 개수 */
  maxIngredients?: number;
}

/**
 * 영양 정보 표시 컴포넌트 Props 인터페이스
 * 영양 정보 렌더링에 필요한 데이터를 정의합니다.
 */
export interface NutritionDisplayProps {
  /** 표시할 영양 정보 */
  nutrition: NutritionInfo;
  /** 상세 정보 표시 여부 */
  showDetailed?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

// Form Types
/**
 * 레시피 검색 폼 인터페이스
 * 레시피 검색 폼의 모든 입력 필드를 정의합니다.
 */
export interface RecipeSearchForm {
  /** 검색할 재료 목록 */
  ingredients: string[];
  /** 식이 제한 사항 */
  dietary: string[];
  /** 최대 조리 시간 (분) */
  maxCookingTime: number;
  /** 최대 칼로리 */
  maxCalories: number;
  /** 요리 종류 */
  cuisine: string;
  /** 식사 타입 */
  mealType: string;
}

// Storage Types
/**
 * 로컬 저장소 데이터 인터페이스
 * localStorage에 저장되는 모든 데이터 구조를 정의합니다.
 */
export interface StoredData {
  /** 즐겨찾기 레시피 ID 목록 */
  favorites: string[];
  /** 최근 사용한 재료 목록 */
  recentIngredients: string[];
  /** 사용자 설정 */
  settings: UserSettings;
  /** API 사용량 데이터 */
  quotaData: QuotaData;
}

/**
 * 사용자 설정 인터페이스
 * 사용자가 커스터마이징할 수 있는 모든 설정을 정의합니다.
 */
export interface UserSettings {
  /** 테마 설정 */
  theme: 'light' | 'dark' | 'system';
  /** 언어 설정 */
  language: 'ko' | 'en';
  /** 기본 인분 수 */
  defaultServings: number;
  /** 식이 제한 사항 */
  dietaryRestrictions: string[];
  /** 선호하는 요리 종류 */
  preferredCuisines: string[];
}

/**
 * API 사용량 데이터 인터페이스
 * 각 API 서비스의 사용량과 제한을 추적합니다.
 */
export interface QuotaData {
  /** Spoonacular API 사용량 */
  spoonacular: {
    /** 사용한 API 호출 횟수 */
    used: number;
    /** API 호출 제한 */
    limit: number;
    /** API 제한 리셋 날짜 */
    resetDate: string;
  };
  /** Edamam API 사용량 */
  edamam: {
    /** 사용한 API 호출 횟수 */
    used: number;
    /** API 호출 제한 */
    limit: number;
    /** API 제한 리셋 날짜 */
    resetDate: string;
  };
}