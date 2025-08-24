/**
 * AI Recipe 애플리케이션의 루트 컴포넌트
 * 애플리케이션의 전체 구조와 라우팅을 정의합니다.
 * 
 * @description
 * - React Router를 사용한 SPA 라우팅 설정
 * - 전역 상태 관리를 위한 AppProvider 래핑
 * - 공통 레이아웃 컴포넌트 적용
 * - 모든 페이지 컴포넌트들의 라우트 정의
 * 
 * @component
 * @example
 * ```tsx
 * <App />
 * ```
 * 
 * @author AI Recipe Team
 * @version 1.0.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { Layout } from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import SearchPage from "@/pages/SearchPage";
import RecipeDetailPage from "@/pages/RecipeDetailPage";
import FavoritesPage from "@/pages/FavoritesPage";
import GenerateRecipePage from "@/pages/GenerateRecipePage";
import SettingsPage from "@/pages/SettingsPage";

/**
 * 메인 App 컴포넌트
 * 
 * @returns {JSX.Element} 애플리케이션의 전체 구조를 렌더링
 */
function App() {
  return (
    <AppProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/generate" element={<GenerateRecipePage />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;
