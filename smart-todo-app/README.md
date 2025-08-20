# 스마트 할일 관리 (Smart Todo App)

AI 기반 스마트 할일 관리 웹 애플리케이션입니다. 자연어 처리를 통해 할일을 쉽게 추가하고, 포모도로 타이머로 집중력을 높여 생산성을 향상시킬 수 있습니다.

## 🌟 주요 기능

### 📝 자연어 할일 입력

- **자연어 처리**: "내일 오후 3시에 병원 가기"처럼 자연스럽게 입력
- **자동 분석**: Chrono.js와 compromise.js를 사용한 오프라인 처리
- **스마트 분류**: 키워드 기반 자동 카테고리 및 우선순위 분류

### 🎯 AI 서비스 모드

- **오프라인 모드**: 완전 무료, 로컬 처리
- **무료 API 모드**: 제한된 무료 API 사용 (Gemini, Hugging Face)
- **사용자 API 키 모드**: 개인 API 키 사용
- **자동 폴백**: API 실패 시 오프라인 모드로 자동 전환

### 📊 다양한 뷰 모드

- **대시보드**: 오늘의 할일 요약 및 통계
- **칸반 보드**: 드래그앤드롭으로 상태 변경
- **캘린더 뷰**: react-big-calendar를 사용한 일정 관리
- **분석 페이지**: 생산성 분석 및 통계

### ⏰ 포모도로 타이머

- **통합 타이머**: 할일과 연동된 포모도로 세션
- **자동 전환**: 작업-휴식 자동 전환 지원
- **세션 통계**: 집중 시간 및 생산성 추적
- **알림 기능**: 브라우저 알림 및 사운드

### 🎨 사용자 경험

- **다크모드**: 시스템 설정 연동 또는 수동 선택
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **PWA 지원**: 모바일 앱처럼 설치 가능
- **오프라인 기능**: 캐시된 데이터로 오프라인 사용

## 🛠 기술 스택

### Frontend

- **React 19** - 최신 React 기능 활용
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **Zustand** - 상태 관리

### 자연어 처리

- **Chrono.js** - 날짜/시간 파싱 (오프라인)
- **compromise.js** - 자연어 처리 (오프라인)
- **로컬 규칙** - 한국어 키워드 기반 분류

### UI/UX 라이브러리

- **@dnd-kit** - 드래그앤드롭 (React 19 호환)
- **react-big-calendar** - 캘린더 컴포넌트
- **lucide-react** - 아이콘
- **date-fns** - 날짜 유틸리티

### 빌드 도구

- **Vite** - 빠른 개발 서버 및 빌드
- **vite-plugin-pwa** - PWA 기능

## 📁 프로젝트 구조

