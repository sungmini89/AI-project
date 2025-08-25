import { useEffect, useState } from "react";

/** 테마 타입 정의 */
const STORAGE_KEY = "theme";
type Theme = "light" | "dark";

/**
 * 다크 모드/라이트 모드 테마를 관리하는 커스텀 훅
 *
 * @description
 * - 사용자의 테마 선택을 로컬 스토리지에 저장
 * - 시스템 테마 설정을 기본값으로 사용
 * - HTML 문서에 dark 클래스를 추가/제거하여 테마 적용
 * - 테마 변경 시 자동으로 스토리지에 저장
 *
 * @returns {[Theme, () => void]} [현재 테마, 테마 토글 함수]
 *
 * @example
 * ```tsx
 * const [theme, toggle] = useTheme();
 *
 * return (
 *   <button onClick={toggle}>
 *     {theme === 'dark' ? '☀️' : '🌙'}
 *   </button>
 * );
 * ```
 */
export function useTheme(): [Theme, () => void] {
  // 초기 테마 설정: 로컬 스토리지 > 시스템 설정 > 기본값(라이트)
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // 테마 변경 시 HTML 문서에 클래스 적용 및 스토리지 저장
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  /**
   * 테마를 라이트/다크 모드로 토글하는 함수
   */
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return [theme, toggle];
}
