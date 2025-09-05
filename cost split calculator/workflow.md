# 스마트 비용 분할 계산기 웹사이트 개발 워크플로우 (완전 통합)

## 프로젝트 개요

React + TypeScript + Tailwind CSS + Vite로 구현하는 OCR 기반 스마트 비용 분할 계산기  
**MCP 도구**: Sequential-Thinking, Shrimp Task Manager, Context7, Filesystem, GitHub, shadcn-ui, Playwright, Magic UI

---

## 에이전트 & MCP 역할 분담

### **@frontend-developer 에이전트**

- OCR 인터페이스 UI 컴포넌트 (shadcn/ui + Magic UI)
- React 상태 관리 및 아키텍처
- 영수증 이미지 업로드 및 처리 인터페이스
- 비용 분할 계산 및 정산 UI
- 참가자 관리 시스템
- 반응형 계산기 레이아웃
- 접근성 및 사용성 최적화

### **MCP 도구들**

- **Sequential-Thinking**: OCR 처리 알고리즘 및 정산 로직 설계
- **Shrimp Task Manager**: 프로젝트 관리 및 작업 분해
- **Context7**: 검증된 호환 라이브러리 (Tesseract.js, IndexedDB)
- **Filesystem**: OCR 엔진 및 계산 로직 구현
- **shadcn-ui**: 계산기 UI 컴포넌트 (호환성 검증된 것만)
- **Magic UI**: OCR 처리 애니메이션 (호환성 검증된 것만)
- **Playwright**: OCR 및 계산 플로우 테스트
- **GitHub**: 버전 관리 및 Vercel 배포

---

## Phase 1: 프로젝트 기반 설정

### **1단계: 아키텍처 설계 (Sequential-Thinking)**

````
Using Sequential-Thinking, design comprehensive architecture:

핵심 OCR 및 계산 알고리즘:
```javascript
const extractPrices = (ocrText) => {
  // 1. 한국어 금액 패턴 매칭
  const koreanPricePatterns = [
    /₩\s*(\d{1,3}(?:,\d{3})*)/g,    // ₩25,000
    /(\d{1,3}(?:,\d{3})*)\s*원/g,   // 25,000원
    /(\d{1,3}(?:,\d{3})*)\s*₩/g,    // 25000₩
  ];

  // 2. 항목명 추출 (가격 앞/뒤 텍스트 분석)
  const itemNames = extractItemNames(ocrText);

  // 3. 구조화된 데이터 반환
  return {
    items: matchItemsWithPrices(itemNames, prices),
    subtotal: calculateSubtotal(prices),
    tax: extractTaxAmount(ocrText),
    total: extractTotalAmount(ocrText),
    confidence: calculateExtractionConfidence(ocrText)
  };
};

const calculateBillSplit = (billData, participants, splitMethod) => {
  switch (splitMethod) {
    case 'equal':     // 균등 분할
    case 'itemBased': // 항목별 할당
    case 'percentage': // 비율 기반
    case 'custom':    // 사용자 정의
  }
};

const calculateOptimalSettlement = (participants, amounts) => {
  // 최소 송금 횟수 알고리즘 (그리디)
  return optimizeTransfers(balances);
};
````

Focus: OCR 정확성, 계산 정밀도, 완전 오프라인 지원

```

