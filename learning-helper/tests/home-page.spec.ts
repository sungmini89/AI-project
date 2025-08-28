import { test, expect } from '@playwright/test';

test.describe('홈페이지', () => {
  test('홈페이지가 올바르게 로드되고 주요 요소들이 표시됨', async ({ page }) => {
    await page.goto('/');

    // 메인 타이틀 확인 (exact: true로 정확히 매치)
    await expect(page.getByRole('heading', { name: 'AI Study Helper', exact: true })).toBeVisible();

    // 네비게이션 메뉴 확인
    await expect(page.getByRole('link', { name: '홈' })).toBeVisible();
    await expect(page.getByRole('link', { name: '대시보드', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: '자료 업로드' })).toBeVisible();
    await expect(page.getByRole('link', { name: '플래시카드' })).toBeVisible();
    await expect(page.getByRole('link', { name: '퀴즈' })).toBeVisible();

    // 주요 기능 카드들 확인
    await expect(page.getByText('자료 업로드')).toBeVisible();
    await expect(page.getByText('플래시카드')).toBeVisible();
    await expect(page.getByText('퀴즈')).toBeVisible();
    await expect(page.getByText('학습 분석')).toBeVisible();
  });

  test('네비게이션 링크들이 올바르게 작동함', async ({ page }) => {
    await page.goto('/');

    // 대시보드 링크 테스트
    await page.getByRole('link', { name: '대시보드' }).click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('학습 대시보드')).toBeVisible();

    // 자료 업로드 링크 테스트
    await page.getByRole('link', { name: '자료 업로드' }).click();
    await expect(page).toHaveURL('/upload');
    await expect(page.getByText('학습 자료 업로드')).toBeVisible();

    // 플래시카드 링크 테스트
    await page.getByRole('link', { name: '플래시카드' }).click();
    await expect(page).toHaveURL('/flashcards');
    await expect(page.locator('h1').filter({ hasText: '플래시카드 학습' })).toBeVisible();

    // 퀴즈 링크 테스트
    await page.getByRole('link', { name: '퀴즈' }).click();
    await expect(page).toHaveURL('/quiz');
    await expect(page.getByText('퀴즈')).toBeVisible();
  });

  test('홈페이지 CTA 버튼들이 올바르게 작동함', async ({ page }) => {
    await page.goto('/');

    // "학습 시작하기" 버튼 테스트
    await page.getByRole('button', { name: '학습 시작하기' }).click();
    await expect(page).toHaveURL('/upload');

    // 홈으로 돌아가서 "대시보드 보기" 버튼 테스트
    await page.getByRole('link', { name: '홈' }).click();
    await page.getByRole('button', { name: '대시보드 보기' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('반응형 디자인 - 모바일 뷰포트에서 올바르게 표시됨', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 모바일에서 타이틀이 표시되는지 확인
    await expect(page.getByRole('heading', { name: 'AI Study Helper' })).toBeVisible();

    // 모바일 네비게이션 확인
    await expect(page.getByRole('link', { name: '홈' })).toBeVisible();
    await expect(page.getByRole('link', { name: '대시보드', exact: true })).toBeVisible();
  });
});