# AI 학습 도우미 웹사이트 개발 워크플로우 (Frontend Agent + MCP 최적화)

## 프로젝트 개요

React + TypeScript + Tailwind CSS + Vite + shadcn/ui로 구현하는 AI 학습 도우미 웹사이트
**사용 가능한 MCP**: Sequential-Thinking, TaskMaster, Context7, Filesystem, GitHub, shadcn-ui, Playwright, Magic UI

---

## 에이전트 & MCP 역할 분담

### **@frontend-developer 에이전트**

- UI 컴포넌트 개발 (shadcn/ui + Magic UI)
- React 아키텍처 및 상태 관리
- 파일 업로드 및 학습 자료 관리 UI
- 플래시카드 학습 인터페이스
- 퀴즈 시스템 UI 개발
- spaced-repetition 시각화 컴포넌트
- 반응형 디자인 및 접근성 (WCAG)

### **MCP 도구들**

- **Sequential-Thinking**: 텍스트 처리 알고리즘 및 spaced-repetition 설계
- **TaskMaster**: 프로젝트 관리 및 작업 분해
- **Context7**: 검증된 호환 라이브러리 정보 (node-summarizer, keyword-extractor)
- **Filesystem**: 파일 구조 및 텍스트 처리 엔진
- **shadcn-ui**: UI 컴포넌트 라이브러리 설치
- **Magic UI**: 학습 진도 애니메이션 및 시각화
- **Playwright**: 테스트 자동화 (파일 업로드, 학습 플로우)
- **GitHub**: 버전 관리 및 Vercel 배포

---

## Phase 1: 프로젝트 기반 설정 (MCP 중심)

### **1단계: 아키텍처 설계 (Sequential-Thinking)**

````
Using Sequential-Thinking, design a comprehensive architecture for an AI Study Helper web application.

Requirements:
- React + TypeScript + Tailwind CSS + Vite
- shadcn/ui for UI components + Magic UI for learning animations
- Text/PDF file upload and processing
- Text summarization with node-summarizer (offline)
- Keyword extraction with keyword-extractor library
- Automatic flashcard generation (rule-based)
- Google Gemini API integration (60 daily requests)
- Quiz generation with template-based system
- spaced-repetition algorithm implementation
- API modes: mock, free, offline, custom
- PWA support with offline learning
- Korean language support
- Vercel deployment

Please think through:
1. Text processing pipeline (Upload → Parse → Summarize → Extract → Generate)
2. Learning content management architecture
3. spaced-repetition algorithm design and scheduling
4. Flashcard generation rules and Q&A pattern matching
5. Quiz template system and question generation logic
6. API service layer with Gemini integration and offline fallbacks
7. Learning progress tracking and analytics
8. State management for complex learning workflows
9. Caching strategy for processed content and user progress
10. Performance optimization for large document processing

Key Algorithm Requirements:
```javascript
const generateFlashcards = (text) => {
  // 문장 분리 및 전처리
  // 핵심 개념 추출 (키워드 기반)
  // 문장 중요도 계산
  // Q&A 패턴 매칭
  // 질문-답변 쌍 생성
  return flashcards;
};

const spacedRepetitionScheduler = (card, performance) => {
  // SM-2 알고리즘 기반 스케줄링
  // 성능에 따른 간격 조정
  // 다음 복습 날짜 계산
  return nextReviewDate;
};
````

Design with focus on educational effectiveness and user engagement.

```

