# AI 코드 리뷰어 🤖

무료로 사용할 수 있는 AI 기반 코드 품질 분석 및 리뷰 도구입니다. 브라우저에서 바로 사용 가능하며 오프라인 모드도 지원합니다.

## 🌟 주요 기능

### 📊 오프라인 분석 (무료, 무제한)
- **ESLint 기반 코드 품질 검사**: JavaScript/TypeScript 코드의 품질을 실시간으로 검사
- **McCabe 복잡도 분석**: 순환 복잡도와 인지 복잡도를 계산하여 코드의 가독성 평가
- **보안 패턴 검사**: SQL 인젝션, XSS, 하드코딩된 인증정보 등 보안 취약점 탐지
- **Prettier 코드 포맷팅**: 일관된 코드 스타일을 위한 자동 포맷팅

### 🤖 AI 기반 분석
- **Google Gemini API**: 고급 AI 코드 분석 및 개선 제안 (무료 티어: 1,500회/일)
- **Cohere API**: 대안 AI 분석 서비스 (무료 티어: 1,000회/월)
- **오프라인 대체**: API 사용량 초과 시 자동으로 오프라인 모드로 전환

### 🛠️ 지원 기능
- **12개 프로그래밍 언어 지원**: JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin
- **PWA 지원**: 오프라인 사용 가능, 앱처럼 설치 가능
- **다크/라이트 테마**: 시스템 설정 연동 가능
- **코드 히스토리 관리**: 분석 결과 저장 및 북마크
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원

## 🚀 빠른 시작

### 온라인 사용
웹사이트에 접속하여 바로 사용하세요: [https://ai-code-review.vercel.app](https://ai-code-review.vercel.app)

### 로컬 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📋 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요:

```bash
# 개발 모드 설정
VITE_USE_MOCK_DATA=true

# API 모드 설정 (offline|free|premium|custom)
VITE_API_MODE=offline

# Google Gemini API 설정 (무료 티어: 1,500 요청/일)
VITE_GEMINI_API_KEY=your_api_key_here

# Cohere API 설정 (무료 티어: 1,000 요청/월)
VITE_COHERE_API_KEY=your_api_key_here

# 기타 설정
VITE_ENABLE_OFFLINE_MODE=true
VITE_PWA_ENABLED=true
VITE_DEFAULT_LOCALE=ko
```

## 🔑 API 키 발급

### Google Gemini API
1. [Google AI Studio](https://makersuite.google.com/app/apikey)에 접속
2. 새 API 키 생성
3. 설정 페이지에서 API 키 입력

### Cohere API
1. [Cohere Dashboard](https://dashboard.cohere.ai/api-keys)에 접속
2. API 키 생성
3. 설정 페이지에서 API 키 입력

> 💡 **팁**: API 키 없이도 오프라인 모드로 기본 분석 기능을 모두 사용할 수 있습니다!

## 📱 PWA 설치

### 데스크톱 (Chrome, Edge)
1. 주소창 오른쪽의 설치 아이콘 클릭
2. "설치" 버튼 클릭

### 모바일 (Android)
1. 브라우저 메뉴에서 "홈 화면에 추가" 선택
2. 앱 이름 확인 후 "추가" 클릭

### 모바일 (iOS)
1. Safari 공유 메뉴 열기
2. "홈 화면에 추가" 선택

## 🏗️ 프로젝트 구조

```
ai-code-review/
├── public/                 # 정적 파일
│   ├── icons/             # PWA 아이콘
│   ├── manifest.json      # PWA 매니페스트
│   └── sw.js             # 서비스 워커
├── src/
│   ├── components/        # React 컴포넌트
│   │   ├── features/     # 기능별 컴포넌트
│   │   ├── layout/       # 레이아웃 컴포넌트
│   │   └── ui/          # 재사용 UI 컴포넌트
│   ├── pages/            # 페이지 컴포넌트
│   ├── services/         # API 및 분석 서비스
│   ├── stores/           # 상태 관리 (Zustand)
│   ├── types/            # TypeScript 타입 정의
│   ├── config/           # 설정 파일
│   └── utils/            # 유틸리티 함수
├── .env.example          # 환경 변수 예시
├── vercel.json           # Vercel 배포 설정
└── README.md
```

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Zustand
- **Code Editor**: Monaco Editor
- **AI APIs**: Google Gemini, Cohere
- **PWA**: Service Worker, Web App Manifest
- **Deployment**: Vercel

## 📊 분석 기능 상세

### ESLint 검사
- `no-unused-vars`: 사용되지 않는 변수 검출
- `no-console`: console 사용 경고
- `prefer-const`: const 사용 권장
- `no-var`: var 사용 금지
- `eqeqeq`: 엄격한 동등 비교 강제
- `no-eval`: eval() 사용 금지

### 복잡도 분석
- **순환 복잡도**: 코드의 분기점 개수 측정
- **인지 복잡도**: 코드 이해의 어려움 측정
- **함수별 분석**: 각 함수의 복잡도 개별 계산

### 보안 검사
- SQL 인젝션 패턴 탐지
- XSS 취약점 검사
- 하드코딩된 인증정보 탐지
- 안전하지 않은 eval() 사용 검사

## 📈 사용량 제한

### 무료 API 티어
- **Google Gemini**: 일일 1,500회 요청
- **Cohere**: 월 1,000회 요청
- **오프라인 모드**: 무제한 사용

### 사용량 관리
- 실시간 사용량 모니터링
- 자동 오프라인 모드 전환
- 사용량 초기화 알림

---

**AI 코드 리뷰어**로 더 나은 코드를 작성해보세요! 🚀
