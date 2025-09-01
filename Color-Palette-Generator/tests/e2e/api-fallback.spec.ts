import { test, expect } from '@playwright/test';

test.describe('🌐 API 폴백 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/generator');
  });

  test('Colormind API 실패 시 로컬 모드 폴백', async ({ page }) => {
    // Colormind API 차단
    await page.route('**/colormind.io/**', route => {
      route.abort('failed');
    });
    
    // 키워드 입력
    await page.fill('[data-testid="keyword-input"]', '바다');
    await page.click('[data-testid="generate-palette"]');
    
    // API 실패 알림 확인
    await expect(page.locator('[data-testid="api-status"]')).toContainText('오프라인 모드');
    
    // 로컬 알고리즘으로 팔레트 생성 확인
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 생성된 팔레트 품질 검증 (파란색 계열)
    const colorSwatches = page.locator('[data-testid="color-swatch"]');
    await expect(colorSwatches).toHaveCount(5);
    
    // 첫 번째 색상이 파란색 계열인지 확인
    const firstColorHex = await colorSwatches.first().locator('[data-testid="hex-code"]').textContent();
    const rgb = hexToRgb(firstColorHex);
    expect(rgb.b).toBeGreaterThan(Math.max(rgb.r, rgb.g)); // 파란색이 우세
  });

  test('TheColorAPI 실패 시 로컬 모드 폴백', async ({ page }) => {
    // TheColorAPI 차단
    await page.route('**/thecolorapi.com/**', route => {
      route.abort('failed');
    });
    
    // API 모드를 thecolorapi로 설정
    await page.evaluate(() => {
      localStorage.setItem('colorService.config', JSON.stringify({
        mode: 'free',
        primaryAPI: 'thecolorapi'
      }));
    });
    
    await page.reload();
    
    // 키워드 입력 및 생성
    await page.fill('[data-testid="keyword-input"]', '숲');
    await page.click('[data-testid="generate-palette"]');
    
    // 로컬 모드 폴백 확인
    await expect(page.locator('[data-testid="api-status"]')).toContainText('오프라인');
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
    
    // 녹색 계열 팔레트 생성 확인
    const colorSwatches = page.locator('[data-testid="color-swatch"]');
    const firstColorHex = await colorSwatches.first().locator('[data-testid="hex-code"]').textContent();
    const rgb = hexToRgb(firstColorHex);
    expect(rgb.g).toBeGreaterThan(Math.max(rgb.r, rgb.b)); // 녹색이 우세
  });

  test('네트워크 연결 완전 차단 시 오프라인 모드', async ({ page, context }) => {
    // 모든 네트워크 요청 차단
    await context.setOffline(true);
    
    await page.reload();
    
    // 오프라인 상태 표시 확인
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-indicator"]')).toContainText('오프라인 모드');
    
    // 키워드 기반 팔레트 생성 (완전 로컬)
    await page.fill('[data-testid="keyword-input"]', '평온함');
    await page.click('[data-testid="generate-palette"]');
    
    // 로컬 알고리즘으로 팔레트 생성 확인
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
    
    // 5가지 조화 규칙 모두 작동 확인
    const harmonyTypes = ['complementary', 'analogous', 'triadic', 'tetradic', 'monochromatic'];
    
    for (const harmonyType of harmonyTypes) {
      await page.selectOption('[data-testid="harmony-selector"]', harmonyType);
      await page.click('[data-testid="generate-palette"]');
      
      await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
      
      // 각 조화 규칙별 색상 수 확인
      const expectedCount = harmonyType === 'tetradic' ? 4 : 5;
      const swatches = page.locator('[data-testid="color-swatch"]');
      await expect(swatches).toHaveCount(expectedCount);
    }
  });

  test('API 복구 시 자동 온라인 모드 전환', async ({ page, context }) => {
    // 초기에 오프라인으로 설정
    await context.setOffline(true);
    await page.reload();
    
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // 네트워크 복구
    await context.setOffline(false);
    
    // 다음 팔레트 생성 시 온라인 모드 복구 확인
    await page.fill('[data-testid="keyword-input"]', '새벽');
    await page.click('[data-testid="generate-palette"]');
    
    // API 재연결 시도 및 성공 확인
    await page.waitForTimeout(2000); // API 재연결 시간 대기
    
    // 온라인 상태 표시 확인
    await expect(page.locator('[data-testid="api-status"]')).toContainText('온라인');
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
  });

  test('API 응답 시간 초과 시 폴백', async ({ page }) => {
    // Colormind API 응답 지연 시뮬레이션 (10초)
    await page.route('**/colormind.io/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 10000));
      route.continue();
    });
    
    await page.fill('[data-testid="keyword-input"]', '열정');
    
    const startTime = Date.now();
    await page.click('[data-testid="generate-palette"]');
    
    // 타임아웃 알림 표시 확인
    await expect(page.locator('[data-testid="timeout-warning"]')).toBeVisible();
    
    // 로컬 모드로 폴백하여 빠른 생성
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible({ timeout: 3000 });
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // 전체 시간이 5초 이내 (폴백 포함)
    expect(totalTime).toBeLessThan(5000);
  });

  test('혼합 모드: 일부 API 성공, 일부 실패', async ({ page }) => {
    // Colormind만 차단, TheColorAPI는 허용
    await page.route('**/colormind.io/**', route => {
      route.abort('failed');
    });
    
    // 설정에서 혼합 모드 활성화
    await page.evaluate(() => {
      localStorage.setItem('colorService.config', JSON.stringify({
        mode: 'free',
        primaryAPI: 'colormind',
        fallbackAPI: 'thecolorapi',
        enableLocalFallback: true
      }));
    });
    
    await page.reload();
    
    await page.fill('[data-testid="keyword-input"]', '하늘');
    await page.click('[data-testid="generate-palette"]');
    
    // TheColorAPI로 폴백 성공 확인
    await expect(page.locator('[data-testid="api-status"]')).toContainText('TheColorAPI');
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
    
    // 폴백 알림 표시
    await expect(page.locator('[data-testid="fallback-notice"]')).toBeVisible();
    await expect(page.locator('[data-testid="fallback-notice"]')).toContainText('대체 API 사용 중');
  });

  test('저장된 팔레트 오프라인 접근', async ({ page, context }) => {
    // 온라인에서 팔레트 생성 및 저장
    await page.fill('[data-testid="keyword-input"]', '겨울');
    await page.click('[data-testid="generate-palette"]');
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
    
    await page.click('[data-testid="save-palette"]');
    await page.fill('[data-testid="palette-name"]', '겨울 팔레트');
    await page.click('[data-testid="confirm-save"]');
    
    // 네트워크 차단
    await context.setOffline(true);
    
    // 저장된 팔레트 페이지로 이동
    await page.goto('/saved');
    
    // 오프라인에서도 저장된 팔레트 접근 가능 확인
    await expect(page.locator('[data-testid="saved-palette"]')).toBeVisible();
    await expect(page.locator('[data-testid="palette-name"]')).toContainText('겨울 팔레트');
    
    // 팔레트 편집도 오프라인에서 가능
    await page.click('[data-testid="edit-palette"]');
    await expect(page.locator('[data-testid="palette-editor"]')).toBeVisible();
  });
});

// 헬퍼 함수들
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}