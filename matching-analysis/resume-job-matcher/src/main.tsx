/**
 * @fileoverview 애플리케이션의 진입점 (Entry Point)
 * @description React 애플리케이션을 DOM에 마운트하고 라우터를 설정합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

/**
 * 애플리케이션을 DOM에 마운트하는 함수
 * @description React 18의 createRoot를 사용하여 애플리케이션을 렌더링합니다.
 * StrictMode로 개발 환경에서 잠재적 문제를 감지하고 BrowserRouter로 클라이언트 사이드 라우팅을 활성화합니다.
 *
 * @returns {void}
 *
 * @example
 * 이 파일은 자동으로 실행되며 별도 호출이 필요하지 않습니다.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
