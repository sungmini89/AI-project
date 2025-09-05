/**
 * Storage Hook for OCR Cost Split Calculator
 * React integration for IndexedDB storage with offline-first capabilities
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  StoredCalculation,
  StoredTemplate,
  StoredSettings,
  CalculationQuery,
  TemplateQuery,
  StorageStats,
  ExportData,
  ImportOptions,
  StorageEventType,
  StorageEvent,
  StorageError
} from '../types/storage'
import { BillData, SplitResult } from '../types/calculator'
import { ImageFile } from '../types/image'
import { storageService } from '../services/storageService'

// Hook for general storage operations
interface UseStorageOptions {
  autoLoad?: boolean
  enableEvents?: boolean
}

interface UseStorageReturn {
  // Calculation operations
  saveCalculation: (
    billData: BillData,
    splitResult: SplitResult,
    images: ImageFile[],
    metadata: {
      name: string
      description?: string
      tags?: string[]
      isStarred?: boolean
    }
  ) => Promise<string>
  getCalculation: (id: string) => Promise<StoredCalculation | null>
  updateCalculation: (id: string, updates: Partial<StoredCalculation>) => Promise<void>
  deleteCalculation: (id: string) => Promise<void>
  queryCalculations: (query?: CalculationQuery) => Promise<StoredCalculation[]>

  // Template operations
  saveTemplate: (template: Omit<StoredTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  getTemplate: (id: string) => Promise<StoredTemplate | null>
  updateTemplate: (id: string, updates: Partial<StoredTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  queryTemplates: (query?: TemplateQuery) => Promise<StoredTemplate[]>

  // Settings
  getSettings: () => Promise<StoredSettings>
  updateSettings: (updates: Partial<StoredSettings>) => Promise<void>

  // Analytics
  getStorageStats: () => Promise<StorageStats>
  cleanup: (options?: any) => Promise<void>

  // Export/Import
  exportData: (options?: any) => Promise<ExportData>
  importData: (data: ExportData, options: ImportOptions) => Promise<void>

  // State
  isOnline: boolean
  error: string | null
  isLoading: boolean
}

export const useStorage = (options: UseStorageOptions = {}): UseStorageReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const eventListenersRef = useRef<Map<StorageEventType, (event: StorageEvent) => void>>(new Map())

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Setup storage event listeners
  useEffect(() => {
    if (!options.enableEvents) return

    const handleStorageError = (event: StorageEvent) => {
      if (event.data?.error) {
        setError(`Storage error: ${event.data.error}`)
      }
    }

    storageService.addEventListener('storage_quota_warning', handleStorageError)
    
    return () => {
      storageService.removeEventListener('storage_quota_warning', handleStorageError)
    }
  }, [options.enableEvents])

  // Wrapper function for async operations with error handling
  const withErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    loadingState = true
  ): Promise<T> => {
    try {
      if (loadingState) setIsLoading(true)
      setError(null)
      
      const result = await operation()
      return result
    } catch (err) {
      const errorMessage = err instanceof StorageError ? 
        err.message : 
        `Storage operation failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      
      setError(errorMessage)
      throw err
    } finally {
      if (loadingState) setIsLoading(false)
    }
  }, [])

  // Calculation operations
  const saveCalculation = useCallback(async (
    billData: BillData,
    splitResult: SplitResult,
    images: ImageFile[],
    metadata: {
      name: string
      description?: string
      tags?: string[]
      isStarred?: boolean
    }
  ): Promise<string> => {
    return withErrorHandling(() => 
      storageService.saveCalculation(billData, splitResult, images, metadata)
    )
  }, [withErrorHandling])

  const getCalculation = useCallback(async (id: string): Promise<StoredCalculation | null> => {
    return withErrorHandling(() => storageService.getCalculation(id), false)
  }, [withErrorHandling])

  const updateCalculation = useCallback(async (
    id: string, 
    updates: Partial<StoredCalculation>
  ): Promise<void> => {
    return withErrorHandling(() => storageService.updateCalculation(id, updates))
  }, [withErrorHandling])

  const deleteCalculation = useCallback(async (id: string): Promise<void> => {
    return withErrorHandling(() => storageService.deleteCalculation(id))
  }, [withErrorHandling])

  const queryCalculations = useCallback(async (query?: CalculationQuery): Promise<StoredCalculation[]> => {
    return withErrorHandling(() => storageService.queryCalculations(query), false)
  }, [withErrorHandling])

  // Template operations
  const saveTemplate = useCallback(async (
    template: Omit<StoredTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    return withErrorHandling(() => storageService.saveTemplate(template))
  }, [withErrorHandling])

  const getTemplate = useCallback(async (id: string): Promise<StoredTemplate | null> => {
    return withErrorHandling(() => storageService.getTemplate(id), false)
  }, [withErrorHandling])

  const updateTemplate = useCallback(async (
    id: string, 
    updates: Partial<StoredTemplate>
  ): Promise<void> => {
    return withErrorHandling(() => storageService.updateTemplate(id, updates))
  }, [withErrorHandling])

  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    return withErrorHandling(() => storageService.deleteTemplate(id))
  }, [withErrorHandling])

  const queryTemplates = useCallback(async (query?: TemplateQuery): Promise<StoredTemplate[]> => {
    return withErrorHandling(() => storageService.queryTemplates(query), false)
  }, [withErrorHandling])

  // Settings operations
  const getSettings = useCallback(async (): Promise<StoredSettings> => {
    return withErrorHandling(() => storageService.getSettings(), false)
  }, [withErrorHandling])

  const updateSettings = useCallback(async (updates: Partial<StoredSettings>): Promise<void> => {
    return withErrorHandling(() => storageService.updateSettings(updates))
  }, [withErrorHandling])

  // Analytics operations
  const getStorageStats = useCallback(async (): Promise<StorageStats> => {
    return withErrorHandling(() => storageService.getStorageStats(), false)
  }, [withErrorHandling])

  const cleanup = useCallback(async (options?: any): Promise<void> => {
    return withErrorHandling(() => storageService.cleanup(options))
  }, [withErrorHandling])

  // Export/Import operations
  const exportData = useCallback(async (options?: any): Promise<ExportData> => {
    return withErrorHandling(() => storageService.exportData(options))
  }, [withErrorHandling])

  const importData = useCallback(async (data: ExportData, options: ImportOptions): Promise<void> => {
    return withErrorHandling(() => storageService.importData(data, options))
  }, [withErrorHandling])

  return {
    // Calculation operations
    saveCalculation,
    getCalculation,
    updateCalculation,
    deleteCalculation,
    queryCalculations,

    // Template operations
    saveTemplate,
    getTemplate,
    updateTemplate,
    deleteTemplate,
    queryTemplates,

    // Settings
    getSettings,
    updateSettings,

    // Analytics
    getStorageStats,
    cleanup,

    // Export/Import
    exportData,
    importData,

    // State
    isOnline,
    error,
    isLoading
  }
}

// Hook for calculations with caching and auto-refresh
interface UseCalculationsOptions {
  query?: CalculationQuery
  autoRefresh?: boolean
  cacheTime?: number // milliseconds
}

interface UseCalculationsReturn {
  calculations: StoredCalculation[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  createCalculation: (
    billData: BillData,
    splitResult: SplitResult,
    images: ImageFile[],
    metadata: { name: string; description?: string; tags?: string[]; isStarred?: boolean }
  ) => Promise<string>
  updateCalculation: (id: string, updates: Partial<StoredCalculation>) => Promise<void>
  deleteCalculation: (id: string) => Promise<void>
  starCalculation: (id: string, starred: boolean) => Promise<void>
  tagCalculation: (id: string, tags: string[]) => Promise<void>
}

export const useCalculations = (options: UseCalculationsOptions = {}): UseCalculationsReturn => {
  const [calculations, setCalculations] = useState<StoredCalculation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastFetchRef = useRef<number>(0)
  const storage = useStorage({ enableEvents: true })

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const results = await storage.queryCalculations(options.query)
      setCalculations(results)
      lastFetchRef.current = Date.now()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calculations')
    } finally {
      setIsLoading(false)
    }
  }, [storage, options.query])

  // Initial load and auto-refresh
  useEffect(() => {
    const shouldRefresh = options.cacheTime ? 
      (Date.now() - lastFetchRef.current > options.cacheTime) : 
      true

    if (shouldRefresh) {
      refresh()
    }
  }, [refresh, options.cacheTime])

  // Auto-refresh on storage events
  useEffect(() => {
    if (!options.autoRefresh) return

    const handleStorageEvent = (event: StorageEvent) => {
      if (['calculation_created', 'calculation_updated', 'calculation_deleted'].includes(event.type)) {
        refresh()
      }
    }

    const eventTypes: StorageEventType[] = ['calculation_created', 'calculation_updated', 'calculation_deleted']
    eventTypes.forEach(type => {
      storageService.addEventListener(type, handleStorageEvent)
    })

    return () => {
      eventTypes.forEach(type => {
        storageService.removeEventListener(type, handleStorageEvent)
      })
    }
  }, [options.autoRefresh, refresh])

  const createCalculation = useCallback(async (
    billData: BillData,
    splitResult: SplitResult,
    images: ImageFile[],
    metadata: { name: string; description?: string; tags?: string[]; isStarred?: boolean }
  ): Promise<string> => {
    const id = await storage.saveCalculation(billData, splitResult, images, metadata)
    if (options.autoRefresh) {
      await refresh()
    }
    return id
  }, [storage, options.autoRefresh, refresh])

  const updateCalculation = useCallback(async (
    id: string, 
    updates: Partial<StoredCalculation>
  ): Promise<void> => {
    await storage.updateCalculation(id, updates)
    if (options.autoRefresh) {
      await refresh()
    }
  }, [storage, options.autoRefresh, refresh])

  const deleteCalculation = useCallback(async (id: string): Promise<void> => {
    await storage.deleteCalculation(id)
    if (options.autoRefresh) {
      await refresh()
    }
  }, [storage, options.autoRefresh, refresh])

  const starCalculation = useCallback(async (id: string, starred: boolean): Promise<void> => {
    await updateCalculation(id, { isStarred: starred })
  }, [updateCalculation])

  const tagCalculation = useCallback(async (id: string, tags: string[]): Promise<void> => {
    await updateCalculation(id, { tags })
  }, [updateCalculation])

  return {
    calculations,
    isLoading,
    error,
    refresh,
    createCalculation,
    updateCalculation,
    deleteCalculation,
    starCalculation,
    tagCalculation
  }
}

// Hook for templates with similar functionality
interface UseTemplatesOptions {
  query?: TemplateQuery
  autoRefresh?: boolean
}

interface UseTemplatesReturn {
  templates: StoredTemplate[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  createTemplate: (template: Omit<StoredTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateTemplate: (id: string, updates: Partial<StoredTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  useTemplate: (id: string) => Promise<void> // Increment usage count
}

export const useTemplates = (options: UseTemplatesOptions = {}): UseTemplatesReturn => {
  const [templates, setTemplates] = useState<StoredTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const storage = useStorage({ enableEvents: true })

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const results = await storage.queryTemplates(options.query)
      setTemplates(results)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      setIsLoading(false)
    }
  }, [storage, options.query])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!options.autoRefresh) return

    const handleStorageEvent = (event: StorageEvent) => {
      if (['template_created', 'template_updated', 'template_deleted'].includes(event.type)) {
        refresh()
      }
    }

    const eventTypes: StorageEventType[] = ['template_created', 'template_updated', 'template_deleted']
    eventTypes.forEach(type => {
      storageService.addEventListener(type, handleStorageEvent)
    })

    return () => {
      eventTypes.forEach(type => {
        storageService.removeEventListener(type, handleStorageEvent)
      })
    }
  }, [options.autoRefresh, refresh])

  const createTemplate = useCallback(async (
    template: Omit<StoredTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const id = await storage.saveTemplate(template)
    if (options.autoRefresh) {
      await refresh()
    }
    return id
  }, [storage, options.autoRefresh, refresh])

  const updateTemplate = useCallback(async (
    id: string, 
    updates: Partial<StoredTemplate>
  ): Promise<void> => {
    await storage.updateTemplate(id, updates)
    if (options.autoRefresh) {
      await refresh()
    }
  }, [storage, options.autoRefresh, refresh])

  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    await storage.deleteTemplate(id)
    if (options.autoRefresh) {
      await refresh()
    }
  }, [storage, options.autoRefresh, refresh])

  const useTemplate = useCallback(async (id: string): Promise<void> => {
    const template = await storage.getTemplate(id)
    if (template) {
      await updateTemplate(id, {
        usageCount: template.usageCount + 1,
        lastUsed: Date.now()
      })
    }
  }, [storage, updateTemplate])

  return {
    templates,
    isLoading,
    error,
    refresh,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate
  }
}

// Hook for application settings
interface UseSettingsReturn {
  settings: StoredSettings | null
  isLoading: boolean
  error: string | null
  updateSettings: (updates: Partial<StoredSettings>) => Promise<void>
  resetSettings: () => Promise<void>
}

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<StoredSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const storage = useStorage({ enableEvents: true })

  const loadSettings = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await storage.getSettings()
      setSettings(result)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }, [storage])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  useEffect(() => {
    const handleSettingsUpdate = (event: StorageEvent) => {
      loadSettings()
    }

    storageService.addEventListener('settings_updated', handleSettingsUpdate)

    return () => {
      storageService.removeEventListener('settings_updated', handleSettingsUpdate)
    }
  }, [loadSettings])

  const updateSettings = useCallback(async (updates: Partial<StoredSettings>): Promise<void> => {
    await storage.updateSettings(updates)
    // Settings will be reloaded via event listener
  }, [storage])

  const resetSettings = useCallback(async (): Promise<void> => {
    const { DEFAULT_SETTINGS } = await import('../types/storage')
    await storage.updateSettings(DEFAULT_SETTINGS)
  }, [storage])

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings
  }
}