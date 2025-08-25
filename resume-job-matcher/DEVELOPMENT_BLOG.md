# React + TypeScript 이력서 매칭 분석 플랫폼 개발기

## 프로젝트 개요
AI 기반 이력서와 채용공고 매칭 분석을 제공하는 웹 플랫폼을 React + TypeScript로 구현한 프로젝트입니다. 오늘 진행한 UI/UX 개선과 설정 시스템 고도화 작업을 중심으로 개발 경험을 공유합니다.

---

## 1. 프로젝트 구조 분석

### 전체 아키텍처
```
src/
├── components/              # 재사용 가능한 UI 컴포넌트
│   ├── ui/                 # shadcn/ui 기반 기본 컴포넌트
│   ├── navigation/         # 네비게이션 관련 컴포넌트
│   └── analysis/           # 분석 관련 특화 컴포넌트
├── pages/                  # 페이지 컴포넌트 (React Router)
├── services/               # 비즈니스 로직 및 API 서비스
├── types/                  # TypeScript 타입 정의
└── utils/                  # 유틸리티 함수들
```

### 핵심 기술 스택
- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui + Magic UI (애니메이션)  
- **Styling**: Tailwind CSS
- **State Management**: React Context API + localStorage
- **Routing**: React Router
- **Build Tool**: Vite (PWA 지원)

### 컴포넌트 계층 구조
```
App
├── Navigation (모든 페이지 공통)
├── Pages
│   ├── Landing (메인 페이지)
│   ├── Analyzer (분석 도구)
│   ├── HowItWorks (작동 원리)
│   └── KeywordDictionary (키워드 사전)
└── Modals
    ├── APISettingsDialog (설정)
    └── SuccessModal (분석 완료 알림)
```

---

## 2. 상태 관리 흐름 추적

### API 설정 상태 관리
```typescript
// freeAIService.ts - 중앙집중식 설정 관리
class FreeAIService {
  private config: AIServiceConfig;
  
  // localStorage와 동기화
  private loadConfig(): AIServiceConfig {
    const savedConfig = localStorage.getItem('aiServiceConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
  }
  
  public updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('aiServiceConfig', JSON.stringify(this.config));
  }
}
```

### 컴포넌트 간 상태 흐름
```
APISettingsDialog → freeAIService → localStorage
                 ↓
Analyzer 페이지 ← updateCurrentMode ← Navigation 컴포넌트
```

### 사용량 추적 상태 관리
```typescript
interface UsageStats {
  daily: number;
  monthly: number;
  lastReset: string;
  mode: APIMode;
}

// 자동 리셋 로직
private getUsageStats(): UsageStats {
  // 일일 리셋 체크
  if (stats.lastReset < today) {
    stats.daily = 0;
    stats.lastReset = today;
  }
  // 월간 리셋 체크
  const lastMonth = stats.lastReset.substring(0, 7);
  if (lastMonth < thisMonth) {
    stats.monthly = 0;
  }
}
```

---

## 3. 중요 유틸 함수 분석

### 모드 표시 정보 생성 함수
```typescript
const getModeDisplay = (mode: APIMode) => {
  switch (mode) {
    case 'mock':
      return { 
        text: '개발 모드', 
        variant: 'secondary' as const, 
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
      };
    case 'offline':
      return { 
        text: '오프라인', 
        variant: 'secondary' as const, 
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' 
      };
    // ... 기타 모드들
  }
};
```

**핵심 포인트:**
- `as const` 사용으로 타입 안정성 확보
- 다크 모드 지원을 위한 conditional 클래스
- 일관된 색상 시스템으로 사용자 인지성 향상

### 사용량 백분율 계산
```typescript
// 안전한 나눗셈과 반올림 처리
const getUsagePercentage = (used: number, limit: number): number => {
  if (limit === 0) return 0;
  return Math.round((used / limit) * 100);
};
```

### 실시간 모드 업데이트
```typescript
const updateCurrentMode = () => {
  const config = freeAIService.getConfig();
  setCurrentMode(config.mode);
};

useEffect(() => {
  updateCurrentMode();
}, []); // 마운트 시 초기화

// 설정 변경 시 콜백으로 호출
<APISettingsDialog onConfigUpdate={updateCurrentMode} />
```

---

## 4. 메인 컴포넌트 흐름 추적

