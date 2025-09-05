import React from 'react'
import { Heart, Github, Mail } from 'lucide-react'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
        {/* Logo and copyright */}
        <div className="flex flex-col items-center gap-2 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {currentYear} Smart Split Calculator. 
            <span className="hidden md:inline"> 영수증을 스마트하게 나누세요.</span>
          </p>
        </div>

        {/* Links and actions */}
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
          {/* Made with love */}
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>in Korea</span>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-3">
            <a
              href="https://github.com/username/cost-split-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub 저장소"
              data-testid="github-link"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="mailto:contact@example.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="이메일 문의"
              data-testid="email-link"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Version info - could be dynamically loaded */}
      <div className="border-t bg-muted/30 py-2">
        <div className="container text-center">
          <p className="text-xs text-muted-foreground">
            Version 1.0.0 | 
            <span className="ml-1">
              <a 
                href="/privacy" 
                className="hover:text-foreground transition-colors"
                data-testid="privacy-link"
              >
                개인정보처리방침
              </a>
            </span>
            <span className="mx-1">|</span>
            <a 
              href="/terms" 
              className="hover:text-foreground transition-colors"
              data-testid="terms-link"
            >
              이용약관
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer