/**
 * Magic UI Components Usage Examples for OCR Cost Split Calculator
 * 
 * This file demonstrates how to use the implemented Magic UI components
 * in the context of an OCR-based receipt cost splitting application.
 */

import React, { useState } from 'react'
import {
  AnimatedList,
  OCRResultItem,
  OCRProgress,
  UploadBorderBeam,
  OCRButton,
  ShinyButton,
  CostTicker,
  SplitResultTicker,
  OCRStatusFlip,
  OCRParticles,
  Particles
} from './index'

// Example OCR result data structure
interface OCRResult {
  item: string
  price: number
  confidence: number
}

// Complete OCR workflow example
export const OCRWorkflowExample: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [splitCount, setSplitCount] = useState(2)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleFileUpload = async (files: FileList) => {
    setStatus('uploading')
    setProgress(0)

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setStatus('processing')
    await new Promise(resolve => setTimeout(resolve, 2000))

    setStatus('analyzing')
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock OCR results
    const mockResults: OCRResult[] = [
      { item: '김치찌개', price: 8000, confidence: 0.95 },
      { item: '된장찌개', price: 7500, confidence: 0.92 },
      { item: '공기밥', price: 1000, confidence: 0.98 },
      { item: '공기밥', price: 1000, confidence: 0.98 },
      { item: '음료수', price: 2000, confidence: 0.87 },
    ]

    setOcrResults(mockResults)
    setSelectedItems(mockResults.map(item => item.item))
    setStatus('complete')
    setShowSuccess(true)

    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleItemSelect = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  const handlePriceChange = (item: string, newPrice: number) => {
    setOcrResults(prev => 
      prev.map(result => 
        result.item === item 
          ? { ...result, price: newPrice }
          : result
      )
    )
  }

  const totalAmount = ocrResults
    .filter(result => selectedItems.includes(result.item))
    .reduce((sum, result) => sum + result.price, 0)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Background Particles */}
      <Particles 
        preset="floating"
        density="low"
        className="fixed inset-0 -z-10"
        paused={status !== 'idle'}
      />

      {/* Success Confetti */}
      <OCRParticles 
        trigger={showSuccess}
        className="fixed inset-0 z-50 pointer-events-none"
      />

      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">영수증 분할 계산기</h1>
        <OCRStatusFlip status={status} />
      </div>

      {/* File Upload Area */}
      <UploadBorderBeam
        isDragOver={false}
        isUploading={status === 'uploading'}
        hasError={status === 'error'}
        onDrop={handleFileUpload}
        accept="image/*"
        className="min-h-[200px] flex items-center justify-center"
      >
        <div className="text-center space-y-4">
          <div className="text-4xl">📸</div>
          <div>
            <p className="text-lg font-medium">
              {status === 'uploading' ? '업로드 중...' : '영수증 사진을 여기에 드래그하거나 클릭하세요'}
            </p>
            <p className="text-sm text-muted-foreground">
              JPG, PNG, HEIC 파일을 지원합니다
            </p>
          </div>
        </div>
      </UploadBorderBeam>

      {/* Progress Section */}
      {(status === 'uploading' || status === 'processing' || status === 'analyzing') && (
        <div className="space-y-4">
          <OCRProgress 
            stage={status}
            progress={status === 'uploading' ? progress : undefined}
          />
        </div>
      )}

      {/* OCR Results */}
      {status === 'complete' && ocrResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">인식된 항목들</h2>
            <div className="flex gap-2">
              <ShinyButton
                variant="outline"
                size="sm"
                onClick={() => setSelectedItems(ocrResults.map(r => r.item))}
              >
                전체 선택
              </ShinyButton>
              <ShinyButton
                variant="outline"
                size="sm"
                onClick={() => setSelectedItems([])}
              >
                전체 해제
              </ShinyButton>
            </div>
          </div>

          <AnimatedList className="space-y-2">
            {ocrResults.map((result, index) => (
              <OCRResultItem
                key={`${result.item}-${index}`}
                item={result.item}
                price={result.price}
                isSelected={selectedItems.includes(result.item)}
                onSelect={handleItemSelect}
                onPriceChange={handlePriceChange}
              />
            ))}
          </AnimatedList>
        </div>
      )}

      {/* Split Configuration */}
      {status === 'complete' && selectedItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">분할 설정</h2>
          
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">인원 수:</label>
            <div className="flex items-center gap-2">
              <OCRButton
                action="reset"
                size="icon"
                onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                disabled={splitCount <= 1}
              >
                -
              </OCRButton>
              <span className="w-8 text-center font-mono">{splitCount}</span>
              <OCRButton
                action="calculate"
                size="icon"
                onClick={() => setSplitCount(splitCount + 1)}
              >
                +
              </OCRButton>
            </div>
          </div>

          {/* Cost Display */}
          <SplitResultTicker
            totalAmount={totalAmount}
            splitCount={splitCount}
            currency="KRW"
            animated={true}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <OCRButton
          action="upload"
          onClick={() => setStatus('idle')}
          disabled={status !== 'complete'}
        >
          다른 영수증 분석
        </OCRButton>

        {status === 'complete' && (
          <ShinyButton
            variant="default"
            success={showSuccess}
            onClick={() => {
              setShowSuccess(true)
              setTimeout(() => setShowSuccess(false), 2000)
            }}
          >
            결과 공유하기
          </ShinyButton>
        )}
      </div>
    </div>
  )
}

// Individual component examples
export const ComponentExamples: React.FC = () => {
  const [tickerValue, setTickerValue] = useState(12500)
  const [flipTextIndex, setFlipTextIndex] = useState(0)
  
  const flipTexts = ['처리 중...', '분석 중...', '완료!']

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      
      {/* Cost Ticker Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Cost Ticker Components</h3>
        <div className="space-y-2">
          <CostTicker amount={tickerValue} size="xl" variant="success" />
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
            onClick={() => setTickerValue(prev => prev + 1000)}
          >
            +1000원
          </button>
        </div>
      </section>

      {/* Text Animation Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Text Animations</h3>
        <div className="space-y-4">
          <OCRStatusFlip status="processing" />
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
            onClick={() => setFlipTextIndex((prev) => (prev + 1) % flipTexts.length)}
          >
            다음 상태
          </button>
        </div>
      </section>

      {/* Button Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Interactive Buttons</h3>
        <div className="flex gap-4 flex-wrap">
          <OCRButton action="upload" />
          <OCRButton action="process" />
          <OCRButton action="analyze" />
          <OCRButton action="calculate" />
          <ShinyButton variant="outline">Shiny Outline</ShinyButton>
        </div>
      </section>

      {/* Particles Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Background Effects</h3>
        <div className="relative h-32 border rounded-lg overflow-hidden">
          <Particles preset="stars" density="medium" />
          <div className="relative z-10 flex items-center justify-center h-full">
            <span className="text-lg font-medium">Stars Background</span>
          </div>
        </div>
      </section>

    </div>
  )
}