import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/layout/Navigation'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

// 지연 로딩으로 성능 최적화
const HomePage = lazy(() => import('./pages/home'))
const Dashboard = lazy(() => import('./pages/dashboard'))
const Upload = lazy(() => import('./pages/upload'))
const Flashcards = lazy(() => import('./pages/flashcards'))
const Quiz = lazy(() => import('./pages/quiz'))
const SettingsPage = lazy(() => import('./pages/settings'))

// 로딩 컴포넌트
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <p className="ml-4 text-gray-600">로딩 중...</p>
  </div>
)

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Navigation />
          <main>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/flashcards" element={<Flashcards />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App