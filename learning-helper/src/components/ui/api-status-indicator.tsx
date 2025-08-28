/**
 * API 상태 표시 컴포넌트
 * 현재 AI 서비스 모드와 할당량 상태를 표시합니다
 */
import React, { useState, useEffect } from 'react';
import { freeAIService } from '@/services/freeAIService';
import { APIUsageInfo } from '@/types';
import { 
  Wifi, 
  WifiOff, 
  TestTube, 
  Globe,
  AlertCircle,
  CheckCircle,
  Loader2 
} from 'lucide-react';

interface APIStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const APIStatusIndicator: React.FC<APIStatusIndicatorProps> = ({ 
  className = '',
  showDetails = false
}) => {
  const [usageInfo, setUsageInfo] = useState<APIUsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsageInfo();
    
    // 5초마다 사용량 정보 갱신
    const interval = setInterval(loadUsageInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadUsageInfo = () => {
    try {
      const info = freeAIService.getUsageInfo();
      setUsageInfo(info);
    } catch (error) {
      console.warn('사용량 정보 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'offline': return <WifiOff className="h-4 w-4" />;
      case 'free': return <Wifi className="h-4 w-4" />;
      case 'mock': return <TestTube className="h-4 w-4" />;
      case 'custom': return <Globe className="h-4 w-4" />;
      default: return <WifiOff className="h-4 w-4" />;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'offline': return '오프라인';
      case 'free': return '무료 AI';
      case 'mock': return '테스트';
      case 'custom': return '사용자 정의';
      default: return '알 수 없음';
    }
  };

  const getModeColor = (mode: string, canUseAI: boolean) => {
    if (mode === 'offline') {
      return 'text-gray-600 bg-gray-100';
    } else if (canUseAI) {
      return 'text-green-600 bg-green-100';
    } else {
      return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (mode: string, canUseAI: boolean) => {
    if (mode === 'offline') {
      return <CheckCircle className="h-3 w-3" />;
    } else if (canUseAI) {
      return <CheckCircle className="h-3 w-3" />;
    } else {
      return <AlertCircle className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        <span className="text-sm text-gray-600">로딩 중...</span>
      </div>
    );
  }

  if (!usageInfo) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-600" />
        <span className="text-sm text-red-600">오류</span>
      </div>
    );
  }

  const colorClass = getModeColor(usageInfo.currentMode, usageInfo.canUseAI);

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${colorClass} ${className}`}>
      {getModeIcon(usageInfo.currentMode)}
      <span className="text-sm font-medium">
        {getModeLabel(usageInfo.currentMode)}
      </span>
      
      {showDetails && usageInfo.currentMode !== 'offline' && (
        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-current opacity-75">
          {getStatusIcon(usageInfo.currentMode, usageInfo.canUseAI)}
          <span className="text-xs">
            {usageInfo.daily.remaining}/{usageInfo.daily.total}
          </span>
        </div>
      )}

      {!usageInfo.canUseAI && usageInfo.currentMode !== 'offline' && (
        <AlertCircle className="h-3 w-3" />
      )}
    </div>
  );
};

export default APIStatusIndicator;