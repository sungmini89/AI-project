/**
 * @fileoverview 색상 이론 기반 팔레트 생성 엔진 (완전 오프라인)
 *
 * 5가지 색상 조화 규칙을 HSL 색공간에서 구현한 완전 오프라인
 * 색상 팔레트 생성 엔진입니다. 인터넷 연결 없이도 작동하며,
 * 색상 이론의 과학적 원리를 바탕으로 조화로운 색상 조합을 생성합니다.
 *
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 * @since 1.0.0
 *
 * **주요 기능:**
 * - 5가지 색상 조화 규칙 구현 (보색, 유사색, 삼원색, 사원색, 단색)
 * - HSL ↔ RGB 색상 공간 변환
 * - 색상 간 거리 계산 및 균형성 평가
 * - 완전 오프라인 작동 (API 의존성 없음)
 * - 접근성 고려한 색상 조합 생성
 *
 * **색상 조화 규칙:**
 * - 보색 조화 (Complementary): 180도 대각선 색상
 * - 유사색 조화 (Analogous): ±30도 인접 색상
 * - 삼원색 조화 (Triadic): 120도 간격 3색상
 * - 사원색 조화 (Tetradic): 90도 간격 4색상
 * - 단색 조화 (Monochromatic): 명도/채도 변화
 *
 * **사용 예시:**
 * ```typescript
 * const colorTheory = new ColorTheory();
 * const palette = colorTheory.generateHarmony(
 *   { h: 200, s: 70, l: 50 },
 *   'complementary'
 * );
 * ```
 */

import type { HSLColor, RGBColor, HarmonyType } from "../types/color";

/**
 * 색상 이론 기반 팔레트 생성 엔진 클래스
 *
 * HSL 색공간에서 색상 이론의 과학적 원리를 적용하여
 * 조화로운 색상 팔레트를 생성하는 완전 오프라인 엔진입니다.
 *
 * @class ColorTheory
 *
 * **핵심 메서드:**
 * - `generateHarmony()`: 조화 규칙에 따른 팔레트 생성
 * - `hslToRgb()`: HSL을 RGB로 변환
 * - `rgbToHsl()`: RGB를 HSL로 변환
 * - `evaluatePaletteBalance()`: 팔레트 균형성 평가
 *
 * @example
 * ```typescript
 * const engine = new ColorTheory();
 * const colors = engine.generateComplementary({ h: 0, s: 100, l: 50 });
 * ```
 */
export class ColorTheory {
  /**
   * 보색 조화 (Complementary): 180도 대각
   * 강한 대비 효과, 시각적 임팩트가 큰 조합
   */
  generateComplementary(baseColor: HSLColor): HSLColor[] {
    const complementHue = (baseColor.h + 180) % 360;

    return [
      baseColor, // 기본 색상
      { h: complementHue, s: baseColor.s, l: baseColor.l }, // 보색
      // 중간 톤 추가로 5-6개 완성
      {
        h: baseColor.h,
        s: Math.max(baseColor.s * 0.7, 20),
        l: Math.min(baseColor.l + 20, 90),
      },
      {
        h: complementHue,
        s: Math.max(baseColor.s * 0.7, 20),
        l: Math.min(baseColor.l + 20, 90),
      },
      { h: baseColor.h, s: Math.max(baseColor.s * 0.3, 10), l: 90 }, // 연한 톤
    ];
  }

  /**
   * 유사색 조화 (Analogous): ±30도 인접
   * 자연스럽고 조화로운 느낌, 편안한 조합
   */
  generateAnalogous(baseColor: HSLColor): HSLColor[] {
    return [
      { h: (baseColor.h - 60 + 360) % 360, s: baseColor.s, l: baseColor.l },
      { h: (baseColor.h - 30 + 360) % 360, s: baseColor.s, l: baseColor.l },
      baseColor, // 기본 색상
      { h: (baseColor.h + 30) % 360, s: baseColor.s, l: baseColor.l },
      { h: (baseColor.h + 60) % 360, s: baseColor.s, l: baseColor.l },
    ];
  }

  /**
   * 삼색조 조화 (Triadic): 120도 간격
   * 균형잡힌 활기찬 조합, 다채로우면서도 조화로움
   */
  generateTriadic(baseColor: HSLColor): HSLColor[] {
    return [
      baseColor, // 기본 색상
      { h: (baseColor.h + 120) % 360, s: baseColor.s, l: baseColor.l },
      { h: (baseColor.h + 240) % 360, s: baseColor.s, l: baseColor.l },
      // 추가 톤으로 6개 완성
      {
        h: baseColor.h,
        s: Math.max(baseColor.s * 0.6, 15),
        l: Math.min(baseColor.l + 15, 85),
      },
      {
        h: (baseColor.h + 120) % 360,
        s: Math.max(baseColor.s * 0.6, 15),
        l: Math.min(baseColor.l + 15, 85),
      },
      {
        h: (baseColor.h + 240) % 360,
        s: Math.max(baseColor.s * 0.6, 15),
        l: Math.min(baseColor.l + 15, 85),
      },
    ];
  }

