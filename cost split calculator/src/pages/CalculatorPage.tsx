import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RotateCcw } from 'lucide-react'
import { UploadBorderBeam } from '@/components/magicui/border-beam'
import { ShinyButton } from '@/components/magicui/shiny-button'
import { BillItem, Participant } from '@/types'

export const CalculatorPage = () => {
  const [step, setStep] = useState(1)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrComplete, setOcrComplete] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [uploadError, setUploadError] = useState<string>('')
  const [ocrError, setOcrError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0]
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setUploadError('지원되지 않는 파일 형식입니다. 이미지 파일만 업로드 가능합니다.')
        return
      }
      
      // Reset errors
      setUploadError('')
      setOcrError('')
      setUploadedFile(file)
      
      // Simulate OCR processing
      setTimeout(() => {
        setIsProcessing(false)
        
        // Simulate OCR failure for blurry images
        if (file.name.includes('blurry')) {
          setOcrError('이미지가 흐릿하여 OCR 처리에 실패했습니다.')
          setOcrComplete(false)
          return
        }
        
        setOcrComplete(true)
        // Add sample bill items
        setBillItems([
          { id: '1', name: '커피', price: 4500, quantity: 2, category: '음료' },
          { id: '2', name: '샌드위치', price: 7800, quantity: 1, category: '음식' },
          { id: '3', name: '케이크', price: 5200, quantity: 1, category: '디저트' }
        ])
      }, 2000)
      setIsProcessing(true)
    }
  }

  const addParticipant = () => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: '',
      email: '',
      share: 0
    }
    setParticipants([...participants, newParticipant])
  }

  const updateParticipant = (id: string, name: string) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, name } : p
    ))
  }

  const assignItemToParticipant = (itemId: string, participantIndex: number) => {
    setBillItems(billItems.map(item => {
      if (item.id === itemId) {
        const assignedParticipants = item.assignedParticipants || []
        const participantId = participants[participantIndex]?.id
        if (participantId && !assignedParticipants.includes(participantId)) {
          return { ...item, assignedParticipants: [...assignedParticipants, participantId] }
        }
      }
      return item
    }))
  }

  const calculateSplit = () => {
    console.log('Calculating split...', { participants, billItems })
    setStep(4)
  }

  const resetCalculator = () => {
    setStep(1)
    setUploadedFile(null)
    setIsProcessing(false)
    setOcrComplete(false)
    setParticipants([])
    setBillItems([])
    setUploadError('')
    setOcrError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tech-subtitle">1단계: 영수증 업로드</h2>
            <UploadBorderBeam
              data-testid="upload-zone"
              onDrop={handleFileUpload}
              accept="image/*"
              className="p-8 text-center border-2 border-dashed rounded-lg cursor-pointer hover:border-primary"
              role="button"
              aria-label="영수증 이미지 업로드 영역"
              aria-describedby="upload-description"
              tabIndex={0}
            >
              <div className="space-y-2">
                <p className="text-lg">영수증 이미지를 드롭하거나 클릭해서 업로드하세요</p>
                <p id="upload-description" className="text-sm text-muted-foreground">JPG, PNG, HEIC 파일을 지원합니다</p>
              </div>
            </UploadBorderBeam>
            
            {uploadError && (
              <div data-testid="upload-error" className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="polite">
                <p className="text-red-800">❌ {uploadError}</p>
              </div>
            )}
            
            {uploadedFile && !uploadError && (
              <div data-testid="upload-success" className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">✅ {uploadedFile.name} 업로드 완료</p>
              </div>
            )}
            
            {uploadedFile && (
              <Button
                variant="industrial"
                data-testid="next-button"
                onClick={() => setStep(2)}
                className="w-full"
              >
                다음 단계
              </Button>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tech-subtitle">2단계: OCR 처리 중...</h2>
            {isProcessing && (
              <div data-testid="ocr-progress" className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <p>영수증을 분석하는 중입니다...</p>
                </div>
              </div>
            )}
            
            {ocrError && (
              <div data-testid="ocr-error" className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">❌ {ocrError}</p>
                <Button 
                  data-testid="retry-button" 
                  onClick={() => {
                    setOcrError('')
                    setStep(1)
                  }}
                  className="mt-2"
                  size="sm"
                >
                  다시 시도
                </Button>
              </div>
            )}
            
            {ocrComplete && !ocrError && (
              <div data-testid="ocr-complete" className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">✅ OCR 처리 완료! {billItems.length}개 항목을 찾았습니다.</p>
              </div>
            )}
            
            {ocrComplete && (
              <Button
                variant="industrial"
                data-testid="next-button"
                onClick={() => setStep(3)}
                className="w-full"
              >
                다음 단계
              </Button>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold tech-subtitle">3단계: 참가자 및 항목 설정</h2>
            
            {/* 참가자 추가 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">참가자</h3>
                <Button 
                  data-testid="add-participant-button"
                  onClick={addParticipant}
                  variant="outline"
                  size="sm"
                >
                  + 참가자 추가
                </Button>
              </div>
              
              {participants.map((participant, index) => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <Label>참가자 {index + 1}</Label>
                  <Input
                    data-testid={`participant-name-${index + 1}`}
                    placeholder="이름 입력"
                    value={participant.name}
                    onChange={(e) => updateParticipant(participant.id, e.target.value)}
                    aria-label={`참가자 ${index + 1} 이름`}
                  />
                </div>
              ))}
            </div>

            {/* 영수증 항목 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">영수증 항목</h3>
              {billItems.map((item, index) => (
                <Card key={item.id} data-testid="bill-item" className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.price.toLocaleString()}원 x {item.quantity}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {participants.map((participant, pIndex) => (
                        <Button
                          key={participant.id}
                          data-testid={`bill-item-${index}`}
                          variant="outline"
                          size="sm"
                          onClick={() => assignItemToParticipant(item.id, pIndex)}
                        >
                          <span data-testid={`assign-participant-${pIndex}`}>
                            {participant.name || `참가자 ${pIndex + 1}`}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {participants.length > 0 && billItems.length > 0 && (
              <Button
                variant="industrial"
                data-testid="calculate-button"
                onClick={calculateSplit}
                className="w-full"
              >
                계산하기
              </Button>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-4" data-testid="results-section">
            <h2 className="text-xl font-semibold tech-subtitle">4단계: 계산 결과</h2>
            <Card className="p-4" data-testid="calculation-results">
              <h3 className="text-lg font-medium mb-4">분할 결과</h3>
              {participants.map((participant, index) => {
                const total = billItems.reduce((sum, item) => {
                  const assigned = item.assignedParticipants?.includes(participant.id)
                  return assigned ? sum + (item.price * item.quantity) : sum
                }, 0)
                return (
                  <div key={participant.id} className="flex justify-between items-center py-2">
                    <span data-testid={`participant-result-${index}`}>
                      {participant.name || `참가자 ${index + 1}`}
                    </span>
                    <Badge data-testid={`amount-result-${index}`}>
                      {total.toLocaleString()}원
                    </Badge>
                  </div>
                )
              })}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center font-bold">
                  <span>총 금액</span>
                  <span data-testid="total-amount">
                    {billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}원
                  </span>
                </div>
              </div>
            </Card>
            
            {/* Settlement Suggestions */}
            <Card className="p-4" data-testid="settlement-suggestions">
              <h3 className="text-lg font-medium mb-4">정산 제안</h3>
              <div className="space-y-2">
                {participants.map((participant, index) => {
                  const total = billItems.reduce((sum, item) => {
                    const assigned = item.assignedParticipants?.includes(participant.id)
                    return assigned ? sum + (item.price * item.quantity) : sum
                  }, 0)
                  
                  if (total === 0) return null
                  
                  return (
                    <div key={participant.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{participant.name || `참가자 ${index + 1}`}</span>
                      <span className="font-medium">{total.toLocaleString()}원 지불</span>
                    </div>
                  )
                })}
              </div>
            </Card>
            
            <div className="flex space-x-2">
              <Button 
                variant="industrial"
                data-testid="save-result-button"
                onClick={() => console.log('Saving result...')}
                className="flex-1"
              >
                결과 저장
              </Button>
              <Button 
                variant="outline"
                data-testid="share-result-button"
                onClick={() => console.log('Sharing result...')}
                className="flex-1 hover:bg-accent"
              >
                결과 공유
              </Button>
            </div>
          </div>
        )

      default:
        return <div>알 수 없는 단계</div>
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl" data-testid="calculator-page">
      <Card className="steel-panel animated-border">
        <CardHeader className="hud-element rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="tech-title">스마트 영수증 분할 계산기</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={resetCalculator}
              className="flex items-center space-x-2"
              data-testid="reset-button"
              aria-label="계산기 초기화"
            >
              <RotateCcw className="h-4 w-4" />
              <span>초기화</span>
            </Button>
          </div>
          <div className="flex space-x-2 mt-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-primary text-white' 
                    : 'bg-muted text-foreground'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  )
}

export default CalculatorPage