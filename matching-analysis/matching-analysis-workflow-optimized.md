# 이력서-채용공고 매칭 분석 웹사이트 개발 워크플로우 (Frontend Agent + MCP 최적화)

## 🎯 프로젝트 개요

React + TypeScript + Tailwind CSS + shadcn/ui로 구현하는 이력서-채용공고 매칭 분석 웹사이트
**사용 가능한 MCP**: Sequential-Thinking, TaskMaster, Context7, Filesystem, GitHub, shadcn-ui, Playwright, Magic UI

---

## 🤖 **에이전트 & MCP 역할 분담**

### **@frontend-developer 에이전트**

- UI 컴포넌트 개발 (shadcn/ui + Magic UI)
- React 아키텍처 및 상태 관리
- PDF 업로드 및 파일 처리 UI
- 분석 결과 시각화 컴포넌트
- 반응형 디자인 및 접근성 (WCAG)
- 성능 최적화 (lazy loading, memoization)

### **MCP 도구들**

- **Sequential-Thinking**: 복잡한 텍스트 분석 알고리즘 설계
- **TaskMaster**: 프로젝트 관리 및 작업 분해
- **Context7**: 최신 기술 정보 (PDF.js, Natural.js, Cohere API)
- **Filesystem**: 기본 파일 구조 및 텍스트 분석 엔진
- **shadcn/ui**: UI 컴포넌트 라이브러리 설치 및 커스터마이징
- **Magic UI**: 애니메이션 및 분석 시각화 효과
- **Playwright**: 테스트 자동화 (파일 업로드, 텍스트 분석)
- **GitHub**: 버전 관리 및 배포

---

## 📋 **Phase 1: 프로젝트 기반 설정 (MCP 중심)**

### **1단계: 아키텍처 설계 (Sequential-Thinking)**

```
Using Sequential-Thinking, design a comprehensive architecture for a Resume-Job Matching Analysis web application.

Requirements:
- React + TypeScript + Tailwind CSS + Vite
- shadcn/ui for UI components + Magic UI for animations
- PDF parsing with pdf.js for resume upload
- Text analysis with natural.js (TF-IDF, cosine similarity)
- Cohere Classify API integration (1000 monthly requests)
- Local text similarity as fallback
- ATS keyword checking with regex patterns
- API modes: mock, free, offline, custom
- PWA support with offline analysis
- Korean language support
- Vercel deployment

Please think through:
1. Text processing pipeline architecture (PDF → Text → Analysis → Scoring)
2. API service layer with Cohere integration and local fallbacks
3. Component architecture using shadcn/ui as foundation
4. State management for analysis workflow and results
5. Caching strategy for processed resumes and job descriptions
6. Error handling for file processing and API failures
7. Testing strategy with Playwright for accuracy
8. Performance optimization for large PDF processing
9. Magic UI integration for smooth user interactions

Design with focus on text analysis accuracy and exceptional user experience.
```

### **2단계: 프로젝트 관리 설정 (TaskMaster)**

```
Using TaskMaster, create a comprehensive PRD and break it into manageable tasks optimized for frontend-developer agent workflow.

Core Features:
- Resume upload with PDF parsing (pdf.js integration)
- Job description text input with shadcn/ui components
- Keyword matching algorithm using TF-IDF
- Cohere API integration for advanced matching
- ATS keyword checking with regex patterns
- Match score visualization with Magic UI animations
- Keyword suggestions and optimization tips
- Analysis history and comparison

Technical Setup:
- Vite project with React + TypeScript + Tailwind CSS
- shadcn/ui component library integration
- Magic UI for interactive animations and visualizations
- pdf.js for PDF parsing and text extraction
- natural.js for text processing and analysis
- Environment variables for API keys and modes
- Service worker for offline analysis capabilities
- Local storage for analysis history and API quotas
- Responsive design for mobile resume review

Text Analysis Strategy:
- Primary: Cohere Classify API (1000 monthly requests)
- Secondary: Local TF-IDF and cosine similarity
- Fallback: Basic keyword matching with regex
- Mock mode with sample analysis data

AI Service Integration:
- Cohere API for semantic similarity analysis
- Local natural.js for TF-IDF calculations
- Regex patterns for ATS compliance checking
- Custom scoring algorithm combining all methods

Please create the PRD at .taskmaster/docs/prd.txt and generate structured development tasks that specify:
- Which tasks should use @frontend-developer agent
- Which tasks require shadcn/ui components
- Which tasks need Magic UI animations
- Integration points between MCP tools
- Testing requirements for Playwright automation
```

