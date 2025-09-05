import { HotkeyConfig } from '@/types/hotkeys';

/**
 * 키보드 이벤트가 핫키 설정과 일치하는지 확인
 */
export function matchesHotkey(event: KeyboardEvent, hotkey: HotkeyConfig): boolean {
  const normalizedKey = normalizeKey(event.key);
  const hotkeyNormalizedKey = normalizeKey(hotkey.key);

  return (
    normalizedKey === hotkeyNormalizedKey &&
    !!event.ctrlKey === !!hotkey.ctrlKey &&
    !!event.altKey === !!hotkey.altKey &&
    !!event.shiftKey === !!hotkey.shiftKey &&
    !!event.metaKey === !!hotkey.metaKey
  );
}

/**
 * 키 이름을 정규화 (대소문자 통일 등)
 */
function normalizeKey(key: string): string {
  // KeyN, KeyH 등의 형태를 n, h로 변환
  if (key.startsWith('Key') && key.length === 4) {
    return key.charAt(3).toLowerCase();
  }
  
  // 특수 키는 그대로 반환
  if (['Enter', 'Escape', 'Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
    return key;
  }
  
  // 알파벳과 숫자는 소문자로 통일
  return key.toLowerCase();
}

/**
 * 핫키 조합을 사람이 읽기 쉬운 문자열로 변환
 */
export function getHotkeyDisplay(hotkey: HotkeyConfig): string {
  const parts: string[] = [];

  if (hotkey.ctrlKey) parts.push('Ctrl');
  if (hotkey.altKey) parts.push('Alt');
  if (hotkey.shiftKey) parts.push('Shift');
  if (hotkey.metaKey) parts.push(isMac() ? 'Cmd' : 'Meta');

  // 키 이름을 사용자 친화적으로 변환
  let keyDisplay = hotkey.key;
  switch (hotkey.key.toLowerCase()) {
    case ' ':
      keyDisplay = 'Space';
      break;
    case 'escape':
      keyDisplay = 'Esc';
      break;
    case 'enter':
      keyDisplay = 'Enter';
      break;
    default:
      keyDisplay = hotkey.key.toUpperCase();
  }

  parts.push(keyDisplay);
  return parts.join(' + ');
}

/**
 * 현재 플랫폼이 macOS인지 확인
 */
function isMac(): boolean {
  return typeof navigator !== 'undefined' && navigator.platform.indexOf('Mac') > -1;
}

/**
 * 모바일 기기인지 확인
 */
export function isMobileDevice(): boolean {
  return typeof window !== 'undefined' && window.innerWidth <= 768;
}

/**
 * 현재 포커스된 요소가 입력 요소인지 확인
 */
export function isInputElement(element: Element | null): boolean {
  if (!element) return false;

  const tagName = element.tagName.toLowerCase();
  const inputTypes = ['input', 'textarea', 'select'];
  
  if (inputTypes.includes(tagName)) return true;

  // contenteditable 요소도 입력 요소로 간주
  if (element.getAttribute('contenteditable') === 'true') return true;

  return false;
}

/**
 * 접근성을 위한 핫키 안내 메시지 생성
 */
export function createHotkeyAnnouncement(action: string, hotkeyDisplay: string): string {
  return `핫키 ${hotkeyDisplay}로 ${action} 기능을 사용할 수 있습니다.`;
}

/**
 * 스크린 리더용 핫키 설명 생성
 */
export function generateHotkeyInstructions(hotkeys: HotkeyConfig[]): string {
  const instructions = hotkeys.map(hotkey => 
    `${getHotkeyDisplay(hotkey)}: ${hotkey.description}`
  );
  
  return `사용 가능한 키보드 단축키: ${instructions.join(', ')}`;
}

/**
 * 핫키 설정의 유효성 검사
 */
export function validateHotkeyConfig(hotkey: HotkeyConfig): boolean {
  if (!hotkey.key || typeof hotkey.key !== 'string') return false;
  if (!hotkey.action || typeof hotkey.action !== 'string') return false;
  if (!hotkey.description || typeof hotkey.description !== 'string') return false;
  
  return true;
}

/**
 * 중복된 핫키 조합 검사
 */
export function findDuplicateHotkeys(hotkeys: HotkeyConfig[]): HotkeyConfig[][] {
  const duplicates: HotkeyConfig[][] = [];
  
  for (let i = 0; i < hotkeys.length; i++) {
    for (let j = i + 1; j < hotkeys.length; j++) {
      const hotkey1 = hotkeys[i];
      const hotkey2 = hotkeys[j];
      
      if (
        hotkey1.key === hotkey2.key &&
        hotkey1.ctrlKey === hotkey2.ctrlKey &&
        hotkey1.altKey === hotkey2.altKey &&
        hotkey1.shiftKey === hotkey2.shiftKey &&
        hotkey1.metaKey === hotkey2.metaKey
      ) {
        duplicates.push([hotkey1, hotkey2]);
      }
    }
  }
  
  return duplicates;
}