import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  BarChart3,
  Settings,
  Plus,
  Menu,
  X,
  Home,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { databaseService } from "../../services/databaseService";
import { useApp } from "../../contexts/AppContext";

/**
 * 레이아웃 컴포넌트
 * 애플리케이션의 전체적인 구조와 네비게이션을 제공합니다.
 *
 * @param children - 레이아웃 내부에 표시될 페이지 콘텐츠
 * @returns 레이아웃 JSX
 */
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, language } = useApp();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /**
   * 데이터 초기화를 수행합니다.
   * 사용자에게 확인을 요청한 후, 모든 일기와 감정 분석 데이터를 삭제합니다.
   * 설정은 기본값으로 초기화됩니다.
   */
  const handleResetData = async () => {
    const confirmMessage =
      language === "ko"
        ? "모든 데이터를 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다."
        : "Are you sure you want to reset all data?\n\nThis action cannot be undone.";

    if (confirm(confirmMessage)) {
      try {
        await databaseService.clearAllData();
        toast.success(
          language === "ko"
            ? "데이터가 초기화되었습니다."
            : "Data has been reset successfully."
        );
        navigate("/");
      } catch (error) {
        console.error("데이터 초기화 실패:", error);
        toast.error(
          language === "ko"
            ? "데이터 초기화에 실패했습니다."
            : "Failed to reset data."
        );
      }
    }
  };

  /**
   * 현재 경로가 활성 상태인지 확인합니다.
   *
   * @param path - 확인할 경로
   * @returns 활성 상태 여부
   */
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  /**
   * 네비게이션 메뉴 항목들을 정의합니다.
   * 각 항목은 경로, 아이콘, 이름, 설명을 포함합니다.
   */
  const navigation = [
    { name: language === "ko" ? "홈" : "Home", path: "/", icon: Home },
    {
      name: language === "ko" ? "일기 작성" : "Write Diary",
      path: "/write",
      icon: Plus,
    },
    {
      name: language === "ko" ? "일기 목록" : "Diary List",
      path: "/diary",
      icon: BookOpen,
    },
    {
      name: language === "ko" ? "감정 분석" : "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
    {
      name: language === "ko" ? "설정" : "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? "dark" : "light"}`}>
      {/* 모바일 헤더 */}
      {isMobile && (
        <header
          className={`fixed top-0 left-0 right-0 z-40 border-b shadow-sm px-4 py-3 flex items-center justify-between ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? "hover:bg-gray-700 text-gray-300"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            aria-label="메뉴 열기"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {language === "ko" ? "AI 일기" : "AI Diary"}
          </h1>

          <Link
            to="/write"
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </header>
      )}

      {/* 사이드바 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r transform transition-transform duration-300 ease-in-out ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } ${
          isMobile
            ? isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 사이드바 헤더 */}
          <div
            className={`flex items-center justify-between p-4 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h1
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {language === "ko" ? "AI 일기" : "AI Diary"}
            </h1>
            {isMobile && (
              <button
                onClick={closeSidebar}
                className={`p-1 rounded-lg transition-colors ${
                  isDark
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={closeSidebar}
                      className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? isDark
                            ? "bg-blue-600 text-white"
                            : "bg-blue-100 text-blue-700"
                          : isDark
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 데이터 초기화 버튼 */}
          <div
            className={`p-4 border-t ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <button
              onClick={handleResetData}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                isDark
                  ? "text-red-400 hover:bg-red-900 hover:text-red-300"
                  : "text-red-600 hover:bg-red-50 hover:text-red-700"
              }`}
              title={
                language === "ko"
                  ? "모든 데이터를 초기화합니다"
                  : "Reset all data"
              }
            >
              <RotateCcw className="w-5 h-5 mr-3" />
              {language === "ko" ? "데이터 초기화" : "Reset Data"}
            </button>
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main
        className={`flex-1 transition-colors duration-200 ${
          isMobile ? "pt-16" : "ml-64"
        } ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
      >
        {children}
      </main>

      {/* 모바일 오버레이 */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default Layout;
