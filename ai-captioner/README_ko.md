# 🤖 AI 이미지 캡션 생성기

**AI 기술을 활용하여 이미지에 맞는 맞춤형 캡션을 생성하는 웹 애플리케이션**

## 📋 **목차**

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [실행 방법](#-실행-방법)
- [중요한 코드 설명](#-중요한-코드-설명)
- [AI 서비스 모드](#-ai-서비스-모드)
- [트러블슈팅](#-트러블슈팅)
- [개발 가이드](#-개발-가이드)

## 🎯 **프로젝트 개요**

AI 이미지 캡션 생성기는 업로드된 이미지를 분석하여 다양한 목적에 맞는 캡션을 자동으로 생성하는 웹 애플리케이션입니다.

**지원하는 캡션 타입:**

- **SEO 최적화**: 검색 엔진 최적화를 위한 키워드 중심 캡션
- **SNS 친화적**: 소셜 미디어에 적합한 친근하고 간결한 캡션
- **접근성**: 시각장애인을 위한 상세한 이미지 설명

## ✨ **주요 기능**

- 🖼️ **이미지 업로드**: 드래그 앤 드롭으로 간편한 이미지 업로드
- 🤖 **AI 캡션 생성**: 다양한 AI 서비스를 활용한 자동 캡션 생성
- 📝 **캡션 편집**: 생성된 캡션을 자유롭게 수정 및 편집
- 💾 **히스토리 관리**: 생성된 캡션을 로컬 스토리지에 자동 저장
- 🌓 **다크 모드**: 사용자 편의를 위한 다크/라이트 테마 지원
- 📱 **PWA 지원**: 모바일 및 데스크톱에서 앱처럼 사용 가능

## 🛠️ **기술 스택**

### **Frontend**

- **React 18** - 사용자 인터페이스 구축
- **TypeScript** - 타입 안전성 및 개발 생산성 향상
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **React Router DOM** - 클라이언트 사이드 라우팅

### **Build Tools**

- **Vite** - 빠른 개발 서버 및 빌드 도구
- **PostCSS** - CSS 후처리
- **ESLint + Prettier** - 코드 품질 및 포맷팅

### **Development Tools**

- **ESLint** - JavaScript/TypeScript 코드 품질 검사
- **Prettier** - 코드 포맷팅 자동화
- **TypeScript** - 정적 타입 검사 및 컴파일

### **AI Services**

- **Mock Service** - 테스트용 더미 데이터
- **Free AI API** - 무료 AI 서비스 연동
- **Ollama** - 로컬 AI 모델 실행
- **Custom API** - 사용자 정의 AI 서비스

### **Deployment & Hosting**

- **Vercel** - 정적 사이트 호스팅 및 자동 배포
- **PWA Support** - Progressive Web App 기능
- **Service Worker** - 오프라인 지원 및 캐싱

## 📁 **프로젝트 구조**

```
ai-captioner/                    # AI 캡션 생성기 프로젝트 루트
├── 📁 src/                      # 소스 코드
│   ├── 📁 components/           # 재사용 가능한 컴포넌트
│   │   ├── CaptionOptions.tsx      # 캡션 타입 선택 컴포넌트
│   │   ├── DropzoneUploader.tsx    # 이미지 업로드 드래그 앤 드롭
│   │   ├── HistoryPanel.tsx        # 히스토리 표시 패널
│   │   └── ModeBadge.tsx           # AI 모드 표시 배지
│   ├── 📁 hooks/                # 커스텀 React 훅
│   │   └── useTheme.ts             # 테마 관리 훅
│   ├── 📁 pages/                 # 페이지 컴포넌트
│   │   ├── Landing.tsx             # 랜딩 페이지
│   │   ├── Generator.tsx           # 메인 AI 캡션 생성기
│   │   └── History.tsx             # 생성 히스토리 페이지
│   ├── 📁 services/              # 비즈니스 로직 및 AI 서비스
│   │   ├── aiService.ts            # AI 서비스 통합 관리
│   │   ├── mockService.ts          # Mock 데이터 서비스
│   │   ├── freeAiService.ts        # 무료 AI API 서비스
│   │   ├── offlineOllamaService.ts # 로컬 Ollama AI 서비스
│   │   ├── rateLimiter.ts          # API 요청 제한 관리
│   │   └── storage.ts              # 로컬 스토리지 관리
│   ├── 📁 shared/                 # 공통 레이아웃 및 컴포넌트
│   │   └── AppLayout.tsx           # 메인 애플리케이션 레이아웃
│   ├── 📁 utils/                  # 유틸리티 함수
│   │   └── image.ts                # 이미지 처리 유틸리티
│   ├── main.tsx                   # 애플리케이션 진입점
│   ├── router.tsx                 # React Router 설정
│   ├── index.css                  # 전역 CSS 스타일
│   └── vite-env.d.ts              # Vite 환경 타입 정의
├── 📁 public/                    # 정적 파일
│   ├── manifest.webmanifest       # PWA 매니페스트
│   └── sw.js                     # Service Worker
├── 📁 dist/                      # 빌드 결과물 (배포용)
├── 📄 index.html                 # 메인 HTML 파일
├── 📄 package.json               # 프로젝트 의존성 및 스크립트
├── 📄 package-lock.json          # 의존성 잠금 파일
├── 📄 vite.config.ts             # Vite 빌드 도구 설정
├── 📄 tsconfig.json              # TypeScript 설정
├── 📄 tailwind.config.js         # Tailwind CSS 설정
├── 📄 postcss.config.js          # PostCSS 설정
├── 📄 eslint.config.js           # ESLint 설정
├── 📄 .eslintrc.cjs              # ESLint 추가 설정
├── 📄 .eslintignore              # ESLint 제외 파일
├── 📄 .prettierrc                # Prettier 설정
├── 📄 .prettierignore            # Prettier 제외 파일
├── 📄 .gitignore                 # Git 제외 파일
├── 📄 .vercelignore              # Vercel 배포 제외 파일
├── 📄 vercel.json                # Vercel 배포 설정
├── 📄 README_ko.md               # 프로젝트 문서 (한국어)
└── 📁 node_modules/              # npm 의존성 패키지들
```

> **참고**: 이 프로젝트는 독립적인 AI 이미지 캡션 생성기 애플리케이션입니다. Vite를 사용하여 빠른 개발 환경을 제공하며, TypeScript와 Tailwind CSS로 구축되었습니다.

## 🚀 **실행 방법**

### **1. 프로젝트 클론 및 의존성 설치**

```bash
# 프로젝트 클론
git clone <your-repository-url>
cd ai-captioner

# 의존성 설치
npm install
```

### **2. 환경 변수 설정**

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:

```bash
# AI 서비스 모드 설정
VITE_API_MODE=Mock          # Mock | Free | Offline | Custom
VITE_USE_MOCK_DATA=true     # Mock 모드 강제 활성화 (true/false)

# Ollama 설정 (Offline 모드 사용 시)
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama2

# Free AI API 설정
VITE_RATE_LIMIT_PER_MINUTE=30

# Custom API 설정 (Custom 모드 사용 시)
VITE_CUSTOM_API_BASE_URL=https://your-api.com
VITE_CUSTOM_API_KEY=your-api-key
```

### **3. 개발 서버 실행**

```bash
# 개발 모드로 실행
npm run dev

# 또는 특정 포트로 실행
npm run dev -- --port 3000
```

### **4. 브라우저에서 접속**

```
http://localhost:5173 (또는 설정된 포트)
```

### **5. 프로덕션 빌드**

```bash
# 프로덕션용 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### **6. Vercel 배포**

```bash
# Vercel CLI 설치 (선택사항)
npm i -g vercel

# 배포
vercel

# 또는 Git 연동으로 자동 배포
# GitHub에 푸시하면 Vercel에서 자동으로 배포
```

## 🔑 **중요한 코드 설명**

### **1. 애플리케이션 진입점 (`src/main.tsx`)**

```typescript
// React 애플리케이션을 DOM에 마운트
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
```

**역할**:

- React 앱의 시작점
- Service Worker 등록 (PWA 기능)
- 전역 CSS 스타일 적용

### **2. 라우팅 설정 (`src/router.tsx`)**

```typescript
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Landing /> },        // 홈페이지
      { path: "app", element: <Generator /> },      // AI 캡션 생성기
      { path: "history", element: <History /> },    // 생성 히스토리
    ],
  },
]);
```

**역할**:

- 클라이언트 사이드 라우팅 설정
- 중첩 라우팅으로 레이아웃과 콘텐츠 분리
- URL 기반 페이지 전환

### **3. AI 서비스 통합 (`src/services/aiService.ts`)**

```typescript
export async function generateCaption(
  fileDataUrl: string,
  type: CaptionType,
  config?: Partial<AiServiceConfig>,
): Promise<GenerateResult> {
  // 레이트 리미트 확인
  // AI 모드에 따른 서비스 호출
  // 폴백 로직 처리
  // 결과 반환
}
```

**역할**:

- 다양한 AI 서비스 모드 통합 관리
- 레이트 리미팅 및 에러 처리
- 폴백 모드 자동 전환
- 캡션 생성 결과 통합

### **4. 이미지 업로드 (`src/components/DropzoneUploader.tsx`)**

```typescript
const onDrop = useCallback(
  async (acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    const dataUrl = await fileToDataUrl(f);
    setPreview(dataUrl);
    onSelect(dataUrl, f);
  },
  [onSelect],
);
```

**역할**:

- 드래그 앤 드롭 이미지 업로드
- 파일 타입 검증
- 이미지 미리보기 생성
- Data URL 변환

### **5. 테마 관리 (`src/hooks/useTheme.ts`)**

```typescript
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem("theme", !isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", !isDark);
  };

  return { isDark, toggleTheme };
}
```

**역할**:

- 다크/라이트 테마 상태 관리
- 로컬 스토리지에 테마 설정 저장
- 시스템 테마 자동 감지
- CSS 클래스 기반 테마 전환

## 🤖 **AI 서비스 모드**

### **Mock 모드**

- **용도**: 개발 및 테스트
- **특징**: 실제 이미지 분석 없이 고정된 텍스트 반환
- **장점**: 빠른 응답, 외부 서비스 불필요
- **단점**: 사진과 무관한 캡션 생성

### **Free AI 모드**

- **용도**: 실제 사용
- **특징**: 무료 AI API를 통한 실제 이미지 분석
- **장점**: 정확한 이미지 인식, 맞춤형 캡션
- **단점**: API 한도 제한, 응답 시간

### **Offline 모드 (Ollama)**

- **용도**: 로컬 AI 모델 실행
- **특징**: 로컬 컴퓨터에서 AI 모델 실행
- **장점**: 개인정보 보호, 무제한 사용
- **단점**: Ollama 서버 설치 필요, 높은 사양 요구

### **Custom 모드**

- **용도**: 사용자 정의 AI 서비스
- **특징**: 외부 AI API 서비스 연동
- **장점**: 고품질 AI 모델, 맞춤형 설정
- **단점**: API 키 필요, 비용 발생

## 🚨 **트러블슈팅**

### **1. Vercel 배포 관련 문제**

#### **1-1. 404 오류 (Failed to load resource: the server responded with a status of 404)**

**문제 상황:**

- Vercel에서 배포 후 특정 경로(`/app`, `/history` 등)로 직접 접근 시 404 오류 발생
- 브라우저 콘솔에 "Failed to load resource: the server responded with a status of 404" 메시지 표시

**원인:**

- SPA(Single Page Application)의 클라이언트 사이드 라우팅과 서버 사이드 라우팅 간의 불일치
- React Router를 사용하지만 Vercel 서버에서 해당 경로의 파일을 찾을 수 없음
- `vercel.json`에 SPA fallback 설정이 부족

**해결 방법:**

1. **vercel.json 수정:**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "redirects": [
    { "source": "/app", "destination": "/index.html" },
    { "source": "/history", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

2. **vite.config.ts에 base URL 추가:**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "/", // 이 설정 추가
  // ... 기타 설정
});
```

