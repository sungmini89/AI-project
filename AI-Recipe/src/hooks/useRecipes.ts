import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Recipe, RecipeSearchParams } from '@/types'
import { unifiedApiClient } from '@/services/api/unifiedApiClient'

interface UseRecipesState {
  recipes: Recipe[]
  loading: boolean
  error: string | null
  hasSearched: boolean
}

interface UseRecipesReturn extends UseRecipesState {
  searchRecipes: (query: string, options?: Partial<RecipeSearchParams>) => Promise<void>
  searchByIngredients: (ingredients: string[]) => Promise<void>
  getRecipeDetails: (id: string) => Promise<Recipe | null>
  clearResults: () => void
}

export function useRecipes(): UseRecipesReturn {
  const { t } = useTranslation()
  const [state, setState] = useState<UseRecipesState>({
    recipes: [],
    loading: false,
    error: null,
    hasSearched: false
  })

  const searchRecipes = async (query: string, options: Partial<RecipeSearchParams> = {}) => {
    if (!query.trim()) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await unifiedApiClient.searchRecipes(query, options)
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          recipes: response.data,
          loading: false,
          hasSearched: true
        }))
      } else {
        setState(prev => ({
          ...prev,
          recipes: [],
          loading: false,
          error: response.error || t('errors.apiError'),
          hasSearched: true
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        recipes: [],
        loading: false,
        error: error instanceof Error ? error.message : t('errors.unknownError'),
        hasSearched: true
      }))
    }
  }

  const searchByIngredients = async (ingredients: string[]) => {
    if (ingredients.length === 0) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await unifiedApiClient.searchByIngredients(ingredients)
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          recipes: response.data,
          loading: false,
          hasSearched: true
        }))
      } else {
        setState(prev => ({
          ...prev,
          recipes: [],
          loading: false,
          error: response.error || t('errors.apiError'),
          hasSearched: true
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        recipes: [],
        loading: false,
        error: error instanceof Error ? error.message : t('errors.unknownError'),
        hasSearched: true
      }))
    }
  }

  const getRecipeDetails = async (id: string): Promise<Recipe | null> => {
    try {
      const response = await unifiedApiClient.getRecipeDetails(id)
      return response.success ? response.data : null
    } catch (error) {
      console.error('레시피 상세 조회 실패:', error)
      return null
    }
  }

  const clearResults = () => {
    setState({
      recipes: [],
      loading: false,
      error: null,
      hasSearched: false
    })
  }

  return {
    ...state,
    searchRecipes,
    searchByIngredients,
    getRecipeDetails,
    clearResults
  }
}