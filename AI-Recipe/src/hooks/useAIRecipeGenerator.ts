import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { aiService, AIRecipeRequest, AIServiceResponse } from '@/services/aiService'
import { Recipe } from '@/types'
import { storageService } from '@/services/storageService'

interface UseAIRecipeGeneratorState {
  loading: boolean
  error: string | null
  generatedRecipe: Recipe | null
  isGenerating: boolean
}

interface UseAIRecipeGeneratorReturn extends UseAIRecipeGeneratorState {
  generateRecipe: (request: AIRecipeRequest) => Promise<Recipe | null>
  clearGeneratedRecipe: () => void
  saveGeneratedRecipe: () => void
}

export function useAIRecipeGenerator(): UseAIRecipeGeneratorReturn {
  const { t } = useTranslation()
  const [state, setState] = useState<UseAIRecipeGeneratorState>({
    loading: false,
    error: null,
    generatedRecipe: null,
    isGenerating: false
  })

  const generateRecipe = async (request: AIRecipeRequest): Promise<Recipe | null> => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      isGenerating: true
    }))

    try {
      // 최소 2초간 로딩 표시 (UX 개선)
      const [response] = await Promise.all([
        aiService.generateRecipe(request),
        new Promise(resolve => setTimeout(resolve, 2000))
      ])

      if (response.success && response.data) {
        const recipe = response.data

        setState(prev => ({
          ...prev,
          loading: false,
          generatedRecipe: recipe,
          isGenerating: false,
          error: null
        }))

        // 생성 기록에 자동 추가
        storageService.addRecipeToHistory(recipe.id.toString())

        return recipe
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || t('generate.error'),
          isGenerating: false
        }))
        return null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.unknownError')
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        generatedRecipe: null,
        isGenerating: false
      }))
      
      console.error('레시피 생성 실패:', error)
      return null
    }
  }

  const clearGeneratedRecipe = () => {
    setState(prev => ({
      ...prev,
      generatedRecipe: null,
      error: null
    }))
  }

  const saveGeneratedRecipe = () => {
    if (state.generatedRecipe) {
      // 즐겨찾기에 저장
      storageService.addToFavorites(state.generatedRecipe.id.toString())
      
      // 성공 알림은 호출하는 컴포넌트에서 처리
    }
  }

  return {
    ...state,
    generateRecipe,
    clearGeneratedRecipe,
    saveGeneratedRecipe
  }
}