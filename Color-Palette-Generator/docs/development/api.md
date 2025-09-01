# 🔌 API 문서

AI 색상 팔레트 생성기의 API 통합 및 색상 알고리즘 문서입니다.

## 🌐 API 아키텍처

### 3단계 폴백 시스템
```
1차: Colormind API (ML 기반 색상 생성)
    ↓ (실패 시)
2차: TheColorAPI (색상 정보 및 팔레트)
    ↓ (실패 시)  
3차: Local Algorithm (오프라인 색상 생성)
```

### API 모드 설정
```typescript
// src/lib/config.ts
export const API_CONFIG = {
  mode: process.env.VITE_API_MODE || 'free', // 'free' | 'premium' | 'offline'
  timeout: 5000, // 5초 타임아웃
  retries: 3,    // 최대 재시도 횟수
  
  endpoints: {
    colormind: process.env.VITE_COLORMIND_API_URL || 'http://colormind.io/api/',
    theColorApi: process.env.VITE_COLOR_API_URL || 'https://www.thecolorapi.com',
    fallback: '/api/local' // 로컬 알고리즘 엔드포인트
  }
};
```

## 🎨 Colormind API 통합

### API 개요
- **URL**: http://colormind.io/api/
- **방식**: POST 요청  
- **응답**: JSON 형식의 RGB 색상 배열
- **제한**: 무료 사용 시 API 호출 제한 있음

### 기본 사용법
```typescript
interface ColormindRequest {
  model: string;           // 모델명 (default, ui, ...)
  input: (number[] | 'N')[]; // 색상 배열 또는 'N' (빈 슬롯)
}

interface ColormindResponse {
  result: [number, number, number][]; // RGB 색상 배열
}

// 기본 팔레트 생성
const generatePalette = async (baseColor?: string): Promise<Color[]> => {
  const payload: ColormindRequest = {
    model: "default",
    input: baseColor 
      ? [hexToRgb(baseColor), "N", "N", "N", "N"]
      : ["N", "N", "N", "N", "N"]
  };
  
  const response = await fetch('http://colormind.io/api/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const data: ColormindResponse = await response.json();
  return data.result.map(rgb => ({
    hex: rgbToHex(rgb),
    rgb,
    hsl: rgbToHsl(rgb)
  }));
};
```

### 고급 모델 활용
```typescript
// UI 특화 모델
const UI_MODELS = [
  'default',    // 범용 색상 조합
  'ui',         // UI 디자인 최적화
  'makoto_shinkai', // 애니메이션 스타일
  'metro',      // 모던 UI 스타일
  'papers'      // 학술/문서 스타일
];

const generateUIColors = async (model: string = 'ui') => {
  return await generatePalette(undefined, { model });
};
```

### 키워드 기반 색상 생성
```typescript
// 키워드를 RGB 색상으로 변환하는 매핑 시스템
const KEYWORD_COLOR_MAP: Record<string, [number, number, number]> = {
  // 자연
  '바다': [52, 152, 219],    // 파란색 계열
  '숲': [46, 125, 50],       // 초록색 계열
  '하늘': [135, 206, 250],   // 하늘색 계열
  '석양': [255, 149, 0],     // 주황색 계열
  
  // 감정
  '평온': [174, 198, 207],   // 연한 파랑
  '열정': [231, 76, 60],     // 빨간색
  '신뢰': [52, 73, 94],      // 진한 파랑
  '창의': [155, 89, 182],    // 보라색
  
  // 계절
  '봄': [144, 238, 144],     // 연초록
  '여름': [255, 215, 0],     // 황금색
  '가을': [255, 140, 0],     // 주황색
  '겨울': [176, 196, 222]    // 연한 회색
};

const getColorFromKeyword = (keyword: string): [number, number, number] | null => {
  // 직접 매핑 확인
  if (KEYWORD_COLOR_MAP[keyword]) {
    return KEYWORD_COLOR_MAP[keyword];
  }
  
  // 부분 매칭 (포함 관계)
  for (const [key, color] of Object.entries(KEYWORD_COLOR_MAP)) {
    if (keyword.includes(key) || key.includes(keyword)) {
      return color;
    }
  }
  
  return null;
};
```

