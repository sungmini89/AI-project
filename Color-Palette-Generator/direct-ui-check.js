import { chromium } from 'playwright';

async function directUICheck() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
  });
  const page = await browser.newPage();
  
  console.log('🔍 실제 UI 레이아웃 직접 확인...');
  
  try {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // 잠시 대기하여 완전히 로드되도록
    await page.waitForTimeout(3000);
    
    console.log('📸 현재 화면 스크린샷 촬영...');
    await page.screenshot({ 
      path: 'current-ui-state.png', 
      fullPage: true 
    });
    
    // 실제 DOM 요소들의 위치와 스타일 확인
    const realLayoutData = await page.evaluate(() => {
      const body = document.body;
      const root = document.getElementById('root');
      const containers = document.querySelectorAll('.container');
      const mainContent = document.querySelector('main');
      
      const bodyRect = body.getBoundingClientRect();
      const bodyStyles = window.getComputedStyle(body);
      const rootRect = root ? root.getBoundingClientRect() : null;
      const rootStyles = root ? window.getComputedStyle(root) : null;
      
      return {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        body: {
          position: {
            x: bodyRect.x,
            y: bodyRect.y,
            width: bodyRect.width,
            height: bodyRect.height,
            left: bodyRect.left,
            right: bodyRect.right
          },
          styles: {
            margin: bodyStyles.margin,
            padding: bodyStyles.padding,
            textAlign: bodyStyles.textAlign,
            width: bodyStyles.width,
            display: bodyStyles.display
          }
        },
        root: rootRect ? {
          position: {
            x: rootRect.x,
            y: rootRect.y,
            width: rootRect.width,
            height: rootRect.height,
            left: rootRect.left,
            right: rootRect.right
          },
          styles: {
            margin: rootStyles.margin,
            padding: rootStyles.padding,
            textAlign: rootStyles.textAlign,
            width: rootStyles.width,
            display: rootStyles.display
          }
        } : null,
        containers: Array.from(containers).map((container, index) => {
          const rect = container.getBoundingClientRect();
          const styles = window.getComputedStyle(container);
          return {
            index,
            className: container.className,
            position: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              left: rect.left,
              right: rect.right
            },
            styles: {
              margin: styles.margin,
              marginLeft: styles.marginLeft,
              marginRight: styles.marginRight,
              padding: styles.padding,
              textAlign: styles.textAlign,
              width: styles.width,
              maxWidth: styles.maxWidth,
              display: styles.display
            }
          };
        }),
        mainContent: mainContent ? {
          position: (() => {
            const rect = mainContent.getBoundingClientRect();
            return {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              left: rect.left,
              right: rect.right
            };
          })(),
          styles: (() => {
            const styles = window.getComputedStyle(mainContent);
            return {
              margin: styles.margin,
              padding: styles.padding,
              textAlign: styles.textAlign,
              width: styles.width,
              display: styles.display
            };
          })()
        } : null
      };
    });
    
    console.log('\n🔍 실제 레이아웃 데이터:');
    console.log('뷰포트:', realLayoutData.viewport);
    console.log('Body:', JSON.stringify(realLayoutData.body, null, 2));
    console.log('Root:', JSON.stringify(realLayoutData.root, null, 2));
    console.log('Container 요소들:', JSON.stringify(realLayoutData.containers, null, 2));
    console.log('Main 콘텐츠:', JSON.stringify(realLayoutData.mainContent, null, 2));
    
    // 중앙 정렬 분석
    console.log('\n🎯 중앙 정렬 분석:');
    const viewportCenter = realLayoutData.viewport.width / 2;
    
    if (realLayoutData.root) {
      const rootCenter = realLayoutData.root.position.left + realLayoutData.root.position.width / 2;
      const rootOffset = Math.abs(viewportCenter - rootCenter);
      console.log(`Root 요소:`);
      console.log(`  - 뷰포트 중심: ${viewportCenter}px`);
      console.log(`  - Root 중심: ${rootCenter}px`);
      console.log(`  - 오프셋: ${rootOffset}px`);
      console.log(`  - 중앙 정렬: ${rootOffset < 10 ? '✅ 정렬됨' : '❌ 치우쳐짐'}`);
    }
    
    realLayoutData.containers.forEach((container, index) => {
      const containerCenter = container.position.left + container.position.width / 2;
      const containerOffset = Math.abs(viewportCenter - containerCenter);
      console.log(`Container ${index} (${container.className}):`);
      console.log(`  - 컨테이너 중심: ${containerCenter}px`);
      console.log(`  - 오프셋: ${containerOffset}px`);
      console.log(`  - 중앙 정렬: ${containerOffset < 10 ? '✅ 정렬됨' : '❌ 치우쳐짐'}`);
      console.log(`  - 좌측 위치: ${container.position.left}px`);
      console.log(`  - 너비: ${container.position.width}px`);
    });
    
    // 실제 문제가 있는지 확인
    let hasLayoutIssue = false;
    if (realLayoutData.root && Math.abs(viewportCenter - (realLayoutData.root.position.left + realLayoutData.root.position.width / 2)) > 10) {
      hasLayoutIssue = true;
    }
    
    realLayoutData.containers.forEach(container => {
      const containerCenter = container.position.left + container.position.width / 2;
      if (Math.abs(viewportCenter - containerCenter) > 10) {
        hasLayoutIssue = true;
      }
    });
    
    console.log('\n🚨 레이아웃 문제 확인:');
    console.log(hasLayoutIssue ? '❌ 레이아웃이 중앙에서 벗어나 있습니다!' : '✅ 레이아웃이 정상적으로 중앙 정렬되어 있습니다.');
    
    // 사용자가 직접 확인할 수 있도록 브라우저 유지
    console.log('\n👀 브라우저 창을 확인해주세요. 5초 후 자동 종료됩니다...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 실제 UI 확인 실패:', error.message);
  } finally {
    await browser.close();
  }
}

directUICheck();