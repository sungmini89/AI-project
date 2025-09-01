/**
 * 색상 계산 결과 캐싱 시스템
 * - HSL/RGB/HEX 변환 결과 캐싱
 * - 조화 계산 결과 캐싱 (키워드+조화타입 기반)
 * - 접근성 대비율 계산 결과 캐싱
 * - LRU 캐시로 메모리 효율성 확보
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hitCount: number;
}

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private maxAge: number;

  constructor(maxSize = 1000, maxAge = 5 * 60 * 1000) { // 5분
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hitCount: 0
    });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // 만료된 항목 제거
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return undefined;
    }

    // 히트 카운트 증가 및 접근 시간 갱신
    entry.hitCount++;
    entry.timestamp = Date.now();
    
    // LRU 순서 유지를 위해 다시 설정
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  private evictLRU(): void {
    // 가장 오래된 항목 제거
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate()
    };
  }

  private calculateHitRate(): number {
    let totalHits = 0;
    let totalEntries = 0;
    
    for (const entry of this.cache.values()) {
      totalHits += entry.hitCount;
      totalEntries++;
    }
    
    return totalEntries > 0 ? totalHits / totalEntries : 0;
  }
}

// 색상 변환 캐시
const colorConversionCache = new LRUCache<any>(2000);
const harmonyCache = new LRUCache<any>(1000);
const contrastCache = new LRUCache<number>(1500);

export class ColorCache {
  /**
   * HSL을 RGB로 변환 (캐시된 결과 반환)
   */
  static hslToRgb(h: number, s: number, l: number): [number, number, number] {
    const key = `hsl:${h}:${s}:${l}`;
    let rgb = colorConversionCache.get(key);
    
    if (!rgb) {
      rgb = this.calculateHslToRgb(h, s, l);
      colorConversionCache.set(key, rgb);
    }
    
    return rgb;
  }

  /**
   * RGB를 HSL로 변환 (캐시된 결과 반환)
   */
  static rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    const key = `rgb:${r}:${g}:${b}`;
    let hsl = colorConversionCache.get(key);
    
    if (!hsl) {
      hsl = this.calculateRgbToHsl(r, g, b);
      colorConversionCache.set(key, hsl);
    }
    
    return hsl;
  }

  /**
   * RGB를 HEX로 변환 (캐시된 결과 반환)
   */
  static rgbToHex(r: number, g: number, b: number): string {
    const key = `hex:${r}:${g}:${b}`;
    let hex = colorConversionCache.get(key);
    
    if (!hex) {
      hex = `#${[r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
      colorConversionCache.set(key, hex);
    }
    
    return hex;
  }

  /**
   * 색상 조화 계산 결과 캐싱
   */
  static getHarmonyColors(baseColor: any, harmonyType: string): any[] {
    const key = `harmony:${baseColor.h}:${baseColor.s}:${baseColor.l}:${harmonyType}`;
    let harmony = harmonyCache.get(key);
    
    if (!harmony) {
      harmony = this.calculateHarmony(baseColor, harmonyType);
      harmonyCache.set(key, harmony);
    }
    
    return harmony;
  }

  /**
   * 색상 대비율 계산 결과 캐싱
   */
  static getContrastRatio(color1: string, color2: string): number {
    const key = `contrast:${color1}:${color2}`;
    let ratio = contrastCache.get(key);
    
    if (!ratio) {
      ratio = this.calculateContrastRatio(color1, color2);
      contrastCache.set(key, ratio);
    }
    
    return ratio;
  }

  /**
   * 실제 HSL → RGB 변환 계산
   */
  private static calculateHslToRgb(h: number, s: number, l: number): [number, number, number] {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
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

    const r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1/3) * 255);

    return [r, g, b];
  }

  /**
   * 실제 RGB → HSL 변환 계산
   */
  private static calculateRgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const sum = max + min;
    
    let h = 0;
    let s = 0;
    const l = sum / 2;

    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - sum) : diff / sum;

      switch (max) {
        case r:
          h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / diff + 2) / 6;
          break;
        case b:
          h = ((r - g) / diff + 4) / 6;
          break;
      }
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  /**
   * 색상 조화 계산 (실제 계산 로직은 별도 모듈에서 가져옴)
   */
  private static calculateHarmony(baseColor: any, harmonyType: string): any[] {
    // 실제 조화 계산 로직 (기존 colorTheory.ts에서 가져와서 최적화)
    switch (harmonyType) {
      case 'complementary':
        return this.generateComplementary(baseColor);
      case 'analogous':
        return this.generateAnalogous(baseColor);
      case 'triadic':
        return this.generateTriadic(baseColor);
      case 'tetradic':
        return this.generateTetradic(baseColor);
      case 'monochromatic':
        return this.generateMonochromatic(baseColor);
      default:
        return [baseColor];
    }
  }

  /**
   * 보색 생성 (최적화된 계산)
   */
  private static generateComplementary(baseColor: any): any[] {
    const complementHue = (baseColor.h + 180) % 360;
    return [
      baseColor,
      { h: complementHue, s: baseColor.s, l: baseColor.l },
      { h: baseColor.h, s: Math.max(0, baseColor.s - 30), l: Math.min(100, baseColor.l + 20) },
      { h: complementHue, s: Math.max(0, baseColor.s - 30), l: Math.min(100, baseColor.l + 20) },
      { h: baseColor.h, s: Math.max(0, baseColor.s - 50), l: 90 },
    ];
  }

  /**
   * 유사색 생성
   */
  private static generateAnalogous(baseColor: any): any[] {
    return [
      { h: (baseColor.h + 360 - 60) % 360, s: baseColor.s, l: baseColor.l },
      { h: (baseColor.h + 360 - 30) % 360, s: baseColor.s, l: baseColor.l },
      baseColor,
      { h: (baseColor.h + 30) % 360, s: baseColor.s, l: baseColor.l },
      { h: (baseColor.h + 60) % 360, s: baseColor.s, l: baseColor.l },
    ];
  }

  /**
   * 삼색조 생성
   */
  private static generateTriadic(baseColor: any): any[] {
    return [
      baseColor,
      { h: (baseColor.h + 120) % 360, s: baseColor.s, l: baseColor.l },
      { h: (baseColor.h + 240) % 360, s: baseColor.s, l: baseColor.l },
      { h: baseColor.h, s: Math.max(0, baseColor.s - 20), l: Math.min(100, baseColor.l + 15) },
      { h: (baseColor.h + 120) % 360, s: Math.max(0, baseColor.s - 20), l: Math.min(100, baseColor.l + 15) },
    ];
  }

  /**
   * 사색조 생성
   */
  private static generateTetradic(baseColor: any): any[] {
    return [
      baseColor,
      { h: (baseColor.h + 90) % 360, s: baseColor.s, l: baseColor.l },
      { h: (baseColor.h + 180) % 360, s: baseColor.s, l: baseColor.l },
      { h: (baseColor.h + 270) % 360, s: baseColor.s, l: baseColor.l },
    ];
  }

  /**
   * 단색조 생성
   */
  private static generateMonochromatic(baseColor: any): any[] {
    return [
      { h: baseColor.h, s: baseColor.s, l: 20 },
      { h: baseColor.h, s: baseColor.s, l: 40 },
      baseColor,
      { h: baseColor.h, s: baseColor.s, l: 70 },
      { h: baseColor.h, s: baseColor.s, l: 90 },
    ];
  }

  /**
   * 색상 대비율 계산 (WCAG 기준)
   */
  private static calculateContrastRatio(color1: string, color2: string): number {
    const getLuminance = (hex: string): number => {
      const rgb = hex.replace('#', '').match(/.{2}/g)!.map(x => parseInt(x, 16));
      const [r, g, b] = rgb.map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * 캐시 통계 및 관리
   */
  static getCacheStats() {
    return {
      colorConversion: colorConversionCache.getStats(),
      harmony: harmonyCache.getStats(),
      contrast: contrastCache.getStats()
    };
  }

  /**
   * 캐시 정리
   */
  static clearCache() {
    colorConversionCache.clear();
    harmonyCache.clear();
    contrastCache.clear();
  }
}

export default ColorCache;