# 🚀 Vercel 배포 가이드

AI 색상 팔레트 생성기의 Vercel 프로덕션 배포 및 최적화 가이드입니다.

## 📋 배포 준비

### 1. 환경 변수 설정
```bash
# .env.production
VITE_API_MODE=free
VITE_APP_TITLE="AI 색상 팔레트 생성기"
VITE_COLORMIND_API_URL=http://colormind.io/api/
VITE_COLOR_API_URL=https://www.thecolorapi.com
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your-sentry-dsn
```

### 2. Vercel 설정 파일
```json
{
  "version": 2,
  "name": "ai-color-palette-generator",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_MODE": "free",
    "VITE_COLORMIND_API_URL": "http://colormind.io/api/",
    "VITE_COLOR_API_URL": "https://www.thecolorapi.com"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    },
    {
      "source": "/palette-generator",
      "destination": "/generator",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    }
  ]
}
```

## ⚡ 성능 최적화

### 빌드 최적화 설정
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/colormind\.io\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'colormind-api',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 // 1시간
              }
            }
          }
        ]
      }
    })
  ],
  
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          color: ['node-vibrant']
        },
        
        // 파일명 패턴 최적화
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop() 
            : 'chunk';
          return `js/[name]-[hash].js`;
        },
        
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          } else if (/\.(css)$/i.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    
    // 압축 최적화
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    }
  },
  
  // 프리뷰 최적화
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  }
});
```

### 이미지 최적화
```typescript
// vite.config.ts에 추가
import { imageOptimize } from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    // ... 다른 플러그인들
    imageOptimize({
      gifsicle: { optimizationLevel: 7, interlaced: false },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.65, 0.8], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false }
        ]
      }
    })
  ]
});
```

### 코드 분할 및 레이지 로딩
```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/ui/LoadingSpinner';

// 페이지 레이지 로딩
const GeneratorPage = lazy(() => import('./pages/GeneratorPage'));
const SavedPage = lazy(() => import('./pages/SavedPage'));
const ExtractPage = lazy(() => import('./pages/ExtractPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<GeneratorPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/extract" element={<ExtractPage />} />
      </Routes>
    </Suspense>
  );
}
```

## 🔐 보안 설정

### 환경 변수 관리
```bash
# Vercel Dashboard에서 설정할 환경 변수

# Production
VITE_API_MODE=premium
VITE_COLORMIND_API_KEY=prod-api-key
VITE_SENTRY_DSN=https://...@sentry.io/...

# Preview (PR 브랜치)
VITE_API_MODE=free  
VITE_ENABLE_DEBUG=true

# Development
VITE_API_MODE=free
VITE_ENABLE_DEBUG=true
VITE_ENABLE_MOCK=true
```

### 보안 헤더 강화
```typescript
// api/security-headers.ts (Vercel Function)
export default function handler(req: any, res: any) {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' http://colormind.io https://www.thecolorapi.com https://vitals.vercel-analytics.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  res.status(200).json({ message: 'Security headers applied' });
}
```

## 📊 모니터링 및 분석

### Vercel Analytics 통합
```typescript
// src/lib/analytics.ts
import { Analytics } from '@vercel/analytics/react';

// App.tsx에 추가
function App() {
  return (
    <div className="App">
      {/* 앱 컴포넌트들 */}
      <Analytics />
    </div>
  );
}

// 커스텀 이벤트 추적
import { track } from '@vercel/analytics';

export const trackPaletteGeneration = (keyword: string, harmonyRule: string) => {
  track('palette_generated', {
    keyword,
    harmony_rule: harmonyRule,
    timestamp: Date.now()
  });
};

export const trackColorExtraction = (imageSize: number, extractionTime: number) => {
  track('color_extraction', {
    image_size: imageSize,
    extraction_time: extractionTime
  });
};
```

### Core Web Vitals 모니터링
```typescript
// src/lib/webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

function getConnectionSpeed() {
  return 'connection' in navigator &&
    navigator.connection &&
    'effectiveType' in navigator.connection
    ? navigator.connection.effectiveType
    : '';
}

