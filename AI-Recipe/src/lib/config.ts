import type { AIServiceConfig } from '@/types'

// Environment configuration
export const config = {
  // API Configuration
  apiMode: (import.meta.env.VITE_API_MODE || 'mock') as AIServiceConfig['mode'],
  
  // Spoonacular API
  spoonacular: {
    apiKey: import.meta.env.VITE_SPOONACULAR_API_KEY,
    baseUrl: 'https://api.spoonacular.com',
    dailyLimit: 150,
  },
  
  // Edamam API
  edamam: {
    apiKey: import.meta.env.VITE_EDAMAM_API_KEY,
    appId: import.meta.env.VITE_EDAMAM_APP_ID,
    appKey: import.meta.env.VITE_EDAMAM_APP_KEY,
    baseUrl: 'https://api.edamam.com',
    monthlyLimit: 10000,
  },
  
  // AI Service
  ai: {
    mode: (import.meta.env.VITE_AI_SERVICE_MODE || 'offline') as AIServiceConfig['mode'],
    customApiKey: import.meta.env.VITE_CUSTOM_AI_API_KEY,
    customBaseUrl: import.meta.env.VITE_CUSTOM_AI_BASE_URL,
    fallbackToOffline: true,
  },

  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Application settings
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'AI Recipe Generator',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Generate delicious recipes using AI',
    defaultLanguage: (import.meta.env.VITE_DEFAULT_LANGUAGE || 'ko') as 'ko' | 'en',
  },
  
  // Development settings
  debug: import.meta.env.VITE_DEBUG_MODE === 'true',
  analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // Cache settings
  cache: {
    apiResponseTTL: 24 * 60 * 60 * 1000, // 24 hours
    offlineDataTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
    quotaResetTTL: 60 * 60 * 1000, // 1 hour
  },
  
  // Default search parameters
  defaults: {
    maxCookingTime: 60, // minutes
    maxCalories: 800,
    servings: 4,
    maxIngredients: 10,
  },
}

// Validation functions
export const isValidApiKey = (key?: string): boolean => {
  return typeof key === 'string' && key.length > 0 && !key.includes('your_')
}

export const getApiStatus = () => {
  return {
    spoonacular: isValidApiKey(config.spoonacular.apiKey),
    edamam: isValidApiKey(config.edamam.appId) && isValidApiKey(config.edamam.appKey),
    customAI: isValidApiKey(config.ai.customApiKey),
  }
}

