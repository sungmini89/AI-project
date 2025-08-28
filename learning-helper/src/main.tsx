import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, setupOfflineDetection, installPWA } from './utils/pwa'
import MonitoringService from './utils/monitoring'
import SecurityUtils from './utils/security'

// 보안 환경 검증
const envValidation = SecurityUtils.validateEnvironment();
if (!envValidation.isValid) {
  console.warn('환경 설정 누락:', envValidation.missing);
}

// 모니터링 초기화
MonitoringService.initialize();

// PWA 초기화
if (import.meta.env?.PROD) {
  registerServiceWorker();
}

// 오프라인 감지 설정
setupOfflineDetection();

// PWA 설치 프롬프트
installPWA();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div id="network-status"></div>
    <App />
  </React.StrictMode>,
)