### **3단계: 최신 기술 정보 수집 (Context7)**

```
Using Context7, research and compile the latest documentation for our tech stack:

1. shadcn/ui component library installation and customization
2. Magic UI components for data visualization and animations
3. PDF.js integration with React and TypeScript
4. Natural.js library for text processing and TF-IDF
5. Cohere Classify API documentation and rate limiting
6. React file upload patterns with drag-and-drop
7. Text similarity algorithms and implementation
8. ATS (Applicant Tracking System) keyword patterns
9. Resume parsing best practices and challenges
10. PWA implementation for offline text analysis
11. Playwright testing for file upload and text analysis
12. Vercel deployment for React applications with large dependencies

Compile this information for shadcn/ui setup, Magic UI integration, and algorithm development.
```

### **4단계: 프로젝트 구조 생성 (Filesystem)**

```
Using Filesystem, create the complete Vite project structure optimized for shadcn/ui and text analysis:

resume-job-matcher/
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── sample-resume.pdf
│   └── ats-keywords.json
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── alert.tsx
│   │   │   └── tabs.tsx
│   │   ├── magicui/         # Magic UI components
│   │   │   ├── animated-chart.tsx
│   │   │   ├── progress-ring.tsx
│   │   │   ├── floating-card.tsx
│   │   │   └── particle-background.tsx
│   │   ├── layout/          # Layout components (agent managed)
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── navigation.tsx
│   │   ├── analysis/        # Analysis components (agent managed)
│   │   │   ├── resume-upload.tsx
│   │   │   ├── job-input.tsx
│   │   │   ├── matching-results.tsx
│   │   │   ├── score-visualization.tsx
│   │   │   └── keyword-analysis.tsx
│   │   └── common/          # Common components (agent managed)
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       └── api-status.tsx
│   ├── pages/               # Pages (agent managed)
│   │   ├── landing.tsx
│   │   ├── analysis-tool.tsx
│   │   ├── keyword-dictionary.tsx
│   │   └── how-it-works.tsx
│   ├── lib/                 # shadcn/ui utilities
│   │   ├── utils.ts
│   │   └── cn.ts
│   ├── services/            # API services
│   │   ├── api-service.ts
│   │   ├── free-ai-service.ts
│   │   ├── cohere-service.ts
│   │   ├── pdf-parser.ts
│   │   └── text-analysis.ts
│   ├── algorithms/          # Text analysis algorithms
│   │   ├── tfidf.ts
│   │   ├── similarity.ts
│   │   ├── ats-checker.ts
│   │   └── skill-matcher.ts
│   ├── utils/
│   │   ├── storage.ts
│   │   ├── quota-manager.ts
│   │   ├── error-handler.ts
│   │   └── text-processor.ts
│   ├── hooks/               # Custom hooks (agent will create)
│   │   ├── use-file-upload.ts
│   │   ├── use-text-analysis.ts
│   │   ├── use-quota-tracker.ts
│   │   └── use-local-storage.ts
│   ├── types/
│   │   ├── analysis.ts
│   │   ├── api.ts
│   │   └── common.ts
│   └── data/
│       ├── skills.json
│       ├── ats-patterns.json
│       └── sample-data.ts
├── tests/                   # Playwright tests
├── components.json          # shadcn/ui config
├── .env.example
├── vite.config.ts
├── tailwind.config.js
└── package.json

Create initial configuration files:
- vite.config.ts with PWA plugin and PDF.js optimization
- tailwind.config.js configured for shadcn/ui
- components.json for shadcn/ui setup
- tsconfig.json with proper paths
- package.json with all dependencies
```

---

## 🎨 **Phase 2: UI 기반 구축 (shadcn/ui + Frontend Agent)**

### **5단계: shadcn/ui 컴포넌트 라이브러리 설정 (shadcn-ui)**

