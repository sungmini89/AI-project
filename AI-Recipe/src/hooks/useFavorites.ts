import { useState, useEffect } from 'react'
import { storageService } from '@/services/storageService'
import { useRecipes } from './useRecipes'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const { getRecipeDetails } = useRecipes()

  useEffect(() => {
    setFavorites(storageService.getFavorites())
  }, [])

  const addToFavorites = (recipeId: string) => {
    storageService.addToFavorites(recipeId)
    setFavorites(storageService.getFavorites())
  }

  const removeFromFavorites = (recipeId: string) => {
    storageService.removeFromFavorites(recipeId)
    setFavorites(storageService.getFavorites())
  }

  const toggleFavorite = (recipeId: string) => {
    if (storageService.isFavorite(recipeId)) {
      removeFromFavorites(recipeId)
    } else {
      addToFavorites(recipeId)
    }
  }

  const isFavorite = (recipeId: string) => {
    return favorites.includes(recipeId)
  }

  const getFavoriteRecipes = async () => {
    const favoriteIds = storageService.getFavorites()
    const recipes = await Promise.all(
      favoriteIds.map(async id => {
        const recipe = await getRecipeDetails(id)
        return recipe
      })
    )
    return recipes.filter(recipe => recipe !== null)
  }

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoriteRecipes,
    favoriteCount: favorites.length
  }
}