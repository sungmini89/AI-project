// 간단한 API 클라이언트 (타입 에러 없이)
import { Recipe, APIResponse } from '@/types'

export async function searchOfflineRecipes(query: string): Promise<APIResponse<Recipe[]>> {
  try {
    const response = await fetch('/recipes.json')
    const data = await response.json()
    
    if (!data.recipes) {
      return {
        success: false,
        data: [],
        error: '레시피 데이터를 찾을 수 없습니다',
        source: 'offline'
      }
    }

    let filteredRecipes = data.recipes

    // 검색어 필터링
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      filteredRecipes = filteredRecipes.filter((recipe: any) => 
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.description?.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some((ingredient: string) => 
          ingredient.toLowerCase().includes(searchTerm)
        ) ||
        recipe.tags?.some((tag: string) => 
          tag.toLowerCase().includes(searchTerm)
        )
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