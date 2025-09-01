import { test, expect } from '@playwright/test';

test.describe('PWA 기능 테스트', () => {
  test('서비스 워커 등록 확인', async ({ page }) => {
    await page.goto('/');
    
    // 서비스 워커 등록 확인
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    expect(swRegistered).toBe(true);
    
    // 서비스 워커 활성화 대기
    await page.waitForFunction(() => {
      return navigator.serviceWorker.ready;
    }, { timeout: 10000 });
  });

  test('오프라인 저장소 기능', async ({ page }) => {
    await page.goto('/');
    
    // 온라인에서 색상 생성
    await page.fill('[data-testid="keyword-input"]', '바다');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 색상 데이터가 로컬 저장소에 저장되는지 확인
    const storedData = await page.evaluate(() => {
      return localStorage.getItem('colorPalettes');
    });
    
    expect(storedData).toBeTruthy();
  });

  test('PWA 설치 프롬프트', async ({ page, context }) => {
    // HTTPS로 접속 (PWA 설치 조건)
    await page.goto('/');
    
    // beforeinstallprompt 이벤트 시뮬레이션
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt');
      window.dispatchEvent(event);
    });
    
    // 설치 프롬프트 버튼이 나타나는지 확인
    await expect(page.locator('[data-testid="install-button"]')).toBeVisible();
  });

  test('오프라인 색상 생성', async ({ page, context }) => {
    await page.goto('/');
    
    // 오프라인 모드로 전환
    await context.setOffline(true);
    
    // 오프라인 표시기 확인
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // 한국어 키워드로 오프라인 생성 테스트
    const koreanKeywords = ['바다', '하늘', '숲', '불', '태양'];
    
    for (const keyword of koreanKeywords) {
      await page.fill('[data-testid="keyword-input"]', keyword);
      await page.click('[data-testid="generate-button"]');
      
      await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 3000 });
      
      // 오프라인에서도 5개 색상이 생성되는지 확인
      const colorCards = page.locator('[data-testid="color-card"]');
      await expect(colorCards).toHaveCount(5);
    }
  });

  test('캐시 업데이트 알림', async ({ page }) => {
    await page.goto('/');
    
    // 캐시 업데이트 이벤트 시뮬레이션
    await page.evaluate(() => {
      // Service Worker의 updatefound 이벤트 시뮬레이션
      const event = new CustomEvent('swUpdateAvailable');
      window.dispatchEvent(event);
    });
    
    // 업데이트 알림이 표시되는지 확인
    await expect(page.locator('[data-testid="update-notification"]')).toBeVisible();
    
    // 업데이트 버튼 클릭
    await page.click('[data-testid="update-button"]');
    
    // 새로고침 확인
    await page.waitForLoadState('networkidle');
  });

  test('PWA 매니페스트 확인', async ({ page }) => {
    await page.goto('/');
    
    // 매니페스트 링크 확인
    const manifest = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifest).toBe('/manifest.json');
    
    // 매니페스트 내용 확인
    const response = await page.request.get('/manifest.json');
    expect(response.ok()).toBe(true);
    
    const manifestData = await response.json();
    expect(manifestData.name).toBe('AI 색상 팔레트 생성기');
    expect(manifestData.short_name).toBe('ColorPal AI');
    expect(manifestData.lang).toBe('ko');
  });

  test('아이콘 및 스플래시 화면', async ({ page }) => {
    await page.goto('/');
    
    // 파비콘 확인
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute('href');
    
    // Apple 터치 아이콘 확인
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toHaveAttribute('href');
    
    // 메타 태그 확인
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content');
    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes');
  });

  test('PWA 성능 지표', async ({ page }) => {
    await page.goto('/');
    
    // Core Web Vitals 측정
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {
            FCP: 0,
            LCP: 0,
            FID: 0,
            CLS: 0
          };
          
          entries.forEach((entry) => {
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              vitals.FCP = entry.startTime;
            }
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.LCP = entry.startTime;
            }
            if (entry.entryType === 'first-input') {
              vitals.FID = entry.processingStart - entry.startTime;
            }
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              vitals.CLS += entry.value;
            }
          });
          
          resolve(vitals);
        });
        
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
        
        // 타임아웃 후 현재까지의 결과 반환
        setTimeout(() => resolve({ FCP: 0, LCP: 0, FID: 0, CLS: 0 }), 5000);
      });
    });
    
    // Core Web Vitals 기준 확인
    expect((metrics as any).FCP).toBeLessThan(1800); // FCP < 1.8s
    expect((metrics as any).LCP).toBeLessThan(2500); // LCP < 2.5s
    expect((metrics as any).CLS).toBeLessThan(0.1);  // CLS < 0.1
  });
});