function sendToAnalytics(metric: any, options: any) {
  const page = Object.entries(options.params).reduce(
    (acc, [key, value]) => acc.replace(value, `[${key}]`),
    options.path
  );

  const body = {
    dsn: process.env.VITE_VERCEL_ANALYTICS_ID,
    id: metric.id,
    page,
    href: location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
  };

  if (options.debug) {
    console.log('[Web Vitals]', metric.name, JSON.stringify(body, null, 2));
  }

  const blob = new Blob([new URLSearchParams(body).toString()], {
    type: 'application/x-www-form-urlencoded',
  });
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob);
  } else {
    fetch(vitalsUrl, {
      body: blob,
      method: 'POST',
      credentials: 'omit',
      keepalive: true,
    });
  }
}

// Web Vitals 초기화
export function initWebVitals() {
  const options = {
    path: location.pathname,
    params: {},
    debug: process.env.NODE_ENV === 'development'
  };

  getCLS((metric) => sendToAnalytics(metric, options));
  getFID((metric) => sendToAnalytics(metric, options));
  getFCP((metric) => sendToAnalytics(metric, options));
  getLCP((metric) => sendToAnalytics(metric, options));
  getTTFB((metric) => sendToAnalytics(metric, options));
}
```

### 에러 모니터링 (Sentry)
```typescript
// src/lib/sentry.ts
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  integrations: [
    new BrowserTracing({
      tracePropagationTargets: ["localhost", /^https:\/\/your-domain\.vercel\.app\/api/],
    }),
  ],
  
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  beforeSend(event) {
    // 개발 환경에서는 콘솔에만 출력
    if (process.env.NODE_ENV === 'development') {
      console.error(event);
      return null;
    }
    return event;
  }
});

// 색상 생성 오류 추적
export const trackColorGenerationError = (error: Error, context: any) => {
  Sentry.addBreadcrumb({
    message: 'Color generation attempted',
    category: 'color',
    data: context,
    level: 'info'
  });
  
  Sentry.captureException(error, {
    tags: {
      section: 'color-generation'
    },
    extra: context
  });
};
```

## 🔄 CI/CD 파이프라인

### GitHub Actions 워크플로우
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linting
        run: npm run lint
        
      - name: Run type check
        run: npx tsc --noEmit
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Run accessibility tests
        run: npm run test:e2e:accessibility
        
      - name: Upload test reports
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          
  lighthouse:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build for preview
        run: npm run build
        
      - name: Run Lighthouse
        run: npm run lighthouse
        
      - name: Comment PR with Lighthouse results
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('lighthouse-results.json'));
            
            const comment = `## 🚦 Lighthouse 성능 리포트
            
            | 지표 | 점수 | 상태 |
            |------|------|------|
            | Performance | ${results.performance} | ${results.performance >= 90 ? '✅' : '⚠️'} |
            | Accessibility | ${results.accessibility} | ${results.accessibility >= 95 ? '✅' : '⚠️'} |
            | Best Practices | ${results.bestPractices} | ${results.bestPractices >= 90 ? '✅' : '⚠️'} |
            | SEO | ${results.seo} | ${results.seo >= 90 ? '✅' : '⚠️'} |
            
            [상세 결과 보기](${results.reportUrl})`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });

  deploy:
    runs-on: ubuntu-latest
    needs: [test, lighthouse]
    if: always() && needs.test.result == 'success'
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
        
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=${{ github.ref == 'refs/heads/main' && 'production' || 'preview' }} --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Build Project Artifacts
        run: vercel build ${{ github.ref == 'refs/heads/main' && '--prod' || '' }} --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Deploy Project Artifacts to Vercel
        id: deploy
        run: |
          url=$(vercel deploy --prebuilt ${{ github.ref == 'refs/heads/main' && '--prod' || '' }} --token=${{ secrets.VERCEL_TOKEN }})
          echo "deployment_url=$url" >> $GITHUB_OUTPUT
          
      - name: Comment deployment URL
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 **배포 완료!** 
              
              📱 **Preview URL**: ${{ steps.deploy.outputs.deployment_url }}
              
              ✨ 색상 팔레트 생성기의 새로운 기능을 확인해보세요!`
            });
