import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudOff } from 'lucide-react';

interface OfflineIndicatorProps {
  className?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow' | 'unknown'>('unknown');

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      // 상태 변경 시 잠시 표시
      setShowIndicator(true);
      
      // 3초 후 자동 숨김 (온라인 상태일 때만)
      if (online) {
        setTimeout(() => {
          setShowIndicator(false);
        }, 3000);
      } else {
        // 오프라인일 때는 계속 표시
        setShowIndicator(true);
      }
      
      // 연결 속도 감지 (온라인일 때만)
      if (online) {
        detectConnectionSpeed();
      }
    };

    // 연결 속도 감지
    const detectConnectionSpeed = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === '4g') {
          setConnectionSpeed('fast');
        } else if (effectiveType === '3g' || effectiveType === '2g') {
          setConnectionSpeed('slow');
        } else {
          setConnectionSpeed('unknown');
        }
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // 초기 상태 설정
    updateOnlineStatus();

    // 정리
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Service Worker 캐시 상태 확인
  const [cacheStatus, setCacheStatus] = useState<'available' | 'updating' | 'error' | 'unknown'>('unknown');

  useEffect(() => {
    const checkCacheStatus = async () => {
      if ('serviceWorker' in navigator && 'caches' in window) {
        try {
          const cacheNames = await caches.keys();
          if (cacheNames.length > 0) {
            setCacheStatus('available');
          }
        } catch (error) {
          setCacheStatus('error');
        }
      }
    };

    checkCacheStatus();

    // Service Worker 메시지 리스너
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATE') {
          setCacheStatus('updating');
          setTimeout(() => setCacheStatus('available'), 2000);
        }
      });
    }
  }, []);

  const getIndicatorContent = () => {
    if (isOnline) {
      return {
        icon: connectionSpeed === 'slow' ? WifiOff : Wifi,
        text: connectionSpeed === 'slow' ? '느린 연결' : '온라인',
        bgColor: connectionSpeed === 'slow' ? 'bg-yellow-500' : 'bg-green-500',
        textColor: 'text-white'
      };
    } else {
      return {
        icon: CloudOff,
        text: cacheStatus === 'available' ? '오프라인 모드' : '연결 끊김',
        bgColor: cacheStatus === 'available' ? 'bg-blue-500' : 'bg-red-500',
        textColor: 'text-white'
      };
    }
  };

  const { icon: Icon, text, bgColor, textColor } = getIndicatorContent();

  if (!showIndicator) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-40 ${className}`}>
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${bgColor} ${textColor} transition-all duration-300 transform animate-slide-down`}
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{text}</span>
        
        {/* 캐시 상태 표시 */}
        {!isOnline && cacheStatus === 'available' && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-white/80 rounded-full"></div>
            <span className="text-xs opacity-90">캐시 사용 가능</span>
          </div>
        )}

        {/* 연결 속도 표시 */}
        {isOnline && connectionSpeed !== 'unknown' && (
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-3 rounded-full ${
                  connectionSpeed === 'fast' 
                    ? 'bg-white/80' 
                    : i === 0 
                      ? 'bg-white/80' 
                      : 'bg-white/30'
                }`}
              ></div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-down {
          from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OfflineIndicator;