### **2단계: 프로젝트 관리 설정 (TaskMaster)**
```

Using TaskMaster, create a comprehensive PRD and break it into manageable tasks for AI study helper.

Core Features:

- 텍스트/PDF 학습 자료 업로드 (drag-and-drop with shadcn/ui)
- 텍스트 요약 (node-summarizer 오프라인 처리)
- 키워드 추출 (keyword-extractor 라이브러리)
- 플래시카드 자동 생성 (규칙 기반 알고리즘)
- Google Gemini API 통합 (일 60 요청 무료)
- 퀴즈 생성 (템플릿 기반 시스템)
- spaced-repetition 학습 시스템
- 학습 진도 추적 및 분석
- 오프라인 모드 지원

Technical Setup:

- Vite 프로젝트 with React + TypeScript + Tailwind CSS
- shadcn/ui 컴포넌트 라이브러리 통합
- Magic UI 학습 진도 애니메이션
- node-summarizer, keyword-extractor 라이브러리
- PDF.js for PDF 파일 처리
- 환경변수 관리 (.env.example 포함)
- Service worker PWA 기능
- 로컬 스토리지 학습 데이터 관리
- 반응형 디자인 (모바일 학습 지원)

AI Service Integration:

- Primary: Google Gemini API (60 daily requests)
- Secondary: 완전 오프라인 텍스트 처리
- Fallback: 규칙 기반 컨텐츠 생성
- Mock mode: 개발용 샘플 데이터

환경변수 요구사항:

```bash
VITE_USE_MOCK_DATA=true
VITE_GEMINI_API_KEY=optional
VITE_HUGGINGFACE_TOKEN=optional
VITE_API_MODE=offline|free|premium
```

AIServiceConfig 인터페이스:

```typescript
interface AIServiceConfig {
  mode: "mock" | "free" | "offline" | "custom";
  apiKey?: string;
  fallbackToOffline: boolean;
}
```

페이지 구성:

- 대시보드 (학습 현황 및 통계)
- 자료 업로드 (파일 업로드 및 처리)
- 플래시카드 학습 (spaced-repetition 시스템)
- 퀴즈 페이지 (다양한 문제 유형)

Please create PRD with Korean comments and specify:

- @frontend-developer agent tasks (UI 컴포넌트)
- shadcn-ui component requirements
- Magic UI animation needs
- 무료 API 제한사항 명시
- 오프라인 모드 폴백 전략

```

### **3단계: 검증된 기술 정보 수집 (Context7)**
```

Using Context7, research and compile ONLY verified compatible documentation:

Priority: 검증된 호환성 문서만 사용

1. node-summarizer 라이브러리 - 안정 버전 및 TypeScript 호환성
2. keyword-extractor 라이브러리 - React 통합 방법
3. Google Gemini API - 무료 티어 제한사항 및 요금 정책
4. PDF.js - React + TypeScript 통합 방법
5. spaced-repetition 알고리즘 - SM-2, SM-17 구현 사례
6. shadcn/ui - 교육용 컴포넌트 패턴
7. Magic UI - 학습 진도 시각화 컴포넌트
8. PWA - 오프라인 학습 앱 구현
9. Vite - 대용량 텍스트 처리 최적화
10. Vercel - Node.js 라이브러리 배포 설정

중요사항:

- 각 라이브러리의 최신 안정 버전 확인
- React 18+ 호환성 검증된 문서만 선별
- TypeScript 지원 여부 확인
- 브라우저 호환성 이슈 사전 파악
- 무료 API 제한사항 상세 정보

검증 기준:

- 공식 문서 우선
- 최근 6개월 내 업데이트된 문서
- TypeScript 예제 코드 포함
- React 통합 가이드 존재

```

### **4단계: 프로젝트 구조 생성 (Filesystem)**
```

Using Filesystem, create optimized project structure for AI study helper:

ai-study-helper/
├── public/
│ ├── manifest.json
│ ├── sw.js
│ ├── sample-content/
│ │ ├── sample.pdf
│ │ └── sample.txt
│ └── icons/
├── src/
│ ├── components/
│ │ ├── ui/ # shadcn/ui components
│ │ │ ├── button.tsx
│ │ │ ├── input.tsx
│ │ │ ├── card.tsx
│ │ │ ├── progress.tsx
│ │ │ ├── tabs.tsx
│ │ │ └── upload-zone.tsx
│ │ ├── magicui/ # Magic UI components
│ │ │ ├── study-progress.tsx
│ │ │ ├── flashcard-flip.tsx
│ │ │ ├── quiz-timer.tsx
│ │ │ └── learning-chart.tsx
│ │ ├── layout/ # Layout components
│ │ │ ├── header.tsx
│ │ │ ├── sidebar.tsx
│ │ │ └── navigation.tsx
│ │ ├── study/ # Study components (agent managed)
│ │ │ ├── material-upload.tsx
│ │ │ ├── flashcard-viewer.tsx
│ │ │ ├── quiz-interface.tsx
│ │ │ ├── progress-dashboard.tsx
│ │ │ └── study-session.tsx
│ │ └── common/ # Common components
│ │ ├── loading-spinner.tsx
│ │ ├── error-boundary.tsx
│ │ └── api-status.tsx
│ ├── pages/ # Pages (agent managed)
│ │ ├── dashboard.tsx
│ │ ├── upload.tsx
│ │ ├── flashcards.tsx
│ │ └── quiz.tsx
│ ├── lib/
│ │ ├── utils.ts
│ │ └── cn.ts
│ ├── services/ # API and processing services
│ │ ├── freeAIService.ts # 필수 구조 구현
│ │ ├── geminiService.ts
│ │ ├── textProcessor.ts
│ │ ├── pdfParser.ts
│ │ └── offlineProcessor.ts
│ ├── algorithms/ # Core algorithms
│ │ ├── textSummarizer.ts # node-summarizer 래핑
│ │ ├── keywordExtractor.ts # keyword-extractor 래핑
│ │ ├── flashcardGenerator.ts
│ │ ├── quizGenerator.ts
│ │ └── spacedRepetition.ts
│ ├── utils/
│ │ ├── storage.ts
│ │ ├── quotaManager.ts # API 사용량 추적
│ │ ├── errorHandler.ts
│ │ └── dateCalculator.ts
│ ├── hooks/ # Custom hooks
│ │ ├── useFileUpload.ts
│ │ ├── useStudySession.ts
│ │ ├── useSpacedRepetition.ts
│ │ └── useProgress.ts
│ ├── types/
│ │ ├── study.ts
│ │ ├── api.ts
│ │ └── common.ts
│ └── data/
│ ├── quiz-templates.json
│ ├── flashcard-rules.json
│ └── sample-data.ts
├── tests/ # Playwright tests
├── components.json # shadcn/ui config
├── .env.example # 모든 환경변수 포함
├── vite.config.ts # Node.js 라이브러리 최적화
├── tailwind.config.js
└── package.json # 모든 필수 의존성

Environment Variables (.env.example):

```bash
# API Mode Configuration (필수)
VITE_API_MODE=offline
VITE_USE_MOCK_DATA=true

