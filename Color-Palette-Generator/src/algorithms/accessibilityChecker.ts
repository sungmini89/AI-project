/**
 * @fileoverview WCAG 접근성 검증 시스템
 *
 * 색상 대비율 계산 및 웹 콘텐츠 접근성 가이드라인(WCAG) 준수를
 * 확인하는 종합적인 접근성 검증 시스템입니다. 색맹 시뮬레이션과
 * 접근 가능한 색상 제안 기능을 포함합니다.
 *
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 * @since 1.0.0
 *
 * **주요 기능:**
 * - WCAG 2.1 AA/AAA 기준 대비율 계산
 * - 색맹 시뮬레이션 (적색맹, 녹색맹, 청색맹)
 * - 접근성 점수 계산 및 평가
 * - 접근 가능한 색상 자동 제안
 * - 팔레트 전체 접근성 최적화
 * - 상대 명도 계산 (sRGB 색공간)
 *
 * **지원 색맹 유형:**
 * - Protanopia (적색맹, 1형): L-cone 결함
 * - Deuteranopia (녹색맹, 2형): M-cone 결함
 * - Tritanopia (청색맹, 3형): S-cone 결함
 *
 * **WCAG 기준:**
 * - AA 레벨: 일반 텍스트 4.5:1, 큰 텍스트 3:1
 * - AAA 레벨: 일반 텍스트 7:1, 큰 텍스트 4.5:1
 *
 * **사용 예시:**
 * ```typescript
 * const checker = new AccessibilityChecker();
 * const report = checker.checkPaletteAccessibility(colors);
 * const simulations = checker.simulateColorBlindness(color);
 * ```
 */

import type { HSLColor, RGBColor } from "../types/color";
import { ColorTheory } from "./colorTheory";

/**
 * 대비율 검사 결과 인터페이스
 *
 * @interface ContrastResult
 * @property {number} ratio - 계산된 대비율
 * @property {'AAA'|'AA'|'FAIL'} level - WCAG 준수 레벨
 * @property {boolean} isLargeText - 큰 텍스트 여부
 * @property {boolean} passed - 기준 통과 여부
 */
export interface ContrastResult {
  ratio: number;
  level: "AAA" | "AA" | "FAIL";
  isLargeText: boolean;
  passed: boolean;
}

export interface AccessibilityReport {
  overallScore: number; // 0-100 점수
  totalTests: number;
  passedTests: number;
  failedTests: number;
  contrastResults: ContrastResult[];
  recommendations: string[];
  colorBlindnessScore: number; // 색맹 친화도 점수
  minContrastRatio?: number; // 최소 대비율
  maxContrastRatio?: number; // 최대 대비율
}

export interface ColorBlindSimulation {
  type: "protanopia" | "deuteranopia" | "tritanopia" | "normal";
  name: string;
  description: string;
  simulatedColor: RGBColor;
}

export class AccessibilityChecker {
  private colorTheory = new ColorTheory();

