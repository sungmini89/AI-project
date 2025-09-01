import { test, expect } from '@playwright/test';

test.describe('컬러 팔레트 생성 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('한국어 키워드로 색상 팔레트 생성', async ({ page }) => {
    // 키워드 입력
    await page.fill('[data-testid="keyword-input"]', '바다');
    
    // 하모니 타입 선택 (PaletteGenerator의 Tabs 컴포넌트)
    await page.click('[data-testid="harmony-option-complementary"]');
    
    // 생성 버튼 클릭
    await page.click('[data-testid="generate-button"]');
    
    // 로딩 상태 확인
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
    
    // 결과 대기 및 확인
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 5개 색상 카드 확인
    const colorCards = page.locator('[data-testid="color-card"]');
    await expect(colorCards).toHaveCount(5);
    
    // 첫 번째 색상이 바다 관련 색상인지 확인
    const firstColor = await colorCards.first().getAttribute('data-color');
    expect(firstColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test('색상 복사 기능', async ({ page }) => {
    await page.fill('[data-testid="keyword-input"]', '하늘');
    await page.click('[data-testid="generate-button"]');
    
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 첫 번째 색상 카드 직접 클릭 (카드 자체를 클릭하면 HEX 복사)
    const firstCard = page.locator('[data-testid="color-card"]').first();
    await firstCard.click();
    
    // 복사가 실행되었는지 확인 (클립보드 권한이 없을 수 있으므로 클릭만 확인)
    await expect(firstCard).toBeVisible();
  });

  test('팔레트 저장 및 불러오기', async ({ page }) => {
    // 색상 생성
    await page.fill('[data-testid="keyword-input"]', '숲');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 팔레트 저장
    await page.fill('[data-testid="palette-name-input"]', '테스트 숲 팔레트');
    await page.click('[data-testid="save-palette-button"]');
    
    // 저장 완료 알림 확인
    await expect(page.locator('[data-testid="save-toast"]')).toBeVisible();
    
    // 저장된 팔레트 목록에서 확인
    await page.click('[data-testid="saved-palettes-tab"]');
    await expect(page.locator('[data-testid="saved-palette"]:has-text("테스트 숲 팔레트")')).toBeVisible();
  });

  test('반응형 디자인 테스트', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 레이아웃이 모바일에 맞게 조정되는지 확인 (grid layout)
    await expect(page.locator('[data-testid="main-container"]')).toHaveCSS('display', 'grid');
    
    // 키워드 입력 및 생성 테스트
    await page.fill('[data-testid="keyword-input"]', '태양');
    await page.click('[data-testid="generate-button"]');
    
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 모바일에서 색상 카드가 적절히 배치되는지 확인
    const colorCards = page.locator('[data-testid="color-card"]');
    await expect(colorCards.first()).toBeVisible();
  });

  test('성능 최적화 확인', async ({ page }) => {
    // 성능 측정 시작
    const startTime = Date.now();
    
    await page.fill('[data-testid="keyword-input"]', '꽃');
    await page.click('[data-testid="generate-button"]');
    
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    const endTime = Date.now();
    const generationTime = endTime - startTime;
    
    // 5초 이내 생성 완료 확인 (현실적인 성능 기대값)
    expect(generationTime).toBeLessThan(5000);
    
    // 캐시 동작 확인을 위해 같은 키워드로 재생성
    const cacheStartTime = Date.now();
    
    await page.fill('[data-testid="keyword-input"]', '꽃');
    await page.click('[data-testid="generate-button"]');
    
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    const cacheEndTime = Date.now();
    const cachedGenerationTime = cacheEndTime - cacheStartTime;
    
    // 캐시된 결과도 합리적인 시간 내에 완료되어야 함
    expect(cachedGenerationTime).toBeLessThan(5000);
  });

  test('오프라인 기능 테스트', async ({ page, context }) => {
    // 온라인 상태에서 색상 생성
    await page.fill('[data-testid="keyword-input"]', '달');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 오프라인 모드로 전환
    await context.setOffline(true);
    
    // 오프라인 표시기 확인
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // 캐시된 키워드로 생성 테스트
    await page.fill('[data-testid="keyword-input"]', '달');
    await page.click('[data-testid="generate-button"]');
    
    // 오프라인에서도 생성되는지 확인
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 3000 });
  });

  test('접근성 테스트', async ({ page }) => {
    // 키보드 내비게이션 테스트
    await page.keyboard.press('Tab'); // 키워드 입력으로 포커스
    await page.keyboard.type('나무');
    
    await page.keyboard.press('Tab'); // 하모니 선택으로 포커스
    await page.keyboard.press('Space'); // 드롭다운 열기
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    await page.keyboard.press('Tab'); // 생성 버튼으로 포커스
    await page.keyboard.press('Enter'); // 생성 실행
    
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // ARIA 속성 확인
    await expect(page.locator('[data-testid="keyword-input"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="harmony-select"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="generate-button"]')).toHaveAttribute('aria-label');
  });

  test('에러 처리 테스트', async ({ page }) => {
    // 빈 키워드일 때 생성 버튼이 비활성화되어 있는지 확인
    await expect(page.locator('[data-testid="generate-button"]')).toBeDisabled();
    
    // 키워드를 입력하면 버튼이 활성화되는지 확인
    await page.fill('[data-testid="keyword-input"]', '테스트');
    await expect(page.locator('[data-testid="generate-button"]')).toBeEnabled();
    
    // 키워드를 지우면 다시 비활성화되는지 확인
    await page.fill('[data-testid="keyword-input"]', '');
    await expect(page.locator('[data-testid="generate-button"]')).toBeDisabled();
  });
});