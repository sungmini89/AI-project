import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { CalculatorPage } from './pages/CalculatorPage'
import EnhancedCalculatorPage from './components/calculator/EnhancedCalculatorPage'
import EditPage from './pages/EditPage'
import ResultPage from './pages/ResultPage'
import HistoryPage from './pages/HistoryPage'
import StatsPage from './pages/StatsPage'
import TemplatesPage from './pages/TemplatesPage'
import ArchivePage from './pages/ArchivePage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { HotkeyProvider } from './components/providers/HotkeyProvider'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <HotkeyProvider>
          <Layout>
            <Routes>
              {/* Main calculator route - Enhanced version */}
              <Route 
                path="/" 
                element={<EnhancedCalculatorPage />} 
              />
              
              {/* Calculator routes - Enhanced version */}
              <Route 
                path="/calculator" 
                element={<EnhancedCalculatorPage />} 
              />
              <Route 
                path="/calculator/new" 
                element={<EnhancedCalculatorPage />} 
              />
              
              {/* Legacy calculator for comparison/testing */}
              <Route 
                path="/calculator/legacy" 
                element={<CalculatorPage />} 
              />
              <Route 
                path="/calculator/:step" 
                element={<EnhancedCalculatorPage />} 
              />
              
              {/* Edit OCR results */}
              <Route 
                path="/edit" 
                element={<EditPage />} 
              />
              <Route 
                path="/edit/:calculationId" 
                element={<EditPage />} 
              />
              
              {/* View results */}
              <Route 
                path="/result" 
                element={<ResultPage />} 
              />
              <Route 
                path="/result/:id" 
                element={<ResultPage />} 
              />
              
              {/* History management */}
              <Route 
                path="/history" 
                element={<HistoryPage />} 
              />
              
              {/* Utility pages */}
              <Route 
                path="/stats" 
                element={<StatsPage />} 
              />
              <Route 
                path="/templates" 
                element={<TemplatesPage />} 
              />
              <Route 
                path="/archive" 
                element={<ArchivePage />} 
              />
              
              {/* Settings pages */}
              <Route 
                path="/settings" 
                element={<SettingsPage />} 
              />
              <Route 
                path="/help" 
                element={<HelpPage />} 
              />
              
              {/* Catch all route - redirect to enhanced calculator */}
              <Route 
                path="*" 
                element={<EnhancedCalculatorPage />} 
              />
            </Routes>
          </Layout>
        </HotkeyProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App