## 🌈 TheColorAPI 통합

### API 개요
- **URL**: https://www.thecolorapi.com
- **방식**: GET 요청
- **기능**: 색상 정보, 팔레트, 색상명 제공
- **제한**: 무료 사용 가능, 상업적 이용 시 제한

### 색상 정보 조회
```typescript
interface ColorInfo {
  hex: { value: string; clean: string };
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  name: { value: string; closest_named_hex: string };
  cmyk: { c: number; m: number; y: number; k: number };
  XYZ: { X: number; Y: number; Z: number };
}

const getColorInfo = async (hex: string): Promise<ColorInfo> => {
  const response = await fetch(
    `https://www.thecolorapi.com/id?hex=${hex.replace('#', '')}`
  );
  return await response.json();
};

// 사용 예시
const colorInfo = await getColorInfo('#FF5733');
console.log(colorInfo.name.value); // "Red Orange"
```

### 색상 조화 생성
```typescript
interface HarmonyResponse {
  seed: ColorInfo;
  colors: ColorInfo[];
}

const HARMONY_MODES = [
  'monochrome',        // 단색 조화
  'monochrome-dark',   // 어두운 단색
  'monochrome-light',  // 밝은 단색  
  'analogic',          // 유사색
  'complement',        // 보색
  'analogic-complement', // 유사-보색
  'triad',            // 삼각색
  'quad'              // 사각색
] as const;

