# 배포 가이드

이 프로젝트는 정적 사이트로 여러 플랫폼에 쉽게 배포할 수 있습니다.

## 🚀 빠른 배포 옵션

### 1. Vercel (추천)
가장 간단한 배포 방법입니다.

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

또는 [vercel.com](https://vercel.com)에서 GitHub 저장소를 연결하면 자동 배포됩니다.

### 2. Netlify
```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 빌드 및 배포
npm run build
netlify deploy --prod --dir=dist
```

또는 [netlify.com](https://netlify.com)에서 `dist` 폴더를 드래그 앤 드롭하세요.

### 3. GitHub Pages
1. GitHub 저장소 Settings → Pages
2. Source를 "GitHub Actions"로 설정
3. 코드를 main 브랜치에 푸시하면 자동 배포

### 4. 수동 배포
```bash
# 빌드
npm run build

# dist 폴더의 내용을 웹 서버에 업로드
```

## 📋 배포 전 체크리스트

- [ ] `npm run build` 성공 확인
- [ ] `npm run typecheck` 통과 확인
- [ ] `npm run lint` 통과 확인
- [ ] `npx playwright test` 테스트 통과 확인
- [ ] PWA 기능 테스트 (오프라인 작동, 설치 가능)
- [ ] 모바일 반응형 확인
- [ ] 브라우저 호환성 테스트

## 🔧 환경 설정

### 환경 변수
이 프로젝트는 클라이언트 사이드에서 동작하므로 별도의 환경 변수가 필요하지 않습니다.

### 도메인 설정
`public/manifest.webmanifest`에서 `start_url`을 실제 도메인으로 수정하세요:

```json
{
  "start_url": "https://yourdomain.com/"
}
```

## 📊 성능 최적화

빌드된 파일 크기:
- 초기 로드: ~45KB (gzipped)
- 총 번들: ~340KB
- PWA 캐시로 오프라인 지원

## 🔒 보안 헤더

Vercel과 Netlify는 기본 보안 헤더를 자동 적용합니다. 다른 호스팅 서비스 사용 시 다음 헤더를 설정하세요:

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## 📱 PWA 기능

- 오프라인 작동 지원
- 홈 화면에 설치 가능
- Service Worker로 캐시 관리
- 반응형 디자인으로 모든 기기 지원

## 🐛 문제 해결

### 빌드 실패
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 라우팅 문제 (404 오류)
SPA이므로 호스팅 서비스에서 모든 경로를 `index.html`로 리디렉션해야 합니다. 
Vercel과 Netlify는 자동으로 설정됩니다.

### PWA 업데이트 안됨
브라우저에서 강제 새로고침 (Ctrl+F5) 또는 캐시 삭제 후 재시도하세요.