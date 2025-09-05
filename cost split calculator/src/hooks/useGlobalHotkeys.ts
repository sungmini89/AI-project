import { useCallback } from 'react'
import { useHotkeys } from './useHotkeys'
import { DEFAULT_HOTKEYS, HOTKEY_ACTIONS } from '@/types/hotkeys'
import { HotkeyAction } from '@/types/hotkeys'
import { storage } from '@/lib/utils'

interface UseGlobalHotkeysProps {
  onNewCalculation?: () => void
  onSave?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onCloseModal?: () => void
  onConfirm?: () => void
}

/**
 * 전역 핫키를 관리하는 훅
 */
export function useGlobalHotkeys({
  onNewCalculation,
  onSave,
  onUndo,
  onRedo,
  onCloseModal,
  onConfirm,
}: UseGlobalHotkeysProps = {}) {

  // 새 계산 시작
  const handleNewCalculation = useCallback(() => {
    if (onNewCalculation) {
      onNewCalculation()
    } else {
      // 기본 동작: 현재 상태 초기화
      storage.remove('current-calculation')
      window.location.href = '/'
    }
    announceAction('새 계산을 시작했습니다')
  }, [onNewCalculation])

  // 상태 저장
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave()
    } else {
      // 기본 동작: 현재 상태를 localStorage에 저장
      const currentState = {
        timestamp: new Date().toISOString(),
        path: window.location.pathname,
        // 추후 애플리케이션 상태 추가
      }
      storage.set('saved-state', currentState)
    }
    announceAction('현재 상태를 저장했습니다')
  }, [onSave])

  // 실행 취소
  const handleUndo = useCallback(() => {
    if (onUndo) {
      onUndo()
    }
    announceAction('실행 취소')
  }, [onUndo])

  // 다시 실행
  const handleRedo = useCallback(() => {
    if (onRedo) {
      onRedo()
    }
    announceAction('다시 실행')
  }, [onRedo])

  // 모달 닫기
  const handleCloseModal = useCallback(() => {
    if (onCloseModal) {
      onCloseModal()
    } else {
      // 기본 동작: ESC 키 이벤트 발생
      const escEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        bubbles: true
      })
      document.dispatchEvent(escEvent)
    }
  }, [onCloseModal])

  // 확인 액션
  const handleConfirm = useCallback(() => {
    if (onConfirm) {
      onConfirm()
    } else {
      // 기본 동작: 포커스된 버튼 클릭 또는 폼 제출
      const activeElement = document.activeElement as HTMLElement
      if (activeElement?.tagName === 'BUTTON') {
        activeElement.click()
      } else if (activeElement?.closest('form')) {
        const form = activeElement.closest('form')
        const submitButton = form?.querySelector('button[type="submit"]') as HTMLButtonElement
        if (submitButton) {
          submitButton.click()
        }
      }
    }
  }, [onConfirm])

  // 전역 액션들
  const actions: HotkeyAction[] = [
    {
      action: HOTKEY_ACTIONS.NEW_CALCULATION,
      callback: handleNewCalculation,
      enabled: true,
    },
    {
      action: HOTKEY_ACTIONS.SAVE_STATE,
      callback: handleSave,
      enabled: true,
    },
    {
      action: HOTKEY_ACTIONS.UNDO,
      callback: handleUndo,
      enabled: !!onUndo,
    },
    {
      action: HOTKEY_ACTIONS.REDO,
      callback: handleRedo,
      enabled: !!onRedo,
    },
    {
      action: HOTKEY_ACTIONS.CLOSE_MODAL,
      callback: handleCloseModal,
      enabled: true,
    },
    {
      action: HOTKEY_ACTIONS.CONFIRM_ACTION,
      callback: handleConfirm,
      enabled: true,
    },
  ]

  // 전역 핫키만 필터링
  const globalHotkeys = DEFAULT_HOTKEYS.filter(hotkey => 
    [
      HOTKEY_ACTIONS.NEW_CALCULATION,
      HOTKEY_ACTIONS.SAVE_STATE,
      HOTKEY_ACTIONS.UNDO,
      HOTKEY_ACTIONS.REDO,
      HOTKEY_ACTIONS.CLOSE_MODAL,
      HOTKEY_ACTIONS.CONFIRM_ACTION,
    ].includes(hotkey.action as any)
  )

  return useHotkeys(globalHotkeys, actions, {
    enableOnFormElements: false,
    enableOnMobile: false,
  })
}

/**
 * 스크린 리더를 위한 액션 안내
 */
function announceAction(message: string) {
  const liveRegion = document.getElementById('sr-action-announcer')
  if (liveRegion) {
    liveRegion.textContent = message
    
    // 메시지를 잠시 후 지워서 중복 읽기 방지
    setTimeout(() => {
      liveRegion.textContent = ''
    }, 2000)
  }
}