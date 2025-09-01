# AI 색상 팔레트 생성기 웹사이트 개발 워크플로우 (완전 통합)

## 프로젝트 개요

React + TypeScript + Tailwind CSS + Vite로 구현하는 AI 기반 색상 팔레트 생성 플랫폼  
**MCP 도구**: Sequential-Thinking, Shrimp Task Manager, Context7, Filesystem, GitHub, shadcn-ui, Playwright, Magic UI

---

## 에이전트 & MCP 역할 분담

### **@frontend-developer 에이전트**

- 색상 팔레트 UI 컴포넌트 (shadcn/ui + Magic UI)
- React 색상 시각화 및 인터랙션
- 이미지 업로드 및 색상 추출 인터페이스
- 색상 조화 규칙 시각화
- 팔레트 저장 및 관리 시스템
- 접근성 색상 대비 검증
- 반응형 색상 디스플레이

### **MCP 도구들**

- **Sequential-Thinking**: 색상 이론 알고리즘 및 생성 로직 설계
- **Shrimp Task Manager**: 프로젝트 관리 및 기능 분해
- **Context7**: 검증된 호환 라이브러리 (vibrant.js, colormind API)
- **Filesystem**: 색상 알고리즘 및 팔레트 엔진
- **shadcn-ui**: 색상 인터페이스 컴포넌트 (호환성 검증된 것만)
- **Magic UI**: 색상 변화 애니메이션 및 시각 효과 (호환성 검증된 것만)
- **Playwright**: 색상 생성 및 접근성 테스트
- **GitHub**: 버전 관리 및 Vercel 배포

---

## Phase 1: 프로젝트 기반 설정

### **1단계: 아키텍처 설계 (Sequential-Thinking)**

````
Using Sequential-Thinking, design comprehensive architecture:

Requirements:
- React + TypeScript + Tailwind CSS + Vite
- 키워드 기반 색상 생성 시스템
- Colormind API (무료, 무제한)
- TheColorAPI (무료 대안)
- 로컬 색상 이론 알고리즘 (완전 오프라인)
- vibrant.js 이미지 색상 추출
- 5가지 색상 조화 규칙 (보색, 유사색, 삼색조, 사색조, 단색조)
- Hugging Face 색상 모델 (선택사항)
- WCAG 접근성 검증

핵심 알고리즘 설계:
```javascript
const generatePalette = (keyword, harmonyType = 'complementary') => {
  // 1. 키워드 → 기본 색상 매핑 (감정/의미 기반)
  const baseHue = mapKeywordToHue(keyword);
  const baseSaturation = determineBaseSaturation(keyword);
  const baseLightness = determineBaseLightness(keyword);

  // 2. HSL 기본 색상 생성
  const baseColor = { h: baseHue, s: baseSaturation, l: baseLightness };

  // 3. 선택된 조화 규칙 적용
  let harmonyColors = [];
  switch(harmonyType) {
    case 'complementary': // 보색: 180도 대각
      harmonyColors = generateComplementary(baseColor);
      break;
    case 'analogous': // 유사색: ±30도 인접
      harmonyColors = generateAnalogous(baseColor);
      break;
    case 'triadic': // 삼색조: 120도 간격
      harmonyColors = generateTriadic(baseColor);
      break;
    case 'tetradic': // 사색조: 90도 간격
      harmonyColors = generateTetradic(baseColor);
      break;
    case 'monochromatic': // 단색조: 명도/채도 변화
      harmonyColors = generateMonochromatic(baseColor);
      break;
  }

  // 4. WCAG 접근성 검증 및 조정
  const accessiblePalette = validateWCAGContrast(harmonyColors);

  // 5. 최종 5-6개 팔레트 최적화
  return optimizePaletteBalance(accessiblePalette);
};
````

Focus: 색상 이론 정확성과 접근성 우선 설계

```

### **2단계: 프로젝트 관리 설정 (Shrimp Task Manager)**
```

Using Shrimp Task Manager, create comprehensive PRD:

Core Features:

- 키워드 기반 색상 팔레트 자동 생성 (한국어 지원)
- Colormind API 통합 (무료, 무제한 사용)
- TheColorAPI 대안 지원 (무료)
- 로컬 색상 이론 알고리즘 (완전 오프라인)
- vibrant.js 이미지 색상 추출
- 5가지 색상 조화 규칙 완전 구현
- WCAG 접근성 검증 (AA: 4.5:1, AAA: 7:1)
- 색맹 시뮬레이션 (3가지 타입)
- 팔레트 저장 및 다양한 형식 내보내기

환경변수 요구사항:

```bash
# API Mode Configuration (필수)
VITE_API_MODE=offline
VITE_USE_MOCK_DATA=true

# Color APIs (무료)
VITE_COLORMIND_API_URL=http://colormind.io/api/
VITE_THECOLORAPI_URL=https://www.thecolorapi.com

# AI Models (선택사항)
VITE_HUGGINGFACE_TOKEN=optional
VITE_GEMINI_API_KEY=optional

