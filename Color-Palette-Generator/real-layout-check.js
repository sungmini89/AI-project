import { chromium } from 'playwright';

async function realLayoutCheck() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();
  
  console.log('🔍 실시간 레이아웃 상태 확인...');
  
  try {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // 실시간으로 CSS 스타일과 위치 확인
    const detailedAnalysis = await page.evaluate(() => {
      const containers = document.querySelectorAll('.container');
      const analysis = {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        containers: [],
        body: {
          margin: window.getComputedStyle(document.body).margin,
          padding: window.getComputedStyle(document.body).padding,
          width: window.getComputedStyle(document.body).width
        },
        html: {
          margin: window.getComputedStyle(document.documentElement).margin,
          padding: window.getComputedStyle(document.documentElement).padding,
          width: window.getComputedStyle(document.documentElement).width
        }
      };
      
      containers.forEach((container, index) => {
        const rect = container.getBoundingClientRect();
        const styles = window.getComputedStyle(container);
        
        analysis.containers.push({
          index: index,
          element: container.tagName,
          className: container.className,
          position: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            left: rect.left,
            right: rect.right
          },
          computedStyles: {
            margin: styles.margin,
            marginLeft: styles.marginLeft,
            marginRight: styles.marginRight,
            padding: styles.padding,
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            width: styles.width,
            maxWidth: styles.maxWidth,
            textAlign: styles.textAlign,
            display: styles.display,
            justifyContent: styles.justifyContent,
            alignItems: styles.alignItems
          }
        });
      });
      
      return analysis;
    });
    
    console.log('\n📊 상세 레이아웃 분석:');
    console.log(JSON.stringify(detailedAnalysis, null, 2));
    
    // 뷰포트와 컨테이너 중앙 정렬 분석
    console.log('\n🎯 중앙 정렬 분석:');
    detailedAnalysis.containers.forEach((container, index) => {
      const viewportCenter = detailedAnalysis.viewport.width / 2;
      const containerCenter = container.position.left + container.position.width / 2;
      const offset = Math.abs(viewportCenter - containerCenter);
      
      console.log(`컨테이너 ${index}:`);
      console.log(`  - 뷰포트 중심: ${viewportCenter}px`);
      console.log(`  - 컨테이너 중심: ${containerCenter}px`);
      console.log(`  - 오프셋: ${offset}px`);
      console.log(`  - 중앙 정렬: ${offset < 10 ? '✅ 예' : '❌ 아니오'}`);
    });
    
    // 스크린샷 캡처
    await page.screenshot({ 
      path: 'real-layout-check.png', 
      fullPage: false 
    });
    
    console.log('\n📸 스크린샷 저장: real-layout-check.png');
    
    // 잠시 대기 (사용자가 브라우저에서 확인할 수 있도록)
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 실시간 레이아웃 확인 실패:', error.message);
  } finally {
    await browser.close();
  }
}

realLayoutCheck();