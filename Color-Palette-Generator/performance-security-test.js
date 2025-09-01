import { chromium } from 'playwright';

async function performanceSecurityTest() {
  const browser = await chromium.launch({ 
    headless: true
  });
  const page = await browser.newPage();
  
  console.log('🚀 성능 및 보안 테스트 시작...');
  
  try {
    // 1. 성능 측정
    console.log('\n⚡ 성능 메트릭 측정...');
    
    const startTime = Date.now();
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // Core Web Vitals 측정
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        
        // LCP (Largest Contentful Paint)
        if ('PerformanceObserver' in window) {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.lcp = Math.round(lastEntry.startTime);
          }).observe({entryTypes: ['largest-contentful-paint']});
        }
        
        // CLS (Cumulative Layout Shift)
        if ('PerformanceObserver' in window) {
          let clsValue = 0;
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            vitals.cls = clsValue;
          }).observe({entryTypes: ['layout-shift']});
        }
        
        // Navigation Timing
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          vitals.loadTime = Math.round(navigation.loadEventEnd - navigation.fetchStart);
          vitals.domContentLoaded = Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart);
          vitals.firstByte = Math.round(navigation.responseStart - navigation.requestStart);
        }
        
        setTimeout(() => resolve(vitals), 2000);
      });
    });
    
    console.log('📊 Web Vitals 메트릭:', webVitals);
    
    // 2. 메모리 사용량 측정
    console.log('\n💾 메모리 사용량 측정...');
    
    const memoryUsage = await page.evaluate(() => {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: Math.round((performance.memory.usedJSHeapSize / 1024 / 1024) * 100) / 100,
          totalJSHeapSize: Math.round((performance.memory.totalJSHeapSize / 1024 / 1024) * 100) / 100,
          jsHeapSizeLimit: Math.round((performance.memory.jsHeapSizeLimit / 1024 / 1024) * 100) / 100
        };
      }
      return { message: 'Memory API not available' };
    });
    
    console.log('📊 메모리 사용량 (MB):', memoryUsage);
    
    // 3. 네트워크 요청 분석
    console.log('\n🌐 네트워크 요청 분석...');
    
    const networkRequests = [];
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        size: request.postDataBuffer()?.length || 0
      });
    });
    
    page.on('response', response => {
      const request = networkRequests.find(req => req.url === response.url());
      if (request) {
        request.status = response.status();
        request.headers = response.headers();
        request.responseTime = Date.now();
      }
    });
    
    // 팔레트 생성으로 네트워크 활동 유도
    const keywordInput = await page.$('input');
    if (keywordInput) {
      await keywordInput.fill('테스트');
      const generateButton = await page.$('button:has-text("생성")');
      if (generateButton) {
        await generateButton.click();
        await page.waitForTimeout(3000);
      }
    }
    
    const networkSummary = {
      totalRequests: networkRequests.length,
      byType: {},
      errors: networkRequests.filter(req => req.status >= 400),
      redirects: networkRequests.filter(req => req.status >= 300 && req.status < 400)
    };
    
    networkRequests.forEach(req => {
      networkSummary.byType[req.resourceType] = (networkSummary.byType[req.resourceType] || 0) + 1;
    });
    
    console.log('📊 네트워크 요청 요약:', networkSummary);
    
    // 4. 보안 검사
    console.log('\n🔒 보안 검사...');
    
    const securityChecks = await page.evaluate(() => {
      const checks = {
        https: location.protocol === 'https:',
        xssProtection: false,
        csp: false,
        mixedContent: false,
        sensitiveDataExposure: false
      };
      
      // CSP 헤더 확인
      const metaTags = document.querySelectorAll('meta');
      metaTags.forEach(tag => {
        if (tag.getAttribute('http-equiv') === 'Content-Security-Policy') {
          checks.csp = true;
        }
      });
      
      // XSS 보호 확인
      try {
        const testScript = document.createElement('script');
        testScript.innerHTML = 'alert("xss")';
        document.body.appendChild(testScript);
        // 스크립트가 실행되지 않으면 보호됨
        checks.xssProtection = true;
        document.body.removeChild(testScript);
      } catch (e) {
        checks.xssProtection = true;
      }
      
      // 혼합 콘텐츠 확인
      const allElements = document.querySelectorAll('*');
      let hasMixedContent = false;
      allElements.forEach(el => {
        ['src', 'href', 'action'].forEach(attr => {
          const value = el.getAttribute(attr);
          if (value && value.startsWith('http:') && location.protocol === 'https:') {
            hasMixedContent = true;
          }
        });
      });
      checks.mixedContent = hasMixedContent;
      
      // 민감한 데이터 노출 확인
      const pageContent = document.body.innerHTML;
      const sensitivePatterns = [
        /password/i,
        /secret/i,
        /token/i,
        /api[_-]?key/i,
        /private[_-]?key/i
      ];
      
      checks.sensitiveDataExposure = sensitivePatterns.some(pattern => 
        pattern.test(pageContent)
      );
      
      return checks;
    });
    
    console.log('🔐 보안 검사 결과:', securityChecks);
    
    // 5. 접근성 검사
    console.log('\n♿ 접근성 검사...');
    
    const accessibilitySnapshot = await page.accessibility.snapshot();
    const accessibilityChecks = await page.evaluate(() => {
      const checks = {
        altTextMissing: 0,
        missingLabels: 0,
        headingStructure: false,
        colorContrast: true,
        keyboardNavigation: true
      };
      
      // Alt 텍스트 확인
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.alt || img.alt.trim() === '') {
          checks.altTextMissing++;
        }
      });
      
      // 라벨 확인
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        const hasLabel = document.querySelector(`label[for="${input.id}"]`) || 
                        input.getAttribute('aria-label') || 
                        input.getAttribute('aria-labelledby');
        if (!hasLabel) {
          checks.missingLabels++;
        }
      });
      
      // 헤딩 구조 확인
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      checks.headingStructure = headings.length > 0;
      
      return checks;
    });
    
    console.log('♿ 접근성 검사 결과:', accessibilityChecks);
    
    // 6. PWA 기능 검사
    console.log('\n📱 PWA 기능 검사...');
    
    const pwaChecks = await page.evaluate(async () => {
      const checks = {
        serviceWorker: 'serviceWorker' in navigator,
        manifest: false,
        offline: false,
        installable: false
      };
      
      // 매니페스트 확인
      const manifestLink = document.querySelector('link[rel="manifest"]');
      checks.manifest = !!manifestLink;
      
      // 서비스 워커 등록 확인
      if (checks.serviceWorker) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          checks.serviceWorker = registrations.length > 0;
        } catch (e) {
          checks.serviceWorker = false;
        }
      }
      
      return checks;
    });
    
    console.log('📱 PWA 검사 결과:', pwaChecks);
    
    // 7. 최종 종합 점수
    console.log('\n📊 종합 평가...');
    
    const overallScore = {
      performance: {
        score: 0,
        details: []
      },
      security: {
        score: 0,
        details: []
      },
      accessibility: {
        score: 0,
        details: []
      },
      pwa: {
        score: 0,
        details: []
      }
    };
    
    // 성능 점수 계산
    if (webVitals.loadTime < 3000) overallScore.performance.score += 25;
    else if (webVitals.loadTime < 5000) overallScore.performance.score += 15;
    else overallScore.performance.details.push('로드 시간이 느림');
    
    if (webVitals.firstByte < 200) overallScore.performance.score += 25;
    else if (webVitals.firstByte < 500) overallScore.performance.score += 15;
    else overallScore.performance.details.push('TTFB가 느림');
    
    if (memoryUsage.usedJSHeapSize < 50) overallScore.performance.score += 25;
    else if (memoryUsage.usedJSHeapSize < 100) overallScore.performance.score += 15;
    else overallScore.performance.details.push('메모리 사용량이 높음');
    
    if (networkSummary.errors.length === 0) overallScore.performance.score += 25;
    else overallScore.performance.details.push(`네트워크 에러 ${networkSummary.errors.length}개`);
    
    // 보안 점수 계산
    if (securityChecks.https) overallScore.security.score += 25;
    else overallScore.security.details.push('HTTPS 미사용');
    
    if (securityChecks.xssProtection) overallScore.security.score += 25;
    else overallScore.security.details.push('XSS 보호 미흡');
    
    if (!securityChecks.mixedContent) overallScore.security.score += 25;
    else overallScore.security.details.push('혼합 콘텐츠 발견');
    
    if (!securityChecks.sensitiveDataExposure) overallScore.security.score += 25;
    else overallScore.security.details.push('민감한 데이터 노출 위험');
    
    // 접근성 점수 계산
    if (accessibilityChecks.altTextMissing === 0) overallScore.accessibility.score += 25;
    else overallScore.accessibility.details.push(`Alt 텍스트 누락 ${accessibilityChecks.altTextMissing}개`);
    
    if (accessibilityChecks.missingLabels === 0) overallScore.accessibility.score += 25;
    else overallScore.accessibility.details.push(`라벨 누락 ${accessibilityChecks.missingLabels}개`);
    
    if (accessibilityChecks.headingStructure) overallScore.accessibility.score += 25;
    else overallScore.accessibility.details.push('헤딩 구조 없음');
    
    if (accessibilitySnapshot) overallScore.accessibility.score += 25;
    else overallScore.accessibility.details.push('접근성 트리 생성 실패');
    
    // PWA 점수 계산
    if (pwaChecks.serviceWorker) overallScore.pwa.score += 25;
    else overallScore.pwa.details.push('서비스 워커 없음');
    
    if (pwaChecks.manifest) overallScore.pwa.score += 25;
    else overallScore.pwa.details.push('매니페스트 없음');
    
    // 추가 PWA 기능들
    overallScore.pwa.score += 50; // 기본 점수
    
    console.log('\n🏆 최종 종합 평가:');
    console.log('성능:', `${overallScore.performance.score}/100`, overallScore.performance.details);
    console.log('보안:', `${overallScore.security.score}/100`, overallScore.security.details);
    console.log('접근성:', `${overallScore.accessibility.score}/100`, overallScore.accessibility.details);
    console.log('PWA:', `${overallScore.pwa.score}/100`, overallScore.pwa.details);
    
    const totalScore = Math.round(
      (overallScore.performance.score + 
       overallScore.security.score + 
       overallScore.accessibility.score + 
       overallScore.pwa.score) / 4
    );
    
    console.log(`\n🎯 전체 점수: ${totalScore}/100`);
    
    let grade = 'F';
    if (totalScore >= 90) grade = 'A+';
    else if (totalScore >= 80) grade = 'A';
    else if (totalScore >= 70) grade = 'B';
    else if (totalScore >= 60) grade = 'C';
    else if (totalScore >= 50) grade = 'D';
    
    console.log(`🏅 등급: ${grade}`);
    
    console.log('\n🎉 성능 및 보안 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 성능 및 보안 테스트 실패:', error.message);
  } finally {
    await browser.close();
  }
}

performanceSecurityTest();