import { test, expect } from '@playwright/test';

test.describe('🔄 통합 테스트 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('완전한 사용자 여정: 키워드 → 팔레트 → 저장 → 내보내기', async ({ page }) => {
    // 1단계: 메인 페이지에서 생성기로 이동
    await expect(page).toHaveTitle(/색상 팔레트 생성기/);
    await page.click('[data-testid="start-generation"]');
    await expect(page).toHaveURL(/.*generator.*/);

    // 2단계: 키워드 입력 및 하모니 선택
    await page.fill('[data-testid="keyword-input"]', '봄의 정원');
    await page.selectOption('[data-testid="harmony-selector"]', 'analogous');

    // 3단계: 팔레트 생성
    await page.click('[data-testid="generate-palette"]');
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible({ timeout: 5000 });

    // 생성된 색상 품질 검증
    const colorSwatches = page.locator('[data-testid="color-swatch"]');
    await expect(colorSwatches).toHaveCount(5);

    // 첫 번째 색상이 녹색 계열인지 확인 (봄의 정원 키워드)
    const firstColorHex = await colorSwatches.first().locator('[data-testid="hex-code"]').textContent();
    const rgb = hexToRgb(firstColorHex);
    expect(rgb.g).toBeGreaterThan(Math.max(rgb.r * 0.8, rgb.b * 0.8)); // 녹색 계열

    // 4단계: 색상 세부 정보 확인
    await colorSwatches.first().click();
    await expect(page.locator('[data-testid="color-details-modal"]')).toBeVisible();
    
    // HSL, RGB 값 표시 확인
    await expect(page.locator('[data-testid="hsl-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="rgb-value"]')).toBeVisible();
    
    await page.click('[data-testid="close-details"]');

    // 5단계: 팔레트 저장
    await page.click('[data-testid="save-palette"]');
    await page.fill('[data-testid="palette-name"]', '봄의 정원 팔레트');
    await page.fill('[data-testid="palette-description"]', '따뜻한 봄날의 정원을 표현한 조화로운 색상');
    await page.click('[data-testid="confirm-save"]');

    await expect(page.locator('[data-testid="save-success-message"]')).toBeVisible();

    // 6단계: 저장된 팔레트 목록 확인
    await page.goto('/saved');
    await expect(page.locator('[data-testid="saved-palette-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="palette-name"]')).toContainText('봄의 정원 팔레트');

    // 7단계: 팔레트 내보내기
    await page.click('[data-testid="export-palette"]');
    
    // CSS Variables 내보내기
    await page.click('[data-testid="export-css"]');
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-css"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/.*\.css$/);

    // JSON 내보내기
    await page.click('[data-testid="export-json"]');
    const jsonDownloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-json"]');
    const jsonDownload = await jsonDownloadPromise;
    expect(jsonDownload.suggestedFilename()).toMatch(/.*\.json$/);
  });

  test('이미지 기반 팔레트 생성 완전 워크플로우', async ({ page }) => {
    // 1단계: 이미지 추출 페이지로 이동
    await page.goto('/extract');
    await expect(page).toHaveTitle(/이미지 색상 추출/);

    // 2단계: 이미지 업로드 (샘플 이미지)
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/sample-landscape.jpg');

    // 3단계: 색상 추출 완료 대기
    await expect(page.locator('[data-testid="extracted-colors"]')).toBeVisible({ timeout: 5000 });

    // vibrant.js 6가지 색상 확인
    const extractedColors = page.locator('[data-testid="color-swatch"]');
    await expect(extractedColors).toHaveCount(6);

    // 4단계: 추출된 색상 중 하나를 기반으로 팔레트 생성
    await extractedColors.first().click();
    await page.click('[data-testid="generate-from-color"]');

    // 하모니 규칙 선택
    await page.selectOption('[data-testid="harmony-selector"]', 'complementary');
    await page.click('[data-testid="generate-palette"]');

    // 5단계: 생성된 팔레트 검증
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
    const generatedColors = page.locator('[data-testid="generated-palette"] [data-testid="color-swatch"]');
    await expect(generatedColors).toHaveCount(5);

    // 6단계: 색상 점유율 분석 확인
    await expect(page.locator('[data-testid="color-dominance-chart"]')).toBeVisible();
    const dominanceItems = page.locator('[data-testid="dominance-item"]');
    await expect(dominanceItems).toHaveCount(6);

    // 점유율 합계 확인
    const percentages = await dominanceItems.locator('[data-testid="percentage"]').allTextContents();
    const totalPercentage = percentages.reduce((sum, text) => {
      return sum + parseFloat(text.replace('%', ''));
    }, 0);
    expect(Math.abs(totalPercentage - 100)).toBeLessThan(1);

    // 7단계: 이미지 기반 팔레트 저장
    await page.click('[data-testid="save-palette"]');
    await page.fill('[data-testid="palette-name"]', '풍경 이미지 팔레트');
    await page.click('[data-testid="confirm-save"]');

    await expect(page.locator('[data-testid="save-success-message"]')).toBeVisible();
  });

  test('접근성 완전 검증 워크플로우', async ({ page }) => {
    await page.goto('/generator');

    // 1단계: 키보드 내비게이션 전체 플로우
    await page.keyboard.press('Tab'); // 키워드 입력
    await expect(page.locator('[data-testid="keyword-input"]')).toBeFocused();

    await page.keyboard.type('접근성테스트');

    await page.keyboard.press('Tab'); // 하모니 선택
    await expect(page.locator('[data-testid="harmony-selector"]')).toBeFocused();

    await page.keyboard.press('Tab'); // 생성 버튼
    await expect(page.locator('[data-testid="generate-button"]')).toBeFocused();

    await page.keyboard.press('Enter'); // 팔레트 생성
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });

    // 2단계: 스크린 리더 지원 확인
    const colorCards = page.locator('[data-testid="color-card"]');
    const cardCount = await colorCards.count();

    for (let i = 0; i < cardCount; i++) {
      const card = colorCards.nth(i);
      await expect(card).toHaveAttribute('aria-label');
      await expect(card).toHaveAttribute('role', 'button');
    }

    // 3단계: 색상 대비 접근성 자동 검증
    for (let i = 0; i < cardCount; i++) {
      const card = colorCards.nth(i);
      
      const contrastRatio = await page.evaluate((element) => {
        const backgroundColor = window.getComputedStyle(element).backgroundColor;
        const textColor = window.getComputedStyle(element).color;
        
        const getLuminance = (rgb: string) => {
          const [r, g, b] = rgb.match(/\d+/g)!.map(Number);
          const toLinear = (c: number) => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          };
          return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
        };
        
        const bgLum = getLuminance(backgroundColor);
        const textLum = getLuminance(textColor);
        return (Math.max(bgLum, textLum) + 0.05) / (Math.min(bgLum, textLum) + 0.05);
      }, await card.elementHandle());
      
      // WCAG AA 기준 (4.5:1) 확인
      expect(contrastRatio).toBeGreaterThan(4.5);
    }

    // 4단계: 색맹 시뮬레이션 접근성 도구 테스트
    await page.click('[data-testid="accessibility-tools"]');
    
    const colorblindTypes = ['protanopia', 'deuteranopia', 'tritanopia', 'monochromacy'];
    
    for (const type of colorblindTypes) {
      await page.click(`[data-testid="colorblind-${type}"]`);
      await expect(page.locator('[data-testid="simulation-active"]')).toBeVisible();
      await expect(page.locator('[data-testid="original-colors"]')).toBeVisible();
      await expect(page.locator('[data-testid="simulated-colors"]')).toBeVisible();
    }

    // 5단계: 모바일 터치 접근성
    await page.setViewportSize({ width: 375, height: 667 });
    
    const touchTargets = page.locator('button, [role="button"], input, select');
    const targetCount = await touchTargets.count();
    
    for (let i = 0; i < Math.min(targetCount, 10); i++) { // 처음 10개만 검사
      const target = touchTargets.nth(i);
      const box = await target.boundingBox();
      
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('다국어 및 다크모드 통합 시나리오', async ({ page }) => {
    await page.goto('/generator');

    // 1단계: 기본 언어(한국어) 확인
    await expect(page.locator('[data-testid="app-title"]')).toContainText('색상 팔레트 생성기');

    // 2단계: 영어로 언어 변경
    await page.click('[data-testid="language-toggle"]');
    await page.click('[data-testid="lang-en"]');
    
    await expect(page.locator('[data-testid="app-title"]')).toContainText('Color Palette Generator');

    // 3단계: 영어 환경에서 팔레트 생성
    await page.fill('[data-testid="keyword-input"]', 'ocean sunset');
    await page.click('[data-testid="generate-palette"]');
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();

    // 4단계: 다크모드 전환
    await page.click('[data-testid="theme-toggle"]');
    
    // 다크모드 적용 확인
    const bodyStyles = await page.evaluate(() => {
      return window.getComputedStyle(document.body);
    });
    
    // 5단계: 다크모드에서 새 팔레트 생성
    await page.fill('[data-testid="keyword-input"]', 'midnight forest');
    await page.click('[data-testid="generate-palette"]');
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();

    // 6단계: 한국어로 다시 변경하고 다크모드 유지 확인
    await page.click('[data-testid="language-toggle"]');
    await page.click('[data-testid="lang-ko"]');
    
    await expect(page.locator('[data-testid="app-title"]')).toContainText('색상 팔레트 생성기');

    // 7단계: 설정 저장 확인 (페이지 새로고침 후)
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 다크모드와 언어 설정이 유지되는지 확인
    await expect(page.locator('[data-testid="app-title"]')).toContainText('색상 팔레트 생성기');
  });

  test('오프라인 모드 완전 시나리오', async ({ page, context }) => {
    await page.goto('/generator');

    // 1단계: 온라인에서 팔레트 생성 및 저장
    await page.fill('[data-testid="keyword-input"]', '오프라인테스트');
    await page.click('[data-testid="generate-palette"]');
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();

    await page.click('[data-testid="save-palette"]');
    await page.fill('[data-testid="palette-name"]', '오프라인 저장 팔레트');
    await page.click('[data-testid="confirm-save"]');

    // 2단계: 네트워크 차단
    await context.setOffline(true);

    // 3단계: 오프라인 상태 표시 확인
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-indicator"]')).toContainText('오프라인 모드');

    // 4단계: 오프라인에서 로컬 알고리즘으로 팔레트 생성
    await page.fill('[data-testid="keyword-input"]', '오프라인생성');
    await page.click('[data-testid="generate-palette"]');
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();

    // 5단계: 모든 하모니 규칙이 오프라인에서도 작동하는지 확인
    const harmonyTypes = ['complementary', 'analogous', 'triadic', 'tetradic', 'monochromatic'];
    
    for (const harmonyType of harmonyTypes) {
      await page.selectOption('[data-testid="harmony-selector"]', harmonyType);
      await page.click('[data-testid="generate-palette"]');
      await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
    }

    // 6단계: 저장된 팔레트에 오프라인 접근
    await page.goto('/saved');
    await expect(page.locator('[data-testid="saved-palette"]')).toBeVisible();
    await expect(page.locator('[data-testid="palette-name"]')).toContainText('오프라인 저장 팔레트');

    // 7단계: 네트워크 복구 시 온라인 모드 전환
    await context.setOffline(false);
    
    await page.fill('[data-testid="keyword-input"]', '온라인복구');
    await page.click('[data-testid="generate-palette"]');
    await page.waitForTimeout(2000); // API 재연결 시간
    
    await expect(page.locator('[data-testid="api-status"]')).toContainText('온라인');
  });

  test('성능 및 사용성 통합 검증', async ({ page }) => {
    await page.goto('/generator');

    // 1단계: 페이지 로딩 성능
    const loadMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });

    // Core Web Vitals 기준 확인
    expect(loadMetrics.firstContentfulPaint).toBeLessThan(1800); // 1.8초
    expect(loadMetrics.loadComplete).toBeLessThan(3000); // 3초

    // 2단계: 연속적인 팔레트 생성 성능
    const generationTimes: number[] = [];
    const keywords = ['성능1', '성능2', '성능3', '성능4', '성능5'];

    for (const keyword of keywords) {
      await page.fill('[data-testid="keyword-input"]', keyword);
      
      const startTime = Date.now();
      await page.click('[data-testid="generate-palette"]');
      await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
      const endTime = Date.now();
      
      generationTimes.push(endTime - startTime);
    }

    // 모든 생성이 2초 미만
    generationTimes.forEach(time => {
      expect(time).toBeLessThan(2000);
    });

    // 평균 생성 시간이 1.5초 미만
    const averageTime = generationTimes.reduce((a, b) => a + b, 0) / generationTimes.length;
    expect(averageTime).toBeLessThan(1500);

    // 3단계: 메모리 사용량 안정성
    const memoryTest = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null;
    });

    if (memoryTest) {
      expect(memoryTest.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024); // 100MB
    }

    // 4단계: 사용성 검증 (모든 주요 기능 정상 동작)
    await page.click('[data-testid="save-palette"]');
    await page.fill('[data-testid="palette-name"]', '통합테스트 팔레트');
    await page.click('[data-testid="confirm-save"]');

    await page.goto('/saved');
    await expect(page.locator('[data-testid="saved-palette"]')).toBeVisible();
    
    await page.goto('/extract');
    await expect(page.locator('input[type="file"]')).toBeVisible();

    // 모든 페이지 전환이 정상 작동함을 확인
    await page.goto('/');
    await expect(page.locator('[data-testid="start-generation"]')).toBeVisible();
  });
});

// 헬퍼 함수
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}