import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  Users, 
  Calculator, 
  CheckCircle,
  AlertCircle,
  Edit,
  Plus,
  Trash2,
  Camera,
  Type,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'

// 영수증 OCR 컴포넌트들
import ReceiptUploader from '@/components/receipt/ReceiptUploader'
import AnalysisProgress from '@/components/receipt/AnalysisProgress'
import AnalysisResults from '@/components/receipt/AnalysisResults'

// 서비스 및 타입
import receiptAnalyzer, { type ReceiptItem, type ReceiptAnalysisResult, type AnalysisProgress as AnalysisProgressType } from '@/services/receiptAnalyzer'
import { historyService } from '@/services/historyService'
import { type BillItem, type Participant } from '@/types'

interface EnhancedCalculatorPageProps {
  className?: string
}

type CalculatorStep = 'input' | 'participants' | 'results'
type InputMethod = 'receipt' | 'manual'

const EnhancedCalculatorPage: React.FC<EnhancedCalculatorPageProps> = ({ 
  className = '' 
}) => {
  // 상태 관리
  const [currentStep, setCurrentStep] = useState<CalculatorStep>('input')
  const [inputMethod, setInputMethod] = useState<InputMethod>('receipt')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [calculationName, setCalculationName] = useState('')
  const [calculationStatus, setCalculationStatus] = useState<'pending' | 'completed' | 'shared'>('pending')
  
  // OCR 관련 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgressType | null>(null)
  const [analysisResult, setAnalysisResult] = useState<ReceiptAnalysisResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // 영수증 업로드 및 분석
  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file)
    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const result = await receiptAnalyzer.analyzeReceipt(
        file,
        (progress) => {
          setAnalysisProgress(progress)
        }
      )
      
      setAnalysisResult(result)
      
      // 분석 결과를 BillItem 형태로 변환
      const convertedItems: BillItem[] = result.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        assignedParticipants: []
      }))
      
      setBillItems(convertedItems)
      
      if (result.items.length > 0) {
        // 분석 성공 시 참가자 단계로 이동
        setTimeout(() => {
          setCurrentStep('participants')
        }, 1500)
      }
      
    } catch (error) {
      console.error('영수증 분석 실패:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  // 분석 결과에서 선택된 항목들을 계산기로 가져오기
  const handleUseAnalysisResults = useCallback((selectedItems: ReceiptItem[]) => {
    console.log('📋 계산기로 가져오기 버튼 클릭됨', selectedItems)
    const convertedItems: BillItem[] = selectedItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      assignedParticipants: []
    }))
    
    setBillItems(convertedItems)
    setCurrentStep('participants')
  }, [])

  // 항목 선택/해제 토글
  const handleItemToggle = useCallback((itemId: string, selected: boolean) => {
    if (!analysisResult) return
    
    const updatedResult = {
      ...analysisResult,
      items: analysisResult.items.map(item => 
        item.id === itemId ? { ...item, isSelected: selected } : item
      )
    }
    
    setAnalysisResult(updatedResult)
  }, [analysisResult])

  // 분석 재시작
  const handleRetryAnalysis = useCallback(() => {
    console.log('🔄 분석 재시작 버튼 클릭됨', selectedFile)
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }, [selectedFile, handleFileSelect])

  // 영수증 분석 항목 편집
  const handleItemEdit = useCallback((item: ReceiptItem) => {
    console.log('✏️ 항목 편집 버튼 클릭됨', item)
    if (!analysisResult) return
    
    const updatedResult = {
      ...analysisResult,
      items: analysisResult.items.map(existingItem => 
        existingItem.id === item.id ? item : existingItem
      )
    }
    
    setAnalysisResult(updatedResult)
  }, [analysisResult])

  // 영수증 분석 항목 삭제
  const handleItemDelete = useCallback((itemId: string) => {
    console.log('🗑️ 항목 삭제 버튼 클릭됨', itemId)
    if (!analysisResult) return
    
    const updatedResult = {
      ...analysisResult,
      items: analysisResult.items.filter(item => item.id !== itemId)
    }
    
    setAnalysisResult(updatedResult)
  }, [analysisResult])

  // 영수증 분석 항목 추가
  const handleAddItem = useCallback(() => {
    console.log('➕ 항목 추가 버튼 클릭됨')
    if (!analysisResult) return
    
    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      quantity: 1,
      confidence: 1.0,
      source: 'manual',
      isSelected: true
    }
    
    const updatedResult = {
      ...analysisResult,
      items: [...analysisResult.items, newItem]
    }
    
    setAnalysisResult(updatedResult)
  }, [analysisResult])

  // 수동 항목 추가
  const addManualItem = useCallback(() => {
    const newItem: BillItem = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      quantity: 1,
      assignedParticipants: []
    }
    setBillItems(prev => [...prev, newItem])
  }, [])

  // 항목 수정
  const updateBillItem = useCallback((id: string, updates: Partial<BillItem>) => {
    setBillItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }, [])

  // 항목 삭제
  const deleteBillItem = useCallback((id: string) => {
    setBillItems(prev => prev.filter(item => item.id !== id))
  }, [])

  // 참가자 추가
  const addParticipant = useCallback(() => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: '',
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }
    setParticipants(prev => [...prev, newParticipant])
  }, [])

  // 참가자 수정
  const updateParticipant = useCallback((id: string, updates: Partial<Participant>) => {
    setParticipants(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ))
  }, [])

  // 참가자 삭제
  const deleteParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id))
    // 해당 참가자에게 할당된 항목들도 업데이트
    setBillItems(prev => prev.map(item => ({
      ...item,
      assignedParticipants: item.assignedParticipants?.filter(pid => pid !== id) || []
    })))
  }, [])

  // 항목을 참가자에게 할당
  const toggleItemAssignment = useCallback((itemId: string, participantId: string) => {
    setBillItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const assignedParticipants = item.assignedParticipants || []
        const isAssigned = assignedParticipants.includes(participantId)
        
        return {
          ...item,
          assignedParticipants: isAssigned 
            ? assignedParticipants.filter(id => id !== participantId)
            : [...assignedParticipants, participantId]
        }
      }
      return item
    }))
  }, [])

  // 계산 실행
  const handleCalculate = useCallback(() => {
    setCurrentStep('results')
  }, [])

  // 단계별 렌더링 함수들
  const renderInputStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">항목 입력 방법 선택</h2>
        <p className="text-gray-600">영수증을 촬영하거나 직접 입력하세요</p>
      </div>

      <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as InputMethod)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receipt" className="flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span>영수증 촬영</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <Type className="w-4 h-4" />
            <span>직접 입력</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receipt" className="space-y-6 mt-6">
          <ReceiptUploader
            onFileSelect={handleFileSelect}
            isProcessing={isAnalyzing}
          />
          
          {analysisProgress && (
            <AnalysisProgress 
              progress={analysisProgress}
            />
          )}
          
          {analysisResult && (
            <AnalysisResults
              result={analysisResult}
              onItemToggle={handleItemToggle}
              onItemEdit={handleItemEdit}
              onItemDelete={handleItemDelete}
              onAddItem={handleAddItem}
              onRetry={handleRetryAnalysis}
              onUseResults={handleUseAnalysisResults}
            />
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-6 mt-6">
          <div className="steel-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">수동 입력</h3>
              <Button
                onClick={addManualItem}
                variant="outline"
                className="tech-border"
              >
                <Plus className="w-4 h-4 mr-2" />
                항목 추가
              </Button>
            </div>
            
            <div className="space-y-4">
              {billItems.map((item, index) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Label>항목명</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateBillItem(item.id, { name: e.target.value })}
                        placeholder="항목명을 입력하세요"
                      />
                    </div>
                    <div>
                      <Label>가격</Label>
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateBillItem(item.id, { price: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <Label>수량</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateBillItem(item.id, { quantity: Number(e.target.value) })}
                          min="1"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBillItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {billItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Type className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>항목을 추가해주세요</p>
                </div>
              )}
            </div>
          </div>
          
          {billItems.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep('participants')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                다음 단계
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )

  const renderParticipantsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">참가자 및 항목 할당</h2>
          <p className="text-gray-600">참가자를 추가하고 각 항목을 할당하세요</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setCurrentStep('input')}
          className="tech-border"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          이전 단계
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 참가자 관리 */}
        <Card className="steel-panel">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>참가자</span>
              </span>
              <Button
                onClick={addParticipant}
                size="sm"
                variant="outline"
                className="tech-border"
              >
                <Plus className="w-4 h-4 mr-1" />
                추가
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {participants.map((participant, index) => (
              <div key={participant.id} className="flex items-center space-x-3">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: participant.color }}
                />
                <Input
                  value={participant.name}
                  onChange={(e) => updateParticipant(participant.id, { name: e.target.value })}
                  placeholder={`참가자 ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteParticipant(participant.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            {participants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>참가자를 추가해주세요</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 항목 할당 */}
        <Card className="steel-panel">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="w-5 h-5" />
              <span>항목 할당</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {billItems.map((item) => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.price.toLocaleString()}원 × {item.quantity} = {(item.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {participants.map((participant) => {
                    const isAssigned = item.assignedParticipants?.includes(participant.id) || false
                    return (
                      <button
                        key={participant.id}
                        onClick={() => toggleItemAssignment(item.id, participant.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          isAssigned
                            ? 'bg-blue-900/50 text-blue-300 border-2 border-blue-300'
                            : 'bg-muted text-foreground border-2 border-border hover:bg-muted/80'
                        }`}
                      >
                        {participant.name || `참가자 ${participants.indexOf(participant) + 1}`}
                      </button>
                    )
                  })}
                </div>
                
                {(!item.assignedParticipants || item.assignedParticipants.length === 0) && (
                  <p className="text-sm text-amber-600 mt-2">⚠️ 참가자를 선택해주세요</p>
                )}
              </div>
            ))}
            
            {billItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>할당할 항목이 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {participants.length > 0 && billItems.length > 0 && billItems.every(item => item.assignedParticipants && item.assignedParticipants.length > 0) && (
        <div className="flex justify-center">
          <Button
            onClick={handleCalculate}
            className="bg-green-600 hover:bg-green-700 px-8 py-3"
          >
            <Calculator className="w-5 h-5 mr-2" />
            계산하기
          </Button>
        </div>
      )}
    </div>
  )

  const renderResultsStep = () => {
    const totalAmount = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    const participantTotals = participants.map(participant => {
      const assignedItems = billItems.filter(item => item.assignedParticipants?.includes(participant.id))
      const total = assignedItems.reduce((sum, item) => {
        const splitCount = item.assignedParticipants?.length || 1
        return sum + ((item.price * item.quantity) / splitCount)
      }, 0)
      
      return {
        participant,
        total: Math.round(total),
        items: assignedItems
      }
    })

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">계산 결과</h2>
            <p className="text-gray-600">각 참가자별 지불 금액입니다</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentStep('participants')}
            className="tech-border"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            수정하기
          </Button>
        </div>

        <Card className="steel-panel">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>분할 결과</span>
              <Badge className="bg-blue-900/50 text-blue-300">
                총 {totalAmount.toLocaleString()}원
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 계산 이름 및 상태 입력 */}
            <div className="mb-6 p-4 bg-muted rounded-lg space-y-4">
              <div>
                <Label htmlFor="calculation-name" className="text-sm font-medium">
                  계산 이름 (선택사항)
                </Label>
                <Input
                  id="calculation-name"
                  type="text"
                  placeholder="예: 친구들과 저녁식사, 카페 모임..."
                  value={calculationName}
                  onChange={(e) => setCalculationName(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium block mb-2">
                  정산 상태
                </Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCalculationStatus('pending')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      calculationStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                        : 'bg-muted text-foreground border-2 border-transparent hover:bg-muted/80'
                    }`}
                  >
                    🟡 대기중 (계산만 완료)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalculationStatus('shared')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      calculationStatus === 'shared'
                        ? 'bg-blue-900/50 text-blue-300 border-2 border-blue-300'
                        : 'bg-muted text-foreground border-2 border-transparent hover:bg-muted/80'
                    }`}
                  >
                    🔵 공유됨 (정산 진행중)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalculationStatus('completed')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      calculationStatus === 'completed'
                        ? 'bg-green-900/50 text-green-300 border-2 border-green-300'
                        : 'bg-muted text-foreground border-2 border-transparent hover:bg-muted/80'
                    }`}
                  >
                    🟢 완료 (정산 완료)
                  </button>
                </div>
              </div>
            </div>

            {participantTotals.map(({ participant, total, items }) => (
              <div key={participant.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: participant.color }}
                    />
                    <span className="font-medium text-gray-800">
                      {participant.name || `참가자 ${participants.indexOf(participant) + 1}`}
                    </span>
                  </div>
                  <Badge className="bg-green-900/50 text-green-300 text-lg font-bold">
                    {total.toLocaleString()}원
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  {items.map(item => {
                    const splitCount = item.assignedParticipants?.length || 1
                    const splitAmount = Math.round((item.price * item.quantity) / splitCount)
                    return (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.name} 
                          {splitCount > 1 && ` (${splitCount}명 분할)`}
                        </span>
                        <span>{splitAmount.toLocaleString()}원</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => {
              // 새 계산 시작
              setCurrentStep('input')
              setInputMethod('receipt')
              setBillItems([])
              setParticipants([])
              setCalculationName('')
              setCalculationStatus('pending')
              setAnalysisResult(null)
              setSelectedFile(null)
            }}
            className="flex-1 tech-border"
          >
            새 계산하기
          </Button>
          <Button
            onClick={() => {
              // 계산 결과를 히스토리에 저장
              const calculationTitle = calculationName.trim() || 
                `${participants.length}명 계산 (${new Date().toLocaleDateString()})`
              
              const today = new Date().toISOString().split('T')[0]
              
              const savedItem = historyService.add({
                name: calculationTitle,
                date: today,
                total: totalAmount,
                participants: participants.length,
                items: billItems.length,
                status: calculationStatus,
                details: {
                  participantList: participants.map(p => p.name),
                  itemList: billItems.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                  })),
                  participantTotals: participantTotals.reduce((acc, { participant, total }) => {
                    acc[participant.name] = total
                    return acc
                  }, {} as { [name: string]: number })
                }
              })
              
              alert(`계산 결과가 저장되었습니다!\n제목: ${calculationTitle}`)
              
              // 새 계산을 위해 리셋
              setCurrentStep('input')
              setBillItems([])
              setParticipants([])
              setCalculationName('')
              setCalculationStatus('pending')
              setAnalysisResult(null)
              setSelectedFile(null)
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            결과 저장
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`container mx-auto p-4 max-w-6xl ${className}`}>
      <Card className="steel-panel animated-border">
        <CardHeader className="hud-element rounded-t-lg">
          <CardTitle className="tech-title flex items-center space-x-3">
            <Calculator className="w-6 h-6" />
            <span>스마트 영수증 분할 계산기</span>
          </CardTitle>
          
          {/* 진행 단계 표시 */}
          <div className="flex items-center space-x-4 mt-4">
            {[
              { key: 'input', label: '항목 입력', icon: Upload },
              { key: 'participants', label: '참가자 할당', icon: Users },
              { key: 'results', label: '계산 결과', icon: CheckCircle }
            ].map(({ key, label, icon: Icon }) => {
              const isActive = currentStep === key
              const isCompleted = ['input', 'participants', 'results'].indexOf(currentStep) > 
                               ['input', 'participants', 'results'].indexOf(key)
              
              return (
                <div
                  key={key}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-blue-900/50 text-blue-300 border border-blue-300' 
                      : isCompleted 
                        ? 'bg-green-900/50 text-green-300' 
                        : 'bg-muted text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              )
            })}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {currentStep === 'input' && renderInputStep()}
          {currentStep === 'participants' && renderParticipantsStep()}
          {currentStep === 'results' && renderResultsStep()}
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedCalculatorPage