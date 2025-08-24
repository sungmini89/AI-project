import { Recipe, APIResponse, RecipeSearchParams } from '@/types'

interface SpoonacularRecipe {
  id: number
  title: string
  readyInMinutes: number
  servings: number
  image: string
  summary?: string
  analyzedInstructions?: Array<{
    steps: Array<{
      number: number
      step: string
      ingredients?: Array<{
        name: string
      }>
    }>
  }>
  extendedIngredients?: Array<{
    original: string
    name: string
  }>
  nutrition?: {
    nutrients: Array<{
      name: string
      amount: number
      unit: string
    }>
  }
  dishTypes?: string[]
  healthScore?: number
  spoonacularScore?: number
  tags?: string[]
}

interface SpoonacularSearchResponse {
  results: SpoonacularRecipe[]
  offset: number
  number: number
  totalResults: number
}

class SpoonacularClient {
  private apiKey: string | null
  private baseUrl: string
  private timeout: number

  constructor() {
    this.apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY || null
    this.baseUrl = 'https://api.spoonacular.com/recipes'
    this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000
  }

  private isEnabled(): boolean {
    return Boolean(
      this.apiKey && 
      import.meta.env.VITE_API_MODE !== 'offline' &&
      import.meta.env.VITE_ENABLE_EXTERNAL_API !== 'false'
    )
  }

  async searchRecipes(query: string, options: Partial<RecipeSearchParams> = {}): Promise<APIResponse<Recipe[]>> {
    if (!this.isEnabled()) {
      return {
        success: false,
        data: [],
        error: 'Spoonacular API가 비활성화되어 있습니다',
        source: 'external-disabled'
      }
    }

    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey!,
        query: query,
        number: '12',
        addRecipeInformation: 'true',
        fillIngredients: 'true',
        addRecipeNutrition: 'true',
        instructionsRequired: 'true',
        ...(options.cuisine && { cuisine: options.cuisine }),
        ...(options.diet && { diet: options.diet }),
        ...(options.maxReadyTime && { maxReadyTime: options.maxReadyTime.toString() }),
        ...(options.minHealthScore && { minHealthScore: options.minHealthScore.toString() })
      })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(`${this.baseUrl}/complexSearch?${params}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Spoonacular API 오류: ${response.status} ${response.statusText}`)
      }

      const data: SpoonacularSearchResponse = await response.json()
      const recipes = data.results.map(this.transformRecipe)

      return {
        success: true,
        data: recipes,
        source: 'spoonacular',
        meta: {
          totalResults: data.totalResults,
          offset: data.offset
        }
      }

    } catch (error) {
      console.error('Spoonacular 검색 실패:', error)
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          data: [],
          error: '요청 시간이 초과되었습니다',
          source: 'spoonacular'
        }
      }

      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Spoonacular API 오류',
        source: 'spoonacular'
      }
    }
  }

  async getRecipeDetails(id: string): Promise<APIResponse<Recipe>> {
    if (!this.isEnabled()) {
      return {
        success: false,
        data: null,
        error: 'Spoonacular API가 비활성화되어 있습니다',
        source: 'external-disabled'
      }
    }

    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey!,
        includeNutrition: 'true'
      })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(`${this.baseUrl}/${id}/information?${params}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Spoonacular API 오류: ${response.status} ${response.statusText}`)
      }

      const data: SpoonacularRecipe = await response.json()
      const recipe = this.transformRecipe(data)

      return {
        success: true,
        data: recipe,
        source: 'spoonacular'
      }

    } catch (error) {
      console.error('Spoonacular 상세 조회 실패:', error)
      
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Spoonacular API 오류',
        source: 'spoonacular'
      }
    }
  }

  async searchByIngredients(ingredients: string[]): Promise<APIResponse<Recipe[]>> {
    if (!this.isEnabled()) {
      return {
        success: false,
        data: [],
        error: 'Spoonacular API가 비활성화되어 있습니다',
        source: 'external-disabled'
      }
    }

    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey!,
        ingredients: ingredients.join(','),
        number: '12',
        ranking: '1', // 누락된 재료를 최소화
        ignorePantry: 'true'
      })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      // 1단계: 재료로 레시피 검색
      const response = await fetch(`${this.baseUrl}/findByIngredients?${params}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Spoonacular API 오류: ${response.status} ${response.statusText}`)
      }

      const basicResults = await response.json()

      // 2단계: 각 레시피의 상세 정보 가져오기
      const recipePromises = basicResults.slice(0, 6).map(async (recipe: any) => {
        const detailResponse = await this.getRecipeDetails(recipe.id.toString())
        return detailResponse.success ? detailResponse.data : null
      })

      const recipes = (await Promise.all(recipePromises))
        .filter((recipe): recipe is Recipe => recipe !== null)

      return {
        success: true,
        data: recipes,
        source: 'spoonacular'
      }

    } catch (error) {
      console.error('Spoonacular 재료 검색 실패:', error)
      
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Spoonacular API 오류',
        source: 'spoonacular'
      }
    }
  }

  private transformRecipe(spoonacularRecipe: SpoonacularRecipe): Recipe {
    // 조리 방법 추출
    const instructions = this.extractInstructions(spoonacularRecipe)
    
    // 재료 추출
    const ingredients = spoonacularRecipe.extendedIngredients?.map(ing => ing.original) || []
    
    // 영양정보 추출
    const nutrition = this.extractNutrition(spoonacularRecipe)
    
    // 태그 생성
    const tags = [
      ...(spoonacularRecipe.dishTypes || []),
      ...(spoonacularRecipe.tags || [])
    ].slice(0, 5)

    return {
      id: `spoonacular-${spoonacularRecipe.id}`,
      title: spoonacularRecipe.title,
      description: this.cleanHtml(spoonacularRecipe.summary || ''),
      summary: this.cleanHtml(spoonacularRecipe.summary || '').substring(0, 150) + '...',
      ingredients,
      instructions,
      readyInMinutes: spoonacularRecipe.readyInMinutes || 30,
      servings: spoonacularRecipe.servings || 1,
      difficulty: this.calculateDifficulty(spoonacularRecipe),
      healthScore: spoonacularRecipe.healthScore,
      tags,
      nutrition,
      image: spoonacularRecipe.image || '',
      source: 'spoonacular'
    }
  }

  private extractInstructions(recipe: SpoonacularRecipe): string[] {
    if (!recipe.analyzedInstructions || recipe.analyzedInstructions.length === 0) {
      return ['조리 방법 정보가 없습니다.']
    }

    const steps = recipe.analyzedInstructions[0]?.steps || []
    return steps.map(step => step.step)
  }

  private extractNutrition(recipe: SpoonacularRecipe) {
    if (!recipe.nutrition?.nutrients) {
      return {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sodium: 0
      }
    }

    const nutrients = recipe.nutrition.nutrients
    const findNutrient = (name: string) => 
      nutrients.find(n => n.name.toLowerCase() === name.toLowerCase())

    const calories = findNutrient('Calories')?.amount || 0
    const protein = findNutrient('Protein')?.amount || 0
    const carbs = findNutrient('Carbohydrates')?.amount || 0
    const fat = findNutrient('Fat')?.amount || 0
    const fiber = findNutrient('Fiber')?.amount || 0
    const sodium = findNutrient('Sodium')?.amount || 0

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbohydrates: Math.round(carbs),
      fat: Math.round(fat),
      fiber: Math.round(fiber),
      sodium: Math.round(sodium)
    }
  }

  private calculateDifficulty(recipe: SpoonacularRecipe): 'easy' | 'medium' | 'hard' {
    const readyTime = recipe.readyInMinutes || 30
    const instructionCount = recipe.analyzedInstructions?.[0]?.steps?.length || 0
    
    if (readyTime <= 20 && instructionCount <= 5) return 'easy'
    if (readyTime <= 45 && instructionCount <= 10) return 'medium'
    return 'hard'
  }

  private cleanHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // HTML 태그 제거
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }
}

export const spoonacularClient = new SpoonacularClient()