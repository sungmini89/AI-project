import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyzer');
  });

  test('페이지 제목과 헤더가 올바르게 표시됨', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/이력서 채용공고 매칭 분석/);
    
    // 메인 헤딩 확인
    await expect(page.locator('h1')).toContainText('이력서 채용공고 매칭 분석');
    
    // 설명 텍스트 확인
    await expect(page.locator('text=AI 기반 이력서와 채용공고 매칭 분석 플랫폼')).toBeVisible();
    
    // Magic UI 적용 표시 확인
    await expect(page.locator('text=Magic UI 애니메이션 적용')).toBeVisible();
  });

  test('이력서 업로드와 채용공고 입력 카드가 표시됨', async ({ page }) => {
    // 이력서 업로드 카드 확인
    await expect(page.locator('text=이력서 업로드')).toBeVisible();
    await expect(page.locator('text=PDF 파일을 업로드하세요')).toBeVisible();
    
    // 채용공고 입력 카드 확인
    await expect(page.locator('h3:has-text("채용공고 내용")')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]')).toBeVisible();
  });

  test('매칭 분석 버튼이 초기에는 비활성화 상태임', async ({ page }) => {
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    
    // 버튼이 존재하는지 확인
    await expect(analyzeButton).toBeVisible();
    
    // 버튼이 비활성화되어 있는지 확인
    await expect(analyzeButton).toBeDisabled();
  });

  test('Magic UI 애니메이션 요소들이 올바르게 로드됨', async ({ page }) => {
    // Magic Card 컴포넌트들이 로드되었는지 확인
    const magicCards = page.locator('.magic-card');
    await expect(magicCards.first()).toBeVisible();
    
    // Sparkles 아이콘 확인 - "Magic UI 애니메이션 적용" 텍스트와 함께 있는 헤더 영역
    await expect(page.locator('text=Magic UI 애니메이션 적용')).toBeVisible();
    
    // Sparkles 아이콘은 실제로 svg 태그의 class로 렌더링됨
    const sparklesIcon = page.locator('.lucide-sparkles');
    await expect(sparklesIcon).toBeVisible();
  });

  test('반응형 디자인이 적용됨', async ({ page }) => {
    // 데스크톱 뷰포트에서 2열 그리드 확인
    const grid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2');
    await expect(grid).toBeVisible();
    
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 모바일에서도 그리드가 보이는지 확인
    await expect(grid).toBeVisible();
  });

  test('페이지 로딩 성능 테스트', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/analyzer');
    
    // 주요 요소들이 로드되기를 기다림
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=이력서 업로드')).toBeVisible();
    await expect(page.locator('h3:has-text("채용공고 내용")')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // 페이지 로딩 시간이 5초 이내인지 확인
    expect(loadTime).toBeLessThan(5000);
  });
});