```
Using shadcn-ui, set up the component library for our resume matching application:

1. Initialize shadcn/ui in the project
2. Install essential components for resume analysis:
   - Button, Input, Label (for forms)
   - Card, Badge (for results display)
   - Progress, Alert (for status indicators)
   - Tabs, Dialog (for navigation and modals)
   - Textarea (for job description input)
   - Upload area component (custom)

3. Configure theme colors for professional resume analysis:
   - Primary: Professional blues (#3b82f6)
   - Success: Match indicators (#22c55e)
   - Warning: Improvement areas (#f59e0b)
   - Danger: Missing requirements (#ef4444)

4. Set up proper TypeScript integration
5. Configure custom variants for analysis-specific components

Please ensure all components are properly configured and ready for frontend-developer customization.
```

### **6단계: Magic UI 애니메이션 컴포넌트 설정 (Magic UI)**

```
Using Magic UI, create interactive animation components for data visualization:

1. Install and configure Magic UI for data visualization
2. Create analysis-specific animated components:
   - Animated progress rings for match scores
   - Floating cards for skill comparisons
   - Interactive charts for keyword analysis
   - Particle effects for background elements
   - Loading animations for PDF processing
   - Smooth transitions for result reveals

3. Components to create:
   - AnimatedScoreRing: Circular progress with percentage
   - FloatingSkillCard: Hoverable skill comparison cards
   - KeywordCloud: Interactive animated keyword display
   - AnalysisLoader: Engaging loading animation during processing
   - ResultReveal: Smooth animation for showing analysis results

4. Ensure all animations are:
   - Performance optimized
   - Accessible (respects prefers-reduced-motion)
   - Mobile-friendly
   - TypeScript compatible

Configure Magic UI to work seamlessly with shadcn/ui components.
```

### **7단계: 환경변수 및 설정 시스템 (Filesystem)**

````
Using Filesystem, create comprehensive environment and configuration system:

.env.example file:
```bash
# API Mode Configuration
VITE_API_MODE=offline
VITE_USE_MOCK_DATA=true

# Analysis Configuration
VITE_ANALYSIS_DEPTH=standard
VITE_CACHE_RESULTS=true
VITE_MAX_FILE_SIZE=10485760

# API Keys (user configurable)
VITE_COHERE_API_KEY=your_cohere_key_here
VITE_HUGGINGFACE_TOKEN=optional
VITE_GEMINI_API_KEY=optional

# PWA Configuration
VITE_ENABLE_PWA=true
VITE_APP_NAME=Resume Job Matcher

# Quota Management
VITE_COHERE_MONTHLY_LIMIT=1000
VITE_LOCAL_ANALYSIS_ENABLED=true
````

Create configuration management files:

1. lib/config.ts - Centralized configuration
2. types/config.ts - TypeScript interfaces
3. utils/env-validator.ts - Environment validation

Include the AIServiceConfig interface:

```typescript
interface AIServiceConfig {
  mode: "mock" | "free" | "offline" | "custom";
  apiKey?: string;
  fallbackToOffline: boolean;
  analysisDepth: "basic" | "standard" | "detailed";
  cacheResults: boolean;
}
```

```

---

## 🔍 **Phase 3: 텍스트 분석 엔진 구축 (MCP + Agent 협업)**

### **8단계: 텍스트 분석 알고리즘 설계 (Sequential-Thinking)**
```

Using Sequential-Thinking, design the comprehensive text analysis and matching algorithm:

Core Algorithm Requirements:

1. PDF text extraction with formatting preservation using pdf.js
2. Text preprocessing (tokenization, stopword removal, stemming)
3. TF-IDF calculation for keyword importance using natural.js
4. Cosine similarity computation
5. ATS keyword pattern matching with regex
6. Skill extraction and categorization
7. Experience level assessment
8. Match score calculation with weighted factors

Design the calculateMatch function structure:

```javascript
const calculateMatch = (resumeText, jobDescription, options) => {
  // 1. Text preprocessing and cleaning
  // 2. Keyword extraction using TF-IDF
  // 3. Skill identification and matching
  // 4. Experience level analysis
  // 5. ATS compliance checking
  // 6. Semantic similarity (Cohere API or local)
  // 7. Weighted score calculation
  // 8. Detailed breakdown generation
  return {
    overallScore: number,
    keywordMatches: object,
    skillMatches: object,
    atsCompliance: object,
    suggestions: array,
    breakdown: object,
  };
};
```

Algorithm Design Considerations:

- Accuracy vs performance trade-offs
- Handling different resume formats and structures
- Industry-specific keyword weights
- Multi-language support (Korean/English)
- Bias reduction in scoring algorithms
- Explainable AI for match reasoning
- Integration with Cohere API and local fallbacks

Plan the complete text processing pipeline with comprehensive error handling.

```

