import React, { useState, useEffect } from 'react';
import { RefreshCw, X, Download } from 'lucide-react';
import { swManager } from '../../utils/pwa/serviceWorkerManager';

interface UpdateNotificationProps {
  onClose?: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSize, setUpdateSize] = useState<string>('');

  useEffect(() => {
    // Service Worker 업데이트 이벤트 리스너
    const handleUpdateAvailable = () => {
      setIsVisible(true);
      estimateUpdateSize();
    };

    // Service Worker 이벤트 등록
    swManager.on('update-available', handleUpdateAvailable);

    return () => {
      swManager.off('update-available', handleUpdateAvailable);
    };
  }, []);

  // 업데이트 크기 추정
  const estimateUpdateSize = async () => {
    try {
      const cacheSize = await swManager.getCacheSize();
      const sizeInMB = (cacheSize / (1024 * 1024)).toFixed(1);
      setUpdateSize(`약 ${sizeInMB}MB`);
    } catch (error) {
      setUpdateSize('알 수 없음');
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // 업데이트 적용
      await swManager.applyUpdate();
      
      // 성공 메시지 표시 후 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('업데이트 적용 실패:', error);
      setIsUpdating(false);
      
      // 수동 새로고침 안내
      if (confirm('자동 업데이트에 실패했습니다. 페이지를 새로고침하시겠습니까?')) {
        window.location.reload();
      }
    }
  };

  const handleDismiss = () => {
    // 업데이트 거부 기록 (임시적으로만)
    sessionStorage.setItem('update-dismissed', Date.now().toString());
    setIsVisible(false);
    onClose?.();
  };

  const handleLater = () => {
    // 1시간 후 다시 알림
    const oneHour = 60 * 60 * 1000;
    const nextReminder = Date.now() + oneHour;
    localStorage.setItem('update-reminder', nextReminder.toString());
    
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 transform animate-slide-in">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">업데이트 사용 가능</h4>
              <p className="text-xs text-gray-500">새로운 기능이 준비되었습니다</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* 업데이트 내용 */}
        <div className="mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <h5 className="font-medium text-blue-900 text-sm mb-2">새로운 기능:</h5>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 향상된 색상 생성 알고리즘</li>
              <li>• 더 빠른 성능</li>
              <li>• 버그 수정 및 안정성 개선</li>
            </ul>
          </div>
          
          {updateSize && (
            <div className="flex items-center gap-2 mt-2">
              <Download className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-600">업데이트 크기: {updateSize}</span>
            </div>
          )}
        </div>

        {/* 진행 표시 */}
        {isUpdating && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-sm text-blue-600">업데이트 적용 중...</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>
        )}

        {/* 버튼 그룹 */}
        <div className="flex gap-2">
          <button
            onClick={handleLater}
            disabled={isUpdating}
            className="flex-1 py-2 px-3 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            나중에
          </button>
          
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 py-2 px-3 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? '업데이트 중...' : '지금 업데이트'}
          </button>
        </div>

        {/* 자동 업데이트 안내 */}
        <p className="text-xs text-gray-500 text-center mt-3">
          업데이트 후 페이지가 자동으로 새로고침됩니다
        </p>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        @media (max-width: 640px) {
          .fixed {
            position: fixed;
            top: 1rem;
            left: 1rem;
            right: 1rem;
            max-width: none;
          }
          
          .animate-slide-in {
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default UpdateNotification;