import { test, expect } from '@playwright/test';

test.describe('성능 테스트', () => {
  test('페이지 로딩 성능', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 3초 이내 로딩 완료
    expect(loadTime).toBeLessThan(3000);
    
    // DOM이 완전히 로드되었는지 확인
    await expect(page.locator('[data-testid="main-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="keyword-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="generate-button"]')).toBeVisible();
  });

  test('색상 생성 성능', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const keywords = ['바다', '하늘', '숲', '불', '태양'];
    
    for (const keyword of keywords) {
      const startTime = Date.now();
      
      await page.fill('[data-testid="keyword-input"]', keyword);
      await page.click('[data-testid="generate-button"]');
      
      await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
      
      const generationTime = Date.now() - startTime;
      
      // 각 색상 생성은 2초 이내 완료
      expect(generationTime).toBeLessThan(2000);
      
      console.log(`${keyword} 생성 시간: ${generationTime}ms`);
    }
  });

  test('대량 팔레트 처리 성능', async ({ page }) => {
    await page.goto('/');
    
    // 20개의 팔레트 빠르게 생성
    const keywords = [
      '바다', '하늘', '숲', '불', '태양', '달', '꽃', '나무', '구름', '잔디',
      '장미', '바위', '모래', '눈', '얼음', '석양', '새벽', '밤', 'ocean', 'sky'
    ];
    
    const startTime = Date.now();
    
    for (let i = 0; i < keywords.length; i++) {
      await page.fill('[data-testid="keyword-input"]', keywords[i]);
      await page.click('[data-testid="generate-button"]');
      
      // 빠른 생성을 위해 완전한 로딩을 기다리지 않음
      await page.waitForSelector('[data-testid="color-palette"]', { timeout: 3000 });
      
      // 메모리 누수 방지를 위해 주기적으로 정리
      if (i % 5 === 4) {
        await page.evaluate(() => {
          if (window.gc) {
            window.gc();
          }
        });
      }
    }
    
    const totalTime = Date.now() - startTime;
    const averageTime = totalTime / keywords.length;
    
    // 평균 생성 시간이 1.5초 이하
    expect(averageTime).toBeLessThan(1500);
    
    console.log(`대량 처리 평균 시간: ${averageTime.toFixed(0)}ms per palette`);
  });

  test('메모리 누수 테스트', async ({ page }) => {
    await page.goto('/');
    
    // 초기 메모리 상태 측정
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // 100회 색상 생성
    for (let i = 0; i < 100; i++) {
      const keyword = ['바다', '하늘', '숲', '불', '태양'][i % 5];
      
      await page.fill('[data-testid="keyword-input"]', keyword);
      await page.click('[data-testid="generate-button"]');
      await page.waitForSelector('[data-testid="color-palette"]', { timeout: 2000 });
      
      // 20회마다 메모리 체크
      if (i % 20 === 19) {
        const currentMemory = await page.evaluate(() => {
          return (performance as any).memory?.usedJSHeapSize || 0;
        });
        
        const memoryIncrease = currentMemory - initialMemory;
        const increasePercentage = (memoryIncrease / initialMemory) * 100;
        
        console.log(`메모리 증가율 (${i + 1}회): ${increasePercentage.toFixed(1)}%`);
        
        // 메모리 증가율이 200%를 넘지 않아야 함
        expect(increasePercentage).toBeLessThan(200);
      }
    }
  });

  test('캐시 성능 테스트', async ({ page }) => {
    await page.goto('/');
    
    const keyword = '바다';
    
    // 첫 번째 생성 (캐시 없음)
    const firstStartTime = Date.now();
    await page.fill('[data-testid="keyword-input"]', keyword);
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    const firstGenerationTime = Date.now() - firstStartTime;
    
    // 두 번째 생성 (캐시 있음)
    const secondStartTime = Date.now();
    await page.fill('[data-testid="keyword-input"]', keyword);
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 3000 });
    const secondGenerationTime = Date.now() - secondStartTime;
    
    // 캐시된 결과가 최소 30% 빨라야 함
    const improvement = ((firstGenerationTime - secondGenerationTime) / firstGenerationTime) * 100;
    expect(improvement).toBeGreaterThan(30);
    
    console.log(`캐시 성능 향상: ${improvement.toFixed(1)}%`);
  });

  test('네트워크 지연 시나리오', async ({ page, context }) => {
    // 느린 네트워크 시뮬레이션 (3G)
    await context.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 느린 네트워크에서도 색상 생성 가능 확인
    await page.fill('[data-testid="keyword-input"]', '하늘');
    await page.click('[data-testid="generate-button"]');
    
    // 로딩 인디케이터 확인
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
    
    // 최대 10초 내 완료
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 10000 });
    
    // 색상 품질 확인
    const colorCards = page.locator('[data-testid="color-card"]');
    await expect(colorCards).toHaveCount(5);
  });

  test('웹 워커 성능', async ({ page }) => {
    await page.goto('/');
    
    // 웹 워커가 활성화되었는지 확인
    const workerSupported = await page.evaluate(() => {
      return typeof Worker !== 'undefined';
    });
    
    expect(workerSupported).toBe(true);
    
    // 복잡한 색상 생성으로 웹 워커 활용 테스트
    await page.fill('[data-testid="keyword-input"]', '무지개');
    await page.selectOption('[data-testid="harmony-select"]', 'tetradic');
    await page.click('[data-testid="generate-button"]');
    
    // UI가 블로킹되지 않는지 확인 (웹 워커 효과)
    await page.hover('[data-testid="theme-toggle"]');
    await page.click('[data-testid="theme-toggle"]');
    
    // 색상 생성이 완료되어야 함
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
  });

  test('이미지 최적화 성능', async ({ page }) => {
    await page.goto('/');
    
    // 색상 팔레트에서 이미지 생성
    await page.fill('[data-testid="keyword-input"]', '꽃');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 이미지 내보내기
    await page.click('[data-testid="export-dropdown"]');
    await page.click('[data-testid="export-image"]');
    
    const startTime = Date.now();
    
    // 이미지 생성 대기
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible({ timeout: 10000 });
    
    const imageGenerationTime = Date.now() - startTime;
    
    // 이미지 생성이 5초 이내 완료
    expect(imageGenerationTime).toBeLessThan(5000);
    
    // 이미지 품질 확인
    const imageElement = page.locator('[data-testid="image-preview"] img');
    await expect(imageElement).toHaveAttribute('src');
    
    // 이미지 다운로드
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-image"]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/palette.*\.(png|jpg|jpeg)$/);
  });
});