### **9단계: 텍스트 분석 서비스 구현 (Filesystem)**
```

Using Filesystem, implement the core text analysis engine based on Sequential-Thinking design:

1. services/text-analysis-service.ts - Main analysis coordinator
2. algorithms/tfidf.ts - TF-IDF implementation with natural.js
3. algorithms/similarity.ts - Cosine similarity and matching algorithms
4. algorithms/ats-checker.ts - ATS compliance patterns and validation
5. algorithms/skill-extractor.ts - Skill identification engine
6. services/cohere-service.ts - Cohere API integration with error handling
7. services/pdf-parser.ts - PDF text extraction with pdf.js
8. utils/text-processor.ts - Text cleaning and preprocessing utilities
9. utils/keyword-matcher.ts - Advanced keyword matching logic
10. data/ats-patterns.json - Comprehensive ATS keyword patterns database
11. data/skills-database.json - Industry skills and categories database

Key Implementation Features:

- Complete TypeScript interfaces for all analysis results
- Robust error handling for malformed PDFs and text
- Progress tracking for long-running analysis tasks
- Intelligent caching for repeated analyses
- Configurable analysis parameters and weights
- Comprehensive logging and debugging support
- Memory-efficient processing for large documents

Include quota management and fallback strategies for API services.

```

### **10단계: API 서비스 레이어 구현 (Filesystem)**
```

Using Filesystem, implement the comprehensive API service layer:

1. services/free-ai-service.ts - Free tier management with quota tracking
2. services/api-service.ts - Main service coordinator and router
3. services/cohere-service.ts - Cohere Classify API integration
4. services/local-analysis-service.ts - Pure local analysis capabilities
5. utils/quota-manager.ts - API usage tracking with localStorage
6. utils/cache-manager.ts - Analysis result caching and retrieval
7. utils/error-handler.ts - Comprehensive error handling and recovery
8. utils/retry-logic.ts - Smart retry mechanisms for API failures

Service Features:

- Automatic fallback hierarchy: API → Local → Mock
- Smart quota management with usage predictions
- Intelligent result caching for identical inputs
- Background processing capabilities
- Real-time analysis progress tracking
- Comprehensive error recovery strategies
- User-configurable API key management
- Multi-provider support architecture

Ensure seamless integration with frontend components and state management.

```

---

## 🏗️ **Phase 4: UI 컴포넌트 개발 (Frontend Agent 주도)**

### **11단계: 파일 업로드 및 입력 컴포넌트 개발**
```

@frontend-developer Create comprehensive file upload and text input components using shadcn/ui and Magic UI:

**Resume Upload Components:**

1. components/analysis/resume-upload.tsx - PDF drag-and-drop upload

   - Use shadcn/ui Button and Card components as foundation
   - Integrate Magic UI animations for smooth file interactions
   - Multi-format support with proper validation
   - Real-time upload progress with animated indicators
   - PDF preview capability using pdf.js integration
   - TypeScript interfaces for file handling

2. components/analysis/file-preview.tsx - Uploaded file preview
   - shadcn/ui Card layout for file metadata display
   - Magic UI floating animations for file thumbnails
   - Processing status with animated progress indicators
   - Remove/replace functionality with confirmation dialogs

**Job Description Input:** 3. components/analysis/job-input.tsx - Job posting text input

- shadcn/ui Textarea with enhanced validation
- Character count and formatting indicators
- Auto-save functionality with visual feedback
- Sample job description templates
- Real-time keyword highlighting during input

**UI Requirements:**

- All components must use TypeScript with comprehensive interfaces
- Mobile-first responsive design using Tailwind CSS
- WCAG accessibility compliance with proper ARIA labels
- Performance optimization with React.memo and useMemo
- Integration with custom hooks for file processing
- Error boundary implementation for robust error handling

**State Management:**

- Use React Context for file upload state
- Custom hooks for file validation and processing
- Optimistic UI updates during upload process
- Error recovery with user-friendly messaging

Create engaging and intuitive interfaces that guide users through the upload process.

```

