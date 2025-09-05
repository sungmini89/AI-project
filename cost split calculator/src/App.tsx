import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { CalculatorPage } from "./pages/CalculatorPage";
import EnhancedCalculatorPage from "./components/calculator/EnhancedCalculatorPage";
import EditPage from "./pages/EditPage";
import ResultPage from "./pages/ResultPage";
import HistoryPage from "./pages/HistoryPage";
import StatsPage from "./pages/StatsPage";
import TemplatesPage from "./pages/TemplatesPage";
import ArchivePage from "./pages/ArchivePage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { HotkeyProvider } from "./components/providers/HotkeyProvider";
import "./App.css";

/**
 * 스마트 영수증 분할 계산기 메인 애플리케이션 컴포넌트
 *
 * 이 컴포넌트는 전체 애플리케이션의 라우팅과 레이아웃을 관리합니다.
 * React Router를 사용하여 페이지 간 네비게이션을 처리하고,
 * 에러 바운더리와 핫키 프로바이더로 애플리케이션의 안정성을 보장합니다.
 *
 * @description
 * - 메인 계산기 페이지 (EnhancedCalculatorPage)를 기본 라우트로 설정
 * - 레거시 계산기 페이지는 비교/테스트용으로 유지
 * - 편집, 결과, 히스토리, 통계 등 다양한 기능 페이지 제공
 * - 모든 라우트는 Layout 컴포넌트로 감싸져 일관된 UI 제공
 *
 * @returns {JSX.Element} 애플리케이션의 전체 라우팅 구조
 */
function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <HotkeyProvider>
          <Layout>
            <Routes>
              {/* Main calculator route - Enhanced version */}
              <Route path="/" element={<EnhancedCalculatorPage />} />

              {/* Calculator routes - Enhanced version */}
              <Route path="/calculator" element={<EnhancedCalculatorPage />} />
              <Route
                path="/calculator/new"
                element={<EnhancedCalculatorPage />}
              />

              {/* Legacy calculator for comparison/testing */}
              <Route path="/calculator/legacy" element={<CalculatorPage />} />
              <Route
                path="/calculator/:step"
                element={<EnhancedCalculatorPage />}
              />

              {/* Edit OCR results */}
              <Route path="/edit" element={<EditPage />} />
              <Route path="/edit/:calculationId" element={<EditPage />} />

              {/* View results */}
              <Route path="/result" element={<ResultPage />} />
              <Route path="/result/:id" element={<ResultPage />} />

              {/* History management */}
              <Route path="/history" element={<HistoryPage />} />

              {/* Utility pages */}
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/archive" element={<ArchivePage />} />

              {/* Settings pages */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />

              {/* Catch all route - redirect to enhanced calculator */}
              <Route path="*" element={<EnhancedCalculatorPage />} />
            </Routes>
          </Layout>
        </HotkeyProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
