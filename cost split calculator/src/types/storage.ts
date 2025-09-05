/**
 * Storage Types for OCR Cost Split Calculator
 * IndexedDB-based storage system with offline-first architecture
 */

import { BillData, SplitResult, Participant } from './calculator'
import { ImageFile } from './image'

// Core storage entities
export interface StoredCalculation {
  id: string
  name: string
  description?: string
  billData: BillData
  splitResult: SplitResult
  images: StoredImage[]
  createdAt: number
  updatedAt: number
  tags: string[]
  isStarred: boolean
  version: number
}

export interface StoredImage {
  id: string
  calculationId: string
  name: string
  size: number
  type: string
  blob: Blob
  dimensions: {
    width: number
    height: number
  }
  metadata?: {
    originalSize: number
    compressed: boolean
    enhanced: boolean
  }
  createdAt: number
}

export interface StoredTemplate {
  id: string
  name: string
  description?: string
  participants: Participant[]
  splitMethod: 'equal' | 'itemBased' | 'percentage' | 'custom'
  defaultSettings: {
    currency: string
    includeTip: boolean
    tipPercentage: number
    includeTax: boolean
    taxPercentage: number
  }
  tags: string[]
  usageCount: number
  lastUsed: number
  createdAt: number
  updatedAt: number
}

export interface StoredSettings {
  id: 'app_settings'
  general: {
    theme: 'light' | 'dark' | 'system'
    language: 'ko' | 'en'
    currency: string
    autoSave: boolean
    autoBackup: boolean
  }
  ocr: {
    defaultEngine: 'tesseract' | 'gemini' | 'auto'
    tesseractOptions: {
      language: string[]
      enhanceImage: boolean
      confidence: number
    }
    geminiOptions: {
      apiKey?: string
      model: string
      maxDailyRequests: number
      currentDailyUsage: number
      lastResetDate: string
    }
  }
  calculation: {
    defaultSplitMethod: 'equal' | 'itemBased' | 'percentage' | 'custom'
    roundingMode: 'round' | 'ceil' | 'floor'
    precision: number
    includeTaxByDefault: boolean
    includeTipByDefault: boolean
    defaultTipPercentage: number
    defaultTaxPercentage: number
  }
  ui: {
    compactMode: boolean
    showAnimations: boolean
    enableHotkeys: boolean
    defaultView: 'calculator' | 'history'
  }
  storage: {
    maxCalculations: number
    maxImagesPerCalculation: number
    autoDeleteAfterDays: number
    compressionEnabled: boolean
    backupEnabled: boolean
    lastBackupDate?: number
  }
  version: number
  createdAt: number
  updatedAt: number
}

// Database schema and versioning
export interface DatabaseRecords {
  calculations: StoredCalculation
  images: StoredImage
  templates: StoredTemplate
  settings: StoredSettings
}

// Database configuration interfaces
export interface DatabaseIndex {
  name: string
  keyPath: string
  multiEntry?: boolean
}

export interface DatabaseStore {
  keyPath: string
  indexes?: DatabaseIndex[]
}

export interface DatabaseSchema {
  name: string
  version: number
  stores: Record<string, DatabaseStore>
}

export const DATABASE_CONFIG: DatabaseSchema = {
  name: 'CostSplitCalculatorDB',
  version: 1,
  stores: {
    calculations: {
      keyPath: 'id',
      indexes: [
        { name: 'createdAt', keyPath: 'createdAt' },
        { name: 'updatedAt', keyPath: 'updatedAt' },
        { name: 'isStarred', keyPath: 'isStarred' },
        { name: 'tags', keyPath: 'tags', multiEntry: true }
      ]
    },
    images: {
      keyPath: 'id',
      indexes: [
        { name: 'calculationId', keyPath: 'calculationId' },
        { name: 'createdAt', keyPath: 'createdAt' }
      ]
    },
    templates: {
      keyPath: 'id',
      indexes: [
        { name: 'lastUsed', keyPath: 'lastUsed' },
        { name: 'usageCount', keyPath: 'usageCount' },
        { name: 'tags', keyPath: 'tags', multiEntry: true }
      ]
    },
    settings: {
      keyPath: 'id'
    }
  }
}

// Query and filter types
export interface CalculationQuery {
  sortBy?: 'createdAt' | 'updatedAt' | 'name'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
  tags?: string[]
  isStarred?: boolean
  dateRange?: {
    start: number
    end: number
  }
  searchText?: string
}

export interface TemplateQuery {
  sortBy?: 'lastUsed' | 'usageCount' | 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
  tags?: string[]
  splitMethod?: 'equal' | 'itemBased' | 'percentage' | 'custom'
  searchText?: string
}

// Storage statistics and analytics
export interface StorageStats {
  totalCalculations: number
  totalImages: number
  totalTemplates: number
  totalSize: number
  oldestCalculation?: number
  newestCalculation?: number
  mostUsedTemplate?: string
  averageCalculationsPerDay: number
  tagUsage: Record<string, number>
  splitMethodUsage: Record<string, number>
}

// Export/Import types
export interface ExportData {
  calculations: StoredCalculation[]
  images: StoredImage[]
  templates: StoredTemplate[]
  settings: StoredSettings
  exportedAt: number
  version: number
  metadata: {
    totalCalculations: number
    totalImages: number
    totalSize: number
    dateRange: {
      start: number
      end: number
    }
  }
}

export interface ImportOptions {
  overwriteExisting: boolean
  importCalculations: boolean
  importImages: boolean
  importTemplates: boolean
  importSettings: boolean
  tagPrefix?: string
}

// Default values
export const DEFAULT_SETTINGS: StoredSettings = {
  id: 'app_settings',
  general: {
    theme: 'system',
    language: 'ko',
    currency: 'KRW',
    autoSave: true,
    autoBackup: true
  },
  ocr: {
    defaultEngine: 'auto',
    tesseractOptions: {
      language: ['kor', 'eng'],
      enhanceImage: true,
      confidence: 0.6
    },
    geminiOptions: {
      model: 'gemini-1.5-flash',
      maxDailyRequests: 60,
      currentDailyUsage: 0,
      lastResetDate: new Date().toISOString().split('T')[0]
    }
  },
  calculation: {
    defaultSplitMethod: 'equal',
    roundingMode: 'round',
    precision: 0,
    includeTaxByDefault: true,
    includeTipByDefault: false,
    defaultTipPercentage: 10,
    defaultTaxPercentage: 10
  },
  ui: {
    compactMode: false,
    showAnimations: true,
    enableHotkeys: true,
    defaultView: 'calculator'
  },
  storage: {
    maxCalculations: 1000,
    maxImagesPerCalculation: 5,
    autoDeleteAfterDays: 365,
    compressionEnabled: true,
    backupEnabled: true
  },
  version: 1,
  createdAt: Date.now(),
  updatedAt: Date.now()
}

// Error types
export class StorageError extends Error {
  constructor(
    message: string,
    public code: 'DB_ERROR' | 'QUOTA_EXCEEDED' | 'INVALID_DATA' | 'NOT_FOUND' | 'VERSION_ERROR',
    public details?: any
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

// Utility types
export type StorageEventType = 
  | 'calculation_created'
  | 'calculation_updated'
  | 'calculation_deleted'
  | 'template_created'
  | 'template_updated'
  | 'template_deleted'
  | 'settings_updated'
  | 'storage_quota_warning'
  | 'storage_cleanup'

export interface StorageEvent {
  type: StorageEventType
  data: any
  timestamp: number
}