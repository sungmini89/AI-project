import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useTaskStore } from '@/stores'
import { nlpService } from '@/services/nlpService'
import { cn } from '@/utils'

interface TaskQuickAddProps {
  className?: string
}

export default function TaskQuickAdd({ className }: TaskQuickAddProps) {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { addTask } = useTaskStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isProcessing) return

    setIsProcessing(true)
    
    try {
      const parsed = await nlpService.processInput(input.trim())
      
      addTask({
        title: parsed.title,
        category: parsed.category,
        priority: parsed.priority,
        dueDate: parsed.dueDate,
        estimatedTime: parsed.estimatedTime,
        tags: parsed.tags,
        status: 'todo'
      })
      
      setInput('')
    } catch (error) {
      console.error('할일 추가 중 오류:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="relative">
        <Input
          type="text"
          placeholder="자연어로 할일을 입력하세요. 예: 내일 오후 3시에 병원 가기"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isProcessing}
          className="pr-12"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!input.trim() || isProcessing}
          className="absolute right-1 top-1 h-8 w-8 p-0"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {input && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>💡 팁: "긴급", "내일", "오후 3시", "#중요" 같은 키워드를 사용해보세요</p>
        </div>
      )}
    </form>
  )
}