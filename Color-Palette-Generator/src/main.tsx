import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { performanceMonitor } from './utils/performance/monitoring'

// Performance optimizations
const optimizeInitialLoad = () => {
  // Preload critical resources
  const criticalResources = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  ];
  
  criticalResources.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'style';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Initialize performance monitoring
const startTime = performance.now();
performanceMonitor.recordMetric({
  responseTime: startTime,
  timestamp: Date.now()
});

// Optimize initial load
optimizeInitialLoad();

// Register service worker for PWA with improved error handling
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        // 성능 지표 기록
        performanceMonitor.recordMetric({
          responseTime: performance.now() - startTime,
          timestamp: Date.now()
        });
        console.log('✅ SW registered:', registration);
      })
      .catch(error => {
        console.log('❌ SW registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)