### **2단계: 프로젝트 관리 설정 (Shrimp Task Manager)**
```

Using Shrimp Task Manager, create comprehensive PRD:

Core Features:

- 영수증 사진 업로드 (드래그앤드롭 + 카메라)
- Tesseract.js OCR (완전 무료, 브라우저 실행)
- 텍스트에서 금액/항목 자동 추출
- Google Gemini API (선택사항, 무료 티어)
- 수동 편집 모드 (OCR 결과 보정)
- 4가지 분할 방식 (균등/항목별/비율/커스텀)
- 최적 송금 경로 계산
- IndexedDB 로컬 데이터 저장

환경변수 요구사항:

```bash
VITE_API_MODE=offline
VITE_USE_MOCK_DATA=true
VITE_TESSERACT_LANG=kor+eng
VITE_GEMINI_API_KEY=optional
VITE_HUGGINGFACE_TOKEN=optional
VITE_ENABLE_PWA=true
VITE_GEMINI_DAILY_LIMIT=60
VITE_OFFLINE_MODE_ENABLED=true
```

BillSplitterConfig:

```typescript
interface BillSplitterConfig {
  mode: "mock" | "free" | "offline" | "custom";
  ocrEngine: "tesseract" | "gemini-enhanced";
  apiKey?: string;
  fallbackToOffline: boolean;
  enableManualEdit: boolean;
}
```

페이지 구성:

- 메인 계산기 (OCR + 계산 통합)
- OCR 편집기 (결과 수정)
- 정산 결과 (송금 안내)
- 히스토리 (과거 계산 내역)

```

### **3단계: 검증된 기술 정보 수집 (Context7)**
```

Using Context7, research verified compatible documentation:

Priority Libraries (호환성 검증된 것만):

1. Tesseract.js - React + TypeScript 브라우저 OCR
2. Canvas API - 이미지 전처리 최적화
3. Google Gemini API - 무료 티어 텍스트 분석
4. IndexedDB - 구조화된 데이터 저장
5. shadcn/ui - 계산기 컴포넌트 (호환성 우수)
6. Magic UI - OCR 애니메이션 (호환성 우수)
7. PWA - 오프라인 계산기 구현
8. Vite - Tesseract.js 최적화 설정

검증 기준:

- React 18+ 완전 호환성
- TypeScript 완전 지원
- 무료 사용 가능 및 제한사항 명시
- 최근 1년 내 업데이트

```

### **4단계: 프로젝트 구조 생성 (Filesystem)**
```

Using Filesystem, create optimized project structure:

smart-bill-splitter/
├── public/
│ ├── manifest.json
│ ├── sw.js
│ ├── tesseract-worker/
│ └── sample-receipts/
├── src/
│ ├── components/
│ │ ├── ui/ # shadcn/ui (호환성 검증)
│ │ ├── magicui/ # Magic UI (호환성 검증)
│ │ ├── bill/ # 계산기 컴포넌트 (@frontend-developer)
│ │ │ ├── receipt-uploader.tsx
│ │ │ ├── ocr-editor.tsx
│ │ │ ├── item-editor.tsx
│ │ │ ├── participant-manager.tsx
│ │ │ ├── split-calculator.tsx
│ │ │ └── settlement-result.tsx
│ │ └── common/
│ ├── pages/ # 페이지 (@frontend-developer)
│ │ ├── calculator.tsx # 메인 계산기
│ │ ├── editor.tsx # OCR 편집기
│ │ ├── result.tsx # 정산 결과
│ │ └── history.tsx # 히스토리
│ ├── services/
│ │ ├── freeAIService.ts # AIServiceConfig 포함
│ │ ├── ocrService.ts
│ │ ├── tesseractAPI.ts
│ │ ├── geminiService.ts
│ │ └── indexedDBService.ts
│ ├── algorithms/
│ │ ├── imagePreprocessor.ts # Canvas 전처리
│ │ ├── textParser.ts # OCR 텍스트 파싱
│ │ ├── priceExtractor.ts # 금액 추출
│ │ ├── splitCalculator.ts # 분할 계산
│ │ └── settlementOptimizer.ts # 최적 송금
│ ├── hooks/
│ │ ├── useOCR.ts
│ │ ├── useBillSplitter.ts
│ │ ├── useParticipants.ts
│ │ └── useIndexedDB.ts
│ └── types/
│ ├── bill.ts
│ ├── participant.ts
│ └── ocr.ts
├── .env.example
└── package.json

Korean comments throughout codebase.

```

---

