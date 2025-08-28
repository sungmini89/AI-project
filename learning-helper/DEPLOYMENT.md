# AI 학습 도우미 배포 가이드

## 개요

이 문서는 AI 학습 도우미 애플리케이션의 Vercel 배포 과정을 설명합니다.

## 배포 전 체크리스트

### 1. 환경 설정
- [ ] `.env` 파일에 필요한 환경 변수 설정
- [ ] Google Gemini API 키 설정
- [ ] 프로덕션 환경 설정 확인

### 2. 코드 품질 검증
```bash
# 타입 체크
npx tsc --noEmit

# 린트 검사
npm run lint

# 빌드 테스트
npm run build

# E2E 테스트 실행
npm run test
```

### 3. 성능 최적화
- [ ] 번들 사이즈 확인 (<500KB)
- [ ] 이미지 최적화
- [ ] PWA 설정 검증
- [ ] Service Worker 동작 확인

## Vercel 배포 과정

### 1. Vercel CLI 설치
```bash
npm i -g vercel
```

### 2. 프로젝트 연결
```bash
vercel login
vercel --prod
```

### 3. 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수를 설정:
- `VITE_GOOGLE_API_KEY`: Google Gemini API 키
- `NODE_ENV`: `production`
- `VERCEL_ENV`: `production`

### 4. 도메인 설정 (선택사항)
```bash
vercel domains add your-domain.com
```

## 자동 배포 설정

### GitHub Actions 워크플로우
- `main` 브랜치 push 시 자동 프로덕션 배포
- `develop` 브랜치 push 시 프리뷰 배포
- PR 생성 시 프리뷰 배포

### 배포 단계
1. **테스트**: TypeScript 컴파일, ESLint, E2E 테스트
2. **빌드**: 프로덕션 빌드 생성
3. **배포**: Vercel에 자동 배포
4. **검증**: Lighthouse 성능 측정

## 모니터링 및 유지보수

### 성능 모니터링
- 주간 자동 Lighthouse 감사
- Core Web Vitals 추적
- 번들 사이즈 모니터링

### 오류 추적
- Console 에러 모니터링
- 사용자 피드백 수집
- GitHub Issues를 통한 버그 보고

### 업데이트 절차
1. `develop` 브랜치에서 기능 개발
2. PR을 통한 코드 리뷰
3. `main` 브랜치 병합 후 자동 배포

## 트러블슈팅

### 일반적인 문제

#### 1. 빌드 실패
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 타입 오류 확인
npx tsc --noEmit
```

#### 2. 환경 변수 오류
- Vercel 대시보드에서 환경 변수 확인
- 변수명 앞에 `VITE_` 접두사 확인
- 배포 후 변수 변경 시 재배포 필요

#### 3. PWA 캐시 문제
- Service Worker 업데이트 확인
- 브라우저 캐시 강제 새로고침 (Ctrl+Shift+R)

#### 4. 성능 문제
- Lighthouse 보고서 확인
- 번들 분석기로 큰 의존성 식별
- 이미지 최적화 적용

### 디버깅 도구

#### 로컬 프리뷰
```bash
# 프로덕션 빌드 로컬 테스트
npm run build
npm run preview
```

#### Vercel 로그 확인
```bash
vercel logs [deployment-url]
```

## 보안 설정

### CSP 헤더
`vercel.json`에 설정된 보안 헤더:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy

### 환경 변수 보안
- API 키는 반드시 환경 변수로 관리
- `.env` 파일은 절대 커밋하지 않음
- Vercel 대시보드에서 변수 암호화

## 성능 목표

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 추가 메트릭
- **First Contentful Paint**: < 1.5초
- **Time to Interactive**: < 3초
- **Total Bundle Size**: < 500KB

## 백업 및 복구

### 데이터 백업
- 사용자 학습 데이터는 로컬 스토리지에 저장
- 정기적인 내보내기 기능 제공

### 서비스 복구
- Vercel 서비스 중단 시 GitHub Pages 백업 배포
- 이전 배포 버전으로 롤백 가능

---

**참고**: 배포 관련 문제 발생 시 GitHub Issues에 문제를 보고해 주세요.