### **12단계: 분석 결과 시각화 컴포넌트**
```

@frontend-developer Create comprehensive analysis result visualization using shadcn/ui and Magic UI:

**Core Visualization Components:**

1. components/analysis/score-visualization.tsx - Overall match score display

   - Magic UI AnimatedScoreRing for circular progress
   - shadcn/ui Badge components for score categories
   - Color-coded scoring with smooth transitions
   - Detailed breakdown tooltips on hover
   - Comparative scoring against industry averages

2. components/analysis/keyword-analysis.tsx - Keyword matching visualization

   - Magic UI interactive keyword cloud
   - shadcn/ui Card layout for organized display
   - Matched vs missing keywords with visual distinction
   - Importance weighting with size and color coding
   - Clickable keywords for detailed analysis

3. components/analysis/skills-breakdown.tsx - Skills matching analysis

   - Skills matrix with Magic UI floating cards
   - shadcn/ui Progress components for proficiency levels
   - Missing skills suggestions with priority indicators
   - Industry-specific skill categories
   - Interactive filtering and searching

4. components/analysis/ats-compliance.tsx - ATS compliance checker
   - shadcn/ui Alert components for compliance status
   - Checklist-style indicators with animations
   - Detailed recommendations with action items
   - Before/after optimization preview
   - Industry standard comparisons

**Advanced Features:**

- Export functionality for analysis results
- Print-friendly layouts with CSS media queries
- Real-time updates during analysis processing
- Smooth animations for data state changes
- Mobile-optimized visualization layouts
- Accessibility features for screen readers

**Performance Requirements:**

- Lazy loading for complex visualizations
- Efficient re-rendering with proper React patterns
- Memory management for large datasets
- Responsive chart resizing with debounced updates

Ensure all visualizations are engaging, informative, and help users understand their matching results.

```

### **13단계: 설정 및 상태 관리 시스템**
```

@frontend-developer Create comprehensive settings and configuration management:

**Settings Components:**

1. components/settings/api-configuration.tsx - API key management

   - shadcn/ui Input with secure password-style entry
   - Service status indicators with real-time validation
   - Quota usage display with Magic UI progress animations
   - Test connection functionality with loading states

2. components/settings/analysis-settings.tsx - Analysis customization
   - shadcn/ui Select and Radio components for preferences
   - Analysis depth selection with explanatory tooltips
   - Industry-specific settings and keyword weights
   - Language preferences (Korean/English) with proper i18n

**State Management:** 3. hooks/use-configuration.ts - Centralized config management

- Persistent settings using localStorage
- Real-time validation and error handling
- Type-safe configuration updates
- Integration with API services

4. contexts/app-context.tsx - Global application state
   - Analysis workflow state management
   - API quota and usage tracking
   - User preferences and settings
   - Error boundary and recovery logic

**API Status Management:** 5. components/common/api-status.tsx - Real-time API status indicator

- Visual indicators for online/offline/quota exceeded
- shadcn/ui Alert components for status changes
- Magic UI animations for status transitions
- User-friendly messaging for different states

**Requirements:**

- Secure handling of API keys with encryption
- Persistent user preferences across sessions
- Real-time sync with API quota limits
- Graceful degradation when APIs are unavailable
- Comprehensive TypeScript typing throughout

Ensure robust state management that supports complex analysis workflows.

```

---

## 📱 **Phase 5: 페이지 구성 및 라우팅 (Frontend Agent 주도)**

### **14단계: 메인 분석 페이지 개발**
```

@frontend-developer Build the core analysis interface and workflow:

**Primary Analysis Interface:**

1. pages/analysis-tool.tsx - Main analysis page

   - Split-screen layout: input on left, results on right
   - shadcn/ui Tabs for organized workflow steps
   - Magic UI transitions between analysis phases
   - Responsive design for mobile analysis workflow
   - Real-time progress tracking with visual feedback

2. components/analysis/analysis-workflow.tsx - Guided process
   - Step-by-step workflow with shadcn/ui Progress
   - Resume upload → Job input → Analysis → Results
   - Auto-save functionality throughout process
   - Magic UI animations for smooth transitions
   - Error recovery at each step

**Dashboard and History:** 3. components/analysis/results-dashboard.tsx - Comprehensive results

- shadcn/ui Card grid layout for organized information
- Magic UI animations for result presentation
- Export functionality (PDF, JSON, plain text)
- Analysis history with comparison features
- Share analysis results with unique links

**Workflow Features:**

- Background processing with progress indicators
- Optimistic UI updates during analysis
- Smart caching for improved performance
- Mobile-optimized analysis experience
- Comprehensive error boundaries

**State Management:**

- Complex analysis state with useReducer
- Context providers for cross-component state
- Custom hooks for analysis workflow
- Performance optimization with React.memo

**Integration Requirements:**

- Real-time connection to text analysis services
- Progress updates from background processing
- File processing status monitoring
- API quota warnings and fallback handling

Create an intuitive and efficient analysis interface that guides users seamlessly through the matching process.

```

