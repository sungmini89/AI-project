import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Edit3, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Moon,
  Sun,
  Heart
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 다크 모드 토글
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // 네비게이션 메뉴 항목들
  const navigationItems = [
    {
      name: '홈',
      icon: Home,
      path: '/',
      description: '대시보드'
    },
    {
      name: '일기 쓰기',
      icon: Edit3,
      path: '/write',
      description: '새 일기 작성'
    },
    {
      name: '일기 목록',
      icon: BookOpen,
      path: '/diary',
      description: '작성한 일기들'
    },
    {
      name: '분석',
      icon: BarChart3,
      path: '/analytics',
      description: '감정 분석 리포트'
    },
    {
      name: '설정',
      icon: Settings,
      path: '/settings',
      description: '앱 설정'
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* 모바일 메뉴 오버레이 */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* 사이드바 */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* 사이드바 헤더 */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center space-x-2" onClick={closeSidebar}>
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">AI 감정일기</h1>
            </div>
          </Link>
          
          {/* 모바일 닫기 버튼 */}
          <button
            onClick={closeSidebar}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`mr-3 flex-shrink-0 ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400'
                  }`} 
                />
                <div className="flex-1">
                  <div>{item.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* 사이드바 하단 */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          {/* 다크 모드 토글 */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? (
              <Sun size={20} className="mr-3 text-yellow-500" />
            ) : (
              <Moon size={20} className="mr-3 text-gray-400" />
            )}
            {isDarkMode ? '라이트 모드' : '다크 모드'}
          </button>
          
          {/* 버전 정보 */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <div>AI 감정일기 v1.0.0</div>
              <div className="mt-1">
                Made with ❤️ by Claude
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="lg:pl-64">
        {/* 상단 헤더 (모바일용) */}
        <div className="sticky top-0 z-10 flex items-center h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu size={20} />
          </button>
          
          <Link to="/" className="ml-4 flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">AI 감정일기</h1>
          </Link>
        </div>

        {/* 페이지 콘텐츠 */}
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>

      {/* 퀵 액션 버튼 (모바일용) */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <button
          onClick={() => navigate('/write')}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
        >
          <Edit3 size={24} />
        </button>
      </div>
    </div>
  );
};

export default Layout;