### APISettingsDialog 컴포넌트 플로우
```typescript
// 1. 다이얼로그 열림 → 설정 로드
useEffect(() => {
  if (open) {
    loadConfig(); // config + usageStats + selectedMode 초기화
  }
}, [open]);

// 2. 사용자 모드 선택 → 임시 상태 저장
const handleModeSelect = (mode: APIMode) => {
  setSelectedMode(mode); // 즉시 적용하지 않음
};

// 3. 설정 적용 버튼 클릭 → 실제 적용
const handleApplySettings = () => {
  const updatedConfig = { ...config, mode: selectedMode };
  freeAIService.updateConfig(updatedConfig);
  onConfigUpdate?.(); // 부모 컴포넌트 업데이트 콜백
  onOpenChange(false); // 다이얼로그 닫기
};
```

### Navigation 컴포넌트 활용 패턴
```typescript
// 페이지별 Navigation 사용법
// Analyzer 페이지 - 모드 표시 O
<Navigation 
  onSettingsClick={() => setShowSettings(true)} 
  currentMode={getModeDisplay(currentMode)}
/>

// 기타 페이지 - 모드 표시 X
<Navigation />
```

### 분석 완료 플로우
```typescript
const handleAnalyze = async () => {
  setAnalyzing(true);
  try {
    const result = await freeAIService.analyzeResumeMatch(resumeText, jobText);
    setResult(result);
    setShowSuccessModal(true); // 성공 모달 표시
  } catch (error) {
    setError(error.message);
  } finally {
    setAnalyzing(false);
  }
};
```

---

## 5. 렌더링 최적화 포인트

### 조건부 렌더링 최적화
```typescript
// Before: 불필요한 컴포넌트 렌더링
{showAPIStatus && (
  <APIStatusIndicator />
  <Badge>현재 모드</Badge>
)}

// After: 필요한 것만 렌더링
{showAPIStatus && (
  <>
    {currentMode && <Badge className={currentMode.className}>{currentMode.text}</Badge>}
    <Badge>AI 분석 도구</Badge>
  </>
)}
```

### 상태 업데이트 최적화
```typescript
// 설정 변경 시 불필요한 리렌더링 방지
const handleModeSelect = useCallback((mode: APIMode) => {
  setSelectedMode(mode);
}, []);

// 의존성 배열 최적화
useEffect(() => {
  updateCurrentMode();
}, []); // 빈 배열로 마운트 시에만 실행
```

### 메모이제이션 활용
```typescript
const modeDisplay = useMemo(() => 
  currentMode ? getModeDisplay(currentMode) : null, 
  [currentMode]
);
```

---

## 6. 내가 개선한 부분

### UI/UX 개선 사항

#### 1. 네비게이션 통합 시스템
**Before**: 각 페이지마다 개별적인 네비게이션
**After**: 재사용 가능한 Navigation 컴포넌트

```typescript
// 공통 Navigation 컴포넌트 생성
export function Navigation({ onSettingsClick, showAPIStatus = true, currentMode }: NavigationProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  // ...
}
```

**개선 효과:**
- 코드 재사용성 향상
- 일관된 네비게이션 경험
- 유지보수성 개선

#### 2. 설정 시스템 고도화

**Before**: 설정 변경 즉시 적용
```typescript
const handleModeChange = (mode: APIMode) => {
  const updatedConfig = { ...config, mode };
  freeAIService.updateConfig(updatedConfig); // 즉시 적용
};
```

**After**: 미리보기 + 명시적 적용
```typescript
const handleModeSelect = (mode: APIMode) => {
  setSelectedMode(mode); // 임시 저장
};

const handleApplySettings = () => {
  if (selectedMode) {
    const updatedConfig = { ...config, mode: selectedMode };
    freeAIService.updateConfig(updatedConfig); // 명시적 적용
  }
};
```

**개선 효과:**
- 사용자 의도 명확화
- 실수로 인한 설정 변경 방지
- 더 나은 UX 제공

#### 3. 무료 할당량 추적 시각화

**Before**: 텍스트로만 표시
**After**: Progress Bar + 통계 정보

```typescript
<Progress 
  value={(usageStats.daily / (config.dailyLimit || 100)) * 100} 
  className="h-2"
/>
<div className="flex items-center justify-between">
  <span>{usageStats.daily} / {config.dailyLimit || 100}</span>
  <span>{Math.round((usageStats.daily / (config.dailyLimit || 100)) * 100)}%</span>
</div>
```

**개선 효과:**
- 사용량을 직관적으로 파악
- 한도 초과 방지
- 사용자 경험 향상

---

## 7. 트러블슈팅

### 문제 1: Runtime Error - `Brain is not defined`

**에러 상황:**
```javascript
ReferenceError: Brain is not defined at analyzer.tsx:363
```

**원인 분석:**
- lucide-react에서 Brain 아이콘 import 누락
- 컴파일 타임에 잡히지 않는 런타임 에러

