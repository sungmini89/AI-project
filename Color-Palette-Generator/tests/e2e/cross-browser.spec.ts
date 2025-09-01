import { test, expect } from '@playwright/test';

test.describe('🌐 크로스 브라우저 호환성 테스트', () => {
  // 브라우저별 기본 기능 검증
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`[${browserName}] 기본 색상 생성 기능`, async ({ page }) => {
      await page.goto('/generator');
      
      // 페이지 로딩 확인
      await expect(page).toHaveTitle(/색상 팔레트 생성기/);
      
      // UI 요소 존재 확인
      await expect(page.locator('[data-testid="keyword-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="harmony-selector"]')).toBeVisible();
      await expect(page.locator('[data-testid="generate-palette"]')).toBeVisible();
      
      // 색상 생성 기능 테스트
      await page.fill('[data-testid="keyword-input"]', '바다');
      await page.click('[data-testid="generate-palette"]');
      
      // 팔레트 생성 확인 (브라우저별 타임아웃 조정)
      const timeout = browserName === 'webkit' ? 5000 : 3000;
      await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible({ timeout });
      
      // 5가지 색상 생성 확인
      const colorSwatches = page.locator('[data-testid="color-swatch"]');
      await expect(colorSwatches).toHaveCount(5);
    });
  });

  // CSS 그리드 및 플렉스박스 호환성
  test.describe('CSS 레이아웃 호환성', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`[${browserName}] 반응형 그리드 레이아웃`, async ({ page }) => {
        await page.goto('/generator');
        
        // 데스크톱 뷰 (1920x1080)
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.fill('[data-testid="keyword-input"]', '레이아웃');
        await page.click('[data-testid="generate-button"]');
        await expect(page.locator('[data-testid="color-palette"]')).toBeVisible();
        
        // 그리드 레이아웃 확인
        const paletteGrid = page.locator('[data-testid="color-palette"]');
        const gridStyles = await paletteGrid.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            display: styles.display,
            gridTemplateColumns: styles.gridTemplateColumns,
            gap: styles.gap
          };
        });
        
        expect(gridStyles.display).toContain('grid');
        
        // 태블릿 뷰 (768x1024)
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(500); // 레이아웃 재계산 대기
        
        // 모바일 뷰 (375x667)
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);
        
        // 모든 뷰포트에서 팔레트가 보여야 함
        await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible();
      });
    });
  });

  // JavaScript ES6+ 기능 호환성
  test.describe('JavaScript 호환성', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`[${browserName}] ES6+ 기능 동작`, async ({ page }) => {
        await page.goto('/generator');
        
        // Promise, async/await 동작 확인
        const asyncTest = await page.evaluate(async () => {
          try {
            // Promise 기반 API 호출 시뮬레이션
            const result = await new Promise(resolve => {
              setTimeout(() => resolve('success'), 100);
            });
            
            // Arrow function, template literals 테스트
            const testData = { keyword: 'test', harmony: 'complementary' };
            const templateResult = `키워드: ${testData.keyword}, 하모니: ${testData.harmony}`;
            
            // Destructuring, spread operator 테스트
            const { keyword, harmony } = testData;
            const spreadTest = { ...testData, browser: 'test' };
            
            return {
              promiseResult: result,
              templateResult,
              destructuring: { keyword, harmony },
              spread: spreadTest
            };
          } catch (error) {
            return { error: error.message };
          }
        });
        
        expect(asyncTest.promiseResult).toBe('success');
        expect(asyncTest.templateResult).toContain('키워드: test');
        expect(asyncTest.destructuring.keyword).toBe('test');
        expect(asyncTest.spread.browser).toBe('test');
      });
    });
  });

  // Canvas 2D API 호환성 (이미지 색상 추출용)
  test.describe('Canvas API 호환성', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`[${browserName}] Canvas 이미지 처리`, async ({ page }) => {
        await page.goto('/extract');
        
        // Canvas 지원 확인
        const canvasSupport = await page.evaluate(() => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) return { supported: false };
            
            // 기본 Canvas 기능 테스트
            canvas.width = 100;
            canvas.height = 100;
            
            // 색상 그리기
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(0, 0, 50, 50);
            
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(50, 0, 50, 50);
            
            ctx.fillStyle = '#0000FF';
            ctx.fillRect(0, 50, 50, 50);
            
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(50, 50, 50, 50);
            
            // ImageData 읽기 테스트
            const imageData = ctx.getImageData(0, 0, 100, 100);
            const data = imageData.data;
            
            // 첫 번째 픽셀이 빨간색인지 확인
            const firstPixelRed = data[0] === 255 && data[1] === 0 && data[2] === 0;
            
            return {
              supported: true,
              width: canvas.width,
              height: canvas.height,
              imageDataLength: data.length,
              firstPixelRed
            };
          } catch (error) {
            return { supported: false, error: error.message };
          }
        });
        
        expect(canvasSupport.supported).toBe(true);
        expect(canvasSupport.imageDataLength).toBe(40000); // 100*100*4 (RGBA)
        expect(canvasSupport.firstPixelRed).toBe(true);
      });
    });
  });

  // Local Storage 호환성
  test.describe('로컬 스토리지 호환성', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`[${browserName}] 설정 저장 및 복원`, async ({ page }) => {
        await page.goto('/generator');
        
        // 설정 저장 테스트
        const storageTest = await page.evaluate(() => {
          try {
            // 설정 저장
            const settings = {
              defaultHarmony: 'analogous',
              language: 'ko',
              theme: 'dark',
              savedPalettes: ['#FF0000', '#00FF00', '#0000FF']
            };
            
            localStorage.setItem('colorGeneratorSettings', JSON.stringify(settings));
            
            // 저장 확인
            const retrieved = JSON.parse(localStorage.getItem('colorGeneratorSettings') || '{}');
            
            // 개별 키-값 테스트
            localStorage.setItem('testKey', 'testValue');
            const singleValue = localStorage.getItem('testKey');
            
            // 삭제 테스트
            localStorage.removeItem('testKey');
            const deletedValue = localStorage.getItem('testKey');
            
            return {
              supported: true,
              savedCorrectly: JSON.stringify(retrieved) === JSON.stringify(settings),
              singleValue,
              deletedValue
            };
          } catch (error) {
            return { supported: false, error: error.message };
          }
        });
        
        expect(storageTest.supported).toBe(true);
        expect(storageTest.savedCorrectly).toBe(true);
        expect(storageTest.singleValue).toBe('testValue');
        expect(storageTest.deletedValue).toBe(null);
      });
    });
  });

  // CSS 커스텀 프로퍼티 (CSS Variables) 호환성
  test.describe('CSS 커스텀 프로퍼티 호환성', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`[${browserName}] CSS Variables 동작`, async ({ page }) => {
        await page.goto('/generator');
        
        // CSS Variables 지원 확인
        const cssVariablesTest = await page.evaluate(() => {
          try {
            // CSS 변수 설정
            document.documentElement.style.setProperty('--test-color', '#FF0000');
            document.documentElement.style.setProperty('--test-size', '20px');
            
            // 테스트 요소 생성
            const testElement = document.createElement('div');
            testElement.style.color = 'var(--test-color)';
            testElement.style.fontSize = 'var(--test-size)';
            document.body.appendChild(testElement);
            
            // 계산된 스타일 확인
            const computedStyles = window.getComputedStyle(testElement);
            const color = computedStyles.color;
            const fontSize = computedStyles.fontSize;
            
            // 정리
            document.body.removeChild(testElement);
            document.documentElement.style.removeProperty('--test-color');
            document.documentElement.style.removeProperty('--test-size');
            
            return {
              supported: true,
              color,
              fontSize
            };
          } catch (error) {
            return { supported: false, error: error.message };
          }
        });
        
        expect(cssVariablesTest.supported).toBe(true);
        expect(cssVariablesTest.color).toContain('255'); // RGB 값 포함
        expect(cssVariablesTest.fontSize).toBe('20px');
      });
    });
  });

  // 이벤트 처리 호환성
  test.describe('이벤트 처리 호환성', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`[${browserName}] 키보드 및 마우스 이벤트`, async ({ page }) => {
        await page.goto('/generator');
        
        // 키보드 이벤트 테스트
        await page.locator('[data-testid="keyword-input"]').focus();
        await page.keyboard.type('키보드테스트');
        
        const inputValue = await page.locator('[data-testid="keyword-input"]').inputValue();
        expect(inputValue).toBe('키보드테스트');
        
        // Enter 키 테스트
        await page.keyboard.press('Enter');
        await expect(page.locator('[data-testid="generated-palette"]')).toBeVisible({ timeout: 5000 });
        
        // 마우스 이벤트 테스트 (호버)
        await page.locator('[data-testid="harmony-selector"]').hover();
        
        // 클릭 이벤트 테스트
        await page.locator('[data-testid="harmony-selector"]').click();
        
        // 셀렉트 옵션 확인
        const options = page.locator('[data-testid="harmony-selector"] option');
        const optionCount = await options.count();
        expect(optionCount).toBeGreaterThan(0);
      });
    });
  });

  // Fetch API 호환성
  test.describe('네트워크 API 호환성', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`[${browserName}] Fetch API 및 CORS`, async ({ page }) => {
        await page.goto('/generator');
        
        // Fetch API 지원 확인
        const fetchTest = await page.evaluate(async () => {
          try {
            // fetch가 정의되어 있는지 확인
            if (typeof fetch === 'undefined') {
              return { supported: false, error: 'fetch not defined' };
            }
            
            // 기본 fetch 테스트 (실제로는 모킹된 응답 사용)
            const mockData = { colors: ['#FF0000', '#00FF00', '#0000FF'] };
            
            // Headers API 테스트
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            
            // Request API 테스트
            const request = new Request('/api/test', {
              method: 'POST',
              headers: headers,
              body: JSON.stringify({ test: 'data' })
            });
            
            return {
              supported: true,
              fetchExists: typeof fetch === 'function',
              headersExists: typeof Headers === 'function',
              requestExists: typeof Request === 'function',
              requestMethod: request.method,
              requestUrl: request.url
            };
          } catch (error) {
            return { supported: false, error: error.message };
          }
        });
        
        expect(fetchTest.supported).toBe(true);
        expect(fetchTest.fetchExists).toBe(true);
        expect(fetchTest.headersExists).toBe(true);
        expect(fetchTest.requestExists).toBe(true);
        expect(fetchTest.requestMethod).toBe('POST');
      });
    });
  });

  // 다크 모드 및 미디어 쿼리 호환성
  test.describe('미디어 쿼리 호환성', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`[${browserName}] 다크모드 및 미디어 쿼리`, async ({ page }) => {
        await page.goto('/generator');
        
        // prefers-color-scheme 미디어 쿼리 테스트
        const mediaQueryTest = await page.evaluate(() => {
          try {
            // 다크 모드 감지
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
            const prefersLight = window.matchMedia('(prefers-color-scheme: light)');
            
            // 모바일 감지
            const isMobile = window.matchMedia('(max-width: 768px)');
            
            // 고해상도 감지
            const isRetina = window.matchMedia('(min-resolution: 2dppx)');
            
            return {
              supported: true,
              prefersDarkSupported: prefersDark.media !== 'not all',
              prefersLightSupported: prefersLight.media !== 'not all',
              isMobileSupported: isMobile.media !== 'not all',
              isRetinaSupported: isRetina.media !== 'not all',
              prefersDark: prefersDark.matches,
              isMobile: isMobile.matches
            };
          } catch (error) {
            return { supported: false, error: error.message };
          }
        });
        
        expect(mediaQueryTest.supported).toBe(true);
        expect(mediaQueryTest.prefersDarkSupported).toBe(true);
        expect(mediaQueryTest.prefersLightSupported).toBe(true);
      });
    });
  });

  // 폰트 로딩 호환성
  test.describe('폰트 및 타이포그래피 호환성', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`[${browserName}] 웹폰트 로딩`, async ({ page }) => {
        await page.goto('/generator');
        
        // 폰트 로딩 상태 확인
        await page.waitForLoadState('networkidle');
        
        const fontTest = await page.evaluate(() => {
          // 제목 요소의 폰트 확인
          const title = document.querySelector('h1');
          if (!title) return { supported: false, error: 'Title not found' };
          
          const computedStyle = window.getComputedStyle(title);
          const fontFamily = computedStyle.fontFamily;
          const fontSize = computedStyle.fontSize;
          const fontWeight = computedStyle.fontWeight;
          
          // 한글 폰트 렌더링 테스트
          const testText = '한글 폰트 테스트';
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.font = `${fontSize} ${fontFamily}`;
            const textMetrics = ctx.measureText(testText);
            
            return {
              supported: true,
              fontFamily,
              fontSize,
              fontWeight,
              textWidth: textMetrics.width
            };
          }
          
          return { supported: false, error: 'Canvas context not available' };
        });
        
        expect(fontTest.supported).toBe(true);
        expect(fontTest.fontFamily).toBeTruthy();
        expect(fontTest.fontSize).toMatch(/\d+px/);
        expect(parseFloat(fontTest.textWidth)).toBeGreaterThan(0);
      });
    });
  });
});

