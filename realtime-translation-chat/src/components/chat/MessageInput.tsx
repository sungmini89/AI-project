import { useState, useRef, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Send, Loader2, Languages } from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '@/lib/services/languageDetection'

interface MessageInputProps {
  onSendMessage: (text: string, targetLanguages: string[]) => Promise<void>
  onUserTyping?: () => void
  onStopTyping?: () => void
  disabled?: boolean
  placeholder?: string
  supportedLanguages?: string[]
}

export function MessageInput({ 
  onSendMessage, 
  onUserTyping,
  onStopTyping,
  disabled = false, 
  placeholder = "메시지를 입력하세요...",
  supportedLanguages = ['ko', 'en', 'ja', 'zh']
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(supportedLanguages)
  const [isLoading, setIsLoading] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || isLoading) return

    // Stop typing indicator when sending
    onStopTyping?.()
    
    setIsLoading(true)
    try {
      await onSendMessage(trimmedMessage, selectedLanguages)
      setMessage('')
      inputRef.current?.focus()
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setMessage(value)
    
    // Trigger typing indicator if user is typing
    if (value.trim() && !isLoading) {
      onUserTyping?.()
    } else if (!value.trim()) {
      onStopTyping?.()
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleBlur = () => {
    // Stop typing indicator when input loses focus
    onStopTyping?.()
  }

  const toggleLanguage = (langCode: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(langCode)) {
        return prev.filter(code => code !== langCode)
      } else {
        return [...prev, langCode]
      }
    })
  }

  const availableLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    supportedLanguages.includes(lang.code)
  )

  return (
    <div className="border-t bg-background p-4">
      {/* Language selector */}
      <div className="relative mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLanguageSelector(!showLanguageSelector)}
          className="text-xs"
        >
          <Languages className="h-3 w-3 mr-1" />
          번역 언어 ({selectedLanguages.length})
        </Button>

        {showLanguageSelector && (
          <div className="absolute bottom-full mb-2 left-0 bg-popover border rounded-md shadow-lg z-20 p-3 min-w-[300px]">
            <div className="text-sm font-medium mb-2">번역할 언어 선택:</div>
            <div className="grid grid-cols-2 gap-2">
              {availableLanguages.map((lang) => (
                <label
                  key={lang.code}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded p-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(lang.code)}
                    onChange={() => toggleLanguage(lang.code)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">
                    {lang.native} ({lang.name})
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLanguages(supportedLanguages)}
                  className="text-xs"
                >
                  전체 선택
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLanguages([])}
                  className="text-xs"
                >
                  선택 해제
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={message}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="flex-1"
          maxLength={1000}
        />
        
        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled || isLoading}
          size="icon"
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Selected languages indicator */}
      {selectedLanguages.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedLanguages.map(langCode => {
            const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode)
            return (
              <span
                key={langCode}
                className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
              >
                {lang?.native || langCode}
              </span>
            )
          })}
        </div>
      )}

      {/* Character count */}
      <div className="mt-1 text-right">
        <span className={cn(
          "text-xs",
          message.length > 800 ? "text-destructive" : "text-muted-foreground"
        )}>
          {message.length}/1000
        </span>
      </div>
    </div>
  )
}