  /**
   * 두 색상 간의 WCAG 대비율 계산
   * 공식: (L1 + 0.05) / (L2 + 0.05) (L1이 더 밝은 색상)
   */
  calculateContrastRatio(color1: HSLColor, color2: HSLColor): number {
    const rgb1 = this.colorTheory.hslToRgb(color1);
    const rgb2 = this.colorTheory.hslToRgb(color2);

    const luminance1 = this.calculateRelativeLuminance(rgb1);
    const luminance2 = this.calculateRelativeLuminance(rgb2);

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * 상대 명도 계산 (WCAG 공식)
   */
  private calculateRelativeLuminance(rgb: RGBColor): number {
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r =
      rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g =
      gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b =
      bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * 대비율 기반 접근성 레벨 평가
   */
  evaluateContrastLevel(
    contrastRatio: number,
    isLargeText: boolean = false
  ): ContrastResult {
    const aaThreshold = isLargeText ? 3.0 : 4.5;
    const aaaThreshold = isLargeText ? 4.5 : 7.0;

    let level: "AAA" | "AA" | "FAIL";
    let passed: boolean;

    if (contrastRatio >= aaaThreshold) {
      level = "AAA";
      passed = true;
    } else if (contrastRatio >= aaThreshold) {
      level = "AA";
      passed = true;
    } else {
      level = "FAIL";
      passed = false;
    }

    return {
      ratio: contrastRatio,
      level,
      isLargeText,
      passed,
    };
  }

  /**
   * 팔레트 전체 접근성 검증
   */
  checkPaletteAccessibility(
    colors: HSLColor[],
    backgroundColor: HSLColor = { h: 0, s: 0, l: 100 } // 기본 흰색 배경
  ): AccessibilityReport {
    const contrastResults: ContrastResult[] = [];
    const recommendations: string[] = [];

    // 모든 색상과 배경색의 대비율 확인
    for (const color of colors) {
      const contrastRatio = this.calculateContrastRatio(color, backgroundColor);

      // 일반 텍스트와 큰 텍스트 모두 확인
      const normalTextResult = this.evaluateContrastLevel(contrastRatio, false);
      const largeTextResult = this.evaluateContrastLevel(contrastRatio, true);

      contrastResults.push(normalTextResult, largeTextResult);

      // 실패한 경우 개선 제안
      if (!normalTextResult.passed) {
        const colorHex = this.colorTheory.hslToHex(color);
        recommendations.push(
          `${colorHex} 색상의 대비율이 낮습니다 (${contrastRatio.toFixed(
            1
          )}:1). 더 어둡거나 밝은 색상을 고려해보세요.`
        );
      }
    }

    // 색상 간의 상호 대비율도 확인 (색상끼리 사용할 경우)
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const contrastRatio = this.calculateContrastRatio(colors[i], colors[j]);
        const result = this.evaluateContrastLevel(contrastRatio, false);
        contrastResults.push(result);
      }
    }

    // 색맹 친화도 점수 계산
    const colorBlindnessScore = this.calculateColorBlindnessScore(colors);

    // 전체 점수 계산
    const passedTests = contrastResults.filter(
      (result) => result.passed
    ).length;
    const totalTests = contrastResults.length;
    const overallScore = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    // 추가 권장사항
    if (colorBlindnessScore < 70) {
      recommendations.push(
        "색맹 사용자를 위해 색상 외에 패턴이나 텍스트 라벨을 함께 사용하는 것을 권장합니다."
      );
    }

    if (overallScore < 80) {
      recommendations.push(
        "전체적인 접근성 개선을 위해 색상의 명암대비를 높이는 것을 고려해보세요."
      );
    }

    return {
      overallScore: Math.round(overallScore),
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      contrastResults,
      recommendations,
      colorBlindnessScore: Math.round(colorBlindnessScore),
    };
  }

  /**
   * 색맹 시뮬레이션
   */
  simulateColorBlindness(color: HSLColor): ColorBlindSimulation[] {
    const rgb = this.colorTheory.hslToRgb(color);
    const simulations: ColorBlindSimulation[] = [];

    // 정상 시야
    simulations.push({
      type: "normal",
      name: "일반 시야",
      description: "색각 이상이 없는 일반적인 시야",
      simulatedColor: rgb,
    });

    // 적록색맹 (Protanopia) - L-cone 결함
    simulations.push({
      type: "protanopia",
      name: "적색맹 (1형)",
      description: "빨간색을 인식하기 어려운 색각 이상",
      simulatedColor: this.simulateProtanopia(rgb),
    });

    // 적록색맹 (Deuteranopia) - M-cone 결함
    simulations.push({
      type: "deuteranopia",
      name: "녹색맹 (2형)",
      description: "초록색을 인식하기 어려운 색각 이상",
      simulatedColor: this.simulateDeuteranopia(rgb),
    });

    // 청황색맹 (Tritanopia) - S-cone 결함
    simulations.push({
      type: "tritanopia",
      name: "청색맹 (3형)",
      description: "파란색을 인식하기 어려운 색각 이상",
      simulatedColor: this.simulateTritanopia(rgb),
    });

    return simulations;
  }

  /**
   * 적색맹 (Protanopia) 시뮬레이션
   */
  private simulateProtanopia(rgb: RGBColor): RGBColor {
    return {
      r: Math.round(0.567 * rgb.r + 0.433 * rgb.g),
      g: Math.round(0.558 * rgb.g + 0.442 * rgb.b),
      b: rgb.b,
    };
  }

