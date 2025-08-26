/**
 * @fileoverview 네비게이션 컴포넌트
 * @description 애플리케이션의 주요 페이지 간 이동을 위한 네비게이션 바입니다.
 * 홈, 분석 도구, 작동원리, 키워드사전 등의 링크를 제공하며,
 * 현재 페이지 상태와 AI 서비스 모드를 표시합니다.
 *
 * @author 개발팀
 * @version 1.0.0
 * @since 2024
 */

import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Brain } from "lucide-react";

/**
 * 네비게이션 컴포넌트의 속성 인터페이스
 * @description 컴포넌트가 받을 수 있는 props를 정의합니다.
 */
interface NavigationProps {
  /** 설정 버튼 클릭 시 호출되는 콜백 함수 */
  onSettingsClick?: () => void;
  /** API 상태 표시 여부 */
  showAPIStatus?: boolean;
  /** 현재 AI 서비스 모드 정보 */
  currentMode?: {
    /** 모드 표시 텍스트 */
    text: string;
    /** 배지 스타일 변형 */
    variant: "default" | "secondary";
    /** 추가 CSS 클래스 */
    className: string;
  };
}

/**
 * 네비게이션 컴포넌트
 * @description 애플리케이션의 주요 페이지 간 이동을 위한 네비게이션 바를 제공합니다.
 * 현재 페이지에 따른 활성 상태 표시, AI 서비스 모드 표시 등의 기능을 포함합니다.
 *
 * @param {NavigationProps} props - 컴포넌트 속성
 * @returns {JSX.Element} 네비게이션 컴포넌트
 *
 * @example
 * ```tsx
 * <Navigation
 *   onSettingsClick={() => setShowSettings(true)}
 *   currentMode={{ text: '무료 API', variant: 'secondary', className: 'bg-green-100' }}
 * />
 * ```
 */
export function Navigation({
  onSettingsClick,
  showAPIStatus = true,
  currentMode,
}: NavigationProps) {
  const location = useLocation();

  /**
   * 현재 경로가 활성 상태인지 확인하는 함수
   * @description 현재 위치와 비교하여 네비게이션 링크의 활성 상태를 결정합니다.
   *
   * @param {string} path - 확인할 경로
   * @returns {boolean} 활성 상태 여부
   */
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex items-center gap-2">
        <Link to="/">
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            size="default"
            className="px-4 py-2 text-base"
          >
            <Home className="mr-2 h-4 w-4" />홈
          </Button>
        </Link>
        <span className="text-muted-foreground text-lg">/</span>
        <Link to="/analyzer">
          <Button
            variant={isActive("/analyzer") ? "default" : "ghost"}
            size="default"
            className="px-4 py-2 text-base"
          >
            분석 도구
          </Button>
        </Link>
        <span className="text-muted-foreground text-lg">/</span>
        <Link to="/how-it-works">
          <Button
            variant={isActive("/how-it-works") ? "default" : "ghost"}
            size="default"
            className="px-4 py-2 text-base"
          >
            작동원리
          </Button>
        </Link>
        <span className="text-muted-foreground text-lg">/</span>
        <Link to="/keyword-dictionary">
          <Button
            variant={isActive("/keyword-dictionary") ? "default" : "ghost"}
            size="default"
            className="px-4 py-2 text-base"
          >
            키워드사전
          </Button>
        </Link>
        {onSettingsClick && (
          <>
            <span className="text-muted-foreground text-lg">/</span>
            <Button
              variant="ghost"
              size="default"
              className="px-4 py-2 text-base"
              onClick={onSettingsClick}
            >
              설정
            </Button>
          </>
        )}
      </div>
      {showAPIStatus && (
        <div className="ml-auto flex items-center gap-4">
          {currentMode && (
            <Badge
              variant={currentMode.variant}
              className={`px-3 py-1 ${currentMode.className}`}
            >
              {currentMode.text}
            </Badge>
          )}
          <Badge variant="secondary" className="px-3 py-1">
            <Brain className="mr-2 h-4 w-4" />
            AI 분석 도구
          </Badge>
        </div>
      )}
    </div>
  );
}
