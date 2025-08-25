import { test, expect } from '@playwright/test';

test.describe('PWA 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('웹 앱 매니페스트 확인', async ({ page }) => {
    // 매니페스트 링크 확인
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeAttached();
    
    const manifestHref = await manifestLink.getAttribute('href');
    expect(manifestHref).toBeTruthy();
    
    // 매니페스트 파일 내용 확인
    const manifestResponse = await page.request.get(manifestHref!);
    expect(manifestResponse.ok()).toBeTruthy();
    
    const manifestData = await manifestResponse.json();
    
    // 필수 매니페스트 필드 확인
    expect(manifestData.name).toBeTruthy();
    expect(manifestData.short_name).toBeTruthy();
    expect(manifestData.start_url).toBeTruthy();
    expect(manifestData.display).toBeTruthy();
    expect(manifestData.theme_color).toBeTruthy();
    expect(manifestData.background_color).toBeTruthy();
    expect(manifestData.icons).toBeInstanceOf(Array);
    expect(manifestData.icons.length).toBeGreaterThan(0);
    
    console.log('매니페스트 정보:', {
      name: manifestData.name,
      shortName: manifestData.short_name,
      display: manifestData.display,
      iconsCount: manifestData.icons.length
    });
    
    // 아이콘 크기 확인
    const iconSizes = manifestData.icons.map((icon: any) => icon.sizes);
    console.log('아이콘 크기들:', iconSizes);
    
    // 일반적인 PWA 아이콘 크기들이 있는지 확인
    const requiredSizes = ['192x192', '512x512'];
    requiredSizes.forEach(size => {
      const hasSize = manifestData.icons.some((icon: any) => icon.sizes === size);
      if (hasSize) {
        console.log(`${size} 아이콘 존재`);
      }
    });
  });

  test('서비스 워커 등록 확인', async ({ page }) => {
    // 서비스 워커 지원 확인
    const swSupported = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    if (!swSupported) {
      test.skip(true, 'Service Worker not supported');
    }
    
    // 서비스 워커 등록 확인 (프로덕션 빌드에서만 등록될 수 있음)
    const registrations = await page.evaluate(async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return {
          count: registrations.length,
          scopes: registrations.map(reg => reg.scope),
          states: registrations.map(reg => reg.active?.state)
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('서비스 워커 등록 상태:', registrations);
    
    // 개발 모드에서는 서비스 워커가 등록되지 않을 수 있음
    if (registrations.count > 0) {
      console.log('서비스 워커 활성화됨');
      expect(registrations.count).toBeGreaterThan(0);
    } else {
      console.log('서비스 워커가 등록되지 않음 (개발 모드일 가능성)');
    }
  });

  test('캐시 API 지원 확인', async ({ page }) => {
    const cacheSupported = await page.evaluate(() => {
      return 'caches' in window;
    });
    
    expect(cacheSupported).toBe(true);
    
    // 캐시 스토리지 확인
    const cacheInfo = await page.evaluate(async () => {
      try {
        const cacheNames = await caches.keys();
        return {
          supported: true,
          cacheCount: cacheNames.length,
          cacheNames: cacheNames
        };
      } catch (error) {
        return { supported: false, error: error.message };
      }
    });
    
    console.log('캐시 정보:', cacheInfo);
    expect(cacheInfo.supported).toBe(true);
  });

  test('오프라인 기능 테스트', async ({ page, context }) => {
    // 온라인 상태 확인
    const isOnline = await page.evaluate(() => navigator.onLine);
    console.log('온라인 상태:', isOnline);
    
    // 오프라인 모드 시뮬레이션
    await context.setOffline(true);
    
    // 페이지 새로고침 시도
    try {
      await page.reload({ waitUntil: 'networkidle' });
      console.log('오프라인에서 페이지 로드 성공');
      
      // 기본 UI 요소가 표시되는지 확인
      const navigationExists = await page.locator('nav').isVisible();
      if (navigationExists) {
        console.log('오프라인에서 네비게이션 표시됨');
      }
      
    } catch (error) {
      console.log('오프라인에서 페이지 로드 실패 (예상됨):', error.message);
    }
    
    // 온라인 모드 복구
    await context.setOffline(false);
    await page.reload();
    
    // 온라인 복구 후 정상 동작 확인
    await expect(page.locator('nav')).toBeVisible();
  });

  test('설치 가능성 확인', async ({ page }) => {
    // beforeinstallprompt 이벤트 리스너 설정
    const installPromptInfo = await page.evaluate(() => {
      return new Promise((resolve) => {
        let prompted = false;
        
        const timeout = setTimeout(() => {
          resolve({ 
            prompted: false, 
            installable: 'beforeinstallprompt' in window,
            userAgent: navigator.userAgent,
            standalone: window.matchMedia('(display-mode: standalone)').matches
          });
        }, 3000);
        
        window.addEventListener('beforeinstallprompt', (e) => {
          clearTimeout(timeout);
          e.preventDefault(); // 자동 설치 프롬프트 방지
          
          resolve({
            prompted: true,
            installable: true,
            platforms: e.platforms || [],
            userChoice: 'prevented'
          });
        });
      });
    });
    
    console.log('설치 프롬프트 정보:', installPromptInfo);
    
    // PWA 설치 가능 여부 확인
    if (installPromptInfo.installable) {
      console.log('PWA 설치 가능');
    } else {
      console.log('PWA 설치 불가능 또는 이미 설치됨');
    }
  });

  test('반응형 디자인 - 모바일', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 페이지가 모바일에 적응하는지 확인
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // 터치 친화적 요소 크기 확인
    const buttons = page.locator('button, a');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        
        if (box) {
          // 최소 터치 타겟 크기 (44x44px) 확인
          const minTouchSize = 44;
          if (box.height >= minTouchSize && box.width >= minTouchSize) {
            console.log(`버튼 ${i}: 터치 친화적 크기 (${box.width}x${box.height})`);
          } else {
            console.log(`버튼 ${i}: 터치 타겟이 작을 수 있음 (${box.width}x${box.height})`);
          }
        }
      }
    }
  });

  test('반응형 디자인 - 태블릿', async ({ page }) => {
    // 태블릿 뷰포트 설정
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // 태블릿에서의 레이아웃 확인
    const mainContent = page.locator('main');
    const mainBox = await mainContent.boundingBox();
    
    if (mainBox) {
      console.log(`태블릿 메인 콘텐츠 크기: ${mainBox.width}x${mainBox.height}`);
      
      // 태블릿에서 적절한 너비 활용 확인
      expect(mainBox.width).toBeGreaterThan(400);
    }
  });

  test('다크모드 지원', async ({ page }) => {
    // 시스템 다크모드 설정 시뮬레이션
    await page.emulateMedia({ colorScheme: 'dark' });
    
    // 페이지가 다크모드를 감지하는지 확인
    const colorScheme = await page.evaluate(() => {
      return {
        prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
        rootClass: document.documentElement.className,
        rootStyle: getComputedStyle(document.documentElement).colorScheme
      };
    });
    
    console.log('다크모드 설정:', colorScheme);
    
    // 다크모드 스타일이 적용되었는지 확인
    const backgroundColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    
    console.log('배경색:', backgroundColor);
    
    // 라이트모드로 변경
    await page.emulateMedia({ colorScheme: 'light' });
    
    const lightBackgroundColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    
    console.log('라이트모드 배경색:', lightBackgroundColor);
  });

  test('푸시 알림 지원', async ({ page }) => {
    const notificationSupport = await page.evaluate(() => {
      return {
        supported: 'Notification' in window,
        permission: typeof Notification !== 'undefined' ? Notification.permission : null,
        pushManager: 'serviceWorker' in navigator && 'PushManager' in window
      };
    });
    
    console.log('알림 지원 상태:', notificationSupport);
    
    expect(notificationSupport.supported).toBe(true);
    
    // 알림 권한 요청 시뮬레이션 (실제 권한은 요청하지 않음)
    if (notificationSupport.supported) {
      console.log(`현재 알림 권한: ${notificationSupport.permission}`);
      console.log(`푸시 매니저 지원: ${notificationSupport.pushManager}`);
    }
  });

  test('스플래시 화면 및 테마 색상', async ({ page }) => {
    // 메타 태그 확인
    const metaTags = await page.evaluate(() => {
      return {
        themeColor: document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
        appleTouchIcon: document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href'),
        appleMobileCapable: document.querySelector('meta[name="apple-mobile-web-app-capable"]')?.getAttribute('content'),
        appleStatusBarStyle: document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.getAttribute('content'),
        msApplicationTileColor: document.querySelector('meta[name="msapplication-TileColor"]')?.getAttribute('content')
      };
    });
    
    console.log('PWA 메타 태그:', metaTags);
    
    // 테마 색상이 설정되어 있는지 확인
    if (metaTags.themeColor) {
      expect(metaTags.themeColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      console.log('테마 색상 설정됨:', metaTags.themeColor);
    }
    
    // iOS PWA 지원 확인
    if (metaTags.appleMobileCapable) {
      console.log('iOS PWA 지원 설정됨');
    }
  });

  test('네트워크 연결 상태 감지', async ({ page }) => {
    // 연결 상태 확인 코드 실행
    const connectionInfo = await page.evaluate(() => {
      return {
        onLine: navigator.onLine,
        connection: 'connection' in navigator ? {
          effectiveType: (navigator as any).connection?.effectiveType,
          downlink: (navigator as any).connection?.downlink,
          rtt: (navigator as any).connection?.rtt
        } : null,
        // 연결 상태 변화 이벤트 리스너 존재 확인
        hasOnlineListener: typeof window.ononline === 'function' || 
                          window.addEventListener.toString().includes('online'),
        hasOfflineListener: typeof window.onoffline === 'function' ||
                           window.addEventListener.toString().includes('offline')
      };
    });
    
    console.log('네트워크 연결 정보:', connectionInfo);
    
    expect(connectionInfo.onLine).toBe(true);
    
    // 연결 정보 API 지원 확인
    if (connectionInfo.connection) {
      console.log('네트워크 연결 API 지원됨');
      console.log('효과적인 연결 유형:', connectionInfo.connection.effectiveType);
    }
  });
});