# Google Gemini API (선택사항, 일 60 요청 무료)
VITE_GEMINI_API_KEY=your_gemini_key_here

# 기타 API (선택사항)
VITE_HUGGINGFACE_TOKEN=optional

# PWA Configuration
VITE_ENABLE_PWA=true
VITE_APP_NAME=AI Study Helper

# 무료 할당량 관리
VITE_GEMINI_DAILY_LIMIT=60
VITE_OFFLINE_MODE_ENABLED=true
```

Dependencies to include:

- node-summarizer, keyword-extractor (핵심 라이브러리)
- pdfjs-dist (PDF 처리)
- @google/generative-ai (Gemini API)
- All shadcn/ui and Magic UI requirements

Korean comments throughout codebase.

```

---

## Phase 2: 텍스트 처리 엔진 구축 (MCP + Agent 협업)

### **5단계: 텍스트 처리 알고리즘 설계 (Sequential-Thinking)**
```

Using Sequential-Thinking, design comprehensive text processing and learning algorithms:

Core Processing Pipeline:

1. 파일 업로드 및 텍스트 추출
2. 텍스트 전처리 (정제, 문장 분리)
3. 핵심 내용 요약 (node-summarizer)
4. 키워드 추출 (keyword-extractor)
5. 플래시카드 생성 (규칙 기반)
6. 퀴즈 문제 생성 (템플릿 기반)

Flashcard Generation Algorithm:

```javascript
const generateFlashcards = (text) => {
  // 1. 문장 분리 및 전처리
  const sentences = preprocessText(text);

  // 2. 핵심 개념 추출 (키워드 기반)
  const keywords = extractKeywords(sentences);

  // 3. 문장 중요도 계산
  const importantSentences = calculateImportance(sentences, keywords);

  // 4. Q&A 패턴 매칭
  const qaPatterns = matchQAPatterns(importantSentences);

  // 5. 질문-답변 쌍 생성
  return generateQAPairs(qaPatterns, keywords);
};
```

spaced-repetition Algorithm (SM-2 기반):

```javascript
const spacedRepetitionScheduler = (card, performance) => {
  // SM-2 알고리즘 구현
  // - easiness factor 계산
  // - 반복 간격 조정
  // - 성능 기반 스케줄링
  return {
    nextReviewDate,
    interval,
    easinessFactor,
    repetitions,
  };
};
```

Quiz Generation Rules:

1. 객관식: 키워드 기반 선택지 생성
2. 주관식: 핵심 문장에서 빈칸 생성
3. 참/거짓: 사실 관계 문장 변형
4. 단답형: 정의 및 개념 추출

Local Processing Features:

- 완전 오프라인 텍스트 분석
- 브라우저 기반 자연어 처리
- 학습 데이터 로컬 저장
- 진도 추적 알고리즘

Design considerations:

- 한국어 텍스트 처리 최적화
- 대용량 문서 처리 성능
- 메모리 효율적인 알고리즘
- 사용자 학습 패턴 분석

```

