import { Component, ErrorInfo, ReactNode } from 'react';
import MonitoringService from '../utils/monitoring';
import SecurityUtils from '../utils/security';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  canRecover: boolean;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      canRecover: false,
      errorId: this.generateErrorId()
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.generateErrorId();
    console.error(`[${errorId}] ErrorBoundary caught an error:`, error, errorInfo);
    
    // 보안된 에러 정보 생성
    const sanitizedError = this.sanitizeErrorInfo(error, errorInfo);
    
    // 모니터링 서비스로 에러 전송
    MonitoringService.captureError(error, {
      errorId,
      ...sanitizedError
    });
    
    // 복구 가능한 에러인지 판단
    const canRecover = this.isRecoverableError(error);
    
    this.setState({
      error,
      errorInfo,
      canRecover,
      errorId
    });
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeErrorInfo(error: Error, errorInfo: ErrorInfo) {
    return {
      message: SecurityUtils.sanitizeText(error.message),
      stack: error.stack ? SecurityUtils.sanitizeText(error.stack) : '',
      componentStack: SecurityUtils.sanitizeText(errorInfo.componentStack || '')
    };
  }

  private isRecoverableError(error: Error): boolean {
    const recoverablePatterns = [
      /chunk load/i,
      /loading/i,
      /network/i,
      /timeout/i
    ];
    
    return recoverablePatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              앗, 문제가 발생했습니다!
            </h1>
            <p className="text-gray-600 mb-6">
              예상치 못한 오류가 발생했습니다. 불편을 드려 죄송합니다.
            </p>
            
            {import.meta.env?.DEV && this.state.error && (
              <details className="text-left bg-gray-100 p-4 rounded mb-6 text-xs">
                <summary className="font-semibold cursor-pointer mb-2">
                  개발자 정보 (DEV 모드)
                </summary>
                <p className="text-red-600 font-mono">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="mt-2 text-gray-700 overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                새로고침
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                홈으로
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              문제가 계속 발생하면 브라우저 캐시를 삭제해보세요.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;