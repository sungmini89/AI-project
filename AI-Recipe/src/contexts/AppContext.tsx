import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Recipe } from '@/types';

// 애플리케이션 상태 인터페이스
interface AppState {
  // 레시피 관련 상태
  recipes: Recipe[];
  favorites: string[];
  searchResults: Recipe[];
  currentRecipe: Recipe | null;
  
  // UI 상태
  isLoading: boolean;
  error: string | null;
  
  // 검색 상태
  searchQuery: string;
  searchFilters: SearchFilters;
  
  // AI 생성 상태
  isGenerating: boolean;
  generatedRecipe: Recipe | null;
}

interface SearchFilters {
  cuisine: string;
  maxTime: number;
  difficulty: string;
  dietary: string[];
}

// 액션 타입들
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RECIPES'; payload: Recipe[] }
  | { type: 'SET_SEARCH_RESULTS'; payload: Recipe[] }
  | { type: 'SET_CURRENT_RECIPE'; payload: Recipe | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_FILTERS'; payload: Partial<SearchFilters> }
  | { type: 'ADD_FAVORITE'; payload: string }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'SET_FAVORITES'; payload: string[] }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_GENERATED_RECIPE'; payload: Recipe | null };

// 초기 상태
const initialState: AppState = {
  recipes: [],
  favorites: [],
  searchResults: [],
  currentRecipe: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  searchFilters: {
    cuisine: '',
    maxTime: 60,
    difficulty: '',
    dietary: []
  },
  isGenerating: false,
  generatedRecipe: null
};

// 리듀서 함수
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_RECIPES':
      return { ...state, recipes: action.payload };
    
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload, isLoading: false };
    
    case 'SET_CURRENT_RECIPE':
      return { ...state, currentRecipe: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SEARCH_FILTERS':
      return { 
        ...state, 
        searchFilters: { ...state.searchFilters, ...action.payload } 
      };
    
    case 'ADD_FAVORITE':
      if (state.favorites.includes(action.payload)) {
        return state;
      }
      return { ...state, favorites: [...state.favorites, action.payload] };
    
    case 'REMOVE_FAVORITE':
      return { 
        ...state, 
        favorites: state.favorites.filter(id => id !== action.payload) 
      };
    
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    
    case 'SET_GENERATED_RECIPE':
      return { ...state, generatedRecipe: action.payload, isGenerating: false };
    
    default:
      return state;
  }
}

// Context 생성
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider 컴포넌트
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Context 사용을 위한 커스텀 훅
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// 편의 함수들
export function useAppState() {
  const { state } = useAppContext();
  return state;
}

export function useAppActions() {
  const { dispatch } = useAppContext();

  return {
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    setRecipes: (recipes: Recipe[]) => dispatch({ type: 'SET_RECIPES', payload: recipes }),
    setSearchResults: (results: Recipe[]) => dispatch({ type: 'SET_SEARCH_RESULTS', payload: results }),
    setCurrentRecipe: (recipe: Recipe | null) => dispatch({ type: 'SET_CURRENT_RECIPE', payload: recipe }),
    setSearchQuery: (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
    setSearchFilters: (filters: Partial<SearchFilters>) => dispatch({ type: 'SET_SEARCH_FILTERS', payload: filters }),
    addFavorite: (id: string) => dispatch({ type: 'ADD_FAVORITE', payload: id }),
    removeFavorite: (id: string) => dispatch({ type: 'REMOVE_FAVORITE', payload: id }),
    setFavorites: (favorites: string[]) => dispatch({ type: 'SET_FAVORITES', payload: favorites }),
    setGenerating: (generating: boolean) => dispatch({ type: 'SET_GENERATING', payload: generating }),
    setGeneratedRecipe: (recipe: Recipe | null) => dispatch({ type: 'SET_GENERATED_RECIPE', payload: recipe }),
  };
}