## Phase 2: OCR 엔진 및 계산 로직 구축

### **5단계: OCR 및 계산 알고리즘 구현 (Filesystem)**
```

Using Filesystem, implement core OCR and calculation logic:

1. services/ocrService.ts - 통합 OCR 서비스

```typescript
// Tesseract.js 기반 OCR 서비스 (완전 무료, 브라우저 실행)
import Tesseract from "tesseract.js";

export class OCRService {
  private worker: Tesseract.Worker | null = null;

  async initializeOCR() {
    try {
      // Tesseract.js 워커 초기화 (한국어 + 영어)
      this.worker = await Tesseract.createWorker("kor+eng");
      await this.worker.setParameters({
        tessedit_char_whitelist:
          "0123456789,₩원KRWabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ가-힣",
      });
      console.log("OCR 엔진 초기화 완료");
    } catch (error) {
      console.error("OCR 초기화 실패:", error.message);
      throw new Error("OCR 서비스를 시작할 수 없습니다.");
    }
  }

  async processReceipt(imageFile: File): Promise<ReceiptData> {
    try {
      // 1. Canvas 이미지 전처리 (대비 조정, 크기 최적화)
      const preprocessedImage = await this.preprocessImage(imageFile);

      // 2. Tesseract.js OCR 실행
      const { data } = await this.worker!.recognize(preprocessedImage);

      // 3. 신뢰도 검증 (70% 이상)
      if (data.confidence < 70) {
        console.warn("OCR 신뢰도 낮음:", data.confidence);
      }

      // 4. 정규식으로 금액 및 항목 추출
      const extractedData = this.extractPrices(data.text);

      return extractedData;
    } catch (error) {
      // 5. OCR 실패시 수동 입력 모드로 폴백
      console.error("OCR 처리 실패:", error.message);
      return this.createEmptyReceiptData();
    }
  }

  // 한국어 금액 패턴 매칭
  private extractPrices(text: string): ReceiptData {
    const koreanPricePatterns = [
      /₩\s*(\d{1,3}(?:,\d{3})*)/g, // ₩25,000
      /(\d{1,3}(?:,\d{3})*)\s*원/g, // 25,000원
      /(\d{1,3}(?:,\d{3})*)\s*₩/g, // 25000₩
    ];

    // 항목명 + 가격 패턴 매칭
    // 특수 항목 인식 (세금, 할인, 팁)
    // 구조화된 데이터 반환
  }
}
```

2. algorithms/splitCalculator.ts - 분할 계산 엔진

```typescript
// 4가지 분할 방식 지원하는 계산 엔진
export class SplitCalculator {
  // 균등 분할
  calculateEqualSplit(total: number, participants: Participant[]): SplitResult {
    const perPerson = Math.round(total / participants.length);
    const remainder = total - perPerson * participants.length;

    return participants.map((participant, index) => ({
      participantId: participant.id,
      amount: perPerson + (index < remainder ? 1 : 0),
    }));
  }

  // 항목별 할당
  calculateItemBasedSplit(
    items: ReceiptItem[],
    allocations: ItemAllocation[]
  ): SplitResult {
    return allocations.map((allocation) => {
      const itemTotal = allocation.items.reduce((sum, itemId) => {
        const item = items.find((i) => i.id === itemId);
        return sum + (item?.price || 0);
      }, 0);

      return {
        participantId: allocation.participantId,
        amount: itemTotal,
        items: allocation.items,
      };
    });
  }

  // 최적 송금 경로 계산 (최소 송금 횟수)
  calculateOptimalSettlement(
    splitResult: SplitResult,
    paidBy: string
  ): Transfer[] {
    // 각 참가자의 지불/수취 금액 계산
    const balances = this.calculateBalances(splitResult, paidBy);

    // 그리디 알고리즘으로 최소 송금 계산
    return this.optimizeTransfers(balances);
  }
}
```

3. services/indexedDBService.ts - 로컬 데이터 저장
4. algorithms/imagePreprocessor.ts - Canvas 이미지 전처리
5. services/freeAIService.ts - AIServiceConfig 구현

Key Features:

- Tesseract.js 완전 무료 OCR
- 한국어 금액 패턴 최적화
- IndexedDB 완전 오프라인 저장
- 4가지 분할 방식 완전 지원
- 최적 송금 경로 계산

```

