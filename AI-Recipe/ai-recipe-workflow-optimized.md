# AI 레시피 생성기 개발 워크플로우 (Frontend Agent + MCP 최적화)

## 🎯 프로젝트 개요

React + TypeScript + Tailwind CSS + shadcn/ui로 구현하는 AI 레시피 생성기
**Frontend Agent + MCP 조합으로 최적화된 개발 프로세스**

---

## 🤖 **에이전트 & MCP 역할 분담**

### **@frontend-developer 에이전트**

- UI 컴포넌트 개발 (shadcn/ui + Magic UI)
- React 아키텍처 및 상태 관리
- 반응형 디자인 및 접근성
- 성능 최적화 및 TypeScript 타입 안전성

### **MCP 도구들**

- **Sequential-Thinking**: 복잡한 설계 및 알고리즘
- **TaskMaster**: 프로젝트 관리 및 작업 분해
- **Context7**: 최신 기술 정보 수집
- **Filesystem**: 기본 파일 구조 및 설정
- **shadcn/ui**: UI 컴포넌트 라이브러리
- **Magic UI**: 애니메이션 및 고급 효과
- **Playwright**: 테스트 자동화
- **GitHub**: 버전 관리 및 배포

---

## 📋 **Phase 1: 프로젝트 기반 설정 (MCP 중심)**

### **1단계: 아키텍처 설계**

```
Using Sequential-Thinking, design a comprehensive architecture for an AI Recipe Generator web application.

Requirements:
- React + TypeScript + Tailwind CSS + Vite
- shadcn/ui for UI components, Magic UI for animations
- Multiple API providers: Spoonacular (150 daily), Edamam (10k monthly)
- API modes: mock, free, offline, custom
- Offline capabilities with local JSON database
- PWA support with caching
- Korean language support
- Vercel deployment

Please think through:
1. Project structure optimized for frontend-developer agent usage
2. API service layer architecture with multiple providers
3. Component architecture using shadcn/ui as base
4. State management strategy for React
5. Caching and offline storage approach
6. Error handling and fallback mechanisms
7. Testing strategy with Playwright
8. Deployment workflow with GitHub Actions

Design with frontend-developer agent collaboration in mind.
```

### **2단계: 프로젝트 관리 설정**

```
Using TaskMaster, create a comprehensive PRD and break it into manageable tasks optimized for frontend-developer agent workflow.

Core Features:
- Ingredient input with tag-based UI (shadcn/ui components)
- Recipe generation using multiple APIs with fallbacks
- Offline recipe database (recipes.json)
- Saved recipes gallery with Magic UI animations
- Nutrition information display
- API quota tracking and management
- PWA functionality

Technical Setup:
- Vite project with React + TypeScript + Tailwind CSS
- shadcn/ui component library integration
- Environment variables for API keys and modes
- Service worker for PWA functionality
- Local storage for quota tracking
- Responsive design for mobile/desktop
- Playwright testing setup

API Integration Strategy:
- Primary: Spoonacular API (150 daily requests)
- Secondary: Edamam Recipe API (10k monthly)
- Fallback: Local recipes.json file
- Mock mode for development

Please create the PRD at .taskmaster/docs/prd.txt and generate structured development tasks that specify:
- Which tasks should use @frontend-developer agent
- Which tasks should use MCP tools directly
- Integration points between agent and MCP work
```

### **3단계: 최신 기술 정보 수집**

```
Using Context7, research and compile the latest documentation for our tech stack:

1. Vite configuration with React, TypeScript, and PWA setup
2. shadcn/ui installation and component usage patterns
3. Modern React patterns for API service layers with TypeScript
4. React performance optimization techniques
5. PWA implementation guide for offline caching
6. Playwright testing setup for React applications
7. Spoonacular API documentation and rate limiting
8. Edamam Recipe API integration examples
9. Magic UI component library usage and animations
10. Vercel deployment for React PWA applications
11. Accessibility best practices for React applications

Compile this information for frontend-developer agent reference.
```

### **4단계: 프로젝트 구조 생성**

```
Using Filesystem, create the complete Vite project structure optimized for frontend-developer agent workflow:

ai-recipe-generator/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components (agent will customize)
│   │   ├── recipe/          # 레시피 관련 컴포넌트 (agent managed)
│   │   ├── layout/          # 레이아웃 컴포넌트 (agent managed)
│   │   └── common/          # 공통 컴포넌트 (agent managed)
│   ├── pages/               # 페이지 컴포넌트 (agent managed)
│   ├── services/            # API 서비스 레이어
│   ├── hooks/               # 커스텀 훅 (agent will create)
│   ├── utils/               # 유틸리티 함수
│   ├── types/               # TypeScript 타입 정의
│   ├── data/                # 로컬 데이터
│   ├── lib/                 # 라이브러리 설정
│   └── assets/              # 정적 자산
├── public/
│   ├── recipes.json         # 오프라인 레시피 DB
│   └── sw.js               # Service Worker
├── tests/                   # Playwright 테스트
├── .env.example            # 환경변수 템플릿
└── README.md

Create initial configuration files:
- vite.config.ts with PWA plugin
- tailwind.config.js configured for shadcn/ui
- tsconfig.json with proper paths for agent work
- package.json with all necessary dependencies
- playwright.config.ts for testing
- components.json for shadcn/ui configuration

Set up the project ready for frontend-developer agent to take over UI development.
```

---

## 🎨 **Phase 2: UI 기반 구축 (Frontend Agent 중심)**

### **5단계: shadcn/ui 설정 및 초기 컴포넌트**

```
@frontend-developer Please set up the shadcn/ui component library and create the foundational UI system for our recipe generator.

Tasks:
1. Initialize shadcn/ui in the project using your expertise
2. Install essential components for recipe app:
   - Button, Input, Label (for forms)
   - Card, Badge (for recipe display)
   - Dialog, Sheet (for modals)
   - Tabs, Select (for navigation)
   - Toast, Alert (for notifications)
   - Skeleton (for loading states)

3. Configure theme colors for food/recipe theme:
   - Primary: food-themed colors (oranges, greens)
   - Secondary: nutrition colors (blues, purples)
   - Accent: interactive elements

4. Create initial TypeScript interfaces for component props
5. Set up proper accessibility features from the start

Use your React expertise to ensure optimal component architecture and performance.
```

### **6단계: 환경설정 및 타입 정의**

```
Using Filesystem, create comprehensive environment and configuration files:

1. .env.example file with all necessary variables
2. Create .env file for development with mock data enabled
3. Create lib/config.ts for centralized configuration management
4. Set up proper TypeScript interfaces for environment variables

Then immediately hand over to frontend-developer for TypeScript setup:

@frontend-developer Please create comprehensive TypeScript type definitions that you'll use throughout the application:

1. types/ingredient.ts - Ingredient interfaces and enums
2. types/recipe.ts - Recipe data structures and nutrition info
3. types/api.ts - API response interfaces for all providers
4. types/app.ts - Application state and configuration types
5. types/service.ts - Service layer interfaces
6. types/component.ts - Common component prop types

Include the AIServiceConfig interface:
interface AIServiceConfig {
  mode: 'mock' | 'free' | 'offline' | 'custom';
  apiKey?: string;
  fallbackToOffline: boolean;
}

Ensure type safety and developer experience optimization.
```

### **7단계: 핵심 UI 컴포넌트 개발**

```
@frontend-developer Create the core UI components for our recipe generator using your shadcn/ui and Magic UI expertise:

**Priority Components:**
1. components/ui/tag-input.tsx - Custom ingredient tag input
   - TypeScript interfaces for tag props
   - Add/remove functionality
   - Autocomplete from predefined list
   - Keyboard navigation support

2. components/ui/recipe-card.tsx - Recipe display card
   - Nutrition information display
   - Save/favorite functionality
   - Responsive design
   - Magic UI hover animations

3. components/ui/api-status-indicator.tsx - Shows current API mode
   - Visual indicators for offline/online
   - Quota tracking display
   - Toast notifications for status changes

4. components/ui/nutrition-display.tsx - Nutrition panel
   - Progress bars for macros
   - Calorie visualization
   - Dietary restriction indicators

5. components/ui/quota-tracker.tsx - API usage tracker
   - Real-time usage display
   - Warning states for limits
   - Reset timers

**Requirements:**
- Full TypeScript integration
- Mobile-first responsive design
- WCAG accessibility compliance
- Performance optimization (React.memo, useMemo)
- Magic UI animations for enhanced UX
- Comprehensive prop interfaces

Test each component as you build and ensure shadcn/ui base styling.
```

---

## ⚙️ **Phase 3: API & 로직 계층 (MCP + Agent 협업)**

