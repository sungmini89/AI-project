import { test, expect } from '@playwright/test';

test.describe('🚀 성능 최적화 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/generator');
    await expect(page).toHaveTitle(/색상 팔레트 생성기/);
  });

  test('색상 생성 성능 검증 (<2초)', async ({ page }) => {
    // 성능 추적 시작
    await page.evaluate(() => performance.mark('generation-start'));
    
    // 키워드 입력 및 팔레트 생성
    await page.fill('[data-testid="keyword-input"]', '바다');
    
    const startTime = Date.now();
    await page.click('[data-testid="generate-palette"]');
    
    // 팔레트 생성 완료 대기
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible({ timeout: 2000 });
    
    const endTime = Date.now();
    const generationTime = endTime - startTime;
    
    // 성능 검증: 2초 이내 생성
    expect(generationTime).toBeLessThan(2000);
    
    // Core Web Vitals 성능 메트릭 수집
    const metrics = await page.evaluate(() => {
      performance.mark('generation-end');
      performance.measure('palette-generation', 'generation-start', 'generation-end');
      
      return {
        generationTime: performance.getEntriesByName('palette-generation')[0].duration,
        navigation: performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming,
        paint: performance.getEntriesByType('paint')
      };
    });
    
    // LCP (Largest Contentful Paint) < 2.5초
    expect(metrics.navigation.loadEventEnd - metrics.navigation.fetchStart).toBeLessThan(2500);
    
    // FCP (First Contentful Paint) < 1.8초
    const fcp = metrics.paint.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) {
      expect(fcp.startTime).toBeLessThan(1800);
    }
  });

  test('메모리 사용량 최적화 검증', async ({ page }) => {
    // 초기 메모리 측정
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null;
    });

    // 다중 팔레트 생성 (메모리 부하 테스트)
    const keywords = ['바다', '숲', '하늘', '석양', '장미', '눈', '불', '잔디', '구름', '달'];
    
    for (const keyword of keywords) {
      await page.fill('[data-testid="keyword-input"]', keyword);
      await page.click('[data-testid="generate-palette"]');
      await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
      await page.waitForTimeout(100); // 짧은 대기
    }
    
    // 최종 메모리 측정
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null;
    });

    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
      
      // 메모리 증가량이 20MB 미만이어야 함
      expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024);
      
      // 전체 메모리 사용량이 100MB 미만이어야 함
      expect(finalMemory.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
    }
  });

  test('번들 크기 및 로딩 성능', async ({ page }) => {
    // 네트워크 요청 추적
    const resourceSizes: { [key: string]: number } = {};
    let totalSize = 0;

    page.on('response', async (response) => {
      const url = response.url();
      const headers = response.headers();
      const contentLength = headers['content-length'];
      
      if (contentLength) {
        const size = parseInt(contentLength, 10);
        resourceSizes[url] = size;
        totalSize += size;
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 초기 번들 크기가 500KB 미만인지 확인
    const jsResources = Object.keys(resourceSizes).filter(url => 
      url.includes('.js') && !url.includes('node_modules')
    );
    
    const initialBundleSize = jsResources.reduce((sum, url) => 
      sum + (resourceSizes[url] || 0), 0
    );
    
    expect(initialBundleSize).toBeLessThan(500 * 1024); // 500KB

    // 전체 리소스 크기가 2MB 미만인지 확인
    expect(totalSize).toBeLessThan(2 * 1024 * 1024); // 2MB
  });

  test('API 응답 시간 최적화', async ({ page }) => {
    // Colormind API 응답 시간 측정
    const apiResponses: { [key: string]: number } = {};

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('colormind.io') || url.includes('thecolorapi.com')) {
        const timing = response.timing();
        apiResponses[url] = timing.responseEnd - timing.requestStart;
      }
    });

    await page.fill('[data-testid="keyword-input"]', '해양');
    await page.click('[data-testid="generate-palette"]');
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();

    // API 응답 시간이 3초 미만이어야 함
    Object.values(apiResponses).forEach(responseTime => {
      expect(responseTime).toBeLessThan(3000);
    });
  });

  test('하모니 규칙별 성능 비교', async ({ page }) => {
    const harmonyTypes = ['complementary', 'analogous', 'triadic', 'tetradic', 'monochromatic'];
    const performanceResults: { [key: string]: number } = {};

    for (const harmonyType of harmonyTypes) {
      await page.selectOption('[data-testid="harmony-selector"]', harmonyType);
      
      const startTime = Date.now();
      await page.fill('[data-testid="keyword-input"]', '자연');
      await page.click('[data-testid="generate-palette"]');
      await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
      const endTime = Date.now();
      
      performanceResults[harmonyType] = endTime - startTime;
      
      // 각 하모니 규칙별 생성 시간이 2.5초 미만이어야 함
      expect(performanceResults[harmonyType]).toBeLessThan(2500);
    }

    // 성능 결과 로그 출력
    console.log('Harmony Rules Performance:', performanceResults);
  });

  test('모바일 성능 최적화', async ({ page }) => {
    // 모바일 뷰포트 및 네트워크 조건 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 3G 네트워크 시뮬레이션
    await page.route('**/*', async (route) => {
      // 200ms 지연 추가 (3G 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 200));
      route.continue();
    });

    const startTime = Date.now();
    await page.goto('/generator');
    
    // 모바일에서 로딩 완료까지 5초 미만
    await expect(page.locator('[data-testid="keyword-input"]')).toBeVisible({ timeout: 5000 });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);

    // 터치 인터페이스 성능 테스트
    const touchStartTime = Date.now();
    await page.tap('[data-testid="keyword-input"]');
    await page.fill('[data-testid="keyword-input"]', '모바일');
    await page.tap('[data-testid="generate-palette"]');
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
    const touchEndTime = Date.now();
    
    // 터치 상호작용이 3초 미만이어야 함
    expect(touchEndTime - touchStartTime).toBeLessThan(3000);
  });

  test('캐싱 효율성 검증', async ({ page }) => {
    // 첫 번째 방문
    await page.fill('[data-testid="keyword-input"]', '캐시테스트');
    
    const firstLoadStart = Date.now();
    await page.click('[data-testid="generate-palette"]');
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
    const firstLoadTime = Date.now() - firstLoadStart;

    // 동일한 키워드로 재생성 (캐시 활용)
    await page.fill('[data-testid="keyword-input"]', '');
    await page.fill('[data-testid="keyword-input"]', '캐시테스트');
    
    const cachedLoadStart = Date.now();
    await page.click('[data-testid="generate-palette"]');
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
    const cachedLoadTime = Date.now() - cachedLoadStart;

    // 캐시된 결과가 최소 50% 더 빨라야 함
    expect(cachedLoadTime).toBeLessThan(firstLoadTime * 0.5);
  });

  test('대용량 이미지 처리 성능', async ({ page }) => {
    await page.goto('/extract');
    
    // 5MB 이미지 업로드 시뮬레이션
    const largeImageData = 'data:image/jpeg;base64,' + 'A'.repeat(1024 * 1024 * 5); // 5MB
    
    await page.evaluate((imageData) => {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File([imageData], 'large-image.jpg', { type: 'image/jpeg' });
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, largeImageData);

    // 이미지 처리 완료까지 5초 미만
    const startTime = Date.now();
    await expect(page.locator('[data-testid="extracted-colors"]')).toBeVisible({ timeout: 5000 });
    const processingTime = Date.now() - startTime;
    
    expect(processingTime).toBeLessThan(5000);
  });

  test('동시성 처리 성능', async ({ page }) => {
    // 여러 탭에서 동시 작업 시뮬레이션
    const keywords = ['동시1', '동시2', '동시3'];
    const promises = [];

    for (const keyword of keywords) {
      const promise = (async () => {
        await page.fill('[data-testid="keyword-input"]', keyword);
        const startTime = Date.now();
        await page.click('[data-testid="generate-palette"]');
        await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
        return Date.now() - startTime;
      })();
      
      promises.push(promise);
      
      // 100ms 간격으로 요청 시작
      await page.waitForTimeout(100);
    }

    const results = await Promise.all(promises);
    
    // 모든 동시 요청이 3초 미만에 완료되어야 함
    results.forEach(time => {
      expect(time).toBeLessThan(3000);
    });
  });

  test('메모리 누수 방지 검증', async ({ page }) => {
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // 100회 반복 작업으로 메모리 누수 테스트
    for (let i = 0; i < 100; i++) {
      await page.fill('[data-testid="keyword-input"]', `메모리테스트${i}`);
      await page.click('[data-testid="generate-palette"]');
      await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
      
      if (i % 20 === 0) {
        // 가비지 컬렉션 강제 실행 (가능한 경우)
        await page.evaluate(() => {
          if ((window as any).gc) {
            (window as any).gc();
          }
        });
      }
    }

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory - initialMemory;
      
      // 메모리 증가가 50MB 미만이어야 함 (메모리 누수 방지)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }
  });
});