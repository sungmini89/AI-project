import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Settings, 
  Zap,
  Wifi,
  WifiOff,
  Globe,
  Smartphone 
} from 'lucide-react';
import { freeAIService, type APIMode, type UsageStats } from '@/services/freeAIService';

interface APIStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
  onConfigClick?: () => void;
}

export function APIStatusIndicator({ 
  className = "", 
  showDetails = true,
  onConfigClick 
}: APIStatusIndicatorProps) {
  const [mode, setMode] = useState<APIMode>('offline');
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [quota, setQuota] = useState<{ daily: number; monthly: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000); // 30초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const currentMode = freeAIService.getCurrentMode();
      const currentUsage = freeAIService.getUsage();
      const remainingQuota = freeAIService.getRemainingQuota();
      
      setMode(currentMode);
      setUsage(currentUsage);
      setQuota(remainingQuota);
    } catch (error) {
      console.error('Failed to load API status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModeIcon = (mode: APIMode) => {
    switch (mode) {
      case 'mock':
        return <Smartphone className="h-4 w-4" />;
      case 'free':
        return <Globe className="h-4 w-4" />;
      case 'offline':
        return <WifiOff className="h-4 w-4" />;
      case 'custom':
        return <Wifi className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getModeLabel = (mode: APIMode) => {
    switch (mode) {
      case 'mock':
        return '개발 모드';
      case 'free':
        return '무료 API';
      case 'offline':
        return '오프라인';
      case 'custom':
        return '사용자 API';
      default:
        return '알 수 없음';
    }
  };

  const getModeVariant = (mode: APIMode) => {
    switch (mode) {
      case 'mock':
        return 'secondary';
      case 'free':
        return 'default';
      case 'offline':
        return 'outline';
      case 'custom':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getModeDescription = (mode: APIMode) => {
    switch (mode) {
      case 'mock':
        return '개발용 모의 데이터를 사용합니다';
      case 'free':
        return '무료 API 서비스를 사용합니다';
      case 'offline':
        return '로컬 분석만 사용합니다';
      case 'custom':
        return '사용자 제공 API 키를 사용합니다';
      default:
        return '알 수 없는 모드입니다';
    }
  };


  const getQuotaWarningIcon = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (percentage >= 70) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 animate-pulse" />
            <span className="text-sm text-muted-foreground">API 상태 확인 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Badge variant={getModeVariant(mode)} className="flex items-center space-x-1">
          {getModeIcon(mode)}
          <span>{getModeLabel(mode)}</span>
        </Badge>
        {onConfigClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onConfigClick}
            className="h-6 px-2"
          >
            <Settings className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium flex items-center space-x-2">
          <Zap className="h-4 w-4" />
          <span>API 상태</span>
        </CardTitle>
        {onConfigClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onConfigClick}
            className="h-6 px-2"
          >
            <Settings className="h-3 w-3" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 현재 모드 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={getModeVariant(mode)} className="flex items-center space-x-1">
              {getModeIcon(mode)}
              <span>{getModeLabel(mode)}</span>
            </Badge>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {getModeDescription(mode)}
        </div>

        {/* API 사용량 (free/custom 모드일 때만) */}
        {(mode === 'free' || mode === 'custom') && usage && quota && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  {getQuotaWarningIcon(usage.daily, usage.daily + quota.daily)}
                  <span>일일 사용량</span>
                </span>
                <span className="text-muted-foreground">
                  {usage.daily} / {usage.daily + quota.daily}
                </span>
              </div>
              <Progress 
                value={usage.daily / (usage.daily + quota.daily) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  {getQuotaWarningIcon(usage.monthly, usage.monthly + quota.monthly)}
                  <span>월간 사용량</span>
                </span>
                <span className="text-muted-foreground">
                  {usage.monthly} / {usage.monthly + quota.monthly}
                </span>
              </div>
              <Progress 
                value={usage.monthly / (usage.monthly + quota.monthly) * 100} 
                className="h-2"
              />
            </div>

            {quota.daily === 0 || quota.monthly === 0 ? (
              <div className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-xs text-yellow-800 dark:text-yellow-200">
                  API 사용량이 한도에 도달했습니다. 오프라인 모드로 전환됩니다.
                </span>
              </div>
            ) : null}
          </div>
        )}

        {/* Mock 모드 안내 */}
        {mode === 'mock' && (
          <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <Smartphone className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-blue-800 dark:text-blue-200">
              개발 모드: 실제 API 대신 모의 데이터를 사용합니다
            </span>
          </div>
        )}

        {/* 오프라인 모드 안내 */}
        {mode === 'offline' && (
          <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-900/20 rounded-md">
            <WifiOff className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-800 dark:text-gray-200">
              로컬 분석만 사용하며, AI 인사이트는 제한적입니다
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}