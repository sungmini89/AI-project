import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Calculator, 
  History, 
  Settings, 
  FileText, 
  HelpCircle,
  X,
  BarChart3,
  Archive
} from 'lucide-react'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { cn } from '../../lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  currentPath: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description?: string
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPath }) => {
  const navigate = useNavigate()

  const mainNavItems: NavItem[] = [
    {
      title: '계산기',
      href: '/calculator',
      icon: Calculator,
      description: '영수증 OCR 및 분할 계산'
    },
    {
      title: '히스토리',
      href: '/history',
      icon: History,
      description: '과거 계산 내역 보기'
    }
  ]

  const utilityNavItems: NavItem[] = [
    {
      title: '통계',
      href: '/stats',
      icon: BarChart3,
      description: '지출 패턴 분석'
    },
    {
      title: '템플릿',
      href: '/templates',
      icon: FileText,
      description: '자주 사용하는 분할 설정'
    },
    {
      title: '아카이브',
      href: '/archive',
      icon: Archive,
      description: '보관된 계산 내역'
    }
  ]

  const settingsNavItems: NavItem[] = [
    {
      title: '설정',
      href: '/settings',
      icon: Settings,
      description: '앱 설정 및 환경설정'
    },
    {
      title: '도움말',
      href: '/help',
      icon: HelpCircle,
      description: '사용법 및 FAQ'
    }
  ]

  const handleNavigation = (href: string) => {
    navigate(href)
    onClose()
  }

  const isActiveLink = (href: string) => {
    // 정확한 경로 매칭으로 중복 키 문제 해결
    if (href === '/calculator/new') {
      return currentPath === '/calculator/new'
    }
    if (href === '/calculator') {
      return currentPath === '/' || currentPath === '/calculator'
    }
    return currentPath === href
  }

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 transform border-r steel-panel transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:z-auto lg:translate-x-0 lg:transition-none"
        )}
        data-testid="sidebar"
      >
        {/* Sidebar header */}
        <div className="flex h-14 items-center justify-between border-b px-4 lg:justify-center circuit-line">
          <div className="flex items-center space-x-2 status-active">
            <Calculator className="h-6 w-6 text-primary glow-orange" />
            <span className="font-semibold tech-title">Smart Split</span>
          </div>
          
          {/* Close button - only visible on mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onClose}
            aria-label="사이드바 닫기"
            data-testid="sidebar-close-button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation content */}
        <nav className="flex flex-col h-[calc(100%-3.5rem)] py-4">
          <div className="flex-1 space-y-6 px-3">
            {/* Main navigation */}
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider tech-subtitle">
                메인
              </h3>
              {mainNavItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveLink(item.href)
                
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "w-full flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                    data-testid={`nav-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div>{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <Separator />

            {/* Utility navigation */}
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider tech-subtitle">
                도구
              </h3>
              {utilityNavItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveLink(item.href)
                
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "w-full flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                    data-testid={`nav-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div>{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="px-3 space-y-1">
            <Separator className="mb-3" />
            
            {/* Settings navigation */}
            {settingsNavItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveLink(item.href)
              
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                  data-testid={`nav-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.title}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar