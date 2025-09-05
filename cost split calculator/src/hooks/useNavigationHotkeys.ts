import { useNavigate, useLocation } from 'react-router-dom'
import { useHotkeys } from './useHotkeys'
import { DEFAULT_HOTKEYS, HOTKEY_ACTIONS } from '@/types/hotkeys'
import { HotkeyAction } from '@/types/hotkeys'

/**
 * 네비게이션 관련 핫키를 처리하는 훅
 */
export function useNavigationHotkeys() {
  const navigate = useNavigate()
  const location = useLocation()

  // 네비게이션 액션들
  const actions: HotkeyAction[] = [
    {
      action: HOTKEY_ACTIONS.NAVIGATE_CALCULATOR,
      callback: () => {
        navigate('/')
        announceNavigation('계산기 페이지')
      },
      enabled: location.pathname !== '/',
    },
    {
      action: HOTKEY_ACTIONS.NAVIGATE_EDITOR,
      callback: () => {
        navigate('/editor')
        announceNavigation('편집기 페이지')
      },
      enabled: location.pathname !== '/editor',
    },
    {
      action: HOTKEY_ACTIONS.NAVIGATE_RESULT,
      callback: () => {
        navigate('/result')
        announceNavigation('결과 페이지')
      },
      enabled: location.pathname !== '/result',
    },
    {
      action: HOTKEY_ACTIONS.NAVIGATE_HISTORY,
      callback: () => {
        navigate('/history')
        announceNavigation('히스토리 페이지')
      },
      enabled: location.pathname !== '/history',
    },
  ]

  // 네비게이션 관련 핫키만 필터링
  const navigationHotkeys = DEFAULT_HOTKEYS.filter(hotkey => 
    [
      HOTKEY_ACTIONS.NAVIGATE_CALCULATOR,
      HOTKEY_ACTIONS.NAVIGATE_EDITOR,
      HOTKEY_ACTIONS.NAVIGATE_RESULT,
      HOTKEY_ACTIONS.NAVIGATE_HISTORY,
    ].includes(hotkey.action as any)
  )

  return useHotkeys(navigationHotkeys, actions, {
    enableOnFormElements: false,
    enableOnMobile: false,
  })
}

/**
 * 스크린 리더를 위한 네비게이션 안내
 */
function announceNavigation(pageName: string) {
  const announcement = `${pageName}로 이동했습니다`
  
  // 스크린 리더용 live region에 메시지 전달
  const liveRegion = document.getElementById('sr-navigation-announcer')
  if (liveRegion) {
    liveRegion.textContent = announcement
    
    // 메시지를 잠시 후 지워서 중복 읽기 방지
    setTimeout(() => {
      liveRegion.textContent = ''
    }, 1000)
  }
}