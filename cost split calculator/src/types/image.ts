/**
 * Image Processing Types for OCR Cost Split Calculator
 * Comprehensive type definitions for image handling and preprocessing
 */

// Core image types
export interface ImageFile {
  id: string
  file: File
  url: string
  name: string
  size: number
  type: string
  dimensions: ImageDimensions
  timestamp: number
  metadata?: ImageMetadata
}

export interface ImageDimensions {
  width: number
  height: number
  aspectRatio: number
}

export interface ImageMetadata {
  originalSize: number
  compressedSize?: number
  compressionRatio?: number
  quality?: number
  format: string
  colorDepth?: number
  hasAlpha: boolean
}

// Image processing configuration
export interface ImageProcessingConfig {
  maxWidth: number
  maxHeight: number
  quality: number // 0-1
  format: 'jpeg' | 'png' | 'webp'
  maintainAspectRatio: boolean
  backgroundColor?: string // For transparent images
}

export interface ImageCompressionOptions {
  maxSizeKB: number
  maxWidth: number
  maxHeight: number
  quality: number
  format?: 'jpeg' | 'png' | 'webp'
  maintainAspectRatio?: boolean
}

// Image enhancement for OCR
export interface OCREnhancementConfig {
  brightness: number    // -100 to 100
  contrast: number      // -100 to 100
  saturation: number    // -100 to 100
  sharpness: number     // 0 to 100
  grayscale: boolean
  autoEnhance: boolean
  denoise: boolean
}

// Image validation
export interface ImageValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  fileSize: number
  dimensions: ImageDimensions
  format: string
  colorDepth: number
  hasText: boolean // Estimated based on image analysis
}

// File upload types
export interface FileUploadConfig {
  maxFileSize: number // in bytes
  allowedTypes: string[]
  maxFiles: number
  enableCompression: boolean
  compressionConfig: ImageCompressionOptions
}

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  result?: ImageFile
}

// Canvas processing types
export interface CanvasProcessingOptions {
  width: number
  height: number
  backgroundColor?: string
  smoothing: boolean
  quality: number
}

export interface ImageFilterConfig {
  type: 'brightness' | 'contrast' | 'saturation' | 'grayscale' | 'sepia' | 'invert' | 'blur' | 'sharpen'
  intensity: number // 0-100
}

// Default configurations
export const DEFAULT_IMAGE_CONFIG: ImageProcessingConfig = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  format: 'jpeg',
  maintainAspectRatio: true,
  backgroundColor: '#ffffff'
}

export const DEFAULT_COMPRESSION_CONFIG: ImageCompressionOptions = {
  maxSizeKB: 500,
  maxWidth: 1200,
  maxHeight: 800,
  quality: 0.8,
  format: 'jpeg',
  maintainAspectRatio: true
}

export const DEFAULT_OCR_ENHANCEMENT: OCREnhancementConfig = {
  brightness: 0,
  contrast: 10,
  saturation: -20,
  sharpness: 15,
  grayscale: true,
  autoEnhance: true,
  denoise: true
}

export const DEFAULT_UPLOAD_CONFIG: FileUploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  maxFiles: 5,
  enableCompression: true,
  compressionConfig: DEFAULT_COMPRESSION_CONFIG
}

// Supported image formats
export const SUPPORTED_FORMATS = {
  'image/jpeg': { extensions: ['.jpg', '.jpeg'], name: 'JPEG' },
  'image/png': { extensions: ['.png'], name: 'PNG' },
  'image/webp': { extensions: ['.webp'], name: 'WebP' },
  'image/heic': { extensions: ['.heic', '.heif'], name: 'HEIC' }
} as const

export type SupportedImageFormat = keyof typeof SUPPORTED_FORMATS