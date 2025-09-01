import { test, expect } from '@playwright/test';

test.describe('접근성 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('키보드 내비게이션', async ({ page }) => {
    // 키워드 입력이 자동으로 포커스되어 있는지 확인
    await expect(page.locator('[data-testid="keyword-input"]')).toBeFocused();
    
    // 키워드 입력 후 Tab으로 다음 요소로 이동
    await page.fill('[data-testid="keyword-input"]', '바다');
    
    // Tab으로 하모니 선택기로 이동
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // 랜덤 버튼 건너뛰고 하모니 선택으로
    
    // 하모니 선택기가 포커스되었는지 확인 (TabsList의 첫 번째 탭)
    const harmonyTabs = page.locator('[data-testid="harmony-select"] [role="tab"]');
    await expect(harmonyTabs.first()).toBeFocused();
    
    // Tab으로 생성 버튼으로 이동 (여러 번 Tab 필요할 수 있음)
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const generateBtn = page.locator('[data-testid="generate-button"]');
      if (await generateBtn.isEnabled() && await generateBtn.isVisible()) {
        const isFocused = await generateBtn.evaluate(el => document.activeElement === el);
        if (isFocused) break;
      }
    }
    
    // Enter 키로 팔레트 생성
    await page.keyboard.press('Enter');
    
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
  });

  test('스크린 리더 지원', async ({ page }) => {
    // ARIA 라벨 확인
    await expect(page.locator('[data-testid="keyword-input"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="harmony-select"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="generate-button"]')).toHaveAttribute('aria-label');
    
    // 색상 생성 후 ARIA 라이브 리전 확인
    await page.fill('[data-testid="keyword-input"]', '숲');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 생성된 색상에 대한 접근성 정보
    const colorCards = page.locator('[data-testid="color-card"]');
    for (let i = 0; i < 5; i++) {
      await expect(colorCards.nth(i)).toHaveAttribute('aria-label');
      await expect(colorCards.nth(i)).toHaveAttribute('role', 'button');
    }
    
    // 라이브 리전으로 결과 알림
    await expect(page.locator('[aria-live="polite"]')).toBeVisible();
  });

  test('색상 대비 접근성', async ({ page }) => {
    await page.goto('/');
    
    // 색상 생성
    await page.fill('[data-testid="keyword-input"]', '태양');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 각 색상 카드의 텍스트 대비율 확인
    const colorCards = page.locator('[data-testid="color-card"]');
    const cardCount = await colorCards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = colorCards.nth(i);
      
      // 배경색과 텍스트 색상 가져오기
      const backgroundColor = await card.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      const textColor = await card.evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      
      // 대비율 계산 (최소 4.5:1 필요)
      const contrastRatio = await page.evaluate(([bg, text]) => {
        // 대비율 계산 함수
        const getLuminance = (rgb: string) => {
          const [r, g, b] = rgb.match(/\d+/g)!.map(Number);
          const toLinear = (c: number) => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          };
          return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
        };
        
        const bgLum = getLuminance(bg);
        const textLum = getLuminance(text);
        const contrast = (Math.max(bgLum, textLum) + 0.05) / (Math.min(bgLum, textLum) + 0.05);
        
        return contrast;
      }, [backgroundColor, textColor]);
      
      // WCAG AA 기준 (4.5:1) 확인
      expect(contrastRatio).toBeGreaterThan(4.5);
    }
  });

  test('포커스 표시기', async ({ page }) => {
    // 포커스 가능한 모든 요소에 포커스 표시기 확인
    const focusableElements = [
      '[data-testid="keyword-input"]',
      '[data-testid="harmony-select"]',
      '[data-testid="generate-button"]',
      '[data-testid="theme-toggle"]',
      '[data-testid="language-toggle"]'
    ];
    
    for (const selector of focusableElements) {
      await page.focus(selector);
      
      // 포커스 스타일 확인
      const element = page.locator(selector);
      const outline = await element.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.outline || styles.boxShadow;
      });
      
      // 포커스 표시기가 있어야 함
      expect(outline).not.toBe('none');
      expect(outline).not.toBe('');
    }
  });

  test('고대비 모드 지원', async ({ page, context }) => {
    // 고대비 모드 활성화
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        value: (query: string) => ({
          matches: query.includes('prefers-contrast: high'),
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
      });
    });
    
    await page.goto('/');
    
    // 고대비 스타일이 적용되는지 확인
    const bodyStyles = await page.evaluate(() => {
      return window.getComputedStyle(document.body);
    });
    
    // 색상 생성 및 고대비 모드에서 가독성 확인
    await page.fill('[data-testid="keyword-input"]', '달');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 고대비 모드에서 색상 정보가 명확히 표시되는지 확인
    const colorCards = page.locator('[data-testid="color-card"]');
    const firstCard = colorCards.first();
    
    await expect(firstCard.locator('[data-testid="color-hex"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="color-name"]')).toBeVisible();
  });

  test('음성 피드백 지원', async ({ page }) => {
    await page.goto('/');
    
    // 색상 생성
    await page.fill('[data-testid="keyword-input"]', '장미');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // aria-describedby 속성으로 색상 정보 제공 확인
    const colorCards = page.locator('[data-testid="color-card"]');
    
    for (let i = 0; i < 5; i++) {
      const card = colorCards.nth(i);
      await expect(card).toHaveAttribute('aria-describedby');
      
      // 설명 요소가 실제로 존재하는지 확인
      const describedBy = await card.getAttribute('aria-describedby');
      await expect(page.locator(`#${describedBy}`)).toBeVisible();
    }
  });

  test('확대/축소 지원', async ({ page }) => {
    await page.goto('/');
    
    // 200% 확대
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });
    
    // 확대된 상태에서도 기능 정상 작동 확인
    await page.fill('[data-testid="keyword-input"]', '구름');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // UI 요소들이 잘리거나 겹치지 않는지 확인
    const keywordInput = page.locator('[data-testid="keyword-input"]');
    const generateButton = page.locator('[data-testid="generate-button"]');
    
    await expect(keywordInput).toBeVisible();
    await expect(generateButton).toBeVisible();
    
    // 원래 크기로 복원
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });

  test('색각 장애 지원', async ({ page }) => {
    await page.goto('/');
    
    // 색상 생성
    await page.fill('[data-testid="keyword-input"]', '잔디');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible({ timeout: 5000 });
    
    // 색상 정보가 색상 외의 방법으로도 제공되는지 확인
    const colorCards = page.locator('[data-testid="color-card"]');
    
    for (let i = 0; i < 5; i++) {
      const card = colorCards.nth(i);
      
      // HEX 코드 표시 확인
      await expect(card.locator('[data-testid="color-hex"]')).toBeVisible();
      
      // 색상 이름 표시 확인 (있는 경우)
      const colorName = card.locator('[data-testid="color-name"]');
      if (await colorName.isVisible()) {
        await expect(colorName).toContainText(/\w+/);
      }
      
      // HSL 값 표시 확인 (상세 모드)
      await card.hover();
      const tooltip = page.locator('[data-testid="color-details"]');
      if (await tooltip.isVisible()) {
        await expect(tooltip).toContainText(/hsl/i);
      }
    }
  });

  test('색맹 시뮬레이션 정확도 검증', async ({ page }) => {
    await page.goto('/generator');
    
    // 팔레트 생성
    await page.fill('[data-testid="keyword-input"]', '가을');
    await page.click('[data-testid="generate-button"]');
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible();
    
    // 접근성 도구 열기
    await page.click('[data-testid="accessibility-tools"]');
    
    const colorblindTypes = ['protanopia', 'deuteranopia', 'tritanopia', 'monochromacy'];
    
    for (const type of colorblindTypes) {
      // 색맹 시뮬레이션 활성화
      await page.click(`[data-testid="colorblind-${type}"]`);
      
      // 시뮬레이션 활성 상태 확인
      await expect(page.locator('[data-testid="simulation-active"]')).toBeVisible();
      await expect(page.locator('[data-testid="simulation-type"]')).toContainText(type);
      
      // 원본과 시뮬레이션 색상 비교 표시
      await expect(page.locator('[data-testid="original-colors"]')).toBeVisible();
      await expect(page.locator('[data-testid="simulated-colors"]')).toBeVisible();
      
      // 색상 차이 설명 텍스트 확인
      await expect(page.locator('[data-testid="color-difference-explanation"]')).toBeVisible();
    }
  });

  test('WCAG 대비율 계산 정확성', async ({ page }) => {
    await page.goto('/generator');
    
    // 알려진 색상으로 테스트
    await page.evaluate(() => {
      window.testColors = [
        { hex: '#000000', name: '검정' }, // 흰 배경과 21:1 대비
        { hex: '#FFFFFF', name: '흰색' }, // 검정 배경과 21:1 대비  
        { hex: '#767676', name: '회색' }, // 흰 배경과 4.54:1 대비 (AA 통과)
        { hex: '#949494', name: '밝은회색' }, // 흰 배경과 3.2:1 대비 (AA 실패)
      ];
    });
    
    await page.click('[data-testid="test-contrast-colors"]');
    
    const testColors = page.locator('[data-testid="test-color-item"]');
    const testCount = await testColors.count();
    
    for (let i = 0; i < testCount; i++) {
      const colorItem = testColors.nth(i);
      const contrastText = await colorItem.locator('[data-testid="contrast-ratio"]').textContent();
      const [ratio] = contrastText.split(':').map(Number);
      
      const colorHex = await colorItem.locator('[data-testid="color-hex"]').textContent();
      
      // 알려진 대비율과 계산된 대비율 비교
      switch (colorHex) {
        case '#000000':
          expect(Math.abs(ratio - 21)).toBeLessThan(0.1);
          await expect(colorItem.locator('[data-testid="wcag-aaa"]')).toBeVisible();
          break;
        case '#767676':
          expect(Math.abs(ratio - 4.54)).toBeLessThan(0.1);
          await expect(colorItem.locator('[data-testid="wcag-aa"]')).toBeVisible();
          break;
        case '#949494':
          expect(ratio).toBeLessThan(4.5);
          await expect(colorItem.locator('[data-testid="wcag-fail"]')).toBeVisible();
          break;
      }
    }
  });

  test('모바일 터치 접근성', async ({ page }) => {
    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/generator');
    
    // 터치 타겟 크기 확인 (최소 44px, 작은 요소는 예외)
    const touchTargets = page.locator('button, [role="button"], input, select');
    const targetCount = await touchTargets.count();
    
    for (let i = 0; i < targetCount; i++) {
      const target = touchTargets.nth(i);
      const box = await target.boundingBox();
      
      if (box) {
        // 40px 미만인 경우만 체크 (너무 작은 버튼 방지)
        if (box.width < 40 || box.height < 40) {
          console.warn(`Small touch target found: ${box.width}x${box.height}px`);
          expect(box.width).toBeGreaterThanOrEqual(40);
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    }
    
    // 터치 제스처로 팔레트 생성
    await page.tap('[data-testid="keyword-input"]');
    await page.fill('[data-testid="keyword-input"]', '바다');
    await page.tap('[data-testid="generate-button"]');
    
    await expect(page.locator('[data-testid="color-palette"]')).toBeVisible();
  });
});