const generateHarmony = async (
  hex: string, 
  mode: typeof HARMONY_MODES[number] = 'analogic'
): Promise<Color[]> => {
  const response = await fetch(
    `https://www.thecolorapi.com/scheme?hex=${hex.replace('#', '')}&mode=${mode}&count=5`
  );
  
  const data: HarmonyResponse = await response.json();
  
  return data.colors.map(color => ({
    hex: color.hex.value,
    rgb: [color.rgb.r, color.rgb.g, color.rgb.b],
    hsl: [color.hsl.h, color.hsl.s, color.hsl.l],
    name: color.name.value
  }));
};
```

### 색상명 검색
```typescript
const searchColorByName = async (name: string): Promise<ColorInfo | null> => {
  try {
    const response = await fetch(
      `https://www.thecolorapi.com/id?name=${encodeURIComponent(name)}`
    );
    
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

// 한국어 색상명 검색
const koreanColorNames = {
  '빨강': 'red',
  '파랑': 'blue', 
  '노랑': 'yellow',
  '초록': 'green',
  '보라': 'purple',
  '주황': 'orange'
};
```

## 🏠 로컬 알고리즘

### HSL 기반 색상 생성
```typescript
// src/lib/colorAlgorithms.ts
export class LocalColorGenerator {
  private keywordToHue(keyword: string): number {
    // 키워드 해시를 통한 일관된 색상 생성
    let hash = 0;
    for (let i = 0; i < keyword.length; i++) {
      hash = keyword.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 360;
  }
  
  generateComplementary(baseHue: number): Color[] {
    return [
      { hue: baseHue, saturation: 70, lightness: 50 },
      { hue: (baseHue + 180) % 360, saturation: 70, lightness: 50 },
      { hue: baseHue, saturation: 50, lightness: 70 },
      { hue: (baseHue + 180) % 360, saturation: 50, lightness: 30 },
      { hue: baseHue, saturation: 30, lightness: 80 }
    ].map(hsl => this.hslToColor(hsl));
  }
  
  generateAnalogous(baseHue: number): Color[] {
    const hues = [
      baseHue,
      (baseHue + 30) % 360,
      (baseHue - 30 + 360) % 360,
      (baseHue + 60) % 360,
      (baseHue - 60 + 360) % 360
    ];
    
    return hues.map((hue, index) => 
      this.hslToColor({
        hue,
        saturation: 70 - (index * 5),
        lightness: 50 + (index * 5)
      })
    );
  }
  
  generateTriadic(baseHue: number): Color[] {
    const hues = [
      baseHue,
      (baseHue + 120) % 360,
      (baseHue + 240) % 360
    ];
    
    return [
      ...hues.map(hue => this.hslToColor({ hue, saturation: 70, lightness: 50 })),
      this.hslToColor({ hue: baseHue, saturation: 50, lightness: 70 }),
      this.hslToColor({ hue: (baseHue + 120) % 360, saturation: 30, lightness: 80 })
    ];
  }
  
  private hslToColor({ hue, saturation, lightness }): Color {
    const hex = hslToHex(hue, saturation, lightness);
    const rgb = hexToRgb(hex);
    
    return {
      hex,
      rgb: [rgb.r, rgb.g, rgb.b],
      hsl: [hue, saturation, lightness]
    };
  }
}
```

### 색상 변환 유틸리티
```typescript
// src/lib/colorUtils.ts

// HEX to RGB 변환
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// RGB to HEX 변환
export const rgbToHex = ([r, g, b]: [number, number, number]): string => {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// HSL to RGB 변환
export const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  h /= 360;
  s /= 100;
  l /= 100;
  
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  if (s === 0) {
    const gray = Math.round(l * 255);
    return [gray, gray, gray];
  }
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255)
  ];
};

// 색상 대비 계산 (WCAG 기준)
export const calculateContrast = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
```

## 📱 클라이언트 통합

### API 서비스 클래스
```typescript
// src/services/ColorService.ts
export class ColorService {
  private config: APIConfig;
  
  constructor(config: APIConfig) {
    this.config = config;
  }
  
  async generatePalette(
    keyword: string, 
    harmonyRule: HarmonyRule = 'analogous'
  ): Promise<Color[]> {
    // 1차: Colormind API 시도
    try {
      return await this.colormindGenerate(keyword, harmonyRule);
    } catch (error) {
      console.warn('Colormind API failed:', error);
    }
    
    // 2차: TheColorAPI 시도
    try {
      return await this.theColorApiGenerate(keyword, harmonyRule);
    } catch (error) {
      console.warn('TheColorAPI failed:', error);
    }
    
    // 3차: 로컬 알고리즘 사용
    return this.localGenerate(keyword, harmonyRule);
  }
  
  private async withTimeout<T>(
    promise: Promise<T>, 
    timeout: number = this.config.timeout
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  }
  
  private async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.config.retries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }
}
```

### React 훅 통합
```typescript
// src/hooks/useColorGeneration.ts
export const useColorGeneration = () => {
  const [palette, setPalette] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'fallback'>('online');
  
  const colorService = useMemo(() => new ColorService(API_CONFIG), []);
  
  const generatePalette = useCallback(async (
    keyword: string,
    harmonyRule: HarmonyRule
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await colorService.generatePalette(keyword, harmonyRule);
      setPalette(result);
      setApiStatus('online');
    } catch (err) {
      setError(err instanceof Error ? err.message : '색상 생성 실패');
      setApiStatus('offline');
      
      // 오프라인 폴백
      const fallbackResult = await colorService.localGenerate(keyword, harmonyRule);
      setPalette(fallbackResult);
    } finally {
      setIsLoading(false);
    }
  }, [colorService]);
  
  return {
    palette,
    isLoading,
    error,
    apiStatus,
    generatePalette
  };
};
```

### 오프라인 캐싱
```typescript
// src/lib/cacheService.ts
export class CacheService {
  private cacheName = 'color-palette-cache-v1';
  