# PWA Configuration
VITE_ENABLE_PWA=true
VITE_APP_NAME=AI Color Palette Generator
VITE_OFFLINE_MODE_ENABLED=true
```

ColorServiceConfig:

```typescript
interface ColorServiceConfig {
  mode: "mock" | "free" | "offline" | "custom";
  primaryAPI: "colormind" | "thecolorapi" | "local";
  apiKey?: string;
  fallbackToOffline: boolean;
  enableHuggingFace: boolean;
}
```

페이지 구성:

- 팔레트 생성기 메인 (키워드 입력 및 생성)
- 저장된 팔레트 (사용자 컬렉션)
- 색상 이론 가이드 (교육 콘텐츠)
- 이미지 색상 추출 (이미지 업로드 기능)

```

### **3단계: 검증된 기술 정보 수집 (Context7)**
```

Using Context7, research verified compatible documentation:

Priority Libraries (호환성 검증된 것만):

1. vibrant.js - React + TypeScript 이미지 색상 추출
2. Colormind API - 무료 무제한 팔레트 API
3. TheColorAPI - 색상 정보 무료 API
4. Hugging Face Transformers - 색상 모델 (선택사항)
5. shadcn/ui - 색상 선택기 컴포넌트 (호환성 우수)
6. Magic UI - 색상 애니메이션 컴포넌트 (호환성 우수)
7. Canvas API - 이미지 픽셀 데이터 처리
8. WCAG 색상 대비율 - 접근성 계산 방법

검증 기준:

- React 18+ 완전 호환성
- TypeScript 정의 포함
- 최근 1년 내 업데이트
- 공식 문서 존재
- 무료 API 제한사항 명시

```

### **4단계: 프로젝트 구조 생성 (Filesystem)**
```

Using Filesystem, create optimized project structure:

ai-color-palette-generator/
├── public/
│ ├── manifest.json
│ ├── sw.js
│ ├── icons/
│ └── sample-images/
├── src/
│ ├── components/
│ │ ├── ui/ # shadcn/ui (호환성 검증)
│ │ │ ├── button.tsx
│ │ │ ├── input.tsx
│ │ │ ├── card.tsx
│ │ │ ├── slider.tsx
│ │ │ ├── select.tsx
│ │ │ └── color-picker.tsx
│ │ ├── magicui/ # Magic UI (호환성 검증)
│ │ │ ├── color-transition.tsx
│ │ │ ├── palette-reveal.tsx
│ │ │ ├── color-wheel.tsx
│ │ │ └── harmony-visualizer.tsx
│ │ ├── color/ # 색상 컴포넌트 (@frontend-developer)
│ │ │ ├── palette-generator.tsx
│ │ │ ├── color-swatch.tsx
│ │ │ ├── harmony-selector.tsx
│ │ │ ├── image-extractor.tsx
│ │ │ ├── accessibility-checker.tsx
│ │ │ └── saved-palettes.tsx
│ │ └── common/
│ │ ├── loading-spinner.tsx
│ │ ├── error-boundary.tsx
│ │ └── api-status.tsx
│ ├── pages/ # 페이지 (@frontend-developer)
│ │ ├── generator.tsx # 팔레트 생성기 메인
│ │ ├── saved.tsx # 저장된 팔레트
│ │ ├── theory.tsx # 색상 이론 가이드
│ │ └── extract.tsx # 이미지 색상 추출
│ ├── services/ # API 및 색상 서비스
│ │ ├── freeAIService.ts # 통합 서비스 (AIServiceConfig 포함)
│ │ ├── colorService.ts
│ │ ├── colormindAPI.ts
│ │ ├── theColorAPI.ts
│ │ ├── huggingFaceAPI.ts
│ │ └── localColorEngine.ts
│ ├── algorithms/ # 색상 알고리즘
│ │ ├── colorTheory.ts # 색상 이론 계산
│ │ ├── harmonyGenerator.ts # 5가지 조화 규칙
│ │ ├── keywordMapper.ts # 키워드-색상 매핑 (한국어)
│ │ ├── accessibilityChecker.ts # WCAG 검증
│ │ └── imageColorExtractor.ts # vibrant.js 래핑
│ ├── utils/
│ │ ├── storage.ts
│ │ ├── colorConversion.ts # HSL/RGB/HEX 변환
│ │ ├── exportUtils.ts # 팔레트 내보내기
│ │ └── errorHandler.ts
│ ├── hooks/ # 커스텀 훅
│ │ ├── useColorGeneration.ts
│ │ ├── useImageUpload.ts
│ │ ├── usePaletteStorage.ts
│ │ └── useAccessibility.ts
│ ├── types/
│ │ ├── color.ts
│ │ ├── palette.ts
│ │ ├── api.ts
│ │ └── harmony.ts
│ └── data/
│ ├── color-keywords.json # 한국어 키워드 매핑
│ ├── harmony-rules.json # 조화 규칙 정의
│ └── accessibility-standards.json
├── .env.example # 모든 환경변수 포함
├── vite.config.ts # 색상 라이브러리 최적화
└── package.json # vibrant.js 등 모든 의존성

Korean comments throughout codebase.

```

