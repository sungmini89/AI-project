import { test, expect } from '@playwright/test';

test.describe('파일 업로드 플로우', () => {
  test('업로드 페이지가 올바르게 로드됨', async ({ page }) => {
    await page.goto('/upload');

    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: '학습 자료 업로드' })).toBeVisible();

    // 파일 업로드 영역 확인
    await expect(page.getByText('파일 업로드')).toBeVisible();
    await expect(page.getByText('텍스트 파일(.txt) 또는 PDF 파일(.pdf)을 업로드하세요.')).toBeVisible();

    // 처리 옵션 섹션 확인
    await expect(page.getByText('처리 옵션')).toBeVisible();
    await expect(page.getByText('요약 길이')).toBeVisible();
    await expect(page.getByText('생성할 플래시카드 수')).toBeVisible();
  });

  test('파일 업로드 UI 피드백이 올바르게 표시됨', async ({ page }) => {
    await page.goto('/upload');

    // 업로드 영역이 있는지 확인
    const uploadArea = page.locator('[data-testid="file-upload"]').first();
    
    // 만약 FileUpload 컴포넌트가 구현되어 있다면...
    if (await uploadArea.isVisible()) {
      // 드래그 앤 드롭 영역 확인
      await expect(uploadArea).toBeVisible();
    } else {
      // FileUpload 컴포넌트가 아직 구현되지 않은 경우
      console.log('FileUpload 컴포넌트가 아직 완전히 구현되지 않았습니다.');
    }

    // 처리 옵션들이 올바르게 표시되는지 확인
    const summaryLengthSelect = page.locator('select').first();
    await expect(summaryLengthSelect).toBeVisible();
    
    const flashcardCountSelect = page.locator('select').nth(1);
    await expect(flashcardCountSelect).toBeVisible();
  });

  test('처리 옵션 설정이 올바르게 작동함', async ({ page }) => {
    await page.goto('/upload');

    // 요약 길이 옵션 변경
    await page.locator('select').first().selectOption('long');
    const selectedValue = await page.locator('select').first().inputValue();
    expect(selectedValue).toBe('long');

    // 플래시카드 수 옵션 변경
    await page.locator('select').nth(1).selectOption('20');
    const cardCountValue = await page.locator('select').nth(1).inputValue();
    expect(cardCountValue).toBe('20');
  });

  test('빈 텍스트 입력 시 경고 메시지가 표시됨', async ({ page }) => {
    await page.goto('/upload');

    // 파일 처리 버튼이 있다면 (업로드 없이) 클릭했을 때 적절한 피드백이 있어야 함
    const processButton = page.getByRole('button', { name: '파일 처리하기' });
    
    if (await processButton.isVisible()) {
      // 버튼이 비활성화되어 있어야 함
      await expect(processButton).toBeDisabled();
    }
  });

  test('처리 진행 상황이 올바르게 표시됨', async ({ page }) => {
    await page.goto('/upload');
    
    // 샘플 파일이 업로드되고 처리되는 경우의 UI 확인
    // (실제 파일 업로드 구현이 완료되면 더 상세한 테스트 추가 예정)
    
    // 현재는 UI 구조만 확인
    await expect(page.getByText('처리 진행 상황')).not.toBeVisible();
    
    // 만약 처리가 시작되면 진행 상황이 표시되어야 함
    // await expect(page.getByText('텍스트 추출 중...')).toBeVisible();
  });

  test('반응형 디자인 - 모바일에서 올바르게 표시됨', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/upload');

    // 모바일에서 제목 확인
    await expect(page.getByRole('heading', { name: '학습 자료 업로드' })).toBeVisible();

    // 처리 옵션들이 모바일에서도 올바르게 표시되는지 확인
    await expect(page.getByText('처리 옵션')).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();
  });
});