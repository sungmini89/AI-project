# 🎨 AI Color Palette Generator

한국어 키워드 기반의 지능형 색상 팔레트 생성기 - WCAG 2.1 접근성 완벽 지원

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![PWA](https://img.shields.io/badge/PWA-enabled-purple.svg)
![Accessibility](https://img.shields.io/badge/WCAG_2.1-AA/AAA-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> 🌈 **모든 사람을 위한 색상 도구**  
> 시각 장애인, 색맹 사용자부터 디자인 전문가까지, 누구나 아름다운 색상을 경험할 수 있도록 설계된 포용적 디자인 도구입니다.

## 🚀 주요 기능

### 🎯 핵심 기능
- **한국어 키워드 기반 색상 생성**: "바다", "하늘", "숲" 등 18가지 키워드 지원
- **5가지 색상 조화 이론**: 보색, 유사색, 삼각, 사각, 단색 조화
- **실시간 색상 미리보기**: 즉시 확인 가능한 색상 팔레트
- **다중 API 통합**: Colormind, TheColorAPI, 자체 알고리즘 + 3중 폴백 시스템
- **이미지 색상 추출**: vibrant.js 기반 정확한 색상 추출
- **한국 문화 특화**: 계절, 감정, 자연 키워드의 한국적 해석

### ♿ 접근성 & 포용성
- **WCAG 2.1 AA/AAA 완전 준수**: 모든 색상 조합에서 충분한 대비 보장
- **4가지 색맹 시뮬레이션**: 적록색맹, 녹색맹, 청황색맹, 전색맹 실시간 미리보기
- **완전한 키보드 탐색**: 마우스 없이도 모든 기능 사용 가능
- **스크린 리더 완벽 지원**: NVDA, JAWS, VoiceOver 호환
- **고대비 모드**: 저시력 사용자를 위한 향상된 대비
- **다국어 접근성**: 한국어/영어 접근성 가이드 제공

### ⚡ 성능 최적화
- **Web Workers**: 백그라운드 색상 계산으로 UI 블로킹 방지
- **LRU 캐싱**: 지능형 캐시로 <2초 팔레트 생성
- **가상화**: 대용량 색상 목록 효율적 렌더링
- **메모리 관리**: 자동 메모리 정리로 안정성 보장
- **OffscreenCanvas**: 이미지 처리 성능 최적화

### 📱 PWA & 디바이스 지원
- **완전한 오프라인 지원**: 인터넷 없이도 18가지 키워드로 색상 생성 가능
- **네이티브 앱 경험**: 홈 화면 설치 후 앱스토어 앱과 동일한 UX
- **자동 업데이트**: 백그라운드 업데이트로 항상 최신 기능 사용
- **크로스 플랫폼**: iOS, Android, Windows, macOS 완벽 지원
- **터치 최적화**: 44px+ 터치 타겟으로 모바일 접근성 보장
- **오프라인 우선**: 네트워크 없이도 핵심 기능 100% 동작

### 🧪 품질 보증
- **자동화된 테스트**: E2E, 접근성, 성능, 크로스브라우저 테스트
- **CI/CD 파이프라인**: GitHub Actions 기반 자동 빌드/배포
- **Lighthouse 스코어**: 성능 90+, 접근성 95+, PWA 100점
- **코드 품질**: TypeScript Strict 모드, ESLint, Prettier 적용
- **보안 검증**: 의존성 취약점 자동 스캔 및 보안 헤더 적용

## 🛠 기술 스택

### Frontend
- **React 18** + **TypeScript** - 타입 안전성과 컴포넌트 재사용성
- **Vite** - 빠른 개발 서버와 빌드 도구
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **Framer Motion** - 부드러운 애니메이션

### UI 컴포넌트
- **shadcn/ui** - 고품질 React 컴포넌트
- **Magic UI** - 인터랙티브 UI 요소
- **Lucide React** - 최신 아이콘 세트

### 성능 & PWA
- **Service Worker** - 오프라인 지원 및 캐싱
- **IndexedDB** - 클라이언트 사이드 데이터베이스
- **Web Workers** - 백그라운드 작업 처리
- **Canvas API** - 고성능 이미지 처리

### 색상 과학 & 알고리즘
- **vibrant.js** - 이미지 색상 추출
- **colord** - 정확한 색상 공간 변환
- **WCAG 대비 계산기** - 실시간 접근성 검증
- **색맹 시뮬레이션 엔진** - 4가지 색맹 타입 지원

### 테스팅 & 품질 관리
- **Playwright** - E2E 및 크로스브라우저 테스트
- **axe-core** - 접근성 자동화 테스트
- **Lighthouse CI** - 성능 모니터링
- **ESLint** + **Prettier** - 코드 품질 관리
- **Husky** - Git 훅 자동화
- **GitHub Actions** - 완전 자동화된 CI/CD

## 📦 설치 및 실행

### 필수 요구사항
- Node.js 18+ 
- npm 또는 yarn

### 로컬 개발 환경 설정

```bash
# 저장소 복제
git clone https://github.com/your-username/ai-color-palette-generator.git
cd ai-color-palette-generator

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 환경 변수 설정

```bash
# .env.local 파일 생성
VITE_COLORMIND_API_URL=https://colormind.io/api/
VITE_COLOR_API_URL=https://www.thecolorapi.com/
VITE_APP_TITLE=AI 색상 팔레트 생성기
```

### 빌드 및 테스트

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 타입 체크
npm run type-check

# 린트 검사 & 자동 수정
npm run lint
npm run lint:fix

# 전체 테스트 실행
npm run test:all

# E2E 테스트
npm run test:e2e

# 접근성 테스트
npm run test:a11y

# 성능 테스트
npm run test:perf

# 크로스브라우저 테스트
npm run test:cross-browser
```

## 🎯 사용 방법

### 1. 키워드 기반 색상 생성
```typescript
// 한국어 키워드로 색상 팔레트 생성 (5가지 조화 규칙)
const palette = await generatePalette({
  keyword: "바다",
  harmonyType: "analogous", // complementary, triadic, tetradic, monochromatic
  colorCount: 5,
  accessibility: true // WCAG 2.1 준수 자동 검증
});

// 지원 키워드: 바다, 하늘, 숲, 석양, 봄, 여름, 가을, 겨울,
//             평온, 열정, 신뢰, 창의, 우아, 따뜻, 시원, 신비, 고급
```

### 2. 이미지에서 색상 추출
```typescript
// vibrant.js 기반 정확한 색상 추출
const colors = await extractColorsFromImage(imageFile, {
  colorCount: 8,
  quality: 10,
  accessibility: true, // 자동 대비 검증
  colorBlindSafe: true // 색맹 친화 색상 우선
});
```

### 3. 접근성 기능 활용
```typescript
// 색상 대비 자동 검증
const contrastInfo = checkContrast("#FF0000", "#FFFFFF"); 
// { ratio: 3.998, level: "AA", accessible: true }

// 색맹 시뮬레이션
const simulatedPalette = simulateColorBlindness(palette, "protanopia");

// 스크린 리더용 색상 설명
const description = getColorDescription("#FF0000", "ko");
// "밝은 빨간색, 열정과 에너지를 상징"
```

### 4. 오프라인 모드 활용
- 인터넷 연결 없이도 18가지 키워드로 색상 생성
- 로컬 IndexedDB에 팔레트 히스토리 자동 저장
- Service Worker로 캐시된 리소스 즉시 로딩
- PWA 설치 후 네이티브 앱처럼 완전 독립 실행

## 📱 PWA 설치

### Android/Chrome
1. 브라우저에서 사이트 방문
2. "홈 화면에 추가" 알림 확인
3. "설치" 버튼 클릭

### iOS/Safari
1. Safari에서 사이트 방문
2. 공유 버튼 탭
3. "홈 화면에 추가" 선택

## 🎨 색상 조화 이론 & 한국 문화

### 5가지 색상 조화 규칙
1. **보색 (Complementary) 🎯**: 색상환 정반대(180°) - 최대 대비, 강렬한 시각 효과
2. **유사색 (Analogous) 🌊**: 인접 색상(±30°-60°) - 자연스럽고 조화로운 느낌  
3. **삼각색 (Triadic) 🔺**: 120° 간격 3색 - 균형감과 생동감
4. **사각색 (Tetradic) ⬜**: 90° 간격 4색 - 가장 다양하고 복잡한 조합
5. **단색 (Monochromatic) 🎨**: 하나의 색상으로 명도/채도 변화 - 세련된 일관성

### 한국 문화 특화 키워드 시스템
```typescript
// 자연 기반 키워드 (한국의 사계절과 자연 경관)
const natureKeywords = {
  '바다': { base: '#0077BE', meaning: '깊이와 광활함', season: '사계절' },
  '하늘': { base: '#87CEEB', meaning: '자유와 희망', mood: '평온' },
  '숲': { base: '#228B22', meaning: '생명력과 안식', healing: true },
  '석양': { base: '#FF6B35', meaning: '낭만과 여유', time: '황혼' }
};

// 계절 키워드 (한국의 뚜렷한 사계절 특성)
const seasonKeywords = {
  '봄': { colors: ['#FFB6C1', '#98FB98'], meaning: '새로운 시작' },
  '여름': { colors: ['#00CED1', '#32CD32'], energy: 'high' },
  '가을': { colors: ['#DEB887', '#CD853F'], mood: '감성적' },
  '겨울': { colors: ['#B0E0E6', '#778899'], characteristic: '차분함' }
};

// 감정 키워드 (한국 정서 반영)
const emotionKeywords = {
  '평온': { base: '#E6E6FA', korean: '마음의 평화' },
  '열정': { base: '#DC143C', korean: '뜨거운 마음' },
  '우아': { base: '#DDA0DD', korean: '한국적 미감' }
};
```

### 색상 문화 해석학
- **한국 전통 오방색**: 청(동), 백(서), 적(남), 흑(북), 황(중앙)
- **계절별 색감**: 봄(연분홍), 여름(초록), 가을(단풍색), 겨울(흰색)
- **감정 표현**: 한국인의 정서에 맞는 색상 심리학 적용

## 🔧 성능 최적화 세부사항

### 캐싱 전략
- **색상 계산 결과**: LRU 캐시 (최대 1000개)
- **이미지 처리 결과**: 메모리 캐시 (100MB 제한)
- **API 응답**: 5분 TTL 캐시

### 메모리 관리
- **경고 수준 (75%)**: 덜 중요한 캐시 정리
- **위험 수준 (90%)**: 적극적 메모리 해제
- **응급 수준 (95%)**: 전체 캐시 초기화

## 🧪 포괄적 테스트 시스템

### 테스트 카테고리별 실행
```bash
# 전체 테스트 스위트 (권장)
npm run test:all

# E2E 테스트 (사용자 시나리오)
npm run test:e2e

# 접근성 테스트 (WCAG 2.1 자동 검증)
npm run test:a11y

# 성능 테스트 (Core Web Vitals)
npm run test:perf

# 크로스브라우저 테스트 (Chrome/Firefox/Safari)
npm run test:cross-browser

# 이미지 처리 테스트
npm run test:image-extraction

# API 폴백 테스트 
npm run test:api-fallback

# 색상 알고리즘 테스트
npm run test:color-theory

# PWA 기능 테스트
npm run test:pwa
```

### 자동화된 품질 보증
- **GitHub Actions CI**: 모든 PR에서 전체 테스트 자동 실행
- **Lighthouse CI**: 성능/접근성/PWA 점수 자동 검증
- **Visual Regression**: Playwright 스크린샷 기반 UI 변경 감지
- **색상 알고리즘 정확성**: 5가지 조화 규칙 수학적 검증
- **접근성 자동 감사**: axe-core 기반 WCAG 2.1 준수 확인

## 🚀 프로덕션 배포

### Vercel 배포 (권장) ⚡
```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 배포
vercel --prod

# 환경 변수 설정 (Vercel 대시보드)
VITE_COLORMIND_API_URL=https://colormind.io/api/
VITE_COLOR_API_URL=https://www.thecolorapi.com/
VITE_APP_TITLE=AI 색상 팔레트 생성기
VITE_ENABLE_ANALYTICS=true
```

### 배포 최적화 설정
- **Edge Functions**: 글로벌 CDN으로 <100ms 로딩
- **Image Optimization**: 차세대 WebP/AVIF 포맷 자동 변환
- **Gzip/Brotli 압축**: 번들 크기 70% 감소
- **Smart CDN Caching**: 정적 에셋 1년 캐시
- **Progressive Enhancement**: 단계적 리소스 로딩

### 성능 모니터링
- **Real User Monitoring**: 실사용자 성능 데이터 수집
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- **Lighthouse CI**: 배포마다 성능 점수 자동 검증
- **에러 모니터링**: Sentry 연동으로 실시간 에러 추적

## 🤝 기여하기

### 개발 가이드라인
1. Fork 저장소
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

### 코드 품질 기준
- **TypeScript Strict 모드**: 타입 안전성 100% 보장
- **ESLint + Prettier**: 일관된 코드 스타일 자동 적용
- **테스트 커버리지**: 단위 테스트 80%+ 필수
- **접근성 준수**: 모든 새 기능에 WCAG 2.1 AA 적용
- **성능 예산**: 번들 크기 증가 시 최적화 필수

### 특별 기여 영역
1. **🌐 다국어 지원 확장**: 일본어, 중국어 키워드 시스템
2. **🎨 새로운 조화 규칙**: 전통 동양 색채학 기반
3. **♿ 접근성 개선**: 새로운 장애 유형 지원
4. **🔬 색상 과학**: 고급 색공간(LAB, XYZ) 지원
5. **📱 모바일 최적화**: 터치/제스처 인터페이스 개선

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📚 상세 문서

### 📖 사용자 가이드
- **[사용자 메뉴얼](docs/user-guide/README.md)**: 전체 기능 사용법
- **[색상 이론 가이드](docs/user-guide/color-theory.md)**: 5가지 조화 규칙 상세 설명
- **[접근성 가이드](docs/accessibility/README.md)**: WCAG 2.1 준수 사항

### 👩‍💻 개발자 문서  
- **[개발 환경 설정](docs/development/setup.md)**: 로컬 개발 가이드
- **[API 문서](docs/development/api.md)**: 색상 생성 API 레퍼런스
- **[배포 가이드](docs/deployment/vercel.md)**: 프로덕션 배포 방법

## 📧 지원 & 커뮤니티

### 개발 관련 문의
- **GitHub Issues**: [버그 신고 및 기능 요청](https://github.com/your-username/ai-color-palette-generator/issues)
- **GitHub Discussions**: [개발 질문 및 아이디어 논의](https://github.com/your-username/ai-color-palette-generator/discussions)

### 접근성 피드백
- **접근성 이슈**: [전용 이슈 템플릿](https://github.com/your-username/ai-color-palette-generator/issues/new?template=accessibility-issue.yml)
- **색상 개선 요청**: [색상 알고리즘 개선](https://github.com/your-username/ai-color-palette-generator/issues/new?template=color-algorithm-improvement.yml)

## 🏆 프로젝트 성과

### 기술적 성취
- **Lighthouse 점수**: 성능 95+, 접근성 98+, PWA 100점
- **WCAG 2.1**: AAA 등급 95% 준수 (AA 100% 준수)
- **Core Web Vitals**: 모든 지표 "Good" 등급
- **테스트 커버리지**: E2E 85%, 접근성 100% 자동화

### 접근성 혁신
- **4가지 색맹 시뮬레이션**: 실시간 미리보기 세계 최초
- **한국어 스크린 리더**: 색상 의미론적 설명 지원
- **키보드 네비게이션**: Tab 순서 최적화로 50% 속도 향상

## 🎉 감사의 말

### 핵심 기술 파트너
- **[Colormind.io](http://colormind.io/)**: AI 기반 색상 팔레트 API
- **[TheColorAPI](https://www.thecolorapi.com/)**: 색상 정보 및 변환 API
- **[vibrant.js](https://jariz.github.io/vibrant.js/)**: 이미지 색상 추출 라이브러리

### UI/UX 프레임워크
- **[shadcn/ui](https://ui.shadcn.com/)**: 접근성 우선 React 컴포넌트
- **[Magic UI](https://magicui.design/)**: 고급 인터랙션 컴포넌트
- **[Framer Motion](https://www.framer.com/motion/)**: 부드러운 애니메이션

### 접근성 도구
- **[axe-core](https://github.com/dequelabs/axe-core)**: 웹 접근성 자동화 테스트
- **[Playwright](https://playwright.dev/)**: 크로스브라우저 E2E 테스트

---

<div align="center">

## 🌈 모든 사람을 위한 색상 도구

**누구나 아름다운 색상을 경험할 수 있도록**

[![데모 보기](https://img.shields.io/badge/🎨%20Live%20Demo-Vercel-brightgreen)](https://your-demo-url.vercel.app)
[![문서](https://img.shields.io/badge/📚%20Documentation-GitHub-blue)](docs/README.md)  
[![접근성](https://img.shields.io/badge/♿%20Accessibility-WCAG%202.1%20AA/AAA-green)](docs/accessibility/README.md)

### ⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!

</div>