# Smart Split Calculator

OCR 기반 스마트 영수증 분할 계산기

![Smart Split Calculator](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build Status](https://github.com/username/cost-split-calculator/workflows/CI-CD%20Pipeline/badge.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 주요 기능

- **🔍 OCR 영수증 인식**: Tesseract.js와 Google Gemini AI를 활용한 정확한 영수증 텍스트 추출
- **💰 스마트 분할 계산**: 다양한 분할 방식 지원 (균등분할, 항목별, 비율별, 커스텀)
- **📱 PWA 지원**: 오프라인 사용 가능한 프로그레시브 웹 앱
- **📊 히스토리 관리**: 계산 내역 저장, 검색, 필터링
- **🎨 반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **⌨️ 키보드 단축키**: 파워 유저를 위한 단축키 지원
- **🌙 다크 모드**: 시스템 설정에 따른 자동 테마 전환
- **♿ 접근성**: WCAG 2.1 AA 준수

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 16.0.0 이상
- npm 7.0.0 이상

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/username/cost-split-calculator.git
cd cost-split-calculator

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

앱이 [http://localhost:5173](http://localhost:5173)에서 실행됩니다.

### 환경 설정

1. `.env.example`을 복사하여 `.env` 파일 생성
2. 필요한 환경 변수 설정:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 📖 사용법

### 1. 영수증 업로드
- 영수증 사진을 드래그 앤 드롭하거나 파일 선택
- 지원 형식: JPG, PNG, WEBP (최대 10MB)

### 2. OCR 처리
- 자동으로 텍스트 인식 및 항목 추출
- AI 기반 정확도 향상

### 3. 분할 설정
- 참가자 추가/제거
- 각 항목별 참가자 할당
- 분할 방식 선택

### 4. 결과 확인
- 참가자별 지불 금액 계산
- 정산 최적화 제안
- 결과 공유 및 저장

## 🛠️ 개발

### 스크립트

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 타입 체크
npm run type-check

# 린트 검사
npm run lint

# E2E 테스트
npm run e2e

# E2E 테스트 (헤드리스 모드 해제)
npm run test:headed
```

### 기술 스택

**Frontend:**
- React 18 + TypeScript
- Vite (번들러)
- Tailwind CSS (스타일링)
- Framer Motion (애니메이션)
- React Router (라우팅)

**OCR & AI:**
- Tesseract.js (OCR 엔진)
- Google Gemini AI (텍스트 향상)

**Storage:**
- IndexedDB (오프라인 스토리지)

**Testing:**
- Playwright (E2E 테스트)

**DevOps:**
- Docker (컨테이너화)
- GitHub Actions (CI/CD)
- Nginx (웹 서버)

## 🏗️ 아키텍처

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/             # 기본 UI 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트
│   └── providers/      # Context 프로바이더
├── hooks/              # 커스텀 React 훅
├── lib/                # 유틸리티 함수
├── pages/              # 페이지 컴포넌트
├── services/           # 외부 서비스 연동
├── types/              # TypeScript 타입 정의
└── utils/              # 헬퍼 함수
```

## 🧪 테스트

### E2E 테스트 실행

```bash
# Playwright 브라우저 설치
npm run e2e:install

# E2E 테스트 실행
npm run e2e

# UI 모드로 테스트
npm run test:ui

# 디버그 모드
npm run test:debug
```

### 테스트 커버리지

- 핵심 워크플로우 E2E 테스트
- 접근성 테스트
- 성능 테스트
- 크로스 브라우저 테스트

## 🐳 Docker 배포

### 개발 환경

```bash
docker-compose --profile dev up
```

### 프로덕션 환경

```bash
# 단일 컨테이너
docker-compose up app

# 프록시와 함께
docker-compose --profile proxy up
```

### Docker 이미지 직접 빌드

```bash
# 프로덕션 이미지
docker build -t smart-split-calculator .

# 개발 이미지
docker build -f Dockerfile.dev -t smart-split-calculator:dev .
```

## 📊 성능

- **First Contentful Paint**: < 1.5초
- **Largest Contentful Paint**: < 2.5초
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3초

성능은 Lighthouse CI를 통해 지속적으로 모니터링됩니다.

## ♿ 접근성

- WCAG 2.1 AA 준수
- 키보드 네비게이션 완전 지원
- 스크린 리더 호환성
- 고대비 모드 지원
- 동작 축소 모드 지원

## 🤝 기여하기

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

### 개발 가이드라인

- TypeScript 사용 필수
- ESLint + Prettier 규칙 준수
- 컴포넌트별 테스트 작성
- 접근성 고려사항 포함

## 📝 라이선스

MIT License - [LICENSE](LICENSE) 파일 참조

## 👏 크레딧

- [Tesseract.js](https://github.com/naptha/tesseract.js) - OCR 엔진
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [Framer Motion](https://www.framer.com/motion/) - 애니메이션 라이브러리
- [Lucide](https://lucide.dev/) - 아이콘 세트

## 📞 지원

- 이슈: [GitHub Issues](https://github.com/username/cost-split-calculator/issues)
- 이메일: contact@example.com
- 문서: [Wiki](https://github.com/username/cost-split-calculator/wiki)

---

❤️ Made with love in Korea