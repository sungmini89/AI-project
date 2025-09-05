/**
 * IndexedDB Storage Service for OCR Cost Split Calculator
 * Complete offline-first storage system with advanced features
 */

import {
  StoredCalculation,
  StoredImage,
  StoredTemplate,
  StoredSettings,
  DatabaseRecords,
  DatabaseSchema,
  DatabaseStore,
  DATABASE_CONFIG,
  CalculationQuery,
  TemplateQuery,
  StorageStats,
  ExportData,
  ImportOptions,
  DEFAULT_SETTINGS,
  StorageError,
  StorageEventType,
  StorageEvent
} from '../types/storage'
import { BillData, SplitResult } from '../types/calculator'
import { ImageFile } from '../types/image'

class StorageService {
  private db: IDBDatabase | null = null
  private eventListeners: Map<StorageEventType, ((event: StorageEvent) => void)[]> = new Map()
  private initPromise: Promise<void> | null = null

  constructor() {
    this.initPromise = this.init()
  }

  // Database initialization and management
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_CONFIG.name, DATABASE_CONFIG.version)

      request.onerror = () => {
        reject(new StorageError('Failed to open database', 'DB_ERROR', request.error))
      }

      request.onsuccess = () => {
        this.db = request.result
        this.setupErrorHandlers()
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        this.createSchema(db, event.oldVersion)
      }
    })
  }

  private createSchema(db: IDBDatabase, oldVersion: number): void {
    // Create object stores and indexes based on schema
    Object.entries(DATABASE_CONFIG.stores).forEach(([storeName, config]) => {
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: config.keyPath })
        
        // Create indexes
        config.indexes?.forEach(index => {
          store.createIndex(index.name, index.keyPath, { 
            multiEntry: index.multiEntry || false 
          })
        })
      }
    })

    // Initialize default settings if this is a fresh install
    if (oldVersion === 0) {
      const transaction = db.transaction(['settings'], 'readwrite')
      const store = transaction.objectStore('settings')
      store.add(DEFAULT_SETTINGS)
    }
  }

  private setupErrorHandlers(): void {
    if (!this.db) return

    this.db.onerror = (event) => {
      console.error('Database error:', event)
      this.emitEvent('storage_quota_warning', { error: event })
    }

    this.db.onclose = () => {
      console.warn('Database connection closed')
      this.db = null
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.db) {
      await this.initPromise
    }
    if (!this.db) {
      throw new StorageError('Database not initialized', 'DB_ERROR')
    }
  }

  // Calculation CRUD operations
  async saveCalculation(
    billData: BillData, 
    splitResult: SplitResult, 
    images: ImageFile[] = [],
    metadata: {
      name: string
      description?: string
      tags?: string[]
      isStarred?: boolean
    }
  ): Promise<string> {
    await this.ensureConnected()

    const calculationId = this.generateId()
    const now = Date.now()

    try {
      const transaction = this.db!.transaction(['calculations', 'images'], 'readwrite')
      
      // Save calculation
      const calculation: StoredCalculation = {
        id: calculationId,
        name: metadata.name,
        description: metadata.description,
        billData,
        splitResult,
        images: [],
        createdAt: now,
        updatedAt: now,
        tags: metadata.tags || [],
        isStarred: metadata.isStarred || false,
        version: 1
      }

      await this.putObject(transaction.objectStore('calculations'), calculation)

      // Save images
      const storedImages: StoredImage[] = []
      for (const image of images) {
        const storedImage: StoredImage = {
          id: image.id,
          calculationId,
          name: image.name,
          size: image.size,
          type: image.type,
          blob: image.file,
          dimensions: {
            width: image.dimensions.width,
            height: image.dimensions.height
          },
          metadata: {
            originalSize: image.metadata?.originalSize || image.size,
            compressed: image.metadata?.compressedSize !== undefined,
            enhanced: false
          },
          createdAt: now
        }

        await this.putObject(transaction.objectStore('images'), storedImage)
        storedImages.push(storedImage)
      }

      // Update calculation with image references
      calculation.images = storedImages
      await this.putObject(transaction.objectStore('calculations'), calculation)

      await this.commitTransaction(transaction)

      this.emitEvent('calculation_created', { id: calculationId, name: metadata.name })
      return calculationId

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to save calculation')
    }
  }

  async getCalculation(id: string): Promise<StoredCalculation | null> {
    await this.ensureConnected()

    try {
      const transaction = this.db!.transaction(['calculations'], 'readonly')
      const store = transaction.objectStore('calculations')
      
      const calculation = await this.getObject<StoredCalculation>(store, id)
      return calculation || null

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to get calculation')
    }
  }

  async updateCalculation(
    id: string, 
    updates: Partial<Omit<StoredCalculation, 'id' | 'createdAt' | 'version'>>
  ): Promise<void> {
    await this.ensureConnected()

    try {
      const transaction = this.db!.transaction(['calculations'], 'readwrite')
      const store = transaction.objectStore('calculations')
      
      const existing = await this.getObject<StoredCalculation>(store, id)
      if (!existing) {
        throw new StorageError('Calculation not found', 'NOT_FOUND')
      }

      const updated: StoredCalculation = {
        ...existing,
        ...updates,
        id,
        createdAt: existing.createdAt,
        updatedAt: Date.now(),
        version: existing.version + 1
      }

      await this.putObject(store, updated)
      await this.commitTransaction(transaction)

      this.emitEvent('calculation_updated', { id, updates })

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to update calculation')
    }
  }

  async deleteCalculation(id: string): Promise<void> {
    await this.ensureConnected()

    try {
      const transaction = this.db!.transaction(['calculations', 'images'], 'readwrite')
      
      // Delete calculation
      const calculationStore = transaction.objectStore('calculations')
      await this.deleteObject(calculationStore, id)

      // Delete associated images
      const imageStore = transaction.objectStore('images')
      const imageIndex = imageStore.index('calculationId')
      const imageRequest = imageIndex.openCursor(id)
      
      await new Promise<void>((resolve, reject) => {
        imageRequest.onsuccess = async (event) => {
          const cursor = (event.target as IDBRequest).result
          if (cursor) {
            await this.deleteObject(imageStore, cursor.primaryKey)
            cursor.continue()
          } else {
            resolve()
          }
        }
        imageRequest.onerror = () => reject(imageRequest.error)
      })

      await this.commitTransaction(transaction)

      this.emitEvent('calculation_deleted', { id })

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to delete calculation')
    }
  }

  async queryCalculations(query: CalculationQuery = {}): Promise<StoredCalculation[]> {
    await this.ensureConnected()

    try {
      const transaction = this.db!.transaction(['calculations'], 'readonly')
      const store = transaction.objectStore('calculations')
      
      let request: IDBRequest
      
      // Use appropriate index for sorting
      if (query.sortBy === 'createdAt') {
        request = store.index('createdAt').openCursor(null, query.sortOrder === 'desc' ? 'prev' : 'next')
      } else if (query.sortBy === 'updatedAt') {
        request = store.index('updatedAt').openCursor(null, query.sortOrder === 'desc' ? 'prev' : 'next')
      } else {
        request = store.openCursor()
      }

      const results: StoredCalculation[] = []
      let skipCount = query.offset || 0
      let returnCount = 0
      const limit = query.limit || Infinity

      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result
          if (cursor && returnCount < limit) {
            const calculation = cursor.value as StoredCalculation
            
            // Apply filters
            if (this.matchesCalculationQuery(calculation, query)) {
              if (skipCount > 0) {
                skipCount--
              } else {
                results.push(calculation)
                returnCount++
              }
            }
            
            cursor.continue()
          } else {
            resolve(results)
          }
        }
        
        request.onerror = () => reject(request.error)
      })

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to query calculations')
    }
  }

  // Template CRUD operations
  async saveTemplate(template: Omit<StoredTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await this.ensureConnected()

    const templateId = this.generateId()
    const now = Date.now()

    const storedTemplate: StoredTemplate = {
      ...template,
      id: templateId,
      createdAt: now,
      updatedAt: now
    }

    try {
      const transaction = this.db!.transaction(['templates'], 'readwrite')
      const store = transaction.objectStore('templates')
      
      await this.putObject(store, storedTemplate)
      await this.commitTransaction(transaction)

      this.emitEvent('template_created', { id: templateId, name: template.name })
      return templateId

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to save template')
    }
  }

  async getTemplate(id: string): Promise<StoredTemplate | null> {
    await this.ensureConnected()

    try {
      const transaction = this.db!.transaction(['templates'], 'readonly')
      const store = transaction.objectStore('templates')
      
      const template = await this.getObject<StoredTemplate>(store, id)
      return template || null

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to get template')
    }
  }

  async updateTemplate(
    id: string, 
    updates: Partial<Omit<StoredTemplate, 'id' | 'createdAt'>>
  ): Promise<void> {
    await this.ensureConnected()

    try {
      const transaction = this.db!.transaction(['templates'], 'readwrite')
      const store = transaction.objectStore('templates')
      
      const existing = await this.getObject<StoredTemplate>(store, id)
      if (!existing) {
        throw new StorageError('Template not found', 'NOT_FOUND')
      }

      const updated: StoredTemplate = {
        ...existing,
        ...updates,
        id,
        createdAt: existing.createdAt,
        updatedAt: Date.now()
      }

      await this.putObject(store, updated)
      await this.commitTransaction(transaction)

      this.emitEvent('template_updated', { id, updates })

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to update template')
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.ensureConnected()

    try {
      const transaction = this.db!.transaction(['templates'], 'readwrite')
      const store = transaction.objectStore('templates')
      
      await this.deleteObject(store, id)
      await this.commitTransaction(transaction)

      this.emitEvent('template_deleted', { id })

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to delete template')
    }
  }

  async queryTemplates(query: TemplateQuery = {}): Promise<StoredTemplate[]> {
    await this.ensureConnected()

    try {
      const transaction = this.db!.transaction(['templates'], 'readonly')
      const store = transaction.objectStore('templates')
      
      let request: IDBRequest
      
      if (query.sortBy === 'lastUsed') {
        request = store.index('lastUsed').openCursor(null, query.sortOrder === 'desc' ? 'prev' : 'next')
      } else if (query.sortBy === 'usageCount') {
        request = store.index('usageCount').openCursor(null, query.sortOrder === 'desc' ? 'prev' : 'next')
      } else {
        request = store.openCursor()
      }

      const results: StoredTemplate[] = []
      let skipCount = query.offset || 0
      let returnCount = 0
      const limit = query.limit || Infinity

      return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result
          if (cursor && returnCount < limit) {
            const template = cursor.value as StoredTemplate
            
            if (this.matchesTemplateQuery(template, query)) {
              if (skipCount > 0) {
                skipCount--
              } else {
                results.push(template)
                returnCount++
              }
            }
            
            cursor.continue()
          } else {
            resolve(results)
          }
        }
        
        request.onerror = () => reject(request.error)
      })

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to query templates')
    }
  }

  // Settings management
  async getSettings(): Promise<StoredSettings> {
    await this.ensureConnected()

    try {
      const transaction = this.db!.transaction(['settings'], 'readonly')
      const store = transaction.objectStore('settings')
      
      const settings = await this.getObject<StoredSettings>(store, 'app_settings')
      return settings || DEFAULT_SETTINGS

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to get settings')
    }
  }

  async updateSettings(
    updates: Partial<Omit<StoredSettings, 'id' | 'createdAt' | 'version'>>
  ): Promise<void> {
    await this.ensureConnected()

    try {
      const transaction = this.db!.transaction(['settings'], 'readwrite')
      const store = transaction.objectStore('settings')
      
      const existing = await this.getObject<StoredSettings>(store, 'app_settings')
      const current = existing || DEFAULT_SETTINGS

      const updated: StoredSettings = {
        ...current,
        ...updates,
        id: 'app_settings',
        createdAt: current.createdAt,
        updatedAt: Date.now(),
        version: current.version + 1
      }

      await this.putObject(store, updated)
      await this.commitTransaction(transaction)

      this.emitEvent('settings_updated', { updates })

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to update settings')
    }
  }

  // Storage analytics and cleanup
  async getStorageStats(): Promise<StorageStats> {
    await this.ensureConnected()

    try {
      const transaction = this.db!.transaction(['calculations', 'images', 'templates'], 'readonly')
      
      // Get calculations count and analyze
      const calculations = await this.getAllFromStore<StoredCalculation>(
        transaction.objectStore('calculations')
      )
      
      const images = await this.getAllFromStore<StoredImage>(
        transaction.objectStore('images')
      )
      
      const templates = await this.getAllFromStore<StoredTemplate>(
        transaction.objectStore('templates')
      )

      // Calculate statistics
      const oldestCalc = calculations.length > 0 ? Math.min(...calculations.map(c => c.createdAt)) : undefined
      const newestCalc = calculations.length > 0 ? Math.max(...calculations.map(c => c.createdAt)) : undefined
      
      const tagUsage: Record<string, number> = {}
      const splitMethodUsage: Record<string, number> = {}
      
      calculations.forEach(calc => {
        calc.tags.forEach(tag => {
          tagUsage[tag] = (tagUsage[tag] || 0) + 1
        })
        const method = calc.splitResult.method
        splitMethodUsage[method] = (splitMethodUsage[method] || 0) + 1
      })

      const mostUsedTemplate = templates
        .sort((a, b) => b.usageCount - a.usageCount)[0]?.id

      const daysSinceOldest = oldestCalc ? 
        (Date.now() - oldestCalc) / (1000 * 60 * 60 * 24) : 0
      const averageCalculationsPerDay = daysSinceOldest > 0 ? 
        calculations.length / daysSinceOldest : 0

      const totalSize = images.reduce((sum, img) => sum + img.size, 0)

      return {
        totalCalculations: calculations.length,
        totalImages: images.length,
        totalTemplates: templates.length,
        totalSize,
        oldestCalculation: oldestCalc,
        newestCalculation: newestCalc,
        mostUsedTemplate,
        averageCalculationsPerDay,
        tagUsage,
        splitMethodUsage
      }

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to get storage stats')
    }
  }

  async cleanup(options: {
    deleteOlderThan?: number // days
    maxCalculations?: number
    removeOrphaned?: boolean
  } = {}): Promise<void> {
    await this.ensureConnected()

    try {
      const settings = await this.getSettings()
      const cutoffDate = options.deleteOlderThan ? 
        Date.now() - (options.deleteOlderThan * 24 * 60 * 60 * 1000) :
        Date.now() - (settings.storage.autoDeleteAfterDays * 24 * 60 * 60 * 1000)

      const transaction = this.db!.transaction(['calculations', 'images'], 'readwrite')
      const calcStore = transaction.objectStore('calculations')
      const imageStore = transaction.objectStore('images')

      // Get calculations to delete
      const oldCalculations = await this.queryCalculations({
        dateRange: { start: 0, end: cutoffDate },
        limit: 1000
      })

      // Delete old calculations and their images
      for (const calc of oldCalculations) {
        await this.deleteCalculation(calc.id)
      }

      // Handle max calculations limit
      if (options.maxCalculations) {
        const allCalculations = await this.queryCalculations({
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })

        if (allCalculations.length > options.maxCalculations) {
          const toDelete = allCalculations.slice(options.maxCalculations)
          for (const calc of toDelete) {
            await this.deleteCalculation(calc.id)
          }
        }
      }

      // Remove orphaned images
      if (options.removeOrphaned) {
        const allImages = await this.getAllFromStore<StoredImage>(imageStore)
        const allCalculations = await this.getAllFromStore<StoredCalculation>(calcStore)
        const validCalculationIds = new Set(allCalculations.map(c => c.id))

        for (const image of allImages) {
          if (!validCalculationIds.has(image.calculationId)) {
            await this.deleteObject(imageStore, image.id)
          }
        }
      }

      await this.commitTransaction(transaction)

      this.emitEvent('storage_cleanup', { 
        deletedCalculations: oldCalculations.length,
        cleanupDate: Date.now()
      })

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to cleanup storage')
    }
  }

  // Export/Import functionality
  async exportData(options: {
    includeImages?: boolean
    dateRange?: { start: number; end: number }
  } = {}): Promise<ExportData> {
    await this.ensureConnected()

    try {
      const calculations = await this.queryCalculations(
        options.dateRange ? { dateRange: options.dateRange } : {}
      )
      
      let images: StoredImage[] = []
      if (options.includeImages) {
        const transaction = this.db!.transaction(['images'], 'readonly')
        images = await this.getAllFromStore<StoredImage>(
          transaction.objectStore('images')
        )
      }

      const templates = await this.queryTemplates()
      const settings = await this.getSettings()

      const totalSize = images.reduce((sum, img) => sum + img.size, 0)
      const dateRange = calculations.length > 0 ? {
        start: Math.min(...calculations.map(c => c.createdAt)),
        end: Math.max(...calculations.map(c => c.updatedAt))
      } : { start: Date.now(), end: Date.now() }

      return {
        calculations,
        images,
        templates,
        settings,
        exportedAt: Date.now(),
        version: DATABASE_CONFIG.version,
        metadata: {
          totalCalculations: calculations.length,
          totalImages: images.length,
          totalSize,
          dateRange
        }
      }

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to export data')
    }
  }

  async importData(data: ExportData, options: ImportOptions): Promise<void> {
    await this.ensureConnected()

    try {
      const transaction = this.db!.transaction(
        ['calculations', 'images', 'templates', 'settings'], 
        'readwrite'
      )

      // Import calculations
      if (options.importCalculations) {
        const calcStore = transaction.objectStore('calculations')
        for (const calc of data.calculations) {
          if (options.overwriteExisting) {
            await this.putObject(calcStore, calc)
          } else {
            try {
              await this.addObject(calcStore, calc)
            } catch {
              // Skip if exists
            }
          }
        }
      }

      // Import images
      if (options.importImages) {
        const imageStore = transaction.objectStore('images')
        for (const image of data.images) {
          if (options.overwriteExisting) {
            await this.putObject(imageStore, image)
          } else {
            try {
              await this.addObject(imageStore, image)
            } catch {
              // Skip if exists
            }
          }
        }
      }

      // Import templates
      if (options.importTemplates) {
        const templateStore = transaction.objectStore('templates')
        for (const template of data.templates) {
          if (options.overwriteExisting) {
            await this.putObject(templateStore, template)
          } else {
            try {
              await this.addObject(templateStore, template)
            } catch {
              // Skip if exists
            }
          }
        }
      }

      // Import settings
      if (options.importSettings) {
        const settingsStore = transaction.objectStore('settings')
        await this.putObject(settingsStore, data.settings)
      }

      await this.commitTransaction(transaction)

    } catch (error) {
      throw this.handleStorageError(error, 'Failed to import data')
    }
  }

  // Event system
  addEventListener(type: StorageEventType, listener: (event: StorageEvent) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, [])
    }
    this.eventListeners.get(type)!.push(listener)
  }

  removeEventListener(type: StorageEventType, listener: (event: StorageEvent) => void): void {
    const listeners = this.eventListeners.get(type)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emitEvent(type: StorageEventType, data: any): void {
    const listeners = this.eventListeners.get(type)
    if (listeners) {
      const event: StorageEvent = {
        type,
        data,
        timestamp: Date.now()
      }
      listeners.forEach(listener => listener(event))
    }
  }

  // Private utility methods
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async getObject<T>(store: IDBObjectStore, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  private async putObject(store: IDBObjectStore, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.put(value)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async addObject(store: IDBObjectStore, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.add(value)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async deleteObject(store: IDBObjectStore, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  private async getAllFromStore<T>(store: IDBObjectStore): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  private async commitTransaction(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  private matchesCalculationQuery(calculation: StoredCalculation, query: CalculationQuery): boolean {
    if (query.isStarred !== undefined && calculation.isStarred !== query.isStarred) {
      return false
    }

    if (query.tags && query.tags.length > 0) {
      const hasMatchingTag = query.tags.some(tag => calculation.tags.includes(tag))
      if (!hasMatchingTag) return false
    }

    if (query.dateRange) {
      const { start, end } = query.dateRange
      if (calculation.createdAt < start || calculation.createdAt > end) {
        return false
      }
    }

    if (query.searchText) {
      const searchLower = query.searchText.toLowerCase()
      const nameMatch = calculation.name.toLowerCase().includes(searchLower)
      const descMatch = calculation.description?.toLowerCase().includes(searchLower)
      const tagMatch = calculation.tags.some(tag => tag.toLowerCase().includes(searchLower))
      
      if (!nameMatch && !descMatch && !tagMatch) {
        return false
      }
    }

    return true
  }

  private matchesTemplateQuery(template: StoredTemplate, query: TemplateQuery): boolean {
    if (query.splitMethod && template.splitMethod !== query.splitMethod) {
      return false
    }

    if (query.tags && query.tags.length > 0) {
      const hasMatchingTag = query.tags.some(tag => template.tags.includes(tag))
      if (!hasMatchingTag) return false
    }

    if (query.searchText) {
      const searchLower = query.searchText.toLowerCase()
      const nameMatch = template.name.toLowerCase().includes(searchLower)
      const descMatch = template.description?.toLowerCase().includes(searchLower)
      const tagMatch = template.tags.some(tag => tag.toLowerCase().includes(searchLower))
      
      if (!nameMatch && !descMatch && !tagMatch) {
        return false
      }
    }

    return true
  }

  private handleStorageError(error: any, message: string): StorageError {
    if (error.name === 'QuotaExceededError') {
      return new StorageError(
        `${message}: Storage quota exceeded`,
        'QUOTA_EXCEEDED',
        error
      )
    }

    if (error instanceof StorageError) {
      return error
    }

    return new StorageError(message, 'DB_ERROR', error)
  }

  // Cleanup and disposal
  async dispose(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
    this.eventListeners.clear()
  }
}

// Export singleton instance
export const storageService = new StorageService()
export default storageService