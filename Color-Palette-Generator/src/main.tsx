/**
 * @fileoverview 애플리케이션 진입점 및 초기화 로직
 *
 * React 애플리케이션의 메인 진입점으로, DOM 마운트, 성능 최적화,
 * PWA 서비스 워커 등록 등의 초기화 작업을 담당합니다.
 *
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 * @since 1.0.0
 *
 * **주요 기능:**
 * - React 18의 createRoot API 사용
 * - 성능 모니터링 시스템 초기화
 * - PWA 서비스 워커 등록
 * - 리소스 프리로딩을 통한 성능 최적화
 * - 에러 핸들링 및 로깅
 *
 * **성능 최적화:**
 * - 중요 리소스 프리로딩
 * - 성능 메트릭 수집 및 분석
 * - 서비스 워커를 통한 캐싱 전략
 *
 * @example
 * ```typescript
 * // 애플리케이션 시작
 * // 이 파일이 번들러에 의해 자동으로 실행됩니다
 * ```
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { performanceMonitor } from "./utils/performance/monitoring";

/**
 * 초기 로딩 성능 최적화 함수
 *
 * 중요한 리소스들을 프리로딩하여 사용자 경험을 개선합니다.
 * 폰트, 스타일시트 등 렌더링 블로킹 리소스를 미리 로드합니다.
 *
 * **프리로딩 대상:**
 * - Google Fonts (Inter 폰트 패밀리)
 * - 중요 CSS 리소스
 * - 아이콘 및 이미지 리소스
 *
 * @function
 * @returns {void}
 *
 * @example
 * ```typescript
 * // 애플리케이션 시작 시 자동으로 호출됨
 * optimizeInitialLoad();
 * ```
 */
const optimizeInitialLoad = () => {
  // Preload critical resources
  const criticalResources = [
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  ];

  criticalResources.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = "style";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
};

// Initialize performance monitoring
const startTime = performance.now();
performanceMonitor.recordMetric({
  responseTime: startTime,
  timestamp: Date.now(),
});

// Optimize initial load
optimizeInitialLoad();

// Register service worker for PWA with improved error handling
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // 성능 지표 기록
        performanceMonitor.recordMetric({
          responseTime: performance.now() - startTime,
          timestamp: Date.now(),
        });
        console.log("✅ SW registered:", registration);
      })
      .catch((error) => {
        console.log("❌ SW registration failed:", error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