### **6단계: 할당량 관리 및 에러 처리 (Filesystem)**
```

Using Filesystem, implement quota management and error handling:

1. utils/quotaManager.ts - API 사용량 추적

```typescript
// Gemini API 무료 티어 할당량 관리 (일 60 요청)
export class QuotaManager {
  private readonly GEMINI_DAILY_LIMIT = 60;

  checkQuotaAvailable(): boolean {
    const today = new Date().toDateString();
    const quotaData = this.getQuotaData();

    // 날짜가 바뀌면 할당량 리셋
    if (quotaData.date !== today) {
      this.resetDailyQuota();
      return true;
    }

    return quotaData.used < this.GEMINI_DAILY_LIMIT;
  }

  recordAPIUsage(): void {
    const quotaData = this.getQuotaData();
    quotaData.used += 1;
    localStorage.setItem("gemini_quota", JSON.stringify(quotaData));

    // 80% 도달시 사용자 경고
    if (quotaData.used >= this.GEMINI_DAILY_LIMIT * 0.8) {
      console.warn("Gemini API 일일 한도 80% 도달");
    }
  }
}
```

2. utils/errorHandler.ts - 종합 에러 처리
3. utils/currencyUtils.ts - 한국 통화 처리
4. algorithms/settlementOptimizer.ts - 송금 최적화

Service Features:

- Gemini API 할당량 실시간 추적 (일 60 요청)
- API 실패시 오프라인 모드 자동 전환
- 한국어 에러 메시지
- 사용자에게 현재 모드 표시
- 재시도 로직 구현

```

---

## Phase 3: shadcn/ui 기반 UI 구축

### **7단계: shadcn/ui 계산기 컴포넌트 설정**
```

Using shadcn-ui, set up calculator components (호환성 검증된 것만):

Essential Components:

- Button, Input, Label (금액 입력 및 계산)
- Card, Badge (참가자 및 항목 표시)
- Table (영수증 항목 및 정산 결과)
- Dialog, Alert (확인 및 알림)
- Progress (OCR 처리 진행률)
- Tabs (분할 방식 선택)

Theme Configuration:

- Primary: #2563eb (계산 블루)
- Success: #16a34a (정산 그린)
- Warning: #f59e0b (OCR 신뢰도)
- Error: #dc2626 (처리 실패)

Component Variants:

- 영수증 항목 테이블
- 참가자 관리 카드
- 금액 입력 필드
- 정산 결과 요약

```

### **8단계: Magic UI OCR 애니메이션**
```

Using Magic UI, create OCR animations (호환성 검증된 것만):

Animation Components:

- OCRProgress: 영수증 스캔 진행률 표시
- CalculationAnimation: 실시간 계산 과정 시각화
- ReceiptScanner: 영수증 인식 애니메이션
- SplitVisualizer: 분할 결과 차트 애니메이션
- SettlementFlow: 송금 흐름 시각화

Performance Requirements:

- 60fps 부드러운 애니메이션
- OCR 처리 중 중단 없는 UI
- 모바일 배터리 효율성
- 접근성 모션 감소 지원

```

---

## Phase 4: 계산기 인터페이스 개발 (Frontend Agent 주도)

