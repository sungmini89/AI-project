import React from 'react'
import { Progress } from '@/components/ui/progress'
import { 
  Loader2, 
  FileText, 
  Brain, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Cpu,
  Database
} from 'lucide-react'
import type { AnalysisProgress as AnalysisProgressType } from '@/services/receiptAnalyzer'

interface AnalysisProgressProps {
  progress: AnalysisProgressType
  className?: string
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ 
  progress, 
  className = '' 
}) => {
  const getStageIcon = (stage: AnalysisProgressType['stage'], subStage?: string) => {
    const iconClass = "w-5 h-5"
    
    switch (stage) {
      case 'initializing':
        return <Cpu className={`${iconClass} text-blue-500 animate-pulse`} />
      case 'ocr':
        if (subStage === 'recognizing') {
          return <Eye className={`${iconClass} text-green-500 animate-bounce`} />
        }
        return <FileText className={`${iconClass} text-blue-500`} />
      case 'ai_enhancement':
        return <Brain className={`${iconClass} text-purple-500 animate-pulse`} />
      case 'processing':
        return <Database className={`${iconClass} text-orange-500`} />
      case 'complete':
        return <CheckCircle className={`${iconClass} text-green-500`} />
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-500`} />
      default:
        return <Search className={`${iconClass} text-gray-500`} />
    }
  }

  const getProgressColor = (stage: AnalysisProgressType['stage']) => {
    switch (stage) {
      case 'initializing':
        return 'bg-blue-500'
      case 'ocr':
        return 'bg-green-500'
      case 'ai_enhancement':
        return 'bg-purple-500'
      case 'processing':
        return 'bg-orange-500'
      case 'complete':
        return 'bg-green-600'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStageTitle = (stage: AnalysisProgressType['stage']) => {
    switch (stage) {
      case 'initializing':
        return '초기화'
      case 'ocr':
        return 'OCR 텍스트 인식'
      case 'ai_enhancement':
        return 'AI 결과 개선'
      case 'processing':
        return '결과 처리'
      case 'complete':
        return '분석 완료'
      case 'error':
        return '오류 발생'
      default:
        return '처리 중'
    }
  }

  const getSubStageDescription = (subStage?: string) => {
    if (!subStage) return ''
    
    switch (subStage) {
      case 'loading':
        return '엔진 로딩 중...'
      case 'recognizing':
        return '텍스트 인식 중...'
      case 'processing':
        return 'AI 분석 중...'
      case 'extracting':
        return '항목 추출 중...'
      case 'finalizing':
        return '결과 정리 중...'
      case 'merging':
        return '데이터 통합 중...'
      case 'complete':
        return '완료'
      case 'finished':
        return '모든 작업 완료'
      case 'error':
        return '오류 발생'
      default:
        return subStage
    }
  }

  return (
    <div className={`steel-panel p-6 space-y-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {progress.stage === 'complete' ? (
            getStageIcon(progress.stage)
          ) : (
            <div className="animate-spin">
              <Loader2 className="w-5 h-5 text-blue-500" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-800">
              {getStageTitle(progress.stage)}
            </h3>
            {progress.subStage && (
              <p className="text-sm text-gray-600">
                {getSubStageDescription(progress.subStage)}
              </p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-gray-800">
            {progress.progress.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500">
            {progress.stage === 'complete' ? '완료' : '진행 중'}
          </div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="space-y-2">
        <div className="relative">
          <Progress 
            value={progress.progress} 
            className="h-3 tech-border" 
          />
          <div 
            className={`absolute top-0 left-0 h-full rounded transition-all duration-300 ${getProgressColor(progress.stage)}`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>
        
        {/* 메시지 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700 font-medium">
            {progress.message}
          </span>
          {progress.stage !== 'complete' && progress.stage !== 'error' && (
            <span className="text-gray-500 animate-pulse">
              처리 중...
            </span>
          )}
        </div>
      </div>

      {/* 단계별 진행 상황 */}
      <div className="grid grid-cols-4 gap-2 mt-6">
        {[
          { key: 'initializing', label: '초기화', icon: Cpu },
          { key: 'ocr', label: 'OCR', icon: FileText },
          { key: 'ai_enhancement', label: 'AI 개선', icon: Brain },
          { key: 'processing', label: '처리', icon: Database }
        ].map(({ key, label, icon: Icon }) => {
          const isActive = progress.stage === key
          const isCompleted = ['initializing', 'ocr', 'ai_enhancement', 'processing'].indexOf(progress.stage) > 
                             ['initializing', 'ocr', 'ai_enhancement', 'processing'].indexOf(key)
          
          return (
            <div
              key={key}
              className={`flex flex-col items-center p-2 rounded transition-all ${
                isActive 
                  ? 'bg-blue-100 border-2 border-blue-300' 
                  : isCompleted 
                    ? 'bg-green-100 border-2 border-green-300' 
                    : 'bg-gray-100 border-2 border-gray-200'
              }`}
            >
              <Icon 
                className={`w-4 h-4 mb-1 ${
                  isActive 
                    ? 'text-blue-600' 
                    : isCompleted 
                      ? 'text-green-600' 
                      : 'text-gray-400'
                }`} 
              />
              <span 
                className={`text-xs font-medium ${
                  isActive 
                    ? 'text-blue-800' 
                    : isCompleted 
                      ? 'text-green-800' 
                      : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* 에러 상태 */}
      {progress.stage === 'error' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-800">분석 중 오류가 발생했습니다</span>
          </div>
        </div>
      )}

      {/* 완료 상태 */}
      {progress.stage === 'complete' && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-800">영수증 분석이 완료되었습니다!</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalysisProgress