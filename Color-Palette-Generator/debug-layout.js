import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // 스크린샷 찍기
    await page.screenshot({ 
      path: 'current-layout.png', 
      fullPage: true 
    });
    
    console.log('✅ Screenshot saved as current-layout.png');
    
    // CSS 로딩 상태 확인
    const cssLoaded = await page.evaluate(() => {
      const stylesheets = Array.from(document.styleSheets);
      return {
        totalStyles: stylesheets.length,
        tailwindLoaded: stylesheets.some(sheet => {
          try {
            return sheet.href && sheet.href.includes('tailwind') || 
                   Array.from(sheet.cssRules || []).some(rule => 
                     rule.cssText && rule.cssText.includes('container')
                   );
          } catch (e) {
            return false;
          }
        })
      };
    });
    
    console.log('📄 CSS loading status:', cssLoaded);
    
    // body의 computed styles 확인
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return {
        margin: computedStyle.margin,
        padding: computedStyle.padding,
        width: computedStyle.width,
        boxSizing: computedStyle.boxSizing
      };
    });
    
    console.log('🎯 Body styles:', bodyStyles);
    
    // 메인 컨테이너의 스타일 확인
    const containerInfo = await page.evaluate(() => {
      const containers = document.querySelectorAll('.container');
      return Array.from(containers).map(container => {
        const computedStyle = window.getComputedStyle(container);
        return {
          tagName: container.tagName,
          className: container.className,
          width: computedStyle.width,
          maxWidth: computedStyle.maxWidth,
          margin: computedStyle.margin,
          padding: computedStyle.padding
        };
      });
    });
    
    console.log('📦 Container elements:', containerInfo);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    setTimeout(async () => {
      await browser.close();
    }, 3000); // 3초 후 닫기
  }
})();