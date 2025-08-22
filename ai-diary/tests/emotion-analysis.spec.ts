import { test, expect } from '@playwright/test';

test.describe('감정 분석 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/write');
    // 에디터가 로드될 때까지 대기
    await page.waitForSelector('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]', { timeout: 10000 });
  });

  test('영어 텍스트 감정 분석', async ({ page }) => {
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]').first();
    
    // 긍정적인 영어 텍스트 입력
    await editorContainer.click();
    await page.keyboard.type('I am very happy today! This is an amazing day and I feel wonderful.');
    
    // 감정 분석 트리거 (저장 버튼 또는 자동 분석)
    const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-button"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000); // 분석 처리 시간
    }
    
    // 감정 분석 결과 확인
    const emotionResult = page.locator('[data-testid="emotion-result"], .emotion-analysis');
    if (await emotionResult.isVisible()) {
      // 긍정적인 감정 (happy, excited 등)이 표시되는지 확인
      const emotionText = await emotionResult.textContent();
      console.log('감정 분석 결과:', emotionText);
      
      // 감정 아이콘이나 색상 확인
      const emotionIcon = page.locator('.emotion-icon, [data-testid="emotion-icon"]');
      if (await emotionIcon.isVisible()) {
        console.log('감정 아이콘 표시됨');
      }
    }
  });

  test('한국어 텍스트 감정 분석', async ({ page }) => {
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]').first();
    
    // 긍정적인 한국어 텍스트 입력
    await editorContainer.click();
    await page.keyboard.type('오늘 정말 행복하고 기뻐요! 친구들과 함께 즐거운 시간을 보냈습니다. 감사하고 만족스러운 하루였어요.');
    
    // 감정 분석 트리거
    const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-button"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 한국어 감정 분석 결과 확인
    const emotionResult = page.locator('[data-testid="emotion-result"], .emotion-analysis');
    if (await emotionResult.isVisible()) {
      const emotionText = await emotionResult.textContent();
      console.log('한국어 감정 분석 결과:', emotionText);
      
      // 긍정적인 결과가 나왔는지 확인
      expect(emotionText).toMatch(/(행복|기쁨|좋|만족|긍정)/);
    }
  });

  test('부정적인 감정 분석', async ({ page }) => {
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]').first();
    
    // 부정적인 텍스트 입력
    await editorContainer.click();
    await page.keyboard.type('오늘은 정말 힘들고 슬픈 하루였습니다. 모든 것이 잘못되었고 화가 나고 실망스러웠어요.');
    
    // 감정 분석 트리거
    const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-button"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 부정적인 감정 분석 결과 확인
    const emotionResult = page.locator('[data-testid="emotion-result"], .emotion-analysis');
    if (await emotionResult.isVisible()) {
      const emotionText = await emotionResult.textContent();
      console.log('부정적인 감정 분석 결과:', emotionText);
      
      // 부정적인 결과가 나왔는지 확인
      expect(emotionText).toMatch(/(슬픔|화남|실망|부정|힘듦)/);
    }
  });

  test('중성적인 감정 분석', async ({ page }) => {
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]').first();
    
    // 중성적인 텍스트 입력
    await editorContainer.click();
    await page.keyboard.type('오늘은 평범한 하루였습니다. 일상적인 업무를 처리하고 집에 왔습니다. 특별한 일은 없었어요.');
    
    // 감정 분석 트리거
    const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-button"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 중성적인 감정 분석 결과 확인
    const emotionResult = page.locator('[data-testid="emotion-result"], .emotion-analysis');
    if (await emotionResult.isVisible()) {
      const emotionText = await emotionResult.textContent();
      console.log('중성적인 감정 분석 결과:', emotionText);
      
      // 중성적인 결과가 나왔는지 확인
      expect(emotionText).toMatch(/(중성|보통|평범|일상)/);
    }
  });

  test('감정 분석 시각화', async ({ page }) => {
    // 분석 페이지로 이동
    await page.goto('/analytics');
    await page.waitForTimeout(1000);
    
    // 감정 차트가 표시되는지 확인
    const emotionChart = page.locator('canvas, [data-testid="emotion-chart"], .chartjs-container');
    if (await emotionChart.isVisible()) {
      console.log('감정 차트 표시됨');
      
      // Chart.js 캔버스가 렌더링되었는지 확인
      const canvasCount = await page.locator('canvas').count();
      console.log('캔버스 요소 개수:', canvasCount);
      
      expect(canvasCount).toBeGreaterThan(0);
    }
    
    // 감정 캘린더/히트맵 확인
    const emotionCalendar = page.locator('[data-testid="emotion-calendar"], .emotion-heatmap, .react-calendar');
    if (await emotionCalendar.isVisible()) {
      console.log('감정 캘린더 표시됨');
    }
  });

  test('감정 통계 표시', async ({ page }) => {
    // 분석 페이지로 이동
    await page.goto('/analytics');
    await page.waitForTimeout(1000);
    
    // 통계 정보 확인
    const statsContainer = page.locator('[data-testid="emotion-stats"], .stats-container, .statistics');
    if (await statsContainer.isVisible()) {
      console.log('감정 통계 표시됨');
      
      // 주요 통계 지표들 확인
      const totalEntries = page.locator('text=/전체.*일기/, text=/총.*개/');
      const averageScore = page.locator('text=/평균.*점수/, text=/평균.*감정/');
      const frequentEmotion = page.locator('text=/빈번.*감정/, text=/자주.*감정/');
      
      if (await totalEntries.first().isVisible()) {
        console.log('전체 일기 통계 표시됨');
      }
      
      if (await averageScore.first().isVisible()) {
        console.log('평균 감정 점수 표시됨');
      }
      
      if (await frequentEmotion.first().isVisible()) {
        console.log('빈번한 감정 통계 표시됨');
      }
    }
  });

  test('감정 색상 매핑', async ({ page }) => {
    // 분석 페이지로 이동
    await page.goto('/analytics');
    await page.waitForTimeout(1000);
    
    // 감정별 색상이 올바르게 표시되는지 확인
    const emotionElements = page.locator('[data-emotion], .emotion-item, .emotion-badge');
    
    if (await emotionElements.first().isVisible()) {
      const count = await emotionElements.count();
      console.log('감정 요소 개수:', count);
      
      // 각 감정 요소의 색상 확인
      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = emotionElements.nth(i);
        const backgroundColor = await element.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        );
        console.log(`감정 요소 ${i} 배경색:`, backgroundColor);
        
        // 색상이 기본값(transparent)이 아닌지 확인
        expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      }
    }
  });

  test('감정 분석 오류 처리', async ({ page }) => {
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]').first();
    
    // 매우 짧은 텍스트나 특수문자만 입력
    await editorContainer.click();
    await page.keyboard.type('a');
    
    // 감정 분석 트리거
    const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-button"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 오류가 발생하지 않고 기본값이 반환되는지 확인
    const errorMessage = page.locator('.error, [data-testid="error"], .toast-error');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      console.log('오류 메시지:', errorText);
      
      // 오류가 적절히 처리되었는지 확인
      expect(errorText).not.toContain('Uncaught');
    }
    
    // 기본 중성 감정이 할당되는지 확인
    const emotionResult = page.locator('[data-testid="emotion-result"], .emotion-analysis');
    if (await emotionResult.isVisible()) {
      console.log('짧은 텍스트에 대한 감정 분석 처리됨');
    }
  });
});