import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LoadingSpinner } from './components/ui/loading-spinner';
import { PerformanceToggle } from './components/ui/performance-panel';
import { startPerformanceMonitoring } from './utils/performance';
import './App.css';

// 페이지 레이지 로딩
const GeneratorPage = lazy(() => import('./pages/GeneratorPage'));
const SavedPage = lazy(() => import('./pages/SavedPage'));
const SavedPalettesPage = lazy(() => import('./pages/SavedPalettesPage'));
const ImageExtractPage = lazy(() => import('./pages/ImageExtractPage'));
const GuidePage = lazy(() => import('./pages/GuidePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function App() {
  // 성능 모니터링 시작
  useEffect(() => {
    try {
      startPerformanceMonitoring();
    } catch (error) {
      console.warn('Performance monitoring not available:', error);
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