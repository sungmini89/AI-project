/**
 * AI Recipe 애플리케이션의 메인 진입점
 * React 애플리케이션을 초기화하고 DOM에 마운트합니다.
 * 
 * @description
 * - React 18의 createRoot를 사용하여 애플리케이션을 렌더링
 * - StrictMode를 활성화하여 개발 시 잠재적 문제 감지
 * - i18n 국제화 설정을 초기화
 * - 전역 CSS 스타일을 로드
 * 
 * @author AI Recipe Team
 * @version 1.0.0
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n"; // i18n 초기화
import App from "./App.tsx";

/**
 * 애플리케이션을 DOM에 마운트
 * root 엘리먼트를 찾아 React 애플리케이션을 렌더링합니다.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