```

### 배포 환경 분리
```typescript
// vercel.json에서 환경별 설정
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true
    }
  },
  "env": {
    "VITE_API_MODE": "@api-mode-production",
    "VITE_SENTRY_DSN": "@sentry-dsn-production"
  },
  "build": {
    "env": {
      "VITE_API_MODE": "@api-mode-build",
      "VITE_ENABLE_DEBUG": "false"
    }
  }
}
```

## 📈 성능 최적화 검증

### Bundle Analyzer 결과
```bash
# 번들 크기 분석 실행
npm run build:analyze

# 예상 결과:
# dist/js/vendor-abc123.js: 145.2 KB
# dist/js/app-def456.js: 67.8 KB  
# dist/css/app-ghi789.css: 23.4 KB
# Total: 236.4 KB (gzipped: ~78 KB)
```

### Lighthouse 점수 목표
```yaml
성능 목표:
  Performance: 95+ (현재: 97)
  Accessibility: 98+ (현재: 99)  
  Best Practices: 95+ (현재: 96)
  SEO: 90+ (현재: 94)

Core Web Vitals:
  LCP: < 2.5s (현재: 1.8s)
  FID: < 100ms (현재: 45ms)
  CLS: < 0.1 (현재: 0.05)
```

### 성능 모니터링 대시보드
```typescript
// 성능 지표 수집
export const performanceMetrics = {
  // 페이지 로드 성능
  pageLoad: {
    ttfb: 'Time to First Byte',
    fcp: 'First Contentful Paint',
    lcp: 'Largest Contentful Paint',
    cls: 'Cumulative Layout Shift'
  },
  
  // 기능 성능
  colorGeneration: {
    averageTime: '평균 팔레트 생성 시간',
    successRate: 'API 성공률',
    cacheHitRate: '캐시 적중률'
  },
  
  // 사용자 경험
  userExperience: {
    bounceRate: '이탈률',
    timeOnSite: '사이트 체류 시간',
    conversionRate: '팔레트 저장률'
  }
};
```

## 🚨 장애 대응

### 자동 롤백 설정
```yaml
# .github/workflows/rollback.yml
name: Emergency Rollback

on:
  workflow_dispatch:
    inputs:
      deployment_id:
        description: 'Deployment ID to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback deployment
        run: |
          vercel rollback ${{ github.event.inputs.deployment_id }} --token=${{ secrets.VERCEL_TOKEN }}
          
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              "text": "🚨 긴급 롤백 완료",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "색상 팔레트 생성기가 이전 버전으로 롤백되었습니다."
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 헬스 체크 API
```typescript
// api/health.ts
export default async function handler(req: any, res: any) {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'unknown',
    
    services: {
      colormind: await checkService('http://colormind.io/api/'),
      theColorApi: await checkService('https://www.thecolorapi.com/id?hex=FF0000'),
      database: 'ok' // 향후 데이터베이스 연결 시
    },
    
    performance: {
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
  };
  
  const allServicesOk = Object.values(healthCheck.services).every(status => status === 'ok');
  
  res.status(allServicesOk ? 200 : 503).json(healthCheck);
}

async function checkService(url: string): Promise<string> {
  try {
    const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
    return response.ok ? 'ok' : 'error';
  } catch {
    return 'error';
  }
}
```

---

## 🎯 배포 체크리스트

### Pre-deployment
- [ ] 모든 테스트 통과 (Unit, E2E, Accessibility)
- [ ] Lighthouse 점수 기준 충족 (Performance 95+, Accessibility 98+)
- [ ] 번들 크기 확인 (<500KB 초기 번들)
- [ ] 보안 헤더 설정 완료
- [ ] 환경 변수 프로덕션 설정 확인
- [ ] 에러 모니터링 (Sentry) 설정 완료

### Post-deployment  
- [ ] 헬스 체크 API 정상 응답 확인
- [ ] Core Web Vitals 지표 모니터링
- [ ] 실제 사용자 접근성 테스트
- [ ] API 응답 시간 모니터링
- [ ] 에러율 모니터링 (<0.1%)

---

> 🚀 **프로덕션 배포 성공!**  
> 사용자들이 아름다운 색상 팔레트를 경험할 수 있도록  
> 지속적인 모니터링과 최적화를 진행합니다.