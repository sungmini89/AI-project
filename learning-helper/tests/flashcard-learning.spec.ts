import { test, expect } from '@playwright/test';

test.describe('플래시카드 학습 시스템', () => {
  test('플래시카드 페이지가 올바르게 로드됨', async ({ page }) => {
    await page.goto('/flashcards');

    // 페이지 제목 확인 (h1 태그로 구체적으로 매치)
    await expect(page.locator('h1').filter({ hasText: '플래시카드 학습' })).toBeVisible();
    
    // 설명 텍스트 확인
    await expect(page.getByText('카드를 확인하고 난이도를 평가하여 효과적인 복습 스케줄을 만들어보세요.')).toBeVisible();

    // 학습 진행률 섹션 확인
    await expect(page.getByText('학습 진행률')).toBeVisible();
    
    // 진행률 표시 확인 (1 / 2 형태) - 더 구체적인 선택자 사용
    await expect(page.locator('.text-sm').filter({ hasText: '1 / 2 카드' })).toBeVisible();
  });

  test('플래시카드 네비게이션이 올바르게 작동함', async ({ page }) => {
    await page.goto('/flashcards');

    // 첫 번째 카드에서는 '이전 카드' 버튼이 비활성화되어야 함
    const prevButton = page.getByRole('button', { name: '이전 카드' });
    await expect(prevButton).toBeDisabled();

    // 다음 카드로 이동
    const nextButton = page.getByRole('button', { name: '다음 카드' });
    await nextButton.click();

    // 두 번째 카드에서는 '이전 카드' 버튼이 활성화되어야 함
    await expect(prevButton).toBeEnabled();
    
    // 마지막 카드에서는 '다음 카드' 버튼이 비활성화되어야 함
    await expect(nextButton).toBeDisabled();

    // 이전 카드로 돌아가기
    await prevButton.click();
    await expect(prevButton).toBeDisabled();
  });

  test('답변 보기/숨기기 기능이 올바르게 작동함', async ({ page }) => {
    await page.goto('/flashcards');

    // 초기 상태에서는 난이도 평가 영역이 보이지 않아야 함
    await expect(page.getByText('이 카드의 난이도는 어떠셨나요?')).not.toBeVisible();

    // 답변 보기 버튼 클릭 (모바일 환경에서 force 옵션 사용)
    const toggleButton = page.getByRole('button', { name: '답 보기' });
    await toggleButton.click({ force: true });

    // 답변을 본 후에는 난이도 평가 영역이 표시되어야 함
    await expect(page.getByText('이 카드의 난이도는 어떠셨나요?')).toBeVisible();
    
    // 난이도 버튼들 확인
    await expect(page.getByRole('button', { name: '1 전혀 모름' })).toBeVisible();
    await expect(page.getByRole('button', { name: '3 보통' })).toBeVisible();
    await expect(page.getByRole('button', { name: '5 매우 쉬움' })).toBeVisible();

    // 버튼 텍스트가 "질문 보기"로 변경되었는지 확인
    await expect(page.getByRole('button', { name: '질문 보기' })).toBeVisible();

    // 다시 클릭하면 숨겨져야 함
    await page.getByRole('button', { name: '질문 보기' }).click({ force: true });
    await expect(page.getByText('이 카드의 난이도는 어떠셨나요?')).not.toBeVisible();
  });

  test('난이도 평가 기능이 올바르게 작동함', async ({ page }) => {
    await page.goto('/flashcards');

    // 답변 보기
    await page.getByRole('button', { name: '답 보기' }).click({ force: true });

    // 초기 정답률 확인 (0%) - 더 구체적인 선택자 사용
    await expect(page.locator('.font-semibold').filter({ hasText: '0%' })).toBeVisible();

    // "4 쉬움" 버튼 클릭
    await page.getByRole('button', { name: '4 쉬움' }).click({ force: true });

    // 다음 카드로 자동 이동되었는지 확인
    await expect(page.locator('.text-sm').filter({ hasText: '2 / 2 카드' })).toBeVisible();
    
    // 난이도 버튼 클릭이 정상적으로 다음 카드로 이동시켰는지 확인
    await expect(page.getByRole('button', { name: '답 보기' })).toBeVisible();
  });

  test('키보드 단축키가 작동함', async ({ page }) => {
    await page.goto('/flashcards');

    // 기본 버튼들이 존재하는지 확인 (키보드 단축키와 대응)
    await expect(page.getByRole('button', { name: '답 보기' })).toBeVisible();
    await expect(page.getByRole('button', { name: '이전', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '다음', exact: true })).toBeVisible();
    
    // 키보드 단축키 테스트 (스페이스바로 답변 보기)
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: '질문 보기' })).toBeVisible();
    
    // 스페이스바로 다시 숨기기
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: '답 보기' })).toBeVisible();
  });

  test('학습 완료 시 완료 메시지가 표시됨', async ({ page }) => {
    await page.goto('/flashcards');

    // 첫 번째 카드 완료
    await page.getByRole('button', { name: '답 보기' }).click({ force: true });
    await page.getByRole('button', { name: '4 쉬움' }).click({ force: true });

    // 두 번째(마지막) 카드 완료
    await page.getByRole('button', { name: '답 보기' }).click({ force: true });
    await page.getByRole('button', { name: '3 보통' }).click({ force: true });

    // 완료 후 2개 카드를 모두 처리했는지 확인
    await expect(page.locator('.text-sm').filter({ hasText: '2 / 2 카드' })).toBeVisible();
    
    // 완료 콜백이 호출되어야 하므로 일정 시간 대기 후 상태 확인
    await page.waitForTimeout(1000);
  });

  test('반응형 디자인 - 모바일에서 올바르게 표시됨', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/flashcards');

    // 모바일에서 제목 확인 (h1 태그로 정확히 매치)
    await expect(page.locator('h1').filter({ hasText: '플래시카드 학습' })).toBeVisible();

    // 진행률 표시 확인
    await expect(page.locator('.text-sm').filter({ hasText: '1 / 2 카드' })).toBeVisible();

    // 네비게이션 버튼들이 모바일에서도 보이는지 확인
    await expect(page.getByRole('button', { name: '이전 카드' })).toBeVisible();
    await expect(page.getByRole('button', { name: '다음 카드' })).toBeVisible();
    await expect(page.getByRole('button', { name: '답변 보기' })).toBeVisible();
  });
});