// 에러 경계 컴포넌트

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="card p-8 text-center">
              <div className="text-6xl mb-6">😵</div>
              
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                앗! 뭔가 잘못되었어요
              </h1>
              
              <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                예상치 못한 오류가 발생했습니다. 
                페이지를 새로고침하거나 다시 시도해보세요.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={this.handleReload}
                  className="btn-primary px-6 py-3 rounded-lg"
                >
                  🔄 페이지 새로고침
                </button>
                
                <button
                  onClick={this.handleReset}
                  className="btn-secondary px-6 py-3 rounded-lg"
                >
                  다시 시도
                </button>
              </div>

              {/* 개발 환경에서만 오류 상세 정보 표시 */}
              {import.meta.env.DEV && this.state.error && (
                <details className="text-left bg-secondary-100 dark:bg-secondary-800 p-4 rounded-lg">
                  <summary className="cursor-pointer text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                    개발자 정보 (클릭하여 펼치기)
                  </summary>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                        오류 메시지:
                      </h3>
                      <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-3 rounded overflow-x-auto text-red-800 dark:text-red-200">
                        {this.state.error.message}
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                        스택 트레이스:
                      </h3>
                      <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-3 rounded overflow-x-auto text-red-800 dark:text-red-200">
                        {this.state.error.stack}
                      </pre>
                    </div>

                    {this.state.errorInfo && (
                      <div>
                        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                          컴포넌트 스택:
                        </h3>
                        <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-3 rounded overflow-x-auto text-red-800 dark:text-red-200">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="mt-6 text-sm text-secondary-500 dark:text-secondary-500 border-t border-secondary-200 dark:border-secondary-700 pt-6">
                <p>
                  문제가 계속 발생하면 브라우저의 개발자 도구(F12)를 열어 
                  콘솔 오류를 확인해보세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;