#### **1-2. 빌드 오류 (sh: line 1: vite: command not found)**

**문제 상황:**

- Vercel 배포 시 "sh: line 1: vite: command not found" 오류 발생
- "Command 'vite build' exited with 127" 메시지 표시

**원인:**

- **Vercel의 production 환경에서 `devDependencies`가 설치되지 않음**
- `NODE_ENV=production`으로 설정되어 `vite`가 포함된 개발 의존성이 누락됨
- 결과적으로 `vite` 명령어를 찾을 수 없어 빌드 실패

**🔥 ULTIMATE 해결 방법 (모든 케이스 대응):**

1. **필수 빌드 도구를 dependencies로 이동:**

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-dropzone": "^14.2.3",
    "react-router-dom": "^6.26.2",
    "vite": "^5.4.2",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.4"
  },
  "devDependencies": {
    "@types/node": "^24.3.0",
    "@types/react": "^18.2.74"
    // ... 기타 개발 도구들
  }
}
```

2. **NPX 강제 사용 (PATH 문제 완전 우회):**

```json
{
  "scripts": {
    "dev": "npx vite --host",
    "build": "npx vite build",
    "preview": "npx vite preview"
  },
  "resolutions": {
    "vite": "^5.4.2"
  },
  "overrides": {
    "vite": "^5.4.2"
  }
}
```

3. **강화된 vercel.json 설정:**

```json
{
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install --production=false",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

4. **Node.js 버전 고정 (.nvmrc 파일 생성):**

```
18
```

**🎯 완벽한 해결책 (모든 방법 동시 적용):**

- **NPX 사용**: PATH 문제를 완전히 우회
- **강제 의존성 설치**: `--production=false`로 devDependencies도 강제 설치
- **이중 빌드 보장**: `npm install && npm run build`로 확실한 설치 후 빌드
- **Node.js 버전 고정**: `.nvmrc`로 환경 일관성 보장
- **패키지 매니저 호환성**: `overrides`와 `resolutions` 모두 사용

#### **1-3. Rollup 의존성 오류**

**문제:**

- Cannot find module @rollup/rollup-linux-x64-gnu 오류

**해결방법:**

```bash
# package-lock.json 재생성
rm package-lock.json
npm install

# 또는 build 스크립트에 --no-optional 플래그 추가
"build": "npm install --no-optional && npx vite build"
```

#### **1-4. npm EOVERRIDE 오류**

**문제:**

- npm error code EOVERRIDE 충돌

**원인:**

- package.json에서 overrides와 resolutions 중복 설정

**해결방법:**

```json
{
  // overrides와 resolutions 섹션 제거
  // vite를 직접 dependencies에 추가하면 불필요
}
```

#### **1-5. Vercel 자동 배포 안됨**

**문제:**

- GitHub 푸시 후 Vercel이 자동 배포하지 않음

**해결방법:**

- 수동 재배포: Vercel 대시보드 → Redeploy
- 강제 푸시: `git commit --allow-empty -m "Trigger deploy" && git push`
- Vercel 설정 확인: Settings → Git → GitHub 연결 상태

### **2. Import 별칭 오류**

**에러 메시지:**

```
[plugin:vite:import-analysis] Failed to resolve import "@/pages/Landing" from "src/router.tsx". Does the file exist?
```

**원인:**

- `tsconfig.json`에는 `@` 별칭이 설정되어 있지만, `vite.config.ts`에는 해당 별칭 설정이 없음
- TypeScript는 컴파일 시에만 별칭을 인식하고, Vite는 런타임에 별도로 별칭을 설정해야 함

**해결 방법:**

1. `@types/node` 패키지 설치:

```bash
npm install --save-dev @types/node
```

2. `vite.config.ts`에 별칭 설정 추가:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // @ 별칭을 src 폴더로 매핑
    },
  },
  define: {
    // React Router future flag 설정
    __REACT_ROUTER_FUTURE_FLAGS__: JSON.stringify({
      v7_startTransition: true,
    }),
  },
});
```

**설정 확인:**

- `tsconfig.json`의 `paths` 설정과 `vite.config.ts`의 `alias` 설정이 일치해야 함
- 두 파일 모두 `@`를 `./src` 디렉토리로 매핑해야 함

### **3. Ollama 서버 연결 오류**

**에러 메시지:**

```
POST http://localhost:11434/api/generate net::ERR_CONNECTION_REFUSED
```

**원인:**

- Ollama 서버가 실행되지 않음
- 포트 11434에 연결할 수 없음
- Mock 모드가 제대로 활성화되지 않아서 Offline 모드로 폴백됨

**해결 방법:**

1. `.env` 파일에 Mock 모드 설정 추가:

```bash
VITE_API_MODE=Mock
VITE_USE_MOCK_DATA=true
```

2. 개발 서버 재시작:

```bash
npm run dev
```

**설정 확인:**

- `.env` 파일이 ai-captioner 폴더에 위치해야 함
- `VITE_` 접두사가 반드시 필요
- Mock 모드가 우선적으로 활성화되어야 함

### **4. "Failed to fetch" 오류**

**에러 메시지:**

```
오류: Failed to fetch
```

**원인:**

- Mock 모드가 제대로 활성화되지 않음
- 환경 변수 설정 누락
- AI 서비스에서 네트워크 요청 시도

**해결 방법:**

1. `.env` 파일에 다음 설정 추가:

```bash
VITE_API_MODE=Mock
VITE_USE_MOCK_DATA=true
```

2. 개발 서버 재시작:

```bash
npm run dev
```

**설정 확인:**

- `.env` 파일이 ai-captioner 폴더에 위치해야 함
- `VITE_` 접두사가 반드시 필요
- Mock 모드가 활성화되어야 함

**💡 참고**: 이 문제는 "Ollama 서버 연결 오류"와 동일한 해결 방법을 사용합니다.

### **5. React Router Future Flag 경고**

**경고 메시지:**

```
React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7
```

**원인:**

- React Router v7 호환성을 위한 미리 알림
- 현재 버전과의 호환성 경고

**해결 방법:**
`vite.config.ts`에 future flag 추가:

```typescript
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // React Router future flag 설정
    __REACT_ROUTER_FUTURE_FLAGS__: JSON.stringify({
      v7_startTransition: true,
    }),
  },
});
```

### **6. PWA 아이콘 다운로드 오류**

**에러 메시지:**

```
Error while trying to use the following icon from the Manifest: http://localhost:5173/icons/icon-192.png
```

**원인:**

- `manifest.webmanifest`에서 참조하는 아이콘 파일이 존재하지 않음
- PWA 설정과 실제 파일 불일치

**해결 방법:**

1. `public/manifest.webmanifest` 수정:

```json
{
  "icons": [{ "src": "/favicon.ico", "sizes": "any", "type": "image/x-icon" }]
}
```

2. `src/main.tsx`에서 Service Worker 등록을 개발 환경에서 비활성화:

```typescript
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  // Service Worker 등록 코드
}
```

### **7. TypeScript 환경 변수 타입 오류**

**에러 메시지:**

```
Property 'env' does not exist on type 'ImportMeta'
```

**원인:**

- Vite 환경 변수에 대한 TypeScript 타입 정의 누락
- `import.meta.env` 사용 시 타입 체크 실패

**해결 방법:**
`src/vite-env.d.ts` 파일 생성:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MODE: string;
  readonly VITE_USE_MOCK_DATA: string;
  readonly VITE_OLLAMA_BASE_URL: string;
  readonly VITE_OLLAMA_MODEL: string;
  readonly VITE_RATE_LIMIT_PER_MINUTE: string;
  readonly VITE_CUSTOM_API_BASE_URL: string;
  readonly VITE_CUSTOM_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### **8. 캡션 생성이 작동하지 않는 문제**

**문제 상황:**

- 이미지 업로드 후 캡션 생성 버튼 클릭 시 아무 반응 없음
- 생성된 캡션이 표시되지 않음

**원인:**

- AI 서비스 모드 설정 오류
- Mock 데이터가 활성화되지 않음
- 환경 변수 로딩 실패

**해결 방법:**

1. 환경 변수 확인:

```bash
# .env 파일 내용
VITE_API_MODE=Mock
VITE_USE_MOCK_DATA=true
```

2. 브라우저 개발자 도구에서 확인:
   - Console 탭에서 에러 메시지 확인
   - Network 탭에서 API 요청 상태 확인

### **9. 다크 모드가 작동하지 않는 문제**

**문제 상황:**

- 테마 토글 버튼 클릭 시 아무 변화 없음
- 다크 모드 스타일이 적용되지 않음

**원인:**

- Tailwind CSS 다크 모드 설정 누락
- CSS 클래스 적용 실패

**해결 방법:**

1. `tailwind.config.js` 확인:

```javascript
export default {
  darkMode: "class", // 이 설정이 반드시 필요
  // ... 기타 설정
};
```

2. `src/index.css`에 다크 모드 스타일 추가:

```css
/* 다크 모드 전환 애니메이션 */
* {
  transition:
    background-color 0.2s ease-in-out,
    color 0.2s ease-in-out,
    border-color 0.2s ease-in-out;
}
```

### **10. 히스토리 저장이 작동하지 않는 문제**

**문제 상황:**

- 캡션 생성 후 히스토리에 저장되지 않음
- 히스토리 페이지에서 데이터가 표시되지 않음

**원인:**

- 로컬 스토리지 접근 권한 문제
- 브라우저 보안 정책 제한
- 데이터 형식 오류

**해결 방법:**

1. 브라우저 개발자 도구에서 확인:
   - Application > Local Storage > localhost:5173
   - `captionHistory` 키가 존재하는지 확인
   - 데이터 형식이 올바른지 확인

2. 브라우저 설정 확인:
   - 쿠키 및 사이트 데이터 허용
   - 로컬 스토리지 접근 권한 확인

### **11. 일반적인 문제 해결 순서**

1. **환경 변수 확인**: `.env` 파일이 올바르게 설정되었는지 확인
2. **개발 서버 재시작**: `npm run dev`로 서버 재시작
3. **브라우저 캐시 삭제**: 개발자 도구에서 하드 리프레시 (Ctrl+Shift+R)
4. **Console 로그 확인**: 에러 메시지와 경고 확인
5. **Network 탭 확인**: API 요청 상태 및 응답 확인

**💡 팁**: Mock 모드를 사용하면 외부 서비스 없이도 애플리케이션을 테스트할 수 있습니다.

### **12. Vercel 배포 문제 해결 체크리스트**

#### **배포 전 확인사항:**

- [ ] **🚨 의존성 구조 확인**: `vite`, `@vitejs/plugin-react`, `typescript`가 `dependencies`에 있는지 확인
- [ ] **🔧 NPX 스크립트**: `package.json`에 `"build": "npx vite build"` 설정
- [ ] **📄 .nvmrc 파일**: 프로젝트 루트에 Node.js 버전 명시 (내용: `18`)
- [ ] **⚙️ vercel.json**: `--production=false`와 이중 빌드 명령어 설정
- [ ] **🎯 vite.config.ts**: `base: "/"` 설정
- [ ] **🚫 .vercelignore**: 불필요한 파일 제외 설정

#### **배포 후 확인사항:**

- [ ] Vercel 대시보드에서 빌드 로그 확인
- [ ] 배포된 URL에서 직접 경로 접근 테스트 (`/app`, `/history`)
- [ ] 브라우저 개발자 도구에서 404 오류 확인
- [ ] 환경변수가 올바르게 설정되었는지 확인

#### **문제 발생 시 해결 순서:**

1. **🔥 Vite 명령어 오류 (ULTIMATE 해결책):**
   - **의존성 이동**: `vite`, `@vitejs/plugin-react`, `typescript`를 `dependencies`로 이동
   - **NPX 강제 사용**: 모든 스크립트에 `npx vite` 사용
   - **강제 설치**: `vercel.json`에 `"installCommand": "npm install --production=false"` 설정
   - **이중 빌드**: `"buildCommand": "npm install && npm run build"` 설정
   - **Node.js 고정**: `.nvmrc` 파일에 `18` 명시
   - **패키지 호환성**: `overrides`와 `resolutions` 모두 추가

2. **빌드 설정 오류**: `vercel.json`의 빌드 설정 및 outputDirectory 확인
3. **404 오류**: rewrites 및 redirects 설정 확인
4. **런타임 오류**: 환경변수 및 빌드 결과물 확인
5. **지속적 문제**: Vercel 프로젝트 재생성 또는 캐시 클리어 고려

**🎯 핵심**: Vite 오류는 **모든 방법을 동시에 적용**해야 확실히 해결됩니다!

#### **🔄 문제 재발 시 체크리스트:**

- [ ] **package.json**: `npx vite build` + dependencies 이동 완료?
- [ ] **vercel.json**: `--production=false` + 이중 빌드 설정 완료?
- [ ] **.nvmrc**: Node.js 18 버전 명시 완료?
- [ ] **Vercel 캐시**: 새로운 커밋으로 캐시 무효화 완료?

## 🛠️ **개발 가이드**

### **새로운 컴포넌트 추가**

1. `src/components/` 폴더에 컴포넌트 파일 생성
2. TypeScript 인터페이스 정의
3. JSDoc 주석 추가
4. Tailwind CSS로 스타일링
5. 다크 모드 지원 추가

### **새로운 AI 서비스 추가**

1. `src/services/` 폴더에 서비스 파일 생성
2. `aiService.ts`에 새로운 모드 추가
3. 환경 변수 설정 추가
4. 에러 처리 및 폴백 로직 구현

### **새로운 페이지 추가**

1. `src/pages/` 폴더에 페이지 파일 생성
2. `router.tsx`에 라우트 추가
3. `AppLayout.tsx`에 네비게이션 링크 추가
4. 다크 모드 스타일 지원

### **코드 품질 관리**

```bash
# 코드 린팅
npm run lint

# 코드 포맷팅
npm run format

# 타입 체크
npx tsc --noEmit
```

## 📚 **추가 리소스**

- [React 공식 문서](https://react.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Vite 가이드](https://vitejs.dev/guide/)
- [React Router 문서](https://reactrouter.com/)

## 🤝 **기여하기**

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성 (`feature/새기능명`)
3. 코드 작성 및 테스트
4. Pull Request 생성
5. 코드 리뷰 및 병합

## 📄 **라이선스**

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**💡 질문이나 문제가 있으시면 이슈를 생성해 주세요!**