  async cachePalette(key: string, palette: Color[]): Promise<void> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      const response = new Response(JSON.stringify(palette));
      await cache.put(`/palette/${key}`, response);
    }
  }
  
  async getCachedPalette(key: string): Promise<Color[] | null> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      const response = await cache.match(`/palette/${key}`);
      
      if (response) {
        return await response.json();
      }
    }
    
    return null;
  }
  
  // 로컬 스토리지 폴백
  setLocalStorage(key: string, palette: Color[]): void {
    try {
      localStorage.setItem(`palette_${key}`, JSON.stringify(palette));
    } catch (error) {
      console.warn('Local storage failed:', error);
    }
  }
  
  getLocalStorage(key: string): Color[] | null {
    try {
      const cached = localStorage.getItem(`palette_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }
}
```

## 🔍 API 모니터링 및 분석

### 성능 메트릭
```typescript
// src/lib/analytics.ts
interface APIMetrics {
  endpoint: string;
  responseTime: number;
  success: boolean;
  timestamp: number;
  errorType?: string;
}

export class APIAnalytics {
  private metrics: APIMetrics[] = [];
  
  recordRequest(endpoint: string, startTime: number, success: boolean, error?: Error): void {
    const metric: APIMetrics = {
      endpoint,
      responseTime: Date.now() - startTime,
      success,
      timestamp: Date.now(),
      errorType: error?.name
    };
    
    this.metrics.push(metric);
    this.sendToAnalytics(metric);
  }
  
  getAPIHealthStatus(): {
    colormind: { uptime: number; avgResponseTime: number };
    theColorApi: { uptime: number; avgResponseTime: number };
    local: { uptime: number; avgResponseTime: number };
  } {
    const recent = this.metrics.filter(m => 
      Date.now() - m.timestamp < 24 * 60 * 60 * 1000 // 24시간
    );
    
    return {
      colormind: this.calculateStats(recent, 'colormind'),
      theColorApi: this.calculateStats(recent, 'thecolorapi'),
      local: this.calculateStats(recent, 'local')
    };
  }
}
```

### 에러 핸들링 및 재시도 로직
```typescript
export enum APIErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMITED = 'RATE_LIMITED',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  API_DOWN = 'API_DOWN'
}

export class APIError extends Error {
  constructor(
    public type: APIErrorType,
    public endpoint: string,
    message: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// 재시도 전략
const RETRY_STRATEGIES = {
  [APIErrorType.NETWORK_ERROR]: { maxRetries: 3, backoff: 1000 },
  [APIErrorType.TIMEOUT]: { maxRetries: 2, backoff: 2000 },
  [APIErrorType.RATE_LIMITED]: { maxRetries: 1, backoff: 5000 },
  [APIErrorType.INVALID_RESPONSE]: { maxRetries: 1, backoff: 1000 },
  [APIErrorType.API_DOWN]: { maxRetries: 0, backoff: 0 }
};
```

---

## 🧪 API 테스트

### 단위 테스트
```typescript
// tests/unit/colorService.test.ts
describe('ColorService', () => {
  let colorService: ColorService;
  
  beforeEach(() => {
    colorService = new ColorService(TEST_CONFIG);
  });
  
  test('키워드 기반 색상 생성', async () => {
    const palette = await colorService.generatePalette('바다', 'analogous');
    
    expect(palette).toHaveLength(5);
    expect(palette[0].hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
  
  test('API 실패 시 로컬 폴백', async () => {
    // Mock API failure
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    
    const palette = await colorService.generatePalette('테스트', 'complementary');
    
    expect(palette).toHaveLength(5);
    // 로컬 알고리즘으로 생성된 결과인지 확인
  });
});
```

### E2E API 테스트
```typescript
// tests/e2e/api-integration.spec.ts
test('실제 API 통합 테스트', async ({ page }) => {
  // 네트워크 요청 감시
  const requests: any[] = [];
  page.on('request', request => requests.push({
    url: request.url(),
    method: request.method()
  }));
  
  await page.goto('/generator');
  await page.fill('[data-testid="keyword-input"]', 'API테스트');
  await page.click('[data-testid="generate-button"]');
  
  await expect(page.locator('[data-testid="color-palette"]')).toBeVisible();
  
  // API 호출 확인
  const apiCalls = requests.filter(req => 
    req.url.includes('colormind.io') || req.url.includes('thecolorapi.com')
  );
  
  expect(apiCalls.length).toBeGreaterThan(0);
});
```

---

> 🔌 **API 확장성**  
> 새로운 색상 API 통합이나 알고리즘 개선이 필요하시면  
> [GitHub Issues](https://github.com/your-repo/issues)에 제안해주세요!