import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Zap } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

interface InstallPromptProps {
  onClose?: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // PWA 설치 가능성 확인
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setIsSupported(true);
      
      // 설치 프롬프트 표시 조건 확인
      const shouldShowPrompt = checkInstallPromptConditions();
      if (shouldShowPrompt) {
        setIsVisible(true);
      }
    };

    // 이미 설치되었는지 확인
    const checkIfInstalled = () => {
      // PWA가 standalone 모드에서 실행 중인지 확인
      return window.matchMedia('(display-mode: standalone)').matches ||
             (window.navigator as any).standalone === true ||
             document.referrer.includes('android-app://');
    };

    if (!checkIfInstalled()) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    // iOS Safari 감지
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOS && isSafari && !checkIfInstalled()) {
      setIsSupported(true);
      const shouldShowPrompt = checkInstallPromptConditions();
      if (shouldShowPrompt) {
        setIsVisible(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // 설치 프롬프트 표시 조건 확인
  const checkInstallPromptConditions = (): boolean => {
    // 로컬 스토리지에서 이전 거부 기록 확인
    const lastDismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissCount = parseInt(localStorage.getItem('pwa-dismiss-count') || '0');
    
    // 3번 이상 거부했다면 더 이상 표시하지 않음
    if (dismissCount >= 3) {
      return false;
    }

    // 최근 24시간 내에 거부했다면 표시하지 않음
    if (lastDismissed) {
      const lastDismissedTime = parseInt(lastDismissed);
      const now = Date.now();
      const hours24 = 24 * 60 * 60 * 1000;
      
      if (now - lastDismissedTime < hours24) {
        return false;
      }
    }

    // 사용자가 충분히 앱을 사용했는지 확인 (최소 2번 이상 방문)
    const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0');
    return visitCount >= 2;
  };

  // 방문 횟수 증가
  useEffect(() => {
    const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0');
    localStorage.setItem('pwa-visit-count', (visitCount + 1).toString());
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt && !isIOSInstall()) {
      return;
    }

    setIsInstalling(true);

    try {
      if (deferredPrompt) {
        // Android/Chrome 설치
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('PWA 설치 완료');
          localStorage.setItem('pwa-installed', 'true');
          setIsVisible(false);
          onClose?.();
        }
        
        setDeferredPrompt(null);
      } else {
        // iOS Safari - 수동 설치 안내
        alert('Safari에서 공유 버튼 → "홈 화면에 추가"를 선택하여 설치하세요.');
      }
    } catch (error) {
      console.error('PWA 설치 실패:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    const dismissCount = parseInt(localStorage.getItem('pwa-dismiss-count') || '0');
    localStorage.setItem('pwa-dismiss-count', (dismissCount + 1).toString());
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    
    setIsVisible(false);
    onClose?.();
  };

  const isIOSInstall = (): boolean => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && 
           /Safari/.test(navigator.userAgent) && 
           !/Chrome/.test(navigator.userAgent);
  };

  const getInstallInstructions = (): string => {
    if (isIOSInstall()) {
      return 'Safari 공유 버튼을 누른 후 "홈 화면에 추가"를 선택하세요';
    }
    return '앱을 설치하여 더 빠르고 편리하게 사용하세요';
  };

  if (!isVisible || !isSupported) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl transform animate-slide-up">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">앱 설치</h3>
              <p className="text-sm text-gray-600">AI 색상 팔레트 생성기</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 혜택 목록 */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-700">오프라인에서도 색상 생성 가능</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm text-gray-700">더 빠른 실행 속도</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Monitor className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm text-gray-700">홈 화면에서 바로 접근</span>
          </div>
        </div>

        {/* 설치 안내 */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-700 text-center">
            {getInstallInstructions()}
          </p>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-3 px-4 text-gray-600 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            나중에
          </button>
          
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className={`flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              isInstalling ? 'opacity-75' : ''
            }`}
          >
            {isInstalling ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                설치 중...
              </div>
            ) : (
              '설치하기'
            )}
          </button>
        </div>

        {/* 작은 설명 */}
        <p className="text-xs text-gray-500 text-center mt-4">
          설치 후 브라우저 없이도 앱을 사용할 수 있습니다
        </p>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        @media (min-width: 768px) {
          .animate-slide-up {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default InstallPrompt;