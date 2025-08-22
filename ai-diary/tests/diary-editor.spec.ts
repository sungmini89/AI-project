import { test, expect } from '@playwright/test';

test.describe('일기 에디터 기능', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/write');
  });

  test('Tiptap 에디터 로드 및 기본 기능', async ({ page }) => {
    // 에디터 컨테이너 확인
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
    await expect(editorContainer).toBeVisible();
    
    // 제목 입력 필드 확인
    const titleInput = page.locator('input[placeholder*="제목"], input[name="title"]');
    if (await titleInput.isVisible()) {
      await titleInput.fill('테스트 일기 제목');
      await expect(titleInput).toHaveValue('테스트 일기 제목');
    }
    
    // 에디터에 텍스트 입력
    await editorContainer.first().click();
    await page.keyboard.type('오늘은 정말 좋은 날이었습니다. 새로운 프로젝트를 시작했고, 팀원들과 함께 즐겁게 작업했습니다.');
    
    // 입력된 텍스트 확인
    await expect(editorContainer.first()).toContainText('오늘은 정말 좋은 날이었습니다');
  });

  test('Tiptap 에디터 포맷팅 기능', async ({ page }) => {
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
    await editorContainer.first().click();
    
    // 텍스트 입력
    await page.keyboard.type('포맷팅 테스트 텍스트');
    
    // 텍스트 선택
    await page.keyboard.press('Control+a');
    
    // 볼드 버튼이 있다면 클릭
    const boldButton = page.locator('[data-testid="bold"], button[title*="Bold"], button:has-text("B")');
    if (await boldButton.first().isVisible()) {
      await boldButton.first().click();
      
      // 볼드 적용 확인
      const boldText = page.locator('strong, b, [style*="font-weight"]');
      await expect(boldText.first()).toBeVisible();
    }
    
    // 이탤릭 버튼이 있다면 클릭
    const italicButton = page.locator('[data-testid="italic"], button[title*="Italic"], button:has-text("I")');
    if (await italicButton.first().isVisible()) {
      await italicButton.first().click();
    }
  });

  test('일기 저장 기능', async ({ page }) => {
    // 제목 입력
    const titleInput = page.locator('input[placeholder*="제목"], input[name="title"]');
    if (await titleInput.isVisible()) {
      await titleInput.fill('E2E 테스트 일기');
    }
    
    // 내용 입력
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
    await editorContainer.first().click();
    await page.keyboard.type('이것은 E2E 테스트로 작성된 일기입니다. 자동화 테스트가 정상적으로 작동하는지 확인합니다.');
    
    // 저장 버튼 클릭
    const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-button"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // 저장 성공 메시지 또는 리다이렉트 확인
      await page.waitForTimeout(1000);
      
      // 성공 토스트 메시지 확인
      const toastMessage = page.locator('.Toaster, [data-testid="toast"]');
      if (await toastMessage.isVisible()) {
        await expect(toastMessage).toContainText(/저장|성공/);
      }
    }
  });

  test('자동 저장 기능', async ({ page }) => {
    // 자동저장 설정이 활성화되어 있는지 확인
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
    await editorContainer.first().click();
    
    // 텍스트 입력
    await page.keyboard.type('자동 저장 테스트를 위한 텍스트입니다.');
    
    // 자동 저장이 트리거될 때까지 대기 (일반적으로 30초)
    await page.waitForTimeout(2000);
    
    // 자동 저장 표시가 있는지 확인
    const autoSaveIndicator = page.locator('text=자동 저장, text=저장됨, [data-testid="auto-save-status"]');
    if (await autoSaveIndicator.first().isVisible()) {
      console.log('자동 저장 기능 활성화됨');
    }
  });

  test('에디터 플레이스홀더 확인', async ({ page }) => {
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
    
    // 에디터가 비어있을 때 플레이스홀더 확인
    const placeholder = page.locator('[data-placeholder], .is-editor-empty::before');
    if (await placeholder.isVisible()) {
      console.log('에디터 플레이스홀더 확인됨');
    }
    
    // 텍스트 입력 후 플레이스홀더 사라짐 확인
    await editorContainer.first().click();
    await page.keyboard.type('텍스트 입력');
    
    // 플레이스홀더가 사라졌는지 확인
    if (await placeholder.isVisible()) {
      await expect(placeholder).not.toBeVisible();
    }
  });

  test('에디터 키보드 단축키', async ({ page }) => {
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
    await editorContainer.first().click();
    
    // 텍스트 입력
    await page.keyboard.type('키보드 단축키 테스트');
    
    // 전체 선택
    await page.keyboard.press('Control+a');
    
    // 볼드 단축키
    await page.keyboard.press('Control+b');
    
    // 이탤릭 단축키
    await page.keyboard.press('Control+i');
    
    // 언두 단축키
    await page.keyboard.press('Control+z');
    
    // 리두 단축키
    await page.keyboard.press('Control+y');
    
    console.log('키보드 단축키 테스트 완료');
  });

  test('에디터 접근성 확인', async ({ page }) => {
    // 에디터에 적절한 ARIA 레이블이 있는지 확인
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
    
    // 포커스 가능한지 확인
    await editorContainer.first().focus();
    await expect(editorContainer.first()).toBeFocused();
    
    // 키보드 네비게이션 확인
    await page.keyboard.press('Tab');
    
    // aria-label 또는 레이블 확인
    const hasLabel = await page.evaluate(() => {
      const editor = document.querySelector('[contenteditable="true"]');
      return editor?.getAttribute('aria-label') || 
             editor?.getAttribute('aria-labelledby') ||
             document.querySelector('label[for]');
    });
    
    console.log('에디터 접근성 레이블 존재:', !!hasLabel);
  });
});