---

## Phase 2: 색상 알고리즘 및 API 통합

### **5단계: 색상 이론 및 번역 엔진 구현 (Filesystem)**
```

Using Filesystem, implement comprehensive color algorithms:

1. algorithms/colorTheory.ts - 색상 이론 핵심 계산

```typescript
// 색상 이론 기반 팔레트 생성 엔진 (완전 오프라인)
export class ColorTheory {
  // HSL 색공간에서 5가지 조화 규칙 구현

  // 보색 (Complementary): 180도 대각
  generateComplementary(baseColor: HSLColor): HSLColor[] {
    const complementHue = (baseColor.h + 180) % 360;
    return [
      baseColor,
      { h: complementHue, s: baseColor.s, l: baseColor.l },
      // 중간 톤 추가로 5-6개 완성
      { h: baseColor.h, s: baseColor.s * 0.7, l: baseColor.l + 20 },
      { h: complementHue, s: baseColor.s * 0.7, l: baseColor.l + 20 },
      { h: baseColor.h, s: baseColor.s * 0.3, l: 90 },
    ];
  }

  // 유사색 (Analogous): ±30도 인접
  generateAnalogous(baseColor: HSLColor): HSLColor[] {
    return [
      { h: (baseColor.h - 60) % 360, s: baseColor.s, l: baseColor.l },
      { h: (baseColor.h - 30) % 360, s: baseColor.s, l: baseColor.l },
      baseColor,
      { h: (baseColor.h + 30) % 360, s: baseColor.s, l: baseColor.l },
      { h: (baseColor.h + 60) % 360, s: baseColor.s, l: baseColor.l },
    ];
  }

  // 삼색조 (Triadic): 120도 간격
  generateTriadic(baseColor: HSLColor): HSLColor[] {
    return [
      baseColor,
      { h: (baseColor.h + 120) % 360, s: baseColor.s, l: baseColor.l },
      { h: (baseColor.h + 240) % 360, s: baseColor.s, l: baseColor.l },
      // 추가 톤으로 6개 완성
    ];
  }

  // 사색조 (Tetradic): 90도 간격
  generateTetradic(baseColor: HSLColor): HSLColor[] {
    return [
      baseColor,
      { h: (baseColor.h + 90) % 360, s: baseColor.s, l: baseColor.l },
      { h: (baseColor.h + 180) % 360, s: baseColor.s, l: baseColor.l },
      { h: (baseColor.h + 270) % 360, s: baseColor.s, l: baseColor.l },
    ];
  }

  // 단색조 (Monochromatic): 명도/채도 변화
  generateMonochromatic(baseColor: HSLColor): HSLColor[] {
    return [
      { h: baseColor.h, s: baseColor.s, l: 20 }, // 어두운
      { h: baseColor.h, s: baseColor.s, l: 40 },
      baseColor, // 기본
      { h: baseColor.h, s: baseColor.s, l: 70 },
      { h: baseColor.h, s: baseColor.s, l: 90 }, // 밝은
    ];
  }
}
```

2. algorithms/keywordMapper.ts - 한국어 키워드 → 색상 매핑

```typescript
// 한국어 키워드 기반 색상 매핑 시스템
export class KeywordMapper {
  private keywordColorMap = {
    // 감정 기반
    평온함: { h: 200, s: 70, l: 60 }, // 파란색 계열
    열정: { h: 0, s: 80, l: 50 }, // 빨간색 계열
    행복: { h: 50, s: 90, l: 60 }, // 노란색 계열
    자연: { h: 120, s: 60, l: 40 }, // 녹색 계열
    신뢰: { h: 220, s: 70, l: 50 }, // 파란색 계열

    // 자연 기반
    숲: { h: 120, s: 80, l: 30 }, // 진한 녹색
    바다: { h: 200, s: 90, l: 40 }, // 바다 파랑
    하늘: { h: 210, s: 70, l: 70 }, // 하늘 파랑
    노을: { h: 15, s: 85, l: 60 }, // 주황색 계열
    꽃: { h: 320, s: 70, l: 70 }, // 핑크 계열

    // 계절 기반
    봄: { h: 100, s: 60, l: 70 }, // 연두색
    여름: { h: 180, s: 80, l: 50 }, // 청록색
    가을: { h: 30, s: 70, l: 50 }, // 갈색/주황
    겨울: { h: 210, s: 30, l: 80 }, // 연한 파랑

    // 추상 기반
    에너지: { h: 45, s: 100, l: 50 }, // 주황/노랑
    미니멀: { h: 0, s: 0, l: 95 }, // 거의 흰색
    럭셔리: { h: 280, s: 60, l: 30 }, // 진한 보라
  };

