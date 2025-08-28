// PWA 관련 유틸리티 함수들

export const isStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      console.log('Service Worker registered successfully:', registration.scope);
      
      // 업데이트 확인
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // 새 버전 사용 가능
                showUpdateNotification();
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

export const showUpdateNotification = (): void => {
  if (confirm('새 버전이 사용 가능합니다. 지금 업데이트하시겠습니까?')) {
    window.location.reload();
  }
};

export const installPWA = (): void => {
  let deferredPrompt: any;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });
  
  const showInstallButton = () => {
    const installButton = document.createElement('button');
    installButton.textContent = '앱 설치';
    installButton.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    installButton.onclick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        console.log('Install prompt result:', result);
        deferredPrompt = null;
        installButton.remove();
      }
    };
    document.body.appendChild(installButton);
  };
};

// 오프라인 상태 감지
export const setupOfflineDetection = (): void => {
  const updateOnlineStatus = () => {
    const statusElement = document.getElementById('network-status');
    if (statusElement) {
      if (navigator.onLine) {
        statusElement.textContent = '';
        statusElement.className = 'hidden';
      } else {
        statusElement.textContent = '오프라인 모드';
        statusElement.className = 'fixed top-0 left-0 w-full bg-yellow-500 text-white text-center py-2 z-50';
      }
    }
  };
  
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
};

// 로컬 스토리지 관리
export const saveOfflineData = (key: string, data: any): void => {
  try {
    localStorage.setItem(`offline_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save offline data:', error);
  }
};

export const getOfflineData = (key: string): any => {
  try {
    const data = localStorage.getItem(`offline_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get offline data:', error);
    return null;
  }
};

export const clearOfflineData = (key?: string): void => {
  if (key) {
    localStorage.removeItem(`offline_${key}`);
  } else {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('offline_'));
    keys.forEach(k => localStorage.removeItem(k));
  }
};

// 캐시 관리
export const clearCache = async (): Promise<void> => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }
};