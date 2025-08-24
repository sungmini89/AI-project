import { Recipe, APIResponse, RecipeSearchParams } from '@/types'
import { searchOfflineRecipes } from './simpleApiClient'
import { spoonacularClient } from './spoonacularClient'

interface UnifiedSearchOptions extends Partial<RecipeSearchParams> {
  sources?: Array<'offline' | 'spoonacular'>
  prioritySource?: 'offline' | 'spoonacular' | 'hybrid'
}

class UnifiedApiClient {
  private cacheTimeout = 5 * 60 * 1000 // 5분
  private searchCache = new Map<string, { data: Recipe[]; timestamp: number }>()

  async searchRecipes(query: string, options: UnifiedSearchOptions = {}): Promise<APIResponse<Recipe[]>> {
    const {
      sources = ['offline', 'spoonacular'],
      prioritySource = 'hybrid',
      ...searchParams
    } = options

    // 캐시 확인
    const cacheKey = `${query}-${JSON.stringify(searchParams)}`
    const cached = this.searchCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return {
        success: true,
        data: cached.data,
        source: 'cache'
      }
    }

    try {
      const results: Recipe[] = []
      const errors: string[] = []

      // 우선순위에 따른 검색 전략
      switch (prioritySource) {
        case 'offline':
          const offlineResult = await this.searchOfflineFirst(query, searchParams)
          if (offlineResult.success) {
            results.push(...offlineResult.data)
          } else {
            errors.push(offlineResult.error || '')
          }
          break

        case 'spoonacular':
          const spoonacularResult = await this.searchSpoonacularFirst(query, searchParams)
          if (spoonacularResult.success) {
            results.push(...spoonacularResult.data)
          } else {
            errors.push(spoonacularResult.error || '')
          }
          break

        case 'hybrid':
        default:
          const hybridResults = await this.searchHybrid(query, searchParams, sources)
          results.push(...hybridResults.data)
          if (hybridResults.errors.length > 0) {
            errors.push(...hybridResults.errors)
          }
          break
      }

      // 결과 정렬 및 중복 제거
      const uniqueResults = this.removeDuplicates(results)
      const sortedResults = this.sortResults(uniqueResults, query)

      // 캐시에 저장
      if (sortedResults.length > 0) {
        this.searchCache.set(cacheKey, {
          data: sortedResults,
          timestamp: Date.now()
        })
      }

      return {
        success: sortedResults.length > 0,
        data: sortedResults,
        source: prioritySource,
        error: sortedResults.length === 0 && errors.length > 0 ? errors.join('; ') : undefined
      }

    } catch (error) {
      console.error('통합 검색 실패:', error)
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '통합 검색 오류',
        source: 'unified'
      }
    }
  }

  async getRecipeDetails(id: string): Promise<APIResponse<Recipe>> {
    try {
      // ID 형식으로 소스 판별
      if (id.startsWith('spoonacular-')) {
        const spoonacularId = id.replace('spoonacular-', '')
        return await spoonacularClient.getRecipeDetails(spoonacularId)
      } else {
        // 오프라인 데이터에서 조회
        const response = await fetch('/recipes.json')
        const data = await response.json()
        const recipe = data.recipes?.find((r: any) => r.id === id)
        
        if (recipe) {
          return {
            success: true,
            data: recipe,
            source: 'offline'
          }
        } else {
          return {
            success: false,
            data: null,
            error: '레시피를 찾을 수 없습니다',
            source: 'offline'
          }
        }
      }
    } catch (error) {
      console.error('레시피 상세 조회 실패:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : '레시피 조회 오류',
        source: 'unified'
      }
    }
  }

  async searchByIngredients(ingredients: string[]): Promise<APIResponse<Recipe[]>> {
    const query = ingredients.join(' ')
    
    try {
      // 1. Spoonacular의 재료 기반 검색 우선 시도
      const spoonacularResult = await spoonacularClient.searchByIngredients(ingredients)
      
      // 2. 오프라인 검색으로 보완
      const offlineResult = await searchOfflineRecipes(query)
      
      const results: Recipe[] = []
      
      if (spoonacularResult.success) {
        results.push(...spoonacularResult.data)
      }
      
      if (offlineResult.success) {
        // 중복되지 않는 오프라인 결과만 추가
        const newOfflineResults = offlineResult.data.filter(recipe => 
          !results.some(existing => existing.title === recipe.title)
        )
        results.push(...newOfflineResults)
      }

      return {
        success: results.length > 0,
        data: results.slice(0, 12), // 최대 12개
        source: 'unified'
      }

    } catch (error) {
      console.error('재료 기반 검색 실패:', error)
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '재료 검색 오류',
        source: 'unified'
      }
    }
  }

  private async searchOfflineFirst(query: string, params: Partial<RecipeSearchParams>): Promise<APIResponse<Recipe[]>> {
    const offlineResult = await searchOfflineRecipes(query)
    
    // 오프라인에 충분한 결과가 없으면 외부 API 추가 호출
    if (offlineResult.success && offlineResult.data.length < 6) {
      const spoonacularResult = await spoonacularClient.searchRecipes(query, params)
      if (spoonacularResult.success) {
        const combined = [...offlineResult.data, ...spoonacularResult.data]
        return {
          success: true,
          data: combined.slice(0, 12),
          source: 'offline-spoonacular'
        }
      }
    }
    
    return offlineResult
  }

  private async searchSpoonacularFirst(query: string, params: Partial<RecipeSearchParams>): Promise<APIResponse<Recipe[]>> {
    const spoonacularResult = await spoonacularClient.searchRecipes(query, params)
    
    // 외부 API 실패시 오프라인으로 폴백
    if (!spoonacularResult.success) {
      console.warn('Spoonacular 검색 실패, 오프라인으로 폴백:', spoonacularResult.error)
      return await searchOfflineRecipes(query)
    }
    
    return spoonacularResult
  }

  private async searchHybrid(query: string, params: Partial<RecipeSearchParams>, sources: Array<'offline' | 'spoonacular'>): Promise<{ data: Recipe[]; errors: string[] }> {
    const promises: Promise<APIResponse<Recipe[]>>[] = []
    const errors: string[] = []

    if (sources.includes('offline')) {
      promises.push(searchOfflineRecipes(query))
    }

    if (sources.includes('spoonacular')) {
      promises.push(spoonacularClient.searchRecipes(query, params))
    }

    const results = await Promise.allSettled(promises)
    const allRecipes: Recipe[] = []

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.success) {
        allRecipes.push(...result.value.data)
      } else if (result.status === 'fulfilled' && result.value.error) {
        errors.push(result.value.error)
      } else if (result.status === 'rejected') {
        errors.push('검색 중 오류 발생')
      }
    })

    return { data: allRecipes, errors }
  }

  private removeDuplicates(recipes: Recipe[]): Recipe[] {
    const seen = new Set<string>()
    return recipes.filter(recipe => {
      const key = recipe.title.toLowerCase().trim()
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  private sortResults(recipes: Recipe[], query: string): Recipe[] {
    const lowerQuery = query.toLowerCase()
    
    return recipes.sort((a, b) => {
      // 1. 제목에 검색어가 포함된 것 우선
      const aInTitle = a.title.toLowerCase().includes(lowerQuery) ? 1 : 0
      const bInTitle = b.title.toLowerCase().includes(lowerQuery) ? 1 : 0
      if (aInTitle !== bInTitle) return bInTitle - aInTitle

      // 2. 건강 점수가 높은 것 우선
      const aHealth = a.healthScore || 0
      const bHealth = b.healthScore || 0
      if (aHealth !== bHealth) return bHealth - aHealth

      // 3. 조리 시간이 짧은 것 우선
      return a.readyInMinutes - b.readyInMinutes
    })
  }

  clearCache(): void {
    this.searchCache.clear()
  }

  getCacheSize(): number {
    return this.searchCache.size
  }
}

export const unifiedApiClient = new UnifiedApiClient()