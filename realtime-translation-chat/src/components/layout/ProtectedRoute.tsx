/**
 * @fileoverview 보호된 라우트 컴포넌트
 *
 * 이 컴포넌트는 사용자 인증이 필요한 페이지를 보호합니다.
 * 인증되지 않은 사용자는 로그인 페이지로 리다이렉트됩니다.
 *
 * @author 실시간 번역 채팅 팀
 * @version 1.0.0
 */

import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { mockUserService } from "@/lib/services/mockUserService";

/**
 * 보호된 라우트 컴포넌트의 props 인터페이스
 */
interface ProtectedRouteProps {
  /** 보호할 자식 컴포넌트 */
  children: React.ReactNode;
}

/**
 * 보호된 라우트 컴포넌트
 *
 * @description
 * - 사용자 인증 상태를 확인
 * - 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
 * - 로딩 중일 때 스피너 표시
 * - 오프라인 모드에서 Mock 서비스 사용 지원
 * - 원래 목적지 정보를 로그인 페이지에 전달
 *
 * @param {ProtectedRouteProps} props - 컴포넌트 props
 * @returns {JSX.Element} 보호된 라우트 또는 리다이렉트
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // 오프라인 모드에서는 Mock 서비스 사용
    if (import.meta.env.VITE_API_MODE === "offline") {
      unsubscribe = mockUserService.onAuthStateChanged((user) => {
        setUser(user);
        setLoading(false);
      });
    } else {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
    }

    return () => unsubscribe?.();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page but remember the intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