### **8단계: API 서비스 레이어 설계 및 구현**

```
First, using Sequential-Thinking, design the detailed API service architecture:
- Multi-provider switching logic (Spoonacular, Edamam, Offline)
- Error handling and fallback strategies
- Quota tracking implementation with localStorage
- Response caching mechanisms
- Type-safe service interfaces

Then, using Filesystem, implement the core API service layer:

1. services/apiService.ts - Main service coordinator
2. services/spoonacularService.ts - Spoonacular API integration
3. services/edamamService.ts - Edamam API integration
4. services/offlineService.ts - Local JSON database service
5. services/freeAIService.ts - AI service with specified config
6. utils/quotaManager.ts - API quota tracking with localStorage
7. utils/cacheManager.ts - Response caching utilities
8. utils/errorHandler.ts - Centralized error handling

After implementation, hand over to frontend-developer:

@frontend-developer Please create React hooks and integration components for the API services:

1. hooks/useRecipeAPI.ts - Main recipe API hook
2. hooks/useQuotaTracker.ts - Quota management hook
3. hooks/useOfflineDetection.ts - Network status hook
4. components/common/APIProvider.tsx - Context provider for API state

Ensure proper TypeScript integration, error boundary handling, and optimal React patterns for the API layer.
```

### **9단계: 레시피 생성 알고리즘**

````
Using Sequential-Thinking, design the intelligent recipe generation algorithm:

1. Ingredient analysis and categorization
2. Recipe matching from multiple sources
3. Filtering and ranking logic based on user preferences
4. Missing ingredient suggestions
5. Nutritional analysis and scoring
6. Fallback recipe generation for offline mode

Plan the generateRecipe function structure:
```javascript
const generateRecipe = (ingredients, preferences, nutritionGoals) => {
  // Ingredient analysis and compatibility checking
  // Multi-source recipe matching (API + local)
  // Ranking algorithm based on nutrition and preferences
  // Missing ingredient suggestions
  // Return optimized recipe recommendations
};
````

Then using Filesystem, implement the algorithm files:

- services/recipeGenerator.ts
- utils/ingredientMatcher.ts
- utils/nutritionCalculator.ts
- data/recipeRules.json

Finally, frontend-developer integration:

@frontend-developer Integrate the recipe generation algorithm with React components:

1. Create hooks/useRecipeGeneration.ts for algorithm integration
2. Add loading states and progress indicators using Magic UI
3. Implement result display with smooth animations
4. Add error handling and retry mechanisms
5. Create recipe suggestion components with interactive elements

Ensure optimal user experience during recipe generation process.

```

---

## 🏗️ **Phase 4: 페이지 구성 및 라우팅 (Frontend Agent 주도)**

### **10단계: 메인 페이지 및 핵심 기능**
```

@frontend-developer Build the main application pages using your React expertise and the components we've created:

**Primary Pages:**

1. pages/RecipeGenerator.tsx - Main recipe generation page

   - Ingredient form with tag input
   - Recipe generation controls
   - Results display with animations
   - API status and quota indicators

2. components/recipe/IngredientForm.tsx - Smart ingredient input

   - Auto-complete functionality
   - Dietary preference filters
   - Nutrition goal settings
   - Form validation and error handling

3. components/recipe/RecipeResults.tsx - Recipe display grid

   - Masonry layout for recipe cards
   - Filtering and sorting options
   - Infinite scroll or pagination
   - Save/favorite functionality

4. components/layout/Header.tsx - App navigation

   - Logo and branding
   - Navigation menu with active states
   - API mode indicator
   - Mobile hamburger menu

5. components/layout/Footer.tsx - App footer
   - Links and information
   - Attribution and credits

**Key Features:**

- React Router setup for SPA navigation
- Context providers for global state
- Magic UI page transitions
- Responsive design for all devices
- Loading states and error boundaries
- Accessibility features throughout

**State Management:**

- Use React Context for global app state
- Local state with useState and useReducer
- Custom hooks for complex state logic
- Proper TypeScript integration

Ensure smooth user experience and optimal performance.

```

