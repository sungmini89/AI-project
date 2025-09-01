import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ 
  className, 
  size = 'md', 
  text = '로딩 중...' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[200px] gap-3",
      className
    )}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

// 인라인 스피너 (작은 크기)
export function InlineSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-block w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-current",
        className
      )}
    />
  )
}

// 페이지 로딩 스피너 (전체 화면)
export function PageLoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <LoadingSpinner 
        size="lg" 
        text="페이지를 불러오는 중..." 
        className="min-h-0"
      />
    </div>
  )
}

// 컴포넌트 로딩 스피너 (카드 내부)
export function ComponentLoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
      <LoadingSpinner 
        size="sm" 
        text={text || "컴포넌트 로딩 중..."} 
        className="min-h-0"
      />
    </div>
  )
}