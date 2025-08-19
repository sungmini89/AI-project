/**
 * 메인 애플리케이션 컴포넌트
 * 라우팅 설정과 전역 상태 관리
 * @component
 */

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSettingsStore } from "./stores";
import HomePage from "./pages/HomePage";
import AnalyzePage from "./pages/AnalyzePage";
import OfflinePage from "./pages/OfflinePage";
import SettingsPage from "./pages/SettingsPage";
import NotificationManager from "./components/ui/NotificationManager";
import ErrorBoundary from "./components/ui/ErrorBoundary";

/**
 * 메인 애플리케이션 컴포넌트
 * 라우팅, 테마 관리, 전역 알림을 담당
 * @returns {JSX.Element} 애플리케이션 UI
 */
function App() {
  const { theme } = useSettingsStore();

  /**
   * 테마 변경 시 DOM에 클래스 적용
   * 다크/라이트 테마 전환 처리
   */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ErrorBoundary>
      <Router>
        <div className="App min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/offline" element={<OfflinePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>

          {/* 전역 알림 관리자 */}
          <NotificationManager />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
