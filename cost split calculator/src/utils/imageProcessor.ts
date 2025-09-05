/**
 * Image Processing Utilities for OCR Cost Split Calculator
 * Canvas API-based image processing, compression, and enhancement
 */

import { 
  ImageFile, 
  ImageDimensions, 
  ImageProcessingConfig, 
  ImageCompressionOptions,
  OCREnhancementConfig,
  ImageValidation,
  ImageMetadata,
  DEFAULT_IMAGE_CONFIG,
  DEFAULT_COMPRESSION_CONFIG,
  DEFAULT_OCR_ENHANCEMENT,
  SUPPORTED_FORMATS
} from '../types/image'

export class ImageProcessor {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    
    // Configure canvas for high quality image processing
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'
  }

  /**
   * Load image from File and create ImageFile object
   */
  async loadImage(file: File): Promise<ImageFile> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        const dimensions = this.getImageDimensions(img)
        const metadata = this.extractMetadata(file, img)

        const imageFile: ImageFile = {
          id: this.generateId(),
          file,
          url,
          name: file.name,
          size: file.size,
          type: file.type,
          dimensions,
          timestamp: Date.now(),
          metadata
        }

        resolve(imageFile)
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error(`Failed to load image: ${file.name}`))
      }

      img.src = url
    })
  }

  /**
   * Compress image with specified options
   */
  async compressImage(
    imageFile: ImageFile, 
    options: ImageCompressionOptions = DEFAULT_COMPRESSION_CONFIG
  ): Promise<ImageFile> {
    const img = await this.createImageElement(imageFile.url)
    
    // Calculate new dimensions
    const newDimensions = this.calculateResizeDimensions(
      imageFile.dimensions,
      options.maxWidth,
      options.maxHeight,
      options.maintainAspectRatio ?? true
    )

    // Resize canvas
    this.canvas.width = newDimensions.width
    this.canvas.height = newDimensions.height

    // Clear canvas and draw image
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.drawImage(img, 0, 0, newDimensions.width, newDimensions.height)

    // Convert to blob with compression
    const blob = await this.canvasToBlob(options.format ?? 'jpeg', options.quality)
    
    // Check if compressed size meets requirements
    if (blob.size / 1024 > options.maxSizeKB) {
      // Further compress by reducing quality
      const adjustedQuality = Math.max(0.1, options.quality * 0.8)
      return this.compressImage(imageFile, { ...options, quality: adjustedQuality })
    }

    // Create new File from blob
    const compressedFile = new File([blob], imageFile.name, { type: blob.type })
    
    return this.loadImage(compressedFile)
  }

  /**
   * Enhance image for better OCR results
   */
  async enhanceForOCR(
    imageFile: ImageFile, 
    config: OCREnhancementConfig = DEFAULT_OCR_ENHANCEMENT
  ): Promise<ImageFile> {
    const img = await this.createImageElement(imageFile.url)
    
    this.canvas.width = imageFile.dimensions.width
    this.canvas.height = imageFile.dimensions.height

    // Draw original image
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.drawImage(img, 0, 0)

    // Apply enhancements
    if (config.autoEnhance) {
      await this.autoEnhance()
    }

    if (config.brightness !== 0 || config.contrast !== 0 || config.saturation !== 0) {
      this.adjustColors(config.brightness, config.contrast, config.saturation)
    }

    if (config.grayscale) {
      this.convertToGrayscale()
    }

    if (config.sharpness > 0) {
      this.applySharpen(config.sharpness)
    }

    if (config.denoise) {
      this.applyDenoise()
    }

    // Convert to blob
    const blob = await this.canvasToBlob('png', 1.0) // Use PNG for lossless OCR enhancement
    const enhancedFile = new File([blob], `enhanced_${imageFile.name}`, { type: 'image/png' })
    
    return this.loadImage(enhancedFile)
  }

  /**
   * Validate image file
   */
  async validateImage(file: File): Promise<ImageValidation> {
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

    try {
      // Check file type
      if (!Object.keys(SUPPORTED_FORMATS).includes(file.type)) {
        validation.errors.push(`Unsupported file format: ${file.type}`)
        validation.isValid = false
        return validation
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        validation.errors.push('File size exceeds 10MB limit')
        validation.isValid = false
      }

      // Load image to check dimensions and content
      const imageFile = await this.loadImage(file)
      validation.dimensions = imageFile.dimensions

      // Check minimum dimensions (OCR requires readable text)
      if (validation.dimensions.width < 100 || validation.dimensions.height < 100) {
        validation.errors.push('Image dimensions too small (minimum 100x100)')
        validation.isValid = false
      }

      // Check maximum dimensions
      if (validation.dimensions.width > 4000 || validation.dimensions.height > 4000) {
        validation.warnings.push('Large image detected, compression recommended')
      }

      // Estimate text presence using edge detection
      validation.hasText = await this.hasTextContent(imageFile)

      // Clean up
      URL.revokeObjectURL(imageFile.url)

    } catch (error) {
      validation.errors.push(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`)
      validation.isValid = false
    }

    return validation
  }

  /**
   * Rotate image by specified degrees
   */
  async rotateImage(imageFile: ImageFile, degrees: number): Promise<ImageFile> {
    const img = await this.createImageElement(imageFile.url)
    
    // Calculate new canvas dimensions after rotation
    const radians = (degrees * Math.PI) / 180
    const sin = Math.abs(Math.sin(radians))
    const cos = Math.abs(Math.cos(radians))
    
    const newWidth = img.width * cos + img.height * sin
    const newHeight = img.width * sin + img.height * cos

    this.canvas.width = newWidth
    this.canvas.height = newHeight

    // Clear and rotate
    this.ctx.clearRect(0, 0, newWidth, newHeight)
    this.ctx.translate(newWidth / 2, newHeight / 2)
    this.ctx.rotate(radians)
    this.ctx.drawImage(img, -img.width / 2, -img.height / 2)

    // Reset transform
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)

    const blob = await this.canvasToBlob('png', 1.0)
    const rotatedFile = new File([blob], `rotated_${imageFile.name}`, { type: 'image/png' })
    
    return this.loadImage(rotatedFile)
  }

  // Private helper methods
  private getImageDimensions(img: HTMLImageElement): ImageDimensions {
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      aspectRatio: img.naturalWidth / img.naturalHeight
    }
  }

  private extractMetadata(file: File, img: HTMLImageElement): ImageMetadata {
    return {
      originalSize: file.size,
      format: file.type,
      hasAlpha: file.type === 'image/png' // Simplified check
    }
  }

  private generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async createImageElement(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  private calculateResizeDimensions(
    original: ImageDimensions,
    maxWidth: number,
    maxHeight: number,
    maintainAspectRatio: boolean
  ): ImageDimensions {
    if (!maintainAspectRatio) {
      return {
        width: maxWidth,
        height: maxHeight,
        aspectRatio: maxWidth / maxHeight
      }
    }

    const widthRatio = maxWidth / original.width
    const heightRatio = maxHeight / original.height
    const ratio = Math.min(widthRatio, heightRatio, 1) // Don't upscale

    const width = Math.round(original.width * ratio)
    const height = Math.round(original.height * ratio)

    return {
      width,
      height,
      aspectRatio: width / height
    }
  }

  private async canvasToBlob(format: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      }, `image/${format}`, quality)
    })
  }

  private async autoEnhance(): Promise<void> {
    // Simple auto-enhancement: increase contrast and reduce noise
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const data = imageData.data

    // Calculate histogram for auto-adjustment
    const histogram = new Array(256).fill(0)
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
      histogram[gray]++
    }

    // Auto-contrast adjustment
    let min = 0, max = 255
    for (let i = 0; i < 256; i++) {
      if (histogram[i] > 0) { min = i; break }
    }
    for (let i = 255; i >= 0; i--) {
      if (histogram[i] > 0) { max = i; break }
    }

    const range = max - min
    if (range > 0) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, ((data[i] - min) * 255) / range))
        data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - min) * 255) / range))
        data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - min) * 255) / range))
      }
    }

    this.ctx.putImageData(imageData, 0, 0)
  }

  private adjustColors(brightness: number, contrast: number, saturation: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const data = imageData.data

    const brightnessValue = brightness * 2.55 // Convert to 0-255 range
    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast))

    for (let i = 0; i < data.length; i += 4) {
      // Brightness
      let r = data[i] + brightnessValue
      let g = data[i + 1] + brightnessValue
      let b = data[i + 2] + brightnessValue

      // Contrast
      r = contrastFactor * (r - 128) + 128
      g = contrastFactor * (g - 128) + 128
      b = contrastFactor * (b - 128) + 128

      // Saturation adjustment (simplified)
      if (saturation !== 0) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        const satFactor = (saturation + 100) / 100
        r = gray + (r - gray) * satFactor
        g = gray + (g - gray) * satFactor
        b = gray + (b - gray) * satFactor
      }

      // Clamp values
      data[i] = Math.min(255, Math.max(0, r))
      data[i + 1] = Math.min(255, Math.max(0, g))
      data[i + 2] = Math.min(255, Math.max(0, b))
    }

    this.ctx.putImageData(imageData, 0, 0)
  }

  private convertToGrayscale(): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
      data[i] = gray
      data[i + 1] = gray
      data[i + 2] = gray
    }

    this.ctx.putImageData(imageData, 0, 0)
  }

  private applySharpen(intensity: number): void {
    const factor = intensity / 100
    const sharpenKernel = [
      0, -1 * factor, 0,
      -1 * factor, 1 + 4 * factor, -1 * factor,
      0, -1 * factor, 0
    ]

    this.applyConvolution(sharpenKernel, 3)
  }

  private applyDenoise(): void {
    // Simple blur for noise reduction
    const blurKernel = [
      1/16, 2/16, 1/16,
      2/16, 4/16, 2/16,
      1/16, 2/16, 1/16
    ]

    this.applyConvolution(blurKernel, 3)
  }

  private applyConvolution(kernel: number[], kernelSize: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const data = imageData.data
    const width = this.canvas.width
    const height = this.canvas.height
    const output = new Uint8ClampedArray(data.length)

    const half = Math.floor(kernelSize / 2)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels only
          let sum = 0
          for (let ky = 0; ky < kernelSize; ky++) {
            for (let kx = 0; kx < kernelSize; kx++) {
              const py = Math.min(height - 1, Math.max(0, y + ky - half))
              const px = Math.min(width - 1, Math.max(0, x + kx - half))
              const idx = (py * width + px) * 4 + c
              sum += data[idx] * kernel[ky * kernelSize + kx]
            }
          }
          output[(y * width + x) * 4 + c] = sum
        }
        // Copy alpha channel
        output[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3]
      }
    }

    // Copy back to original
    for (let i = 0; i < data.length; i++) {
      data[i] = output[i]
    }

    this.ctx.putImageData(imageData, 0, 0)
  }

  private async hasTextContent(imageFile: ImageFile): Promise<boolean> {
    // Simple edge detection to estimate text presence
    const img = await this.createImageElement(imageFile.url)
    
    // Create smaller canvas for analysis
    const analysisCanvas = document.createElement('canvas')
    const analysisCtx = analysisCanvas.getContext('2d')!
    
    const scale = Math.min(1, 200 / Math.max(img.width, img.height))
    analysisCanvas.width = img.width * scale
    analysisCanvas.height = img.height * scale
    
    analysisCtx.drawImage(img, 0, 0, analysisCanvas.width, analysisCanvas.height)
    
    const imageData = analysisCtx.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height)
    const data = imageData.data
    
    // Convert to grayscale and detect edges
    let edgeCount = 0
    for (let i = 0; i < data.length - 4; i += 4) {
      const current = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      const next = 0.299 * data[i + 4] + 0.587 * data[i + 5] + 0.114 * data[i + 6]
      
      if (Math.abs(current - next) > 50) { // Edge threshold
        edgeCount++
      }
    }
    
    // Heuristic: images with text tend to have more edges
    const edgeRatio = edgeCount / (analysisCanvas.width * analysisCanvas.height)
    return edgeRatio > 0.1
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.canvas.remove()
  }
}

// Export singleton instance
export const imageProcessor = new ImageProcessor()