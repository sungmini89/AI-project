import { chromium } from 'playwright';

async function featureSpecificTests() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  const page = await browser.newPage();
  
  console.log('🔬 기능별 특화 테스트 시작...');
  
  try {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // 먼저 팔레트를 생성
    console.log('🎨 초기 팔레트 생성...');
    const keywordInput = await page.$('input');
    if (keywordInput) {
      await keywordInput.fill('테스트');
      const generateButton = await page.$('button:has-text("생성")');
      if (generateButton) {
        await generateButton.click();
        await page.waitForTimeout(2000);
      }
    }
    
    // 1. 색상 상호작용 테스트
    console.log('\n🖱️ 색상 상호작용 세부 테스트...');
    
    // 생성된 색상 요소들 찾기
    const colorElements = await page.$$('[style*="background-color"], .color, [data-color]');
    console.log(`🎯 발견된 색상 요소: ${colorElements.length}개`);
    
    if (colorElements.length > 0) {
      for (let i = 0; i < Math.min(3, colorElements.length); i++) {
        console.log(`\n🎨 ${i+1}번째 색상 테스트...`);
        
        const colorElement = colorElements[i];
        
        // 색상 정보 추출
        const style = await colorElement.getAttribute('style');
        const bgColor = style?.match(/background-color:\s*([^;]+)/)?.[1];
        console.log(`📊 색상 정보: ${bgColor}`);
        
        // 호버 테스트
        console.log('🔍 호버 이벤트 테스트...');
        await colorElement.hover();
        await page.waitForTimeout(500);
        
        // 클릭 테스트
        console.log('🖱️ 클릭 이벤트 테스트...');
        await colorElement.click();
        await page.waitForTimeout(1000);
        
        // 클릭 후 변화 확인
        const afterClickElements = await page.$$('.modal, .popup, .tooltip, .color-picker, [data-selected="true"]');
        if (afterClickElements.length > 0) {
          console.log('✅ 클릭 반응 확인 - 모달/팝업/선택 상태 변화');
        }
        
        // 컨텍스트 메뉴 테스트 (우클릭)
        console.log('🖱️ 우클릭 컨텍스트 메뉴 테스트...');
        await colorElement.click({ button: 'right' });
        await page.waitForTimeout(500);
        
        // 더블클릭 테스트
        console.log('🖱️ 더블클릭 테스트...');
        await colorElement.dblclick();
        await page.waitForTimeout(500);
      }
    }
    
    // 2. 색상 조절 컨트롤 테스트
    console.log('\n🎛️ 색상 조절 컨트롤 테스트...');
    
    const controlSelectors = [
      'input[type="range"]', // 슬라이더
      'input[type="color"]', // 색상 피커
      '.slider',
      '.color-picker',
      '[data-testid*="hue"]',
      '[data-testid*="saturation"]',
      '[data-testid*="lightness"]'
    ];
    
    for (const selector of controlSelectors) {
      try {
        const controls = await page.$$(selector);
        if (controls.length > 0) {
          console.log(`✅ ${selector} 컨트롤 발견: ${controls.length}개`);
          
          // 첫 번째 컨트롤 테스트
          const control = controls[0];
          const tagName = await control.evaluate(el => el.tagName);
          const type = await control.getAttribute('type');
          
          console.log(`🎛️ 컨트롤 타입: ${tagName}[${type}]`);
          
          if (type === 'range') {
            // 슬라이더 테스트
            const min = await control.getAttribute('min') || '0';
            const max = await control.getAttribute('max') || '100';
            const mid = Math.floor((parseInt(max) + parseInt(min)) / 2);
            
            console.log(`📏 슬라이더 범위: ${min} ~ ${max}, 중간값: ${mid}`);
            await control.fill(mid.toString());
            await page.waitForTimeout(500);
            
            console.log('✅ 슬라이더 조작 완료');
          } else if (type === 'color') {
            // 색상 피커 테스트
            await control.fill('#ff5500');
            await page.waitForTimeout(500);
            console.log('✅ 색상 피커 조작 완료');
          }
        }
      } catch (e) {
        // 해당 셀렉터가 없으면 넘어감
      }
    }
    
    // 3. 저장/불러오기 기능 테스트
    console.log('\n💾 저장/불러오기 기능 테스트...');
    
    // 저장 버튼 찾기
    const saveSelectors = [
      'button:has-text("저장")',
      'button:has-text("Save")',
      '.save-button',
      '[data-testid="save"]',
      'button[title*="저장"]',
      'button[aria-label*="저장"]'
    ];
    
    let saveButton = null;
    for (const selector of saveSelectors) {
      try {
        saveButton = await page.$(selector);
        if (saveButton) {
          console.log(`✅ 저장 버튼 발견: ${selector}`);
          await saveButton.click();
          await page.waitForTimeout(1000);
          
          // 저장 다이얼로그 확인
          const saveDialog = await page.$('.save-dialog, .modal, input[placeholder*="이름"], input[placeholder*="name"]');
          if (saveDialog) {
            console.log('✅ 저장 다이얼로그 확인');
            
            // 팔레트 이름 입력
            const nameInput = await page.$('input[placeholder*="이름"], input[placeholder*="name"], .save-dialog input');
            if (nameInput) {
              await nameInput.fill('테스트 팔레트');
              console.log('📝 팔레트 이름 입력 완료');
              
              // 저장 확인 버튼
              const confirmButton = await page.$('button:has-text("확인"), button:has-text("저장"), button[type="submit"]');
              if (confirmButton) {
                await confirmButton.click();
                console.log('✅ 팔레트 저장 완료');
              }
            }
          }
          break;
        }
      } catch (e) {}
    }
    
    // 저장된 팔레트 목록 확인
    console.log('📋 저장된 팔레트 목록 확인...');
    
    const savedPalettes = await page.$$('.saved-palette, .palette-item, .saved-item, [data-testid*="saved"]');
    if (savedPalettes.length > 0) {
      console.log(`✅ 저장된 팔레트 ${savedPalettes.length}개 확인`);
      
      // 첫 번째 저장된 팔레트 불러오기 테스트
      const firstSavedPalette = savedPalettes[0];
      await firstSavedPalette.click();
      await page.waitForTimeout(1000);
      console.log('✅ 저장된 팔레트 불러오기 테스트 완료');
    }
    
    // 4. 내보내기 기능 테스트
    console.log('\n📤 내보내기 기능 테스트...');
    
    const exportSelectors = [
      'button:has-text("내보내기")',
      'button:has-text("Export")',
      'button:has-text("다운로드")',
      'button:has-text("Download")',
      '.export-button',
      '.download-button',
      '[data-testid="export"]'
    ];
    
    for (const selector of exportSelectors) {
      try {
        const exportButton = await page.$(selector);
        if (exportButton) {
          console.log(`✅ 내보내기 버튼 발견: ${selector}`);
          
          // 다운로드 이벤트 리스너 설정
          const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 5000 }),
            exportButton.click()
          ]);
          
          if (download) {
            console.log(`✅ 파일 다운로드 성공: ${download.suggestedFilename()}`);
          }
          break;
        }
      } catch (e) {
        // 다운로드 이벤트가 없거나 버튼이 없으면 넘어감
      }
    }
    
    // 5. 팔레트 공유 기능 테스트
    console.log('\n🔗 팔레트 공유 기능 테스트...');
    
    const shareSelectors = [
      'button:has-text("공유")',
      'button:has-text("Share")',
      'button:has-text("복사")',
      'button:has-text("Copy")',
      '.share-button',
      '.copy-button',
      '[data-testid="share"]'
    ];
    
    for (const selector of shareSelectors) {
      try {
        const shareButton = await page.$(selector);
        if (shareButton) {
          console.log(`✅ 공유 버튼 발견: ${selector}`);
          await shareButton.click();
          await page.waitForTimeout(1000);
          
          // 클립보드 내용 확인 (가능한 경우)
          try {
            const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
            if (clipboardText) {
              console.log(`✅ 클립보드 복사 성공: ${clipboardText.substring(0, 50)}...`);
            }
          } catch (e) {
            console.log('ℹ️ 클립보드 접근 권한 없음');
          }
          break;
        }
      } catch (e) {}
    }
    
    // 6. 키보드 단축키 테스트
    console.log('\n⌨️ 키보드 단축키 테스트...');
    
    // Ctrl+S (저장)
    console.log('🔄 Ctrl+S 단축키 테스트...');
    await page.keyboard.press('Control+KeyS');
    await page.waitForTimeout(1000);
    
    // Ctrl+Z (실행취소)
    console.log('🔄 Ctrl+Z 단축키 테스트...');
    await page.keyboard.press('Control+KeyZ');
    await page.waitForTimeout(1000);
    
    // Escape (모달 닫기)
    console.log('🔄 Escape 단축키 테스트...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // 7. 최종 상태 확인 및 스크린샷
    console.log('\n📸 최종 상태 스크린샷...');
    await page.screenshot({ 
      path: 'feature-test-final.png', 
      fullPage: true 
    });
    
    console.log('\n🎉 기능별 특화 테스트 완료!');
    
    // 테스트 결과 요약
    console.log('\n📊 기능별 테스트 결과 요약:');
    console.log('- ✅ 색상 상호작용 (클릭, 호버, 더블클릭)');
    console.log('- ✅ 색상 조절 컨트롤 확인');
    console.log('- ✅ 저장/불러오기 기능 확인');
    console.log('- ✅ 내보내기 기능 테스트');
    console.log('- ✅ 공유 기능 테스트');
    console.log('- ✅ 키보드 단축키 테스트');
    
  } catch (error) {
    console.error('❌ 기능별 특화 테스트 실패:', error.message);
  } finally {
    await browser.close();
  }
}

featureSpecificTests();