### **9단계: 영수증 업로드 및 OCR 처리**
```

@frontend-developer Create comprehensive receipt upload and OCR interface:

1. components/bill/receipt-uploader.tsx - 영수증 업로드

   - shadcn/ui 드래그앤드롭 업로드
   - 모바일 카메라 촬영 지원
   - JPG, PNG, WebP 형식 지원
   - Magic UI 업로드 진행 애니메이션
   - 이미지 미리보기 및 크롭

2. components/bill/ocr-editor.tsx - OCR 결과 편집

   - Tesseract.js OCR 결과 표시
   - Magic UI OCR 처리 애니메이션
   - 신뢰도 실시간 표시
   - 수동 텍스트 편집 기능
   - 금액/항목 하이라이트

3. hooks/useOCR.ts - OCR 처리 로직
   - Tesseract.js 워커 관리
   - Canvas 이미지 전처리
   - OCR 진행 상태 추적
   - 에러 처리 및 재시도

Technical Requirements:

- Tesseract.js 한국어 OCR 무료 활용
- Canvas API 이미지 최적화
- Web Workers 백그라운드 처리
- 모바일 카메라 API 통합
- TypeScript 완전 지원

한국어 영수증 최적화 및 직관적 OCR 피드백 구현.

```

### **10단계: 항목 편집 및 참가자 관리**
```

@frontend-developer Create item editing and participant management:

1. components/bill/item-editor.tsx - 영수증 항목 편집

   - OCR 결과를 shadcn/ui Table로 표시
   - 실시간 항목 추가/수정/삭제
   - 자동 합계 계산 및 검증
   - 세금, 할인, 팁 별도 입력

2. components/bill/participant-manager.tsx - 참가자 관리

   - 참가자 추가/삭제 인터페이스
   - shadcn/ui Card로 프로필 표시
   - 참가자별 색상 할당
   - 연락처 정보 관리

3. components/bill/split-calculator.tsx - 분할 계산

   - 4가지 분할 방식 (균등/항목별/비율/커스텀)
   - shadcn/ui Tabs로 방식 전환
   - 실시간 분할 결과 미리보기
   - Magic UI 계산 애니메이션

4. components/bill/allocation-matrix.tsx - 할당 매트릭스
   - 참가자 x 항목 매트릭스 테이블
   - 드래그앤드롭 할당
   - 시각적 할당 상태 표시

Features:

- 실시간 계산 및 검증
- 직관적 드래그앤드롭 할당
- 모바일 터치 최적화
- 계산 오류 자동 감지

모든 계산은 클라이언트 사이드에서 완전 오프라인 처리.

```

### **11단계: 정산 결과 및 히스토리**
```

@frontend-developer Create settlement results and history management:

1. components/bill/settlement-result.tsx - 정산 결과

   - 참가자별 지불 금액 요약
   - Magic UI 최적 송금 경로 시각화
   - shadcn/ui Card로 송금 지시사항
   - QR 코드 생성 (계좌이체)
   - 정산 결과 공유 기능

2. pages/result.tsx - 정산 결과 페이지

   - 전체 정산 요약
   - 참가자별 상세 내역
   - 송금 체크리스트
   - 재계산 및 수정

3. pages/history.tsx - 과거 정산 내역

   - IndexedDB 저장 데이터 조회
   - shadcn/ui Table 히스토리 목록
   - 검색 및 필터링 (날짜, 금액, 참가자)
   - 과거 정산 재사용
   - JSON, CSV 내보내기

4. hooks/useIndexedDB.ts - 로컬 데이터 관리

   - 영수증 및 정산 데이터 CRUD
   - 검색 및 필터링 쿼리
   - 데이터 백업 및 복원

5. components/bill/share-modal.tsx - 결과 공유

   - 카카오톡, 문자 공유
   - 이메일 전송
   - URL 링크 및 QR 코드 생성

6. components/common/api-status.tsx - API 상태
   - Gemini API 일일 사용량 (60/60)
   - 현재 OCR 모드 (Tesseract/Gemini)
   - OCR 처리 성공률 통계
   - 오프라인 모드 상태

한국어 UI/UX 최적화 및 직관적 정산 관리 구현.

```

---

