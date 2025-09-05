import React from 'react'
import { Link } from 'react-router-dom'
import { Calculator, History, Plus, BarChart3 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface MobileNavProps {
  currentPath: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPath }) => {
  const navItems: NavItem[] = [
    {
      title: '계산기',
      href: '/calculator',
      icon: Calculator
    },
    {
      title: '히스토리',
      href: '/history',
      icon: History
    },
    {
      title: '통계',
      href: '/stats',
      icon: BarChart3
    }
  ]

  const isActiveLink = (href: string) => {
    if (href === '/calculator' && (currentPath === '/' || currentPath === '/calculator')) {
      return true
    }
    return currentPath === href
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden"
      data-testid="mobile-nav"
    >
      <div className="grid grid-cols-3 gap-0">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = isActiveLink(item.href)
          
          return (
            <Link
              key={`${item.title}-${item.href}`}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                "min-h-[60px]",
                isActive 
                  ? "text-primary bg-accent/50" 
                  : "text-muted-foreground"
              )}
              data-testid={`mobile-nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-[10px] leading-tight text-center">
                {item.title}
              </span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[8px] text-primary-foreground flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  )
}

export default MobileNav