  mapKeywordToColor(keyword: string): HSLColor {
    // 직접 매핑 확인
    if (this.keywordColorMap[keyword]) {
      return this.keywordColorMap[keyword];
    }

    // 유사 키워드 검색 (한국어 형태소 분석)
    const similarKeyword = this.findSimilarKeyword(keyword);
    if (similarKeyword) {
      return this.keywordColorMap[similarKeyword];
    }

    // 기본 색상 반환
    return { h: 200, s: 60, l: 60 }; // 중성 파랑
  }
}
```

3. algorithms/accessibilityChecker.ts - WCAG 접근성 검증
4. algorithms/imageColorExtractor.ts - vibrant.js 통합
5. services/colorService.ts - 통합 색상 서비스

Key Features:

- 모든 주석 한글로 작성
- Colormind API 무제한 무료 활용
- 완전 오프라인 색상 생성 가능
- 한국어 키워드 최적화
- WCAG 접근성 완전 준수

```

### **6단계: API 통합 및 이미지 처리 (Filesystem)**
```

Using Filesystem, implement API integration and image processing:

1. services/colorService.ts - 다중 API 통합

```typescript
// 다중 색상 API 통합 서비스 (무료 API 우선)
export class ColorService {
  constructor(private config: ColorServiceConfig) {}

  async generatePalette(keyword: string, harmonyType: string) {
    try {
      // 1차: Colormind API (무제한 무료, 머신러닝 기반)
      if (this.config.primaryAPI === "colormind") {
        return await this.colormindGenerate(keyword, harmonyType);
      }

      // 2차: TheColorAPI (무료)
      if (this.config.primaryAPI === "thecolorapi") {
        return await this.theColorGenerate(keyword);
      }
    } catch (error) {
      // 3차: 로컬 알고리즘 폴백 (완전 오프라인)
      console.log("API 실패, 로컬 모드로 전환:", error.message);
      return await this.localGenerate(keyword, harmonyType);
    }
  }

  // Colormind: 무제한 무료, AI 기반 팔레트
  private async colormindGenerate(keyword: string, harmonyType: string) {
    const response = await fetch("http://colormind.io/api/", {
      method: "POST",
      body: JSON.stringify({ model: "default" }),
    });
    // Colormind 응답 처리 후 조화 규칙 적용
  }

  // 로컬 알고리즘: 완전 오프라인, 색상 이론 기반
  private async localGenerate(keyword: string, harmonyType: string) {
    const keywordMapper = new KeywordMapper();
    const colorTheory = new ColorTheory();

    const baseColor = keywordMapper.mapKeywordToColor(keyword);
    return colorTheory.generateHarmony(baseColor, harmonyType);
  }
}
```

2. algorithms/imageColorExtractor.ts - vibrant.js 완전 통합

```typescript
// vibrant.js 기반 이미지 주요 색상 추출 (완전 오프라인)
import Vibrant from "node-vibrant";

export class ImageColorExtractor {
  async extractPalette(imageFile: File): Promise<ExtractedPalette> {
    try {
      // 1. 이미지를 Canvas로 로드
      const canvas = await this.loadImageToCanvas(imageFile);

      // 2. vibrant.js로 6가지 주요 색상 추출
      const palette = await Vibrant.from(canvas).getPalette();

      // 3. 추출된 색상을 HSL로 변환하여 반환
      return {
        vibrant: this.rgbToHsl(palette.Vibrant?.rgb || [0, 0, 0]),
        muted: this.rgbToHsl(palette.Muted?.rgb || [100, 100, 100]),
        darkVibrant: this.rgbToHsl(palette.DarkVibrant?.rgb || [0, 0, 0]),
        darkMuted: this.rgbToHsl(palette.DarkMuted?.rgb || [50, 50, 50]),
        lightVibrant: this.rgbToHsl(
          palette.LightVibrant?.rgb || [255, 255, 255]
        ),
        lightMuted: this.rgbToHsl(palette.LightMuted?.rgb || [200, 200, 200]),
      };
    } catch (error) {
      console.error("이미지 색상 추출 실패:", error.message);
      return this.getDefaultPalette();
    }
  }

  // 파일을 Canvas로 안전하게 로드
  private async loadImageToCanvas(file: File): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        resolve(canvas);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
}
```

3. algorithms/accessibilityChecker.ts - WCAG 완전 구현
4. utils/colorConversion.ts - HSL/RGB/HEX 변환
5. services/freeAIService.ts - AIServiceConfig 구현

Service Features:

- Colormind API 무제한 무료 활용
- TheColorAPI 무료 대안 지원
- 완전 오프라인 이미지 색상 추출
- 실시간 접근성 검증
- 한국어 에러 메시지
- API 실패시 자동 로컬 모드 전환

```

---

## Phase 3: UI 컴포넌트 구축

### **7단계: shadcn/ui 색상 컴포넌트 설정**
```

Using shadcn-ui, set up color-optimized components (호환성 검증된 것만):

Essential Components:

- Button, Input, Label (색상 생성 및 제어)
- Card, Badge (색상 스와치 및 정보)
- Slider (HSL 값 실시간 조정)
- Select, Tabs (조화 규칙 선택)
- Dialog, Alert (팔레트 저장, 접근성 경고)
- Tooltip (색상 정보 및 대비율 표시)

Color Theme:

- Primary: #3b82f6 (팔레트 블루)
- Secondary: #10b981 (조화 그린)
- Accent: #8b5cf6 (크리에이티브 퍼플)
- Warning: #f59e0b (대비 경고)

Component Variants:

- 색상 스와치 전용 카드
- 그라데이션 배경 지원
- 접근성 인디케이터
- 색상 코드 복사 버튼

```

