import React, { Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import WritePage from "./pages/WritePage";
import DiaryListPage from "./pages/DiaryListPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import { AppProvider } from "./contexts/AppContext";

// 로딩 컴포넌트
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">애플리케이션을 불러오는 중...</p>
    </div>
  </div>
);

// 메인 콘텐츠 컴포넌트
const AppContent: React.FC = () => {
  return (
    <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <ErrorBoundary
        fallback={
          <div className="p-4 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              레이아웃 오류
            </h2>
            <p className="text-gray-600">
              페이지 레이아웃을 불러올 수 없습니다.
            </p>
          </div>
        }
      >
        <Layout>
          <Outlet />
        </Layout>
      </ErrorBoundary>

      {/* 토스트 알림 */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#374151",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            maxWidth: "500px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
          loading: {
            iconTheme: {
              primary: "#6b7280",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </div>
  );
};

// 라우터 설정
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppContent />,
    children: [
      {
        index: true,
        element: (
          <ErrorBoundary>
            <HomePage />
          </ErrorBoundary>
        ),
      },
      {
        path: "write",
        element: (
          <ErrorBoundary>
            <WritePage />
          </ErrorBoundary>
        ),
      },
      {
        path: "write/:id",
        element: (
          <ErrorBoundary>
            <WritePage />
          </ErrorBoundary>
        ),
      },
      {
        path: "diary",
        element: (
          <ErrorBoundary>
            <DiaryListPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "analytics",
        element: (
          <ErrorBoundary>
            <AnalyticsPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "settings",
        element: (
          <ErrorBoundary>
            <SettingsPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <RouterProvider router={router} />
        </Suspense>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