### **6단계: 텍스트 처리 서비스 구현 (Filesystem)**
```

Using Filesystem, implement text processing engine with Korean comments:

1. algorithms/textSummarizer.ts - node-summarizer 통합

```typescript
// 텍스트 요약 서비스 (node-summarizer 기반)
import { SummaryTool } from "node-summarizer";

export interface SummaryOptions {
  sentences: number; // 요약할 문장 수
  language: "ko" | "en"; // 언어 설정
}

export class TextSummarizer {
  async summarizeText(text: string, options: SummaryOptions) {
    // node-summarizer 사용하여 오프라인 요약
  }
}
```

2. algorithms/keywordExtractor.ts - keyword-extractor 통합
3. algorithms/flashcardGenerator.ts - 규칙 기반 플래시카드 생성
4. algorithms/quizGenerator.ts - 템플릿 기반 퀴즈 생성
5. algorithms/spacedRepetition.ts - SM-2 알고리즘 구현
6. services/geminiService.ts - Google Gemini API 통합
7. services/freeAIService.ts - AIServiceConfig 인터페이스 구현

AIServiceConfig Implementation:

```typescript
interface AIServiceConfig {
  mode: "mock" | "free" | "offline" | "custom";
  apiKey?: string;
  fallbackToOffline: boolean;
}

export class FreeAIService {
  constructor(private config: AIServiceConfig) {}

  // Gemini API 호출 (일 60 요청 제한)
  // 할당량 초과시 오프라인 모드 자동 전환
  // 에러 발생시 로컬 처리로 폴백
}
```

Key Features:

- 모든 주석 한글로 작성
- 무료 API 제한사항 명시
- 오프라인 폴백 로직 포함
- 에러 처리 및 재시도 메커니즘
- 할당량 추적 (localStorage 기반)

```

### **7단계: API 서비스 레이어 구현 (Filesystem)**
```

Using Filesystem, implement comprehensive API service layer:

1. services/quotaManager.ts - API 사용량 추적

```typescript
// Google Gemini API 무료 티어: 일 60 요청
// localStorage에 사용량 저장
export class QuotaManager {
  private readonly GEMINI_DAILY_LIMIT = 60;

  checkQuotaAvailable(apiType: "gemini"): boolean {
    // 일일 사용량 체크
    // 한도 초과시 오프라인 모드 권장
  }

  recordAPIUsage(apiType: "gemini"): void {
    // 사용량 기록 및 업데이트
  }
}
```

2. services/errorHandler.ts - 포괄적 에러 처리
3. utils/storage.ts - 학습 데이터 로컬 저장
4. utils/dateCalculator.ts - spaced-repetition 날짜 계산

Service Features:

- 무료 할당량 실시간 추적
- API 실패시 오프라인 폴백
- 사용자에게 현재 모드 표시
- 재시도 로직 구현
- 한국어 에러 메시지

```

---

## Phase 3: shadcn/ui 기반 UI 구축

### **8단계: shadcn/ui 컴포넌트 설정 (shadcn-ui)**
```

Using shadcn-ui, set up component library for educational interface:

1. Initialize shadcn/ui for study helper app
2. Install essential educational components:

   - Button, Input, Label (forms and interactions)
   - Card, Badge (content organization)
   - Progress, Tabs (learning progress)
   - Dialog, Alert (notifications)
   - Upload area (file upload)
   - Timer component (quiz timing)

3. Educational theme configuration:

   - Primary: Learning blues (#2563eb)
   - Success: Achievement green (#16a34a)
   - Warning: Review needed (#d97706)
   - Info: Study tips (#0ea5e9)

4. Study-specific component variants:
   - Flashcard layout cards
   - Progress indicators
   - Quiz answer buttons
   - Study session timers

Ensure all components are optimized for learning workflows.

```

### **9단계: Magic UI 학습 애니메이션 (Magic UI)**
```

Using Magic UI, create engaging learning animations:

1. Study progress visualizations:

   - Animated progress rings for completion rates
   - Study streak counters with celebration effects
   - Knowledge mastery charts
   - Daily study goal indicators

2. Learning interaction animations:

   - Flashcard flip animations
   - Quiz answer reveal effects
   - Correct/incorrect feedback animations
   - Achievement unlock celebrations

3. Components to implement:

   - StudyProgressRing: Circular progress with percentage
   - FlashcardFlip: Smooth card flip animation
   - QuizFeedback: Success/failure visual feedback
   - StreakCounter: Daily study streak display
   - MasteryChart: Knowledge progress visualization

4. Performance requirements:
   - 60fps animations
   - Reduced motion support
   - Mobile-optimized interactions
   - Battery-efficient animations

Configure Magic UI to enhance learning engagement without distraction.

```

