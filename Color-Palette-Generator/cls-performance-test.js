import { chromium } from 'playwright';

async function clsPerformanceTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  const page = await browser.newPage();
  
  console.log('🚀 CLS 성능 테스트 시작...');
  
  try {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // CLS 측정을 위한 성능 모니터링
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        let lcpValue = 0;
        
        // CLS 측정
        if ('PerformanceObserver' in window) {
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
          }).observe({ entryTypes: ['layout-shift'] });
        }
        
        // LCP 측정
        if ('PerformanceObserver' in window) {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            lcpValue = Math.round(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        }
        
        setTimeout(() => {
          resolve({
            cls: Math.round(clsValue * 1000) / 1000,
            lcp: lcpValue,
            timestamp: Date.now()
          });
        }, 3000);
      });
    });
    
    console.log('\n📊 초기 로딩 성능:');
    console.log(`CLS: ${performanceMetrics.cls} (${performanceMetrics.cls < 0.1 ? '✅ 우수' : performanceMetrics.cls < 0.25 ? '⚠️ 개선 필요' : '❌ 나쁨'})`);
    console.log(`LCP: ${performanceMetrics.lcp}ms (${performanceMetrics.lcp < 2500 ? '✅ 우수' : performanceMetrics.lcp < 4000 ? '⚠️ 개선 필요' : '❌ 나쁨'})`);
    
    // 팔레트 생성으로 인한 CLS 변화 측정
    console.log('\n🎨 팔레트 생성 중 CLS 측정...');
    
    const keywordInput = await page.$('input');
    if (keywordInput) {
      await keywordInput.fill('CLS테스트');
      
      // CLS 측정 시작
      const clsBeforeGeneration = await page.evaluate(() => {
        let clsValue = 0;
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
          });
          observer.observe({ entryTypes: ['layout-shift'] });
          
          // 현재 CLS 값 반환을 위한 임시 저장
          window._clsTracker = { value: 0, observer };
        }
        return clsValue;
      });
      
      const generateButton = await page.$('button');
      if (generateButton) {
        await generateButton.click();
        await page.waitForTimeout(3000); // 생성 완료 대기
        
        // 팔레트 생성 후 CLS 측정
        const clsAfterGeneration = await page.evaluate(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              let totalCls = 0;
              if (window._clsTracker && window._clsTracker.observer) {
                // 현재까지 누적된 CLS 값 계산
                const entries = window._clsTracker.observer.takeRecords ? 
                  window._clsTracker.observer.takeRecords() : [];
                for (const entry of entries) {
                  if (!entry.hadRecentInput) {
                    totalCls += entry.value;
                  }
                }
              }
              resolve(Math.round(totalCls * 1000) / 1000);
            }, 1000);
          });
        });
        
        console.log(`생성 전 CLS: ${clsBeforeGeneration}`);
        console.log(`생성 후 CLS: ${clsAfterGeneration}`);
        console.log(`CLS 증가: ${Math.round((clsAfterGeneration - clsBeforeGeneration) * 1000) / 1000}`);
        
        if (clsAfterGeneration - clsBeforeGeneration < 0.1) {
          console.log('✅ CLS 개선 성공: 레이아웃 이동 최소화됨');
        } else {
          console.log('⚠️ CLS 개선 필요: 추가 최적화 권장');
        }
      }
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'cls-test-result.png', 
      fullPage: false 
    });
    
    console.log('\n📸 결과 스크린샷 저장: cls-test-result.png');
    
    // 전체 Core Web Vitals 측정
    const finalMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics = {
          cls: 0,
          lcp: 0,
          fid: 0,
          fcp: 0
        };
        
        let observersCount = 0;
        const totalObservers = 4;
        
        const checkComplete = () => {
          observersCount++;
          if (observersCount >= totalObservers) {
            setTimeout(() => resolve(metrics), 500);
          }
        };
        
        // CLS
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              metrics.cls += entry.value;
            }
          }
          checkComplete();
        }).observe({ entryTypes: ['layout-shift'] });
        
        // LCP
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.lcp = Math.round(lastEntry.startTime);
          checkComplete();
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // FCP
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.fcp = Math.round(lastEntry.startTime);
          checkComplete();
        }).observe({ entryTypes: ['first-contentful-paint'] });
        
        // Navigation timing for fallback
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          metrics.fid = Math.round(navigation.domInteractive - navigation.fetchStart);
        }
        checkComplete();
        
        setTimeout(() => resolve(metrics), 5000); // 최대 5초 대기
      });
    });
    
    console.log('\n🏆 최종 Core Web Vitals:');
    console.log(`CLS: ${Math.round(finalMetrics.cls * 1000) / 1000} (목표: <0.1)`);
    console.log(`LCP: ${finalMetrics.lcp}ms (목표: <2500ms)`);
    console.log(`FCP: ${finalMetrics.fcp}ms (목표: <1800ms)`);
    console.log(`FID: ${finalMetrics.fid}ms (목표: <100ms)`);
    
    // 성능 등급 계산
    let score = 0;
    if (finalMetrics.cls < 0.1) score += 25;
    else if (finalMetrics.cls < 0.25) score += 15;
    
    if (finalMetrics.lcp < 2500) score += 25;
    else if (finalMetrics.lcp < 4000) score += 15;
    
    if (finalMetrics.fcp < 1800) score += 25;
    else if (finalMetrics.fcp < 3000) score += 15;
    
    if (finalMetrics.fid < 100) score += 25;
    else if (finalMetrics.fid < 300) score += 15;
    
    console.log(`\n🎯 전체 성능 점수: ${score}/100 ${score >= 90 ? '(A+)' : score >= 80 ? '(A)' : score >= 70 ? '(B)' : '(C)'}`);
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ CLS 성능 테스트 실패:', error.message);
  } finally {
    await browser.close();
  }
}

clsPerformanceTest();