### **11단계: 추가 페이지 및 기능**
```

@frontend-developer Create the remaining application pages and features:

**Secondary Pages:**

1. pages/SavedRecipes.tsx - User's saved recipe gallery

   - Grid/list view toggle
   - Search and filter functionality
   - Bulk actions (delete, export)
   - Magic UI animations for gallery interactions

2. pages/OfflineRecipeBook.tsx - Browse local recipe database

   - Category-based browsing
   - Recipe preview and details
   - Offline-first design with proper indicators

3. pages/Settings.tsx - Application configuration

   - API key management with secure input
   - Preference settings (dietary, allergies)
   - Theme selection (light/dark mode)
   - Data export/import functionality

4. components/layout/Navigation.tsx - Enhanced navigation
   - Breadcrumb navigation
   - Quick action buttons
   - Search bar integration
   - Mobile-optimized menu

**Advanced Features:**

- Recipe sharing functionality
- Print-friendly recipe layouts
- Shopping list generation
- Meal planning calendar integration
- Recipe rating and review system

**UX Enhancements:**

- Smooth page transitions with Magic UI
- Progressive loading for better performance
- Optimistic UI updates
- Comprehensive error states
- Loading skeletons for all components

Use your expertise to create an exceptional user experience.

```

---

## 🔧 **Phase 5: PWA 및 고급 기능 (MCP + Agent 협업)**

### **12단계: PWA 및 오프라인 기능**
```

First, using Context7, research the latest PWA implementation patterns and best practices.

Then, using Filesystem, implement PWA core functionality:

1. Configure Vite PWA plugin in vite.config.ts
2. Create service worker for caching strategies
3. Implement offline detection utilities
4. Set up app manifest for mobile installation
5. Create comprehensive offline recipe database
6. Add background sync for saved recipes

After PWA setup, frontend-developer enhancement:

@frontend-developer Enhance the PWA experience with React integration:

**PWA Features:**

1. components/common/OfflineIndicator.tsx - Network status display
2. components/common/InstallPrompt.tsx - PWA installation prompt
3. hooks/useOfflineStatus.ts - Network detection hook
4. hooks/usePWAInstall.ts - Installation prompt management

**Offline Experience:**

- Offline-first recipe browsing
- Local storage optimization
- Sync indicators and queue management
- Graceful degradation for offline features

**Mobile Optimizations:**

- Touch-friendly interactions
- Mobile-specific gestures
- Orientation change handling
- Safe area adjustments for notched devices

**Performance:**

- Lazy loading for non-critical components
- Image optimization and lazy loading
- Bundle splitting for faster initial loads
- Service worker caching strategies

Ensure the app works seamlessly offline and provides native app-like experience.

```

---

## 🧪 **Phase 6: 테스트 및 배포 (MCP 중심)**

### **13단계: 종합 테스트 구현**
```

Using TaskMaster, create a comprehensive testing strategy for all application features.

Then using Playwright, implement end-to-end tests:

**Critical User Flow Tests:**

1. tests/recipe-generation.spec.ts - Complete recipe generation flow
2. tests/ingredient-input.spec.ts - Tag input and autocomplete
3. tests/api-switching.spec.ts - API mode switching and fallbacks
4. tests/offline-mode.spec.ts - Complete offline functionality
5. tests/saved-recipes.spec.ts - Recipe saving and management
6. tests/responsive.spec.ts - Mobile and desktop responsiveness
7. tests/accessibility.spec.ts - WCAG compliance testing
8. tests/performance.spec.ts - Load time and interaction performance

**Test Coverage:**

- All frontend-developer created components
- API integration and error handling
- PWA functionality and offline behavior
- Cross-browser compatibility
- Mobile device testing
- Accessibility compliance

**Integration Tests:**

- API quota tracking accuracy
- Recipe generation algorithm reliability
- Data persistence and retrieval
- State management consistency

Configure tests to run in CI/CD pipeline with comprehensive reporting.

```

### **14단계: 최종 통합 및 배포**
```

@frontend-developer Perform final optimization and integration:

**Performance Optimization:**

1. Bundle analysis and optimization
2. Component lazy loading implementation
3. Image optimization and WebP conversion
4. Critical CSS extraction
5. Memory leak detection and fixes

**Final Polish:**

- Animation timing refinements
- Loading state improvements
- Error message enhancements
- Accessibility audit and fixes
- Cross-browser testing and fixes

Then using GitHub, set up deployment pipeline:

1. Create GitHub repository with proper structure
2. Set up GitHub Actions for:
   - Automated Playwright testing
   - Build optimization and deployment to Vercel
   - Code quality checks and linting
   - Performance monitoring
3. Configure branch protection rules
4. Set up environment secrets for deployment

Using Filesystem, create final documentation:

- vercel.json configuration for optimal deployment
- Comprehensive README.md with setup instructions
- API documentation and usage guides
- Deployment troubleshooting guide

**Final Verification:**

- All tests passing in CI/CD
- Performance benchmarks met
- Accessibility compliance verified
- Cross-device compatibility confirmed
- SEO optimization completed

````

---

## 🎯 **최적화된 사용법**

### **명령어 패턴**

**Phase 1-3 (기반 설정):**
```bash
execute step 1    # Sequential-Thinking
execute step 2    # TaskMaster
execute step 3    # Context7
execute step 4    # Filesystem
````