---

## Phase 4: 학습 인터페이스 개발 (Frontend Agent 주도)

### **10단계: 파일 업로드 및 처리 컴포넌트**
```

@frontend-developer Create comprehensive file upload and content processing components:

**파일 업로드 시스템:**

1. components/study/material-upload.tsx - 텍스트/PDF 업로드

   - shadcn/ui 기반 드래그앤드롭 인터페이스
   - PDF.js 통합으로 PDF 파일 파싱
   - 파일 유효성 검사 및 크기 제한
   - Magic UI 업로드 진행 애니메이션
   - 실시간 파일 처리 상태 표시

2. components/study/content-processor.tsx - 텍스트 처리 인터페이스
   - 업로드된 내용 미리보기
   - 요약/키워드 추출 진행 상황
   - 처리 옵션 설정 (요약 길이, 키워드 수)
   - 에러 처리 및 재시도 기능

**기술 요구사항:**

- TypeScript 완전 지원
- 모바일 친화적 업로드 경험
- 접근성 준수 (WCAG)
- 대용량 파일 처리 최적화
- node-summarizer, keyword-extractor 통합

**상태 관리:**

- 파일 업로드 상태 추적
- 텍스트 처리 진행률
- 에러 및 재시도 로직
- 처리 결과 캐싱

한국어 주석과 사용자 친화적 메시지로 구현.

```

### **11단계: 플래시카드 학습 시스템**
```

@frontend-developer Create comprehensive flashcard learning system with spaced-repetition:

**플래시카드 뷰어:**

1. components/study/flashcard-viewer.tsx - 메인 학습 인터페이스

   - shadcn/ui Card로 플래시카드 레이아웃
   - Magic UI 카드 뒤집기 애니메이션
   - 답변 표시/숨김 토글
   - 난이도 평가 버튼 (쉬움/보통/어려움)
   - 키보드 단축키 지원

2. components/study/spaced-repetition-scheduler.tsx - 복습 스케줄링
   - SM-2 알고리즘 기반 다음 복습일 계산
   - 학습 진도 시각화 (Magic UI 차트)
   - 일일 학습 목표 및 달성률
   - 복습 알림 시스템

**학습 진도 추적:** 3. components/study/progress-dashboard.tsx - 학습 현황 대시보드

- shadcn/ui Progress 컴포넌트로 진도 표시
- Magic UI 애니메이션으로 성취감 연출
- 학습 통계 (총 카드 수, 마스터된 카드 등)
- 주간/월간 학습 패턴 차트

**학습 세션 관리:** 4. hooks/useSpacedRepetition.ts - spaced-repetition 로직

- 다음 복습 카드 선정
- 학습 성과 기록
- 복습 간격 조정
- 로컬 스토리지 동기화

**특징:**

- 한국어 학습 최적화
- 오프라인 완전 지원
- 진도 백업 및 복원
- 성취 시스템 (뱃지, 연속 학습 등)

모든 인터랙션에 적절한 애니메이션과 피드백 포함.

```

### **12단계: 퀴즈 시스템 구현**
```

@frontend-developer Create interactive quiz system with multiple question types:

**퀴즈 인터페이스:**

1. components/study/quiz-interface.tsx - 메인 퀴즈 화면

   - 다양한 문제 유형 지원 (객관식, 주관식, 참/거짓)
   - shadcn/ui 기반 답변 선택 인터페이스
   - Magic UI 타이머 애니메이션
   - 실시간 점수 및 진행률 표시
   - 정답/오답 즉시 피드백

2. components/study/quiz-generator.tsx - 퀴즈 생성 설정
   - 문제 유형 선택 (객관식/주관식/혼합)
   - 난이도 설정
   - 문제 개수 조정
   - 시간 제한 옵션

**문제 유형별 컴포넌트:** 3. components/study/question-types/

- MultipleChoice.tsx - 객관식 문제
- FillInBlank.tsx - 빈칸 채우기
- TrueFalse.tsx - 참/거짓 문제
- ShortAnswer.tsx - 단답형 문제

**퀴즈 결과 및 분석:** 4. components/study/quiz-results.tsx - 퀴즈 결과 화면

- 점수 및 정답률 표시
- 틀린 문제 복습 기능
- 약점 분야 분석
- 개선점 제안

**기능:**

- 템플릿 기반 문제 자동 생성
- 오프라인 퀴즈 지원
- 퀴즈 히스토리 저장
- 성과 분석 및 추천

한국어 질문 생성 및 자연스러운 사용자 경험 구현.

```