// 브라우저별 특화 테스트
test.describe('브라우저별 특화 기능 테스트', () => {
  test('Chrome: Performance API', async ({ page }) => {
    test.skip(process.env.BROWSER !== 'chromium', 'Chrome 전용 테스트');
    
    await page.goto('/generator');
    
    const performanceTest = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('navigation');
      const memoryInfo = (performance as any).memory;
      
      return {
        navigationTiming: perfEntries.length > 0,
        memoryAPI: !!memoryInfo,
        usedJSHeapSize: memoryInfo?.usedJSHeapSize || 0
      };
    });
    
    expect(performanceTest.navigationTiming).toBe(true);
    expect(performanceTest.memoryAPI).toBe(true);
  });

  test('Firefox: Gecko 엔진 특화 기능', async ({ page }) => {
    test.skip(process.env.BROWSER !== 'firefox', 'Firefox 전용 테스트');
    
    await page.goto('/generator');
    
    // Firefox 특화 CSS 기능 테스트
    const firefoxTest = await page.evaluate(() => {
      const testElement = document.createElement('div');
      testElement.style.scrollbarWidth = 'thin';
      
      return {
        scrollbarWidth: testElement.style.scrollbarWidth === 'thin'
      };
    });
    
    expect(firefoxTest.scrollbarWidth).toBe(true);
  });

  test('Safari: WebKit 엔진 특화 기능', async ({ page }) => {
    test.skip(process.env.BROWSER !== 'webkit', 'Safari 전용 테스트');
    
    await page.goto('/generator');
    
    // Safari 특화 기능 테스트
    const safariTest = await page.evaluate(() => {
      // -webkit- 접두사 테스트
      const testElement = document.createElement('div');
      testElement.style.webkitAppearance = 'none';
      
      return {
        webkitPrefix: testElement.style.webkitAppearance === 'none',
        userAgent: navigator.userAgent.includes('Safari')
      };
    });
    
    expect(safariTest.webkitPrefix).toBe(true);
  });
});