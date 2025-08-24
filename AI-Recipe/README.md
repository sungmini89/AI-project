# 🍳 AI Recipe Generator

**React + TypeScript + Tailwind CSS로 구현된 지능형 레시피 생성기**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.10-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4.10-646CFF.svg)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)

## 📖 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [설치 및 실행](#-설치-및-실행)
- [환경 설정](#-환경-설정)
- [API 통합](#-api-통합)
- [오프라인 모드](#-오프라인-모드)
- [PWA 기능](#-pwa-기능)
- [개발 가이드](#-개발-가이드)
- [트러블슈팅](#-트러블슈팅)
- [배포](#-배포)
- [기여하기](#-기여하기)
- [라이선스](#-라이선스)

## 🎯 프로젝트 개요

AI Recipe Generator는 사용자가 가진 재료를 입력하면 AI와 규칙 기반 알고리즘을 통해 맞춤형 레시피를 생성하는 웹 애플리케이션입니다.

### 🌟 핵심 특징

- **🤖 AI 기반 레시피 생성**: OpenAI GPT 모델을 활용한 지능형 레시피 생성
- **🌐 다중 API 지원**: Spoonacular, Edamam API와 오프라인 데이터베이스 통합
- **📱 PWA 지원**: 모바일 앱과 같은 사용자 경험
- **🌍 다국어 지원**: 한국어/영어 완벽 지원
- **⚡ 오프라인 모드**: 인터넷 연결 없이도 레시피 검색 가능
- **🎨 반응형 디자인**: 모든 디바이스에서 최적화된 UI/UX

## ✨ 주요 기능

### 1. 🥕 재료 기반 레시피 생성

- 태그 형태의 재료 입력/삭제
- 자동완성 및 재료 제안
- 식이 제한 및 알레르기 고려

### 2. 🔍 스마트 레시피 검색

- 다중 소스 통합 검색 (API + 로컬)
- 고급 필터링 (조리시간, 칼로리, 난이도)
- 개인화된 추천 알고리즘

### 3. 📊 영양 정보 분석

- 상세한 영양 성분 표시
- 일일 영양 목표 대비 분석
- 건강 점수 및 등급

### 4. 💾 레시피 관리

- 즐겨찾기 및 저장 기능
- 개인 레시피 갤러리
- 오프라인 레시피 북

### 5. ⚙️ API 관리

- 무료 API 할당량 추적
- 자동 폴백 및 오프라인 전환
- 사용자 정의 API 키 지원

## 🛠️ 기술 스택

### Frontend

- **React 18.3.1** - 최신 React 기능과 동시성 모드
- **TypeScript 5.6.0** - 타입 안전성과 개발자 경험
- **Tailwind CSS 3.4.10** - 유틸리티 우선 CSS 프레임워크
- **shadcn/ui** - 고품질 React 컴포넌트 라이브러리

### Build Tools

- **Vite 5.4.10** - 빠른 개발 서버와 빌드 도구
- **PWA Plugin** - Progressive Web App 지원

### State Management

- **React Context API** - 전역 상태 관리
- **React Hooks** - 커스텀 훅 기반 로직 분리

### API & Services

- **Spoonacular API** - 레시피 데이터 (일 150 요청 무료)
- **Edamam Recipe API** - 대안 데이터 소스 (월 10,000 요청 무료)
- **OpenAI GPT** - AI 레시피 생성

### Testing

- **Playwright** - E2E 테스트 자동화

## 📁 프로젝트 구조

```
ai-recipe-generator/
├── src/
│   ├── components/           # React 컴포넌트
│   │   ├── ui/              # shadcn/ui 기본 컴포넌트
│   │   ├── recipe/          # 레시피 관련 컴포넌트
│   │   ├── layout/          # 레이아웃 컴포넌트
│   │   └── common/          # 공통 컴포넌트
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── HomePage.tsx     # 홈페이지
│   │   ├── SearchPage.tsx   # 검색 페이지
│   │   ├── RecipeDetailPage.tsx # 레시피 상세
│   │   ├── GenerateRecipePage.tsx # AI 생성 페이지
│   │   ├── FavoritesPage.tsx # 즐겨찾기
│   │   └── SettingsPage.tsx # 설정 페이지
│   ├── services/            # 비즈니스 로직 서비스
│   │   ├── api/             # API 클라이언트
│   │   │   ├── unifiedApiClient.ts    # 통합 API 클라이언트
│   │   │   ├── spoonacularClient.ts   # Spoonacular API
│   │   │   ├── offlineClient.ts       # 오프라인 데이터
│   │   │   └── simpleApiClient.ts     # 간단 API 클라이언트
│   │   ├── aiService.ts     # AI 레시피 생성
│   │   ├── storageService.ts # 로컬 저장소
│   │   └── translationService.ts # 다국어 지원
│   ├── hooks/               # 커스텀 React 훅
│   │   ├── useSettings.ts   # 설정 관리
│   │   ├── useRecipes.ts    # 레시피 관리
│   │   ├── useAIRecipeGenerator.ts # AI 생성
│   │   ├── useRecipeTranslation.ts # 번역
│   │   ├── useSearchHistory.ts # 검색 기록
│   │   └── useFavorites.ts  # 즐겨찾기
│   ├── types/               # TypeScript 타입 정의
│   │   └── index.ts         # 모든 타입 인터페이스
│   ├── contexts/            # React Context
│   │   └── AppContext.tsx   # 전역 상태 관리
│   ├── lib/                 # 유틸리티 라이브러리
│   ├── locales/             # 다국어 리소스
│   │   ├── ko.json          # 한국어
│   │   └── en.json          # 영어
│   └── assets/              # 정적 자산
├── public/                  # 공개 파일
│   ├── recipes.json         # 오프라인 레시피 DB
│   └── sw.js               # Service Worker
├── tests/                   # Playwright 테스트
├── .env.example            # 환경변수 템플릿
├── vite.config.ts          # Vite 설정
├── tailwind.config.js      # Tailwind CSS 설정
├── tsconfig.json           # TypeScript 설정
└── package.json            # 프로젝트 의존성
```

## 🚀 설치 및 실행

### 필수 요구사항

- **Node.js**: 18.0.0 이상
- **npm**: 8.0.0 이상 또는 **yarn**: 1.22.0 이상

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/ai-recipe-generator.git
cd ai-recipe-generator
```

### 2. 의존성 설치

```bash
npm install
# 또는
yarn install
```

### 3. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 편집하여 필요한 API 키를 설정하세요:

```env
# API 모드 설정
VITE_API_MODE=free

# Spoonacular API (무료 티어: 일 150 요청)
VITE_SPOONACULAR_API_KEY=your_spoonacular_api_key

# Edamam API (무료 티어: 월 10,000 요청)
VITE_EDAMAM_APP_ID=your_edamam_app_id
VITE_EDAMAM_APP_KEY=your_edamam_app_key

# OpenAI API (AI 레시피 생성용)
VITE_OPENAI_API_KEY=your_openai_api_key

# 개발 모드 설정
VITE_USE_MOCK_DATA=false
VITE_AI_SERVICE_MODE=free
```

### 4. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 `http://localhost:5173`으로 접속하세요.

### 5. 프로덕션 빌드

```bash
npm run build
# 또는
yarn build
```

## ⚙️ 환경 설정

### API 모드 설정

#### 1. 무료 모드 (Free Mode)

```env
VITE_API_MODE=free
VITE_SPOONACULAR_API_KEY=your_key
```

- Spoonacular API: 일 150 요청
- Edamam API: 월 10,000 요청
- 자동 폴백 및 오프라인 전환

#### 2. 오프라인 모드 (Offline Mode)

```env
VITE_API_MODE=offline
```

- 로컬 JSON 데이터베이스만 사용
- 인터넷 연결 불필요
- 빠른 응답 속도

#### 3. 사용자 정의 모드 (Custom Mode)

```env
VITE_API_MODE=custom
VITE_OPENAI_API_KEY=your_key
```

- 사용자 정의 API 키 사용
- 고급 AI 기능 활성화

### 개발 모드 설정

```env
# 목 데이터 사용 (API 키 없이 개발)
VITE_USE_MOCK_DATA=true

# AI 서비스 비활성화
VITE_AI_SERVICE_MODE=offline
```

## 🔌 API 통합

### Spoonacular API

- **무료 티어**: 일 150 요청
- **레시피 검색**: 재료, 요리 종류, 난이도별 검색
- **영양 정보**: 상세한 영양 성분 데이터
- **이미지**: 고품질 레시피 이미지

### Edamam Recipe API

- **무료 티어**: 월 10,000 요청
- **대안 데이터**: Spoonacular 장애 시 폴백
- **영양 분석**: 전문적인 영양 정보

### 오프라인 데이터베이스

- **로컬 JSON**: 1000+ 기본 레시피
- **카테고리별 분류**: 요리 종류, 난이도, 조리시간
- **영양 정보**: 기본 영양 성분 데이터

### API 할당량 관리

```typescript
// 할당량 추적 예시
interface QuotaData {
  spoonacular: {
    used: number;
    limit: number;
    resetDate: string;
  };
  edamam: {
    used: number;
    limit: number;
    resetDate: string;
  };
}
```

## 📱 오프라인 모드

### 오프라인 기능

- **레시피 검색**: 로컬 데이터베이스 활용
- **즐겨찾기**: 저장된 레시피 오프라인 접근
- **레시피 상세**: 완전한 오프라인 경험

### 로컬 데이터베이스 구조

```json
{
  "recipes": [
    {
      "id": "offline-001",
      "title": "김치찌개",
      "ingredients": ["김치", "돼지고기", "두부"],
      "instructions": ["1단계", "2단계"],
      "nutrition": {
        "calories": 350,
        "protein": 25,
        "carbohydrates": 30,
        "fat": 15
      }
    }
  ]
}
```

### 오프라인 전환 로직

```typescript
// 네트워크 상태 감지
const isOnline = navigator.onLine;

// API 실패 시 자동 폴백
if (!isOnline || apiError) {
  return await offlineClient.searchRecipes(query);
}
```

## 🌐 PWA 기능

### Progressive Web App 특징

- **설치 가능**: 모바일 앱처럼 홈 화면에 추가
- **오프라인 지원**: Service Worker를 통한 캐싱
- **푸시 알림**: 레시피 추천 및 업데이트 알림
- **백그라운드 동기화**: 데이터 동기화

### Service Worker 설정

```typescript
// 캐싱 전략
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.spoonacular\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'spoonacular-api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 // 24시간
        }
      }
    }
  ]
}
```

## 🛠️ 개발 가이드

### 컴포넌트 개발

```typescript
// 새로운 컴포넌트 생성 예시
import React from "react";
import { cn } from "@/lib/utils";

interface ComponentProps {
  className?: string;
  children: React.ReactNode;
}

export function Component({ className, children }: ComponentProps) {
  return <div className={cn("base-styles", className)}>{children}</div>;
}
```

### 커스텀 훅 생성

```typescript
// API 호출 훅 예시
export function useRecipeAPI() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRecipes = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.searchRecipes(query);
      setRecipes(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "검색 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  return { recipes, loading, error, searchRecipes };
}
```

### 타입 정의

```typescript
// 새로운 타입 추가 예시
export interface NewFeature {
  id: string;
  name: string;
  description?: string;
  metadata: Record<string, any>;
}

// API 응답 타입
export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  source: "spoonacular" | "edamam" | "offline" | "cache";
}
```

## 🔧 트러블슈팅

### 일반적인 문제들

#### 1. API 키 오류

**문제**: "API key is invalid" 오류
**해결방법**:

```bash
# .env 파일 확인
VITE_SPOONACULAR_API_KEY=your_actual_api_key

# API 키 재생성
# https://spoonacular.com/food-api 에서 새 키 발급
```

#### 2. 할당량 초과

**문제**: "Daily quota exceeded" 오류
**해결방법**:

```typescript
// 자동 폴백 활성화
const config = {
  fallbackToOffline: true,
  mode: "free",
};
```

#### 3. 빌드 오류

**문제**: TypeScript 컴파일 오류
**해결방법**:

```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# TypeScript 설정 확인
npx tsc --noEmit
```

#### 4. PWA 설치 실패

**문제**: PWA 설치 버튼이 나타나지 않음
**해결방법**:

```typescript
// Service Worker 등록 확인
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
```

#### 5. 오프라인 모드 작동 안함

**문제**: 오프라인에서 레시피 검색 불가
**해결방법**:

```bash
# 로컬 데이터베이스 확인
public/recipes.json 파일 존재 여부

# Service Worker 캐시 확인
브라우저 개발자 도구 > Application > Storage
```

### 성능 최적화

#### 1. 번들 크기 최적화

```typescript
// 동적 임포트로 코드 분할
const LazyComponent = lazy(() => import("./LazyComponent"));

// Tree shaking 활성화
import { Button } from "@/components/ui/button";
// import * as UI from '@/components/ui'; // 비추천
```

#### 2. 이미지 최적화

```typescript
// WebP 포맷 사용
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="레시피 이미지" />
</picture>

// 지연 로딩
<img loading="lazy" src="image.jpg" alt="레시피 이미지" />
```

#### 3. 캐싱 전략

```typescript
// API 응답 캐싱
const cacheKey = `${query}-${JSON.stringify(params)}`;
const cached = cache.get(cacheKey);

if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
  return cached.data; // 5분 캐시
}
```

## 🚀 배포

### Vercel 배포

#### 1. 자동 배포 설정

```bash
# GitHub Actions 워크플로우
.github/workflows/deploy.yml

# Vercel 프로젝트 연결
vercel --prod
```

#### 2. 환경변수 설정

```bash
# Vercel 대시보드에서 설정
VITE_API_MODE=free
VITE_SPOONACULAR_API_KEY=your_production_key
```

#### 3. 커스텀 도메인

```bash
# DNS 설정
CNAME your-domain.com -> cname.vercel-dns.com
```

### 정적 호스팅

#### 1. Netlify 배포

```bash
# 빌드 명령어
npm run build

# 배포 디렉토리
dist/
```

#### 2. GitHub Pages 배포

```bash
# package.json에 추가
"homepage": "https://username.github.io/repo-name",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

## 🤝 기여하기

### 개발 환경 설정

1. 저장소 포크
2. 기능 브랜치 생성: `git checkout -b feature/new-feature`
3. 변경사항 커밋: `git commit -am 'Add new feature'`
4. 브랜치 푸시: `git push origin feature/new-feature`
5. Pull Request 생성

### 코드 스타일

- **TypeScript**: 엄격한 타입 체크 사용
- **ESLint**: 코드 품질 규칙 준수
- **Prettier**: 일관된 코드 포맷팅
- **커밋 메시지**: Conventional Commits 형식

### 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:coverage
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- **Spoonacular**: 무료 API 제공
- **Edamam**: 대안 데이터 소스
- **shadcn/ui**: 고품질 컴포넌트 라이브러리
- **Vite**: 빠른 빌드 도구
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크

## 📞 지원

문제가 있거나 질문이 있으시면 [Issues](https://github.com/your-username/ai-recipe-generator/issues)를 통해 문의해 주세요.

---

**🍳 AI Recipe Generator로 맛있는 요리를 만들어보세요!**

