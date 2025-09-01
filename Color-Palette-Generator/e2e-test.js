import { chromium } from 'playwright';

async function runE2ETests() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🚀 E2E 테스트 시작...');
  
  try {
    // 1. 애플리케이션 로드 테스트
    console.log('📱 애플리케이션 로드 중...');
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#root', { timeout: 10000 });
    console.log('✅ 애플리케이션 로드 성공');
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log('📄 페이지 제목:', title);
    
    // 2. 메인 컴포넌트 확인
    console.log('🔍 메인 컴포넌트 확인 중...');
    
    // 헤더 확인
    const header = await page.$('header, h1');
    if (header) {
      const headerText = await header.textContent();
      console.log('✅ 헤더 발견:', headerText);
    }
    
    // 3. 팔레트 생성 기능 테스트
    console.log('🎨 팔레트 생성 기능 테스트 중...');
    
    // 키워드 입력 필드 찾기
    const keywordInput = await page.$('input[type="text"], input[placeholder*="키워드"], input[placeholder*="keyword"]');
    if (keywordInput) {
      console.log('✅ 키워드 입력 필드 발견');
      await keywordInput.fill('바다');
      console.log('📝 "바다" 키워드 입력 완료');
    }
    
    // 생성 버튼 찾기
    const generateButton = await page.$('button:has-text("생성"), button:has-text("Generate"), button[type="submit"]');
    if (generateButton) {
      console.log('✅ 생성 버튼 발견');
      await generateButton.click();
      console.log('🖱️ 생성 버튼 클릭 완료');
      
      // 결과 대기
      await page.waitForTimeout(2000);
    }
    
    // 4. 색상 팔레트 결과 확인
    console.log('🌈 색상 팔레트 결과 확인 중...');
    
    // 색상 요소들 찾기
    const colorElements = await page.$$('.color, [data-color], .palette-color, .color-swatch');
    if (colorElements.length > 0) {
      console.log(`✅ ${colorElements.length}개의 색상 요소 발견`);
      
      // 첫 번째 색상의 정보 확인
      const firstColor = colorElements[0];
      const colorStyle = await firstColor.getAttribute('style');
      const colorData = await firstColor.getAttribute('data-color');
      console.log('🎯 첫 번째 색상 스타일:', colorStyle);
      console.log('📊 첫 번째 색상 데이터:', colorData);
    }
    
    // 5. 스크린샷 촬영
    console.log('📸 스크린샷 촬영 중...');
    await page.screenshot({ 
      path: 'e2e-screenshot.png', 
      fullPage: true 
    });
    console.log('✅ 스크린샷 저장 완료: e2e-screenshot.png');
    
    // 6. 성능 메트릭 확인
    console.log('⚡ 성능 메트릭 확인 중...');
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
        responseTime: Math.round(navigation.responseEnd - navigation.requestStart)
      };
    });
    console.log('📊 성능 메트릭:', performanceMetrics);
    
    // 7. 콘솔 에러 확인
    console.log('🚨 콘솔 에러 확인 중...');
    const logs = await page.evaluate(() => {
      return window.console.errors || [];
    });
    
    if (logs.length > 0) {
      console.log('⚠️ 콘솔 에러 발견:', logs);
    } else {
      console.log('✅ 콘솔 에러 없음');
    }
    
    console.log('🎉 E2E 테스트 완료!');
    
  } catch (error) {
    console.error('❌ E2E 테스트 실패:', error.message);
  } finally {
    await browser.close();
  }
}

runE2ETests();