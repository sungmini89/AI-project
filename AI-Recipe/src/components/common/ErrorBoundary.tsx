import React, { Component, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  // 번역 함수 (클래스 컴포넌트에서 사용)
  private t = (key: string) => {
    const translations: Record<string, string> = {
      "error.title": "문제가 발생했습니다",
      "error.description":
        "예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.",
      "error.retry": "다시 시도",
      "error.refresh": "페이지 새로고침",
      "error.developerInfo": "개발자 정보",
    };
    return translations[key] || key;
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo); // Keep English for debugging
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {this.t("error.title")}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {this.t("error.description")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {this.t("error.retry")}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    {this.t("error.refresh")}
                  </Button>
                </div>

                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-left">
                    <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100">
                      {this.t("error.developerInfo")}
                    </summary>
                    <pre className="mt-2 text-xs text-gray-700 dark:text-gray-300 overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook 기반 에러 처리
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = () => setError(null);

  const handleError = React.useCallback((error: Error) => {
    console.error("Handled error:", error); // Keep English for debugging
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      // 에러 리포팅 서비스로 전송 (예: Sentry)
      // reportError(error)
    }
  }, [error]);

  return {
    error,
    handleError,
    resetError,
    hasError: error !== null,
  };
}
