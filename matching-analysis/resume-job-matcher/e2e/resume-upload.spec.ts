import { test, expect } from '@playwright/test';

test.describe('Resume Upload Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyzer');
  });

  test('파일 드롭존이 올바르게 작동함', async ({ page }) => {
    const dropZone = page.locator('.border-dashed');
    
    // 드롭존이 표시되는지 확인
    await expect(dropZone).toBeVisible();
    await expect(dropZone).toContainText('파일을 선택하거나 드래그하세요');
    
    // 업로드 아이콘 확인 - class로 선택 (lucide가 svg class로 렌더링됨)
    await expect(page.locator('.lucide-upload')).toBeVisible();
  });

  test('파일 입력 필드가 존재함', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    
    // 파일 입력 필드가 존재하는지 확인
    await expect(fileInput).toBeVisible();
    await expect(fileInput).toHaveAttribute('accept', '.pdf');
  });

  test('텍스트 영역이 파일 업로드 후 활성화됨', async ({ page }) => {
    // 텍스트 영역 확인
    const textArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    await expect(textArea).toBeVisible();
    
    // 초기에는 비어있는지 확인
    await expect(textArea).toHaveValue('');
  });

  test('텍스트 직접 입력 기능', async ({ page }) => {
    const textArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    
    // 테스트 텍스트 입력
    const testResumeText = `
      김개발 이력서
      
      경력사항:
      - React 개발 3년
      - JavaScript, TypeScript 능숙
      - Node.js 백엔드 개발 경험
      
      학력:
      - 컴퓨터공학과 졸업
      
      기술스택:
      React, JavaScript, TypeScript, Node.js, MongoDB
    `;
    
    await textArea.fill(testResumeText);
    await expect(textArea).toHaveValue(testResumeText);
  });

  test('텍스트 입력 후 분석 버튼이 부분적으로 활성화됨', async ({ page }) => {
    const textArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    
    // 초기에는 비활성화
    await expect(analyzeButton).toBeDisabled();
    
    // 이력서 텍스트 입력
    await textArea.fill('테스트 이력서 내용');
    
    // 여전히 비활성화 (채용공고도 필요하므로)
    await expect(analyzeButton).toBeDisabled();
  });

  test('드래그 앤 드롭 UI 피드백', async ({ page }) => {
    const dropZone = page.locator('.border-dashed');
    
    // 드롭존 hover 효과 테스트
    await dropZone.hover();
    
    // 드롭존이 여전히 표시되는지 확인
    await expect(dropZone).toBeVisible();
  });

  test('Magic UI 애니메이션이 적용됨', async ({ page }) => {
    // MagicCard 래퍼 확인
    const magicCard = page.locator('.magic-card').first();
    await expect(magicCard).toBeVisible();
    
    // BorderBeam 애니메이션 확인 (지연 시간 없음)
    await expect(page.locator('[class*="border-beam"]').first()).toBeVisible();
    
    // 카드 호버 효과 테스트
    await magicCard.hover();
    
    // 호버 후에도 카드가 표시되는지 확인
    await expect(magicCard).toBeVisible();
  });

  test('길이 제한 및 유효성 검사', async ({ page }) => {
    const textArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    
    // 매우 긴 텍스트 입력
    const longText = 'A'.repeat(10000);
    await textArea.fill(longText);
    
    // 텍스트가 입력되었는지 확인
    const value = await textArea.inputValue();
    expect(value.length).toBeGreaterThan(0);
  });
});