### **13단계: 대시보드 및 학습 분석**
```

@frontend-developer Create comprehensive dashboard and learning analytics:

**메인 대시보드:**

1. pages/dashboard.tsx - 학습 현황 종합 화면

   - 오늘의 학습 목표 및 달성률
   - 복습 예정 플래시카드 수
   - 최근 퀴즈 성과
   - 학습 연속일 (스트릭) 표시
   - Magic UI로 성취 애니메이션

2. components/study/learning-analytics.tsx - 학습 분석
   - 주간/월간 학습 패턴 차트
   - 분야별 숙련도 레이더 차트
   - 기억률 변화 그래프
   - 개인 학습 통계

**설정 및 관리:** 3. components/study/study-settings.tsx - 학습 설정

- API 모드 선택 (오프라인/Gemini)
- 일일 학습 목표 설정
- spaced-repetition 알고리즘 조정
- 알림 설정

**콘텐츠 관리:** 4. components/study/content-library.tsx - 학습 자료 관리

- 업로드한 자료 목록
- 생성된 플래시카드 관리
- 퀴즈 템플릿 편집
- 학습 데이터 백업/복원

**API 상태 표시:** 5. components/common/api-status.tsx - API 사용량 모니터링

- Gemini API 일일 사용량 표시 (60/60)
- 현재 API 모드 상태 (오프라인/온라인)
- 할당량 초과시 경고 메시지
- 다음 리셋 시간 표시
- 사용 가능한 대체 모드 안내

**반응형 네비게이션:** 6. components/layout/responsive-navigation.tsx - 모바일 친화적 네비게이션

- shadcn/ui 기반 사이드바/하단 탭
- 학습 진행 상황 미니 위젯
- 빠른 액션 버튼 (복습, 퀴즈)
- 접근성 준수 네비게이션

한국어 UI/UX 최적화 및 학습 집중력 향상을 위한 직관적 디자인 구현.

```

---

## Phase 5: 테스트 및 성능 최적화

### **14단계: Playwright 자동화 테스트**
```

Using Playwright, create comprehensive E2E test suite:

**핵심 학습 플로우 테스트:**

1. tests/e2e/file-upload-flow.spec.ts

   - 텍스트/PDF 파일 업로드 테스트
   - 파일 파싱 및 처리 검증
   - 에러 케이스 처리 확인
   - 진행 상태 표시 검증

2. tests/e2e/flashcard-learning.spec.ts

   - 플래시카드 생성 및 표시 테스트
   - spaced-repetition 스케줄링 검증
   - 학습 진도 추적 확인
   - 난이도 평가 기능 테스트

3. tests/e2e/quiz-system.spec.ts
   - 퀴즈 생성 및 실행 테스트
   - 다양한 문제 유형 검증
   - 점수 계산 및 결과 표시
   - 퀴즈 히스토리 저장 확인

**API 모드별 테스트:** 4. tests/e2e/api-modes.spec.ts

- Mock 모드 동작 확인
- 오프라인 모드 완전성 검증
- Gemini API 연동 테스트 (실제 API 키 필요시)
- 폴백 로직 동작 확인

**PWA 기능 테스트:** 5. tests/e2e/pwa-features.spec.ts

- Service Worker 등록 확인
- 오프라인 모드 동작 테스트
- 캐시 전략 검증
- 푸시 알림 기능 (선택사항)

테스트 커버리지 목표: 80% 이상
한국어 테스트 시나리오 포함

```

### **15단계: 성능 최적화 (Sequential-Thinking)**
```

Using Sequential-Thinking, design comprehensive performance optimization strategy:

Performance Optimization Areas:

1. 텍스트 처리 성능 최적화

   - 대용량 텍스트 청크 단위 처리
   - Web Workers 활용한 백그라운드 처리
   - 메모리 효율적인 문장 분석
   - 점진적 플래시카드 생성

2. UI 렌더링 최적화

   - React.memo로 불필요한 리렌더링 방지
   - useMemo/useCallback 최적화
   - 가상화를 통한 대량 데이터 표시
   - 코드 분할 및 지연 로딩

3. 로컬 스토리지 최적화

   - IndexedDB 활용한 대용량 데이터 저장
   - 압축 알고리즘 적용
   - 백그라운드 동기화
   - 캐시 무효화 전략

4. 네트워크 최적화
   - API 요청 배칭 및 디바운싱
   - 요청 우선순위 관리
   - 오프라인 큐잉 시스템
   - 프리페칭 전략

Performance Budget:

- 초기 로딩: < 3초
- 플래시카드 생성: < 5초 (10MB 문서 기준)
- 페이지 전환: < 500ms
- API 응답 처리: < 2초

Monitoring & Analytics:

- Core Web Vitals 추적
- 학습 세션 성능 메트릭
- 에러 로깅 및 알림
- 사용자 행동 분석 (개인정보 준수)

```

