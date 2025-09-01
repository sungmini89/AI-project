module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/generator',
        'http://localhost:4173/saved',
        'http://localhost:4173/extract'
      ],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10000,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        formFactor: 'desktop',
        locale: 'ko-KR'
      }
    },
    assert: {
      assertions: {
        // 🎨 색상 도구 특화 성능 기준
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }], // 색상 도구 높은 접근성 기준
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals 엄격한 기준
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // 2.5초
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }], // 1.8초
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3400 }],
        
        // 색상 도구 접근성 특화 검증
        'color-contrast': ['error', { minScore: 0.95 }], // WCAG 색상 대비
        'heading-order': ['warn', { minScore: 1 }],
        'html-has-lang': ['error', { minScore: 1 }],
        'image-alt': ['error', { minScore: 1 }],
        'link-name': ['error', { minScore: 1 }],
        'meta-description': ['warn', { minScore: 1 }],
        
        // PWA 기준
        'installable-manifest': ['warn', { minScore: 1 }],
        'splash-screen': ['warn', { minScore: 1 }],
        'themed-omnibox': ['warn', { minScore: 1 }],
        'content-width': ['warn', { minScore: 1 }],
        
        // 리소스 최적화
        'unused-css-rules': ['warn', { maxLength: 10 }],
        'unused-javascript': ['warn', { maxLength: 10 }],
        'modern-image-formats': ['warn', { minScore: 0.8 }],
        'offscreen-images': ['warn', { minScore: 0.9 }],
        'render-blocking-resources': ['warn', { maxLength: 3 }],
        'unminified-css': ['error', { minScore: 1 }],
        'unminified-javascript': ['error', { minScore: 1 }],
        
        // 네트워크 효율성
        'uses-text-compression': ['warn', { minScore: 1 }],
        'uses-responsive-images': ['warn', { minScore: 0.9 }],
        'efficient-animated-content': ['warn', { minScore: 1 }],
        
        // 보안
        'is-on-https': ['error', { minScore: 1 }],
        'redirects-http': ['warn', { minScore: 1 }],
        'uses-http2': ['warn', { minScore: 1 }],
      }
    },
    upload: {
      target: 'temporary-public-storage',
      githubStatusContext: 'Lighthouse CI'
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lhci.db'
      }
    }
  }
};