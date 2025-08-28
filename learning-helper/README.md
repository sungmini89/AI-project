# AI Study Helper

AI 기반 스마트 학습 도우미 - PDF/텍스트를 플래시카드와 퀴즈로 자동 변환

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

![AI Study Helper](homepage.png)

## ✨ 주요 기능

- 🤖 **AI 기반 자동 생성**: Google Gemini를 활용한 플래시카드/퀴즈 자동 생성
- 📚 **스마트 학습**: SM-2 알고리즘 기반 간격 반복 학습
- 📄 **다양한 형식 지원**: PDF, TXT 파일 업로드 및 텍스트 추출
- 📊 **학습 분석**: 개인화된 진도 추적 및 성과 분석
- 💾 **오프라인 지원**: PWA 기능으로 인터넷 없이도 학습 가능
- 🎯 **접근성**: WCAG 2.1 AA 준수, 키보드 네비게이션 지원

## 🚀 빠른 시작

### 필수 요구사항

- **Node.js** 18 이상
- **Google Gemini API 키** (선택사항 - 없으면 Mock 모드로 동작)

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-username/ai-study-helper.git
cd ai-study-helper

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 환경 설정 (선택사항)

루트 디렉토리에 `.env` 파일 생성:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

## 📖 사용법

### 1단계: 문서 업로드
- **업로드 페이지**에서 PDF 또는 텍스트 파일 선택
- 드래그 앤 드롭으로 간편 업로드 (최대 10MB)

### 2단계: AI 분석 및 생성
- AI가 자동으로 핵심 개념 추출
- 플래시카드와 퀴즈 자동 생성 (약 30초)

### 3단계: 스마트 학습
- **플래시카드 페이지**에서 학습 시작
- 답변 품질에 따른 자동 복습 스케줄링
- **퀴즈 페이지**에서 실력 점검

### 4단계: 진도 관리
- **대시보드**에서 학습 성과 확인
- 개인화된 학습 추천 받기

## 🏗️ 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI + Lucide Icons
- **AI**: Google Gemini API + 다중 AI 서비스 지원
- **Storage**: IndexedDB + LocalStorage
- **PWA**: Workbox + Service Worker
- **Testing**: Playwright (E2E) + Vitest (Unit)

## 📂 프로젝트 구조

```
src/
├── components/          # UI 컴포넌트
│   ├── ui/             # 기본 UI 컴포넌트
│   └── layout/         # 레이아웃 컴포넌트
├── pages/              # 라우트별 페이지
├── services/           # 비즈니스 로직
│   ├── aiService.ts    # AI 통합 서비스
│   ├── spacedRepetitionService.ts  # SM-2 알고리즘
│   └── pdfProcessor.ts # PDF 처리
├── utils/              # 유틸리티 함수
├── types/              # TypeScript 타입
└── config/             # 설정 파일
```

## 🧪 테스팅

```bash
# 단위 테스트
npm run test:unit

# E2E 테스트
npm run test

# 테스트 커버리지
npm run test:unit:coverage

# 모든 테스트 실행
npm run test:all
```

## 🏭 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 타입 검사
npm run build  # TypeScript 컴파일 포함
```

### 배포 옵션

- **Vercel**: `vercel deploy` (권장)
- **Netlify**: 빌드 폴더 업로드
- **GitHub Pages**: `npm run build` 후 `dist/` 폴더 배포

## 📱 PWA 기능

- **오프라인 사용**: 인터넷 없이도 학습 가능
- **앱 설치**: 브라우저에서 "홈 화면에 추가" 가능
- **백그라운드 동기화**: 온라인 상태에서 자동 업데이트

## ♿ 접근성

- **WCAG 2.1 AA** 완전 준수
- **키보드 네비게이션** 모든 기능 지원
- **스크린 리더** 최적화
- **고대비 모드** 지원

## 🔧 설정 옵션

### AI 서비스 설정
- **Google Gemini**: 메인 AI 서비스
- **Mock 모드**: API 키 없이 테스트
- **오프라인 모드**: 기본 기능만 사용

### 학습 설정
- **일일 목표**: 학습할 카드 수 설정
- **복습 알림**: 브라우저 알림 설정
- **난이도 조절**: 개인 수준에 맞는 콘텐츠

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. **Fork** 이 저장소
2. **Feature 브랜치** 생성: `git checkout -b feature/amazing-feature`
3. **변경사항 커밋**: `git commit -m 'Add amazing feature'`
4. **브랜치에 푸시**: `git push origin feature/amazing-feature`
5. **Pull Request** 생성

### 개발 가이드라인

- **Code Style**: Prettier + ESLint 설정 준수
- **Commit Message**: [Conventional Commits](https://www.conventionalcommits.org/) 형식 사용
- **Testing**: 새로운 기능은 테스트 코드 포함 필수
- **Documentation**: 복잡한 로직은 주석 및 문서화

## 🐛 이슈 신고

버그를 발견하거나 기능 개선 제안이 있다면:

1. [Issues](https://github.com/your-username/ai-study-helper/issues)에서 기존 이슈 확인
2. 새 이슈 생성시 다음 정보 포함:
   - **환경**: 브라우저, OS 버전
   - **재현 단계**: 상세한 재현 방법
   - **예상 결과 vs 실제 결과**
   - **스크린샷** (UI 관련 이슈)

## 📄 라이선스

이 프로젝트는 [MIT License](LICENSE)에 따라 배포됩니다.

## 📞 연락처

- **이메일**: your.email@example.com
- **GitHub**: [@your-username](https://github.com/your-username)
- **블로그**: [기술 블로그](https://your-blog.com)

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들의 도움을 받았습니다:

- [React](https://reactjs.org/) - UI 라이브러리
- [Vite](https://vitejs.dev/) - 빌드 도구
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [Radix UI](https://www.radix-ui.com/) - 접근 가능한 컴포넌트
- [Google Gemini](https://ai.google.dev/) - AI 서비스

---

⭐ **유용했다면 Star를 눌러주세요!**

📚 **더 자세한 정보:**
- [제품 요구사항 문서 (PRD)](PRD.md)
- [기술 블로그 - 개발 회고](TECH_BLOG.md)
- [API 문서](#) (준비중)
- [사용자 가이드](#) (준비중)

*"AI와 함께 더 효율적으로 학습하세요 🚀"*