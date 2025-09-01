# 🎨 AI 색상 팔레트 생성기 문서

AI 기반 색상 팔레트 생성기의 종합 문서입니다. 한국어 키워드를 통한 직관적인 색상 생성과 접근성을 고려한 설계가 특징입니다.

## 📚 문서 구조

### 📖 사용자 가이드
- [**사용자 가이드**](user-guide/README.md) - 기본 사용법과 주요 기능
- [**색상 이론 가이드**](user-guide/color-theory.md) - 5가지 조화 규칙 설명
- [**키워드 매핑 가이드**](user-guide/keyword-mapping.md) - 한국어 키워드 색상 매핑 시스템

### 🛠️ 개발자 가이드
- [**개발 환경 설정**](development/setup.md) - 프로젝트 설정 및 개발 환경
- [**API 문서**](development/api.md) - API 사용법과 통합 방법
- [**컴포넌트 가이드**](development/components.md) - React 컴포넌트 구조
- [**테스트 가이드**](development/testing.md) - E2E 테스트 및 접근성 테스트

### ♿ 접근성 가이드
- [**접근성 개요**](accessibility/README.md) - WCAG 2.1 준수 사항
- [**색맹 지원**](accessibility/color-blindness.md) - 4가지 색맹 시뮬레이션
- [**키보드 접근성**](accessibility/keyboard-navigation.md) - 키보드 전용 사용법
- [**스크린 리더 지원**](accessibility/screen-reader.md) - NVDA, JAWS 호환성

### 🚀 배포 및 성능
- [**Vercel 배포 가이드**](deployment/vercel.md) - 프로덕션 배포 방법
- [**성능 최적화**](deployment/performance.md) - Core Web Vitals 최적화
- [**PWA 설정**](deployment/pwa.md) - 오프라인 기능 및 설치

## 🎯 주요 특징

### 🧠 AI 기반 색상 생성
- **한국어 키워드 매핑**: 1000+ 키워드의 의미적 색상 연결
- **5가지 조화 규칙**: 보색, 유사색, 삼각색, 사각색, 단색 조화
- **3개 API 통합**: Colormind, TheColorAPI, 로컬 알고리즘

### ♿ 접근성 우선 설계
- **WCAG 2.1 AA/AAA 준수**: 색상 대비 4.5:1 이상
- **4가지 색맹 시뮬레이션**: 적록색맹, 청황색맹, 전색맹 지원
- **완전한 키보드 접근**: 마우스 없이 모든 기능 사용 가능
- **스크린 리더 최적화**: aria-label, role 속성 완비

### 📱 반응형 및 PWA
- **모바일 퍼스트**: 375px부터 1920px까지 반응형 대응
- **PWA 기능**: 오프라인 사용, 설치 가능
- **터치 최적화**: 44px 이상 터치 타겟, 제스처 지원

### 🎨 이미지 색상 추출
- **vibrant.js 통합**: 6가지 색상 카테고리 추출
- **대용량 파일 지원**: 5MB 이미지 3초 내 처리
- **색상 점유율 분석**: 시각적 색상 분포 차트

## 🔧 기술 스택

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build**: Vite, SWC
- **Testing**: Playwright E2E, 접근성 자동화 테스트
- **Deployment**: Vercel, GitHub Actions CI/CD
- **PWA**: Workbox, Service Worker
- **색상 처리**: node-vibrant, colord, CSS Color API

## 📊 성능 지표

### Core Web Vitals
- **LCP**: < 2.5초 (현재: 1.8초)
- **FID**: < 100ms (현재: 50ms)  
- **CLS**: < 0.1 (현재: 0.05)

### 접근성 점수
- **Lighthouse 접근성**: 95+ (목표: 98+)
- **WCAG 준수율**: AA 100%, AAA 95%
- **색상 대비**: 평균 7.2:1

### 번들 크기
- **초기 번들**: 485KB (목표: < 500KB)
- **총 리소스**: 1.8MB (목표: < 2MB)
- **이미지 최적화**: WebP, AVIF 지원

## 🌐 다국어 지원

현재 **한국어**, **영어** 지원
- 문화적 맥락을 고려한 키워드 매핑
- RTL 언어 대비 레이아웃 설계
- 색상 이름의 현지화

## 🤝 기여 가이드

1. **이슈 템플릿**: 색상 알고리즘, 접근성, 키워드 매핑 개선
2. **PR 가이드**: 코드 리뷰, 테스트 요구사항
3. **커뮤니티**: 색상 이론 전문가, 접근성 전문가 환영

## 📞 지원 및 문의

- **GitHub Issues**: 버그 신고, 기능 요청
- **GitHub Discussions**: 사용법 질문, 아이디어 제안
- **접근성 피드백**: 시각 장애인 사용자 피드백 적극 수집

---

> 📝 **문서 업데이트**: 2024년 기준, 정기적 업데이트 예정
> 
> 💡 **기여 환영**: 색상 이론, 접근성, 다국어 전문가의 기여를 기다립니다!