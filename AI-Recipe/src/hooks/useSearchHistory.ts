import { useState, useEffect } from 'react'
import { storageService, SearchHistory } from '@/services/storageService'

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])

  useEffect(() => {
    setSearchHistory(storageService.getRecentSearches())
  }, [])

  const addToHistory = (query: string, resultCount: number) => {
    storageService.addSearchToHistory(query, resultCount)
    setSearchHistory(storageService.getRecentSearches())
  }

  const clearHistory = () => {
    storageService.clearSearchHistory()
    setSearchHistory([])
  }

  const getPopularSearches = (limit: number = 5) => {
    const searches = storageService.getRecentSearches()
    const searchCounts = searches.reduce((acc, search) => {
      acc[search.query] = (acc[search.query] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(searchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([query]) => query)
  }

  const getRecentUniqueSearches = (limit: number = 10) => {
    const seen = new Set<string>()
    return searchHistory
      .filter(search => {
        if (seen.has(search.query)) {
          return false
        }
        seen.add(search.query)
        return true
      })
      .slice(0, limit)
  }

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    getPopularSearches,
    getRecentUniqueSearches
  }
}