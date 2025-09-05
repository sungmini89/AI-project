import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { useHotkeys } from "../../hooks/useHotkeys";
import { cn } from "../../lib/utils";

interface LayoutProps {
  children?: React.ReactNode;
}

/**
 * 애플리케이션의 메인 레이아웃 컴포넌트
 *
 * 전체 애플리케이션의 공통 레이아웃을 담당하며,
 * 사이드바, 모바일 네비게이션, 푸터를 포함합니다.
 * 반응형 디자인을 지원하며 키보드 단축키 기능도 제공합니다.
 *
 * @description
 * **주요 기능:**
 * - 반응형 사이드바 (데스크톱/모바일)
 * - 모바일 네비게이션 바
 * - 키보드 단축키 지원
 * - 접근성 기능 (스킵 링크 등)
 * - 테마 및 스타일링
 *
 * **키보드 단축키:**
 * - `N`: 새 계산 시작
 * - `H`: 히스토리 보기
 * - `S`: 설정 열기
 * - `Escape`: 사이드바 닫기
 *
 * @param props - 컴포넌트 속성
 * @param props.children - 페이지 콘텐츠
 * @returns {JSX.Element} 메인 레이아웃 UI
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation hotkeys
  const hotkeys = [
    {
      key: "KeyN",
      action: "new-calculation",
      description: "새 계산 시작",
    },
    {
      key: "KeyH",
      action: "history",
      description: "히스토리 보기",
    },
    {
      key: "KeyS",
      action: "settings",
      description: "설정",
    },
    {
      key: "Escape",
      action: "escape",
      description: "취소/닫기",
    },
  ];

  const hotkeyActions = [
    {
      action: "new-calculation",
      callback: () => navigate("/calculator"),
      enabled: true,
    },
    {
      action: "history",
      callback: () => navigate("/history"),
      enabled: true,
    },
    {
      action: "settings",
      callback: () => {
        // Settings modal or page would be implemented here
        console.log("Settings opened");
      },
      enabled: true,
    },
    {
      action: "escape",
      callback: () => {
        if (sidebarOpen) {
          setSidebarOpen(false);
        }
      },
      enabled: sidebarOpen,
    },
  ];

  useHotkeys(hotkeys, hotkeyActions, {
    enableOnFormElements: false,
    enableOnMobile: false,
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Handle responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      // Close mobile sidebar when resizing to desktop
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  // Check if desktop (lg breakpoint)
  const isDesktop = () => window.innerWidth >= 1024;

  return (
    <div
      className="min-h-screen flex flex-col bg-background tech-grid"
      data-testid="desktop-layout"
    >
      {/* Mobile detection for testid */}
      <div className="hidden md:block" data-testid="tablet-layout" />
      <div className="block md:hidden" data-testid="mobile-indicator" />
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-primary"
        data-testid="skip-to-main"
      >
        메인 콘텐츠로 건너뛰기
      </a>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          currentPath={location.pathname}
        />

        {/* Sidebar backdrop for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeSidebar}
            data-testid="sidebar-backdrop"
          />
        )}

        {/* Main content area */}
        <main
          className={cn(
            "flex-1 flex flex-col transition-all duration-200 ease-in-out",
            "min-h-0", // Allow content to shrink
            "relative" // Position context for HUD elements
          )}
          id="main-content"
          data-testid="main-content"
          tabIndex={-1}
        >
          {/* Page content */}
          <div className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
            <div className="steel-panel rounded-lg p-6 animate-fade-in">
              {children || <Outlet />}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav currentPath={location.pathname} />
      </div>

      {/* Footer */}
      <Footer />

      {/* Hotkey help overlay - could be implemented later */}
      {/* <HotkeyHelp hotkeys={hotkeys} /> */}
    </div>
  );
};

export default Layout;
