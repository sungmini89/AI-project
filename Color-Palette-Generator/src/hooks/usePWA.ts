import { useState, useEffect } from 'react';
import { swManager } from '../utils/pwa/serviceWorkerManager';
import { offlineStorage } from '../utils/pwa/offlineStorage';

export interface PWAStatus {
  isInstalled: boolean;
  isInstallable: boolean;
  isOffline: boolean;
  isUpdateAvailable: boolean;
  serviceWorkerStatus: 'registered' | 'registering' | 'error' | 'none';
  cacheSize: number;
}

export interface PWACapabilities {
  canInstall: boolean;
  hasNotifications: boolean;
  hasBackgroundSync: boolean;
  hasOfflineSupport: boolean;
}

export const usePWA = () => {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isInstallable: false,
    isOffline: !navigator.onLine,
    isUpdateAvailable: false,
    serviceWorkerStatus: 'none',
    cacheSize: 0
  });

  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    canInstall: false,
    hasNotifications: false,
    hasBackgroundSync: false,
    hasOfflineSupport: false
  });

  // Service Worker 초기화
  useEffect(() => {
    const initializeServiceWorker = async () => {
      setStatus(prev => ({ ...prev, serviceWorkerStatus: 'registering' }));
      
      try {
        const registration = await swManager.register();
        
        if (registration) {
          setStatus(prev => ({ ...prev, serviceWorkerStatus: 'registered' }));
          
          // 캐시 크기 조회
          const cacheSize = await swManager.getCacheSize();
          setStatus(prev => ({ ...prev, cacheSize }));
        }
      } catch (error) {
        console.error('Service Worker 초기화 실패:', error);
        setStatus(prev => ({ ...prev, serviceWorkerStatus: 'error' }));
      }
    };

    initializeServiceWorker();
  }, []);

  // 오프라인 스토리지 초기화
  useEffect(() => {
    const initializeOfflineStorage = async () => {
      try {
        await offlineStorage.initialize();
        setCapabilities(prev => ({ ...prev, hasOfflineSupport: true }));
      } catch (error) {
        console.error('오프라인 스토리지 초기화 실패:', error);
      }
    };

    initializeOfflineStorage();
  }, []);

  // 설치 상태 감지
  useEffect(() => {
    // PWA 설치 상태 확인
    const checkInstallStatus = () => {
      const isInstalled = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      
      setStatus(prev => ({ ...prev, isInstalled }));
    };

    // 설치 가능성 감지
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setStatus(prev => ({ ...prev, isInstallable: true }));
      setCapabilities(prev => ({ ...prev, canInstall: true }));
    };

    checkInstallStatus();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // 온라인/오프라인 상태 감지
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOffline: false }));
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOffline: true }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Service Worker 이벤트 리스너
  useEffect(() => {
    const handleUpdateAvailable = () => {
      setStatus(prev => ({ ...prev, isUpdateAvailable: true }));
    };

    const handleCacheSizeUpdate = (size: number) => {
      setStatus(prev => ({ ...prev, cacheSize: size }));
    };

    swManager.on('update-available', handleUpdateAvailable);
    swManager.on('cache-size-update', handleCacheSizeUpdate);

    return () => {
      swManager.off('update-available', handleUpdateAvailable);
      swManager.off('cache-size-update', handleCacheSizeUpdate);
    };
  }, []);

  // PWA 기능 감지
  useEffect(() => {
    const detectCapabilities = () => {
      // 알림 지원 감지
      const hasNotifications = 'Notification' in window && 'serviceWorker' in navigator;
      
      // 백그라운드 동기화 지원 감지
      const hasBackgroundSync = 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;

      setCapabilities(prev => ({
        ...prev,
        hasNotifications,
        hasBackgroundSync
      }));
    };

    detectCapabilities();
  }, []);

  // PWA 메소드들
  const installPWA = async (): Promise<boolean> => {
    try {
      // Service Worker Manager를 통해 설치 처리
      // (InstallPrompt 컴포넌트에서 실제 설치 로직 처리)
      return true;
    } catch (error) {
      console.error('PWA 설치 실패:', error);
      return false;
    }
  };

  const updatePWA = async (): Promise<void> => {
    try {
      await swManager.applyUpdate();
      setStatus(prev => ({ ...prev, isUpdateAvailable: false }));
    } catch (error) {
      console.error('PWA 업데이트 실패:', error);
      throw error;
    }
  };

  const clearPWACache = async (): Promise<void> => {
    try {
      await swManager.clearCache();
      setStatus(prev => ({ ...prev, cacheSize: 0 }));
    } catch (error) {
      console.error('PWA 캐시 정리 실패:', error);
      throw error;
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!capabilities.hasNotifications) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      return false;
    }
  };

  const generateOfflinePalette = async (keyword: string, harmonyType: string = 'analogous') => {
    try {
      const palette = await offlineStorage.generateOfflinePalette(keyword, harmonyType);
      return palette;
    } catch (error) {
      console.error('오프라인 팔레트 생성 실패:', error);
      throw error;
    }
  };

  const getSavedPalettes = async () => {
    try {
      const palettes = await offlineStorage.getSavedPalettes();
      return palettes;
    } catch (error) {
      console.error('저장된 팔레트 조회 실패:', error);
      throw error;
    }
  };

  const savePaletteOffline = async (palette: any) => {
    try {
      await offlineStorage.savePalette(palette);
      
      // Service Worker를 통해 캐시에도 저장
      await swManager.cachePalette(palette);
    } catch (error) {
      console.error('팔레트 오프라인 저장 실패:', error);
      throw error;
    }
  };

  const getColorHistory = async (limit: number = 50) => {
    try {
      const history = await offlineStorage.getColorHistory(limit);
      return history;
    } catch (error) {
      console.error('색상 히스토리 조회 실패:', error);
      throw error;
    }
  };

  const saveColorHistory = async (color: string, name: string, source: string) => {
    try {
      await offlineStorage.saveColorHistory(color, name, source);
    } catch (error) {
      console.error('색상 히스토리 저장 실패:', error);
      throw error;
    }
  };

  // PWA 설정 관리
  const savePWASetting = async (key: string, value: any) => {
    try {
      await offlineStorage.saveSetting(key, value);
    } catch (error) {
      console.error('PWA 설정 저장 실패:', error);
      throw error;
    }
  };

  const getPWASetting = async (key: string) => {
    try {
      const value = await offlineStorage.getSetting(key);
      return value;
    } catch (error) {
      console.error('PWA 설정 조회 실패:', error);
      return null;
    }
  };

  // 정리 작업
  const cleanupOldData = async (daysToKeep: number = 30) => {
    try {
      await offlineStorage.clearOldData(daysToKeep);
    } catch (error) {
      console.error('오래된 데이터 정리 실패:', error);
      throw error;
    }
  };

  return {
    // 상태 정보
    status,
    capabilities,
    
    // PWA 관리 메소드
    installPWA,
    updatePWA,
    clearPWACache,
    requestNotificationPermission,
    
    // 오프라인 기능
    generateOfflinePalette,
    getSavedPalettes,
    savePaletteOffline,
    getColorHistory,
    saveColorHistory,
    
    // 설정 관리
    savePWASetting,
    getPWASetting,
    
    // 정리 작업
    cleanupOldData,
    
    // 유틸리티
    isOnline: !status.isOffline,
    isOffline: status.isOffline,
    canWork: !status.isOffline || capabilities.hasOfflineSupport
  };
};