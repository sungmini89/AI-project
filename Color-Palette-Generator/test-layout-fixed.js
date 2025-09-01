import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🌐 Navigating to http://localhost:5175');
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded successfully');
    
    // 스크린샷 찍기
    await page.screenshot({ 
      path: 'fixed-layout.png', 
      fullPage: false,
      clip: { x: 0, y: 0, width: 1200, height: 800 }
    });
    
    console.log('✅ Screenshot saved as fixed-layout.png');
    
    // CSS가 정상 로드되었는지 확인
    const cssCheck = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      const hasBackground = computedStyle.backgroundImage !== 'none' || computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
      
      // container 클래스 요소 확인
      const container = document.querySelector('.container');
      const containerStyle = container ? window.getComputedStyle(container) : null;
      
      return {
        bodyHasBackground: hasBackground,
        bodyBackground: computedStyle.backgroundImage || computedStyle.backgroundColor,
        containerExists: !!container,
        containerMargin: containerStyle ? containerStyle.marginLeft + ' ' + containerStyle.marginRight : 'none',
        containerPadding: containerStyle ? containerStyle.paddingLeft + ' ' + containerStyle.paddingRight : 'none',
        containerMaxWidth: containerStyle ? containerStyle.maxWidth : 'none'
      };
    });
    
    console.log('🎨 CSS Status:', cssCheck);
    
    // Tailwind 클래스들이 실제로 적용되었는지 확인
    const tailwindCheck = await page.evaluate(() => {
      const testElement = document.createElement('div');
      testElement.className = 'mx-auto px-4 bg-blue-500';
      document.body.appendChild(testElement);
      
      const styles = window.getComputedStyle(testElement);
      const result = {
        marginAuto: styles.marginLeft === 'auto' && styles.marginRight === 'auto',
        padding: styles.paddingLeft + ' ' + styles.paddingRight,
        backgroundColor: styles.backgroundColor
      };
      
      document.body.removeChild(testElement);
      return result;
    });
    
    console.log('🔧 Tailwind classes test:', tailwindCheck);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    setTimeout(async () => {
      await browser.close();
    }, 2000);
  }
})();