### **8단계: Magic UI 색상 애니메이션**
```

Using Magic UI, create color animations (호환성 검증된 것만):

Animation Components:

- ColorTransition: 색상 간 부드러운 전환
- HarmonyVisualizer: 색상환에서 조화 관계 애니메이션
- PaletteReveal: 팔레트 생성시 순차 등장 효과
- AccessibilityIndicator: 대비율 변화 실시간 피드백
- ColorMixer: 색상 혼합 시각적 효과

Performance Requirements:

- 60fps 색상 전환
- 하드웨어 가속 활용
- 모션 감소 접근성 지원
- 배터리 효율 최적화

```

---

## Phase 4: 색상 인터페이스 개발 (Frontend Agent 주도)

### **9단계: 팔레트 생성 및 키워드 인터페이스**
```

@frontend-developer Create comprehensive palette generation interface:

1. components/color/palette-generator.tsx - 메인 생성 인터페이스

   - shadcn/ui Input으로 한국어 키워드 입력
   - 5가지 조화 규칙 선택 (보색, 유사색, 삼색조, 사색조, 단색조)
   - Magic UI 애니메이션으로 생성 과정 시각화
   - Colormind/TheColorAPI/로컬 알고리즘 실시간 전환
   - 생성된 팔레트 즉시 미리보기

2. components/color/harmony-selector.tsx - 조화 규칙 선택

   - shadcn/ui Tabs로 5가지 규칙 분류
   - Magic UI 색상환으로 관계 시각화
   - 각 규칙별 한국어 설명 및 예시
   - 실시간 조화 적용 미리보기

3. components/color/color-swatch.tsx - 색상 스와치

   - shadcn/ui Card 기반 개별 색상 표시
   - HEX, RGB, HSL 코드 표시 및 원클릭 복사
   - WCAG 대비율 실시간 표시
   - Magic UI 호버 애니메이션

4. components/color/keyword-suggestions.tsx - 키워드 추천
   - 인기 한국어 키워드 (감정, 자연, 계절)
   - 자동완성 기능
   - 카테고리별 분류 및 검색

Technical Requirements:

- TypeScript 완전 지원
- Colormind API 무제한 활용
- 오프라인 색상 생성 폴백
- WCAG 접근성 준수
- 모바일 터치 최적화

한국어 키워드 데이터베이스 구축 및 직관적 색상 생성 경험 구현.

```

### **10단계: 이미지 색상 추출 시스템**
```

@frontend-developer Create comprehensive image color extraction system:

1. components/color/image-extractor.tsx - 이미지 업로드 및 추출

   - shadcn/ui 드래그앤드롭 업로드 인터페이스
   - vibrant.js 통합으로 6가지 주요 색상 자동 감지
   - Magic UI로 색상 추출 과정 실시간 애니메이션
   - JPG, PNG, WebP 다양한 형식 지원
   - 추출 진행률 및 결과 표시

2. components/color/extracted-palette.tsx - 추출 색상 표시

   - 이미지에서 추출한 색상들을 팔레트로 구성
   - 각 색상의 이미지 내 점유율 표시
   - 추출 색상 기반 조화 팔레트 자동 생성
   - 색상 순서 드래그로 재배열

3. hooks/useImageUpload.ts - 이미지 처리 로직

   - 파일 유효성 검사 및 크기 최적화
   - Canvas API로 이미지 전처리
   - vibrant.js 색상 추출 처리
   - 에러 처리 및 로딩 상태 관리

4. components/color/color-dominance.tsx - 색상 분포 분석
   - 추출된 색상의 점유율 차트
   - Magic UI 차트 애니메이션
   - HSL 값 상세 분석
   - 이미지 전체 색조 통계

Features:

- 완전 오프라인 이미지 처리 (vibrant.js)
- 프라이버시 보장 (로컬 처리)
- 모바일 카메라 촬영 지원
- 실시간 색상 분석 및 팔레트 생성

```

