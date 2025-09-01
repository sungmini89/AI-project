# 🛠️ 개발 환경 설정

AI 색상 팔레트 생성기의 로컬 개발 환경 설정과 기여 가이드입니다.

## 📋 사전 요구사항

### 필수 도구
- **Node.js**: v18.0.0+ (LTS 권장)
- **npm**: v8.0.0+ (Node.js와 함께 설치)
- **Git**: v2.30.0+

### 권장 도구
- **Visual Studio Code**: 공식 에디터
- **Chrome DevTools**: 디버깅 및 접근성 테스트
- **Figma**: 디자인 시스템 참조

### VS Code 확장 프로그램
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next", 
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-playwright.playwright",
    "deque-systems.vscode-axe-linter"
  ]
}
```

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
# HTTPS 방식
git clone https://github.com/your-repo/ai-color-palette-generator.git

# SSH 방식 (권장)
git clone git@github.com:your-repo/ai-color-palette-generator.git

cd ai-color-palette-generator
```

### 2. 의존성 설치
```bash
npm install

# 개발 의존성까지 모두 설치 확인
npm ci
```

### 3. 환경 변수 설정
```bash
# .env.example을 복사하여 .env 파일 생성
cp .env.example .env

# .env 파일 편집 (필수 항목만)
VITE_API_MODE=free
VITE_APP_TITLE="AI 색상 팔레트 생성기"
```

### 4. 개발 서버 실행
```bash
npm run dev

# 브라우저에서 http://localhost:5173 접속
```

## 📁 프로젝트 구조

```
ai-color-palette-generator/
├── 📁 public/                 # 정적 자산
│   ├── icons/                # PWA 아이콘
│   ├── manifest.json         # PWA 매니페스트
│   └── sw.js                # Service Worker
├── 📁 src/                   # 소스 코드
│   ├── 📁 components/        # React 컴포넌트
│   │   ├── ui/              # 재사용 UI 컴포넌트
│   │   ├── features/        # 기능별 컴포넌트
│   │   └── layout/          # 레이아웃 컴포넌트
│   ├── 📁 hooks/            # 커스텀 훅
│   ├── 📁 lib/              # 유틸리티 및 설정
│   ├── 📁 types/            # TypeScript 타입 정의
│   ├── 📁 styles/           # 스타일 시트
│   └── App.tsx              # 메인 앱 컴포넌트
├── 📁 tests/                # 테스트 파일
│   ├── e2e/                # E2E 테스트 (Playwright)
│   ├── fixtures/           # 테스트 데이터
│   └── accessibility.spec.ts # 접근성 테스트
├── 📁 docs/                 # 프로젝트 문서
├── 📁 .github/              # GitHub 설정
│   ├── workflows/          # CI/CD 파이프라인
│   └── ISSUE_TEMPLATE/     # 이슈 템플릿
└── 📄 설정 파일들
    ├── vite.config.ts      # Vite 설정
    ├── tailwind.config.js  # Tailwind CSS 설정
    ├── playwright.config.ts # E2E 테스트 설정
    └── tsconfig.json       # TypeScript 설정
```

## 🔧 개발 스크립트

### 기본 스크립트
```bash
# 개발 서버 실행 (HMR 지원)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 타입 체크
npx tsc --noEmit

# 린트 검사
npm run lint

# 코드 포맷팅
npm run format
```

### 테스트 스크립트
```bash
# 전체 E2E 테스트 실행
npm run test:e2e

# Playwright UI 모드로 테스트
npm run test:e2e:ui

# 접근성 테스트만 실행
npm run test:e2e:accessibility

# 성능 테스트
npm run test:performance

# 크로스 브라우저 테스트
npm run test:cross-browser
```

### 분석 도구
```bash
# 번들 크기 분석
npm run build:analyze

# 라이트하우스 테스트
npm run lighthouse

# 패키지 크기 검사
npm run size-check
```

## 🏗️ 아키텍처 개요

