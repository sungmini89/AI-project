import { test, expect } from '@playwright/test';

test.describe('AI 일기 앱 - 홈페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('메인 페이지 로드 및 기본 요소 검증', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/AI 일기/);
    
    // 헤더 요소 확인
    await expect(page.locator('nav')).toBeVisible();
    
    // 메인 콘텐츠 영역 확인
    await expect(page.locator('main')).toBeVisible();
    
    // 네비게이션 링크 확인
    await expect(page.locator('text=홈')).toBeVisible();
    await expect(page.locator('text=일기 작성')).toBeVisible();
    await expect(page.locator('text=일기 목록')).toBeVisible();
    await expect(page.locator('text=분석')).toBeVisible();
    await expect(page.locator('text=설정')).toBeVisible();
  });

  test('반응형 디자인 확인', async ({ page }) => {
    // 데스크탑 뷰
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('nav')).toBeVisible();
    
    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('nav')).toBeVisible();
    
    // 태블릿 뷰
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('nav')).toBeVisible();
  });

  test('네비게이션 기능 확인', async ({ page }) => {
    // 일기 작성 페이지로 이동
    await page.click('text=일기 작성');
    await expect(page).toHaveURL(/.*\/write/);
    await expect(page.locator('text=일기 작성')).toBeVisible();
    
    // 홈으로 돌아가기
    await page.click('text=홈');
    await expect(page).toHaveURL('/');
    
    // 일기 목록 페이지로 이동
    await page.click('text=일기 목록');
    await expect(page).toHaveURL(/.*\/diary/);
    
    // 분석 페이지로 이동
    await page.click('text=분석');
    await expect(page).toHaveURL(/.*\/analytics/);
    
    // 설정 페이지로 이동
    await page.click('text=설정');
    await expect(page).toHaveURL(/.*\/settings/);
  });

  test('에러 바운더리 테스트', async ({ page }) => {
    // 개발 모드에서 디버그 패널이 있는지 확인
    const debugPanel = page.locator('text=디버그 테스트');
    if (await debugPanel.isVisible()) {
      console.log('디버그 패널 발견 - Error Boundary 테스트 수행');
      
      // Error Boundary 테스트 버튼 클릭
      await page.click('text=Error Boundary 테스트');
      
      // 에러 메시지가 표시되는지 확인
      await expect(page.locator('text=테스트 오류')).toBeVisible();
      
      // 에러 해제
      await page.click('text=오류 해제');
      await expect(page.locator('text=정상 작동 중')).toBeVisible();
    }
  });

  test('PWA 매니페스트 확인', async ({ page }) => {
    // 매니페스트 링크 확인
    const manifestLink = await page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeAttached();
    
    // 서비스 워커 등록 확인 (개발 모드에서는 없을 수 있음)
    const swRegistration = await page.evaluate(() => {
      return navigator.serviceWorker && navigator.serviceWorker.getRegistrations();
    });
    console.log('Service Worker registrations:', swRegistration);
  });

  test('다크모드/라이트모드 토글', async ({ page }) => {
    // 설정 페이지로 이동
    await page.click('text=설정');
    
    // 테마 설정 찾기 (있다면)
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      
      // 테마 변경 확인 (body 클래스나 CSS 변수 확인)
      const isDark = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ||
               getComputedStyle(document.documentElement).colorScheme === 'dark';
      });
      console.log('Dark mode active:', isDark);
    }
  });
});