### **11단계: 접근성 검증 및 색상 이론 가이드**
```

@frontend-developer Create accessibility validation and color theory guide:

1. components/color/accessibility-checker.tsx - WCAG 접근성 검증

   - 생성된 팔레트의 모든 색상 조합 대비율 계산
   - WCAG AA(4.5:1), AAA(7:1) 기준 실시간 표시
   - shadcn/ui Progress로 접근성 점수 시각화
   - 문제 조합 하이라이트 및 개선 제안
   - 대체 색상 자동 추천

2. components/color/contrast-simulator.tsx - 색맹 시뮬레이션

   - 3가지 색맹 타입 시뮬레이션 (적록색맹, 청황색맹, 완전색맹)
   - Magic UI로 색상 변화 부드러운 애니메이션
   - 색맹 사용자 관점 팔레트 미리보기
   - 색맹 친화적 팔레트 제안

3. pages/theory.tsx - 색상 이론 교육 페이지

   - 5가지 조화 규칙 시각적 설명 (한국어)
   - 인터랙티브 색상환 (Magic UI)
   - HSL, RGB 색공간 이해 도구
   - 색상 심리학 및 브랜딩 활용 사례
   - 문화적 색상 의미 (한국 중심)

4. components/color/color-wheel.tsx - 인터랙티브 색상환

   - Magic UI 기반 360도 회전 가능한 색상환
   - 선택된 조화 규칙 실시간 시각화
   - 마우스/터치로 색상 직접 선택
   - 각도 및 색상 관계 수치 표시

5. components/color/export-options.tsx - 다양한 내보내기
   - CSS Variables, SCSS, JSON 형식
   - Adobe ASE, Sketch 팔레트 파일
   - PNG 이미지로 팔레트 저장
   - 클립보드 복사 및 파일 다운로드

Features:

- WCAG 완전 준수 접근성 검증
- 실시간 색상 대비율 계산
- 색맹 접근성 완전 고려
- 한국어 색상 이론 교육
- 디자이너 친화적 내보내기

```

### **12단계: 팔레트 저장 및 관리 시스템**
```

@frontend-developer Create comprehensive palette storage and management:

1. pages/saved.tsx - 저장된 팔레트 관리

   - localStorage 기반 팔레트 컬렉션
   - shadcn/ui Card 그리드 레이아웃
   - 팔레트 이름, 생성일, 태그 표시
   - Magic UI 호버 애니메이션
   - 검색 및 카테고리 필터링

2. components/color/saved-palettes.tsx - 팔레트 컬렉션

   - 사용자 생성 팔레트 목록
   - 즐겨찾기 및 태그 시스템
   - 팔레트 복사, 편집, 삭제
   - 키워드 및 조화 규칙별 분류

3. components/color/palette-editor.tsx - 팔레트 편집기

   - 개별 색상 HSL 슬라이더 조정
   - 색상 추가/삭제 및 순서 변경
   - 실시간 접근성 검증
   - 편집 히스토리 (되돌리기/다시하기)

4. hooks/usePaletteStorage.ts - 저장소 관리

   - localStorage CRUD 작업
   - 데이터 압축 및 백업
   - 용량 관리 및 자동 정리
   - 팔레트 import/export

5. components/color/palette-analytics.tsx - 사용 통계

   - 자주 사용하는 색상 분석
   - 생성 패턴 시각화
   - 선호 조화 규칙 통계
   - Magic UI 차트 및 인사이트

6. components/common/api-status.tsx - API 상태 모니터링
   - Colormind/TheColorAPI 연결 상태
   - 현재 모드 표시 (무료/오프라인)
   - 응답 시간 및 성공률
   - 오프라인 모드 전환 가이드

Features:

- 무제한 팔레트 저장 (localStorage)
- 팔레트 편집 및 버전 관리
- 사용 패턴 분석
- 크로스 디바이스 백업 지원

```

---

## Phase 5: 테스트 및 성능 최적화

### **13단계: Playwright 자동화 테스트**
```

Using Playwright, create comprehensive E2E test suite:

1. tests/e2e/palette-generation.spec.ts - 핵심 기능 테스트

   - 한국어 키워드 → 팔레트 생성 플로우
   - 5가지 조화 규칙 정확성 검증
   - API 모드별 결과 비교 (Colormind/TheColorAPI/로컬)
   - 생성 시간 및 색상 정확도 측정

2. tests/e2e/image-extraction.spec.ts - 이미지 처리 테스트

   - 다양한 형식 이미지 업로드 테스트
   - vibrant.js 색상 추출 정확성 검증
   - 대용량 이미지 처리 성능 확인
   - 추출 결과 팔레트 생성 테스트

3. tests/e2e/accessibility-validation.spec.ts - 접근성 테스트

   - WCAG 대비율 계산 정확성
   - 색맹 시뮬레이션 정확도
   - 키보드 네비게이션 완전성
   - 스크린 리더 호환성

4. tests/e2e/api-fallback.spec.ts - API 폴백 테스트

   - 네트워크 장애시 로컬 모드 전환
   - 각 API 실패 상황 시뮬레이션
   - 에러 메시지 및 복구 과정
   - 오프라인 모드 완전성

5. tests/performance/color-generation.spec.ts - 성능 테스트
   - 팔레트 생성 속도 (목표: <2초)
   - 이미지 색상 추출 속도 (목표: <3초)
   - 메모리 사용량 모니터링
   - 대량 팔레트 처리 성능

Coverage Target: 85% 이상

```

