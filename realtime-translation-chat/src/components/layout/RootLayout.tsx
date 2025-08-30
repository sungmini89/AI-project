/**
 * @fileoverview 애플리케이션의 루트 레이아웃 컴포넌트
 *
 * 이 컴포넌트는 모든 페이지에 공통으로 적용되는 레이아웃을 제공합니다.
 * 테마 제공자와 기본 스타일링을 포함합니다.
 *
 * @author 실시간 번역 채팅 팀
 * @version 1.0.0
 */

import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

/**
 * 애플리케이션의 루트 레이아웃 컴포넌트
 *
 * @description
 * - 모든 페이지에 공통 테마 제공
 * - 전체 화면 높이 보장
 * - 배경색 및 기본 스타일링 적용
 *
 * @returns {JSX.Element} 루트 레이아웃 UI
 */
export default function RootLayout() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="chat-theme">
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    </ThemeProvider>
  );
}
