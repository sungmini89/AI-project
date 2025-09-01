import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('🖼️ 이미지 색상 추출 E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/extract');
    await expect(page).toHaveTitle(/이미지 색상 추출/);
  });

  test('다양한 이미지 형식 업로드 및 처리', async ({ page }) => {
    // JPG 이미지 업로드 테스트
    const jpgPath = path.join(__dirname, '../fixtures/sample-ocean.jpg');
    await page.setInputFiles('input[type="file"]', jpgPath);
    
    // 업로드 진행 표시 확인
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
    
    // 색상 추출 완료 대기 (목표: <3초)
    await expect(page.locator('[data-testid="extracted-colors"]')).toBeVisible({ timeout: 3000 });
    
    // vibrant.js 6가지 색상 추출 확인
    const extractedColors = page.locator('[data-testid="color-swatch"]');
    await expect(extractedColors).toHaveCount(6);
    
    // PNG 이미지 업로드 테스트
    const pngPath = path.join(__dirname, '../fixtures/sample-forest.png');
    await page.setInputFiles('input[type="file"]', pngPath);
    await expect(page.locator('[data-testid="extracted-colors"]')).toBeVisible({ timeout: 3000 });
    
    // WebP 이미지 업로드 테스트
    const webpPath = path.join(__dirname, '../fixtures/sample-sunset.webp');
    await page.setInputFiles('input[type="file"]', webpPath);
    await expect(page.locator('[data-testid="extracted-colors"]')).toBeVisible({ timeout: 3000 });
  });

  test('대용량 이미지 처리 성능 검증', async ({ page }) => {
    // 5MB 대용량 이미지 업로드
    const largePath = path.join(__dirname, '../fixtures/large-landscape-5mb.jpg');
    
    const startTime = Date.now();
    await page.setInputFiles('input[type="file"]', largePath);
    
    // 진행률 표시 확인
    await expect(page.locator('[data-testid="processing-indicator"]')).toBeVisible();
    
    // 색상 추출 완료 (목표: <3초)
    await expect(page.locator('[data-testid="extracted-colors"]')).toBeVisible({ timeout: 3000 });
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // 성능 검증: 5MB 이미지 3초 이내 처리
    expect(processingTime).toBeLessThan(3000);
    
    // 추출된 색상 품질 확인
    const colorSwatches = page.locator('[data-testid="color-swatch"]');
    await expect(colorSwatches).toHaveCount(6);
    
    // 각 색상의 HEX 코드 유효성 검증
    for (let i = 0; i < 6; i++) {
      const hexCode = await colorSwatches.nth(i).locator('[data-testid="hex-code"]').textContent();
      expect(hexCode).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  test('vibrant.js 색상 추출 정확성 검증', async ({ page }) => {
    // 테스트용 바다 이미지 (알려진 색상 구성)
    const oceanPath = path.join(__dirname, '../fixtures/ocean-blue.jpg');
    await page.setInputFiles('input[type="file"]', oceanPath);
    
    await expect(page.locator('[data-testid="extracted-colors"]')).toBeVisible();
    
    // vibrant.js 6가지 색상 카테고리 확인
    await expect(page.locator('[data-testid="vibrant-color"]')).toBeVisible();
    await expect(page.locator('[data-testid="muted-color"]')).toBeVisible();
    await expect(page.locator('[data-testid="dark-vibrant-color"]')).toBeVisible();
    await expect(page.locator('[data-testid="dark-muted-color"]')).toBeVisible();
    await expect(page.locator('[data-testid="light-vibrant-color"]')).toBeVisible();
    await expect(page.locator('[data-testid="light-muted-color"]')).toBeVisible();
    
    // 바다 이미지에서 파란색 계열 색상 추출 검증
    const vibrantHex = await page.locator('[data-testid="vibrant-color"] [data-testid="hex-code"]').textContent();
    const vibrantRgb = hexToRgb(vibrantHex);
    
    // 파란색 계열 (B > R && B > G) 검증
    expect(vibrantRgb.b).toBeGreaterThan(vibrantRgb.r);
    expect(vibrantRgb.b).toBeGreaterThan(vibrantRgb.g);
  });

  test('추출 색상 기반 팔레트 생성', async ({ page }) => {
    // 이미지 업로드
    const imagePath = path.join(__dirname, '../fixtures/sample-nature.jpg');
    await page.setInputFiles('input[type="file"]', imagePath);
    
    await expect(page.locator('[data-testid="extracted-colors"]')).toBeVisible();
    
    // 첫 번째 추출 색상 선택
    await page.locator('[data-testid="color-swatch"]').first().click();
    
    // "이 색상으로 팔레트 생성" 버튼 클릭
    await page.locator('[data-testid="generate-from-color"]').click();
    
    // 조화 규칙 선택
    await page.locator('[data-testid="harmony-selector"]').click();
    await page.locator('[data-testid="harmony-analogous"]').click();
    
    // 팔레트 생성 완료 확인
    await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
    
    // 생성된 팔레트가 추출 색상 기반인지 검증
    const generatedColors = page.locator('[data-testid="generated-palette"] [data-testid="color-swatch"]');
    await expect(generatedColors).toHaveCount(5);
  });

  test('이미지 색상 점유율 분석', async ({ page }) => {
    const imagePath = path.join(__dirname, '../fixtures/multi-color.jpg');
    await page.setInputFiles('input[type="file"]', imagePath);
    
    await expect(page.locator('[data-testid="extracted-colors"]')).toBeVisible();
    
    // 색상 점유율 차트 표시 확인
    await expect(page.locator('[data-testid="color-dominance-chart"]')).toBeVisible();
    
    // 각 색상의 점유율 퍼센트 표시 확인
    const dominanceItems = page.locator('[data-testid="dominance-item"]');
    await expect(dominanceItems).toHaveCount(6);
    
    // 점유율 합계가 100%인지 검증
    const percentages = await dominanceItems.locator('[data-testid="percentage"]').allTextContents();
    const totalPercentage = percentages.reduce((sum, text) => {
      return sum + parseFloat(text.replace('%', ''));
    }, 0);
    
    expect(Math.abs(totalPercentage - 100)).toBeLessThan(1); // 반올림 오차 허용
  });

  test('모바일 카메라 촬영 지원', async ({ page, context }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 카메라 권한 허용
    await context.grantPermissions(['camera']);
    
    // 카메라 촬영 버튼 확인
    await expect(page.locator('[data-testid="camera-capture"]')).toBeVisible();
    
    // 파일 선택 대신 카메라 옵션 표시 확인
    await page.locator('[data-testid="upload-options"]').click();
    await expect(page.locator('[data-testid="camera-option"]')).toBeVisible();
    await expect(page.locator('[data-testid="gallery-option"]')).toBeVisible();
  });

  test('이미지 처리 에러 처리', async ({ page }) => {
    // 지원하지 않는 파일 형식 업로드 시도
    const invalidPath = path.join(__dirname, '../fixtures/document.pdf');
    await page.setInputFiles('input[type="file"]', invalidPath);
    
    // 에러 메시지 표시 확인
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('지원하지 않는 파일 형식');
    
    // 지원 형식 안내 표시 확인
    await expect(page.locator('[data-testid="supported-formats"]')).toContainText('JPG, PNG, WebP');
    
    // 기본 팔레트로 폴백
    await expect(page.locator('[data-testid="default-palette"]')).toBeVisible();
  });

  test('추출 결과 내보내기', async ({ page }) => {
    const imagePath = path.join(__dirname, '../fixtures/sample-sunset.jpg');
    await page.setInputFiles('input[type="file"]', imagePath);
    
    await expect(page.locator('[data-testid="extracted-colors"]')).toBeVisible();
    
    // 내보내기 버튼 클릭
    await page.locator('[data-testid="export-palette"]').click();
    
    // 내보내기 옵션 확인
    await expect(page.locator('[data-testid="export-css"]')).toBeVisible();
    await expect(page.locator('[data-testid="export-json"]')).toBeVisible();
    await expect(page.locator('[data-testid="export-ase"]')).toBeVisible();
    
    // CSS Variables 내보내기 테스트
    await page.locator('[data-testid="export-css"]').click();
    
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="download-css"]').click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/.*\.css$/);
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