```
smart-todo-app/
├── 📁 public/                    # 정적 파일
│   └── vite.svg                  # Vite 로고
├── 📁 src/                       # 소스 코드
│   ├── 📁 components/            # React 컴포넌트
│   │   ├── 📁 features/          # 기능별 컴포넌트
│   │   │   ├── KanbanBoard.tsx   # 칸반 보드 (드래그앤드롭)
│   │   │   ├── KanbanColumn.tsx  # 칸반 컬럼
│   │   │   ├── KanbanTaskCard.tsx # 칸반 할일 카드
│   │   │   ├── PomodoroTimer.tsx # 포모도로 타이머
│   │   │   ├── PomodoroStats.tsx # 포모도로 통계
│   │   │   ├── TaskCalendar.tsx  # 캘린더 컴포넌트
│   │   │   ├── TaskCard.tsx      # 할일 카드
│   │   │   ├── TaskQuickAdd.tsx  # 빠른 할일 추가
│   │   │   └── index.ts          # 컴포넌트 내보내기
│   │   ├── 📁 layout/            # 레이아웃 컴포넌트
│   │   │   ├── Header.tsx        # 상단 헤더
│   │   │   ├── Sidebar.tsx       # 사이드바 네비게이션
│   │   │   ├── Layout.tsx        # 전체 레이아웃
│   │   │   └── index.ts          # 레이아웃 내보내기
│   │   └── 📁 ui/                # 기본 UI 컴포넌트
│   │       ├── Button.tsx        # 버튼 컴포넌트
│   │       ├── Card.tsx          # 카드 컴포넌트
│   │       ├── Input.tsx         # 입력 컴포넌트
│   │       ├── Badge.tsx         # 배지 컴포넌트
│   │       └── index.ts          # UI 컴포넌트 내보내기
│   ├── 📁 pages/                 # 페이지 컴포넌트
│   │   ├── Dashboard.tsx         # 대시보드 메인 페이지
│   │   ├── TasksPage.tsx         # 할일 관리 페이지
│   │   ├── CalendarPage.tsx      # 캘린더 페이지
│   │   ├── PomodoroPage.tsx      # 포모도로 페이지
│   │   ├── AnalyticsPage.tsx     # 분석 페이지
│   │   └── index.ts              # 페이지 내보내기
│   ├── 📁 stores/                # Zustand 상태 관리
│   │   ├── taskStore.ts          # 할일 관리 스토어
│   │   ├── pomodoroStore.ts      # 포모도로 스토어
│   │   ├── settingsStore.ts      # 설정 스토어
│   │   └── index.ts              # 스토어 내보내기
│   ├── 📁 services/              # 외부 서비스 연동
│   │   ├── freeAIService.ts      # 무료 AI API 서비스
│   │   └── nlpService.ts         # 자연어 처리 서비스
│   ├── 📁 hooks/                 # 커스텀 React 훅
│   │   ├── usePomodoro.ts        # 포모도로 훅
│   │   └── index.ts              # 훅 내보내기
│   ├── 📁 utils/                 # 유틸리티 함수
│   │   ├── dateUtils.ts          # 날짜 관련 유틸
│   │   └── index.ts              # 유틸리티 내보내기
│   ├── 📁 types/                 # TypeScript 타입 정의
│   │   └── index.ts              # 전역 타입 정의
│   ├── 📁 constants/             # 상수 정의
│   │   └── index.ts              # 애플리케이션 상수
│   ├── 📁 assets/                # 정적 리소스
│   │   └── react.svg             # React 로고
│   ├── App.tsx                   # 메인 애플리케이션
│   ├── main.tsx                  # 애플리케이션 진입점
│   ├── App.css                   # 전역 스타일
│   ├── index.css                 # Tailwind CSS 설정
│   └── vite-env.d.ts            # Vite 타입 정의
├── 📄 package.json               # 프로젝트 의존성
├── 📄 package-lock.json          # 잠금 파일
├── 📄 tsconfig.json              # TypeScript 설정
├── 📄 tsconfig.app.json          # 앱용 TypeScript 설정
├── 📄 tsconfig.node.json         # Node.js용 TypeScript 설정
├── 📄 vite.config.ts             # Vite 설정
├── 📄 tailwind.config.js         # Tailwind CSS 설정
├── 📄 postcss.config.js          # PostCSS 설정
├── 📄 eslint.config.js           # ESLint 설정
├── 📄 vercel.json                # Vercel 배포 설정
└── 📄 README.md                  # 프로젝트 문서
```

### 📂 주요 디렉토리 설명

#### `src/components/`

