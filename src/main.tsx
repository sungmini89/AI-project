/**
 * 애플리케이션 진입점
 * React 애플리케이션을 DOM에 마운트하고 초기화
 * @see https://react.dev/reference/react-dom/client/createRoot
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// 언어 설정은 languageStore에서 자동으로 초기화됩니다
import App from "./App.tsx";

/**
 * React 애플리케이션을 DOM에 렌더링
 * StrictMode로 개발 시 잠재적 문제 감지
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
