import { test, expect } from '@playwright/test';

test.describe('새로 구현된 설정 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('테마 설정 기능 테스트', async ({ page }) => {
    // 설정 페이지에서 테마 선택자 찾기
    const themeSelect = page.locator('select').first();
    await expect(themeSelect).toBeVisible();

    // 현재 선택된 값 확인
    const currentTheme = await themeSelect.inputValue();
    console.log('현재 테마:', currentTheme);

    // 다크 테마로 변경
    await themeSelect.selectOption('dark');
    await page.waitForTimeout(1000);

    // 다크모드 클래스가 적용되었는지 확인
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);

    // 라이트 테마로 변경
    await themeSelect.selectOption('light');
    await page.waitForTimeout(1000);

    // 다크모드 클래스가 제거되었는지 확인
    await expect(htmlElement).not.toHaveClass(/dark/);
  });

  test('언어 설정 기능 테스트', async ({ page }) => {
    // 언어 선택자 찾기 (두 번째 select)
    const languageSelect = page.locator('select').nth(1);
    await expect(languageSelect).toBeVisible();

    // 현재 선택된 값 확인
    const currentLanguage = await languageSelect.inputValue();
    console.log('현재 언어:', currentLanguage);

    // 영어로 변경
    await languageSelect.selectOption('en');
    await page.waitForTimeout(1000);

    // 페이지 제목이 영어로 변경되었는지 확인
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toContainText('Settings');

    // 한국어로 다시 변경
    await languageSelect.selectOption('ko');
    await page.waitForTimeout(1000);

    // 페이지 제목이 한국어로 변경되었는지 확인
    await expect(pageTitle).toContainText('설정');
  });

  test('자동 저장 설정 테스트', async ({ page }) => {
    // 자동 저장 체크박스 찾기
    const autoSaveCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(autoSaveCheckbox).toBeVisible();

    // 체크박스 상태 확인
    const isChecked = await autoSaveCheckbox.isChecked();
    console.log('자동 저장 활성화 상태:', isChecked);

    // 체크박스 토글
    await autoSaveCheckbox.click();
    await page.waitForTimeout(500);

    // 상태가 변경되었는지 확인
    const newState = await autoSaveCheckbox.isChecked();
    expect(newState).toBe(!isChecked);

    // 자동 저장이 활성화된 경우 간격 설정이 보이는지 확인
    if (newState) {
      const intervalSelect = page.locator('select').last();
      await expect(intervalSelect).toBeVisible();
    }
  });

  test('알림 설정 테스트', async ({ page }) => {
    // 알림 설정 체크박스 찾기
    const notificationCheckbox = page.locator('input[id="notifications"]');
    await expect(notificationCheckbox).toBeVisible();

    // 체크박스 상태 확인
    const isChecked = await notificationCheckbox.isChecked();
    console.log('알림 활성화 상태:', isChecked);

    // 체크박스 토글
    await notificationCheckbox.click();
    await page.waitForTimeout(500);

    // 상태가 변경되었는지 확인
    const newState = await notificationCheckbox.isChecked();
    expect(newState).toBe(!isChecked);
  });

  test('백업 설정 테스트', async ({ page }) => {
    // 백업 설정 체크박스 찾기
    const backupCheckbox = page.locator('input[id="backupEnabled"]');
    await expect(backupCheckbox).toBeVisible();

    // 체크박스 상태 확인
    const isChecked = await backupCheckbox.isChecked();
    console.log('자동 백업 활성화 상태:', isChecked);

    // 체크박스 토글
    await backupCheckbox.click();
    await page.waitForTimeout(500);

    // 상태가 변경되었는지 확인
    const newState = await backupCheckbox.isChecked();
    expect(newState).toBe(!isChecked);
  });

  test('백업 생성 기능 테스트', async ({ page }) => {
    // 백업 생성 버튼 찾기
    const createBackupButton = page.getByRole('button', { name: '백업 생성' });
    await expect(createBackupButton).toBeVisible();

    // 백업 생성 버튼 클릭
    await createBackupButton.click();
    await page.waitForTimeout(2000);

    // 성공 메시지 확인 (토스트 알림)
    const successMessage = page.locator('.Toastify__toast--success, [role="alert"]');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
  });

  test('데이터 내보내기 기능 테스트', async ({ page }) => {
    // 데이터 내보내기 버튼 찾기
    const exportButton = page.getByRole('button', { name: '데이터 내보내기' });
    await expect(exportButton).toBeVisible();

    // 다운로드 이벤트 대기 설정
    const downloadPromise = page.waitForEvent('download');

    // 데이터 내보내기 버튼 클릭
    await exportButton.click();

    // 다운로드 완료 확인
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/ai-diary-backup-\d{4}-\d{2}-\d{2}\.json/);
  });

  test('설정 저장 기능 테스트', async ({ page }) => {
    // 설정 변경
    const themeSelect = page.locator('select').first();
    await themeSelect.selectOption('dark');

    // 설정 저장 버튼 찾기
    const saveButton = page.getByRole('button', { name: '설정 저장' });
    await expect(saveButton).toBeVisible();

    // 설정 저장 버튼 클릭
    await saveButton.click();
    await page.waitForTimeout(1000);

    // 성공 메시지 확인
    const successMessage = page.locator('.Toastify__toast--success, [role="alert"]');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });
});

test.describe('자동 저장 기능 E2E 테스트', () => {
  test('일기 작성 시 자동 저장 동작 확인', async ({ page }) => {
    // 설정에서 자동 저장 활성화
    await page.goto('/settings');
    const autoSaveCheckbox = page.locator('input[type="checkbox"]').first();
    
    if (!(await autoSaveCheckbox.isChecked())) {
      await autoSaveCheckbox.click();
      await page.waitForTimeout(500);
    }

    // 일기 작성 페이지로 이동
    await page.goto('/write');
    await page.waitForLoadState('networkidle');

    // 제목 입력
    const titleInput = page.locator('input[placeholder*="제목"]');
    await titleInput.fill('자동 저장 테스트');

    // 내용 입력
    const contentEditor = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]').first();
    await contentEditor.click();
    await contentEditor.fill('이것은 자동 저장 기능 테스트입니다.');

    // 자동 저장 상태 표시 확인 (최대 35초 대기)
    const autoSaveIndicator = page.locator('text="자동 저장됨"');
    await expect(autoSaveIndicator).toBeVisible({ timeout: 35000 });

    console.log('✅ 자동 저장 기능이 정상적으로 동작합니다');
  });
});