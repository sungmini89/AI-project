import { useEffect, useCallback, useRef } from 'react';
import { HotkeyConfig, HotkeyAction, UseHotkeysOptions } from '@/types/hotkeys';
import { matchesHotkey, isInputElement, isMobileDevice } from '@/utils/hotkeys';

const DEFAULT_OPTIONS: UseHotkeysOptions = {
  enableOnFormElements: false,
  enableOnMobile: false,
  preventDefault: true,
  stopPropagation: true,
};

/**
 * 핫키 기능을 제공하는 커스텀 훅
 * 
 * @param hotkeys 핫키 설정 배열
 * @param actions 핫키 액션 배열
 * @param options 옵션 설정
 */
export function useHotkeys(
  hotkeys: HotkeyConfig[],
  actions: HotkeyAction[],
  options: UseHotkeysOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const actionsRef = useRef<Map<string, HotkeyAction>>(new Map());

  // actions를 Map으로 변환하여 빠른 조회 가능
  useEffect(() => {
    const actionMap = new Map();
    actions.forEach(action => {
      actionMap.set(action.action, action);
    });
    actionsRef.current = actionMap;
  }, [actions]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 모바일에서는 핫키 비활성화
    if (!opts.enableOnMobile && isMobileDevice()) {
      return;
    }

    // 입력 요소에서는 핫키 비활성화 (옵션으로 허용 가능)
    if (!opts.enableOnFormElements && isInputElement(event.target as Element)) {
      return;
    }

    // 일치하는 핫키 찾기
    const matchedHotkey = hotkeys.find(hotkey => matchesHotkey(event, hotkey));
    
    if (!matchedHotkey) return;

    // 해당 액션 찾기
    const action = actionsRef.current.get(matchedHotkey.action);
    
    if (!action) return;

    // 액션이 비활성화된 경우 무시
    if (action.enabled === false) return;

    // 이벤트 방지 처리
    if (opts.preventDefault || matchedHotkey.preventDefault) {
      event.preventDefault();
    }

    if (opts.stopPropagation) {
      event.stopPropagation();
    }

    // 액션 실행
    try {
      action.callback();
    } catch (error) {
      console.error(`핫키 액션 실행 중 오류 발생:`, error);
    }
  }, [hotkeys, opts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 핫키 상태 관리를 위한 유틸리티 함수들 반환
  return {
    /**
     * 특정 액션의 활성화/비활성화 상태 토글
     */
    toggleAction: useCallback((actionName: string, enabled?: boolean) => {
      const currentActions = Array.from(actionsRef.current.values());
      const targetAction = currentActions.find(action => action.action === actionName);
      
      if (targetAction) {
        targetAction.enabled = enabled ?? !targetAction.enabled;
        actionsRef.current.set(actionName, targetAction);
      }
    }, []),

    /**
     * 모든 핫키 비활성화
     */
    disableAll: useCallback(() => {
      actionsRef.current.forEach(action => {
        action.enabled = false;
      });
    }, []),

    /**
     * 모든 핫키 활성화
     */
    enableAll: useCallback(() => {
      actionsRef.current.forEach(action => {
        action.enabled = true;
      });
    }, []),

    /**
     * 현재 활성화된 핫키 목록 가져오기
     */
    getActiveHotkeys: useCallback(() => {
      return hotkeys.filter(hotkey => {
        const action = actionsRef.current.get(hotkey.action);
        return action && action.enabled !== false;
      });
    }, [hotkeys]),
  };
}

/**
 * 단일 핫키를 등록하는 간단한 훅
 */
export function useHotkey(
  hotkey: HotkeyConfig,
  callback: () => void,
  options: UseHotkeysOptions = {}
) {
  const action: HotkeyAction = {
    action: hotkey.action,
    callback,
    enabled: true,
  };

  return useHotkeys([hotkey], [action], options);
}

/**
 * 조건부 핫키를 등록하는 훅
 */
export function useConditionalHotkey(
  hotkey: HotkeyConfig,
  callback: () => void,
  condition: boolean | (() => boolean),
  options: UseHotkeysOptions = {}
) {
  const conditionResult = typeof condition === 'function' ? condition() : condition;
  
  const action: HotkeyAction = {
    action: hotkey.action,
    callback,
    enabled: conditionResult,
  };

  return useHotkeys([hotkey], [action], options);
}

/**
 * 페이지별 핫키 컨텍스트를 관리하는 훅
 */
export function usePageHotkeys(
  pageHotkeys: Record<string, HotkeyConfig[]>,
  pageActions: Record<string, HotkeyAction[]>,
  currentPage: string,
  options: UseHotkeysOptions = {}
) {
  const hotkeys = pageHotkeys[currentPage] || [];
  const actions = pageActions[currentPage] || [];

  return useHotkeys(hotkeys, actions, options);
}