### 기술 스택
```typescript
// 핵심 프레임워크
React 18.2+         // UI 라이브러리
TypeScript 5.0+     // 타입 안전성
Vite 4.4+          // 빌드 도구
Tailwind CSS 3.3+  // 스타일링

// 상태 관리
Zustand            // 가벼운 상태 관리
React Query        // 서버 상태 관리

// 라우팅
React Router 6     // SPA 라우팅

// 색상 처리  
node-vibrant       // 이미지 색상 추출
colord            // 색상 변환 및 조작

// 테스팅
Playwright        // E2E 테스트
@axe-core/react   // 접근성 테스트

// 빌드 및 배포
Vercel            // 호스팅 플랫폼  
GitHub Actions    // CI/CD
Workbox           // PWA Service Worker
```

### 컴포넌트 아키텍처
```
Atomic Design 패턴 적용:
├── Atoms: Button, Input, ColorSwatch
├── Molecules: ColorPicker, HarmonySelector  
├── Organisms: PaletteGenerator, ImageExtractor
└── Pages: GeneratorPage, SavedPage, ExtractPage
```

### 상태 관리 패턴
```typescript
// Zustand를 활용한 전역 상태
interface AppState {
  // 색상 팔레트 상태
  currentPalette: Color[];
  savedPalettes: SavedPalette[];
  
  // UI 상태
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  
  // 설정
  apiMode: 'free' | 'premium' | 'offline';
  harmonyRule: HarmonyRule;
}
```

## 🎨 스타일 가이드

### Tailwind CSS 커스터마이제이션
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    }
  }
}
```

### CSS 변수 활용
```css
/* src/styles/globals.css */
:root {
  /* 색상 시스템 */
  --color-primary: hsl(220, 91%, 60%);
  --color-secondary: hsl(160, 51%, 49%);
  
  /* 간격 시스템 */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  
  /* 애니메이션 */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
}
```

### 컴포넌트 네이밍 규칙
```typescript
// 파일명: PascalCase
ColorPaletteGenerator.tsx

