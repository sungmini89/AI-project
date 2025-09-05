import React, { createContext, useContext, useState, useCallback } from 'react'
import { HotkeyConfig } from '../../types/hotkeys'

interface HotkeyContextType {
  globalHotkeys: HotkeyConfig[]
  registerGlobalHotkey: (hotkey: HotkeyConfig) => void
  unregisterGlobalHotkey: (action: string) => void
  isHotkeyHelpVisible: boolean
  showHotkeyHelp: () => void
  hideHotkeyHelp: () => void
  toggleHotkeyHelp: () => void
}

const HotkeyContext = createContext<HotkeyContextType | null>(null)

interface HotkeyProviderProps {
  children: React.ReactNode
}

export const HotkeyProvider: React.FC<HotkeyProviderProps> = ({ children }) => {
  const [globalHotkeys, setGlobalHotkeys] = useState<HotkeyConfig[]>([])
  const [isHotkeyHelpVisible, setIsHotkeyHelpVisible] = useState(false)
  const [previousFocus, setPreviousFocus] = useState<HTMLElement | null>(null)

  const registerGlobalHotkey = useCallback((hotkey: HotkeyConfig) => {
    setGlobalHotkeys(prev => {
      // Remove existing hotkey with same action
      const filtered = prev.filter(h => h.action !== hotkey.action)
      return [...filtered, hotkey]
    })
  }, [])

  const unregisterGlobalHotkey = useCallback((action: string) => {
    setGlobalHotkeys(prev => prev.filter(h => h.action !== action))
  }, [])

  const showHotkeyHelp = useCallback(() => {
    setPreviousFocus(document.activeElement as HTMLElement)
    setIsHotkeyHelpVisible(true)
  }, [])

  const hideHotkeyHelp = useCallback(() => {
    setIsHotkeyHelpVisible(false)
    // Restore focus to previous element
    if (previousFocus) {
      previousFocus.focus()
      setPreviousFocus(null)
    }
  }, [previousFocus])

  const toggleHotkeyHelp = useCallback(() => {
    if (!isHotkeyHelpVisible) {
      setPreviousFocus(document.activeElement as HTMLElement)
    }
    setIsHotkeyHelpVisible(prev => !prev)
  }, [isHotkeyHelpVisible])

  // Focus management for modal
  React.useEffect(() => {
    if (isHotkeyHelpVisible) {
      // Focus the modal when it opens
      const modal = document.querySelector('[data-testid="settings-modal"]') as HTMLElement
      if (modal) {
        modal.focus()
      }
    }
  }, [isHotkeyHelpVisible])

  // Global hotkey help shortcut
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show hotkey help with ?
      if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const target = event.target as Element
        // Don't trigger in input fields
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as HTMLElement).isContentEditable) {
          return
        }
        event.preventDefault()
        toggleHotkeyHelp()
      }
      
      // Hide hotkey help with Escape
      if (event.key === 'Escape' && isHotkeyHelpVisible) {
        event.preventDefault()
        hideHotkeyHelp()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleHotkeyHelp, hideHotkeyHelp, isHotkeyHelpVisible])

  const value: HotkeyContextType = {
    globalHotkeys,
    registerGlobalHotkey,
    unregisterGlobalHotkey,
    isHotkeyHelpVisible,
    showHotkeyHelp,
    hideHotkeyHelp,
    toggleHotkeyHelp
  }

  return (
    <HotkeyContext.Provider value={value}>
      {children}
      
      {/* Global hotkey help overlay */}
      {isHotkeyHelpVisible && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          onClick={hideHotkeyHelp}
          data-testid="settings-modal-backdrop"
        >
          <div 
            className="steel-panel hud-element rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
            data-testid="settings-modal"
            role="dialog"
            aria-labelledby="hotkey-help-title"
            tabIndex={-1}
          >
            <h3 id="hotkey-help-title" className="text-lg font-semibold mb-4 tech-title">키보드 단축키</h3>
            
            <div className="space-y-3">
              {globalHotkeys.length > 0 ? (
                globalHotkeys.map(hotkey => (
                  <div key={hotkey.action} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {hotkey.description}
                    </span>
                    <div className="flex items-center space-x-1">
                      {hotkey.modifiers?.map(mod => (
                        <kbd 
                          key={mod} 
                          className="px-2 py-1 bg-muted rounded text-xs font-mono"
                        >
                          {mod === 'Control' ? 'Ctrl' : 
                           mod === 'Meta' ? 'Cmd' : 
                           mod === 'Alt' ? 'Alt' : 
                           mod === 'Shift' ? 'Shift' : mod}
                        </kbd>
                      ))}
                      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                        {hotkey.key.replace('Key', '')}
                      </kbd>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  사용 가능한 단축키가 없습니다.
                </p>
              )}
              
              {/* Always show help shortcut */}
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">
                  이 도움말 표시/숨김
                </span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                  ?
                </kbd>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground">
                ESC 키나 배경을 클릭하여 닫기
              </p>
            </div>
          </div>
        </div>
      )}
    </HotkeyContext.Provider>
  )
}

export const useHotkeyContext = (): HotkeyContextType => {
  const context = useContext(HotkeyContext)
  if (!context) {
    throw new Error('useHotkeyContext must be used within a HotkeyProvider')
  }
  return context
}

export default HotkeyProvider