**Phase 2-4 (UI 개발):**

```bash
@frontend-developer execute step 5
@frontend-developer execute step 6 (second part)
@frontend-developer execute step 7
@frontend-developer execute step 10
@frontend-developer execute step 11
```

**Phase 3,5 (API & PWA):**

```bash
execute step 8 (first part)      # Sequential-Thinking + Filesystem
@frontend-developer execute step 8 (second part)
execute step 9 (first part)      # Sequential-Thinking + Filesystem
@frontend-developer execute step 9 (second part)
execute step 12 (first part)     # Context7 + Filesystem
@frontend-developer execute step 12 (second part)
```

**Phase 6 (테스트 & 배포):**

```bash
execute step 13   # TaskMaster + Playwright
@frontend-developer execute step 14 (first part)
execute step 14 (second part)    # GitHub + Filesystem
```

### **문제 해결 패턴**

```bash
@frontend-developer The ingredient input component has TypeScript errors. Please review and fix using your React expertise.

@frontend-developer Optimize the recipe card component performance and add proper accessibility features.

@frontend-developer The API integration is causing re-render issues. Please optimize with proper React patterns.
```

### **기능 추가 패턴**

```bash
@frontend-developer Add dark mode support to all components using shadcn/ui theme system.

@frontend-developer Implement recipe export functionality with PDF generation.

@frontend-developer Add voice input for ingredients using Web Speech API.
```

---

## ✅ **진행 상황 추적**

- [ ] **Phase 1**: 기반 설정 (Steps 1-4)

  - [ ] 1단계: 아키텍처 설계 (Sequential-Thinking)
  - [ ] 2단계: 프로젝트 관리 (TaskMaster)
  - [ ] 3단계: 기술 정보 수집 (Context7)
  - [ ] 4단계: 프로젝트 구조 (Filesystem)

- [ ] **Phase 2**: UI 기반 구축 (Steps 5-7)

  - [ ] 5단계: shadcn/ui 설정 (@frontend-developer)
  - [ ] 6단계: 환경설정 + 타입 정의 (Filesystem + @frontend-developer)
  - [ ] 7단계: 핵심 UI 컴포넌트 (@frontend-developer)

- [ ] **Phase 3**: API & 로직 (Steps 8-9)

  - [ ] 8단계: API 서비스 레이어 (MCP + @frontend-developer)
  - [ ] 9단계: 레시피 알고리즘 (MCP + @frontend-developer)

- [ ] **Phase 4**: 페이지 구성 (Steps 10-11)

  - [ ] 10단계: 메인 페이지 (@frontend-developer)
  - [ ] 11단계: 추가 페이지 (@frontend-developer)

- [ ] **Phase 5**: PWA & 고급 기능 (Step 12)

  - [ ] 12단계: PWA 기능 (MCP + @frontend-developer)

- [ ] **Phase 6**: 테스트 & 배포 (Steps 13-14)
  - [ ] 13단계: 종합 테스트 (TaskMaster + Playwright)
  - [ ] 14단계: 최종 배포 (@frontend-developer + GitHub + Filesystem)

---

## 🚀 **시작 명령어**

```bash
I have an optimized development workflow with frontend-developer agent integration. Please read the workflow plan and execute it step by step.

Key workflow features:
- Frontend-developer agent handles all UI/React development
- MCP tools handle infrastructure and setup
- Seamless integration between agent and MCP work
- Optimized for React + TypeScript + shadcn/ui development

Start with Phase 1, Step 1: Architecture design using Sequential-Thinking.
```

이 워크플로우는 **Frontend Agent의 전문성을 최대한 활용**하면서 **MCP 도구들과 완벽하게 협업**하도록 설계되었습니다! 🎉