## Phase 5: 테스트 및 성능 최적화

### **12단계: Playwright 자동화 테스트**
```

Using Playwright, create comprehensive E2E test suite:

1. tests/e2e/ocr-processing.spec.ts - OCR 플로우

   - 영수증 이미지 업로드 테스트
   - Tesseract.js OCR 처리 검증
   - 금액/항목 추출 정확성
   - OCR 신뢰도 및 에러 처리

2. tests/e2e/bill-splitting.spec.ts - 계산 플로우

   - 4가지 분할 방식 테스트
   - 참가자 관리 및 할당
   - 계산 정확성 검증
   - 최적 송금 경로 테스트

3. tests/e2e/data-persistence.spec.ts - 데이터 저장

   - IndexedDB 저장/조회
   - 히스토리 관리
   - 백업/복원 기능
   - 브라우저 재시작 후 데이터 유지

4. tests/e2e/mobile-experience.spec.ts - 모바일 테스트
   - 카메라 촬영 테스트
   - 터치 제스처 반응성
   - 반응형 레이아웃
   - 모바일 키패드 입력

Coverage Target: 80% 이상

```

### **13단계: 성능 최적화 (Sequential-Thinking)**
```

Using Sequential-Thinking, design OCR and calculation performance optimization:

Optimization Areas:

1. OCR 처리 최적화

   - Tesseract.js Web Worker 병렬 처리
   - Canvas 렌더링 최적화
   - 이미지 압축 및 전처리
   - OCR 결과 캐싱

2. 계산 성능 최적화
   - 실시간 계산 디바운싱
   - 메모이제이션 결과 캐싱
   - 복잡한 분할 알고리즘 최적화
   - IndexedDB 쿼리 최적화

Performance Budget:

- OCR 처리: < 10초 (일반 영수증)
- 계산 응답: < 500ms
- 페이지 로드: < 3초
- 이미지 업로드 처리: < 2초

Memory Management:

- 이미지 메모리 자동 해제
- OCR 워커 효율적 관리
- 대용량 히스토리 데이터 관리
- 가비지 컬렉션 최적화

```

---

## Phase 6: PWA 및 배포

### **14단계: PWA 계산기 구현 (Filesystem)**
```

Using Filesystem, implement PWA for offline bill splitting:

1. public/manifest.json - 계산기 앱 매니페스트

```json
{
  "name": "스마트 비용 분할 계산기",
  "short_name": "Bill Splitter",
  "description": "OCR 기반 스마트 영수증 분할 계산기",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "categories": ["finance", "utilities"],
  "lang": "ko",
  "shortcuts": [
    {
      "name": "새 영수증 계산",
      "url": "/calculator",
      "icons": [{ "src": "/icons/new-bill.png", "sizes": "96x96" }]
    },
    {
      "name": "계산 히스토리",
      "url": "/history",
      "icons": [{ "src": "/icons/history.png", "sizes": "96x96" }]
    }
  ]
}
```

2. public/sw.js - Service Worker

   - Tesseract.js OCR 엔진 캐싱
   - 계산 결과 오프라인 저장
   - 완전 오프라인 계산 지원

3. src/utils/pwa-calculator-utils.ts - PWA 헬퍼
   - 네이티브 카메라 접근
   - 백그라운드 이미지 처리
   - 오프라인 상태 감지

```

### **15단계: GitHub 저장소 설정 (GitHub)**
```

Using GitHub, setup repository with CI/CD:

Repository Setup:

- smart-bill-splitter
- MIT License (오픈소스 계산기)
- 한국어/영어 README.md

GitHub Actions:

- ocr-test.yml: Tesseract.js 정확도 테스트
- calculation-test.yml: 분할 계산 정확성 검증
- performance-test.yml: OCR 성능 벤치마크
- deploy.yml: Vercel 자동 배포

Algorithm Validation:

- 영수증 샘플 OCR 테스트
- 금액 추출 정규식 정확성
- 한국어 OCR 품질 확인
- 분할 계산 수학적 정확성

Issue Templates:

- OCR 정확도 개선
- 새로운 영수증 형식 지원
- 계산 알고리즘 버그
- 사용성 개선 제안

```

