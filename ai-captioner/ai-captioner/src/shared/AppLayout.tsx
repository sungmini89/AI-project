import { NavLink, Outlet } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

/**
 * 애플리케이션의 메인 레이아웃 컴포넌트
 *
 * @description
 * - 상단 네비게이션 바 (홈, 캡션 생성, 히스토리)
 * - 다크 모드 토글 버튼
 * - 하단 푸터
 * - 모든 페이지의 공통 레이아웃을 제공
 *
 * @returns {JSX.Element} 메인 레이아웃 컴포넌트
 */
export default function AppLayout() {
  const [theme, toggle] = useTheme();

  // 네비게이션 링크의 기본 스타일 클래스
  const linkBase = "px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium";

  // 활성 링크의 스타일 클래스
  const active = "bg-blue-100 text-blue-700 font-semibold";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 상단 헤더 - 네비게이션과 테마 토글 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
        <nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
          {/* 로고 및 제목 */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🤖</div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI 캡션 생성기</h1>
          </div>

          {/* 네비게이션 메뉴와 테마 토글 */}
          <div className="flex items-center gap-4">
            {/* 메인 네비게이션 링크들 */}
            <div className="flex gap-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? active : "text-gray-600 dark:text-gray-300"}`
                }
              >
                홈
              </NavLink>
              <NavLink
                to="/app"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? active : "text-gray-600 dark:text-gray-300"}`
                }
              >
                캡션 생성
              </NavLink>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? active : "text-gray-600 dark:text-gray-300"}`
                }
              >
                히스토리
              </NavLink>
            </div>

            {/* 다크 모드 토글 버튼 */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </nav>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 text-center text-gray-500 dark:text-gray-400">
        <div className="max-w-6xl mx-auto">
          <p>© {new Date().getFullYear()} AI 이미지 캡션 생성기. 모든 권리 보유.</p>
          <p className="text-sm mt-2">
            AI 기술을 활용하여 이미지에 대한 의미있는 설명을 생성합니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
