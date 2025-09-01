// PWA Service Worker Manager
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;
  private listeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.initializeEventListeners();
  }

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  // Service Worker 등록
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker를 지원하지 않는 브라우저입니다.');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // 항상 네트워크에서 SW 확인
      });

      this.registration = registration;
      console.log('Service Worker 등록 성공:', registration.scope);

      // 업데이트 확인
      this.checkForUpdates(registration);
      
      // 주기적 업데이트 확인 (30분마다)
      setInterval(() => {
        this.checkForUpdates(registration);
      }, 30 * 60 * 1000);

      return registration;
    } catch (error) {
      console.error('Service Worker 등록 실패:', error);
      return null;
    }
  }

  // 업데이트 확인
  private async checkForUpdates(registration: ServiceWorkerRegistration) {
    try {
      await registration.update();
    } catch (error) {
      console.log('Service Worker 업데이트 확인 실패:', error);
    }
  }

  // Service Worker 업데이트 적용
  async applyUpdate(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      return;
    }

    // 새로운 Service Worker에 skip waiting 메시지 전송
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // 페이지 새로고침
    window.location.reload();
  }

  // 이벤트 리스너 초기화
  private initializeEventListeners() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker 컨트롤러 변경됨');
      this.emit('controllerchange');
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event.data);
    });
  }

  // Service Worker 메시지 처리
  private handleServiceWorkerMessage(data: any) {
    switch (data.type) {
      case 'CACHE_SIZE':
        this.emit('cache-size-update', data.size);
        break;
      case 'CACHE_UPDATE':
        this.emit('cache-update', data.message);
        break;
      case 'SW_UPDATE_AVAILABLE':
        this.updateAvailable = true;
        this.emit('update-available');
        break;
      default:
        console.log('알 수 없는 Service Worker 메시지:', data);
    }
  }

  // 팔레트 캐싱
  async cachePalette(palette: any): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.log('Service Worker가 활성화되지 않음');
      return;
    }

    this.registration.active.postMessage({
      type: 'CACHE_PALETTE',
      palette
    });
  }

  // 캐시 정리
  async clearCache(): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.log('Service Worker가 활성화되지 않음');
      return;
    }

    this.registration.active.postMessage({
      type: 'CLEAR_CACHE'
    });
  }

  // 캐시 크기 조회
  async getCacheSize(): Promise<number> {
    if (!this.registration || !this.registration.active) {
      return 0;
    }

    return new Promise((resolve) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_SIZE') {
          resolve(event.data.size);
        }
      };

      this.registration!.active!.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [channel.port2]
      );
    });
  }

  // 오프라인 상태 확인
  isOffline(): boolean {
    return !navigator.onLine;
  }

  // 업데이트 가능 여부 확인
  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  // 이벤트 리스너 등록
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // 이벤트 리스너 해제
  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  // 이벤트 발생
  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Service Worker 상태 조회
  getServiceWorkerStatus(): {
    registered: boolean;
    active: boolean;
    updateAvailable: boolean;
    offline: boolean;
  } {
    return {
      registered: !!this.registration,
      active: !!this.registration?.active,
      updateAvailable: this.updateAvailable,
      offline: this.isOffline()
    };
  }
}

// 전역 Service Worker 관리자 인스턴스
export const swManager = ServiceWorkerManager.getInstance();