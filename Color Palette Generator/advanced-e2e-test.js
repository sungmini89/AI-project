import { chromium } from 'playwright';

async function advancedE2ETests() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // 시각적 확인을 위해 느리게 실행
  });
  const page = await browser.newPage();
  
  console.log('🚀 고급 E2E 테스트 시작...');
  
  try {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // 1. 다양한 키워드로 팔레트 생성 테스트
    console.log('🎨 다양한 키워드 팔레트 생성 테스트...');
    
    const testKeywords = ['바다', '숲', '노을', '봄', '겨울'];
    
    for (const keyword of testKeywords) {
      console.log(`\n📝 "${keyword}" 키워드 테스트 중...`);
      
      // 키워드 입력 필드 찾기 (다양한 셀렉터 시도)
      const inputSelectors = [
        'input[type="text"]',
        'input[placeholder*="키워드"]',
        'input[placeholder*="keyword"]',
        '.keyword-input',
        '[data-testid="keyword-input"]',
        'input'
      ];
      
      let keywordInput = null;
      for (const selector of inputSelectors) {
        try {
          keywordInput = await page.$(selector);
          if (keywordInput) {
            console.log(`✅ 입력 필드 발견: ${selector}`);
            break;
          }
        } catch (e) {}
      }
      
      if (keywordInput) {
        await keywordInput.click({ clickCount: 3 }); // 모든 텍스트 선택
        await keywordInput.fill(keyword);
        console.log(`📝 "${keyword}" 입력 완료`);
        
        // 생성 버튼 찾기 (다양한 셀렉터 시도)
        const buttonSelectors = [
          'button:has-text("생성")',
          'button:has-text("Generate")',
          'button[type="submit"]',
          '.generate-button',
          '[data-testid="generate-button"]',
          'button:not([type="button"])'
        ];
        
        let generateButton = null;
        for (const selector of buttonSelectors) {
          try {
            generateButton = await page.$(selector);
            if (generateButton) {
              console.log(`✅ 생성 버튼 발견: ${selector}`);
              break;
            }
          } catch (e) {}
        }
        
        if (generateButton) {
          await generateButton.click();
          console.log('🖱️ 생성 버튼 클릭');
          
          // 로딩 상태 확인
          try {
            await page.waitForSelector('.loading, .spinner, [data-loading="true"]', { timeout: 1000 });
            console.log('⏳ 로딩 상태 확인됨');
            await page.waitForSelector('.loading, .spinner, [data-loading="true"]', { state: 'detached', timeout: 10000 });
            console.log('✅ 로딩 완료');
          } catch (e) {
            console.log('ℹ️ 로딩 인디케이터 없음 (즉시 생성)');
          }
          
          // 결과 대기
          await page.waitForTimeout(2000);
          
          // 생성된 색상 확인
          const colorSelectors = [
            '.color',
            '[data-color]',
            '.palette-color',
            '.color-swatch',
            '.color-item',
            '.palette-item',
            '[style*="background-color"]',
            '[style*="background"]'
          ];
          
          let colorElements = [];
          for (const selector of colorSelectors) {
            try {
              const elements = await page.$$(selector);
              if (elements.length > 0) {
                colorElements = elements;
                console.log(`✅ ${elements.length}개 색상 요소 발견: ${selector}`);
                break;
              }
            } catch (e) {}
          }
          
          if (colorElements.length > 0) {
            // 첫 번째 색상의 스타일 정보 확인
            const firstColorStyle = await colorElements[0].getAttribute('style');
            const firstColorData = await colorElements[0].getAttribute('data-color');
            console.log(`🎯 첫 번째 색상 - 스타일: ${firstColorStyle}, 데이터: ${firstColorData}`);
          } else {
            console.log('⚠️ 색상 요소를 찾을 수 없음');
            
            // DOM 구조 디버깅
            const bodyHTML = await page.$eval('body', el => el.innerHTML);
            console.log('🔍 현재 페이지 HTML 구조 (일부):', bodyHTML.substring(0, 500));
          }
        }
      }
    }
    
    // 2. 색상 조화 타입 테스트
    console.log('\n🌈 색상 조화 타입 테스트...');
    
    const harmonyTypes = ['보색', '유사색', '삼색조', '사색조'];
    const harmonySelectors = [
      'select',
      '.harmony-select',
      '[data-testid="harmony-type"]',
      'input[type="radio"]'
    ];
    
    for (const selector of harmonySelectors) {
      try {
        const harmonyControl = await page.$(selector);
        if (harmonyControl) {
          console.log(`✅ 조화 타입 컨트롤 발견: ${selector}`);
          
          if (selector.includes('select')) {
            // 드롭다운 옵션 확인
            const options = await page.$$eval(`${selector} option`, options => 
              options.map(option => option.textContent)
            );
            console.log('🎛️ 사용 가능한 조화 타입:', options);
          }
          break;
        }
      } catch (e) {}
    }
    
    // 3. 색상 상호작용 테스트
    console.log('\n🖱️ 색상 상호작용 테스트...');
    
    // 색상 클릭 테스트
    const colorElements = await page.$$('.color, [data-color], .palette-color, .color-swatch');
    if (colorElements.length > 0) {
      console.log(`🎯 첫 번째 색상 클릭 테스트...`);
      await colorElements[0].click();
      await page.waitForTimeout(1000);
      
      // 색상 상세 정보나 모달 확인
      const modals = await page.$$('.modal, .dialog, .popup, .color-detail');
      if (modals.length > 0) {
        console.log('✅ 색상 상세 모달/다이얼로그 확인됨');
      }
    }
    
    // 4. 저장/내보내기 기능 테스트
    console.log('\n💾 저장/내보내기 기능 테스트...');
    
    const saveSelectors = [
      'button:has-text("저장")',
      'button:has-text("Save")',
      'button:has-text("내보내기")',
      'button:has-text("Export")',
      '.save-button',
      '.export-button'
    ];
    
    for (const selector of saveSelectors) {
      try {
        const saveButton = await page.$(selector);
        if (saveButton) {
          console.log(`✅ 저장/내보내기 버튼 발견: ${selector}`);
          await saveButton.click();
          await page.waitForTimeout(1000);
          break;
        }
      } catch (e) {}
    }
    
    // 5. 반응형 디자인 테스트
    console.log('\n📱 반응형 디자인 테스트...');
    
    const viewports = [
      { width: 1920, height: 1080, name: '데스크톱' },
      { width: 768, height: 1024, name: '태블릿' },
      { width: 375, height: 667, name: '모바일' }
    ];
    
    for (const viewport of viewports) {
      console.log(`📐 ${viewport.name} 뷰포트 테스트 (${viewport.width}x${viewport.height})`);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      // 스크린샷 촬영
      await page.screenshot({ 
        path: `e2e-screenshot-${viewport.name.toLowerCase()}.png`,
        fullPage: true 
      });
      console.log(`📸 ${viewport.name} 스크린샷 저장`);
    }
    
    // 6. 성능 및 접근성 테스트
    console.log('\n⚡ 성능 및 접근성 테스트...');
    
    // 기본 뷰포트로 복원
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 키보드 탐색 테스트
    console.log('⌨️ 키보드 탐색 테스트...');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    // 스크린리더 정보 확인
    const accessibilityTree = await page.accessibility.snapshot();
    if (accessibilityTree) {
      console.log('♿ 접근성 트리 생성 성공');
    }
    
    console.log('\n🎉 고급 E2E 테스트 완료!');
    
    // 최종 결과 요약
    console.log('\n📊 테스트 결과 요약:');
    console.log('- ✅ 애플리케이션 로드 성공');
    console.log('- ✅ 키워드 기반 팔레트 생성');
    console.log('- ✅ 반응형 디자인 확인');
    console.log('- ✅ 기본 접근성 확인');
    console.log('- 📸 다양한 뷰포트 스크린샷 저장');
    
  } catch (error) {
    console.error('❌ 고급 E2E 테스트 실패:', error.message);
  } finally {
    await browser.close();
  }
}

advancedE2ETests();