### **15단계: 랜딩 페이지 및 교육 콘텐츠**
```

@frontend-developer Create engaging landing page and educational content:

**Landing Page:**

1. pages/landing.tsx - Marketing and introduction page

   - Hero section with Magic UI particle background
   - shadcn/ui Card components for feature highlights
   - Interactive demo of analysis process
   - Testimonials and success metrics
   - Clear call-to-action with animated buttons

2. components/landing/feature-showcase.tsx - Feature demonstrations
   - Interactive preview of matching analysis
   - Before/after resume improvement examples
   - Magic UI animations for feature transitions
   - Industry-specific use case examples

**Educational Content:** 3. pages/how-it-works.tsx - Algorithm explanation

- Visual explanation of TF-IDF and text matching
- shadcn/ui Accordion for step-by-step breakdown
- Interactive examples with Magic UI animations
- Technical details with accessible explanations

4. pages/keyword-dictionary.tsx - Comprehensive keyword database
   - shadcn/ui Table with search and filter functionality
   - Industry-specific keyword categories
   - Magic UI hover effects for keyword details
   - Export functionality for keyword lists
   - Trending keywords with visual indicators

**Content Features:**

- SEO-optimized structure with proper meta tags
- Responsive design for all device sizes
- Accessibility features throughout
- Social sharing capabilities
- Interactive examples and demonstrations

**Magic UI Enhancements:**

- Smooth scroll animations between sections
- Interactive data visualizations
- Hover effects for engagement
- Loading animations for dynamic content
- Micro-interactions for better UX

Create engaging content that educates users while showcasing platform capabilities.

```

---

## 🔧 **Phase 6: PWA 및 고급 기능 (MCP + Agent 협업)**

### **16단계: PWA 및 오프라인 기능 (Filesystem + Frontend Agent)**
```

First, using Context7, research PWA best practices for data-intensive applications.

Then, using Filesystem, implement PWA core functionality:

1. Configure Vite PWA plugin for offline analysis
2. Create service worker with analysis result caching
3. Implement offline text analysis capabilities
4. Set up background sync for analysis queues

After PWA setup, @frontend-developer enhancement:

**Offline Features:**

1. components/common/offline-indicator.tsx - Network status

   - shadcn/ui Alert for offline notifications
   - Magic UI animations for status changes
   - Offline analysis queue management
   - Sync progress indicators

2. hooks/use-offline-analysis.ts - Offline analysis management
   - Queue analysis requests when offline
   - Background sync when connection restored
   - Local analysis fallback strategies
   - Offline result persistence

**PWA Enhancements:**

- Install prompt with shadcn/ui Dialog
- Offline-capable analysis workflow
- Progressive loading for better performance
- Magic UI loading animations
- Local storage optimization

Ensure the application works seamlessly offline with full analysis capabilities.

```

---

## 🧪 **Phase 7: 테스트 및 배포 (MCP 중심)**

### **17단계: 종합 테스트 구현 (TaskMaster + Playwright)**
```

Using TaskMaster, create comprehensive testing strategy for text analysis and UI workflows.

Then using Playwright, implement end-to-end tests:

**Core Analysis Tests:**

1. tests/analysis-workflow.spec.ts - Complete analysis flow
2. tests/file-upload.spec.ts - PDF upload and parsing
3. tests/text-analysis.spec.ts - Algorithm accuracy testing
4. tests/api-integration.spec.ts - Cohere API and fallbacks
5. tests/offline-functionality.spec.ts - Offline analysis capabilities
6. tests/responsive-design.spec.ts - Mobile and desktop layouts

**shadcn/ui Component Tests:**

- Form interactions and validation
- Button states and accessibility
- Modal and dialog functionality
- Table sorting and filtering

**Magic UI Animation Tests:**

- Animation performance and smoothness
- Interactive element responsiveness
- Loading state accuracy
- Transition timing validation

**Accessibility Tests:**

- Screen reader compatibility
- Keyboard navigation
- Color contrast compliance
- ARIA label accuracy

Configure comprehensive test coverage with detailed reporting.

```

