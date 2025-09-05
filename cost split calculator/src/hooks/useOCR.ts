import { useState, useCallback } from 'react'
import ocrService, { OCRResult } from '../services/ocrService'
import { BillItem } from '../types'

export interface UseOCROptions {
  autoEnhance?: boolean
  saveResults?: boolean
  onComplete?: (result: OCRResult) => void
  onError?: (error: Error) => void
}

export function useOCR(options: UseOCROptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<OCRResult | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const processImage = useCallback(async (imageFile: File): Promise<OCRResult> => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const result = await ocrService.processImage(imageFile)
      setResult(result)
      options.onComplete?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('OCR processing failed')
      setError(error)
      options.onError?.(error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [options])

  return {
    isProcessing,
    result,
    error,
    processImage
  }
}