**해결 방법:**
```typescript
// Before
import { PlayCircle, Loader2, AlertCircle } from 'lucide-react';

// After  
import { PlayCircle, Loader2, AlertCircle, Brain } from 'lucide-react';
```

**교훈:**
- import 구문을 체계적으로 관리해야 함
- 코드 분석 도구 활용 필요

### 문제 2: PWA Manifest 구문 오류

**에러 상황:**
```
Manifest: Line: 1, column: 1, Syntax error
```

**원인 분석:**
- vite.config.ts의 PWA 설정에서 아이콘 파일 경로 불일치
- 빌드 시 생성되는 manifest.json 파일이 잘못된 경로 참조

**해결 방법:**
```typescript
// Before
icons: [
  { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
  { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
]

// After
icons: [
  { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
  { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
]
```

**교훈:**
- 파일 경로는 실제 존재하는 파일과 일치해야 함
- PWA 설정 시 public 폴더 구조 확인 필요

### 문제 3: 중복 UI 요소 문제

**문제 상황:**
- 설정 팝업에 "취소"와 "닫기" 버튼 중복
- 분석 페이지에 API 모드 표시 2개 중복

**해결 방법:**
```typescript
// 중복 제거 전략
1. DialogFooter의 "닫기" 버튼 제거
2. APIStatusIndicator 제거하고 currentMode 배지만 유지
3. Navigation 컴포넌트에서 미사용 import 정리
```

**교훈:**
- UI 일관성 유지의 중요성
- 컴포넌트 설계 시 중복 요소 사전 확인

---

## 8. 배운 점과 고생한 점

### 배운 점

#### 1. 점진적 개선의 가치
사용자 피드백을 바탕으로 한 단계씩 개선해나가는 것이 전체를 한 번에 바꾸는 것보다 효과적이었습니다.

```typescript
// 단계별 개선 과정
1단계: 기본 설정 시스템 구현
2단계: 사용자 피드백 → 미리보기 기능 추가
3단계: 시각적 피드백 강화 → 배지 시스템 도입
4단계: 사용량 추적 시각화 추가
```

#### 2. TypeScript의 타입 안정성
타입을 먼저 정의하고 구현하는 방식이 런타임 에러를 크게 줄여준다는 것을 체감했습니다.

```typescript
// 타입 우선 설계
interface NavigationProps {
  onSettingsClick?: () => void;
  showAPIStatus?: boolean;
  currentMode?: {
    text: string;
    variant: 'default' | 'secondary';
    className: string;
  };
}
```

#### 3. 상태 관리의 복잡성
단순해 보이는 설정 하나도 여러 컴포넌트에 영향을 미치므로 상태 흐름을 명확히 설계해야 합니다.

```
설정 변경 → localStorage 업데이트 → 다른 컴포넌트 리렌더링 → UI 반영
```

### 고생한 점

#### 1. 상태 동기화 문제
설정 변경이 즉시 모든 컴포넌트에 반영되지 않아 여러 번 디버깅해야 했습니다.

**해결책:** `onConfigUpdate` 콜백을 통한 명시적 업데이트
```typescript
<APISettingsDialog onConfigUpdate={updateCurrentMode} />
```

#### 2. CSS 클래스명 충돌
Tailwind CSS의 다크 모드와 커스텀 클래스가 예상대로 동작하지 않는 경우가 있었습니다.

**해결책:** 조건부 클래스명 적용과 명시적인 색상 지정
```typescript
className={`px-3 py-1 ${currentMode.className}`}
```

#### 3. 컴포넌트 재사용성 설계
Navigation 컴포넌트를 모든 페이지에서 사용할 수 있도록 설계하는 것이 생각보다 복잡했습니다.

**해결책:** Optional props와 조건부 렌더링 활용
```typescript
{currentMode && (
  <Badge className={currentMode.className}>
    {currentMode.text}
  </Badge>
)}
```

---

## 마무리

이번 개발 세션을 통해 React + TypeScript 프로젝트에서 사용자 중심의 UI/UX 개선이 얼마나 중요한지 깨달았습니다. 특히 설정 시스템처럼 사용자와 직접 상호작용하는 부분은 명확한 피드백과 직관적인 인터페이스가 핵심이라는 것을 배웠습니다.

앞으로는 다음과 같은 부분을 더 개선해나갈 예정입니다:
- 컴포넌트 lazy loading을 통한 성능 최적화
- 키보드 네비게이션 접근성 개선
- 사용량 통계의 시각적 차트 구현

개발자로서 기술적 구현도 중요하지만, 최종 사용자의 경험을 항상 염두에 두고 개발해야 한다는 것을 다시 한번 느낀 의미 있는 개발 경험이었습니다.