### **18단계: 최종 통합 및 배포 (GitHub + Frontend Agent)**
```

@frontend-developer Perform final optimization and integration:

**Performance Optimization:**

1. Bundle analysis for text processing libraries
2. Code splitting for analysis components
3. PDF processing optimization
4. shadcn/ui component tree shaking
5. Magic UI animation performance tuning

**Final Polish:**

- Animation timing refinement
- shadcn/ui theme consistency
- Error message improvements
- Mobile experience optimization
- Cross-browser compatibility

Then using GitHub, set up deployment pipeline:

1. Create repository with proper asset organization
2. Set up GitHub Actions for:
   - Automated Playwright testing
   - Build optimization with dependency analysis
   - Vercel deployment with environment variables
   - Performance monitoring and alerts
3. Configure branch protection and code review
4. Set up environment secrets for API keys

**Documentation:**

- API integration guides
- Component usage documentation
- Deployment instructions
- User guides for optimal results

**Final Verification:**

- Text analysis accuracy across resume types
- shadcn/ui component functionality
- Magic UI animation performance
- PWA capabilities on mobile devices
- API integration reliability

````

---

## 🎯 **최적화된 사용법**

### **명령어 패턴**

**Phase 1 (기반 설정):**
```bash
execute step 1    # Sequential-Thinking - 아키텍처 설계
execute step 2    # TaskMaster - 프로젝트 관리
execute step 3    # Context7 - 기술 정보 수집
execute step 4    # Filesystem - 프로젝트 구조
````

**Phase 2 (UI 라이브러리 설정):**

```bash
execute step 5    # shadcn-ui - 컴포넌트 라이브러리
execute step 6    # Magic UI - 애니메이션 컴포넌트
execute step 7    # Filesystem - 환경변수 설정
```

**Phase 3 (텍스트 분석 엔진):**

```bash
execute step 8    # Sequential-Thinking - 알고리즘 설계
execute step 9    # Filesystem - 텍스트 분석 구현
execute step 10   # Filesystem - API 서비스 레이어
```

**Phase 4-5 (UI 개발):**

```bash
@frontend-developer execute step 11    # 업로드 컴포넌트
@frontend-developer execute step 12    # 결과 시각화
@frontend-developer execute step 13    # 설정 관리
@frontend-developer execute step 14    # 메인 페이지
@frontend-developer execute step 15    # 랜딩 페이지
```

**Phase 6-7 (PWA & 배포):**

```bash
execute step 16 (first part)           # Context7 + Filesystem - PWA 기반
@frontend-developer execute step 16 (second part)  # 오프라인 UI
execute step 17                        # TaskMaster + Playwright - 테스트
@frontend-developer execute step 18 (first part)   # 최적화
execute step 18 (second part)          # GitHub - 배포
```

### **MCP 충돌 방지 규칙**

**동시 사용 금지:**

- ❌ Filesystem + shadcn-ui (같은 파일 수정)
- ❌ Magic UI + shadcn-ui (UI 컴포넌트 충돌)
- ❌ Frontend Agent + Filesystem (UI 컴포넌트 작업 시)

**순차 실행 필수:**

1. **Sequential-Thinking** → 설계 완료 후
2. **TaskMaster** → 작업 분해 완료 후
3. **Context7** → 정보 수집 완료 후
4. **Filesystem** → 기본 구조 완료 후
5. **shadcn-ui** → UI 라이브러리 완료 후
6. **Magic UI** → 애니메이션 컴포넌트 완료 후
7. **Frontend Agent** → UI 개발 수행
8. **Playwright** → 테스트 구현
9. **GitHub** → 최종 배포

### **문제 해결 패턴**

```bash
@frontend-developer The PDF upload component has parsing errors. Please optimize using shadcn/ui components and add Magic UI loading animations.

@frontend-developer The analysis visualization performance is slow. Please optimize using React.memo and improve Magic UI animations.

@frontend-developer Add better accessibility features to all shadcn/ui components and ensure WCAG compliance.
```

### **기능 확장 패턴**

```bash
@frontend-developer Add support for multiple file formats (Word, plain text) using the existing shadcn/ui upload components.

@frontend-developer Implement batch analysis feature with Magic UI progress animations for processing multiple resumes.

@frontend-developer Create resume optimization suggestions using shadcn/ui Alert and Card components.
```

