// 메인 애플리케이션 컴포넌트

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSettingsStore } from './stores';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import OfflinePage from './pages/OfflinePage';
import SettingsPage from './pages/SettingsPage';
import NotificationManager from './components/ui/NotificationManager';
import ErrorBoundary from './components/ui/ErrorBoundary';

function App() {
  const { theme } = useSettingsStore();

  // 테마 적용
  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
      
      // 시스템 테마 변경 감지
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
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
