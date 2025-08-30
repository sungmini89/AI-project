# 🚀 배포 가이드

API 키 보안을 유지하면서 프로젝트를 안전하게 배포하는 방법

## 🔐 환경변수 관리 원칙

### ✅ 해야 할 것
- `.env` 파일을 `.gitignore`에 포함
- `.env.example` 파일은 Git에 포함 (실제 키 제외)
- 배포 플랫폼에서 환경변수 설정
- 개발/프로덕션 환경 분리

### ❌ 하지 말아야 할 것
- `.env` 파일을 Git에 커밋
- API 키를 소스코드에 직접 입력
- 프로덕션 키를 개발환경에서 사용

## 📦 주요 배포 플랫폼별 설정

### 1. Vercel 배포

#### CLI를 통한 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 배포 시작
vercel

# 환경변수 설정 (각각 개별적으로)
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID

# 프로덕션 배포
vercel --prod
```

#### Dashboard를 통한 설정
1. [Vercel Dashboard](https://vercel.com/dashboard)에서 프로젝트 선택
2. Settings → Environment Variables
3. 각 환경변수를 개별적으로 추가:
   - Name: `VITE_FIREBASE_API_KEY`
   - Value: `실제_API_키_값`
   - Environment: `Production`, `Preview`, `Development`

### 2. Netlify 배포

#### Git 연동 배포
1. [Netlify](https://netlify.com)에서 "New site from Git" 선택
2. GitHub 저장소 연결
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

#### 환경변수 설정
1. Site settings → Environment variables
2. 각 변수 추가:
```
VITE_FIREBASE_API_KEY = 실제_값
VITE_FIREBASE_AUTH_DOMAIN = 실제_값
VITE_FIREBASE_PROJECT_ID = 실제_값
VITE_FIREBASE_STORAGE_BUCKET = 실제_값
VITE_FIREBASE_MESSAGING_SENDER_ID = 실제_값
VITE_FIREBASE_APP_ID = 실제_값
```

#### CLI를 통한 배포
```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 로그인
netlify login

# 배포
netlify deploy --prod --dir=dist
```

### 3. GitHub Pages + GitHub Actions

#### `.github/workflows/deploy.yml` 생성
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
        VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
        VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
        VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
        VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
        VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

#### GitHub Secrets 설정
1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. 각 환경변수를 Secrets에 추가:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### 4. Firebase Hosting

#### Firebase CLI 설정
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# Firebase 초기화
firebase init hosting

# 빌드
npm run build

# 배포
firebase deploy
```

#### `firebase.json` 설정
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [{
      "source": "**",
      "destination": "/index.html"
    }]
  }
}
```

## 🛡️ 보안 모범 사례

### 1. API 키 관리
- **개발용 키**: 개발환경에서만 사용
- **프로덕션용 키**: 실제 서비스에서만 사용
- **키 회전**: 정기적으로 API 키 변경
- **권한 제한**: Firebase에서 도메인별 접근 제한 설정

### 2. Firebase 보안 규칙
```javascript
// Firestore 보안 규칙
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 접근
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. CORS 설정
```javascript
// vite.config.ts에서 개발용 프록시 설정
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.mymemory.translated.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

## 📊 배포 체크리스트

### 배포 전 확인사항
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] `.env.example` 파일이 최신 상태인가?
- [ ] 모든 환경변수가 배포 플랫폼에 설정되었는가?
- [ ] `npm run build`가 성공적으로 실행되는가?
- [ ] Firebase 프로젝트 설정이 완료되었는가?

### 배포 후 확인사항
- [ ] 사이트가 정상적으로 로드되는가?
- [ ] Firebase 인증이 작동하는가?
- [ ] 번역 기능이 정상 작동하는가?
- [ ] PWA 기능이 작동하는가?
- [ ] 모바일에서도 정상 작동하는가?

## 🔧 문제 해결

### 환경변수 관련 오류
```bash
# 환경변수가 제대로 로드되지 않는 경우
# 1. .env 파일 존재 확인
ls -la .env

# 2. Vite 환경변수 형식 확인 (VITE_ 접두사 필수)
grep "VITE_" .env

# 3. 빌드 재실행
rm -rf dist node_modules/.vite
npm run build
```

### Firebase 연결 오류
1. Firebase 프로젝트 설정 재확인
2. 도메인 허용 목록에 배포 도메인 추가
3. API 키 권한 확인

### 번역 API 오류
1. API 할당량 확인
2. CORS 설정 확인
3. 폴백 API 동작 확인

## 📚 추가 리소스

- [Vite 환경변수 가이드](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase 보안 규칙](https://firebase.google.com/docs/rules)
- [Vercel 환경변수](https://vercel.com/docs/concepts/projects/environment-variables)
- [Netlify 환경변수](https://docs.netlify.com/configure-builds/environment-variables/)

---

**💡 팁**: 배포 전에 반드시 로컬에서 `npm run build && npm run preview`로 프로덕션 빌드를 테스트하세요!