### **16단계: Vercel 배포 최적화**
```

@frontend-developer Configure optimized Vercel deployment:

1. vercel.json - OCR 계산기 배포 설정

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/tesseract-worker/(.*)",
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

   - Production: VITE_API_MODE=free (Tesseract + Gemini)
   - Preview: VITE_API_MODE=offline (Tesseract only)
   - Development: VITE_USE_MOCK_DATA=true

3. vite.config.ts 최적화:

   - Tesseract.js 번들링 최적화
   - Web Worker 설정
   - WASM 파일 최적화
   - 이미지 처리 라이브러리 최적화

4. 성능 최적화:
   - OCR 엔진 코드 분할
   - 이미지 처리 지연 로딩
   - IndexedDB 최적화
   - CDN 캐싱 전략

Production URL: https://smart-bill-splitter.vercel.app

```

---

## Phase 7: 최종 검증 및 문서화

### **17단계: 전체 시스템 통합 테스트**
```

Using Playwright + @frontend-developer, comprehensive integration testing:

1. OCR 및 계산 시나리오:

   - 다양한 영수증 형식 (식당, 카페, 마트)
   - Tesseract.js 한국어 OCR 정확도
   - 금액 추출 정규식 정확성
   - 4가지 분할 방식 정확도
   - 최적 송금 경로 알고리즘

2. 데이터 저장 및 관리:

   - IndexedDB 데이터 영속성
   - 대용량 히스토리 처리
   - 백업/복원 기능
   - 브라우저별 호환성

3. 모바일 및 PWA:

   - 카메라 촬영 및 이미지 처리
   - 터치 제스처 반응성
   - 완전 오프라인 OCR 및 계산
   - 배터리 효율성

4. Lighthouse 성능 목표:
   - Performance: 85+ (OCR 처리 고려)
   - Accessibility: 90+
   - Best Practices: 90+
   - PWA: 95+

```

