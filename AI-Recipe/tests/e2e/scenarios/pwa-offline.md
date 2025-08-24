# PWA 설치 및 오프라인 기능 E2E 테스트 시나리오

## 개요
**시나리오 이름**: PWA 설치 및 오프라인 기능 테스트  
**우선순위**: Critical  
**카테고리**: PWA 기능  
**예상 실행 시간**: 10-15분  
**복잡도**: High  

## 목적
- PWA(Progressive Web App) 설치 프로세스 검증
- 오프라인 상태에서 애플리케이션 접근성 및 기능 확인
- Service Worker 동작 및 캐싱 메커니즘 검증
- 네트워크 재연결 시 데이터 동기화 테스트

## 전제조건
- ✅ HTTPS 환경에서 테스트 실행 (localhost는 PWA 지원)
- ✅ Service Worker가 등록되고 활성화된 상태
- ✅ manifest.webmanifest 파일이 유효하고 접근 가능
- ✅ 브라우저가 PWA 설치를 지원 (Chrome, Edge, Firefox 등)

## 테스트 데이터
```javascript
// PWA 설치 확인 요소
const PWA_INDICATORS = {
  manifestFile: '/manifest.webmanifest',
  serviceWorkerPath: '/sw.js',
  installButton: '[data-testid="install-pwa"]',
  offlineIndicator: '[data-testid="offline-indicator"]'
}

// 캐시 가능한 리소스
const CACHEABLE_RESOURCES = [
  '/',
  '/search',
  '/generate', 
  '/favorites',
  '/settings',
  '/icons/icon-192x192.png',
  '/manifest.webmanifest'
]
```

## 테스트 단계

### 1단계: PWA 설치 준비 상태 검증
**목표**: PWA 설치 조건이 모두 충족되었는지 확인

**액션**:
1. 브라우저에서 `http://localhost:5179` 접속
2. 개발자 도구 → Application → Manifest 탭 확인
3. Service Worker 등록 상태 확인
4. PWA 설치 가능 여부 확인

**검증 포인트**:
- ✅ manifest.webmanifest 파일이 올바르게 로드됨
- ✅ Service Worker가 등록되고 'activated' 상태임
- ✅ HTTPS 또는 localhost 환경임
- ✅ 필수 manifest 필드들이 모두 존재함 (name, short_name, start_url, display, icons)

**예상 결과**:
```json
{
  "manifestPresent": true,
  "serviceWorkerActive": true,
  "installable": true,
  "requiredFields": ["name", "short_name", "start_url", "display", "icons"]
}
```

### 2단계: PWA 설치 프롬프트 테스트
**목표**: 브라우저의 PWA 설치 프롬프트가 정상 작동하는지 확인

**액션**:
1. 페이지 로드 후 설치 조건 충족 대기 (보통 30초-2분)
2. 브라우저 주소창의 설치 아이콘 확인
3. "홈 화면에 추가" 또는 "설치" 프롬프트 클릭
4. 설치 다이얼로그에서 설치 확인

**검증 포인트**:
- ✅ 브라우저에서 PWA 설치 프롬프트 표시됨
- ✅ 설치 다이얼로그에 올바른 앱 정보 표시 (아이콘, 이름, 설명)
- ✅ 설치 완료 후 바탕화면/앱 목록에 앱 아이콘 생성
- ✅ 설치된 앱이 독립적으로 실행 가능

**예상 결과**:
- PWA 설치 프롬프트가 자동으로 나타나거나 수동으로 트리거 가능
- 설치 후 독립 앱으로 실행되어 브라우저 UI 없이 standalone 모드로 동작

### 3단계: 설치된 PWA 독립 실행 테스트
**목표**: 설치된 PWA가 독립 애플리케이션으로 정상 작동하는지 확인

**액션**:
1. 설치된 PWA 앱 아이콘 클릭하여 실행
2. 독립 창에서 앱 실행 확인
3. 브라우저 UI 요소 (주소창, 북마크바 등) 없음 확인
4. 앱 테마 색상 적용 확인

**검증 포인트**:
- ✅ 브라우저와 별도의 독립 창에서 실행됨
- ✅ 브라우저 UI 요소 (주소창, 북마크바, 탭) 숨김 처리됨  
- ✅ manifest의 theme_color가 앱 제목 표시줄에 적용됨
- ✅ 앱 아이콘이 제목 표시줄에 표시됨
- ✅ 모든 페이지 네비게이션이 정상 작동함

**예상 결과**:
- Standalone 모드에서 실행되어 네이티브 앱과 유사한 경험 제공
- 모든 기본 기능이 독립 앱에서도 정상 작동

### 4단계: 오프라인 모드 기본 기능 테스트
**목표**: 네트워크 연결이 끊어진 상태에서 앱의 기본 기능 확인

**액션**:
1. 개발자 도구 → Network 탭에서 "Offline" 체크박스 활성화
2. 페이지 새로고침하여 오프라인 상태 확인
3. 기본 페이지들 네비게이션 테스트
4. 오프라인 인디케이터 표시 확인
5. 로컬 스토리지 데이터 접근 확인

**검증 포인트**:
- ✅ 오프라인 상태에서도 홈페이지 접근 가능
- ✅ 캐시된 페이지들 (/, /search, /generate, /favorites, /settings) 접근 가능
- ✅ 오프라인 인디케이터가 UI에 표시됨
- ✅ 로컬 스토리지의 설정 데이터 정상 읽기/쓰기
- ✅ 즐겨찾기 데이터 오프라인에서도 접근 가능

**예상 결과**:
```javascript
// 오프라인에서 접근 가능한 기능들
const OFFLINE_FEATURES = [
  'Homepage navigation',
  'Settings page access', 
  'Favorites list viewing',
  'Theme switching',
  'Language switching',
  'Cached recipe viewing'
]
```

### 5단계: 오프라인 상태에서 사용자 인터랙션 테스트
**목표**: 네트워크가 없는 상태에서 사용자가 수행할 수 있는 액션 확인

**액션**:
1. 설정 페이지에서 테마 변경 시도
2. 언어 설정 변경 시도  
3. 즐겨찾기 목록에서 저장된 레시피 확인
4. 새로운 검색 시도 (실패 예상)
5. AI 레시피 생성 시도 (실패 예상)

**검증 포인트**:
- ✅ 오프라인에서도 테마 변경이 즉시 적용됨
- ✅ 언어 설정 변경이 정상 작동함
- ✅ 로컬에 저장된 즐겨찾기 레시피 목록 접근 가능
- ✅ API가 필요한 기능 시도 시 적절한 오프라인 에러 메시지 표시
- ✅ 오프라인 상태 메시지가 사용자 친화적임

**예상 결과**:
- 로컬 기능들은 정상 작동, 네트워크 의존 기능은 적절한 에러 핸들링

### 6단계: 네트워크 재연결 및 데이터 동기화 테스트
**목표**: 네트워크 재연결 시 데이터 동기화 및 기능 복구 확인

**액션**:
1. 오프라인 모드에서 설정 변경 (테마, 언어 등)
2. 새로운 즐겨찾기 추가 시도 (대기열 저장)
3. 네트워크 재연결 (Offline 체크박스 해제)
4. 페이지 새로고침 또는 자동 재연결 감지 대기
5. 변경된 설정들이 유지되는지 확인
6. API 기능들 정상 작동 확인

**검증 포인트**:
- ✅ 오프라인에서 변경한 설정들이 온라인 복구 후에도 유지됨
- ✅ 대기 중이던 데이터 동기화가 자동으로 실행됨
- ✅ API 의존 기능들이 재활성화됨
- ✅ 네트워크 재연결 알림이 사용자에게 표시됨
- ✅ 백그라운드 동기화가 정상 작동함

**예상 결과**:
- 모든 오프라인 변경사항이 보존되고 온라인 기능이 자동 복구됨

### 7단계: Service Worker 캐시 전략 검증
**목표**: Service Worker의 캐싱 전략이 적절히 구현되었는지 확인

**액션**:
1. 개발자 도구 → Application → Storage 확인
2. Cache Storage에서 캐시된 리소스 목록 확인
3. 특정 리소스의 캐시 만료 동작 확인
4. 캐시 업데이트 전략 테스트

**검증 포인트**:
- ✅ 핵심 리소스들이 적절히 캐시됨
- ✅ 캐시 크기가 합리적임 (100MB 이하)
- ✅ 캐시 만료 정책이 적절함
- ✅ 새 버전 배포 시 캐시 업데이트 메커니즘 작동

**예상 결과**:
```javascript
// 캐시된 리소스 예시
const EXPECTED_CACHE_ENTRIES = [
  'https://localhost:5179/',
  'https://localhost:5179/static/css/main.css',
  'https://localhost:5179/static/js/main.js',
  'https://localhost:5179/manifest.webmanifest',
  'https://localhost:5179/icons/icon-192x192.png'
]
```

## 성공 기준
- 모든 PWA 설치 조건이 충족되고 설치가 성공적으로 완료됨
- 독립 앱으로 실행 시 네이티브 앱과 유사한 UX 제공  
- 오프라인 상태에서 핵심 기능의 80% 이상 사용 가능
- 네트워크 재연결 시 5초 이내 자동 동기화 완료
- Service Worker가 안정적으로 동작하며 적절한 캐싱 전략 적용

## 실패 시나리오
1. **설치 실패**: PWA 설치 프롬프트가 나타나지 않거나 설치 과정에서 에러 발생
2. **독립 실행 실패**: 설치된 앱이 브라우저 탭에서만 실행되거나 독립 창에서 오류 발생  
3. **오프라인 접근 불가**: 네트워크 차단 시 앱에 접근할 수 없거나 빈 화면 표시
4. **데이터 손실**: 오프라인에서 변경한 설정이나 데이터가 온라인 복구 후 손실됨
5. **동기화 실패**: 네트워크 재연결 후 30초 이내 동기화가 이뤄지지 않음

## 추가 고려사항

### 브라우저 호환성
- **Chrome/Edge**: 완전 지원 예상
- **Firefox**: 기본 지원, 일부 제한사항 가능
- **Safari**: iOS/macOS에서 제한적 지원

### 성능 메트릭  
- **설치 시간**: 30초 이내 완료
- **오프라인 로딩**: 2초 이내 페이지 로드
- **캐시 크기**: 50MB 이내 권장
- **동기화 시간**: 온라인 복구 후 5초 이내

### 보안 고려사항
- HTTPS 환경에서만 PWA 기능 활용 가능
- Service Worker의 적절한 스코프 설정 확인
- 캐시된 민감 데이터 암호화 여부 확인

---
**작성일**: 2024년 8월 23일  
**작성자**: AI Recipe E2E Test Team  
**문서 버전**: 1.0  
**테스트 환경**: Chrome 127+, localhost:5179