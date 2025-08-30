import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TypingIndicatorProps {
  users: string[]
  className?: string
}

export function TypingIndicator({ users, className }: TypingIndicatorProps) {
  if (users.length === 0) return null

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0]}님이 입력 중`
    } else if (users.length === 2) {
      return `${users[0]}님과 ${users[1]}님이 입력 중`
    } else {
      return `${users[0]}님 외 ${users.length - 1}명이 입력 중`
    }
  }

  return (
    <div className={cn("flex justify-start w-full mb-4", className)}>
      <Card className="py-2 px-4 bg-muted max-w-[200px]">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {getTypingText()}
          </div>
        </div>
      </Card>
    </div>
  )
}