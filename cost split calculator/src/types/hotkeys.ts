export interface HotkeyConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: string;
  description: string;
  preventDefault?: boolean;
  modifiers?: string[];
}

export interface HotkeyAction {
  action: string;
  callback: () => void;
  enabled?: boolean;
}

export interface UseHotkeysOptions {
  enableOnFormElements?: boolean;
  enableOnMobile?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export const HOTKEY_ACTIONS = {
  NAVIGATE_CALCULATOR: 'navigate_calculator',
  NAVIGATE_EDITOR: 'navigate_editor', 
  NAVIGATE_RESULT: 'navigate_result',
  NAVIGATE_HISTORY: 'navigate_history',
  NEW_CALCULATION: 'new_calculation',
  SAVE_STATE: 'save_state',
  UNDO: 'undo',
  REDO: 'redo',
  CLOSE_MODAL: 'close_modal',
  CONFIRM_ACTION: 'confirm_action',
} as const;

export type HotkeyActionType = typeof HOTKEY_ACTIONS[keyof typeof HOTKEY_ACTIONS];

export const DEFAULT_HOTKEYS: HotkeyConfig[] = [
  {
    key: '1',
    altKey: true,
    action: HOTKEY_ACTIONS.NAVIGATE_CALCULATOR,
    description: '계산기 페이지로 이동',
    preventDefault: true,
  },
  {
    key: '2', 
    altKey: true,
    action: HOTKEY_ACTIONS.NAVIGATE_EDITOR,
    description: '편집기 페이지로 이동',
    preventDefault: true,
  },
  {
    key: '3',
    altKey: true,
    action: HOTKEY_ACTIONS.NAVIGATE_RESULT,
    description: '결과 페이지로 이동',
    preventDefault: true,
  },
  {
    key: '4',
    altKey: true,
    action: HOTKEY_ACTIONS.NAVIGATE_HISTORY,
    description: '히스토리 페이지로 이동',
    preventDefault: true,
  },
  {
    key: 'n',
    ctrlKey: true,
    action: HOTKEY_ACTIONS.NEW_CALCULATION,
    description: '새 계산 시작',
    preventDefault: true,
  },
  {
    key: 's',
    ctrlKey: true,
    action: HOTKEY_ACTIONS.SAVE_STATE,
    description: '현재 상태 저장',
    preventDefault: true,
  },
  {
    key: 'z',
    ctrlKey: true,
    action: HOTKEY_ACTIONS.UNDO,
    description: '실행 취소',
    preventDefault: true,
  },
  {
    key: 'y',
    ctrlKey: true,
    action: HOTKEY_ACTIONS.REDO,
    description: '다시 실행',
    preventDefault: true,
  },
  {
    key: 'Escape',
    action: HOTKEY_ACTIONS.CLOSE_MODAL,
    description: '모달/다이얼로그 닫기',
    preventDefault: false,
  },
  {
    key: 'Enter',
    action: HOTKEY_ACTIONS.CONFIRM_ACTION,
    description: '확인/다음 단계',
    preventDefault: false,
  },
];