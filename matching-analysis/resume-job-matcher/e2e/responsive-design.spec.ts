import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyzer');
  });

  test('데스크톱 뷰포트 (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 메인 헤딩 확인
    await expect(page.locator('h1')).toBeVisible();
    
    // 그리드 레이아웃이 2열로 표시되는지 확인
    const grid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2');
    await expect(grid).toBeVisible();
    
    // 카드들이 나란히 배치되는지 확인
    const cards = page.locator('.magic-card');
    await expect(cards).toHaveCount(2);
    
    // 최대 너비 제한 확인
    const container = page.locator('.max-w-4xl');
    await expect(container).toBeVisible();
  });

  test('태블릿 뷰포트 (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // 메인 콘텐츠가 여전히 보이는지 확인
    await expect(page.locator('h1')).toBeVisible();
    
    // 그리드가 적용되어 있는지 확인
    const grid = page.locator('.grid');
    await expect(grid).toBeVisible();
    
    // 반응형 텍스트 크기 확인 (5xl이 더 작은 크기로 조정)
    const title = page.locator('h1');
    const titleStyles = await title.evaluate(el => getComputedStyle(el));
    expect(parseFloat(titleStyles.fontSize)).toBeGreaterThan(24); // 최소 24px
  });

  test('모바일 뷰포트 (375x667) - iPhone SE', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 메인 헤딩이 여전히 보이는지 확인
    await expect(page.locator('h1')).toBeVisible();
    
    // 설명 텍스트가 적절하게 줄바꿈되는지 확인
    const description = page.locator('text=AI 기반 이력서와 채용공고 매칭 분석 플랫폼');
    await expect(description).toBeVisible();
    
    // 카드들이 세로로 쌓이는지 확인 (grid-cols-1)
    const cards = page.locator('.magic-card');
    await expect(cards).toHaveCount(2);
    
    // 패딩이 모바일에 적합한지 확인 - main container with min-h-screen
    const mainContainer = page.locator('div.min-h-screen.p-8');
    await expect(mainContainer).toBeVisible();
  });

  test('작은 모바일 뷰포트 (320x568) - iPhone 5', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    
    // 콘텐츠가 가로 스크롤 없이 맞는지 확인
    await expect(page.locator('h1')).toBeVisible();
    
    // 제목이 여러 줄로 적절히 줄바꿈되는지 확인
    const title = page.locator('h1');
    const titleBounds = await title.boundingBox();
    expect(titleBounds?.width).toBeLessThan(320);
    
    // 카드 내용이 잘리지 않는지 확인
    const firstCard = page.locator('.magic-card').first();
    await expect(firstCard).toBeVisible();
    
    const cardBounds = await firstCard.boundingBox();
    expect(cardBounds?.width).toBeLessThan(320);
  });

  test('큰 데스크톱 뷰포트 (2560x1440)', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    
    // 콘텐츠가 중앙에 정렬되고 최대 너비가 제한되는지 확인
    const container = page.locator('.max-w-4xl.mx-auto');
    await expect(container).toBeVisible();
    
    // 너무 넓게 펼쳐지지 않는지 확인
    const containerBounds = await container.boundingBox();
    expect(containerBounds?.width).toBeLessThan(1000); // 4xl은 약 56rem (896px)
  });

  test('분석 결과 반응형 디자인', async ({ page }) => {
    // 테스트 데이터 입력
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    await resumeTextArea.fill('React 개발자');
    
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    await jobTextArea.fill('React 개발자 모집');
    
    // 분석 실행
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    await analyzeButton.click();
    
    // 결과 대기
    await expect(page.locator('text=매칭 분석 결과')).toBeVisible({ timeout: 30000 });
    
    // 데스크톱에서 결과 확인 (4열 그리드)
    await page.setViewportSize({ width: 1024, height: 768 });
    const desktopGrid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-4');
    await expect(desktopGrid).toBeVisible();
    
    // 모바일에서 결과 확인 (1열 그리드)
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(desktopGrid).toBeVisible(); // 여전히 같은 그리드이지만 1열로 표시됨
    
    // 원형 진행률 바가 모바일에서도 적절한 크기인지 확인
    const progressBar = page.locator('div:has(> svg[viewBox="0 0 100 100"])').first();
    await expect(progressBar).toBeVisible();
    
    const progressBounds = await progressBar.boundingBox();
    if (progressBounds) {
      expect(progressBounds.width).toBeLessThan(200); // 적절한 크기 제한
    }
  });

  test('터치 친화적 인터페이스 (모바일)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 버튼이 터치하기 충분한 크기인지 확인 (최소 44px)
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    await resumeTextArea.fill('테스트');
    
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    await jobTextArea.fill('테스트');
    
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    const buttonBounds = await analyzeButton.boundingBox();
    
    expect(buttonBounds?.height).toBeGreaterThanOrEqual(44);
    expect(buttonBounds?.width).toBeGreaterThanOrEqual(44);
    
    // 터치/클릭 이벤트가 작동하는지 확인
    await analyzeButton.click();
    await expect(page.locator('text=분석 중...')).toBeVisible();
  });

  test('가로/세로 방향 전환 (태블릿)', async ({ page }) => {
    // 세로 방향 (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();
    
    const portraitGrid = page.locator('.grid');
    await expect(portraitGrid).toBeVisible();
    
    // 가로 방향 (1024x768)
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('h1')).toBeVisible();
    
    const landscapeGrid = page.locator('.grid');
    await expect(landscapeGrid).toBeVisible();
    
    // 레이아웃이 적절히 조정되었는지 확인
    const cards = page.locator('.magic-card');
    await expect(cards).toHaveCount(2);
  });

  test('텍스트 가독성 (다양한 화면 크기)', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568, name: 'Mobile Small' },
      { width: 375, height: 667, name: 'Mobile Medium' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Desktop Small' },
      { width: 1920, height: 1080, name: 'Desktop Large' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // 메인 제목 가독성 확인
      const title = page.locator('h1').first();
      await expect(title).toBeVisible();
      
      const titleStyles = await title.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.fontSize;
      });
      const fontSize = parseFloat(titleStyles);
      
      // fontSize가 유효한지 확인하고 최소 크기 검증
      if (!isNaN(fontSize)) {
        expect(fontSize).toBeGreaterThanOrEqual(16);
      }
      
      // 설명 텍스트 가독성 확인
      const description = page.locator('text=AI 기반 이력서와 채용공고 매칭 분석 플랫폼').first();
      if (await description.count() > 0) {
        await expect(description).toBeVisible();
        
        const descStyles = await description.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return styles.fontSize;
        });
        const descFontSize = parseFloat(descStyles);
        
        // 설명 텍스트도 최소 크기 확인
        if (!isNaN(descFontSize)) {
          expect(descFontSize).toBeGreaterThanOrEqual(14);
        }
      }
    }
  });
});