---

## Phase 6: PWA 및 배포 설정

### **16단계: PWA 구현 (Filesystem)**
```

Using Filesystem, implement comprehensive PWA features:

1. public/manifest.json - 앱 매니페스트

```json
{
  "name": "AI 학습 도우미",
  "short_name": "AI Study",
  "description": "오프라인 우선 AI 학습 플랫폼",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["education", "productivity"],
  "lang": "ko"
}
```

2. public/sw.js - Service Worker 구현

   - 학습 자료 캐싱 전략
   - API 응답 캐시 관리
   - 오프라인 폴백 페이지
   - 백그라운드 동기화

3. src/utils/pwa-utils.ts - PWA 헬퍼 함수
   - Service Worker 등록
   - 업데이트 확인 및 알림
   - 오프라인 상태 감지
   - 설치 프롬프트 관리

PWA Features:

- 완전 오프라인 학습 지원
- 백그라운드 복습 알림
- 앱 스타일 인터페이스
- 빠른 시작 및 재개

```

### **17단계: GitHub 저장소 설정 (GitHub)**
```

Using GitHub, set up repository with comprehensive CI/CD:

1. Repository Setup:

   - Create new repository: ai-study-helper
   - Initialize with comprehensive README.md
   - Add proper .gitignore for Vite/React
   - License: MIT (교육용 프로젝트)

2. GitHub Actions Workflow (.github/workflows/deploy.yml):

   - Automated testing with Playwright
   - TypeScript 컴파일 검증
   - Build optimization
   - Vercel 자동 배포
   - Performance budget 확인

3. Branch Protection Rules:

   - main 브랜치 보호
   - PR 리뷰 필수
   - CI 통과 필수
   - 머지 전 최신 상태 유지

4. Issue Templates:
   - 버그 리포트 템플릿
   - 기능 요청 템플릿
   - 학습 알고리즘 개선 제안

Repository Structure:

```
ai-study-helper/
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml
│   │   ├── test.yml
│   │   └── performance.yml
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
└── [project files]
```

Korean documentation with deployment instructions.

```

### **18단계: Vercel 배포 최적화**
```

@frontend-developer Configure Vercel deployment with Node.js library optimization:

**Vercel 배포 설정:**

1. vercel.json - 배포 구성

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_API_MODE": "offline",
    "VITE_ENABLE_PWA": "true"
  }
}
```

2. 환경변수 설정:
   - Production: VITE_API_MODE=free
   - Preview: VITE_API_MODE=offline
   - Development: VITE_USE_MOCK_DATA=true

**Node.js 라이브러리 최적화:** 3. vite.config.ts 업데이트

- node-summarizer 번들링 최적화
- keyword-extractor 트리 쉐이킹
- PDF.js Worker 설정
- 청크 분할 전략

4. 성능 최적화:
   - Gzip/Brotli 압축 활성화
   - 정적 에셋 CDN 설정
   - 헤더 캐싱 전략
   - 프리로딩 최적화

**배포 후 검증:**

- Core Web Vitals 측정
- 오프라인 모드 동작 확인
- PWA 설치 가능성 검증
- 다양한 디바이스 테스트

Production URL: https://ai-study-helper.vercel.app

```

---

## Phase 7: 최종 검증 및 문서화

### **19단계: 전체 시스템 통합 테스트**
```

Using Playwright + @frontend-developer, perform comprehensive system integration testing:

**시나리오 기반 E2E 테스트:**

1. 신규 사용자 온보딩 플로우

   - 첫 방문시 가이드 투어
   - API 모드 선택 및 설정
   - 샘플 컨텐츠로 학습 체험
   - PWA 설치 프롬프트

2. 완전 오프라인 학습 시나리오

   - 네트워크 연결 차단
   - 파일 업로드 및 처리
   - 플래시카드 생성 및 학습
   - 퀴즈 실행 및 결과 저장

