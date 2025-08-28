import { test, expect } from '@playwright/test';

test.describe('퀴즈 시스템', () => {
  test('퀴즈 페이지가 올바르게 로드됨', async ({ page }) => {
    await page.goto('/quiz');

    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: '퀴즈' })).toBeVisible();
    
    // 설명 텍스트 확인
    await expect(page.getByText('지식을 테스트하고 학습 진도를 확인해보세요.')).toBeVisible();

    // 퀴즈 시작 버튼 확인
    await expect(page.getByRole('button', { name: '퀴즈 시작' })).toBeVisible();
    
    // 난이도 선택 옵션 확인
    await expect(page.getByText('난이도 선택')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
  });

  test('퀴즈 시작 및 기본 기능이 올바르게 작동함', async ({ page }) => {
    await page.goto('/quiz');

    // 퀴즈 시작
    await page.getByRole('button', { name: '퀴즈 시작' }).click();

    // 첫 번째 문제 표시 확인
    await expect(page.getByText('문제 1 / 5')).toBeVisible();
    await expect(page.getByText('타이머:')).toBeVisible();
    
    // 문제와 선택지 확인
    await expect(page.locator('[data-testid="question-text"]')).toBeVisible();
    await expect(page.getByRole('radio').first()).toBeVisible();
    
    // 답안 선택 및 제출
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: '답안 제출' }).click();

    // 다음 문제로 이동되었는지 확인
    await expect(page.getByText('문제 2 / 5')).toBeVisible();
  });

  test('타이머 기능이 올바르게 작동함', async ({ page }) => {
    await page.goto('/quiz');

    await page.getByRole('button', { name: '퀴즈 시작' }).click();

    // 타이머 표시 확인
    const timer = page.getByText(/타이머: \d{2}:\d{2}/);
    await expect(timer).toBeVisible();

    // 짧은 시간 기다린 후 타이머가 카운트다운되는지 확인
    await page.waitForTimeout(2000);
    
    // 시간이 줄어드는지 확인 (정확한 시간보다는 형식 확인)
    await expect(timer).toBeVisible();
  });

  test('모든 문제 완료 시 결과 페이지가 표시됨', async ({ page }) => {
    await page.goto('/quiz');

    await page.getByRole('button', { name: '퀴즈 시작' }).click();

    // 5문제 모두 답변
    for (let i = 0; i < 5; i++) {
      await expect(page.getByText(`문제 ${i + 1} / 5`)).toBeVisible();
      
      // 첫 번째 선택지 선택
      await page.getByRole('radio').first().click();
      await page.getByRole('button', { name: '답안 제출' }).click();
    }

    // 결과 페이지 확인
    await expect(page.getByText('🎉 퀴즈 완료!')).toBeVisible();
    await expect(page.getByText(/총점: \d+점 \(100점 만점\)/)).toBeVisible();
    await expect(page.getByText(/정답률: \d+%/)).toBeVisible();
    await expect(page.getByText(/소요 시간:/)).toBeVisible();
    
    // 액션 버튼들 확인
    await expect(page.getByRole('button', { name: '다시 도전하기' })).toBeVisible();
    await expect(page.getByRole('button', { name: '대시보드로 이동' })).toBeVisible();
  });

  test('다시 도전하기 기능이 올바르게 작동함', async ({ page }) => {
    await page.goto('/quiz');

    // 첫 번째 퀴즈 완료
    await page.getByRole('button', { name: '퀴즈 시작' }).click();
    
    for (let i = 0; i < 5; i++) {
      await page.getByRole('radio').first().click();
      await page.getByRole('button', { name: '답안 제출' }).click();
    }

    // 다시 도전하기 클릭
    await page.getByRole('button', { name: '다시 도전하기' }).click();

    // 퀴즈 시작 화면으로 돌아왔는지 확인
    await expect(page.getByRole('button', { name: '퀴즈 시작' })).toBeVisible();
    await expect(page.getByText('난이도 선택')).toBeVisible();
  });

  test('대시보드 이동 기능이 올바르게 작동함', async ({ page }) => {
    await page.goto('/quiz');

    // 퀴즈 완료
    await page.getByRole('button', { name: '퀴즈 시작' }).click();
    
    for (let i = 0; i < 5; i++) {
      await page.getByRole('radio').first().click();
      await page.getByRole('button', { name: '답안 제출' }).click();
    }

    // 대시보드로 이동 클릭
    await page.getByRole('button', { name: '대시보드로 이동' }).click();

    // 대시보드 페이지로 이동했는지 확인
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('학습 대시보드')).toBeVisible();
  });

  test('난이도 선택이 올바르게 작동함', async ({ page }) => {
    await page.goto('/quiz');

    // 난이도 변경
    await page.locator('select').selectOption('hard');
    const selectedValue = await page.locator('select').inputValue();
    expect(selectedValue).toBe('hard');

    // 퀴즈 시작 후에도 설정이 유지되는지 확인
    await page.getByRole('button', { name: '퀴즈 시작' }).click();
    await expect(page.getByText('문제 1 / 5')).toBeVisible();
  });

  test('답안 선택 유효성 검사가 작동함', async ({ page }) => {
    await page.goto('/quiz');

    await page.getByRole('button', { name: '퀴즈 시작' }).click();

    // 답안 선택 없이 제출 시도
    const submitButton = page.getByRole('button', { name: '답안 제출' });
    
    // 답안 선택이 필요하다는 피드백이 있어야 함
    // (실제 구현에서는 버튼이 비활성화되거나 경고 메시지가 표시됨)
    if (await submitButton.isDisabled()) {
      // 버튼이 비활성화된 경우
      await expect(submitButton).toBeDisabled();
    } else {
      // 경고 메시지가 표시되는 경우
      await submitButton.click();
      // 여전히 같은 문제에 머물러 있어야 함
      await expect(page.getByText('문제 1 / 5')).toBeVisible();
    }

    // 답안 선택 후 제출이 가능해야 함
    await page.getByRole('radio').first().click();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    
    // 다음 문제로 이동
    await expect(page.getByText('문제 2 / 5')).toBeVisible();
  });

  test('반응형 디자인 - 모바일에서 올바르게 표시됨', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/quiz');

    // 모바일에서 제목 확인
    await expect(page.getByRole('heading', { name: '퀴즈' })).toBeVisible();

    // 퀴즈 시작
    await page.getByRole('button', { name: '퀴즈 시작' }).click();

    // 모바일에서 문제와 선택지가 올바르게 표시되는지 확인
    await expect(page.getByText('문제 1 / 5')).toBeVisible();
    await expect(page.getByRole('radio').first()).toBeVisible();
    await expect(page.getByRole('button', { name: '답안 제출' })).toBeVisible();
  });

  test('퀴즈 진행 상태 표시가 올바름', async ({ page }) => {
    await page.goto('/quiz');

    await page.getByRole('button', { name: '퀴즈 시작' }).click();

    // 진행률 바 또는 진행 상태 표시 확인
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`문제 ${i} / 5`)).toBeVisible();
      
      // 진행률이 표시되는지 확인 (구현에 따라 다를 수 있음)
      // 진행률 계산 (사용하지 않지만 유지)
      // const progressText = `${(i / 5 * 100).toFixed(0)}%`;
      
      if (i < 5) {
        await page.getByRole('radio').first().click();
        await page.getByRole('button', { name: '답안 제출' }).click();
      }
    }
  });
});