---

## ✅ **진행 상황 추적**

- [ ] **Phase 1**: 기반 설정 (Steps 1-4)

  - [ ] 1단계: 아키텍처 설계 (Sequential-Thinking)
  - [ ] 2단계: 프로젝트 관리 (TaskMaster)
  - [ ] 3단계: 기술 정보 수집 (Context7)
  - [ ] 4단계: 프로젝트 구조 (Filesystem)

- [ ] **Phase 2**: UI 라이브러리 설정 (Steps 5-7)

  - [ ] 5단계: shadcn/ui 설정 (shadcn-ui)
  - [ ] 6단계: Magic UI 설정 (Magic UI)
  - [ ] 7단계: 환경설정 (Filesystem)

- [ ] **Phase 3**: 텍스트 분석 엔진 (Steps 8-10)

  - [ ] 8단계: 분석 알고리즘 설계 (Sequential-Thinking)
  - [ ] 9단계: 텍스트 분석 구현 (Filesystem)
  - [ ] 10단계: API 서비스 레이어 (Filesystem)

- [ ] **Phase 4**: UI 컴포넌트 개발 (Steps 11-13)

  - [ ] 11단계: 업로드 컴포넌트 (@frontend-developer)
  - [ ] 12단계: 결과 시각화 (@frontend-developer)
  - [ ] 13단계: 설정 관리 (@frontend-developer)

- [ ] **Phase 5**: 페이지 구성 (Steps 14-15)

  - [ ] 14단계: 메인 분석 페이지 (@frontend-developer)
  - [ ] 15단계: 랜딩 페이지 (@frontend-developer)

- [ ] **Phase 6**: PWA & 오프라인 (Step 16)

  - [ ] 16단계: PWA 기능 (Context7 + Filesystem + @frontend-developer)

- [ ] **Phase 7**: 테스트 & 배포 (Steps 17-18)
  - [ ] 17단계: 종합 테스트 (TaskMaster + Playwright)
  - [ ] 18단계: 최종 배포 (@frontend-developer + GitHub)

---

## 🚀 **시작 명령어**

```bash
I have an optimized development workflow for a Resume-Job Matching Analysis website with frontend-developer agent and full MCP integration. Please read the workflow plan and execute it step by step.

Key workflow features:
- Advanced text analysis with PDF parsing and NLP algorithms
- shadcn/ui component library for consistent, accessible UI
- Magic UI animations for engaging data visualizations
- Frontend-developer agent handles all UI/React development
- MCP tools handle infrastructure, algorithms, and deployment
- Cohere API integration with comprehensive local fallbacks
- Complete PWA support with offline analysis capabilities

Start with Phase 1, Step 1: Architecture design for text analysis system using Sequential-Thinking.
```

---

## 🎉 **최종 결과물 예상**

완성되면 다음과 같은 기능들이 구현됩니다:

### **📊 핵심 기능**

- ✅ **PDF 이력서 업로드 및 파싱** (pdf.js 통합)
- ✅ **채용공고 텍스트 분석** (Natural.js TF-IDF)
- ✅ **AI 기반 매칭 점수** (Cohere API + 로컬 대안)
- ✅ **ATS 호환성 체크** (정규식 패턴)
- ✅ **키워드 매칭 시각화** (Magic UI 애니메이션)
- ✅ **개선 제안 시스템**

### **🎨 사용자 경험**

- ✅ **Modern shadcn/ui 디자인** (일관된 컴포넌트)
- ✅ **Magic UI 애니메이션** (부드러운 인터랙션)
- ✅ **완전 반응형 디자인** (모바일 최적화)
- ✅ **PWA 지원** (오프라인 분석 가능)
- ✅ **접근성 준수** (WCAG 표준)

### **⚙️ 기술적 우수성**

- ✅ **TypeScript 완전 지원** (타입 안전성)
- ✅ **다중 API 모드** (Mock/Free/Offline/Custom)
- ✅ **할당량 관리** (localStorage 추적)
- ✅ **포괄적 에러 처리** (우아한 폴백)
- ✅ **성능 최적화** (lazy loading, memoization)

**이 워크플로우는 전문적인 이력서 분석 플랫폼을 구축하기 위해 Frontend Agent와 8개 MCP 도구들이 완벽하게 협업하도록 설계되었습니다!** 🚀✨
