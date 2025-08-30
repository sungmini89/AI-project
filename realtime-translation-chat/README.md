# 실시간 번역 채팅 애플리케이션

다국어 실시간 번역 기능을 제공하는 웹 채팅 애플리케이션

## 주요 기능

### 🌐 다국어 번역
- **지원 언어**: 한국어, 영어, 일본어, 중국어, 스페인어, 프랑스어, 독일어 등 16개 언어
- **자동 언어 감지**: franc 라이브러리를 활용한 정확한 언어 감지
- **다중 API 지원**: MyMemory API → LibreTranslate → 오프라인 사전 순서의 폴백 체인

### 💬 실시간 채팅
- **Firebase 기반**: Firestore를 활용한 실시간 메시지 동기화
- **사용자 관리**: Firebase Auth를 통한 안전한 인증
- **온라인 상태**: 실시간 사용자 접속 상태 표시

### 🎨 Modern UI/UX
- **shadcn/ui**: 접근성과 사용성을 고려한 컴포넌트 라이브러리
- **반응형 디자인**: 모든 기기에서 최적화된 사용자 경험
- **다크/라이트 모드**: 사용자 선호도에 맞는 테마 지원

### ⚡ 성능 최적화
- **무료 티어 최적화**: Firebase 및 번역 API의 무료 한도 내 효율적 사용
- **캐싱 시스템**: 번역 결과 캐싱으로 API 호출 최소화
- **PWA 지원**: 오프라인 기능 및 네이티브 앱과 유사한 경험

## 기술 스택

### Frontend
- **React 18** + **TypeScript**
- **Vite** - 빠른 개발 및 빌드
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **shadcn/ui** - 현대적인 React 컴포넌트

### Backend & Services
- **Firebase v10**
  - Firestore: 실시간 데이터베이스
  - Authentication: 사용자 인증
  - Hosting: 웹 호스팅
- **Translation APIs**
  - MyMemory API (1000 요청/일)
  - LibreTranslate (백업)
  - 오프라인 사전 (폴백)

### Language Processing
- **franc**: 언어 감지 (187개 언어 지원)
- **Custom Translation Engine**: 다중 API 폴백 시스템

## 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd realtime-translation-chat
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Translation APIs (선택사항)
VITE_LIBRETRANSLATE_URL=https://libretranslate.de/translate
VITE_LIBRETRANSLATE_KEY=your_api_key_if_needed

# PWA Configuration
VITE_PWA_NAME=실시간 번역 채팅
VITE_PWA_SHORT_NAME=번역채팅
```

### 4. Firebase 설정
1. [Firebase Console](https://console.firebase.google.com)에서 프로젝트 생성
2. Authentication 활성화 (이메일/비밀번호)
3. Firestore Database 생성
4. 웹 앱 추가 후 설정 정보 `.env`에 추가

### 5. 개발 서버 실행
```bash
npm run dev
```

### 6. 프로덕션 빌드
```bash
npm run build
```

## 사용법

### 1. 계정 생성/로그인
- 이메일과 비밀번호로 계정 생성
- 선호 언어 설정 (기본: 한국어)

### 2. 채팅방 참여
- 새 채팅방 생성 또는 기존 방 참여
- 지원 언어 확인

### 3. 메시지 전송
- 원하는 언어로 메시지 입력
- 번역할 언어 선택 (다중 선택 가능)
- 실시간으로 번역된 메시지 확인

### 4. 번역 확인
- 각 메시지마다 원문과 번역문 전환 가능
- 언어별 번역 품질 및 제공업체 확인
- 텍스트 복사 기능

## API 사용량 관리

### MyMemory API
- **무료 한도**: 1,000 요청/일
- **자동 할당량 관리**: 일일 사용량 추적
- **한도 초과시**: LibreTranslate로 자동 전환

### LibreTranslate
- **무료 한도**: 서버별 상이 (보통 100-1000 요청/일)
- **자체 호스팅**: 무제한 사용 가능
- **폴백 체인**: MyMemory → LibreTranslate → 오프라인

### Firebase 무료 티어
- **Firestore**: 20K 읽기, 20K 쓰기/일
- **Authentication**: 무제한
- **Hosting**: 10GB 저장소, 360MB/일 전송

## 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── ui/             # shadcn/ui 기본 컴포넌트
│   ├── auth/           # 인증 관련 컴포넌트
│   └── chat/           # 채팅 관련 컴포넌트
├── lib/                # 유틸리티 및 서비스
│   ├── services/       # 비즈니스 로직 서비스
│   ├── firebase.ts     # Firebase 설정
│   └── utils.ts        # 공통 유틸리티
├── types/              # TypeScript 타입 정의
└── main.tsx           # 애플리케이션 진입점
```

## 라이선스

MIT License

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 지원

문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해 주세요.