3. API 통합 테스트 (Gemini 연동)
   - API 키 설정 및 검증
   - 할당량 추적 및 제한
   - 오프라인 폴백 동작
   - 에러 처리 및 사용자 피드백

**성능 및 접근성 검증:** 4. Lighthouse 점수 목표

- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 85+

5. 크로스 브라우저 테스트
   - Chrome, Firefox, Safari, Edge
   - 모바일 브라우저 (iOS Safari, Android Chrome)
   - 다양한 화면 크기 및 해상도
   - 터치 인터페이스 최적화

테스트 결과 문서화 및 이슈 수정 계획 수립.

```

### **20단계: 종합 문서화 및 사용자 가이드**
```

Using Filesystem, create comprehensive documentation:

**사용자 문서:**

1. README.md - 프로젝트 개요 및 시작 가이드

   - 기능 소개 및 스크린샷
   - 설치 및 실행 방법
   - API 설정 가이드
   - 문제 해결 FAQ

2. docs/USER_GUIDE.md - 상세 사용자 매뉴얼
   - 학습 자료 업로드 방법
   - 플래시카드 학습 전략
   - spaced-repetition 최적 활용법
   - 퀴즈 시스템 활용 가이드

**개발자 문서:**  
3. docs/DEVELOPMENT.md - 개발 환경 설정

- 로컬 개발 환경 구축
- 환경변수 설정 방법
- API 키 발급 및 설정
- 디버깅 및 테스트 실행

4. docs/ARCHITECTURE.md - 시스템 아키텍처

   - 컴포넌트 구조 설명
   - 텍스트 처리 파이프라인
   - API 서비스 레이어 구조
   - 상태 관리 전략

5. docs/API.md - API 설정 가이드
   - Google Gemini API 설정
   - 무료 티어 제한사항 상세
   - 오프라인 모드 구현 원리
   - 커스텀 API 추가 방법

**배포 및 운영:** 6. docs/DEPLOYMENT.md - 배포 가이드

- Vercel 배포 설정
- 환경변수 관리
- PWA 설정 및 검증
- 성능 모니터링

모든 문서는 한국어로 작성, 스크린샷 및 예제 코드 포함.

```

---

## 최종 체크리스트 및 검증

### **완성도 검증 리스트:**

✅ **핵심 기능 구현**
- [ ] 텍스트/PDF 파일 업로드 및 파싱
- [ ] node-summarizer 기반 오프라인 요약
- [ ] keyword-extractor로 키워드 추출
- [ ] 규칙 기반 플래시카드 자동 생성
- [ ] spaced-repetition 알고리즘 (SM-2)
- [ ] 템플릿 기반 퀴즈 생성
- [ ] Google Gemini API 선택적 연동

✅ **API 서비스 레이어**
- [ ] AIServiceConfig 인터페이스 구현
- [ ] Mock/Free/Offline/Custom 모드 지원
- [ ] 일일 할당량 추적 (60 요청/일)
- [ ] 오프라인 폴백 로직
- [ ] 에러 처리 및 재시도

✅ **UI/UX 구현**
- [ ] shadcn/ui 기반 반응형 디자인
- [ ] Magic UI 학습 애니메이션
- [ ] 접근성 준수 (WCAG)
- [ ] 모바일 친화적 인터페이스
- [ ] 한국어 UI 최적화

✅ **PWA 및 오프라인 지원**
- [ ] Service Worker 구현
- [ ] 오프라인 완전 학습 지원
- [ ] 로컬 데이터 저장 및 동기화
- [ ] PWA 매니페스트 및 아이콘

✅ **테스트 및 품질 보증**
- [ ] Playwright E2E 테스트 스위트
- [ ] TypeScript 컴파일 에러 제로
- [ ] Lighthouse 점수 목표 달성
- [ ] 크로스 브라우저 호환성

✅ **배포 및 문서화**
- [ ] Vercel 자동 배포 설정
- [ ] GitHub 저장소 및 CI/CD
- [ ] 종합 사용자/개발자 문서
- [ ] 한국어 지원 및 현지화

---

**예상 개발 일정:** 2-3주 (1명 개발자 기준)
**기술 난이도:** 중급-고급 (React + 자연어 처리)
**확장 가능성:** 높음 (모듈화된 아키텍처)

이 워크플로우를 단계별로 실행하여 완성도 높은 AI 학습 도우미 웹사이트를 구축할 수 있습니다.
```