### **18단계: 종합 문서화**
```

Using Filesystem, create comprehensive documentation:

1. README.md - 프로젝트 개요

   - OCR 기반 스마트 비용 분할 기능
   - Tesseract.js 무료 OCR 활용
   - 4가지 분할 방식 지원
   - 완전 오프라인 작동

2. docs/USER_GUIDE.md - 사용자 매뉴얼 (한국어)

   - 영수증 촬영 및 업로드 방법
   - OCR 결과 확인 및 수정
   - 참가자 관리 및 할당
   - 정산 결과 확인 및 공유

3. docs/OCR_SETUP.md - OCR 엔진 가이드

   - Tesseract.js 설치 및 설정
   - 한국어 언어 팩 설정
   - 이미지 전처리 최적화
   - OCR 정확도 개선 팁

4. docs/CALCULATION_LOGIC.md - 계산 알고리즘

   - 4가지 분할 방식 상세 설명
   - 최적 송금 경로 알고리즘
   - 세금/팁 배분 로직
   - 정산 최적화 전략

5. docs/DEVELOPMENT.md - 개발 가이드

   - 로컬 개발 환경 설정
   - Tesseract.js 개발 모드
   - IndexedDB 스키마 설계
   - 테스트 실행 및 디버깅

6. docs/DEPLOYMENT.md - 배포 가이드
   - Vercel 배포 최적화
   - PWA 설정 및 검증
   - 성능 모니터링
   - OCR 처리 성능 관리

모든 문서는 한국어로 작성, OCR 샘플 및 계산 예제 포함.

````

---

## 최종 체크리스트 및 검증

### **완성도 검증 리스트 (모든 요구사항 100% 포함):**

**✅ 핵심 기능 구현**
- [ ] 영수증 사진 업로드 (드래그앤드롭 + 카메라)
- [ ] Tesseract.js OCR (브라우저 실행, 완전 무료)
- [ ] 텍스트에서 금액 추출 (정규식 패턴)
- [ ] Google Gemini API (선택사항, 무료 티어)
- [ ] 수동 편집 모드 (OCR 결과 보정)
- [ ] 참가자별 할당 시스템
- [ ] 정산 계산 로직 (4가지 방식)

**✅ OCR 구현**
- [ ] Tesseract.js 한국어 지원
- [ ] 이미지 전처리 (대비 조정, 회전 보정)
- [ ] 금액 패턴 인식 (한국원화 최적화)
- [ ] 수동 보정 UI
- [ ] extractPrices() 함수 완전 구현

**✅ 정산 로직**
- [ ] 균등 분할 계산
- [ ] 항목별 할당 계산
- [ ] 세금/팁 자동 배분
- [ ] 최적 송금 경로 계산 (최소 송금 횟수)

**✅ 페이지 구성 (4페이지)**
- [ ] 메인 계산기 (OCR + 계산 통합)
- [ ] OCR 편집기 (결과 수정)
- [ ] 정산 결과 (송금 안내)
- [ ] 히스토리 (과거 계산 내역)

**✅ 클라이언트 사이드 처리**
- [ ] 모든 OCR 처리 브라우저에서 실행
- [ ] 클라이언트 사이드 계산 로직
- [ ] IndexedDB 로컬 데이터 저장
- [ ] 완전 오프라인 작동

**✅ 추가 요구사항 (11개 모두)**
- [ ] Vite 프로젝트 세팅
- [ ] 환경변수 설정 (.env.example)
- [ ] API 서비스 레이어 (Mock/Free/Offline/Custom)
- [ ] services/freeAIService.ts (AIServiceConfig)
- [ ] localStorage 기반 할당량 추적
- [ ] API 실패시 오프라인 폴백
- [ ] 반응형 디자인
- [ ] PWA 지원 (오프라인 계산기)
- [ ] 한글 지원 (OCR + UI)
- [ ] Vercel 배포 설정
- [ ] 한글 주석 및 무료 API 제한사항 명시

**✅ 호환성 요구사항**
- [ ] Context7: 검증된 라이브러리만 사용
- [ ] shadcn/ui: 호환성 우수 컴포넌트만
- [ ] Magic UI: 호환성 우수 애니메이션만

---

## 실행 가이드

### **핵심 구현 요구사항 완벽 반영:**

**OCR 구현 로직:**
```javascript
const extractPrices = (ocrText) => {
  // 금액 패턴 매칭 ✓ Phase 2, 5단계
  // 항목명 추출 ✓ Phase 2, 5단계
  // 구조화된 데이터 반환 ✓ Phase 2, 5단계
};
````

**정산 로직 완전 구현:**

- 균등 분할, 항목별 할당, 세금/팁 계산, 최적 송금 경로 → Phase 2, 5단계

**무료 API 완전 활용:**

- Tesseract.js (완전 무료) + Gemini (선택사항, 일 60 요청) + 완전 로컬 처리

**클라이언트 사이드 + IndexedDB:**

- 모든 처리 브라우저 실행 + IndexedDB 로컬 저장 → Phase 2, 5-6단계

---

**완성 결과물:**
완전 무료 운영 가능한 OCR 기반 스마트 비용 분할 계산기

- Tesseract.js 무료 OCR (브라우저 실행)
- 한국어 영수증 최적화
- 4가지 분할 방식 완전 지원
- 완전 오프라인 작동
- PWA 모바일 앱 경험

**예상 개발 일정:** 2-3주 (1명 개발자)
**기술 난이도:** 중급-고급 (OCR + 복잡한 계산)

**모든 요구사항이 100% 포함된 완전한 통합 워크플로우입니다.**
