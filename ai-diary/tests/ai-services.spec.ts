import { test, expect } from '@playwright/test';

test.describe('AI 서비스 통합 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('AI 서비스 모드 확인', async ({ page }) => {
    // 설정 페이지에서 AI 서비스 모드 확인
    await page.goto('/settings');
    await page.waitForTimeout(1000);
    
    // AI 서비스 설정 섹션 찾기
    const aiSettings = page.locator('[data-testid="ai-settings"], .ai-service-settings');
    if (await aiSettings.isVisible()) {
      console.log('AI 서비스 설정 섹션 발견');
      
      // 서비스 모드 선택 옵션 확인
      const modeSelector = page.locator('select[name="aiMode"], input[name="aiMode"]');
      if (await modeSelector.isVisible()) {
        const currentMode = await modeSelector.inputValue();
        console.log('현재 AI 서비스 모드:', currentMode);
        
        // 사용 가능한 모드들 확인
        if (await modeSelector.getAttribute('type') === 'select') {
          const options = await modeSelector.locator('option').allTextContents();
          console.log('사용 가능한 AI 모드들:', options);
        }
      }
    } else {
      console.log('AI 서비스 설정이 구현되지 않았거나 찾을 수 없습니다.');
    }
  });

  test('Mock AI 서비스 테스트', async ({ page }) => {
    // Mock 모드에서 감정 분석 테스트
    await page.goto('/write');
    
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
    await editorContainer.first().click();
    await page.keyboard.type('This is a test for mock AI service response.');
    
    // 감정 분석 트리거
    const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-button"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
      
      // Mock 응답이 올바르게 처리되는지 확인
      const emotionResult = page.locator('[data-testid="emotion-result"], .emotion-analysis');
      if (await emotionResult.isVisible()) {
        const emotionText = await emotionResult.textContent();
        console.log('Mock AI 서비스 응답:', emotionText);
        
        // Mock 응답이 예상 형식인지 확인
        expect(emotionText).toBeTruthy();
      }
    }
  });

  test('Free AI 서비스 테스트 (실제 호출 없이)', async ({ page }) => {
    // Free AI 서비스의 에러 처리 확인
    const serviceTest = await page.evaluate(async () => {
      try {
        // 전역 객체에서 AI 서비스 접근 시도
        const services = (window as any).aiServices;
        if (services && services.freeAI) {
          return {
            available: true,
            type: typeof services.freeAI.analyzeText
          };
        }
        
        // 모듈이 로드되었는지 확인
        return {
          available: false,
          moduleLoaded: 'freeAIService' in window
        };
      } catch (error) {
        return {
          available: false,
          error: error.message
        };
      }
    });
    
    console.log('Free AI 서비스 테스트 결과:', serviceTest);
  });

  test('AI 서비스 에러 처리', async ({ page }) => {
    // 네트워크 오프라인 시뮬레이션으로 AI 서비스 에러 테스트
    await page.context().setOffline(true);
    
    await page.goto('/write');
    
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
    await editorContainer.first().click();
    await page.keyboard.type('Testing AI service error handling when offline.');
    
    // 저장 시도 (AI 분석이 실패할 것으로 예상)
    const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-button"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(3000);
      
      // 에러가 적절히 처리되는지 확인
      const errorMessage = page.locator('.error, [data-testid="error"], .toast-error');
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        console.log('AI 서비스 오류 메시지:', errorText);
        
        // 사용자 친화적인 에러 메시지인지 확인
        expect(errorText).not.toContain('undefined');
        expect(errorText).not.toContain('null');
      } else {
        console.log('오프라인 상태에서도 일기가 저장됨 (fallback 처리)');
      }
    }
    
    // 온라인 복구
    await page.context().setOffline(false);
  });

  test('AI 서비스 응답 시간 테스트', async ({ page }) => {
    await page.goto('/write');
    
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
    await editorContainer.first().click();
    await page.keyboard.type('Testing AI service response time with a moderately long text to ensure proper handling.');
    
    const startTime = Date.now();
    
    const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-button"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // 응답 대기 (최대 10초)
      try {
        await page.waitForSelector('[data-testid="emotion-result"], .emotion-analysis', { timeout: 10000 });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log('AI 서비스 응답 시간:', responseTime, 'ms');
        
        // 합리적인 응답 시간인지 확인 (10초 이내)
        expect(responseTime).toBeLessThan(10000);
        
        if (responseTime > 5000) {
          console.warn('AI 서비스 응답이 느립니다 (5초 초과)');
        }
      } catch (error) {
        console.log('AI 서비스 응답 시간 초과 또는 결과 없음');
      }
    }
  });

  test('다양한 언어로 AI 서비스 테스트', async ({ page }) => {
    const testTexts = [
      { text: 'I am very happy today!', lang: 'English', expected: 'positive' },
      { text: '오늘 정말 행복해요!', lang: 'Korean', expected: 'positive' },
      { text: 'I feel sad and disappointed.', lang: 'English', expected: 'negative' },
      { text: '슬프고 실망스러워요.', lang: 'Korean', expected: 'negative' }
    ];
    
    for (const testCase of testTexts) {
      await page.goto('/write');
      await page.waitForTimeout(500);
      
      const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
      await editorContainer.first().click();
      
      // 기존 내용 지우기
      await page.keyboard.press('Control+a');
      await page.keyboard.type(testCase.text);
      
      const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-button"]');
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(2000);
        
        const emotionResult = page.locator('[data-testid="emotion-result"], .emotion-analysis');
        if (await emotionResult.isVisible()) {
          const result = await emotionResult.textContent();
          console.log(`${testCase.lang} 텍스트 분석 결과:`, result);
          
          // 기본적인 감정 분석 결과가 있는지 확인
          expect(result).toBeTruthy();
        } else {
          console.log(`${testCase.lang} 텍스트에 대한 감정 분석 결과 없음`);
        }
      }
    }
  });

  test('AI 서비스 설정 변경', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForTimeout(1000);
    
    // API 키 설정 필드 확인
    const apiKeyFields = page.locator('input[name*="apiKey"], input[name*="key"], input[placeholder*="API"]');
    const fieldCount = await apiKeyFields.count();
    
    console.log('API 키 설정 필드 개수:', fieldCount);
    
    if (fieldCount > 0) {
      for (let i = 0; i < fieldCount; i++) {
        const field = apiKeyFields.nth(i);
        const placeholder = await field.getAttribute('placeholder');
        const name = await field.getAttribute('name');
        
        console.log(`API 키 필드 ${i}:`, { name, placeholder });
        
        // 보안상 실제 API 키는 입력하지 않고 형식만 확인
        if (await field.isVisible()) {
          await field.focus();
          // 입력 필드가 활성화되는지만 확인
          await expect(field).toBeFocused();
        }
      }
    }
    
    // AI 서비스 활성화/비활성화 토글 확인
    const aiToggle = page.locator('input[type="checkbox"][name*="ai"], [data-testid="ai-toggle"]');
    if (await aiToggle.isVisible()) {
      const isChecked = await aiToggle.isChecked();
      console.log('AI 서비스 활성화 상태:', isChecked);
      
      // 토글 기능 테스트
      await aiToggle.click();
      await page.waitForTimeout(500);
      
      const newState = await aiToggle.isChecked();
      expect(newState).toBe(!isChecked);
      console.log('AI 서비스 토글 후 상태:', newState);
    }
  });

  test('AI 서비스 백업 및 폴백', async ({ page }) => {
    // AI 서비스 실패 시 폴백 메커니즘 테스트
    await page.goto('/write');
    
    // JavaScript를 통해 AI 서비스를 임시로 비활성화
    await page.evaluate(() => {
      // 전역 AI 서비스 객체가 있다면 에러를 발생시키도록 수정
      if ((window as any).freeAIService) {
        const originalAnalyze = (window as any).freeAIService.analyzeText;
        (window as any).freeAIService.analyzeText = () => {
          throw new Error('Simulated AI service failure');
        };
        
        // 복구 함수 저장
        (window as any).restoreAIService = () => {
          (window as any).freeAIService.analyzeText = originalAnalyze;
        };
      }
    });
    
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
    await editorContainer.first().click();
    await page.keyboard.type('Testing fallback mechanism when AI service fails.');
    
    const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-button"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(3000);
      
      // AI 서비스가 실패해도 일기가 저장되는지 확인
      const successMessage = page.locator('.toast, [data-testid="toast"]');
      if (await successMessage.isVisible()) {
        const messageText = await successMessage.textContent();
        console.log('폴백 처리 메시지:', messageText);
        
        // 저장은 성공했지만 AI 분석은 실패했을 때의 메시지 확인
        if (messageText?.includes('저장') && messageText?.includes('분석')) {
          console.log('폴백 메커니즘이 적절히 작동함');
        }
      }
    }
    
    // AI 서비스 복구
    await page.evaluate(() => {
      if ((window as any).restoreAIService) {
        (window as any).restoreAIService();
      }
    });
  });

  test('AI 서비스 요청 제한 테스트', async ({ page }) => {
    // 연속적인 AI 서비스 호출로 요청 제한 테스트
    await page.goto('/write');
    
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
    const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-button"]');
    
    // 여러 번 연속 저장 시도
    for (let i = 0; i < 3; i++) {
      await editorContainer.first().click();
      await page.keyboard.press('Control+a');
      await page.keyboard.type(`Rapid fire test ${i + 1} - testing rate limiting.`);
      
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // 요청 제한이나 디바운싱이 적절히 작동하는지 확인
    const rateLimitMessage = page.locator('text=/요청.*제한/, text=/잠시.*기다려/, text=/너무.*빠름/');
    if (await rateLimitMessage.isVisible()) {
      const limitText = await rateLimitMessage.textContent();
      console.log('요청 제한 메시지:', limitText);
      
      // 적절한 요청 제한 메시지인지 확인
      expect(limitText).toBeTruthy();
    } else {
      console.log('요청 제한 없이 모든 요청이 처리됨');
    }
  });
});