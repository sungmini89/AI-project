
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import APIStatusIndicator from '../ui/api-status-indicator';
import { 
  LayoutDashboard, 
  Upload, 
  BookOpen, 
  Brain, 
  Settings,
  Home
} from 'lucide-react';

// 메인 네비게이션 컴포넌트
export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      path: '/',
      label: '홈',
      icon: Home,
    },
    {
      path: '/dashboard',
      label: '대시보드',
      icon: LayoutDashboard,
    },
    {
      path: '/upload',
      label: '자료 업로드',
      icon: Upload,
    },
    {
      path: '/flashcards',
      label: '플래시카드',
      icon: BookOpen,
    },
    {
      path: '/quiz',
      label: '퀴즈',
      icon: Brain,
    },
    {
      path: '/settings',
      label: '설정',
      icon: Settings,
    }
  ];

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">AI Study Helper</span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "outline" : "ghost"}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
            
            {/* API 상태 표시 */}
            <APIStatusIndicator showDetails={true} />
          </div>

          {/* 모바일 메뉴 버튼 (추후 구현) */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 모바일 네비게이션 */}
        <div className="md:hidden border-t">
          <div className="flex justify-around py-2">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "outline" : "ghost"}
                    size="sm"
                    className="flex flex-col items-center space-y-1 h-auto py-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}