import { chromium } from 'playwright';

async function uiLayoutInspection() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();
  
  console.log('🔍 UI 레이아웃 상세 검사 시작...');
  
  try {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // 1. 페이지 전체 스크린샷
    console.log('📸 전체 페이지 스크린샷 촬영...');
    await page.screenshot({ 
      path: 'layout-inspection-full.png', 
      fullPage: true 
    });
    
    // 2. 뷰포트 내 스크린샷
    await page.screenshot({ 
      path: 'layout-inspection-viewport.png', 
      fullPage: false 
    });
    
    // 3. 레이아웃 분석
    console.log('\n📐 레이아웃 구조 분석...');
    
    const layoutAnalysis = await page.evaluate(() => {
      const root = document.getElementById('root');
      if (!root) return { error: 'Root not found' };
      
      // 모든 주요 컨테이너 요소들의 위치와 크기 분석
      const elements = [
        { name: 'root', element: root },
        { name: 'main-container', element: root.querySelector('div') },
        { name: 'header', element: document.querySelector('header') },
        { name: 'main', element: document.querySelector('main') },
        { name: 'footer', element: document.querySelector('footer') }
      ];
      
      const analysis = {};
      
      elements.forEach(({ name, element }) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const styles = window.getComputedStyle(element);
          
          analysis[name] = {
            position: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom
            },
            styles: {
              display: styles.display,
              position: styles.position,
              margin: styles.margin,
              padding: styles.padding,
              textAlign: styles.textAlign,
              justifyContent: styles.justifyContent,
              alignItems: styles.alignItems,
              flexDirection: styles.flexDirection,
              width: styles.width,
              maxWidth: styles.maxWidth,
              className: element.className
            }
          };
        }
      });
      
      // 뷰포트 정보
      analysis.viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY
      };
      
      // 중앙 정렬 확인
      const mainContainer = root.querySelector('div');
      if (mainContainer) {
        const rect = mainContainer.getBoundingClientRect();
        const centerOffset = (window.innerWidth - rect.width) / 2;
        const actualOffset = rect.left;
        
        analysis.centeringCheck = {
          expectedOffset: centerOffset,
          actualOffset: actualOffset,
          difference: Math.abs(centerOffset - actualOffset),
          isCentered: Math.abs(centerOffset - actualOffset) < 50 // 50px 오차 허용
        };
      }
      
      return analysis;
    });
    
    console.log('\n📊 레이아웃 분석 결과:');
    console.log(JSON.stringify(layoutAnalysis, null, 2));
    
    // 4. 특정 UI 요소들의 위치 확인
    console.log('\n🎯 주요 UI 요소 위치 확인...');
    
    const uiElements = await page.evaluate(() => {
      const selectors = [
        'input[type="text"]',
        'button',
        '.container',
        'header',
        'main',
        'footer'
      ];
      
      const results = {};
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          const element = elements[0];
          const rect = element.getBoundingClientRect();
          const styles = window.getComputedStyle(element);
          
          results[selector] = {
            count: elements.length,
            position: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            },
            styles: {
              textAlign: styles.textAlign,
              margin: styles.margin,
              padding: styles.padding,
              float: styles.float,
              position: styles.position
            }
          };
        }
      });
      
      return results;
    });
    
    console.log('🎯 UI 요소 위치:', JSON.stringify(uiElements, null, 2));
    
    // 5. CSS 클래스 분석
    console.log('\n🎨 CSS 클래스 분석...');
    
    const cssAnalysis = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const classUsage = {};
      
      allElements.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          const classes = el.className.split(' ').filter(c => c.trim());
          classes.forEach(cls => {
            if (cls.includes('container') || cls.includes('mx-auto') || 
                cls.includes('text-center') || cls.includes('justify') || 
                cls.includes('flex') || cls.includes('grid')) {
              classUsage[cls] = (classUsage[cls] || 0) + 1;
            }
          });
        }
      });
      
      return classUsage;
    });
    
    console.log('🎨 레이아웃 관련 CSS 클래스:', cssAnalysis);
    
    // 6. 팔레트 생성 후 UI 변화 확인
    console.log('\n🎨 팔레트 생성 후 레이아웃 변화 확인...');
    
    const keywordInput = await page.$('input');
    if (keywordInput) {
      await keywordInput.fill('레이아웃테스트');
      
      const generateButton = await page.$('button');
      if (generateButton) {
        await generateButton.click();
        await page.waitForTimeout(2000);
        
        // 생성 후 스크린샷
        await page.screenshot({ 
          path: 'layout-after-generation.png', 
          fullPage: false 
        });
        
        // 생성된 색상 요소들의 위치 확인
        const colorPositions = await page.evaluate(() => {
          const colorElements = document.querySelectorAll('[style*="background-color"]');
          const positions = [];
          
          colorElements.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            positions.push({
              index: index,
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              centerX: Math.round(rect.x + rect.width / 2),
              centerY: Math.round(rect.y + rect.height / 2)
            });
          });
          
          return positions;
        });
        
        console.log('🎨 생성된 색상 요소들의 위치:', colorPositions);
        
        // 색상 요소들이 중앙 정렬되어 있는지 확인
        if (colorPositions.length > 1) {
          const avgCenterX = colorPositions.reduce((sum, pos) => sum + pos.centerX, 0) / colorPositions.length;
          const viewportCenter = layoutAnalysis.viewport.width / 2;
          const offset = Math.abs(avgCenterX - viewportCenter);
          
          console.log(`\n📐 색상 요소들의 중앙 정렬 확인:`);
          console.log(`- 색상 요소들 평균 중심 X: ${Math.round(avgCenterX)}px`);
          console.log(`- 뷰포트 중심: ${Math.round(viewportCenter)}px`);
          console.log(`- 오프셋: ${Math.round(offset)}px`);
          console.log(`- 중앙 정렬 여부: ${offset < 100 ? '✅ 정렬됨' : '❌ 한쪽으로 치우침'}`);
        }
      }
    }
    
    console.log('\n🎉 UI 레이아웃 검사 완료!');
    
  } catch (error) {
    console.error('❌ UI 레이아웃 검사 실패:', error.message);
  } finally {
    await browser.close();
  }
}

uiLayoutInspection();