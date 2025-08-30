import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types'
import { getLanguageName, SUPPORTED_LANGUAGES } from '@/lib/services/languageDetection'
import { Languages, Copy, Check, Loader2, CheckCheck, Clock, AlertCircle } from 'lucide-react'

interface MessageBubbleProps {
  message: ChatMessage
  isOwn: boolean
  userPreferredLanguage: string
}

export function MessageBubble({ message, isOwn, userPreferredLanguage }: MessageBubbleProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(userPreferredLanguage)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [copiedText, setCopiedText] = useState('')

  // Auto-select user's preferred language if translation exists
  useEffect(() => {
    if (message.translations[userPreferredLanguage]) {
      setSelectedLanguage(userPreferredLanguage)
    } else if (message.originalLanguage === userPreferredLanguage) {
      setSelectedLanguage('original')
    }
  }, [message, userPreferredLanguage])

  const getDisplayText = () => {
    if (selectedLanguage === 'original') {
      return message.originalText
    }
    return message.translations[selectedLanguage] || message.originalText
  }

  const getDisplayLanguage = () => {
    if (selectedLanguage === 'original') {
      return getLanguageName(message.originalLanguage)
    }
    return getLanguageName(selectedLanguage)
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(''), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const availableLanguages = [
    { code: 'original', name: `원문 (${getLanguageName(message.originalLanguage)})` },
    ...SUPPORTED_LANGUAGES
      .filter(lang => message.translations[lang.code])
      .map(lang => ({ code: lang.code, name: lang.native }))
  ]

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const getMessageStatus = () => {
    if (message.isTranslating) {
      return { icon: Loader2, text: '번역 중', className: 'animate-spin text-blue-500' }
    }
    if (message.translationError) {
      return { icon: AlertCircle, text: '전송 실패', className: 'text-red-500' }
    }
    if (message.readBy && message.readBy.length > 1) {
      return { icon: CheckCheck, text: '읽음', className: 'text-green-500' }
    }
    if (message.deliveredAt) {
      return { icon: Check, text: '전송됨', className: 'text-gray-500' }
    }
    return { icon: Clock, text: '전송 중', className: 'text-gray-400' }
  }

  return (
    <div className={cn(
      "flex w-full mb-4",
      isOwn ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] min-w-[200px]",
        isOwn ? "items-end" : "items-start"
      )}>
        {/* User name (for others' messages) */}
        {!isOwn && (
          <div className="text-sm text-muted-foreground mb-1 px-2">
            {message.userName}
          </div>
        )}

        <Card className={cn(
          "relative py-3 px-4 shadow-sm",
          isOwn 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-muted"
        )}>
          {/* Message content */}
          <div className="space-y-2">
            <div className="text-sm leading-relaxed">
              {getDisplayText()}
            </div>

            {/* Translation indicator */}
            {message.isTranslating && (
              <div className="flex items-center gap-2 text-xs opacity-75">
                <Loader2 className="h-3 w-3 animate-spin" />
                {message.translationProgress !== undefined && message.translationTotal !== undefined ? (
                  <span>번역 중... ({message.translationProgress}/{message.translationTotal})</span>
                ) : (
                  <span>번역 중...</span>
                )}
              </div>
            )}

            {message.translationError && (
              <div className="text-xs text-destructive">
                번역 오류: {message.translationError}
              </div>
            )}
          </div>

          {/* Message footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              {/* Language selector */}
              {availableLanguages.length > 1 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                    className={cn(
                      "text-xs h-6 px-2",
                      isOwn 
                        ? "hover:bg-primary-foreground/20 text-primary-foreground/80" 
                        : "hover:bg-background/50"
                    )}
                  >
                    <Languages className="h-3 w-3 mr-1" />
                    {getDisplayLanguage()}
                  </Button>

                  {showLanguageSelector && (
                    <div className="absolute bottom-full mb-1 left-0 bg-popover border rounded-md shadow-md z-10 min-w-[150px]">
                      {availableLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSelectedLanguage(lang.code)
                            setShowLanguageSelector(false)
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs hover:bg-accent",
                            selectedLanguage === lang.code && "bg-accent"
                          )}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Copy button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(getDisplayText())}
                className={cn(
                  "h-6 w-6 p-0",
                  isOwn 
                    ? "hover:bg-primary-foreground/20 text-primary-foreground/80" 
                    : "hover:bg-background/50"
                )}
              >
                {copiedText === getDisplayText() ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* Timestamp and Status */}
            <div className={cn(
              "text-xs opacity-75 flex items-center gap-1",
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              <span>{formatTimestamp(message.timestamp)}</span>
              {isOwn && (() => {
                const status = getMessageStatus()
                const StatusIcon = status.icon
                return (
                  <div className="flex items-center gap-1" title={status.text}>
                    <StatusIcon className={cn("h-3 w-3", status.className)} />
                  </div>
                )
              })()}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}