- **features/**: 비즈니스 로직이 포함된 기능별 컴포넌트
- **layout/**: 페이지 레이아웃과 네비게이션 컴포넌트
- **ui/**: 재사용 가능한 기본 UI 컴포넌트

#### `src/stores/`

- **Zustand** 기반 상태 관리
- 각 도메인별로 분리된 스토어 (할일, 포모도로, 설정)
- **persist** 미들웨어로 로컬 스토리지 자동 저장

#### `src/services/`

- **AI API 연동**: Gemini, Hugging Face API 서비스
- **자연어 처리**: Chrono.js, compromise.js 기반 오프라인 처리
- **폴백 시스템**: API 실패 시 오프라인 모드 자동 전환

#### `src/types/`

- **TypeScript 타입 정의**: 전역에서 사용되는 인터페이스와 타입
- **완전한 타입 안전성**: 모든 데이터 구조에 대한 타입 정의

#### `src/utils/`

- **날짜 처리**: 한국어 형식 날짜 포맷팅, 상대적 시간 표시
- **유틸리티 함수**: ID 생성, 디바운스, 쓰로틀링 등

## 🚀 시작하기

### 1. 프로젝트 복제

```bash
git clone <repository-url>
cd smart-todo-app
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 필요한 설정을 수정하세요:

```env
# 기본 오프라인 모드 (무료)
VITE_API_MODE=offline

# 선택적: 무료 API 사용시 (제한적)
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_HUGGINGFACE_TOKEN=your_huggingface_token
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속하세요.

## 📖 사용법

### 할일 추가

대시보드나 할일 페이지에서 자연어로 할일을 입력하세요:

```
내일 오후 3시에 병원 가기
긴급한 프로젝트 보고서 작성 2시간
다음주 월요일 팀 미팅 준비
```

### API 모드 설정

설정 페이지에서 AI 서비스 모드를 변경할 수 있습니다:

- **오프라인 모드**: 로컬 처리만 사용 (권장)
- **무료 API 모드**: 제한된 무료 API 사용
- **사용자 API 키**: 개인 API 키로 무제한 사용

### 포모도로 사용

1. 포모도로 페이지에서 할일을 선택
2. 작업/휴식 시간 설정
3. 타이머 시작으로 집중 세션 시작

## 🔧 API 제한사항

### 무료 API 한도

- **Gemini API**: 일 15회, 월 500회
- **Hugging Face**: 일 1,000회, 월 30,000회

한도 초과시 자동으로 오프라인 모드로 전환됩니다.

### 오프라인 모드 기능

- 한국어 키워드 기반 카테고리 분류
- 우선순위 키워드 감지 (긴급, 중요, ASAP)
- 시간 표현 파싱 (Chrono.js)
- 완전 무료, 무제한 사용

## 🏗 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

### Vercel 배포

1. Vercel 계정에 연결
2. 환경변수 설정
3. 자동 배포 또는 수동 배포

## 📱 PWA 기능

- **앱 설치**: 브라우저에서 "홈 화면에 추가" 지원
- **오프라인 사용**: 캐시된 데이터로 오프라인 사용 가능
- **푸시 알림**: 브라우저 알림 지원 (포모도로 타이머)

## 🎯 로드맵

- [ ] 반복 할일 기능
- [ ] 팀 협업 기능
- [ ] 더 많은 AI 모델 지원
- [ ] 음성 입력 지원
- [ ] 데이터 내보내기/가져오기

## 📅 개발 일지

### ✨ 주요 기능 개선

#### 🎨 **UI/UX 개선**

- **시스템 테마 모드 제거**: 다크/라이트 모드만 지원하여 UI 일관성 향상
- **직관적 상태 토글**: TaskCard의 상태 변경을 더 직관적으로 개선
  - 할일(○) → 진행중(▶) → 완료(✓) 아이콘으로 시각화
  - 호버 시 다음 동작 미리보기 및 툴팁 제공
  - 색상 변화로 상태 전환 예측 가능

#### 🔧 **기능성 향상**

- **설정 페이지 통합**: 헤더와 사이드바의 설정이 하나의 페이지로 통합
- **다국어 지원 (i18n)**: 완전한 한국어/영어 지원 시스템 구축
- **알람 및 사용자 토글**: 헤더의 알람/사용자 드롭다운 기능 완전 구현
- **포모도로 설정 동기화**: 설정 페이지와 포모도로 타이머 간 실시간 동기화

#### 📅 **캘린더 기능 강화**

- **한국어 날짜 형식 지원**: "8월30일", "다음주 월요일" 등 자연스러운 입력
- **이벤트 상세 관리**: 캘린더 이벤트 클릭 시 상세보기/편집/삭제 가능
- **과거 이벤트 표시**: 캘린더에서 과거 날짜 할일도 정상 표시
- **퀵뷰 모달**: 통계 카드 클릭으로 해당 카테고리 할일 목록 즉시 확인

#### 📋 **칸반보드 업그레이드**

- **편집 기능**: 칸반 카드 클릭으로 할일 상세 편집 가능
- **드래그앤드롭 개선**: 카드 간 정확한 순서 변경 및 우선순위 자동 조정
- **스크롤 기능**: 할일이 많을 때 컬럼 내 스크롤로 모든 카드 확인 가능
- **커스텀 스크롤바**: 라이트/다크 모드에 맞춘 아름다운 스크롤바 디자인

---

## 🛠 트러블슈팅 기록

### 🚨 **주요 문제 해결**

#### 1. **캘린더 과거 이벤트 표시 문제**

**문제**: 과거 날짜에 생성한 할일이 캘린더에 표시되지 않음

```
Creating event for 외출: 2026-08-16T03:00:00.000Z
Current calendar month: 2025 8
```

**원인**: 샘플 데이터의 년도 불일치 (2025 vs 2026)
**해결**:

- 이벤트 생성 로직에서 년도 일관성 확보
- `allDay: true` 설정으로 시간대 문제 해결
- 디버그 로그 추가로 데이터 흐름 추적

#### 2. **드래그앤드롭 순서 변경 문제**

**문제**: "할일 카드 사이에 넣는게 안돼"
**원인**:

- `arrayMove`가 로컬 배열에만 적용되고 Zustand 스토어 미반영
- `collisionDetection`이 카드 사이 삽입점 정확히 감지 못함
  **해결**:

```typescript
// reorderTasks 액션 추가
reorderTasks: (status, oldIndex, newIndex) => {
  // 전체 tasks 배열 재구성
  const reorderedTasks = [...statusTasks];
  const [movedTask] = reorderedTasks.splice(oldIndex, 1);
  reorderedTasks.splice(newIndex, 0, movedTask);
};

// 충돌 감지 개선
collisionDetection = { closestCorners }; // closestCenter → closestCorners
```

#### 3. **설정 언어 변환 문제**

**문제**: 설정 페이지에서 영어 변환이 작동하지 않음
**해결**:

- 완전한 i18n 시스템 구축 (`translations.ts`, `useTranslation` 훅)
- 모든 하드코딩된 텍스트를 `t()` 함수로 변환
- 다크모드에서 가독성을 위한 색상 조정

#### 4. **퀵뷰 버튼 표시 문제**

**문제**: 캘린더 상단 4개 버튼이 안보임
**원인**: 컴포넌트 중첩 구조로 버튼이 숨겨짐
**해결**:

- 버튼을 `TaskCalendar` 내부로 이동하여 렌더링 확인
- 최종적으로 통계 카드 자체를 클릭 가능하게 변경
- 사용자 경험 개선을 위한 디자인 변경

---

## 💡 기술적 도전과 학습

### 🔬 **복잡한 상태 관리**

- **Zustand Persist**: 로컬 스토리지와 상태 동기화
- **중복 상태 제거**: pomodoroStore가 settingsStore 직접 참조하도록 변경
- **실시간 동기화**: 설정 변경 시 즉시 UI 반영

### 🎯 **React 19 호환성**

- **dnd-kit**: React 19와의 호환성 확보
- **이벤트 핸들링**: 클릭과 드래그 이벤트 충돌 방지

```typescript
const handleCardClick = (e: React.MouseEvent) => {
  if (isDraggingState || isDragging) return; // 드래그 중 클릭 방지
  setIsModalOpen(true);
};
```

### 📱 **반응형 및 접근성**

- **터치 디바이스**: 드래그앤드롭 터치 지원
- **키보드 접근성**: `sortableKeyboardCoordinates` 활용
- **커스텀 스크롤바**: 크로스 브라우저 호환성

### 🌐 **다국어화 시스템**

```typescript
// 완전한 타입 안전성을 가진 번역 시스템
const translations = {
  ko: { taskStatus: { todo: "할일", inProgress: "진행중" } },
  en: { taskStatus: { todo: "Todo", inProgress: "In Progress" } },
};

const t = (key: keyof typeof translations.ko) =>
  translations[language][key] || key;
```

---

## ⚡ 성능 최적화

### 🚀 **개발 효율성**

- **병렬 도구 호출**: 여러 파일 동시 읽기로 응답 속도 3-5배 향상
- **컴포넌트 재사용**: `TaskQuickViewModal` 등 공통 컴포넌트 활용
- **스마트 리렌더링**: 불필요한 리렌더링 최소화

### 🎨 **UI 성능**

- **가상 스크롤**: 큰 할일 목록에서도 부드러운 스크롤
- **애니메이션 최적화**: CSS `transition-all duration-200`으로 부드러운 상태 변화
- **메모이제이션**: `useMemo`, `useCallback` 적극 활용

---

## 📚 문서화 개선

### 📖 **JSDoc 추가**

모든 함수와 컴포넌트에 초보자도 이해할 수 있는 상세한 JSDoc 추가:

```typescript
/**
 * 할일을 카드 형태로 표시하는 컴포넌트
 *
 * @description
 * 개별 할일을 카드 형태로 렌더링합니다. 두 가지 레이아웃을 지원합니다:
 * - compact: 간단한 한 줄 레이아웃
 * - regular: 상세 정보가 포함된 카드 레이아웃
 *
 * @param {TaskCardProps} props - 컴포넌트 속성
 * @returns {JSX.Element} 렌더링된 할일 카드
 *
 * @example
 * <TaskCard task={myTask} compact={true} />
 */
