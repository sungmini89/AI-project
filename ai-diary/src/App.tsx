import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import WritePage from './pages/WritePage';
import DiaryListPage from './pages/DiaryListPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            {/* 메인 페이지 */}
            <Route path="/" element={<HomePage />} />
            
            {/* 일기 작성 페이지 */}
            <Route path="/write" element={<WritePage />} />
            
            {/* 일기 수정 페이지 */}
            <Route path="/write/:id" element={<WritePage />} />
            
            {/* 일기 목록 페이지 */}
            <Route path="/diary" element={<DiaryListPage />} />
            
            {/* 분석 대시보드 페이지 */}
            <Route path="/analytics" element={<AnalyticsPage />} />
            
            {/* 설정 페이지 */}
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* 404 리다이렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>

        {/* 토스트 알림 */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              maxWidth: '500px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
            loading: {
              iconTheme: {
                primary: '#6b7280',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;