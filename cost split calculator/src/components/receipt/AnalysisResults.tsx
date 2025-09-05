import React, { useState } from 'react'
import { 
  Check, 
  X, 
  Edit3, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  ShoppingCart,
  TrendingUp
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ReceiptAnalysisResult, ReceiptItem } from '@/services/receiptAnalyzer'

interface AnalysisResultsProps {
  result: ReceiptAnalysisResult
  onItemToggle?: (itemId: string, selected: boolean) => void
  onItemEdit?: (item: ReceiptItem) => void
  onItemDelete?: (itemId: string) => void
  onAddItem?: () => void
  onRetry?: () => void
  onUseResults?: (selectedItems: ReceiptItem[]) => void
  className?: string
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  onItemToggle,
  onItemEdit,
  onItemDelete,
  onAddItem,
  onRetry,
  onUseResults,
  className = ''
}) => {
  const [showRawText, setShowRawText] = useState(false)
  const [filter, setFilter] = useState<'all' | 'selected' | 'unselected'>('all')

  const selectedItems = result.items.filter(item => item.isSelected)
  const selectedTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const filteredItems = result.items.filter(item => {
    switch (filter) {
      case 'selected':
        return item.isSelected
      case 'unselected':
        return !item.isSelected
      default:
        return true
    }
  })

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge className="bg-green-900/50 text-green-300">높음</Badge>
    } else if (confidence >= 0.6) {
      return <Badge className="bg-yellow-900/50 text-yellow-300">보통</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">낮음</Badge>
    }
  }

  const getSourceBadge = (source: ReceiptItem['source']) => {
    switch (source) {
      case 'ai':
        return <Badge className="bg-purple-100 text-purple-800">AI</Badge>
      case 'ocr':
        return <Badge className="bg-blue-900/50 text-blue-300">OCR</Badge>
      case 'manual':
        return <Badge className="bg-gray-100 text-gray-800">수동</Badge>
      default:
        return null
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 및 요약 정보 */}
      <div className="steel-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">분석 결과</h2>
              <p className="text-sm text-gray-600">
                {result.items.length}개 항목 발견, {selectedItems.length}개 선택됨
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="tech-border"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 분석
              </Button>
            )}
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">총 항목</div>
            <div className="text-xl font-bold text-blue-800">{result.items.length}</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium">선택된 항목</div>
            <div className="text-xl font-bold text-green-800">{selectedItems.length}</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">선택 총액</div>
            <div className="text-xl font-bold text-purple-800">{formatPrice(selectedTotal)}</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-sm text-orange-600 font-medium">신뢰도</div>
            <div className="text-xl font-bold text-orange-800">{(result.confidence * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* 필터 및 액션 버튼 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">필터:</span>
            {[
              { key: 'all', label: '전체', count: result.items.length },
              { key: 'selected', label: '선택됨', count: selectedItems.length },
              { key: 'unselected', label: '선택 안됨', count: result.items.length - selectedItems.length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  filter === key
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-muted border-border text-foreground hover:bg-muted/80'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {onAddItem && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddItem}
              className="tech-border"
            >
              <Plus className="w-4 h-4 mr-2" />
              항목 추가
            </Button>
          )}
        </div>
      </div>

      {/* 항목 목록 */}
      <div className="steel-panel">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">추출된 항목</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredItems.map((item, index) => (
            <div 
              key={item.id}
              className={`p-4 transition-colors ${
                item.isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* 선택 체크박스 */}
                  <button
                    onClick={() => onItemToggle?.(item.id, !item.isSelected)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      item.isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {item.isSelected && <Check className="w-3 h-3" />}
                  </button>

                  {/* 항목 정보 */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-800">{item.name}</span>
                      {getSourceBadge(item.source)}
                      {getConfidenceBadge(item.confidence)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>개당 {formatPrice(item.price)}</span>
                      <span>수량 {item.quantity}개</span>
                      <span className="font-medium text-blue-600">
                        합계 {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center space-x-1">
                  {onItemEdit && (
                    <button
                      onClick={() => onItemEdit(item)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded"
                      title="편집"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  
                  {onItemDelete && (
                    <button
                      onClick={() => onItemDelete(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>표시할 항목이 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 원본 텍스트 및 추가 정보 */}
      <div className="steel-panel p-4">
        <button
          onClick={() => setShowRawText(!showRawText)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          {showRawText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>원본 OCR 텍스트 {showRawText ? '숨기기' : '보기'}</span>
        </button>

        {showRawText && (
          <div className="mt-3 p-4 bg-gray-100 rounded-lg border">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {result.rawText || '원본 텍스트가 없습니다'}
            </pre>
          </div>
        )}

        {/* 경고 메시지 */}
        {result.warnings && result.warnings.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-1">주의사항</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {result.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 오류 및 제안사항 */}
        {result.errors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">오류</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {result.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {result.suggestions.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">제안사항</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 처리 정보 */}
        <div className="mt-4 space-y-2">
          <div className="text-xs text-gray-500 space-x-4">
            <span>처리 시간: {result.processingTime}ms</span>
            <span>사용된 서비스: {result.usedServices.join(', ')}</span>
            <span>처리된 항목: {result.processedItems || 0}개</span>
          </div>
          
          <div className="text-xs text-gray-500 space-x-4">
            <span>OCR 신뢰도: {(result.ocrConfidence * 100).toFixed(1)}%</span>
            {result.aiConfidence && (
              <span>AI 신뢰도: {(result.aiConfidence * 100).toFixed(1)}%</span>
            )}
            <span>전체 신뢰도: {(result.confidence * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      {onUseResults && selectedItems.length > 0 && (
        <div className="steel-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">
                {selectedItems.length}개 항목을 계산기로 가져오기
              </p>
              <p className="text-sm text-gray-600">
                총 {formatPrice(selectedTotal)}
              </p>
            </div>
            
            <Button
              onClick={() => onUseResults(selectedItems)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              계산기로 가져오기
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalysisResults