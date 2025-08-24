import { Recipe, APIResponse, RecipeSearchParams } from '@/types'

export class OfflineClient {
  private recipes: Recipe[] = []
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      const response = await fetch('/recipes.json')
      const data = await response.json()
      this.recipes = data.recipes || []
      this.initialized = true
    } catch (error) {
      console.error('오프라인 레시피 데이터 로드 실패:', error)
      this.recipes = []
      this.initialized = true
    }
  }

  async searchRecipes(
    query: string, 
    options: Partial<RecipeSearchParams> = {}
  ): Promise<APIResponse<Recipe[]>> {
    await this.initialize()

    try {
      let filteredRecipes = this.recipes

      // 검색어 필터링
      if (query.trim()) {
        const searchTerm = query.toLowerCase()
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.title.toLowerCase().includes(searchTerm) ||
          recipe.description?.toLowerCase().includes(searchTerm) ||
          recipe.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(searchTerm)
          ) ||
          recipe.tags?.some(tag => 
            tag.toLowerCase().includes(searchTerm)
          )
        )
      }

      // 요리 종류 필터링
      if (options.cuisine) {
        const cuisineFilter = options.cuisine.toLowerCase()
        filteredRecipes = filteredRecipes.filter(recipe =>
          recipe.tags?.some(tag => tag.toLowerCase().includes(cuisineFilter)) ||
          recipe.dishTypes?.some(type => type.toLowerCase().includes(cuisineFilter))
        )
      }

      // 식단 유형 필터링
      if (options.dietary && options.dietary.length > 0) {
        filteredRecipes = filteredRecipes.filter(recipe =>
          options.dietary!.some(diet =>
            recipe.tags?.some(tag => tag.toLowerCase().includes(diet.toLowerCase()))
          )
        )
      }

      // 조리 시간 필터링
      if (options.maxCookingTime) {
        filteredRecipes = filteredRecipes.filter(recipe =>
          recipe.readyInMinutes <= options.maxCookingTime!
        )
      }

      // 칼로리 필터링
      if (options.maxCalories && filteredRecipes.length > 0) {
        filteredRecipes = filteredRecipes.filter(recipe =>
          !recipe.nutrition || recipe.nutrition.calories <= options.maxCalories!
        )
      }

      // 결과 제한 (최대 12개)
      const limitedRecipes = filteredRecipes.slice(0, 12)

      return {
        success: true,
        data: limitedRecipes,
        source: 'offline'
      }

    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '오프라인 검색 오류',
        source: 'offline'
      }
    }
  }

  async searchByIngredients(ingredients: string[]): Promise<APIResponse<Recipe[]>> {
    await this.initialize()

    try {
      if (ingredients.length === 0) {
        return {
          success: true,
          data: this.recipes.slice(0, 12),
          source: 'offline'
        }
      }

      // 재료 매칭 점수 계산
      const recipesWithScore = this.recipes.map(recipe => {
        let score = 0
        const recipeIngredients = recipe.ingredients.map(ing => ing.toLowerCase())
        
        ingredients.forEach(ingredient => {
          const searchIngredient = ingredient.toLowerCase()
          if (recipeIngredients.some(recipeIng => recipeIng.includes(searchIngredient))) {
            score += 1
          }
        })

        return { recipe, score }
      })

      // 점수별 정렬 및 필터링
      const matchedRecipes = recipesWithScore
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)
        .map(item => item.recipe)

      return {
        success: true,
        data: matchedRecipes,
        source: 'offline'
      }

    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : '재료 검색 오류',
        source: 'offline'
      }
    }
  }

  async getRecipeById(id: string): Promise<APIResponse<Recipe>> {
    await this.initialize()

    try {
      const recipe = this.recipes.find(r => r.id === id)
      
      if (!recipe) {
        return {
          success: false,
          data: null as any,
          error: '레시피를 찾을 수 없습니다',
          source: 'offline'
        }
      }

      return {
        success: true,
        data: recipe,
        source: 'offline'
      }

    } catch (error) {
      return {
        success: false,
        data: null as any,
        error: error instanceof Error ? error.message : '레시피 조회 오류',
        source: 'offline'
      }
    }
  }

  async getAllRecipes(): Promise<Recipe[]> {
    await this.initialize()
    return this.recipes
  }

  getRecipeCount(): number {
    return this.recipes.length
  }
}