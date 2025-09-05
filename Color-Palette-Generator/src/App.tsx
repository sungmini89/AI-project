/**
 * @fileoverview AI 색상 팔레트 생성기 메인 애플리케이션 컴포넌트
 *
 * React Router를 사용한 SPA(Single Page Application)의 루트 컴포넌트로,
 * 모든 페이지 라우팅과 전역 상태 관리를 담당합니다.
 *
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 * @since 1.0.0
 *
 * **주요 기능:**
 * - React Router 기반 페이지 라우팅
 * - 레이지 로딩을 통한 성능 최적화
 * - 전역 성능 모니터링 시스템
 * - PWA 지원 및 오프라인 기능
 * - 반응형 레이아웃 및 접근성 지원
 *
 * **라우트 구조:**
 * - `/` - 메인 팔레트 생성기 페이지
 * - `/generator` - 팔레트 생성기 (별칭)
 * - `/saved` - 저장된 팔레트 목록
 * - `/image-extract` - 이미지 색상 추출
 * - `/guide` - 사용자 가이드
 * - `/settings` - 애플리케이션 설정
 *
 * **성능 최적화:**
 * - React.lazy()를 사용한 코드 스플리팅
 * - Suspense를 통한 로딩 상태 관리
 * - 성능 모니터링 및 메트릭 수집
 *
 * @example
 * ```tsx
 * // 애플리케이션 실행
 * ReactDOM.render(<App />, document.getElementById('root'));
 * ```
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Layout } from "./components/Layout";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import { PerformanceToggle } from "./components/ui/performance-panel";
import { startPerformanceMonitoring } from "./utils/performance";
import "./App.css";

// 페이지 레이지 로딩 - 코드 스플리팅을 통한 성능 최적화
const GeneratorPage = lazy(() => import("./pages/GeneratorPage"));
const SavedPage = lazy(() => import("./pages/SavedPage"));
const SavedPalettesPage = lazy(() => import("./pages/SavedPalettesPage"));
const ImageExtractPage = lazy(() => import("./pages/ImageExtractPage"));
const GuidePage = lazy(() => import("./pages/GuidePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

/**
 * 메인 애플리케이션 컴포넌트
 *
 * React Router를 사용하여 페이지 라우팅을 관리하고,
 * 성능 모니터링과 레이지 로딩을 통해 최적화된 사용자 경험을 제공합니다.
 *
 * **컴포넌트 구조:**
 * - Router: 브라우저 라우팅 관리
 * - Layout: 공통 레이아웃 (헤더, 네비게이션, 푸터)
 * - Suspense: 레이지 로딩된 컴포넌트의 로딩 상태 처리
 * - Routes: 페이지별 라우트 정의
 *
 * **성능 최적화:**
 * - 페이지별 코드 스플리팅으로 초기 로딩 시간 단축
 * - 성능 모니터링을 통한 실시간 성능 추적
 * - PWA 지원으로 오프라인 사용 가능
 *
 * @component
 * @returns {JSX.Element} 메인 애플리케이션 컴포넌트
 */
function App() {
  // 성능 모니터링 시작
  useEffect(() => {
    try {
      startPerformanceMonitoring();
    } catch (error) {
      console.warn("Performance monitoring not available:", error);
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Layout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<GeneratorPage />} />
              <Route path="/generator" element={<GeneratorPage />} />
              <Route path="/saved" element={<SavedPalettesPage />} />
              <Route path="/image-extract" element={<ImageExtractPage />} />
              <Route path="/extract" element={<ImageExtractPage />} />{" "}
              {/* Test alias */}
              <Route path="/guide" element={<GuidePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* 기존 SavedPage 호환성 유지 */}
              <Route path="/saved-old" element={<SavedPage />} />
            </Routes>
          </Suspense>
        </Layout>
        {/* 성능 모니터링 패널 (개발 환경) */}
        <PerformanceToggle />
      </div>
    </Router>
  );
}

export default App;