  /**
   * 사색조 조화 (Tetradic): 90도 간격
   * 풍부하고 복잡한 조합, 전문가용 팔레트
   */
  generateTetradic(baseColor: HSLColor): HSLColor[] {
    return [
      baseColor, // 기본 색상
      { h: (baseColor.h + 90) % 360, s: baseColor.s, l: baseColor.l },
      { h: (baseColor.h + 180) % 360, s: baseColor.s, l: baseColor.l },
      { h: (baseColor.h + 270) % 360, s: baseColor.s, l: baseColor.l },
      // 보조 톤 2개 추가
      { h: baseColor.h, s: Math.max(baseColor.s * 0.5, 10), l: 85 },
      {
        h: (baseColor.h + 180) % 360,
        s: Math.max(baseColor.s * 0.5, 10),
        l: 85,
      },
    ];
  }

  /**
   * 단색조 조화 (Monochromatic): 명도/채도 변화
   * 세련되고 통일감 있는 조합, 미니멀 디자인에 적합
   */
  generateMonochromatic(baseColor: HSLColor): HSLColor[] {
    return [
      { h: baseColor.h, s: baseColor.s, l: Math.max(baseColor.l - 40, 10) }, // 어두운
      { h: baseColor.h, s: baseColor.s, l: Math.max(baseColor.l - 20, 20) },
      baseColor, // 기본 색상
      {
        h: baseColor.h,
        s: Math.max(baseColor.s * 0.7, 20),
        l: Math.min(baseColor.l + 15, 80),
      },
      {
        h: baseColor.h,
        s: Math.max(baseColor.s * 0.4, 10),
        l: Math.min(baseColor.l + 30, 95),
      }, // 밝은
    ];
  }

  /**
   * 조화 규칙에 따라 팔레트 생성
   */
  generateHarmony(baseColor: HSLColor, harmonyType: HarmonyType): HSLColor[] {
    switch (harmonyType) {
      case "complementary":
        return this.generateComplementary(baseColor);
      case "analogous":
        return this.generateAnalogous(baseColor);
      case "triadic":
        return this.generateTriadic(baseColor);
      case "tetradic":
        return this.generateTetradic(baseColor);
      case "monochromatic":
        return this.generateMonochromatic(baseColor);
      default:
        return [baseColor];
    }
  }

  /**
   * 완전한 팔레트 생성 (HSL 색상 배열 반환)
   * 실제 ColorPalette 객체는 ColorService에서 생성함
   */
  generatePaletteColors(
    baseColor: HSLColor,
    harmonyType: HarmonyType
  ): HSLColor[] {
    return this.generateHarmony(baseColor, harmonyType);
  }

  /**
   * HSL을 RGB로 변환
   */
  hslToRgb(hsl: HSLColor): RGBColor {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // 무채색
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  /**
   * RGB를 HSL로 변환
   */
  rgbToHsl(rgb: RGBColor): HSLColor {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // 무채색
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  /**
   * HSL을 HEX로 변환
   */
  hslToHex(hsl: HSLColor): string {
    const rgb = this.hslToRgb(hsl);
    return `#${rgb.r.toString(16).padStart(2, "0")}${rgb.g
      .toString(16)
      .padStart(2, "0")}${rgb.b.toString(16).padStart(2, "0")}`;
  }

  /**
   * HEX를 HSL로 변환
   */
  hexToHsl(hex: string): HSLColor {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      throw new Error("Invalid hex color");
    }

    const rgb: RGBColor = {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };

    return this.rgbToHsl(rgb);
  }

  /**
   * 색상 간의 거리 계산 (색공간에서의 유클리드 거리)
   */
  calculateColorDistance(color1: HSLColor, color2: HSLColor): number {
    const dH = Math.min(
      Math.abs(color1.h - color2.h),
      360 - Math.abs(color1.h - color2.h)
    );
    const dS = Math.abs(color1.s - color2.s);
    const dL = Math.abs(color1.l - color2.l);

    return Math.sqrt(dH * dH + dS * dS + dL * dL);
  }

  /**
   * 팔레트의 균형성 평가 (0-1 점수)
   * 색상 간의 적절한 거리와 분포를 평가
   */
  evaluatePaletteBalance(colors: HSLColor[]): number {
    if (colors.length < 2) return 1;

    let totalDistance = 0;
    let pairCount = 0;

    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        totalDistance += this.calculateColorDistance(colors[i], colors[j]);
        pairCount++;
      }
    }

    const averageDistance = totalDistance / pairCount;
    // 이상적인 거리 범위에서의 점수 계산
    const idealDistance = 50; // 조정 가능한 값

    return Math.max(
      0,
      1 - Math.abs(averageDistance - idealDistance) / idealDistance
    );
  }
}
