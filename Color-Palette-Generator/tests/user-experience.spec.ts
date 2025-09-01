import { test, expect } from '@playwright/test';

test.describe('사용자 경험 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('전체 사용자 플로우', async ({ page }) => {
    // 1. 첫 방문 시 환영 메시지 확인
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
    
    // 2. 키워드 입력 및 자동완성
    await page.fill('[data-testid="keyword-input"]', '바');
    await expect(page.locator('[data-testid="autocomplete-suggestions"]')).toBeVisible();
    
    // 3. 제안된 키워드 선택
    await page.click('[data-testid="suggestion"]:has-text("바다")');
    
    // 4. 하모니 타입 변경
    await page.selectOption('[data-testid="harmony-select"]', 'analogous');
    
    // 5. 색상 생성
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 6. 색상 상세 정보 확인
    await page.hover('[data-testid="color-card"]:first-child');
    await expect(page.locator('[data-testid="color-details"]')).toBeVisible();
    
    // 7. 팔레트 저장
    await page.fill('[data-testid="palette-name-input"]', '내 첫 번째 팔레트');
    await page.click('[data-testid="save-palette-button"]');
    await expect(page.locator('[data-testid="save-toast"]')).toBeVisible();
    
    // 8. 새 팔레트 생성
    await page.fill('[data-testid="keyword-input"]', '숲');
    await page.selectOption('[data-testid="harmony-select"]', 'triadic');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 9. 저장된 팔레트 확인
    await page.click('[data-testid="saved-palettes-tab"]');
    await expect(page.locator('[data-testid="saved-palette"]:has-text("내 첫 번째 팔레트")')).toBeVisible();
    
    // 10. 저장된 팔레트 불러오기
    await page.click('[data-testid="saved-palette"]:has-text("내 첫 번째 팔레트")');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible();
  });

  test('다크 모드 전환', async ({ page }) => {
    // 라이트 모드 확인
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    
    // 다크 모드 토글
    await page.click('[data-testid="theme-toggle"]');
    
    // 다크 모드 적용 확인
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // 색상 생성하여 다크 모드에서 정상 작동 확인
    await page.fill('[data-testid="keyword-input"]', '밤');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 다크 모드 설정 저장 확인
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('언어 전환 기능', async ({ page }) => {
    // 한국어 기본 확인
    await expect(page.locator('[data-testid="keyword-input"]')).toHaveAttribute('placeholder', /키워드/);
    
    // 영어로 전환
    await page.click('[data-testid="language-toggle"]');
    
    // 영어 UI 확인
    await expect(page.locator('[data-testid="keyword-input"]')).toHaveAttribute('placeholder', /keyword/i);
    await expect(page.locator('[data-testid="generate-button"]')).toContainText(/generate/i);
    
    // 영어 키워드로 생성 테스트
    await page.fill('[data-testid="keyword-input"]', 'ocean');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
  });

  test('즐겨찾기 기능', async ({ page }) => {
    // 색상 생성
    await page.fill('[data-testid="keyword-input"]', '장미');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 색상 즐겨찾기 추가
    await page.click('[data-testid="color-card"]:first-child [data-testid="favorite-button"]');
    
    // 즐겨찾기 확인 알림
    await expect(page.locator('[data-testid="favorite-toast"]')).toBeVisible();
    
    // 즐겨찾기 탭에서 확인
    await page.click('[data-testid="favorites-tab"]');
    await expect(page.locator('[data-testid="favorite-color"]')).toHaveCount(1);
    
    // 즐겨찾기 제거
    await page.click('[data-testid="favorite-color"] [data-testid="remove-favorite"]');
    await expect(page.locator('[data-testid="favorite-color"]')).toHaveCount(0);
  });

  test('색상 내보내기 기능', async ({ page }) => {
    // 색상 생성
    await page.fill('[data-testid="keyword-input"]', '석양');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // CSS 내보내기
    await page.click('[data-testid="export-dropdown"]');
    await page.click('[data-testid="export-css"]');
    
    // 다운로드 확인 (파일 내용 체크)
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-css"]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/palette.*\.css$/);
    
    // JSON 내보내기
    await page.click('[data-testid="export-dropdown"]');
    await page.click('[data-testid="export-json"]');
    
    const jsonDownloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-json"]');
    const jsonDownload = await jsonDownloadPromise;
    
    expect(jsonDownload.suggestedFilename()).toMatch(/palette.*\.json$/);
  });

  test('히스토리 기능', async ({ page }) => {
    // 여러 색상 생성하여 히스토리 쌓기
    const keywords = ['구름', '잔디', '바위'];
    
    for (const keyword of keywords) {
      await page.fill('[data-testid="keyword-input"]', keyword);
      await page.click('[data-testid="generate-button"]');
      await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(1000);
    }
    
    // 히스토리 탭 확인
    await page.click('[data-testid="history-tab"]');
    
    // 생성된 히스토리 항목 확인
    const historyItems = page.locator('[data-testid="history-item"]');
    await expect(historyItems).toHaveCount(3);
    
    // 히스토리 항목 클릭하여 복원
    await page.click('[data-testid="history-item"]:first-child');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible();
    
    // 키워드 입력이 복원되었는지 확인
    const inputValue = await page.inputValue('[data-testid="keyword-input"]');
    expect(keywords).toContain(inputValue);
  });

  test('검색 필터링', async ({ page }) => {
    // 여러 팔레트 저장
    const testPalettes = [
      { keyword: '모래', name: '해변 색상' },
      { keyword: '눈', name: '겨울 팔레트' },
      { keyword: '얼음', name: '차가운 톤' }
    ];
    
    for (const palette of testPalettes) {
      await page.fill('[data-testid="keyword-input"]', palette.keyword);
      await page.click('[data-testid="generate-button"]');
      await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
      
      await page.fill('[data-testid="palette-name-input"]', palette.name);
      await page.click('[data-testid="save-palette-button"]');
      await expect(page.locator('[data-testid="save-toast"]')).toBeVisible();
      await page.waitForTimeout(500);
    }
    
    // 저장된 팔레트 탭으로 이동
    await page.click('[data-testid="saved-palettes-tab"]');
    
    // 검색 필터 테스트
    await page.fill('[data-testid="palette-search"]', '겨울');
    await expect(page.locator('[data-testid="saved-palette"]:has-text("겨울 팔레트")')).toBeVisible();
    await expect(page.locator('[data-testid="saved-palette"]:has-text("해변 색상")')).toBeHidden();
    
    // 검색 초기화
    await page.fill('[data-testid="palette-search"]', '');
    await expect(page.locator('[data-testid="saved-palette"]')).toHaveCount(3);
  });

  test('키보드 단축키', async ({ page }) => {
    // Ctrl+Enter로 색상 생성
    await page.fill('[data-testid="keyword-input"]', '새벽');
    await page.keyboard.press('Control+Enter');
    
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // Escape로 모달 닫기 (있는 경우)
    await page.keyboard.press('Escape');
    
    // F1으로 도움말 열기
    await page.keyboard.press('F1');
    await expect(page.locator('[data-testid="help-modal"]')).toBeVisible();
    
    // Escape로 도움말 닫기
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="help-modal"]')).toBeHidden();
  });
});