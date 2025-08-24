import { Recipe } from '@/types'

const STORAGE_KEYS = {
  FAVORITES: 'ai-recipe-favorites',
  RECENT_SEARCHES: 'ai-recipe-recent-searches',
  USER_PREFERENCES: 'ai-recipe-preferences',
  RECIPE_HISTORY: 'ai-recipe-history'
} as const

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'ko' | 'en'
  defaultServings: number
  dietaryRestrictions: string[]
  preferredCuisines: string[]
}

export interface SearchHistory {
  query: string
  timestamp: number
  resultCount: number
}

export interface RecipeHistory {
  recipeId: string
  timestamp: number
  viewCount: number
}

class StorageService {
  private isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isStorageAvailable()) return defaultValue
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isStorageAvailable()) return
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  // 즐겨찾기 관리
  getFavorites(): string[] {
    return this.getItem(STORAGE_KEYS.FAVORITES, [])
  }

  addToFavorites(recipeId: string): void {
    const favorites = this.getFavorites()
    if (!favorites.includes(recipeId)) {
      favorites.push(recipeId)
      this.setItem(STORAGE_KEYS.FAVORITES, favorites)
    }
  }

  removeFromFavorites(recipeId: string): void {
    const favorites = this.getFavorites()
    const updatedFavorites = favorites.filter(id => id !== recipeId)
    this.setItem(STORAGE_KEYS.FAVORITES, updatedFavorites)
  }

  isFavorite(recipeId: string): boolean {
    return this.getFavorites().includes(recipeId)
  }

  // 검색 기록 관리
  getRecentSearches(): SearchHistory[] {
    return this.getItem(STORAGE_KEYS.RECENT_SEARCHES, [])
  }

  addSearchToHistory(query: string, resultCount: number): void {
    const searches = this.getRecentSearches()
    const existingIndex = searches.findIndex(s => s.query === query)
    
    if (existingIndex >= 0) {
      searches.splice(existingIndex, 1)
    }
    
    searches.unshift({
      query,
      timestamp: Date.now(),
      resultCount
    })
    
    // 최대 20개까지만 저장
    const limitedSearches = searches.slice(0, 20)
    this.setItem(STORAGE_KEYS.RECENT_SEARCHES, limitedSearches)
  }

  clearSearchHistory(): void {
    this.setItem(STORAGE_KEYS.RECENT_SEARCHES, [])
  }

  // 레시피 조회 기록
  getRecipeHistory(): RecipeHistory[] {
    return this.getItem(STORAGE_KEYS.RECIPE_HISTORY, [])
  }

  addRecipeToHistory(recipeId: string): void {
    const history = this.getRecipeHistory()
    const existingIndex = history.findIndex(h => h.recipeId === recipeId)
    
    if (existingIndex >= 0) {
      history[existingIndex].viewCount++
      history[existingIndex].timestamp = Date.now()
    } else {
      history.unshift({
        recipeId,
        timestamp: Date.now(),
        viewCount: 1
      })
    }
    
    // 최대 50개까지만 저장
    const limitedHistory = history.slice(0, 50)
    this.setItem(STORAGE_KEYS.RECIPE_HISTORY, limitedHistory)
  }

  getMostViewedRecipes(limit: number = 10): RecipeHistory[] {
    return this.getRecipeHistory()
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit)
  }

  getRecentlyViewedRecipes(limit: number = 10): RecipeHistory[] {
    return this.getRecipeHistory()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  // 사용자 설정 관리
  getUserPreferences(): UserPreferences {
    return this.getItem(STORAGE_KEYS.USER_PREFERENCES, {
      theme: 'system' as const,
      language: 'ko' as const,
      defaultServings: 2,
      dietaryRestrictions: [],
      preferredCuisines: []
    })
  }

  updateUserPreferences(preferences: Partial<UserPreferences>): void {
    const current = this.getUserPreferences()
    const updated = { ...current, ...preferences }
    this.setItem(STORAGE_KEYS.USER_PREFERENCES, updated)
  }

  // 데이터 내보내기/가져오기
  exportData(): string {
    const data = {
      favorites: this.getFavorites(),
      recentSearches: this.getRecentSearches(),
      recipeHistory: this.getRecipeHistory(),
      userPreferences: this.getUserPreferences(),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }
    return JSON.stringify(data, null, 2)
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.favorites) this.setItem(STORAGE_KEYS.FAVORITES, data.favorites)
      if (data.recentSearches) this.setItem(STORAGE_KEYS.RECENT_SEARCHES, data.recentSearches)
      if (data.recipeHistory) this.setItem(STORAGE_KEYS.RECIPE_HISTORY, data.recipeHistory)
      if (data.userPreferences) this.setItem(STORAGE_KEYS.USER_PREFERENCES, data.userPreferences)
      
      return true
    } catch {
      return false
    }
  }

  // 모든 데이터 삭제
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch {
        // Ignore errors
      }
    })
  }

  // 저장소 사용량 계산 (대략적)
  getStorageUsage(): { used: number; available: number } {
    if (!this.isStorageAvailable()) {
      return { used: 0, available: 0 }
    }

    let used = 0
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key)
      if (item) {
        used += item.length
      }
    })

    // localStorage는 보통 5-10MB 정도 사용 가능
    const available = 5 * 1024 * 1024 // 5MB 가정

    return { used, available }
  }
}

export const storageService = new StorageService()