import { chromium } from 'playwright';

async function domAnalysisTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();
  
  console.log('🔍 DOM 구조 분석 테스트 시작...');
  
  try {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#root', { timeout: 10000 });
    
    console.log('📱 초기 페이지 로드 완료');
    
    // 1. 페이지 구조 분석
    console.log('\n🏗️ 페이지 구조 분석...');
    
    const pageStructure = await page.evaluate(() => {
      const root = document.getElementById('root');
      if (!root) return 'Root element not found';
      
      function getElementInfo(element, depth = 0) {
        const indent = '  '.repeat(depth);
        const tag = element.tagName.toLowerCase();
        const className = element.className ? ` class="${element.className}"` : '';
        const id = element.id ? ` id="${element.id}"` : '';
        const textContent = element.textContent?.trim().substring(0, 30) || '';
        const hasChildren = element.children.length > 0;
        
        let info = `${indent}${tag}${id}${className}`;
        if (textContent && !hasChildren) {
          info += ` : "${textContent}${textContent.length > 30 ? '...' : ''}"`;
        }
        info += '\n';
        
        if (hasChildren && depth < 3) {
          for (let child of element.children) {
            info += getElementInfo(child, depth + 1);
          }
        }
        
        return info;
      }
      
      return getElementInfo(root);
    });
    
    console.log('🏗️ DOM 구조:');
    console.log(pageStructure);
    
    // 2. 키워드 입력 및 팔레트 생성
    console.log('\n🎨 팔레트 생성 과정 모니터링...');
    
    const keywordInput = await page.$('input');
    if (keywordInput) {
      console.log('✅ 키워드 입력 필드 발견');
      
      await keywordInput.fill('바다');
      console.log('📝 "바다" 키워드 입력');
      
      const generateButton = await page.$('button:has-text("생성")');
      if (generateButton) {
        console.log('✅ 생성 버튼 발견');
        
        // 생성 전 DOM 상태
        const beforeGeneration = await page.evaluate(() => {
          return {
            bodyHTML: document.body.innerHTML.length,
            allElements: document.querySelectorAll('*').length,
            colorElements: document.querySelectorAll('[style*="background-color"]').length
          };
        });
        
        console.log('📊 생성 전 DOM 상태:', beforeGeneration);
        
        await generateButton.click();
        console.log('🖱️ 생성 버튼 클릭');
        
        // 잠시 대기 후 DOM 변화 확인
        await page.waitForTimeout(3000);
        
        const afterGeneration = await page.evaluate(() => {
          return {
            bodyHTML: document.body.innerHTML.length,
            allElements: document.querySelectorAll('*').length,
            colorElements: document.querySelectorAll('[style*="background-color"]').length,
            colorElementsRGB: document.querySelectorAll('[style*="rgb"]').length,
            divElements: document.querySelectorAll('div[style*="background"]').length,
            canvasElements: document.querySelectorAll('canvas').length
          };
        });
        
        console.log('📊 생성 후 DOM 상태:', afterGeneration);
        
        // 색상 관련 요소들을 더 광범위하게 찾기
        const colorRelatedElements = await page.evaluate(() => {
          const selectors = [
            '[style*="background-color"]',
            '[style*="background"]',
            '[style*="rgb"]',
            '[style*="hsl"]',
            '[style*="hex"]',
            '.color',
            '.palette',
            '[data-color]',
            '[class*="color"]',
            '[class*="palette"]',
            'canvas',
            'svg circle',
            'svg rect',
            'div[style]'
          ];
          
          const results = {};
          selectors.forEach(selector => {
            try {
              const elements = document.querySelectorAll(selector);
              if (elements.length > 0) {
                results[selector] = {
                  count: elements.length,
                  examples: Array.from(elements).slice(0, 3).map(el => ({
                    tagName: el.tagName,
                    className: el.className,
                    style: el.getAttribute('style'),
                    innerHTML: el.innerHTML.substring(0, 100)
                  }))
                };
              }
            } catch (e) {
              results[selector] = { error: e.message };
            }
          });
          
          return results;
        });
        
        console.log('\n🔍 색상 관련 요소 상세 분석:');
        Object.entries(colorRelatedElements).forEach(([selector, data]) => {
          if (data.count > 0) {
            console.log(`\n✅ ${selector}: ${data.count}개`);
            data.examples.forEach((example, index) => {
              console.log(`  예시 ${index + 1}: ${example.tagName} - ${example.style}`);
            });
          }
        });
        
        // 3. 스크린샷으로 시각적 확인
        console.log('\n📸 생성 후 스크린샷 촬영...');
        await page.screenshot({ 
          path: 'dom-analysis-after-generation.png', 
          fullPage: true 
        });
        
        // 4. 개발자 도구 콘솔 로그 확인
        console.log('\n🐛 콘솔 로그 확인...');
        const consoleLogs = await page.evaluate(() => {
          // 콘솔 로그를 캡처하기 위한 방법
          return window.console._logs || [];
        });
        
        if (consoleLogs.length > 0) {
          console.log('📝 콘솔 로그:', consoleLogs);
        }
        
        // 5. 네트워크 요청 확인
        console.log('\n🌐 네트워크 활동 모니터링...');
        const responses = [];
        
        page.on('response', response => {
          responses.push({
            url: response.url(),
            status: response.status(),
            contentType: response.headers()['content-type']
          });
        });
        
        // 한 번 더 생성해서 네트워크 활동 확인
        await generateButton.click();
        await page.waitForTimeout(2000);
        
        console.log('📊 네트워크 응답:', responses.slice(-5)); // 최근 5개만
      }
    }
    
    console.log('\n🎉 DOM 분석 테스트 완료!');
    
  } catch (error) {
    console.error('❌ DOM 분석 테스트 실패:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

domAnalysisTest();