/**
 * @fileoverview 실시간 번역 채팅 애플리케이션의 메인 컴포넌트
 *
 * 이 컴포넌트는 애플리케이션의 전체 라우팅 구조를 정의하고,
 * 사용자 인증 상태에 따라 보호된 라우트를 관리합니다.
 *
 * @author 실시간 번역 채팅 팀
 * @version 1.0.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { userService } from "@/lib/services/userService";
import { useEffect } from "react";

// Layout Components
import RootLayout from "@/components/layout/RootLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

// Page Components
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import ChatPage from "@/pages/ChatPage";
import SettingsPage from "@/pages/SettingsPage";
import DebugPage from "@/pages/DebugPage";

/**
 * 애플리케이션의 메인 컴포넌트
 *
 * @description
 * - React Router를 사용하여 페이지 라우팅을 관리
 * - 사용자 인증 상태에 따른 보호된 라우트 제공
 * - 오프라인 감지 기능 초기화
 *
 * @returns {JSX.Element} 애플리케이션의 라우팅 구조
 */
function App() {
  useEffect(() => {
    // Initialize offline detection
    userService.setupOfflineDetection();
  }, []);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<RootLayout />}>
          {/* Public Routes */}
          <Route index element={<LandingPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="debug" element={<DebugPage />} />

          {/* Protected Routes */}
          <Route
            path="chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
