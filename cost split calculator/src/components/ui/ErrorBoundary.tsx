import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report to error tracking service
    // if (window.gtag) {
    //   window.gtag('event', 'exception', {
    //     description: error.message,
    //     fatal: false
    //   })
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Error icon */}
            <div className="flex justify-center">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>

            {/* Error message */}
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">
                문제가 발생했습니다
              </h1>
              <p className="text-muted-foreground">
                예상치 못한 오류로 인해 앱이 중단되었습니다. 
                페이지를 새로고침하거나 홈으로 이동해주세요.
              </p>
            </div>

            {/* Error details (only in development) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left bg-muted p-4 rounded-lg text-sm">
                <summary className="cursor-pointer font-medium mb-2">
                  개발자 정보
                </summary>
                <div className="space-y-2 text-xs">
                  <div>
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-xs overflow-x-auto">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={this.handleReset}
                className="flex items-center gap-2"
                data-testid="error-retry-button"
              >
                <RefreshCw className="h-4 w-4" />
                다시 시도
              </Button>
              
              <Button 
                variant="outline"
                onClick={this.handleGoHome}
                className="flex items-center gap-2"
                data-testid="error-home-button"
              >
                <Home className="h-4 w-4" />
                홈으로 이동
              </Button>
            </div>

            {/* Help text */}
            <div className="text-xs text-muted-foreground">
              <p>
                문제가 지속될 경우{' '}
                <a 
                  href="mailto:contact@example.com" 
                  className="text-primary hover:underline"
                >
                  contact@example.com
                </a>
                으로 문의해주세요.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary