import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChefHat,
  Search,
  Home,
  Moon,
  Sun,
  Heart,
  Sparkles,
  Settings,
} from "lucide-react";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useSettings } from "@/hooks/useSettings";
import { useTranslation } from "react-i18next";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { settings, updateSetting, loading } = useSettings();
  const [, forceUpdate] = useState({});
  const { t } = useTranslation();

  // settings.theme을 기반으로 다크모드 상태 계산
  const isDarkMode = settings.theme === "dark";

  // settingsChanged 이벤트 리스너 추가
  useEffect(() => {
    const handleSettingsChanged = () => {
      // 상태 업데이트를 비동기로 처리하여 렌더링 중 업데이트 방지
      setTimeout(() => {
        forceUpdate({});
      }, 0);
    };

    window.addEventListener("settingsChanged", handleSettingsChanged);
    return () => {
      window.removeEventListener("settingsChanged", handleSettingsChanged);
    };
  }, []);

  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    updateSetting("theme", newTheme);
    console.log(t("debug.themeToggle"), newTheme);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <OfflineIndicator />

        {/* Header */}
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link
                to="/"
                className="flex items-center space-x-2 text-orange-600 hover:text-orange-700"
              >
                <ChefHat className="h-8 w-8" />
                <span className="text-xl font-bold">AI Recipe</span>
              </Link>

              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <nav className="hidden md:flex items-center space-x-6">
                  <Link
                    to="/"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === "/"
                        ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                        : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span>{t("nav.home")}</span>
                  </Link>
                  <Link
                    to="/search"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === "/search"
                        ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                        : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
                    }`}
                  >
                    <Search className="h-4 w-4" />
                    <span>{t("nav.search")}</span>
                  </Link>
                  <Link
                    to="/generate"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === "/generate"
                        ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                        : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{t("nav.generate")}</span>
                  </Link>
                  <Link
                    to="/favorites"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === "/favorites"
                        ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                        : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
                    }`}
                  >
                    <Heart className="h-4 w-4" />
                    <span>{t("nav.favorites")}</span>
                  </Link>
                  <Link
                    to="/settings"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === "/settings"
                        ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                        : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t("nav.settings")}</span>
                  </Link>
                </nav>

                {/* Dark Mode Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="text-gray-600 dark:text-gray-300"
                >
                  {isDarkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>

                {/* Mobile Menu */}
                <div className="md:hidden">
                  <Button variant="ghost" size="sm">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden pb-4">
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === "/"
                      ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>{t("nav.home")}</span>
                </Link>
                <Link
                  to="/search"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === "/search"
                      ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <Search className="h-4 w-4" />
                  <span>{t("nav.search")}</span>
                </Link>
                <Link
                  to="/generate"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === "/generate"
                      ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{t("nav.generate")}</span>
                </Link>
                <Link
                  to="/favorites"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === "/favorites"
                      ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  <span>{t("nav.favorites")}</span>
                </Link>
                <Link
                  to="/settings"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === "/settings"
                      ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>{t("nav.settings")}</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">{children}</main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>
                &copy; 2024 AI Recipe Generator. Made with ❤️ for cooking
                enthusiasts.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