### **14단계: 성능 최적화 (Sequential-Thinking)**
```

Using Sequential-Thinking, design performance optimization:

Optimization Areas:

1. 색상 계산 최적화

   - HSL/RGB 변환 알고리즘 최적화
   - 조화 계산 결과 캐싱
   - Web Workers 백그라운드 처리
   - 메모리 효율적 색상 데이터 구조

2. 이미지 처리 최적화

   - Canvas API 성능 튜닝
   - 이미지 리사이징 최적화
   - vibrant.js 성능 개선
   - 청크 단위 대용량 이미지 처리

3. UI 렌더링 최적화
   - React.memo 색상 컴포넌트 최적화
   - useMemo 색상 계산 캐싱
   - 가상화로 대량 팔레트 표시
   - CSS GPU 가속 활용

Performance Budget:

- 팔레트 생성: <2초
- 이미지 색상 추출: <3초 (5MB 기준)
- 페이지 로드: <2초
- 색상 변환: <100ms

Memory Management:

- 색상 히스토리 자동 정리
- 이미지 메모리 해제
- 가비지 컬렉션 최적화

```

---

## Phase 6: PWA 및 배포

### **15단계: PWA 색상 도구 구현 (Filesystem)**
```

Using Filesystem, implement PWA for color tools:

1. public/manifest.json - 색상 도구 앱 매니페스트

```json
{
  "name": "AI 색상 팔레트 생성기",
  "short_name": "ColorPal AI",
  "description": "키워드와 이미지 기반 AI 색상 팔레트 생성 도구",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "categories": ["design", "utilities", "graphics"],
  "lang": "ko",
  "shortcuts": [
    {
      "name": "새 팔레트 생성",
      "url": "/generator",
      "icons": [{ "src": "/icons/new-palette.png", "sizes": "96x96" }]
    },
    {
      "name": "이미지 색상 추출",
      "url": "/extract",
      "icons": [{ "src": "/icons/extract.png", "sizes": "96x96" }]
    }
  ]
}
```

2. public/sw.js - Service Worker

   - 생성된 팔레트 오프라인 캐싱
   - 색상 알고리즘 라이브러리 캐싱
   - 이미지 처리 결과 임시 저장
   - 완전 오프라인 색상 도구 지원

3. src/utils/pwa-color-utils.ts - PWA 헬퍼
   - 네이티브 파일 시스템 API
   - 색상 데이터 백그라운드 동기화
   - 오프라인 상태 감지
   - 앱 설치 프롬프트

```

### **16단계: GitHub 저장소 설정 (GitHub)**
```

Using GitHub, setup repository with CI/CD:

Repository Setup:

- ai-color-palette-generator
- MIT License (오픈소스 색상 도구)
- 한국어/영어 README.md

GitHub Actions:

- color-algorithm-test.yml: 색상 이론 정확성 검증
- accessibility-test.yml: WCAG 접근성 자동 테스트
- performance-test.yml: 색상 생성 성능 벤치마크
- deploy.yml: Vercel 자동 배포

Validation Tests:

- 색상 조화 규칙 수학적 정확성
- WCAG 대비율 계산 정확성
- vibrant.js 일관성 확인
- 크로스 브라우저 색상 표시

Issue Templates:

- 색상 알고리즘 개선
- 새 조화 규칙 추가
- 접근성 이슈
- 키워드 매핑 요청

```

### **17단계: Vercel 배포 최적화**
```

@frontend-developer Configure optimized Vercel deployment:

1. vercel.json - 색상 도구 배포 설정

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]
    }
  ],
  "env": {
    "VITE_API_MODE": "free",
    "VITE_ENABLE_PWA": "true"
  }
}
```

2. 환경변수 관리:

   - Production: VITE_API_MODE=free (Colormind/TheColorAPI)
   - Preview: VITE_API_MODE=offline
   - Development: VITE_USE_MOCK_DATA=true

3. vite.config.ts 최적화:

   - vibrant.js 번들링 최적화
   - Canvas API polyfill 설정
   - Web Worker 색상 계산 설정
   - 코드 분할 및 지연 로딩

4. 성능 최적화:
   - 색상 라이브러리 CDN 활용
   - 이미지 처리 최적화
   - 색상 데이터 압축
   - 캐싱 전략

Production URL: https://ai-color-palette-generator.vercel.app

```

---

## Phase 7: 검증 및 문서화

### **18단계: 통합 테스트 (Playwright + Frontend Agent)**
```

Comprehensive integration testing:

1. 색상 생성 시나리오:

   - 한국어/영어 키워드 → 팔레트 생성
   - 5가지 조화 규칙 정확성 검증
   - API 모드별 결과 품질 비교
   - 생성 시간 및 정확도 측정

2. 이미지 색상 추출:

   - 다양한 이미지 형식 처리 테스트
   - vibrant.js 추출 정확도 검증
   - 대용량 이미지 성능 테스트
   - 추출 결과 팔레트 품질 확인

3. 접근성 검증:

   - WCAG 대비율 계산 정확성
   - 색맹 시뮬레이션 정확도
   - 키보드 네비게이션 완전성
   - 스크린 리더 호환성

4. API 통합 테스트:

   - Colormind API 무제한 활용
   - TheColorAPI 대안 동작
   - 로컬 알고리즘 오프라인 처리
   - 폴백 체인 안정성

