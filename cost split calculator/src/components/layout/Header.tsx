import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Calculator, History, Settings, Keyboard } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { useHotkeyContext } from '../providers/HotkeyProvider'

interface HeaderProps {
  onMenuClick: () => void
  sidebarOpen: boolean
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen }) => {
  const navigate = useNavigate()
  const { showHotkeyHelp } = useHotkeyContext()

  return (
    <header className="sticky top-0 z-50 w-full border-b steel-panel backdrop-blur supports-[backdrop-filter]:bg-background/60 animated-border">
      <div className="container flex h-14 items-center">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
          onClick={onMenuClick}
          aria-label={sidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
          data-testid="mobile-menu-button"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        {/* Logo and title */}
        <Link 
          to="/" 
          className="mr-6 flex items-center space-x-2 transition-colors hover:text-foreground/80 status-active"
          data-testid="logo-link"
        >
          <Calculator className="h-6 w-6 text-primary glow-orange" />
          <span className="hidden font-bold text-xl sm:inline-block tech-title">
            Smart Split
          </span>
          <span className="font-bold text-lg sm:hidden tech-title">
            Split
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="flex items-center space-x-6 text-sm font-medium hidden lg:flex">
          <Link
            to="/calculator"
            className={cn(
              "transition-colors hover:text-foreground/80",
              "flex items-center space-x-1"
            )}
            data-testid="calculator-nav-link"
          >
            <Calculator className="h-4 w-4" />
            <span>계산기</span>
          </Link>
          <Link
            to="/history"
            className={cn(
              "transition-colors hover:text-foreground/80",
              "flex items-center space-x-1"
            )}
            data-testid="history-nav-link"
          >
            <History className="h-4 w-4" />
            <span>히스토리</span>
          </Link>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {/* New calculation button - hidden on mobile */}
          <Button
            size="sm"
            onClick={() => navigate('/calculator')}
            className="hidden sm:flex items-center space-x-1 industrial-btn glow-orange"
            data-testid="new-calculation-button"
          >
            <Calculator className="h-4 w-4" />
            <span>새 계산</span>
          </Button>

          {/* Hotkey help button */}
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            aria-label="단축키 도움말"
            data-testid="hotkey-help-button"
            onClick={showHotkeyHelp}
          >
            <Keyboard className="h-4 w-4" />
          </Button>

          {/* Settings button */}
          <Button
            variant="ghost"
            size="sm"
            className="px-2"
            aria-label="설정"
            data-testid="settings-button"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress indicator - could be added for multi-step processes */}
      {/* <div className="h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div> */}
    </header>
  )
}

export default Header