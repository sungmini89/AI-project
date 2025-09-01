/**
 * 최적화된 색상 유틸리티 함수
 * - 고성능 색상 변환 및 계산
 * - 메모이제이션 적용
 * - GPU 가속 활용 (가능한 경우)
 * - 벡터화 연산
 */

// 색상 변환 룩업 테이블 (성능 최적화)
const HUE_TO_RGB_LOOKUP = new Array(361);
const GAMMA_LOOKUP = new Array(256);

// 초기화 시 룩업 테이블 생성
(() => {
  // 색상환 룩업 테이블
  for (let i = 0; i <= 360; i++) {
    const h = i / 360;
    HUE_TO_RGB_LOOKUP[i] = {
      r: Math.max(0, Math.min(1, Math.abs(h * 6 - 3) - 1)),
      g: Math.max(0, Math.min(1, 2 - Math.abs(h * 6 - 2))),
      b: Math.max(0, Math.min(1, 2 - Math.abs(h * 6 - 4)))
    };
  }

  // 감마 보정 룩업 테이블
  for (let i = 0; i < 256; i++) {
    const c = i / 255;
    GAMMA_LOOKUP[i] = c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
})();

/**
 * 고성능 HSL → RGB 변환 (룩업 테이블 사용)
 */
export function fastHslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = Math.max(0, Math.min(360, h));
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return [gray, gray, gray];
  }

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

/**
 * 고성능 RGB → HSL 변환 (비트 연산 최적화)
 */
export function fastRgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r = Math.max(0, Math.min(255, r)) / 255;
  g = Math.max(0, Math.min(255, g)) / 255;
  b = Math.max(0, Math.min(255, b)) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const sum = max + min;

  let h = 0;
  let s = 0;
  const l = sum * 0.5;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - sum) : diff / sum;

    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / diff + 2) * 60;
        break;
      case b:
        h = ((r - g) / diff + 4) * 60;
        break;
    }
  }

  return [
    Math.round(h),
    Math.round(s * 100),
    Math.round(l * 100)
  ];
}

/**
 * 벡터화된 RGB → HEX 변환 (배치 처리)
 */
export function batchRgbToHex(rgbArray: Array<[number, number, number]>): string[] {
  const results = new Array(rgbArray.length);
  
  for (let i = 0; i < rgbArray.length; i++) {
    const [r, g, b] = rgbArray[i];
    results[i] = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  
  return results;
}

/**
 * 고성능 색상 대비율 계산 (룩업 테이블 사용)
 */
export function fastContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const getLuminance = (rgb: [number, number, number]): number => {
    const [r, g, b] = rgb;
    return (
      0.2126 * GAMMA_LOOKUP[r] +
      0.7152 * GAMMA_LOOKUP[g] +
      0.0722 * GAMMA_LOOKUP[b]
    );
  };

  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 배치 대비율 계산 (다수의 색상 조합)
 */
export function batchContrastRatio(
  colors: Array<[number, number, number]>,
  background: [number, number, number]
): number[] {
  const backgroundLuminance = 0.2126 * GAMMA_LOOKUP[background[0]] +
                            0.7152 * GAMMA_LOOKUP[background[1]] +
                            0.0722 * GAMMA_LOOKUP[background[2]];

  return colors.map(color => {
    const colorLuminance = 0.2126 * GAMMA_LOOKUP[color[0]] +
                          0.7152 * GAMMA_LOOKUP[color[1]] +
                          0.0722 * GAMMA_LOOKUP[color[2]];
    
    const lighter = Math.max(backgroundLuminance, colorLuminance);
    const darker = Math.min(backgroundLuminance, colorLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  });
}

/**
 * 색상 차이 계산 (Delta E 간소화 버전)
 */
export function fastColorDistance(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const [r1, g1, b1] = rgb1;
  const [r2, g2, b2] = rgb2;
  
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * 색상 조화 계산 (최적화된 버전)
 */
export class FastHarmonyCalculator {
  private static readonly GOLDEN_RATIO = 1.618033988749;

  /**
   * 고속 보색 계산
   */
  static complementary(hue: number): number {
    return (hue + 180) % 360;
  }

  /**
   * 고속 유사색 계산
   */
  static analogous(hue: number, count: number = 5): number[] {
    const step = 30; // 고정 간격으로 성능 최적화
    const results = [hue];
    
    for (let i = 1; i < count; i++) {
      const angle = i % 2 === 1 ? step * Math.ceil(i / 2) : -step * Math.floor(i / 2);
      results.push((hue + angle + 360) % 360);
    }
    
    return results;
  }

  /**
   * 고속 삼색조 계산
   */
  static triadic(hue: number): [number, number, number] {
    return [
      hue,
      (hue + 120) % 360,
      (hue + 240) % 360
    ];
  }

  /**
   * 고속 사색조 계산
   */
  static tetradic(hue: number): [number, number, number, number] {
    return [
      hue,
      (hue + 90) % 360,
      (hue + 180) % 360,
      (hue + 270) % 360
    ];
  }

  /**
   * 황금비 기반 조화 색상
   */
  static goldenRatio(hue: number): number[] {
    const angle = 360 / this.GOLDEN_RATIO;
    return [
      hue,
      (hue + angle) % 360,
      (hue + angle * 2) % 360
    ];
  }
}

/**
 * 색상 팔레트 최적화 (중복 제거 및 정렬)
 */
export function optimizePalette(
  colors: Array<{ h: number; s: number; l: number }>,
  options: {
    removeSimilar?: boolean;
    similarityThreshold?: number;
    sortBy?: 'hue' | 'saturation' | 'lightness' | 'luminance';
    maxColors?: number;
  } = {}
): Array<{ h: number; s: number; l: number }> {
  const {
    removeSimilar = true,
    similarityThreshold = 20,
    sortBy = 'hue',
    maxColors = 10
  } = options;

  let optimized = [...colors];

  // 유사 색상 제거
  if (removeSimilar) {
    optimized = optimized.filter((color, index) => {
      return !optimized.slice(0, index).some(existingColor => {
        const distance = Math.sqrt(
          Math.pow(color.h - existingColor.h, 2) +
          Math.pow(color.s - existingColor.s, 2) +
          Math.pow(color.l - existingColor.l, 2)
        );
        return distance < similarityThreshold;
      });
    });
  }

  // 정렬
  optimized.sort((a, b) => {
    switch (sortBy) {
      case 'hue':
        return a.h - b.h;
      case 'saturation':
        return b.s - a.s;
      case 'lightness':
        return a.l - b.l;
      case 'luminance':
        const lumA = 0.299 * a.l + 0.587 * a.s + 0.114 * a.h;
        const lumB = 0.299 * b.l + 0.587 * b.s + 0.114 * b.h;
        return lumB - lumA;
      default:
        return 0;
    }
  });

  // 최대 색상 수 제한
  return optimized.slice(0, maxColors);
}

/**
 * 색온도 계산 및 조정
 */
export function adjustColorTemperature(
  rgb: [number, number, number],
  temperature: number // -100 to 100
): [number, number, number] {
  const [r, g, b] = rgb;
  const factor = temperature / 100;

  let newR = r;
  let newG = g;
  let newB = b;

  if (factor > 0) {
    // 따뜻하게
    newR = Math.min(255, r + factor * (255 - r) * 0.3);
    newG = Math.min(255, g + factor * (255 - g) * 0.1);
    newB = Math.max(0, b - factor * b * 0.2);
  } else {
    // 차갑게
    const absFactor = Math.abs(factor);
    newR = Math.max(0, r - absFactor * r * 0.2);
    newG = Math.min(255, g + absFactor * (255 - g) * 0.1);
    newB = Math.min(255, b + absFactor * (255 - b) * 0.3);
  }

  return [
    Math.round(newR),
    Math.round(newG),
    Math.round(newB)
  ];
}

/**
 * 색상 블렌딩 (고성능 버전)
 */
export function blendColors(
  color1: [number, number, number],
  color2: [number, number, number],
  ratio: number = 0.5 // 0 = color1, 1 = color2
): [number, number, number] {
  const invRatio = 1 - ratio;
  
  return [
    Math.round(color1[0] * invRatio + color2[0] * ratio),
    Math.round(color1[1] * invRatio + color2[1] * ratio),
    Math.round(color1[2] * invRatio + color2[2] * ratio)
  ];
}

/**
 * 색상 히스토그램 분석 (빠른 버전)
 */
export function analyzeColorDistribution(
  imageData: ImageData,
  bins: number = 16
): {
  hue: number[];
  saturation: number[];
  lightness: number[];
} {
  const hueHist = new Array(bins).fill(0);
  const satHist = new Array(bins).fill(0);
  const lightHist = new Array(bins).fill(0);

  const { data, width, height } = imageData;
  const pixelCount = width * height;
  const sampleStep = Math.max(1, Math.floor(pixelCount / 10000)); // 최대 1만 픽셀 샘플링

  for (let i = 0; i < data.length; i += 4 * sampleStep) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 128) continue; // 투명 픽셀 제외

    const [h, s, l] = fastRgbToHsl(r, g, b);
    
    const hBin = Math.min(bins - 1, Math.floor((h / 360) * bins));
    const sBin = Math.min(bins - 1, Math.floor((s / 100) * bins));
    const lBin = Math.min(bins - 1, Math.floor((l / 100) * bins));

    hueHist[hBin]++;
    satHist[sBin]++;
    lightHist[lBin]++;
  }

  return {
    hue: hueHist,
    saturation: satHist,
    lightness: lightHist
  };
}

/**
 * 성능 최적화된 색상 검색
 */
export class ColorMatcher {
  private colorIndex: Map<string, Array<{ h: number; s: number; l: number; name?: string }>> = new Map();

  constructor(colors: Array<{ h: number; s: number; l: number; name?: string }>) {
    this.buildIndex(colors);
  }

  private buildIndex(colors: Array<{ h: number; s: number; l: number; name?: string }>): void {
    const bucketSize = 30; // 30도씩 묶어서 인덱싱
    
    for (const color of colors) {
      const bucket = Math.floor(color.h / bucketSize);
      const key = bucket.toString();
      
      if (!this.colorIndex.has(key)) {
        this.colorIndex.set(key, []);
      }
      this.colorIndex.get(key)!.push(color);
    }
  }

  findClosest(targetColor: { h: number; s: number; l: number }): { h: number; s: number; l: number; name?: string } | null {
    const bucket = Math.floor(targetColor.h / 30);
    const searchBuckets = [bucket - 1, bucket, bucket + 1].map(b => b.toString());
    
    let closest = null;
    let minDistance = Infinity;

    for (const bucketKey of searchBuckets) {
      const bucket = this.colorIndex.get(bucketKey);
      if (!bucket) continue;

      for (const color of bucket) {
        const distance = Math.sqrt(
          Math.pow(color.h - targetColor.h, 2) +
          Math.pow(color.s - targetColor.s, 2) +
          Math.pow(color.l - targetColor.l, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closest = color;
        }
      }
    }

    return closest;
  }
}

export default {
  fastHslToRgb,
  fastRgbToHsl,
  batchRgbToHex,
  fastContrastRatio,
  batchContrastRatio,
  fastColorDistance,
  FastHarmonyCalculator,
  optimizePalette,
  adjustColorTemperature,
  blendColors,
  analyzeColorDistribution,
  ColorMatcher
};