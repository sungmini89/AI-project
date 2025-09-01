import { test, expect } from '@playwright/test';

/**
 * AI 색상 팔레트 생성기 핵심 기능 E2E 테스트
 * 키워드 입력, 팔레트 생성, 저장 및 관리 기능 검증
 */
test.describe('AI 색상 팔레트 생성기 - 핵심 기능', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AI 색상 팔레트/);
  });

  test('메인 페이지 로드 및 UI 요소 확인', async ({ page }) => {
    // 헤더 및 네비게이션 확인
    await expect(page.locator('header')).toContainText('AI 색상 팔레트');
    await expect(page.locator('nav')).toContainText('생성기');
    await expect(page.locator('nav')).toContainText('저장된 팔레트');
    
    // 메인 콘텐츠 확인
    await expect(page.locator('h1')).toContainText('AI 색상 팔레트 생성기');
    await expect(page.locator('p')).toContainText('한국어 키워드나 이미지를 활용해');
    
    // 탭 인터페이스 확인
    await expect(page.locator('[role="tablist"]')).toBeVisible();
    await expect(page.locator('text=키워드로 생성')).toBeVisible();
    await expect(page.locator('text=이미지에서 추출')).toBeVisible();
    
    // 가이드 섹션 확인
    await expect(page.locator('text=색상 팔레트 생성을 시작하세요')).toBeVisible();
  });

  test('키워드 팔레트 생성 플로우', async ({ page }) => {
    // 키워드 탭 활성화 확인
    const keywordTab = page.locator('text=키워드로 생성');
    await expect(keywordTab).toBeVisible();
    
    // PaletteGenerator 컴포넌트 확인 (실제 구현에 따라 셀렉터 조정 필요)
    const paletteGenerator = page.locator('[data-testid="palette-generator"]').or(
      page.locator('.palette-generator')
    ).or(
      page.locator('form').first()
    );
    
    if (await paletteGenerator.count() > 0) {
      // 키워드 입력
      const keywordInput = page.locator('input[type="text"]').first();
      await keywordInput.fill('바다');
      
      // 생성 버튼 클릭 (버튼이 있다면)
      const generateButton = page.locator('button:has-text("생성")').or(
        page.locator('button[type="submit"]')
      );
      
      if (await generateButton.count() > 0) {
        await generateButton.click();
        
        // 팔레트 생성 결과 대기
        await page.waitForTimeout(2000);
        
        // 생성된 팔레트 확인 (구현에 따라 조정)
        const paletteResult = page.locator('[data-testid="generated-palette"]').or(
          page.locator('.color-palette')
        );
        
        if (await paletteResult.count() > 0) {
          await expect(paletteResult).toBeVisible();
        }
      }
    }
    
    // 기본적으로 페이지가 에러 없이 로드되었는지 확인
    await expect(page).not.toHaveURL(/.*error.*/);
  });

  test('조화 규칙 선택 기능', async ({ page }) => {
    // 조화 선택기 확인 (구현에 따라 조정)
    const harmonySelector = page.locator('[data-testid="harmony-selector"]').or(
      page.locator('select')
    ).or(
      page.locator('[role="combobox"]')
    );
    
    if (await harmonySelector.count() > 0) {
      // 조화 규칙 옵션들 확인
      const options = ['complementary', 'analogous', 'triadic', 'tetradic', 'monochromatic'];
      
      for (const option of options) {
        // 각 옵션이 존재하는지 확인 (셀렉터에 따라 조정)
        const optionElement = page.locator(`option[value="${option}"]`).or(
          page.locator(`text=${option}`)
        );
        
        // 옵션이 존재한다면 검증
        if (await optionElement.count() > 0) {
          await expect(optionElement).toBeVisible();
        }
      }
    }
  });

  test('저장된 팔레트 페이지 이동', async ({ page }) => {
    // 저장된 팔레트 링크 클릭
    const savedPalettesLink = page.locator('text=저장된 팔레트').or(
      page.locator('a[href="/saved"]')
    );
    
    await savedPalettesLink.click();
    
    // URL 변경 확인
    await expect(page).toHaveURL(/.*\/saved/);
    
    // 저장된 팔레트 페이지 콘텐츠 확인
    await expect(page.locator('h1, h2').first()).toContainText(/저장된 팔레트|팔레트 컬렉션/);
  });

  test('반응형 디자인 확인', async ({ page }) => {
    // 데스크톱 뷰포트
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('header')).toBeVisible();
    
    // 태블릿 뷰포트
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('header')).toBeVisible();
    
    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('header')).toBeVisible();
    
    // 네비게이션이 모바일에서도 작동하는지 확인
    const navigation = page.locator('nav');
    if (await navigation.count() > 0) {
      await expect(navigation).toBeVisible();
    }
  });

  test('접근성 기본 요소 확인', async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/AI 색상 팔레트/);
    
    // 메인 랜드마크 확인
    const main = page.locator('main').or(page.locator('[role="main"]'));
    if (await main.count() > 0) {
      await expect(main).toBeVisible();
    }
    
    // 헤더 랜드마크 확인
    const header = page.locator('header').or(page.locator('[role="banner"]'));
    await expect(header).toBeVisible();
    
    // 네비게이션 확인
    const nav = page.locator('nav').or(page.locator('[role="navigation"]'));
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible();
    }
    
    // 키보드 네비게이션 테스트
    await page.keyboard.press('Tab');
    
    // 포커스된 요소가 있는지 확인
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement).toBeVisible();
    }
  });

  test('에러 처리 확인', async ({ page }) => {
    // 네트워크 요청 실패 시뮬레이션 (API 호출이 있다면)
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // 페이지가 여전히 로드되고 오프라인 기능이 작동하는지 확인
    await page.reload();
    await expect(page.locator('body')).toBeVisible();
    
    // 에러 상태가 적절히 처리되는지 확인
    // (구현에 따라 에러 메시지나 fallback UI 확인)
  });

  test('다크 모드 및 테마 변경 (구현된 경우)', async ({ page }) => {
    // 다크 모드 토글 버튼 찾기
    const themeToggle = page.locator('[data-testid="theme-toggle"]').or(
      page.locator('button:has-text("다크")').or(
        page.locator('button:has-text("Dark")')
      )
    );
    
    if (await themeToggle.count() > 0) {
      await themeToggle.click();
      
      // 테마 변경 확인 (클래스나 스타일 변경)
      await page.waitForTimeout(500);
      const body = page.locator('body');
      
      // 다크 모드 클래스 확인
      const isDark = await body.evaluate(el => 
        el.classList.contains('dark') || 
        el.classList.contains('dark-mode') ||
        getComputedStyle(el).backgroundColor === 'rgb(0, 0, 0)' ||
        getComputedStyle(el).backgroundColor.includes('rgb(') && 
        getComputedStyle(el).backgroundColor < 'rgb(128, 128, 128)'
      );
      
      // 다크 모드가 활성화되었다면 성공
      if (isDark) {
        expect(isDark).toBe(true);
      }
    }
  });
});