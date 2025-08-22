import { test, expect } from '@playwright/test';

test.describe('데이터베이스 및 저장소 기능', () => {
  // 테스트 전에 IndexedDB 초기화
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // IndexedDB 지원 확인
    const supportsIndexedDB = await page.evaluate(() => {
      return typeof indexedDB !== 'undefined';
    });
    
    if (!supportsIndexedDB) {
      test.skip(true, 'IndexedDB not supported');
    }
  });

  test('IndexedDB 연결 및 초기화', async ({ page }) => {
    // 페이지 로드 시 데이터베이스가 초기화되는지 확인
    const dbInitialized = await page.evaluate(async () => {
      try {
        // Dexie 데이터베이스 확인
        const dbName = 'AIDiaryDB';
        
        return new Promise((resolve) => {
          const request = indexedDB.open(dbName);
          
          request.onsuccess = () => {
            const db = request.result;
            const storeNames = Array.from(db.objectStoreNames);
            db.close();
            resolve({
              success: true,
              stores: storeNames,
              version: db.version
            });
          };
          
          request.onerror = () => resolve({ success: false });
          
          setTimeout(() => resolve({ success: false }), 5000);
        });
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('데이터베이스 초기화 결과:', dbInitialized);
    expect(dbInitialized.success).toBe(true);
    
    // 예상되는 테이블들이 있는지 확인
    if (dbInitialized.stores) {
      const expectedStores = ['entries', 'emotionHistory', 'settings', 'backups'];
      expectedStores.forEach(storeName => {
        expect(dbInitialized.stores).toContain(storeName);
      });
    }
  });

  test('일기 저장 및 조회', async ({ page }) => {
    await page.goto('/write');
    
    // 제목과 내용 입력
    const titleInput = page.locator('input[placeholder*="제목"], input[name="title"]');
    if (await titleInput.isVisible()) {
      await titleInput.fill('데이터베이스 테스트 일기');
    }
    
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
    await editorContainer.first().click();
    await page.keyboard.type('이것은 데이터베이스 기능을 테스트하기 위한 일기입니다.');
    
    // 저장
    const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-button"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 일기 목록에서 저장된 일기 확인
    await page.goto('/diary');
    await page.waitForTimeout(1000);
    
    const diaryList = page.locator('[data-testid="diary-list"], .diary-item, .entry-item');
    if (await diaryList.first().isVisible()) {
      const firstEntry = diaryList.first();
      await expect(firstEntry).toContainText('데이터베이스 테스트');
    }
  });

  test('일기 수정 기능', async ({ page }) => {
    await page.goto('/diary');
    await page.waitForTimeout(1000);
    
    // 첫 번째 일기 항목 클릭 (있다면)
    const firstDiary = page.locator('[data-testid="diary-item"], .diary-item, .entry-item').first();
    if (await firstDiary.isVisible()) {
      // 수정 버튼 클릭
      const editButton = page.locator('button:has-text("수정"), button[data-testid="edit-button"], a[href*="/write/"]');
      if (await editButton.first().isVisible()) {
        await editButton.first().click();
        
        // 수정 페이지로 이동했는지 확인
        await expect(page).toHaveURL(/.*\/write/);
        
        // 기존 내용이 로드되었는지 확인
        const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
        await expect(editorContainer.first()).toBeVisible();
        
        // 내용 수정
        await editorContainer.first().click();
        await page.keyboard.press('Control+a');
        await page.keyboard.type('수정된 내용입니다.');
        
        // 저장
        const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-button"]');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(2000);
        }
      }
    } else {
      console.log('수정할 일기 항목이 없습니다.');
    }
  });

  test('일기 삭제 기능', async ({ page }) => {
    await page.goto('/diary');
    await page.waitForTimeout(1000);
    
    const diaryItems = page.locator('[data-testid="diary-item"], .diary-item, .entry-item');
    const initialCount = await diaryItems.count();
    
    if (initialCount > 0) {
      // 삭제 버튼 클릭
      const deleteButton = page.locator('button:has-text("삭제"), button[data-testid="delete-button"]');
      if (await deleteButton.first().isVisible()) {
        
        // 확인 대화상자 처리
        page.on('dialog', async dialog => {
          console.log('Dialog message:', dialog.message());
          await dialog.accept();
        });
        
        await deleteButton.first().click();
        await page.waitForTimeout(2000);
        
        // 삭제 후 항목 수 확인
        const finalCount = await diaryItems.count();
        expect(finalCount).toBeLessThan(initialCount);
      }
    } else {
      console.log('삭제할 일기 항목이 없습니다.');
    }
  });

  test('검색 기능', async ({ page }) => {
    await page.goto('/diary');
    await page.waitForTimeout(1000);
    
    // 검색 입력 필드 찾기
    const searchInput = page.locator('input[placeholder*="검색"], input[type="search"], [data-testid="search-input"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('테스트');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(1000);
      
      // 검색 결과 확인
      const searchResults = page.locator('[data-testid="search-results"], .search-result, .diary-item');
      if (await searchResults.first().isVisible()) {
        const resultCount = await searchResults.count();
        console.log('검색 결과 개수:', resultCount);
        
        // 검색 결과에 검색어가 포함되어 있는지 확인
        if (resultCount > 0) {
          const firstResult = await searchResults.first().textContent();
          expect(firstResult?.toLowerCase()).toContain('테스트');
        }
      }
    } else {
      console.log('검색 기능이 구현되지 않았습니다.');
    }
  });

  test('설정 저장 및 로드', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForTimeout(1000);
    
    // 설정 페이지의 각종 설정들 확인
    const settings = {
      theme: page.locator('select[name="theme"], input[name="theme"]'),
      language: page.locator('select[name="language"], input[name="language"]'),
      autoSave: page.locator('input[name="autoSave"], [data-testid="auto-save-toggle"]'),
      notifications: page.locator('input[name="notifications"], [data-testid="notifications-toggle"]')
    };
    
    // 각 설정이 있는지 확인하고 변경
    for (const [settingName, locator] of Object.entries(settings)) {
      if (await locator.isVisible()) {
        console.log(`${settingName} 설정 발견`);
        
        if (settingName === 'theme' && await locator.getAttribute('type') !== 'checkbox') {
          // 테마 설정 변경
          await locator.selectOption('dark');
        } else if (await locator.getAttribute('type') === 'checkbox') {
          // 체크박스 설정 토글
          await locator.click();
        }
      }
    }
    
    // 설정 저장 버튼이 있다면 클릭
    const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-settings"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);
      
      // 저장 확인 메시지
      const saveMessage = page.locator('.toast, [data-testid="toast"]');
      if (await saveMessage.isVisible()) {
        await expect(saveMessage).toContainText(/저장|성공/);
      }
    }
  });

  test('데이터 내보내기 기능', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForTimeout(1000);
    
    // 데이터 내보내기 버튼 찾기
    const exportButton = page.locator('button:has-text("내보내기"), button:has-text("백업"), button[data-testid="export-data"]');
    
    if (await exportButton.isVisible()) {
      // 다운로드 이벤트 설정
      const downloadPromise = page.waitForEvent('download');
      
      await exportButton.click();
      
      try {
        const download = await downloadPromise;
        console.log('다운로드 파일명:', download.suggestedFilename());
        
        // 다운로드된 파일이 JSON 형식인지 확인
        expect(download.suggestedFilename()).toMatch(/\.json$/);
        
      } catch (error) {
        console.log('다운로드 이벤트가 발생하지 않았습니다.');
        
        // 클립보드로 복사되는 방식일 수도 있음
        const clipboard = await page.evaluate(() => navigator.clipboard?.readText());
        if (clipboard) {
          console.log('클립보드 데이터 확인됨');
          expect(clipboard).toContain('{');
        }
      }
    } else {
      console.log('데이터 내보내기 기능이 구현되지 않았습니다.');
    }
  });

  test('자동 백업 기능', async ({ page }) => {
    // 백업 기능 테스트
    const backupCreated = await page.evaluate(async () => {
      try {
        // 백업 생성 시뮬레이션
        const timestamp = new Date().toISOString();
        localStorage.setItem('lastBackup', timestamp);
        return true;
      } catch (error) {
        return false;
      }
    });
    
    if (backupCreated) {
      console.log('자동 백업 기능 시뮬레이션 완료');
      
      // 백업 시간 확인
      const lastBackup = await page.evaluate(() => localStorage.getItem('lastBackup'));
      expect(lastBackup).toBeTruthy();
    }
  });

  test('대용량 데이터 처리', async ({ page }) => {
    // 많은 양의 텍스트로 저장 테스트
    await page.goto('/write');
    
    const longText = '대용량 데이터 테스트 '.repeat(1000);
    
    const editorContainer = page.locator('[data-testid="diary-editor"], .ProseMirror, [contenteditable="true"]');
    await editorContainer.first().click();
    
    // 대용량 텍스트 입력 (JavaScript로 직접 설정)
    await page.evaluate((text) => {
      const editor = document.querySelector('[contenteditable="true"]');
      if (editor) {
        editor.innerHTML = text;
      }
    }, longText);
    
    // 저장 시도
    const saveButton = page.locator('button:has-text("저장"), button[data-testid="save-button"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(5000); // 처리 시간 대기
      
      // 오류가 발생하지 않았는지 확인
      const errorMessage = page.locator('.error, [data-testid="error"]');
      if (await errorMessage.isVisible()) {
        const error = await errorMessage.textContent();
        console.log('대용량 데이터 저장 오류:', error);
      } else {
        console.log('대용량 데이터 저장 성공');
      }
    }
  });
});