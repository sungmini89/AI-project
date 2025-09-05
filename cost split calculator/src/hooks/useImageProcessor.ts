/**
 * Image Processing Hook for OCR Cost Split Calculator
 * React hook for image processing, file upload, and OCR preparation
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  ImageFile,
  ImageValidation,
  UploadProgress,
  FileUploadConfig,
  ImageCompressionOptions,
  OCREnhancementConfig,
  DEFAULT_UPLOAD_CONFIG,
  DEFAULT_COMPRESSION_CONFIG,
  DEFAULT_OCR_ENHANCEMENT
} from '../types/image'
import { 
  FileUploadManager,
  DragDropHandler,
  createFileUploadManager,
  createDragDropHandler,
  UploadProgressCallback,
  FileUploadCallback,
  ErrorCallback
} from '../utils/fileUpload'
import { imageProcessor } from '../utils/imageProcessor'

interface UseImageProcessorOptions {
  uploadConfig?: Partial<FileUploadConfig>
  compressionConfig?: Partial<ImageCompressionOptions>
  ocrEnhancementConfig?: Partial<OCREnhancementConfig>
  autoProcess?: boolean
  enableDragDrop?: boolean
}

interface UseImageProcessorReturn {
  // State
  images: ImageFile[]
  uploadProgress: UploadProgress[]
  isProcessing: boolean
  error: string | null
  
  // File Upload
  handleFileSelect: (files: FileList) => Promise<void>
  handleFileDrop: (dataTransfer: DataTransfer) => Promise<void>
  clearImages: () => void
  removeImage: (imageId: string) => void
  
  // Image Processing
  compressImage: (imageId: string, options?: ImageCompressionOptions) => Promise<void>
  enhanceForOCR: (imageId: string, config?: OCREnhancementConfig) => Promise<void>
  rotateImage: (imageId: string, degrees: number) => Promise<void>
  
  // Validation
  validateImages: (files: File[]) => Promise<ImageValidation[]>
  getSupportedFormats: () => string
  getSupportedExtensions: () => string
  
  // Drag & Drop
  setupDragDrop: (element: HTMLElement) => () => void
  
  // Utils
  getImageById: (imageId: string) => ImageFile | undefined
  getTotalSize: () => number
  hasImages: boolean
}

export const useImageProcessor = (
  options: UseImageProcessorOptions = {}
): UseImageProcessorReturn => {
  // State
  const [images, setImages] = useState<ImageFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs
  const uploadManagerRef = useRef<FileUploadManager | null>(null)
  const dragDropHandlerRef = useRef<DragDropHandler | null>(null)

  // Configuration
  const uploadConfig = { ...DEFAULT_UPLOAD_CONFIG, ...options.uploadConfig }
  const compressionConfig = { ...DEFAULT_COMPRESSION_CONFIG, ...options.compressionConfig }
  const ocrEnhancementConfig = { ...DEFAULT_OCR_ENHANCEMENT, ...options.ocrEnhancementConfig }

  // Initialize upload manager
  useEffect(() => {
    const onProgress: UploadProgressCallback = (progress) => {
      setUploadProgress(progress)
      setIsProcessing(progress.some(p => p.status === 'uploading' || p.status === 'processing'))
    }

    const onComplete: FileUploadCallback = (newImages) => {
      setImages(prev => [...prev, ...newImages])
      setIsProcessing(false)
      setError(null)
      
      // Clear upload progress after completion
      setTimeout(() => {
        setUploadProgress([])
      }, 2000)
    }

    const onError: ErrorCallback = (errorMessage) => {
      setError(errorMessage)
      setIsProcessing(false)
    }

    uploadManagerRef.current = createFileUploadManager(uploadConfig, {
      onProgress,
      onComplete,
      onError
    })

    return () => {
      uploadManagerRef.current = null
    }
  }, []) // Only run once on mount

  // File handling
  const handleFileSelect = useCallback(async (files: FileList): Promise<void> => {
    if (!uploadManagerRef.current) return
    
    setError(null)
    await uploadManagerRef.current.handleFileInput(files)
  }, [])

  const handleFileDrop = useCallback(async (dataTransfer: DataTransfer): Promise<void> => {
    if (!uploadManagerRef.current) return
    
    setError(null)
    await uploadManagerRef.current.handleFileDrop(dataTransfer)
  }, [])

  // Image management
  const clearImages = useCallback((): void => {
    // Revoke object URLs to prevent memory leaks
    images.forEach(image => {
      URL.revokeObjectURL(image.url)
    })
    
    setImages([])
    setUploadProgress([])
    setError(null)
  }, [images])

  const removeImage = useCallback((imageId: string): void => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url)
      }
      return prev.filter(img => img.id !== imageId)
    })
  }, [])

  // Image processing operations
  const compressImage = useCallback(async (
    imageId: string, 
    options: ImageCompressionOptions = compressionConfig
  ): Promise<void> => {
    const image = images.find(img => img.id === imageId)
    if (!image) return

    setIsProcessing(true)
    setError(null)

    try {
      const compressedImage = await imageProcessor.compressImage(image, options)
      
      setImages(prev => prev.map(img => 
        img.id === imageId ? compressedImage : img
      ))
      
      // Clean up old image URL
      URL.revokeObjectURL(image.url)
      
    } catch (err) {
      setError(`Compression failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }, [images, compressionConfig])

  const enhanceForOCR = useCallback(async (
    imageId: string, 
    config: OCREnhancementConfig = ocrEnhancementConfig
  ): Promise<void> => {
    const image = images.find(img => img.id === imageId)
    if (!image) return

    setIsProcessing(true)
    setError(null)

    try {
      const enhancedImage = await imageProcessor.enhanceForOCR(image, config)
      
      setImages(prev => prev.map(img => 
        img.id === imageId ? enhancedImage : img
      ))
      
      // Clean up old image URL
      URL.revokeObjectURL(image.url)
      
    } catch (err) {
      setError(`Enhancement failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }, [images, ocrEnhancementConfig])

  const rotateImage = useCallback(async (
    imageId: string, 
    degrees: number
  ): Promise<void> => {
    const image = images.find(img => img.id === imageId)
    if (!image) return

    setIsProcessing(true)
    setError(null)

    try {
      const rotatedImage = await imageProcessor.rotateImage(image, degrees)
      
      setImages(prev => prev.map(img => 
        img.id === imageId ? rotatedImage : img
      ))
      
      // Clean up old image URL
      URL.revokeObjectURL(image.url)
      
    } catch (err) {
      setError(`Rotation failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }, [images])

  // Validation
  const validateImages = useCallback(async (files: File[]): Promise<ImageValidation[]> => {
    const validations: ImageValidation[] = []
    
    for (const file of files) {
      try {
        const validation = await imageProcessor.validateImage(file)
        validations.push(validation)
      } catch (err) {
        validations.push({
          isValid: false,
          errors: [err instanceof Error ? err.message : 'Validation failed'],
          warnings: [],
          fileSize: file.size,
          dimensions: { width: 0, height: 0, aspectRatio: 0 },
          format: file.type,
          colorDepth: 0,
          hasText: false
        })
      }
    }
    
    return validations
  }, [])

  // Drag & Drop setup
  const setupDragDrop = useCallback((element: HTMLElement) => {
    if (!uploadManagerRef.current) {
      return () => {} // Return no-op cleanup function
    }

    const handler = createDragDropHandler(element, uploadManagerRef.current)
    dragDropHandlerRef.current = handler

    return () => {
      handler.destroy()
      dragDropHandlerRef.current = null
    }
  }, [])

  // Utility functions
  const getSupportedFormats = useCallback((): string => {
    return uploadManagerRef.current?.getSupportedFormatsText() || ''
  }, [])

  const getSupportedExtensions = useCallback((): string => {
    return uploadManagerRef.current?.getSupportedExtensions() || ''
  }, [])

  const getImageById = useCallback((imageId: string): ImageFile | undefined => {
    return images.find(img => img.id === imageId)
  }, [images])

  const getTotalSize = useCallback((): number => {
    return images.reduce((total, img) => total + img.size, 0)
  }, [images])

  // Computed values
  const hasImages = images.length > 0

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all object URLs
      images.forEach(image => {
        URL.revokeObjectURL(image.url)
      })
      
      // Clean up drag drop handler
      if (dragDropHandlerRef.current) {
        dragDropHandlerRef.current.destroy()
      }
    }
  }, []) // Only run on unmount

  return {
    // State
    images,
    uploadProgress,
    isProcessing,
    error,
    
    // File Upload
    handleFileSelect,
    handleFileDrop,
    clearImages,
    removeImage,
    
    // Image Processing
    compressImage,
    enhanceForOCR,
    rotateImage,
    
    // Validation
    validateImages,
    getSupportedFormats,
    getSupportedExtensions,
    
    // Drag & Drop
    setupDragDrop,
    
    // Utils
    getImageById,
    getTotalSize,
    hasImages
  }
}

// Utility hook for simple image upload (without processing features)
export const useSimpleImageUpload = (
  maxFiles: number = 5,
  maxSizeKB: number = 1024
) => {
  return useImageProcessor({
    uploadConfig: {
      maxFiles,
      maxFileSize: maxSizeKB * 1024,
      enableCompression: true,
      compressionConfig: {
        maxSizeKB: maxSizeKB / 2, // Compress to half the max size
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.8
      }
    },
    autoProcess: true
  })
}