```

### 📁 **프로젝트 구조 문서화**

- 완전한 폴더 구조 트리
- 각 디렉토리와 파일의 역할 설명
- 아키텍처 설계 원칙 문서화

---

## 🎉 결과 및 성과

### ✅ **개선된 사용자 경험**

- **직관적 인터페이스**: 사용자가 예측 가능한 상호작용
- **빠른 피드백**: 모든 액션에 즉시 시각적 피드백
- **일관된 디자인**: 전체 앱에서 통일된 디자인 언어

### 🛠 **개발자 경험 향상**

- **완전한 타입 안전성**: TypeScript + JSDoc으로 개발 효율성 극대화
- **명확한 아키텍처**: 새로운 개발자도 쉽게 이해할 수 있는 구조
- **확장 가능성**: 새로운 기능 추가가 용이한 설계

### 📈 **기술적 성숙도**

- **React 19 최신 기능 활용**: 최신 React 생태계 적극 도입
- **모던 상태 관리**: Zustand + TypeScript로 예측 가능한 상태 흐름
- **성능 최적화**: 사용자와 개발자 모두를 위한 최적화

---

## 🤝 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 열기

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🙏 감사의 글

- **Chrono.js** - 강력한 날짜 파싱
- **compromise.js** - 자연어 처리
- **Tailwind CSS** - 아름다운 UI
- **React Big Calendar** - 캘린더 컴포넌트

---

💡 **팁**: 오프라인 모드로도 충분히 강력한 기능을 제공하므로, API 키 없이도 바로 사용할 수 있습니다!
