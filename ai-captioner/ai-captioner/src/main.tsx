import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import "./index.css";

/**
 * 애플리케이션의 진입점 (Entry Point)
 *
 * @description
 * - React 애플리케이션을 DOM에 마운트
 * - React Router 설정 적용
 * - PWA Service Worker 등록
 * - 전역 CSS 스타일 적용
 */

// PWA Service Worker 등록 (개발 환경에서는 비활성화)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW 등록 성공:", registration);
      })
      .catch((error) => {
        console.log("SW 등록 실패:", error);
      });
  });
}

// React 애플리케이션을 DOM에 렌더링
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
