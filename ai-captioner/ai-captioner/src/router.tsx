import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/shared/AppLayout";
import Landing from "@/pages/Landing";
import Generator from "@/pages/Generator";
import History from "@/pages/History";

/**
 * 애플리케이션의 라우터 설정
 *
 * @description
 * - React Router v6를 사용한 클라이언트 사이드 라우팅
 * - AppLayout을 기본 레이아웃으로 사용
 * - 중첩 라우팅으로 네비게이션과 콘텐츠 영역 분리
 *
 * @returns {Router} 설정된 브라우저 라우터
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Landing /> }, // 홈페이지 (랜딩)
      { path: "app", element: <Generator /> }, // AI 캡션 생성기
      { path: "history", element: <History /> }, // 생성 히스토리
    ],
  },
]);

export default router;
