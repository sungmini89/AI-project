/**
 * File Upload Utilities for OCR Cost Split Calculator
 * Handles file uploads, drag & drop, validation, and progress tracking
 */

import { 
  FileUploadConfig, 
  UploadProgress, 
  ImageFile, 
  ImageValidation,
  DEFAULT_UPLOAD_CONFIG,
  SUPPORTED_FORMATS
} from '../types/image'
import { imageProcessor } from './imageProcessor'

export type UploadProgressCallback = (progress: UploadProgress[]) => void
export type FileUploadCallback = (files: ImageFile[]) => void
export type ErrorCallback = (error: string) => void

export class FileUploadManager {
  private config: FileUploadConfig
  private uploadProgress: Map<string, UploadProgress> = new Map()
  private onProgress?: UploadProgressCallback
  private onComplete?: FileUploadCallback
  private onError?: ErrorCallback

  constructor(
    config: FileUploadConfig = DEFAULT_UPLOAD_CONFIG,
    callbacks?: {
      onProgress?: UploadProgressCallback
      onComplete?: FileUploadCallback
      onError?: ErrorCallback
    }
  ) {
    this.config = config
    this.onProgress = callbacks?.onProgress
    this.onComplete = callbacks?.onComplete
    this.onError = callbacks?.onError
  }

  /**
   * Handle file input change
   */
  async handleFileInput(fileList: FileList): Promise<void> {
    const files = Array.from(fileList)
    await this.processFiles(files)
  }

  /**
   * Handle drag and drop files
   */
  async handleFileDrop(dataTransfer: DataTransfer): Promise<void> {
    const files: File[] = []
    
    // Handle files
    for (let i = 0; i < dataTransfer.files.length; i++) {
      files.push(dataTransfer.files[i])
    }

    // Handle items (for better drag support)
    if (dataTransfer.items) {
      for (let i = 0; i < dataTransfer.items.length; i++) {
        const item = dataTransfer.items[i]
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
      }
    }

    await this.processFiles(files)
  }

  /**
   * Process multiple files with validation and optimization
   */
  private async processFiles(files: File[]): Promise<void> {
    // Validate file count
    if (files.length > this.config.maxFiles) {
      this.onError?.(
        `Maximum ${this.config.maxFiles} files allowed. ${files.length} files selected.`
      )
      return
    }

    // Initialize progress tracking
    const processedFiles: ImageFile[] = []
    const progressList: UploadProgress[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileId = this.generateFileId(file)
      
      const progress: UploadProgress = {
        fileId,
        fileName: file.name,
        progress: 0,
        status: 'pending'
      }
      
      this.uploadProgress.set(fileId, progress)
      progressList.push(progress)
    }

    // Report initial progress
    this.onProgress?.(progressList)

    // Process files sequentially to avoid overwhelming the browser
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileId = this.generateFileId(file)
      
      try {
        await this.processSingleFile(file, fileId, processedFiles)
      } catch (error) {
        const progress = this.uploadProgress.get(fileId)!
        progress.status = 'error'
        progress.error = error instanceof Error ? error.message : 'Unknown error'
        this.onProgress?.([...this.uploadProgress.values()])
      }
    }

    // Complete processing
    if (processedFiles.length > 0) {
      this.onComplete?.(processedFiles)
    }