  /**
   * 녹색맹 (Deuteranopia) 시뮬레이션
   */
  private simulateDeuteranopia(rgb: RGBColor): RGBColor {
    return {
      r: Math.round(0.625 * rgb.r + 0.375 * rgb.g),
      g: Math.round(0.7 * rgb.g + 0.3 * rgb.b),
      b: rgb.b,
    };
  }

  /**
   * 청색맹 (Tritanopia) 시뮬레이션
   */
  private simulateTritanopia(rgb: RGBColor): RGBColor {
    return {
      r: rgb.r,
      g: Math.round(0.95 * rgb.g + 0.05 * rgb.b),
      b: Math.round(0.433 * rgb.b + 0.567 * rgb.r),
    };
  }

  /**
   * 색맹 친화도 점수 계산
   */
  private calculateColorBlindnessScore(colors: HSLColor[]): number {
    if (colors.length < 2) return 100;

    let totalScore = 0;
    let comparisons = 0;

    // 각 색맹 타입별로 색상 간 구별 가능성 확인
    const colorBlindTypes: Array<"protanopia" | "deuteranopia" | "tritanopia"> =
      ["protanopia", "deuteranopia", "tritanopia"];

    for (const type of colorBlindTypes) {
      for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
          const original1 = this.colorTheory.hslToRgb(colors[i]);
          const original2 = this.colorTheory.hslToRgb(colors[j]);

          const simulated1 = this.getSimulatedColor(original1, type);
          const simulated2 = this.getSimulatedColor(original2, type);

          // 시뮬레이션된 색상 간의 차이 계산
          const difference = this.calculateColorDifference(
            simulated1,
            simulated2
          );

          // 구별 가능성 점수 (0-100)
          const distinguishabilityScore = Math.min(difference * 5, 100);
          totalScore += distinguishabilityScore;
          comparisons++;
        }
      }
    }

    return comparisons > 0 ? totalScore / comparisons : 100;
  }

  /**
   * 색맹 타입별 시뮬레이션 적용
   */
  private getSimulatedColor(
    rgb: RGBColor,
    type: "protanopia" | "deuteranopia" | "tritanopia"
  ): RGBColor {
    switch (type) {
      case "protanopia":
        return this.simulateProtanopia(rgb);
      case "deuteranopia":
        return this.simulateDeuteranopia(rgb);
      case "tritanopia":
        return this.simulateTritanopia(rgb);
      default:
        return rgb;
    }
  }

  /**
   * RGB 색상 간의 차이 계산 (유클리드 거리)
   */
  private calculateColorDifference(color1: RGBColor, color2: RGBColor): number {
    const dr = color1.r - color2.r;
    const dg = color1.g - color2.g;
    const db = color1.b - color2.b;

    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  /**
   * 접근 가능한 색상 제안
   */
  suggestAccessibleColor(
    originalColor: HSLColor,
    backgroundColor: HSLColor,
    targetLevel: "AA" | "AAA" = "AA"
  ): HSLColor {
    const targetRatio = targetLevel === "AAA" ? 7.0 : 4.5;
    let adjustedColor = { ...originalColor };

    // 현재 대비율 확인
    let currentRatio = this.calculateContrastRatio(
      adjustedColor,
      backgroundColor
    );

    if (currentRatio >= targetRatio) {
      return adjustedColor; // 이미 기준을 만족
    }

    // 명도 조정으로 대비율 개선 시도
    const step = adjustedColor.l < 50 ? -5 : 5; // 어두운 색은 더 어둡게, 밝은 색은 더 밝게

    for (let i = 0; i < 20; i++) {
      // 최대 20번 시도
      adjustedColor.l = Math.max(0, Math.min(100, adjustedColor.l + step));
      currentRatio = this.calculateContrastRatio(
        adjustedColor,
        backgroundColor
      );

      if (currentRatio >= targetRatio) {
        break;
      }
    }

    return adjustedColor;
  }

  /**
   * 팔레트 접근성 최적화
   */
  optimizePaletteAccessibility(colors: HSLColor[]): HSLColor[] {
    const backgroundColor: HSLColor = { h: 0, s: 0, l: 100 }; // 흰색 배경 기준

    return colors.map((color) =>
      this.suggestAccessibleColor(color, backgroundColor, "AA")
    );
  }
}
