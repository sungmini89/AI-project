import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { 
  Activity, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  WebVitalsMetric, 
  usePerformanceMonitoring, 
  exportPerformanceReport 
} from '@/utils/performance';

/**
 * 성능 모니터링 패널 컴포넌트
 * Core Web Vitals 및 성능 메트릭 실시간 표시
 */
export const PerformancePanel: React.FC = () => {
  const { getAllMetrics, getPerformanceSummary } = usePerformanceMonitoring();
  const [metrics, setMetrics] = useState<WebVitalsMetric[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // 메트릭 업데이트
  const refreshMetrics = () => {
    setMetrics(getAllMetrics());
  };

  // 주기적으로 메트릭 업데이트
  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  // 개발 환경에서만 표시
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development');
  }, []);

  if (!isVisible) return null;

  const summary = getPerformanceSummary();

  // 메트릭 아이콘 및 색상
  const getMetricBadge = (metric: WebVitalsMetric) => {
    const badgeProps = {
      good: { variant: 'default' as const, icon: CheckCircle2, color: 'text-green-600' },
      'needs-improvement': { variant: 'secondary' as const, icon: AlertCircle, color: 'text-yellow-600' },
      poor: { variant: 'destructive' as const, icon: TrendingDown, color: 'text-red-600' }
    };

    const props = badgeProps[metric.rating];
    const Icon = props.icon;

    return (
      <Badge variant={props.variant} className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${props.color}`} />
        {metric.rating === 'needs-improvement' ? '개선 필요' : 
         metric.rating === 'good' ? '좋음' : '나쁨'}
      </Badge>
    );
  };

  // 메트릭 값 포맷팅
  const formatMetricValue = (metric: WebVitalsMetric): string => {
    const value = Math.round(metric.value);
    if (['FID', 'FCP', 'LCP', 'TTFB'].includes(metric.name)) {
      return `${value}ms`;
    }
    return value.toString();
  };

  // 리포트 다운로드
  const handleDownloadReport = () => {
    const report = exportPerformanceReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="bg-white/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-sm">성능 모니터링</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={refreshMetrics}
                className="h-7 w-7 p-0"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleDownloadReport}
                className="h-7 w-7 p-0"
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            Core Web Vitals 실시간 모니터링
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* 전체 성능 요약 */}
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-xs font-medium">전체 성능</span>
            <Badge 
              variant={summary.overall === 'good' ? 'default' : 
                     summary.overall === 'needs-improvement' ? 'secondary' : 'destructive'}
            >
              {summary.overall === 'good' ? '우수' :
               summary.overall === 'needs-improvement' ? '보통' : '개선 필요'}
            </Badge>
          </div>

          {/* 개별 메트릭 */}
          <div className="space-y-2">
            {metrics.length === 0 ? (
              <div className="flex items-center gap-2 p-2 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-xs">메트릭 수집 중...</span>
              </div>
            ) : (
              metrics.map((metric) => (
                <div key={metric.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{metric.name}</span>
                    <span className="text-xs text-gray-500">
                      {formatMetricValue(metric)}
                    </span>
                  </div>
                  {getMetricBadge(metric)}
                </div>
              ))
            )}
          </div>

          {/* 성능 제안사항 */}
          {summary.suggestions.length > 0 && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3 h-3 text-yellow-600" />
                <span className="text-xs font-medium text-yellow-800">최적화 제안</span>
              </div>
              <ul className="text-xs text-yellow-700 space-y-1">
                {summary.suggestions.slice(0, 2).map((suggestion, index) => (
                  <li key={index} className="text-xs">• {suggestion}</li>
                ))}
                {summary.suggestions.length > 2 && (
                  <li className="text-xs font-medium">
                    +{summary.suggestions.length - 2}개 제안사항 더보기
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="text-xs text-gray-400 text-center pt-2">
            성능 데이터는 개발 환경에서만 표시됩니다
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// 성능 모니터링 토글 버튼 (개발 환경)
export const PerformanceToggle: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Ctrl + Shift + P로 성능 패널 토글
      const handleKeydown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
          e.preventDefault();
          setIsVisible(prev => !prev);
        }
      };

      window.addEventListener('keydown', handleKeydown);
      return () => window.removeEventListener('keydown', handleKeydown);
    }
  }, []);

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <PerformancePanel />;
};