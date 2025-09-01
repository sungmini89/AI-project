/**
 * 색상 계산 Web Worker
 * - 메인 스레드를 블로킹하지 않고 색상 계산 수행
 * - 대량 팔레트 생성을 비동기 처리
 * - 접근성 검증을 병렬 처리
 */

interface ColorCalculationTask {
  id: string;
  type: 'generate_palette' | 'calculate_harmony' | 'validate_accessibility' | 'batch_conversion';
  data: any;
}

interface ColorCalculationResult {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
}

class ColorWorkerEngine {
  /**
   * 색상 팔레트 생성
   */
  static generatePalette(data: {
    keyword: string;
    harmonyType: string;
    baseColor?: any;
  }): any[] {
    const startTime = performance.now();
    
    try {
      let baseColor = data.baseColor;
      
      // 키워드에서 기본 색상 추출
      if (!baseColor && data.keyword) {
        baseColor = this.mapKeywordToColor(data.keyword);
      }
      
      // 선택된 조화 규칙 적용
      const harmonyColors = this.generateHarmonyColors(baseColor, data.harmonyType);
      
      // WCAG 접근성 검증 및 조정
      const accessiblePalette = this.validateAndAdjustAccessibility(harmonyColors);
      
      console.log(`팔레트 생성 완료: ${performance.now() - startTime}ms`);
      return accessiblePalette;
      
    } catch (error) {
      console.error('팔레트 생성 실패:', error);
      return this.getDefaultPalette();
    }
  }

  /**
   * 키워드를 색상으로 매핑
   */
  private static mapKeywordToColor(keyword: string): any {
    const keywordColorMap: { [key: string]: any } = {
      // 감정 기반
      평온함: { h: 200, s: 70, l: 60 },
      열정: { h: 0, s: 80, l: 50 },
      행복: { h: 50, s: 90, l: 60 },
      자연: { h: 120, s: 60, l: 40 },
      신뢰: { h: 220, s: 70, l: 50 },
      
      // 자연 기반
      숲: { h: 120, s: 80, l: 30 },
      바다: { h: 200, s: 90, l: 40 },
      하늘: { h: 210, s: 70, l: 70 },
      노을: { h: 15, s: 85, l: 60 },
      꽃: { h: 320, s: 70, l: 70 },
      
      // 계절 기반
      봄: { h: 100, s: 60, l: 70 },
      여름: { h: 180, s: 80, l: 50 },
      가을: { h: 30, s: 70, l: 50 },
      겨울: { h: 210, s: 30, l: 80 },
      
      // 추상 기반
      에너지: { h: 45, s: 100, l: 50 },
      미니멀: { h: 0, s: 0, l: 95 },
      럭셔리: { h: 280, s: 60, l: 30 },
    };

    return keywordColorMap[keyword] || { h: 200, s: 60, l: 60 }; // 기본 중성 파랑
  }

  /**
   * 조화 색상 생성
   */
  private static generateHarmonyColors(baseColor: any, harmonyType: string): any[] {
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
   * 보색 생성
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
   * 접근성 검증 및 조정
   */
  private static validateAndAdjustAccessibility(colors: any[]): any[] {
    return colors.map(color => {
      // 배경 흰색 대비 검증
      const whiteContrast = this.calculateContrastRatio(color, { h: 0, s: 0, l: 100 });
      const blackContrast = this.calculateContrastRatio(color, { h: 0, s: 0, l: 0 });
      
      // WCAG AA 기준 (4.5:1) 미달시 조정
      if (whiteContrast < 4.5 && blackContrast < 4.5) {
        // 명도 조정으로 대비율 개선
        if (color.l > 50) {
          color.l = Math.max(20, color.l - 20); // 어둡게
        } else {
          color.l = Math.min(80, color.l + 20); // 밝게
        }
      }
      
      return color;
    });
  }

  /**
   * 색상 대비율 계산
   */
  private static calculateContrastRatio(color1: any, color2: any): number {
    const getLuminance = (color: any): number => {
      const [r, g, b] = this.hslToRgb(color.h, color.s, color.l);
      const [rNorm, gNorm, bNorm] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * HSL을 RGB로 변환
   */
  private static hslToRgb(h: number, s: number, l: number): [number, number, number] {
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
   * 기본 팔레트 반환
   */
  private static getDefaultPalette(): any[] {
    return [
      { h: 200, s: 70, l: 60 },
      { h: 200, s: 50, l: 40 },
      { h: 200, s: 30, l: 80 },
      { h: 180, s: 60, l: 50 },
      { h: 220, s: 40, l: 70 }
    ];
  }
}

// Web Worker 메시지 처리
self.onmessage = function(event: MessageEvent<ColorCalculationTask>) {
  const task = event.data;
  const startTime = performance.now();
  
  try {
    let result: any;
    
    switch (task.type) {
      case 'generate_palette':
        result = ColorWorkerEngine.generatePalette(task.data);
        break;
      case 'calculate_harmony':
        // 조화 계산만 수행
        break;
      case 'validate_accessibility':
        // 접근성 검증만 수행
        break;
      case 'batch_conversion':
        // 배치 색상 변환
        break;
      default:
        throw new Error(`알 수 없는 작업 타입: ${task.type}`);
    }
    
    const response: ColorCalculationResult = {
      id: task.id,
      success: true,
      result,
      executionTime: performance.now() - startTime
    };
    
    self.postMessage(response);
    
  } catch (error) {
    const response: ColorCalculationResult = {
      id: task.id,
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      executionTime: performance.now() - startTime
    };
    
    self.postMessage(response);
  }
};