// 컴포넌트명: PascalCase  
export const ColorPaletteGenerator = () => {
  
// Props 인터페이스: 컴포넌트명 + Props
interface ColorPaletteGeneratorProps {
  
// 핸들러 함수: handle + 동작
const handlePaletteGenerate = () => {
  
// 상태명: 명확한 의미
const [isGenerating, setIsGenerating] = useState(false);
```

## 🧪 테스트 전략

### 테스트 피라미드
```
E2E Tests (10%)
├── 핵심 사용자 플로우
├── 크로스 브라우저 호환성
└── 접근성 자동화 검증

Integration Tests (20%)  
├── 컴포넌트 간 상호작용
├── API 통합 테스트
└── 상태 관리 테스트

Unit Tests (70%)
├── 색상 변환 함수
├── 유틸리티 함수  
└── 커스텀 훅
```

### E2E 테스트 작성 예시
```typescript
// tests/e2e/palette-generation.spec.ts
test('키워드 기반 팔레트 생성', async ({ page }) => {
  await page.goto('/generator');
  
  // 키워드 입력
  await page.fill('[data-testid="keyword-input"]', '바다');
  
  // 조화 규칙 선택  
  await page.selectOption('[data-testid="harmony-select"]', 'analogous');
  
  // 팔레트 생성
  await page.click('[data-testid="generate-button"]');
  
  // 결과 확인
  await expect(page.locator('[data-testid="color-palette"]')).toBeVisible();
  await expect(page.locator('[data-testid="color-swatch"]')).toHaveCount(5);
});
```

### 접근성 테스트 설정
```typescript
// tests/setup/accessibility.ts
import { injectAxe, checkA11y } from 'axe-playwright';

test.beforeEach(async ({ page }) => {
  await injectAxe(page);
});

test.afterEach(async ({ page }) => {
  await checkA11y(page);
});
```

## 🚀 배포 가이드

### Vercel 배포 (자동)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests  
        run: npm run test:e2e
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
```

### 환경별 설정
```typescript
// src/lib/config.ts
const config = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    debug: true
  },
  production: {
    apiUrl: 'https://api.your-domain.com',
    debug: false
  }
}

export default config[process.env.NODE_ENV];
```

## 🔍 디버깅 도구

### React DevTools 설정
```javascript
// vite.config.ts 개발 모드 설정
export default defineConfig({
  plugins: [
    react(),
    // React DevTools 지원
    process.env.NODE_ENV === 'development' && 
    reactRefresh()
  ]
});
```

### Chrome DevTools 활용
```typescript
// 개발용 디버그 함수
if (process.env.NODE_ENV === 'development') {
  (window as any).debugColorUtils = {
    generatePalette,
    convertColor,
    calculateContrast
  };
}

// Console에서 사용:
// debugColorUtils.generatePalette('바다', 'analogous')
```

### Lighthouse CI 설정
```javascript
// lighthouse-config.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }]
      }
    }
  }
}
```

## 🤝 기여 가이드

### Git 워크플로우
```bash
# 1. 이슈 확인 및 브랜치 생성
git checkout -b feature/color-blindness-support

# 2. 개발 및 커밋
git add .
git commit -m "feat: 색맹 시뮬레이션 기능 추가

- Protanopia, Deuteranopia 필터 구현
- 접근성 도구 패널에 토글 버튼 추가  
- WCAG 2.1 AA 기준 색상 대비 자동 검증

Closes #42"

# 3. 푸시 및 PR 생성
git push origin feature/color-blindness-support
```

### 커밋 메시지 규칙
```
type(scope): 간단한 설명

상세한 설명 (선택사항)

Fixes #이슈번호

Types:
- feat: 새로운 기능
- fix: 버그 수정  
- docs: 문서화
- style: 코드 스타일 (포맷팅, 세미콜론 등)
- refactor: 리팩토링
- test: 테스트 추가/수정
- chore: 빌드 도구, 패키지 매니저 설정 등
```

### PR 체크리스트
- [ ] 모든 테스트 통과
- [ ] 접근성 테스트 통과  
- [ ] Lighthouse 점수 기준 충족
- [ ] TypeScript 컴파일 오류 없음
- [ ] 문서 업데이트 (필요한 경우)
- [ ] 브레이킹 체인지 여부 명시

## 🐛 트러블슈팅

### 자주 발생하는 문제

#### 1. Node.js 버전 호환성
```bash
# Node 버전 확인
node --version

# nvm으로 올바른 버전 설치
nvm install 18
nvm use 18
```

#### 2. 의존성 충돌
```bash
# 패키지 락 파일 삭제 후 재설치
rm package-lock.json
rm -rf node_modules
npm install
```

#### 3. 빌드 오류
```bash
# 타입 검사
npx tsc --noEmit

# 캐시 클리어 후 재빌드
rm -rf dist .vite
npm run build
```

#### 4. 테스트 실패  
```bash
# Playwright 브라우저 재설치
npx playwright install

# 특정 테스트만 실행
npm run test:e2e -- --grep "색상 생성"
```

### 성능 최적화 팁

#### 번들 크기 최적화
```typescript
// 동적 임포트로 코드 스플리팅
const ImageExtractor = lazy(() => import('./ImageExtractor'));

// 트리 셰이킹을 위한 named import
import { generatePalette } from './colorUtils';
```

#### 메모리 사용량 최적화
```typescript
// useMemo로 비싼 계산 캐싱
const processedColors = useMemo(() => {
  return colors.map(color => processColor(color));
}, [colors]);

// useCallback으로 함수 메모이제이션  
const handleGenerate = useCallback((keyword: string) => {
  generatePalette(keyword);
}, []);
```

---

## 📞 지원 및 문의

### 개발 관련 문의
- **GitHub Discussions**: 개발 질문 및 아이디어 논의
- **GitHub Issues**: 버그 신고 및 기능 요청  
- **Discord**: 실시간 개발자 채팅 (링크 예정)

### 기여자 인정
모든 기여자는 README.md의 Contributors 섹션에 기록되며, 
significant contribution 시 AUTHORS 파일에 추가됩니다.

---

> 🚀 **함께 만들어가는 오픈소스**  
> 여러분의 기여가 더 나은 접근성과 사용자 경험을 만듭니다.  
> 작은 기여라도 큰 변화의 시작이 될 수 있습니다!