5. Lighthouse 성능 목표:
   - Performance: 90+
   - Accessibility: 95+ (색상 도구 중요)
   - Best Practices: 90+
   - PWA: 95+

```

### **19단계: 종합 문서화 (Filesystem)**
```

Using Filesystem, create comprehensive documentation:

1. README.md - 프로젝트 개요

   - AI 색상 팔레트 생성 기능 소개
   - 지원하는 색상 이론 및 조화 규칙
   - 키워드 매핑 시스템 (한국어 중심)
   - 이미지 색상 추출 기능

2. docs/USER_GUIDE.md - 사용자 매뉴얼 (한국어)

   - 키워드 기반 팔레트 생성 방법
   - 이미지 색상 추출 활용법
   - 접근성 검증 및 개선 방법
   - 팔레트 저장 및 내보내기

3. docs/COLOR_THEORY.md - 색상 이론 가이드

   - 5가지 조화 규칙 상세 설명 (한국어)
   - HSL, RGB 색공간 이해
   - 색상 심리학 및 브랜딩 활용
   - 문화적 색상 의미 (한국 중심)

4. docs/ACCESSIBILITY.md - 접근성 가이드

   - WCAG 색상 대비율 기준
   - 색맹 접근성 고려사항
   - 접근 가능한 팔레트 디자인
   - 색상 대체 텍스트 활용

5. docs/API_USAGE.md - API 및 알고리즘

   - Colormind/TheColorAPI 통합
   - 로컬 색상 알고리즘 구현
   - vibrant.js 최적화 방법
   - 색상 데이터 구조

6. docs/DEVELOPMENT.md - 개발 가이드

   - 로컬 개발 환경 설정
   - 색상 라이브러리 설치
   - 새 조화 규칙 추가 방법
   - 테스트 실행 및 디버깅

7. docs/DEPLOYMENT.md - 배포 가이드
   - Vercel 배포 설정 최적화
   - PWA 설정 및 검증
   - 성능 모니터링
   - 색상 생성 품질 관리

All documentation in Korean with visual examples.

```

---

## 최종 체크리스트

### **🎯 완성도 검증 (모든 요구사항 100% 포함):**

**✅ 핵심 기능 요구사항 (6개 모두):**
- [ ] 키워드 기반 색상 생성 (한국어 매핑)
- [ ] Colormind API (무료, 무제한)
- [ ] 로컬 색상 이론 알고리즘 (완전 오프라인)
- [ ] vibrant.js 이미지 색상 추출
- [ ] 5가지 색상 조화 규칙 (보색, 유사색, 삼색조, 사색조, 단색조)
- [ ] Hugging Face 색상 모델 (선택사항)

**✅ 색상 생성 로직:**
- [ ] 키워드 → 색상 매핑 사전 (한국어)
- [ ] HSL 색공간 조화 계산
- [ ] 색상 이론 규칙 적용
- [ ] generatePalette() 함수 완전 구현

**✅ 무료 API:**
- [ ] Colormind API (무제한 무료)
- [ ] TheColorAPI (무료 대안)
- [ ] 완전 로컬 처리 가능

**✅ 페이지 구성 (4페이지):**
- [ ] 팔레트 생성기 메인
- [ ] 저장된 팔레트
- [ ] 색상 이론 가이드
- [ ] 이미지 색상 추출

**✅ 접근성 체크 로직:**
- [ ] WCAG AA/AAA 대비율 검증
- [ ] 색맹 시뮬레이션 (3타입)
- [ ] 접근성 개선 제안
- [ ] 키보드 네비게이션

**✅ 추가 요구사항 (11개 모두):**
- [ ] Vite 프로젝트 세팅
- [ ] 환경변수 (.env.example)
- [ ] API 서비스 레이어 (Mock/Free/Offline/Custom)
- [ ] services/freeAIService.ts (AIServiceConfig 포함)
- [ ] localStorage 할당량 추적
- [ ] API 실패시 오프라인 폴백
- [ ] 반응형 디자인
- [ ] PWA 지원
- [ ] 한글 지원 (키워드 매핑 포함)
- [ ] Vercel 배포 설정
- [ ] 한글 주석, 무료 API 제한사항 명시

**✅ Context7/shadcn/Magic UI 호환성:**
- [ ] 검증된 라이브러리만 사용
- [ ] shadcn/ui 호환성 확인된 컴포넌트
- [ ] Magic UI 호환성 확인된 애니메이션

---

**🎯 완성 결과물:**
완전 무료 운영 가능한 전문가급 AI 색상 팔레트 생성기
- 키워드와 이미지 모두 지원
- 완벽한 접근성 검증 (WCAG 완전 준수)
- 5가지 색상 조화 규칙 구현
- 한국어 키워드 최적화
- PWA 오프라인 지원

**예상 개발 일정:** 2-3주 (1명 개발자)
**기술 난이도:** 중급 (색상 이론 + 이미지 처리)

**모든 요구사항이 100% 포함된 완전한 워크플로우입니다! 🎨✨**
```
