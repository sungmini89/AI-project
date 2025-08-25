# AI Diary - 감정 분석 일기 애플리케이션

<div align="center">
  <img src="public/icons/diary-icon.svg" alt="AI Diary Logo" width="120" height="120">
  <h3>AI 기반 감정 분석으로 당신의 일상을 더 깊이 이해하세요</h3>
</div>

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [PRD (Product Requirements Document)](#-prd-product-requirements-document)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [주요 기능](#-주요-기능)
- [설치 및 실행](#-설치-및-실행)
- [트러블슈팅](#-트러블슈팅)
- [개발 가이드](#-개발-가이드)
- [라이선스](#-라이선스)

## 🎯 프로젝트 개요

AI Diary는 사용자가 작성한 일기 내용을 AI가 분석하여 감정 상태를 파악하고, 이를 시각화하여 제공하는 웹 애플리케이션입니다.

**핵심 가치:**

- 📝 **직관적인 일기 작성**: 리치 텍스트 에디터로 편리한 일기 작성
- 🧠 **AI 감정 분석**: 자연어 처리를 통한 정확한 감정 상태 분석
- 📊 **데이터 시각화**: 감정 트렌드, 통계, 캘린더 등 다양한 형태로 데이터 제공
- 🌙 **다크모드 지원**: 사용자 편의성을 위한 테마 시스템
- 🌍 **다국어 지원**: 한국어/영어 지원으로 글로벌 사용자 확보
- 📱 **PWA 지원**: 모바일 친화적이고 오프라인 사용 가능

---

## 📋 PRD (Product Requirements Document)

### 1. 제품 비전

사용자의 일상적인 감정 상태를 체계적으로 기록하고 분석하여, 정신 건강 관리와 자기 이해를 돕는 AI 기반 일기 애플리케이션

### 2. 목표 사용자

- **주요 타겟**: 20-40대 성인 (정신 건강에 관심이 있는 사용자)
- **부차 타겟**: 심리학 연구자, 감정 관리가 필요한 학생/직장인

### 3. 핵심 기능 요구사항

#### 3.1 일기 작성 및 관리

- **일기 작성**: 제목과 내용을 포함한 일기 작성
- **자동 저장**: 실시간 자동 저장으로 데이터 손실 방지
- **편집/삭제**: 기존 일기 수정 및 삭제 기능
- **검색 기능**: 제목, 내용, 날짜 기반 검색

#### 3.2 AI 감정 분석

- **자동 분석**: 일기 작성 완료 시 자동 감정 분석
- **감정 분류**: 행복, 슬픔, 화남, 중립 등 주요 감정 카테고리
- **감정 점수**: -5 ~ +5 범위의 정량적 감정 점수
- **키워드 추출**: 긍정적/부정적 키워드 자동 추출

#### 3.3 데이터 시각화

- **통계 대시보드**: 전체 일기 수, 평균 감정 점수, 감정 분포
- **감정 트렌드**: 주간/월간 감정 변화 추이
- **감정 캘린더**: 날짜별 감정 상태를 캘린더 형태로 표시
- **차트 분석**: 막대 차트, 도넛 차트, 선 그래프 등 다양한 차트

#### 3.4 사용자 설정

- **테마 설정**: 라이트/다크 모드 선택
- **언어 설정**: 한국어/영어 지원
- **자동 백업**: 설정 가능한 자동 백업 간격
- **알림 설정**: 푸시 알림 활성화/비활성화

### 4. 비기능적 요구사항

- **성능**: 페이지 로딩 시간 3초 이내
- **반응성**: 모바일 및 데스크톱 환경 모두 지원
- **보안**: 클라이언트 사이드 데이터 저장 (개인정보 보호)
- **접근성**: WCAG 2.1 AA 기준 준수

---

## 🛠️ 기술 스택

### Frontend

- **React 18** - 사용자 인터페이스 구축
- **TypeScript** - 타입 안정성 및 개발 생산성 향상
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크

### 상태 관리

- **React Context API** - 전역 상태 관리
- **React Hooks** - 컴포넌트 상태 및 사이드 이펙트 관리

### 데이터베이스

- **IndexedDB** - 클라이언트 사이드 데이터 저장
- **Dexie.js** - IndexedDB 래퍼 라이브러리

### AI 서비스

- **FreeAI Service** - 감정 분석 API 연동
- **Hugging Face** - 오프라인 감정 분석 모델
- **Google Gemini** - 고급 자연어 처리

### UI 컴포넌트

- **Tiptap** - 리치 텍스트 에디터
- **Chart.js** - 데이터 시각화 차트
- **React Calendar** - 캘린더 컴포넌트
- **Lucide React** - 아이콘 라이브러리

### PWA

- **Service Worker** - 오프라인 지원 및 캐싱
- **Web App Manifest** - 앱 설치 및 홈 화면 추가

---

## 📁 프로젝트 구조

```
ai-diary/
├── public/                          # 정적 파일
│   ├── icons/                      # 앱 아이콘
│   ├── manifest.json               # PWA 매니페스트
│   └── sw.js                      # 서비스 워커
├── src/                           # 소스 코드
│   ├── components/                # 재사용 가능한 컴포넌트
│   │   ├── dashboard/            # 대시보드 관련 컴포넌트
│   │   │   ├── EmotionCalendar.tsx    # 감정 캘린더
│   │   │   └── EmotionChart.tsx       # 감정 차트
│   │   ├── editor/               # 에디터 관련 컴포넌트
│   │   │   └── DiaryEditor.tsx        # 일기 에디터
│   │   └── layout/               # 레이아웃 컴포넌트
│   │       └── Layout.tsx             # 메인 레이아웃
│   ├── contexts/                  # React Context
│   │   └── AppContext.tsx             # 전역 상태 관리
│   ├── hooks/                     # 커스텀 훅 (삭제됨)
│   ├── pages/                     # 페이지 컴포넌트
│   │   ├── AnalyticsPage.tsx          # 감정 분석 페이지
│   │   ├── DiaryListPage.tsx          # 일기 목록 페이지
│   │   ├── HomePage.tsx               # 홈 페이지
│   │   ├── SettingsPage.tsx           # 설정 페이지
│   │   └── WritePage.tsx              # 일기 작성 페이지
│   ├── services/                  # 비즈니스 로직 서비스
│   │   ├── databaseService.ts          # 데이터베이스 관리
│   │   ├── emotionAnalysisService.ts  # 감정 분석 서비스
│   │   ├── freeAIService.ts            # AI 서비스 연동
│   │   └── notificationService.ts      # 알림 서비스
│   ├── App.tsx                    # 메인 앱 컴포넌트
│   └── main.tsx                   # 앱 진입점
├── .cursor/                       # Cursor IDE 설정
│   └── rules/                     # 코딩 규칙 및 가이드
├── .taskmaster/                   # Taskmaster 설정
├── package.json                   # 프로젝트 의존성
└── README.md                      # 프로젝트 문서
```

### 주요 컴포넌트 설명

#### 📊 **AnalyticsPage.tsx**

- 감정 분석 통계 대시보드
- 날짜별 감정 점수 팝업 모달
- 감정 분포, 트렌드, 캘린더 통합 제공

#### ✏️ **DiaryEditor.tsx**

- Tiptap 기반 리치 텍스트 에디터
- HTML 태그 제거 및 순수 텍스트 저장
- 자동 감정 분석 통합

#### 🏠 **HomePage.tsx**

- 최근 일기 요약 및 전체 통계
- 감정 분포 및 트렌드 개요
- 빠른 일기 작성 접근

#### ⚙️ **SettingsPage.tsx**

- 테마, 언어, 자동 저장 설정
- 알림 및 백업 설정 관리
- 설정 변경 시 즉시 적용

---

## 🚀 주요 기능

### 1. 일기 작성 및 관리

- **리치 텍스트 편집**: 굵게, 기울임, 목록 등 다양한 텍스트 스타일
- **자동 저장**: 실시간 자동 저장으로 데이터 손실 방지
- **검색 및 필터링**: 제목, 내용, 날짜 기반 검색
- **편집/삭제**: 기존 일기 수정 및 삭제

### 2. AI 감정 분석

- **자동 분석**: 일기 작성 완료 시 즉시 감정 분석
- **감정 분류**: 10가지 주요 감정 카테고리 분류
- **정량적 점수**: -5 ~ +5 범위의 감정 점수
- **키워드 추출**: 긍정적/부정적 키워드 자동 추출

### 3. 데이터 시각화

- **통계 대시보드**: 종합적인 감정 상태 요약
- **감정 트렌드**: 시간에 따른 감정 변화 추이
- **감정 캘린더**: 날짜별 감정 상태 시각화
- **차트 분석**: 다양한 형태의 데이터 차트

### 4. 사용자 경험

- **다크모드/라이트모드**: 사용자 선호도에 따른 테마 선택
- **한국어/영어 지원**: 다국어 인터페이스
- **반응형 디자인**: 모바일 및 데스크톱 환경 최적화
- **PWA 지원**: 앱 설치 및 오프라인 사용

---

## ⚡ 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd ai-diary
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 프로덕션 빌드

```bash
npm run build
npm run preview
```

### 5. 환경 변수 설정

`.env` 파일을 생성하고 필요한 API 키를 설정:

```env
ANTHROPIC_API_KEY=your_api_key_here
PERPLEXITY_API_KEY=your_api_key_here
OPENAI_API_KEY=your_api_key_here
```

---

## 🔧 트러블슈팅

### 1. PWA 및 서비스 워커 문제

#### 문제 상황

- PWA 아이콘 로딩 실패
- 서비스 워커 등록 오류
- 캐시 관리 문제

#### 해결 방법

```typescript
// main.tsx - 서비스 워커 관리 개선
if ("serviceWorker" in navigator) {
  // 기존 서비스 워커 해제
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    await registration.unregister();
  }

  // 기존 캐시 정리
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));

  // 새 서비스 워커 등록
  const registration = await navigator.serviceWorker.register("/sw.js");
}
```

#### 결과

- PWA 아이콘 정상 로딩
- 서비스 워커 안정적 동작
- 캐시 충돌 문제 해결

### 2. React Router 설정 문제

#### 문제 상황

- `UNSAFE_future` export 오류
- 라우팅 설정 복잡성
- 컴포넌트 선언 순서 문제

#### 해결 방법

```typescript
// App.tsx - 라우팅 구조 단순화
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <HomePage />
      </Layout>
    ),
  },
  {
    path: "/write",
    element: (
      <Layout>
        <WritePage />
      </Layout>
    ),
  },
  // ... 기타 라우트
]);

function App() {
  return <RouterProvider router={router} />;
}
```

#### 결과

- 라우팅 오류 해결
- 코드 구조 단순화
- 성능 향상

### 3. 테마 및 언어 모드 전역 상태 관리

#### 문제 상황

- 개별 훅으로 인한 상태 동기화 문제
- 컴포넌트 간 테마/언어 변경 반영 지연
- 복잡한 이벤트 리스너 구조

#### 해결 방법

```typescript
// AppContext.tsx - 전역 상태 관리 통합
export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("ko");
  const [isDark, setIsDark] = useState(false);

  // 테마 변경 시 DOM 즉시 적용
  useEffect(() => {
    applyThemeToDOM(theme);
    setIsDark(theme === "dark");
  }, [theme]);

  // 언어 변경 시 DOM 즉시 적용
  useEffect(() => {
    applyLanguageToDOM(language);
  }, [language]);

  // ... 기타 상태 관리 로직
};
```

#### 결과

- 테마/언어 변경 즉시 반영
- 상태 동기화 문제 해결
- 코드 복잡성 감소

### 4. IndexedDB 스키마 및 데이터 타입 문제

#### 문제 상황

- `DexieError2` 데이터베이스 오류
- 스키마 버전 관리 복잡성
- 타입 불일치로 인한 런타임 오류

#### 해결 방법

```typescript
// databaseService.ts - 스키마 통합 및 타입 안정성 향상
class DatabaseService extends Dexie {
  constructor() {
    super("AIDiaryDB");

    // 단일 버전으로 통합하여 스키마 관리
    this.version(1)
      .stores({
        entries: "id, createdAt, updatedAt",
        emotionHistory: "id, date, emotion, entryId",
        settings: "++id",
        backups: "++id, timestamp",
      })
      .upgrade(async (tx) => {
        // 기존 설정 테이블 초기화
        await tx.table("settings").clear();

        // 기본 설정 추가
        await tx.table("settings").add({
          theme: "light",
          language: "ko",
          autoSave: true,
          autoSaveInterval: 30000,
          notifications: true,
          backupEnabled: true,
          backupInterval: 7,
        });
      });
  }
}
```

#### 결과

- 데이터베이스 오류 해결
- 스키마 관리 단순화
- 타입 안정성 향상

### 5. 다크모드 스타일 적용 문제

#### 문제 상황

- 일부 컴포넌트에서 다크모드 미적용
- 서드파티 라이브러리 스타일 오버라이드 실패
- CSS 우선순위 문제

#### 해결 방법

```typescript
// EmotionCalendar.tsx - 강제 스타일 오버라이드
const EmotionCalendar: React.FC = () => {
  return (
    <div className={`emotion-calendar ${isDark ? "dark" : "light"}`}>
      <Calendar locale={locale} />

      {/* !important를 사용한 강제 스타일 적용 */}
      <style>{`
        .emotion-calendar.dark .react-calendar {
          background-color: #374151 !important;
          color: #f9fafb !important;
        }
        .emotion-calendar.dark .react-calendar__tile {
          color: #f9fafb !important;
        }
        /* ... 기타 다크모드 스타일 */
      `}</style>
    </div>
  );
};
```

#### 결과

- 모든 컴포넌트에서 다크모드 정상 적용
- 서드파티 라이브러리 스타일 오버라이드 성공
- 일관된 사용자 경험 제공

### 6. 감정 분석 결과 표시 문제

#### 문제 상황

- HTML 태그가 저장된 콘텐츠에 포함
- 감정 분석 결과 구조 불일치
- 키워드 속성 접근 오류

#### 해결 방법

```typescript
// DiaryEditor.tsx - HTML 태그 제거 및 데이터 구조 정리
const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, "").trim();
};

const handleSave = async () => {
  const content = editor.getHTML();
  const cleanContent = stripHtmlTags(content); // 순수 텍스트로 저장

  const diaryEntry: DiaryEntry = {
    // ... 기타 필드
    content: cleanContent, // 순수 텍스트로 저장
  };
};

// 감정 분석 결과 표시 개선
const getEmotionDisplay = (analysisResult: EmotionAnalysisResult) => {
  const { primaryEmotion, score, words, confidence } = analysisResult;

  return (
    <div>
      {/* 긍정적 키워드 */}
      {words.positive.slice(0, 3).map((word, index) => (
        <span key={index} className="keyword positive">
          {word}
        </span>
      ))}

      {/* 부정적 키워드 */}
      {words.negative.slice(0, 3).map((word, index) => (
        <span key={index} className="keyword negative">
          {word}
        </span>
      ))}
    </div>
  );
};
```

#### 결과

- HTML 태그 없는 깔끔한 콘텐츠 저장
- 감정 분석 결과 정확한 표시
- 키워드 표시 오류 해결

### 7. 날짜 검색 기능 구현 문제

#### 문제 상황

- 다양한 날짜 형식 검색 미지원
- 시간대 문제로 인한 날짜 매치 실패
- 검색 로직 복잡성

#### 해결 방법

```typescript
// DiaryListPage.tsx - 날짜 검색 기능 개선
const matchesDateSearch = (searchTerm: string, entryDate: Date): boolean => {
  if (!searchTerm.trim()) return false;

  const searchLower = searchTerm.toLowerCase().trim();
  const entryDateObj = new Date(entryDate);

  // MM/DD 형식 (예: 8/22, 08/22)
  const mmddPattern = /^(\d{1,2})\/(\d{1,2})$/;
  const mmddMatch = searchLower.match(mmddPattern);

  if (mmddMatch) {
    const month = parseInt(mmddMatch[1]);
    const day = parseInt(mmddMatch[2]);

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const entryMonth = entryDateObj.getMonth() + 1;
      const entryDay = entryDateObj.getDate();

      if (entryMonth === month && entryDay === day) {
        return true;
      }
    }
  }

  // MM월 DD일 형식 (예: 8월 22일)
  const koreanPattern = /^(\d{1,2})월\s*(\d{1,2})일$/;
  // ... 한국어 패턴 처리

  // YYYY-MM-DD 형식
  const fullPattern = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  // ... 전체 날짜 패턴 처리

  return false;
};
```

#### 결과

- 다양한 날짜 형식 검색 지원
- 정확한 날짜 매칭
- 사용자 편의성 향상

### 8. 감정 분석 → 저장 플로우 문제

#### 문제 상황

- 일기 작성 후 감정 분석 단계가 누락됨
- 저장 버튼만 존재하여 분석 없이 바로 저장 가능
- 사용자가 의도한 "분석 → 저장" 순서 플로우 부재

#### 해결 방법

```typescript
// DiaryEditor.tsx - 분석 → 저장 플로우 복원
const DiaryEditor: React.FC<DiaryEditorProps> = ({ entry, onSave, onCancel }) => {
  const [analysisResult, setAnalysisResult] = useState<EmotionAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div>
      {/* 액션 버튼들 */}
      <div className="flex items-center space-x-2">
        {/* 감정 분석 버튼 (녹색) */}
        <button
          onClick={async () => {
            // 제목과 내용 검증
            if (!title.trim() || !editor?.getHTML()) {
              toast.error("제목과 내용을 입력해주세요.");
              return;
            }
            
            setIsAnalyzing(true);
            try {
              const content = editor.getHTML();
              const cleanContent = stripHtmlTags(content);
              const result = await emotionAnalysisService.analyzeEmotion(cleanContent);
              setAnalysisResult(result);
              toast.success("감정 분석이 완료되었습니다.");
            } catch (error) {
              toast.error("감정 분석에 실패했습니다.");
            } finally {
              setIsAnalyzing(false);
            }
          }}
          disabled={isAnalyzing || isSaving}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          {isAnalyzing ? "분석 중..." : "분석"}
        </button>

        {/* 저장 버튼 (파란색) - 분석 완료 후에만 활성화 */}
        <button
          onClick={handleSave}
          disabled={isSaving || isAnalyzing || !analysisResult}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {isSaving ? "저장 중..." : "저장"}
        </button>
      </div>

      {/* 감정 분석 결과 표시 */}
      {analysisResult && (
        <div className="border-t border-gray-200 pt-4">
          <h4>감정 분석 결과</h4>
          {getEmotionDisplay(analysisResult)}
        </div>
      )}
    </div>
  );
};
```

#### 결과

- **올바른 플로우**: 분석 → 저장 순서로 진행
- **명확한 상태**: 각 단계별 버튼 상태와 텍스트
- **사용자 안내**: 분석 완료 후 저장 가능하다는 명확한 피드백
- **시각적 구분**: 녹색(분석)과 파란색(저장) 버튼으로 역할 구분

### 9. 일기 작성 칸 초기화 문제

#### 문제 상황

- 일기 작성 후 분석 → 저장이 완료되어도 일기 작성 칸이 초기화되지 않음
- 새로 작성된 일기의 경우 `navigate(\`/write/${diaryEntry.id}\`)`로 이동하여 같은 페이지에 머물러 있음
- 사용자가 새로운 일기를 작성하려면 페이지를 새로고침해야 하는 불편함

#### 해결 방법

```typescript
// WritePage.tsx - 저장 후 페이지 이동 로직 수정
const handleSave = async (diaryEntry: DiaryEntry) => {
  try {
    if (id) {
      // 기존 일기 수정 - 일기 목록 페이지로 이동
      navigate("/diary");
    } else {
      // 새 일기 작성 - 일기 목록 페이지로 이동하여 작성 칸 초기화
      navigate("/diary");
    }
  } catch (error) {
    console.error("onSave 콜백 실행 실패:", error);
  }
};
```

#### 결과

- **완전한 초기화**: 일기 작성 후 작성 칸이 깨끗하게 초기화
- **사용자 경험 개선**: 새로운 일기 작성 준비가 즉시 가능
- **직관적인 플로우**: 저장 완료 → 목록 페이지 → 새 작성 준비

### 10. Vercel 빌드 오류 해결

#### 문제 상황

- `process.env.NODE_ENV` 관련 TypeScript 오류
- `@types/node` 타입 정의 누락
- Vite 환경에서 Node.js 환경 변수 접근 문제

#### 해결 방법

```bash
# @types/node 설치
npm install --save-dev @types/node
```

```typescript
// DebugTest.tsx, ErrorBoundary.tsx - Vite 호환성 수정
// 기존
if (process.env.NODE_ENV === 'development') { ... }

// 수정
if (import.meta.env.MODE === 'development') { ... }
```

#### 결과

- Vercel 빌드 성공
- TypeScript 컴파일 오류 해결
- Vite 환경과의 완벽한 호환성

### 11. 감정 캘린더 시간대 문제

#### 문제 상황

- 감정 이모티콘이 저장된 날짜가 아닌 다음 날짜에 표시됨
- `toISOString()` 사용으로 인한 UTC 변환 문제
- 로컬 시간대와 UTC 시간대 불일치

#### 해결 방법

```typescript
// EmotionCalendar.tsx - 시간대 문제 해결
const getTileContent = (date: Date) => {
  // 기존 (문제)
  const dateString = date.toISOString().split("T")[0]; // UTC 기반
  
  // 수정 (해결)
  const dateString = date.toLocaleDateString('en-CA'); // 로컬 시간 기반 (YYYY-MM-DD)
  
  // 감정 이모티콘 표시 로직
  const emotionData = emotionHistory.find(
    (item) => item.date === dateString
  );
  
  return emotionData ? (
    <div className="emotion-indicator">
      {getEmotionEmoji(emotionData.emotion)}
    </div>
  ) : null;
};
```

#### 결과

- 감정 이모티콘이 정확한 저장 날짜에 표시
- 시간대 문제 완전 해결
- 사용자 경험 개선

---

## 🧪 개발 가이드

### 1. 코드 스타일

- **TypeScript**: 엄격한 타입 체크 사용
- **ESLint**: 코드 품질 및 일관성 유지
- **Prettier**: 코드 포맷팅 자동화

### 2. 컴포넌트 구조

```typescript
/**
 * 컴포넌트 설명
 *
 * @param props - 컴포넌트 속성 설명
 * @returns 컴포넌트 JSX
 */
const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 상태 및 로직

  return <div>{/* JSX 구조 */}</div>;
};
```

### 3. 상태 관리 패턴

```typescript
// 전역 상태는 AppContext 사용
const { theme, language, isDark } = useApp();

// 로컬 상태는 useState 사용
const [localState, setLocalState] = useState(initialValue);

// 복잡한 상태는 useReducer 고려
const [state, dispatch] = useReducer(reducer, initialState);
```

### 4. 에러 처리

```typescript
try {
  const result = await apiCall();
  // 성공 처리
} catch (error) {
  console.error("에러 발생:", error);
  toast.error("사용자 친화적 에러 메시지");
}
```

### 5. 성능 최적화

- **React.memo**: 불필요한 리렌더링 방지
- **useCallback/useMemo**: 함수 및 값 메모이제이션
- **Code Splitting**: 라우트 기반 코드 분할

---

## 📱 PWA 기능

### 1. 서비스 워커

- 오프라인 지원
- 백그라운드 동기화
- 푸시 알림

### 2. 웹 앱 매니페스트

- 앱 아이콘 및 이름
- 테마 색상 설정
- 디스플레이 모드

### 3. 설치 프롬프트

- 홈 화면 추가
- 앱 스토어 스타일 인터페이스

---

## 🔮 향후 개발 계획

### 1. 단기 목표 (1-2개월)

- [ ] 사용자 인증 시스템
- [ ] 데이터 백업/복원 기능
- [ ] 감정 분석 정확도 향상

### 2. 중기 목표 (3-6개월)

- [ ] 모바일 앱 개발
- [ ] 팀 공유 기능
- [ ] 고급 분석 도구

### 3. 장기 목표 (6개월 이상)

- [ ] AI 기반 감정 상담 기능
- [ ] 의료진 연동 시스템
- [ ] 글로벌 서비스 확장

---

## 🤝 기여 방법

1. **Fork** 프로젝트
2. **Feature branch** 생성 (`git checkout -b feature/AmazingFeature`)
3. **Commit** 변경사항 (`git commit -m 'Add some AmazingFeature'`)
4. **Push** 브랜치 (`git push origin feature/AmazingFeature`)
5. **Pull Request** 생성

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 📞 문의

프로젝트에 대한 문의사항이나 제안사항이 있으시면 [Issues](../../issues)를 통해 연락해 주세요.

---

<div align="center">
  <p>Made with ❤️ by AI Diary Team</p>
  <p>감정 분석으로 더 나은 내일을 만들어가세요</p>
</div>
