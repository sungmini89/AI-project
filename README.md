# AI 코드 리뷰어 🤖

> **무료로 사용할 수 있는 AI 기반 코드 품질 분석 및 리뷰 도구**  
> 브라우저에서 바로 사용 가능하며 오프라인 모드도 지원합니다.

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://ai-code-review.vercel.app)
[![React](https://img.shields.io/badge/React-18.0.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

## 📋 목차

- [🌟 주요 기능](#-주요-기능)
- [🚀 빠른 시작](#-빠른-시작)
- [🏗️ 프로젝트 구조](#️-프로젝트-구조)
- [📋 PRD (Product Requirements Document)](#-prd-product-requirements-document)
- [🛠️ 기술 스택](#️-기술-스택)
- [🔧 개발 환경 설정](#-개발-환경-설정)
- [📊 분석 기능 상세](#-분석-기능-상세)
- [🐛 트러블슈팅 가이드](#-트러블슈팅-가이드)
- [✨ 개선된 부분들](#-개선된-부분들)
- [📱 PWA 설치](#-pwa-설치)
- [🔑 API 키 발급](#-api-키-발급)
- [📈 사용량 제한](#-사용량-제한)
- [🤝 기여하기](#-기여하기)

## 🌟 주요 기능

### 📊 **오프라인 분석 (무료, 무제한)**

- **ESLint 기반 코드 품질 검사**: JavaScript/TypeScript 코드의 품질을 실시간으로 검사
- **McCabe 복잡도 분석**: 순환 복잡도와 인지 복잡도를 계산하여 코드의 가독성 평가
- **보안 패턴 검사**: SQL 인젝션, XSS, 하드코딩된 인증정보 등 보안 취약점 탐지
- **Prettier 코드 포맷팅**: 일관된 코드 스타일을 위한 자동 포맷팅

### 🤖 **AI 기반 분석**

- **Google Gemini API**: 고급 AI 코드 분석 및 개선 제안 (무료 티어: 1,500회/일)
- **Cohere API**: 대안 AI 분석 서비스 (무료 티어: 1,000회/월)
- **오프라인 대체**: API 사용량 초과 시 자동으로 오프라인 모드로 전환

### 🛠️ **지원 기능**

- **12개 프로그래밍 언어 지원**: JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin
- **PWA 지원**: 오프라인 사용 가능, 앱처럼 설치 가능
- **다크/라이트 테마**: 시스템 설정 연동 가능
- **코드 히스토리 관리**: 분석 결과 저장 및 북마크
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원

## 🚀 빠른 시작

### 🌐 **온라인 사용**

웹사이트에 접속하여 바로 사용하세요: **[https://ai-code-review.vercel.app](https://ai-code-review.vercel.app)**

### 💻 **로컬 개발 환경 설정**

```bash
# 저장소 클론
git clone https://github.com/your-username/ai-code-review.git
cd ai-code-review

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 코드 품질 검사
npm run lint

# 테스트 실행
npm run test
```

## 🏗️ 프로젝트 구조

```
ai-code-review/
├── 📁 public/                    # 정적 파일
│   ├── 📁 icons/                # PWA 아이콘 (16x16 ~ 512x512)
│   ├── 📄 manifest.json         # PWA 매니페스트
│   ├── 📄 sw.js                 # 서비스 워커 (오프라인 지원)
│   └── 📁 screenshots/          # 앱 스크린샷
├── 📁 src/
│   ├── 📁 components/           # React 컴포넌트
│   │   ├── 📁 features/         # 핵심 기능 컴포넌트
│   │   │   ├── 📄 CodeEditor.tsx        # Monaco Editor 기반 코드 에디터
│   │   │   ├── 📄 AnalysisControls.tsx  # 분석 옵션 제어
│   │   │   ├── 📄 AnalysisResults.tsx   # 분석 결과 표시
│   │   │   ├── 📄 LanguageSelector.tsx  # 프로그래밍 언어 선택
│   │   │   └── 📁 analysis/             # 분석 탭 컴포넌트들
│   │   │       ├── 📄 OverviewTab.tsx   # 전체 분석 요약
│   │   │       ├── 📄 ESLintTab.tsx     # ESLint 결과
│   │   │       ├── 📄 ComplexityTab.tsx # 복잡도 분석
│   │   │       ├── 📄 SecurityTab.tsx   # 보안 검사
│   │   │       ├── 📄 AITab.tsx         # AI 분석 결과
│   │   │       └── 📄 PrettierTab.tsx   # 코드 포맷팅
│   │   ├── 📁 layout/           # 레이아웃 컴포넌트
│   │   └── 📁 ui/               # 재사용 UI 컴포넌트
│   │       ├── 📄 ErrorBoundary.tsx     # 에러 경계
│   │       ├── 📄 NotificationManager.tsx # 알림 관리
│   │       └── 📄 LanguageSelector.tsx  # 언어 선택기
│   ├── 📁 pages/                # 페이지 컴포넌트
│   │   ├── 📄 HomePage.tsx      # 홈페이지
│   │   ├── 📄 AnalyzePage.tsx   # 코드 분석 페이지
│   │   ├── 📄 SettingsPage.tsx  # 설정 페이지
│   │   └── 📄 OfflinePage.tsx   # 오프라인 도구 페이지
│   ├── 📁 services/             # 비즈니스 로직 서비스
│   │   ├── 📄 analysisOrchestrator.ts   # 분석 오케스트레이터
│   │   ├── 📄 freeAIService.ts          # 무료 AI 서비스 (Gemini, Cohere)
│   │   ├── 📄 offlineService.ts         # 오프라인 분석 서비스
│   │   ├── 📄 formattingService.ts      # 코드 포맷팅 서비스
│   │   └── 📄 mockService.ts            # 테스트용 모의 서비스
│   ├── 📁 stores/               # Zustand 상태 관리
│   │   ├── 📄 index.ts          # 스토어 통합 내보내기
│   │   ├── 📄 settingsStore.ts  # 사용자 설정 관리
│   │   ├── 📄 codeStore.ts      # 코드 에디터 상태 관리
│   │   ├── 📄 analysisStore.ts  # 분석 결과 상태 관리
│   │   ├── 📄 uiStore.ts        # UI 상태 관리
│   │   └── 📄 languageStore.ts  # 다국어 지원
│   ├── 📁 types/                # TypeScript 타입 정의
│   │   └── 📄 index.ts          # 모든 타입 및 인터페이스
│   ├── 📁 config/               # 애플리케이션 설정
│   │   └── 📄 index.ts          # 환경별 설정 관리
│   ├── 📁 hooks/                # React 커스텀 훅
│   │   ├── 📄 useDebounce.ts    # 디바운스 훅
│   │   ├── 📄 useLanguage.ts    # 다국어 지원 훅
│   │   └── 📄 useMemoizedCallback.ts    # 메모이제이션 콜백 훅
│   ├── 📁 utils/                # 유틸리티 함수
│   │   └── 📄 secureStorage.ts  # 암호화된 로컬 스토리지
│   ├── 📄 main.tsx              # 애플리케이션 진입점
│   ├── 📄 App.tsx               # 메인 앱 컴포넌트
│   ├── 📄 index.css             # 전역 스타일
│   └── 📄 App.css               # 앱별 스타일
├── 📁 src/__tests__/            # 테스트 파일들
│   ├── 📁 components/           # 컴포넌트 테스트
│   ├── 📁 services/             # 서비스 테스트
│   ├── 📁 stores/               # 스토어 테스트
│   └── 📁 utils/                # 유틸리티 테스트
├── 📄 .env.example              # 환경 변수 예시
├── 📄 .eslintrc.js              # ESLint 설정
├── 📄 .prettierrc               # Prettier 설정
├── 📄 tailwind.config.js        # Tailwind CSS 설정
├── 📄 postcss.config.js         # PostCSS 설정
├── 📄 vite.config.ts            # Vite 빌드 설정
├── 📄 vitest.config.ts          # Vitest 테스트 설정
├── 📄 tsconfig.json             # TypeScript 설정
├── 📄 vercel.json               # Vercel 배포 설정
├── 📄 package.json              # 프로젝트 의존성
└── 📄 README.md                 # 프로젝트 문서
```

## 📋 PRD (Product Requirements Document)

### 🎯 **프로젝트 목표**

- **주요 목표**: 개발자들이 무료로 사용할 수 있는 AI 기반 코드 품질 분석 도구 제공
- **차별화 포인트**: 오프라인 모드 지원으로 API 키 없이도 기본 기능 사용 가능
- **타겟 사용자**: 프론트엔드/백엔드 개발자, 학생, 코드 리뷰어

### 📊 **핵심 요구사항**

#### **기능적 요구사항 (Functional Requirements)**

1. **코드 품질 분석**
   - ESLint 기반 정적 분석
   - McCabe 복잡도 계산
   - 보안 취약점 검사
   - 코드 포맷팅 (Prettier)

2. **AI 기반 분석**
   - Google Gemini API 연동
   - Cohere API 연동
   - 코드 개선 제안
   - 자연어 설명

3. **사용자 경험**
   - 직관적인 코드 에디터
   - 실시간 분석 결과
   - 다크/라이트 테마
   - 반응형 디자인

#### **비기능적 요구사항 (Non-Functional Requirements)**

1. **성능**
   - 페이지 로딩 시간 < 3초
   - 코드 분석 응답 시간 < 5초
   - 오프라인 모드 지원

2. **사용성**
   - 직관적인 UI/UX
   - 모바일 친화적 디자인
   - 접근성 준수

3. **보안**
   - API 키 암호화 저장
   - HTTPS 통신
   - XSS 방지

### 🔄 **사용자 스토리 (User Stories)**

#### **개발자 시나리오**

```
As a developer
I want to analyze my code quality
So that I can identify potential issues and improve my code

Acceptance Criteria:
- Upload or paste code in the editor
- Select programming language
- Run analysis with one click
- View detailed results in organized tabs
- Get actionable improvement suggestions
```

#### **학생 시나리오**

```
As a programming student
I want to understand why my code has issues
So that I can learn best practices

Acceptance Criteria:
- Clear explanation of each issue
- Examples of correct code
- Learning resources links
- Offline mode for practice
```

## 🛠️ 기술 스택

### **Frontend Framework**

- **React 18**: 최신 React 기능 활용 (Concurrent Features, Suspense)
- **TypeScript 5.8**: 정적 타입 검사 및 개발자 경험 향상
- **Tailwind CSS 3.4**: 유틸리티 우선 CSS 프레임워크

### **Build & Development Tools**

- **Vite 7.1**: 빠른 개발 서버 및 빌드 도구
- **ESLint 9.33**: 코드 품질 및 일관성 검사
- **Prettier 3.6**: 코드 포맷팅
- **PostCSS 8.5**: CSS 후처리

### **State Management & Data Flow**

- **Zustand 5.0**: 경량 상태 관리 라이브러리
- **React Router DOM 7.8**: 클라이언트 사이드 라우팅

### **Code Analysis & AI**

- **Monaco Editor**: VS Code 기반 코드 에디터
- **Google Gemini API**: AI 코드 분석
- **Cohere API**: 대안 AI 서비스
- **ESLint**: JavaScript/TypeScript 코드 품질 검사

### **PWA & Offline Support**

- **Service Worker**: 오프라인 기능 및 캐싱
- **Web App Manifest**: PWA 설치 지원
- **Workbox**: 서비스 워커 라이브러리

### **Testing & Quality**

- **Vitest 3.2**: Vite 기반 테스트 프레임워크
- **Testing Library**: React 컴포넌트 테스트
- **jsdom**: 브라우저 환경 모킹

### **Deployment & Hosting**

- **Vercel**: 자동 배포 및 CDN
- **GitHub Actions**: CI/CD 파이프라인

## 🔧 개발 환경 설정

### **필수 요구사항**

- Node.js 18.0.0 이상
- npm 9.0.0 이상
- Git 2.30.0 이상

### **환경 변수 설정**

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요:

```bash
# 개발 모드 설정
VITE_USE_MOCK_DATA=true
VITE_DEBUG_MODE=true

# API 모드 설정 (offline|free|premium|custom)
VITE_API_MODE=offline

# Google Gemini API 설정
VITE_GEMINI_API_KEY=your_api_key_here
VITE_GEMINI_DAILY_LIMIT=1500

# Cohere API 설정
VITE_COHERE_API_KEY=your_api_key_here
VITE_COHERE_MONTHLY_LIMIT=1000

# 기능 설정
VITE_ENABLE_OFFLINE_MODE=true
VITE_PWA_ENABLED=true
VITE_DEFAULT_LOCALE=ko
```

### **개발 스크립트**

```bash
# 개발 서버 (포트 5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 코드 품질 검사
npm run lint

# 코드 자동 수정
npm run lint:fix

# 테스트 실행 (감시 모드)
npm run test

# 테스트 실행 (한 번만)
npm run test:run

# 테스트 커버리지
npm run test:coverage

# 타입 체크
npm run type-check
```

## 📊 분석 기능 상세

### **ESLint 검사 규칙**

```typescript
// 주요 ESLint 규칙들
{
  "no-unused-vars": "error",        // 사용되지 않는 변수
  "no-console": "warn",             // console 사용 경고
  "prefer-const": "error",          // const 사용 권장
  "no-var": "error",                // var 사용 금지
  "eqeqeq": "error",                // 엄격한 동등 비교
  "no-eval": "error",               // eval() 사용 금지
  "no-alert": "warn",               // alert 사용 경고
  "no-debugger": "error"            // debugger 문 금지
}
```

### **복잡도 분석 알고리즘**

```typescript
// McCabe 복잡도 계산
function calculateCyclomaticComplexity(ast: AST): number {
  let complexity = 1; // 기본 복잡도

  // 조건문, 반복문, 논리 연산자 등으로 복잡도 증가
  ast.traverse((node) => {
    if (node.type === "IfStatement") complexity++;
    if (node.type === "ForStatement") complexity++;
    if (node.type === "WhileStatement") complexity++;
    if (node.type === "LogicalExpression") complexity++;
  });

  return complexity;
}
```

### **보안 검사 패턴**

```typescript
// 보안 취약점 패턴
const SECURITY_PATTERNS = {
  sqlInjection:
    /(\b(select|insert|update|delete|drop|create)\b.*\b(where|from|into)\b)/i,
  xss: /<script[^>]*>.*?<\/script>/gi,
  hardcodedCredentials:
    /(password|secret|key|token)\s*[:=]\s*['"][^'"]{8,}['"]/i,
  evalUsage: /\beval\s*\(/i,
};
```

## 🐛 트러블슈팅 가이드

### **자주 발생하는 문제들**

#### **1. 빌드 오류**

```bash
# TypeScript 컴파일 오류
npm run build

# 해결 방법
npm run type-check          # 타입 오류 확인
npm run lint:fix            # 자동 수정 가능한 오류 수정
```

#### **2. ESLint 규칙 충돌**

```bash
# ESLint 오류
npm run lint

# 해결 방법
npm run lint:fix            # 자동 수정
# 또는 .eslintrc.js에서 규칙 조정
```

#### **3. PWA 설치 문제**

```bash
# 서비스 워커 등록 실패
# 브라우저 개발자 도구 > Application > Service Workers 확인

# 해결 방법
- HTTPS 환경에서만 작동
- 브라우저 캐시 삭제
- 서비스 워커 수동 등록
```

#### **4. API 키 인증 실패**

```bash
# Gemini API 오류
Error: API key not valid

# 해결 방법
1. API 키 형식 확인 (AIza...)
2. API 키 권한 확인
3. 일일 사용량 제한 확인
4. 오프라인 모드로 전환
```

#### **5. 오프라인 모드 문제**

```bash
# 오프라인 분석 실패
Error: ESLint not available

# 해결 방법
1. 브라우저 캐시 확인
2. 서비스 워커 상태 확인
3. 개발자 도구 > Application > Storage 확인
```

### **디버깅 도구**

#### **브라우저 개발자 도구**

```javascript
// 콘솔에서 디버깅
console.log("[DEBUG] Analysis result:", result);
console.log("[DEBUG] Store state:", useAnalysisStore.getState());

// 네트워크 탭에서 API 요청 확인
// Application 탭에서 캐시 및 스토리지 확인
```

#### **React DevTools**

```bash
# React DevTools 설치
npm install -g react-devtools

# 사용법
react-devtools
```

## ✨ 개선된 부분들

### **v1.0.0 → v1.1.0 주요 개선사항**

#### **1. 코드 품질 향상**

- ✅ **JSDoc 주석 추가**: 모든 함수, 클래스, 인터페이스에 상세한 문서화
- ✅ **TypeScript 타입 강화**: 엄격한 타입 체크 및 타입 안전성 향상
- ✅ **ESLint 규칙 최적화**: 코드 일관성 및 품질 향상
- ✅ **Prettier 설정 개선**: 일관된 코드 스타일 적용

#### **2. 성능 최적화**

- ✅ **React.memo 적용**: 불필요한 리렌더링 방지
- ✅ **useMemoizedCallback**: 콜백 함수 메모이제이션
- ✅ **useDebounce 훅**: API 요청 최적화
- ✅ **Lazy Loading**: 컴포넌트 지연 로딩

#### **3. 사용자 경험 개선**

- ✅ **다국어 지원**: 한국어/영어 지원
- ✅ **테마 시스템**: 다크/라이트 테마 전환
- ✅ **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
- ✅ **접근성 향상**: ARIA 라벨, 키보드 네비게이션

#### **4. PWA 기능 강화**

- ✅ **오프라인 지원**: 서비스 워커를 통한 완전한 오프라인 기능
- ✅ **앱 설치**: 홈 화면에 앱으로 설치 가능
- ✅ **백그라운드 동기화**: 오프라인 작업 동기화
- ✅ **푸시 알림**: 실시간 알림 지원

#### **5. 테스트 커버리지 향상**

- ✅ **단위 테스트**: 모든 주요 컴포넌트 및 함수 테스트
- ✅ **통합 테스트**: API 연동 및 상태 관리 테스트
- ✅ **E2E 테스트**: 사용자 시나리오 기반 테스트
- ✅ **테스트 자동화**: CI/CD 파이프라인 통합

### **향후 개선 계획 (v1.2.0)**

#### **기능 확장**

- 🔄 **GitHub 연동**: 저장소 직접 분석
- 🔄 **팀 협업**: 코드 리뷰 공유 및 코멘트
- 🔄 **코드 히스토리**: 버전별 분석 결과 비교
- 🔄 **커스텀 규칙**: 사용자 정의 ESLint 규칙

#### **AI 기능 강화**

- 🔄 **코드 생성**: AI 기반 코드 자동 생성
- 🔄 **리팩토링 제안**: 자동 코드 개선 제안
- 🔄 **성능 분석**: 런타임 성능 예측
- 🔄 **보안 스캔**: 취약점 자동 탐지

#### **개발자 도구**

- 🔄 **VS Code 확장**: 에디터 통합
- 🔄 **CLI 도구**: 명령줄 인터페이스
- 🔄 **API 문서**: REST API 제공
- 🔄 **플러그인 시스템**: 확장 가능한 아키텍처

## 📱 PWA 설치

### **데스크톱 (Chrome, Edge)**

1. 주소창 오른쪽의 설치 아이콘 클릭
2. "설치" 버튼 클릭
3. 앱이 데스크톱에 설치됨

### **모바일 (Android)**

1. 브라우저 메뉴에서 "홈 화면에 추가" 선택
2. 앱 이름 확인 후 "추가" 클릭
3. 홈 화면에 앱 아이콘 생성

### **모바일 (iOS)**

1. Safari 공유 메뉴 열기
2. "홈 화면에 추가" 선택
3. "추가" 버튼 클릭

## 🔑 API 키 발급

### **Google Gemini API**

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에 접속
2. Google 계정으로 로그인
3. "Create API Key" 클릭
4. 생성된 API 키 복사
5. 설정 페이지에서 API 키 입력

### **Cohere API**

1. [Cohere Dashboard](https://dashboard.cohere.ai/api-keys)에 접속
2. 계정 생성 또는 로그인
3. "Create API Key" 클릭
4. API 키 복사 및 저장
5. 설정 페이지에서 API 키 입력

> 💡 **팁**: API 키 없이도 오프라인 모드로 기본 분석 기능을 모두 사용할 수 있습니다!

## 📈 사용량 제한

### **무료 API 티어**

- **Google Gemini**: 일일 1,500회 요청
- **Cohere**: 월 1,000회 요청
- **오프라인 모드**: 무제한 사용

### **사용량 관리**

- 실시간 사용량 모니터링
- 자동 오프라인 모드 전환
- 사용량 초기화 알림
- 사용량 통계 대시보드

### **사용량 초과 시**

1. 자동으로 오프라인 모드로 전환
2. 기본 분석 기능 계속 사용 가능
3. 다음 날/월까지 대기
4. 프리미엄 플랜 업그레이드 옵션

## 🤝 기여하기

### **기여 방법**

1. 이 저장소를 Fork
2. 새로운 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

### **개발 가이드라인**

- TypeScript 사용 필수
- ESLint 규칙 준수
- 테스트 코드 작성
- JSDoc 주석 추가
- 커밋 메시지 컨벤션 준수

### **이슈 리포트**

- 버그 리포트: [Issues](https://github.com/your-username/ai-code-review/issues)
- 기능 요청: [Discussions](https://github.com/your-username/ai-code-review/discussions)
- 보안 취약점: 보안 이슈로 신고

---

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

## 🙏 감사의 말

- [Google Gemini](https://ai.google.dev/) - AI 코드 분석 API 제공
- [Cohere](https://cohere.ai/) - 대안 AI 서비스 제공
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - 코드 에디터 컴포넌트
- [Vercel](https://vercel.com/) - 무료 호스팅 및 배포 플랫폼

---

**AI 코드 리뷰어**로 더 나은 코드를 작성해보세요! 🚀

> 💡 **질문이나 제안사항이 있으시면 [Issues](https://github.com/your-username/ai-code-review/issues)에 남겨주세요!**
