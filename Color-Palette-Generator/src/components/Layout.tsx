/**
 * @fileoverview 애플리케이션 공통 레이아웃 컴포넌트
 *
 * 모든 페이지에서 공통으로 사용되는 레이아웃 구조를 제공하는
 * 래퍼 컴포넌트입니다. 헤더, 네비게이션, 푸터를 포함합니다.
 *
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 * @since 1.0.0
 *
 * **주요 기능:**
 * - 반응형 헤더 및 네비게이션
 * - 현재 페이지 활성 상태 표시
 * - 브랜드 로고 및 제목
 * - 주요 페이지 링크 (생성기, 저장된 팔레트, 이미지 추출, 가이드, 설정)
 * - 접근성 지원 (ARIA 라벨, 키보드 네비게이션)
 * - 반응형 디자인 (모바일/데스크톱)
 * - 애플리케이션 정보 및 GitHub 링크
 *
 * **네비게이션 구조:**
 * - 생성기: 메인 팔레트 생성 페이지
 * - 저장된 팔레트: 사용자가 저장한 팔레트 목록
 * - 이미지 추출: 이미지에서 색상 추출
 * - 가이드: 사용자 가이드 및 도움말
 * - 설정: 애플리케이션 설정
 *
 * **사용 예시:**
 * ```tsx
 * <Layout>
 *   <YourPageContent />
 * </Layout>
 * ```
 */

import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Palette,
  Heart,
  Github,
  Info,
  Image,
  BookOpen,
  Settings,
} from "lucide-react";

/**
 * Layout 컴포넌트의 Props 인터페이스
 *
 * @interface LayoutProps
 * @property {ReactNode} children - 레이아웃 내부에 렌더링될 자식 컴포넌트
 */
interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/generator";
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  AI 색상 팔레트
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  한국어 키워드로 색상 조합 생성
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-2">
              <Button
                asChild
                variant={isActivePath("/") ? "default" : "ghost"}
                size="sm"
              >
                <Link to="/" className="flex items-center space-x-1">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">생성기</span>
                </Link>
              </Button>

              <Button
                asChild
                variant={isActivePath("/saved") ? "default" : "ghost"}
                size="sm"
              >
                <Link to="/saved" className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">저장된 팔레트</span>
                </Link>
              </Button>

              <Button
                asChild
                variant={isActivePath("/image-extract") ? "default" : "ghost"}
                size="sm"
              >
                <Link
                  to="/image-extract"
                  className="flex items-center space-x-1"
                >
                  <Image className="h-4 w-4" />
                  <span className="hidden sm:inline">이미지 추출</span>
                </Link>
              </Button>

              <Button
                asChild
                variant={isActivePath("/guide") ? "default" : "ghost"}
                size="sm"
              >
                <Link to="/guide" className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">가이드</span>
                </Link>
              </Button>

              <Button
                asChild
                variant={isActivePath("/settings") ? "default" : "ghost"}
                size="sm"
              >
                <Link to="/settings" className="flex items-center space-x-1">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">설정</span>
                </Link>
              </Button>

              {/* About/Info Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const aboutInfo = `🎨 AI 색상 팔레트 생성기

✨ 주요 기능:
• 한국어 키워드로 색상 팔레트 생성
• 5가지 색상 조화 이론 (보색, 유사색, 삼각색, 사각색, 단색)
• WCAG 접근성 검사 및 색각 이상 시뮬레이션
• CSS, JSON 형식으로 내보내기
• 로컬 저장 및 관리

🚀 기술 스택:
• React + TypeScript + Tailwind CSS
• shadcn/ui 컴포넌트
• Color Theory Algorithms
• 오프라인 우선 아키텍처`;

                  alert(aboutInfo);
                }}
              >
                <Info className="h-4 w-4" />
              </Button>

              {/* GitHub Link */}
              <Button asChild variant="ghost" size="sm">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Screen Reader Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="aria-live-region"
      >
        {/* This will be used to announce palette generation results */}
      </div>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white/50 border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Palette className="h-4 w-4" />
              <span>AI 색상 팔레트 생성기</span>
            </div>

            <p className="text-xs text-gray-500 max-w-2xl mx-auto">
              한국어 키워드를 활용해 AI가 생성하는 조화로운 색상 팔레트를
              경험해보세요. 모든 색상 조합은 색상 이론과 접근성 기준을 바탕으로
              생성됩니다.
            </p>

            <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
              <span>© 2024 AI Color Palette Generator</span>
              <span>•</span>
              <span>React + TypeScript</span>
              <span>•</span>
              <span>오프라인 지원</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
