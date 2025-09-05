import React, { useCallback, useState } from 'react'
import { Upload, FileImage, AlertCircle, X } from 'lucide-react'

interface ReceiptUploaderProps {
  onFileSelect: (file: File) => void
  isProcessing?: boolean
  disabled?: boolean
  maxFileSize?: number // bytes
  acceptedTypes?: string[]
}

interface FilePreview {
  file: File
  url: string
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  onFileSelect,
  isProcessing = false,
  disabled = false,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateFile = useCallback((file: File): string | null => {
    // 파일 타입 검증
    if (!acceptedTypes.includes(file.type)) {
      return '지원하지 않는 파일 형식입니다. JPG, PNG, WebP 파일만 업로드 가능합니다.'
    }

    // 파일 크기 검증
    if (file.size > maxFileSize) {
      return `파일 크기가 너무 큽니다. 최대 ${Math.round(maxFileSize / 1024 / 1024)}MB까지 가능합니다.`
    }

    return null
  }, [acceptedTypes, maxFileSize])

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    
    // 이미지 미리보기 생성
    const url = URL.createObjectURL(file)
    setFilePreview({ file, url })
    
    // 부모 컴포넌트에 파일 전달
    onFileSelect(file)
  }, [validateFile, onFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isProcessing) {
      setIsDragOver(true)
    }
  }, [disabled, isProcessing])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled || isProcessing) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [disabled, isProcessing, handleFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
    // 파일 입력 초기화 (같은 파일 재선택 가능)
    e.target.value = ''
  }, [handleFile])

  const clearPreview = useCallback(() => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview.url)
      setFilePreview(null)
    }
    setError(null)
  }, [filePreview])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 업로드 영역 */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer
          ${isDragOver 
            ? 'border-blue-400 bg-blue-900/30 scale-[1.02] shadow-lg' 
            : 'border-gray-600 hover:border-blue-500'
          }
          ${disabled || isProcessing 
            ? 'opacity-50 cursor-not-allowed bg-gray-100' 
            : 'steel-panel hover:shadow-steel'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={disabled || isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="receipt-upload"
        />
        
        <div className="p-8 text-center">
          {filePreview ? (
            // 파일 미리보기
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={filePreview.url}
                  alt="영수증 미리보기"
                  className="max-w-full max-h-48 rounded-lg shadow-md tech-border"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    clearPreview()
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  type="button"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              <div className="text-sm text-foreground">
                <p className="font-medium text-foreground">{filePreview.file.name}</p>
                <p>{formatFileSize(filePreview.file.size)}</p>
              </div>
              
              {!isProcessing && (
                <p className="text-sm text-blue-600 font-medium">
                  다른 파일을 선택하려면 여기를 클릭하거나 드래그하세요
                </p>
              )}
            </div>
          ) : (
            // 초기 업로드 UI
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto text-foreground">
                {isProcessing ? (
                  <div className="animate-spin">
                    <Upload className="w-full h-full" />
                  </div>
                ) : (
                  <FileImage className="w-full h-full" />
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {isProcessing ? '처리 중...' : '영수증 이미지 업로드'}
                </h3>
                <p className="text-foreground">
                  {isProcessing 
                    ? 'OCR 처리가 진행 중입니다' 
                    : '이미지를 드래그하거나 클릭하여 선택하세요'
                  }
                </p>
              </div>
              
              {!isProcessing && (
                <div className="text-sm text-foreground space-y-1">
                  <p>지원 형식: JPG, PNG, WebP</p>
                  <p>최대 크기: {Math.round(maxFileSize / 1024 / 1024)}MB</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 처리 중 오버레이 */}
        {isProcessing && (
          <div className="absolute inset-0 bg-background bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center space-y-3">
              <div className="animate-spin w-8 h-8 mx-auto">
                <Upload className="w-full h-full text-blue-500" />
              </div>
              <p className="text-sm font-medium text-foreground">영수증 분석 중...</p>
            </div>
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-300 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* 업로드 팁 */}
      {!filePreview && !isProcessing && (
        <div className="mt-4 p-4 bg-blue-900/50 border border-blue-300 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-300 mb-2">📸 더 나은 인식을 위한 팁</h4>
          <ul className="text-sm text-blue-300 space-y-1">
            <li>• 영수증이 평평하고 구겨지지 않도록 촬영하세요</li>
            <li>• 충분한 조명 아래에서 촬영하세요</li>
            <li>• 글자가 선명하게 보이도록 초점을 맞추세요</li>
            <li>• 영수증 전체가 화면에 들어오도록 촬영하세요</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default ReceiptUploader