    // Clear progress after completion
    setTimeout(() => {
      this.uploadProgress.clear()
    }, 2000)
  }

  /**
   * Process a single file with all validation and optimization steps
   */
  private async processSingleFile(
    file: File, 
    fileId: string, 
    processedFiles: ImageFile[]
  ): Promise<void> {
    const progress = this.uploadProgress.get(fileId)!
    
    try {
      // Step 1: Update status
      progress.status = 'uploading'
      progress.progress = 10
      this.onProgress?.([...this.uploadProgress.values()])

      // Step 2: Validate file
      const validation = await this.validateFile(file)
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      progress.progress = 25
      this.onProgress?.([...this.uploadProgress.values()])

      // Step 3: Load image
      progress.status = 'processing'
      let imageFile = await imageProcessor.loadImage(file)
      
      progress.progress = 50
      this.onProgress?.([...this.uploadProgress.values()])

      // Step 4: Apply compression if enabled
      if (this.config.enableCompression) {
        imageFile = await imageProcessor.compressImage(
          imageFile, 
          this.config.compressionConfig
        )
      }

      progress.progress = 75
      this.onProgress?.([...this.uploadProgress.values()])

      // Step 5: Final optimization and validation
      const finalValidation = await imageProcessor.validateImage(imageFile.file)
      if (!finalValidation.isValid) {
        throw new Error(`Processing failed: ${finalValidation.errors.join(', ')}`)
      }

      // Step 6: Complete
      progress.status = 'completed'
      progress.progress = 100
      progress.result = imageFile
      this.onProgress?.([...this.uploadProgress.values()])

      processedFiles.push(imageFile)

    } catch (error) {
      progress.status = 'error'
      progress.error = error instanceof Error ? error.message : 'Processing failed'
      throw error
    }
  }

  /**
   * Validate file against configuration
   */
  private async validateFile(file: File): Promise<ImageValidation> {
    const validation: ImageValidation = {
      isValid: true,
      errors: [],
      warnings: [],
      fileSize: file.size,
      dimensions: { width: 0, height: 0, aspectRatio: 0 },
      format: file.type,
      colorDepth: 0,
      hasText: false
    }

    // Check file type
    if (!this.config.allowedTypes.includes(file.type)) {
      validation.errors.push(
        `File type '${file.type}' not supported. Allowed types: ${this.config.allowedTypes.join(', ')}`
      )
      validation.isValid = false
    }

    // Check file size
    if (file.size > this.config.maxFileSize) {
      validation.errors.push(
        `File size ${this.formatFileSize(file.size)} exceeds limit of ${this.formatFileSize(this.config.maxFileSize)}`
      )
      validation.isValid = false
    }

    // If basic validation fails, return early
    if (!validation.isValid) {
      return validation
    }

    // Detailed image validation
    try {
      const detailedValidation = await imageProcessor.validateImage(file)
      Object.assign(validation, detailedValidation)
    } catch (error) {
      validation.errors.push(`Image validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      validation.isValid = false
    }

    return validation
  }

  /**
   * Get supported file extensions for file input
   */
  getSupportedExtensions(): string {
    const extensions: string[] = []
    
    this.config.allowedTypes.forEach(type => {
      if (type in SUPPORTED_FORMATS) {
        extensions.push(...SUPPORTED_FORMATS[type as keyof typeof SUPPORTED_FORMATS].extensions)
      }
    })

    return extensions.join(',')
  }

  /**
   * Get human-readable supported formats
   */
  getSupportedFormatsText(): string {
    const formatNames: string[] = []
    
    this.config.allowedTypes.forEach(type => {
      if (type in SUPPORTED_FORMATS) {
        formatNames.push(SUPPORTED_FORMATS[type as keyof typeof SUPPORTED_FORMATS].name)
      }
    })

    return formatNames.join(', ')
  }

  /**
   * Check if file type is supported
   */
  isFileTypeSupported(file: File): boolean {
    return this.config.allowedTypes.includes(file.type)
  }

  /**
   * Get current upload progress
   */
  getUploadProgress(): UploadProgress[] {
    return [...this.uploadProgress.values()]
  }

  /**
   * Cancel all uploads
   */
  cancelUploads(): void {
    this.uploadProgress.forEach(progress => {
      if (progress.status === 'pending' || progress.status === 'uploading') {
        progress.status = 'error'
        progress.error = 'Upload cancelled'
      }
    })
    
    this.onProgress?.([...this.uploadProgress.values()])
    
    // Clear after a short delay
    setTimeout(() => {
      this.uploadProgress.clear()
    }, 1000)
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<FileUploadConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Update callbacks
   */
  updateCallbacks(callbacks: {
    onProgress?: UploadProgressCallback
    onComplete?: FileUploadCallback
    onError?: ErrorCallback
  }): void {
    this.onProgress = callbacks.onProgress ?? this.onProgress
    this.onComplete = callbacks.onComplete ?? this.onComplete
    this.onError = callbacks.onError ?? this.onError
  }

  // Private utility methods
  private generateFileId(file: File): string {
    return `file_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Math.random().toString(36).substr(2, 6)}`
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Drag and drop utilities
export class DragDropHandler {
  private element: HTMLElement
  private uploadManager: FileUploadManager
  private dragCounter = 0

  constructor(element: HTMLElement, uploadManager: FileUploadManager) {
    this.element = element
    this.uploadManager = uploadManager
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    // Prevent default drag behaviors
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.element.addEventListener(eventName, this.preventDefaults, false)
      document.body.addEventListener(eventName, this.preventDefaults, false)
    })

    // Highlight drop area when item is dragged over it
    ;['dragenter', 'dragover'].forEach(eventName => {
      this.element.addEventListener(eventName, this.highlight.bind(this), false)
    })

    ;['dragleave', 'drop'].forEach(eventName => {
      this.element.addEventListener(eventName, this.unhighlight.bind(this), false)
    })

    // Handle dropped files
    this.element.addEventListener('drop', this.handleDrop.bind(this), false)
  }

  private preventDefaults(e: Event): void {
    e.preventDefault()
    e.stopPropagation()
  }

  private highlight(e: DragEvent): void {
    if (e.type === 'dragenter') {
      this.dragCounter++
    }
    
    this.element.classList.add('drag-over')
    
    // Visual feedback for valid/invalid files
    if (e.dataTransfer) {
      const hasValidFiles = this.hasValidFiles(e.dataTransfer)
      this.element.classList.toggle('drag-valid', hasValidFiles)
      this.element.classList.toggle('drag-invalid', !hasValidFiles)
    }
  }

  private unhighlight(e: DragEvent): void {
    if (e.type === 'dragleave') {
      this.dragCounter--
    }
    
    if (this.dragCounter === 0 || e.type === 'drop') {
      this.element.classList.remove('drag-over', 'drag-valid', 'drag-invalid')
      this.dragCounter = 0
    }
  }

  private async handleDrop(e: DragEvent): Promise<void> {
    const dataTransfer = e.dataTransfer
    if (!dataTransfer) return

    await this.uploadManager.handleFileDrop(dataTransfer)
  }

  private hasValidFiles(dataTransfer: DataTransfer): boolean {
    if (!dataTransfer.types.includes('Files')) return false

    // Can't check actual files in dragover, so assume valid
    // Real validation happens in drop handler
    return true
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.element.removeEventListener(eventName, this.preventDefaults, false)
      document.body.removeEventListener(eventName, this.preventDefaults, false)
    })
  }
}

// Utility functions
export const createFileUploadManager = (
  config?: Partial<FileUploadConfig>,
  callbacks?: {
    onProgress?: UploadProgressCallback
    onComplete?: FileUploadCallback
    onError?: ErrorCallback
  }
): FileUploadManager => {
  const finalConfig = { ...DEFAULT_UPLOAD_CONFIG, ...config }
  return new FileUploadManager(finalConfig, callbacks)
}

export const createDragDropHandler = (
  element: HTMLElement,
  uploadManager: FileUploadManager
): DragDropHandler => {
  return new DragDropHandler(element, uploadManager)
}