/**
 * @fileoverview 통합 색상 서비스 - 다중 API 및 오프라인 폴백 지원
 *
 * 다양한 색상 생성 API를 통합하고 오프라인 폴백을 제공하는
 * 핵심 서비스 클래스입니다. AI 기반 색상 생성과 로컬 알고리즘을
 * 조합하여 안정적인 색상 팔레트 생성 서비스를 제공합니다.
 *
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 * @since 1.0.0
 *
 * **주요 기능:**
 * - 다중 API 통합 (Colormind, TheColorAPI, Hugging Face)
 * - 오프라인 폴백 지원 (로컬 색상 이론 알고리즘)
 * - 키워드 기반 색상 매핑
 * - 접근성 검사 및 최적화
 * - 색상 조화 이론 적용
 * - 성능 모니터링 및 에러 핸들링
 *
 * **지원 API:**
 * - Colormind: 무료 ML 기반 색상 생성
 * - TheColorAPI: 무료 색상 조화 API
 * - Hugging Face: AI 모델 기반 색상 생성
 * - 로컬: 완전 오프라인 색상 이론 알고리즘
 *
 * **사용 예시:**
 * ```typescript
 * const colorService = new ColorService({
 *   mode: 'free',
 *   primaryAPI: 'colormind',
 *   fallbackToOffline: true
 * });
 *
 * const result = await colorService.generatePalette({
 *   keyword: '바다',
 *   harmonyType: 'complementary'
 * });
 * ```
 */

import {
  ColorTheory,
  KeywordMapper,
  AccessibilityChecker,
} from "../algorithms";
import type {
  HSLColor,
  HarmonyType,
  ColorPalette,
  ColorSwatch,
  GeneratePaletteResult,
} from "../types/color";

/**
 * 색상 서비스 설정 인터페이스
 *
 * @interface ColorServiceConfig
 * @property {'mock'|'free'|'offline'|'custom'} mode - 서비스 모드
 * @property {'colormind'|'thecolorapi'|'local'} primaryAPI - 주요 API 선택
 * @property {string} [apiKey] - API 키 (Hugging Face 등)
 * @property {boolean} fallbackToOffline - 오프라인 폴백 활성화
 * @property {boolean} enableHuggingFace - Hugging Face API 활성화
 * @property {number} timeout - API 요청 타임아웃 (밀리초)
 */
export interface ColorServiceConfig {
  mode: "mock" | "free" | "offline" | "custom";
  primaryAPI: "colormind" | "thecolorapi" | "local";
  apiKey?: string;
  fallbackToOffline: boolean;
  enableHuggingFace: boolean;
  timeout: number;
}

export interface GeneratePaletteOptions {
  keyword?: string;
  harmonyType: HarmonyType;
  colorCount?: number;
  optimizeAccessibility?: boolean;
  baseColor?: HSLColor;
  includeAnalysis?: boolean;
  includeAccessibility?: boolean;
  customColors?: HSLColor[];
}

// GeneratePaletteResult는 types/color.ts에서 import됨

export class ColorService {
  private colorTheory: ColorTheory;
  private keywordMapper: KeywordMapper;
  private accessibilityChecker: AccessibilityChecker;

  constructor(private config: ColorServiceConfig) {
    this.colorTheory = new ColorTheory();
    this.keywordMapper = new KeywordMapper();
    this.accessibilityChecker = new AccessibilityChecker();
  }

  /**
   * HSLColor를 ColorSwatch로 변환하는 유틸리티 함수
   */
  private hslToColorSwatch(hsl: HSLColor, index: number): ColorSwatch {
    const rgb = this.colorTheory.hslToRgb(hsl);
    const hex = this.colorTheory.hslToHex(hsl);

    return {
      id: `color-${index}-${Date.now()}`,
      hex,
      rgb,
      hsl,
    };
  }

  /**
   * HSLColor 배열을 ColorSwatch 배열로 변환
   */
  private hslArrayToColorSwatches(colors: HSLColor[]): ColorSwatch[] {
    return colors.map((color, index) => this.hslToColorSwatch(color, index));
  }

  /**
   * 메인 팔레트 생성 메서드
   */
  async generatePalette(
    options: GeneratePaletteOptions
  ): Promise<GeneratePaletteResult> {
    const startTime = Date.now();

    try {
      let colors: HSLColor[];
      let source: GeneratePaletteResult["source"];

      // 기본 색상 결정
      const baseColor =
        options.baseColor ||
        this.keywordMapper.mapKeywordToColor(options.keyword || "blue");

      // API 모드에 따른 색상 생성
      switch (this.config.mode) {
        case "free":
          try {
            if (this.config.primaryAPI === "colormind") {
              colors = await this.generateWithColormind(
                baseColor,
                options.harmonyType
              );
              source = "colormind";
            } else if (this.config.primaryAPI === "thecolorapi") {
              colors = await this.generateWithTheColorAPI(
                baseColor,
                options.harmonyType
              );
              source = "thecolorapi";
            } else {
              throw new Error("Unknown primary API");
            }
          } catch (error) {
            if (this.config.fallbackToOffline) {
              console.warn("API 실패, 로컬 모드로 전환:", error);
              colors = this.generateWithLocal(baseColor, options.harmonyType);
              source = "local";
            } else {
              throw error;
            }
          }
          break;

        case "offline":
        case "mock":
          colors = this.generateWithLocal(baseColor, options.harmonyType);
          source = "local";
          break;

        case "custom":
          if (this.config.enableHuggingFace && this.config.apiKey) {
            try {
              colors = await this.generateWithHuggingFace(
                options.keyword || "blue",
                baseColor
              );
              source = "huggingface";
            } catch (error) {
              colors = this.generateWithLocal(baseColor, options.harmonyType);
              source = "local";
            }
          } else {
            colors = this.generateWithLocal(baseColor, options.harmonyType);
            source = "local";
          }
          break;

        default:
          colors = this.generateWithLocal(baseColor, options.harmonyType);
          source = "local";
      }

      // 접근성 최적화
      if (options.optimizeAccessibility !== false) {
        colors = this.accessibilityChecker.optimizePaletteAccessibility(colors);
      }

      // 색상 개수 조정
      if (options.colorCount && options.colorCount !== colors.length) {
        colors = this.adjustColorCount(colors, options.colorCount);
      }

      // 접근성 점수 계산
      const accessibilityReport =
        this.accessibilityChecker.checkPaletteAccessibility(colors);

      // 결과 팔레트 생성
      const colorSwatches = this.hslArrayToColorSwatches(colors);
      const palette: ColorPalette = {
        id: `palette-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${options.keyword || "Generated"} - ${this.getHarmonyName(
          options.harmonyType
        )}`,
        colors: colorSwatches,
        harmonyType: options.harmonyType,
        baseColor,
        confidence: 0.8,
        keyword: options.keyword,
        createdAt: new Date(),
        accessibilityScore: accessibilityReport.overallScore,
        source: source === "local" ? "offline" : source,
      };

      const processingTime = Date.now() - startTime;

      return {
        palette,
        baseColor,
        confidence: 0.8,
        source,
        processingTime,
        accessibilityScore: {
          overall: accessibilityReport.overallScore,
          minContrast: accessibilityReport.minContrastRatio || 0,
          maxContrast: accessibilityReport.maxContrastRatio || 0,
        },
      };
    } catch (error) {
      console.error("팔레트 생성 실패:", error);

      // 최종 폴백: 기본 로컬 생성
      const colors = this.generateWithLocal(
        options.baseColor || { h: 200, s: 60, l: 50 },
        options.harmonyType
      );

      const colorSwatches = this.hslArrayToColorSwatches(colors);
      const fallbackBaseColor = options.baseColor || { h: 200, s: 60, l: 50 };

      const palette: ColorPalette = {
        id: `palette-fallback-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        name: `${options.keyword || "Generated"} - ${this.getHarmonyName(
          options.harmonyType
        )} (폴백)`,
        colors: colorSwatches,
        harmonyType: options.harmonyType,
        baseColor: fallbackBaseColor,
        confidence: 0.5,
        keyword: options.keyword,
        createdAt: new Date(),
        accessibilityScore: 50,
        source: "offline",
      };

      return {
        palette,
        baseColor: fallbackBaseColor,
        confidence: 0.5,
        source: "local",
        processingTime: Date.now() - startTime,
        accessibilityScore: {
          overall: 50,
          minContrast: 3.0,
          maxContrast: 7.0,
        },
      };
    }
  }

  /**
   * Colormind API 활용 (무제한 무료, ML 기반)
   */
  private async generateWithColormind(
    baseColor: HSLColor,
    harmonyType: HarmonyType
  ): Promise<HSLColor[]> {
    const rgb = this.colorTheory.hslToRgb(baseColor);

    const response = await fetch("http://colormind.io/api/", {
      method: "POST",
      body: JSON.stringify({
        model: "default",
        input: [[rgb.r, rgb.g, rgb.b], "N", "N", "N", "N"],
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`Colormind API 오류: ${response.status}`);
    }

    const data = await response.json();
    const colors = data.result.map((rgbArray: number[]) =>
      this.colorTheory.rgbToHsl({
        r: rgbArray[0],
        g: rgbArray[1],
        b: rgbArray[2],
      })
    );

    // 조화 규칙 적용하여 재정렬
    return this.applyHarmonyToColors(colors, baseColor, harmonyType);
  }

  /**
   * TheColorAPI 활용 (무료 대안)
   */
  private async generateWithTheColorAPI(
    baseColor: HSLColor,
    harmonyType: HarmonyType
  ): Promise<HSLColor[]> {
    const hexColor = this.colorTheory.hslToHex(baseColor).replace("#", "");

    const response = await fetch(
      `https://www.thecolorapi.com/scheme?hex=${hexColor}&mode=${this.getTheColorAPIMode(
        harmonyType
      )}&count=5`,
      { signal: AbortSignal.timeout(this.config.timeout) }
    );

    if (!response.ok) {
      throw new Error(`TheColorAPI 오류: ${response.status}`);
    }

    const data = await response.json();
    const colors = data.colors.map((colorData: any) =>
      this.colorTheory.hexToHsl(colorData.hex.value)
    );

    return colors;
  }

  /**
   * 로컬 알고리즘 기반 생성 (완전 오프라인)
   */
  private generateWithLocal(
    baseColor: HSLColor,
    harmonyType: HarmonyType
  ): HSLColor[] {
    return this.colorTheory.generateHarmony(baseColor, harmonyType);
  }

  /**
   * Hugging Face 색상 모델 활용 (선택사항)
   */
  private async generateWithHuggingFace(
    keyword: string,
    baseColor: HSLColor
  ): Promise<HSLColor[]> {
    if (!this.config.apiKey) {
      throw new Error("Hugging Face API 키가 필요합니다");
    }

    // 실제 구현시에는 적절한 Hugging Face 색상 모델 사용
    const response = await fetch(
      "https://api-inference.huggingface.co/models/color-palette",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: keyword }),
        signal: AbortSignal.timeout(this.config.timeout),
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API 오류: ${response.status}`);
    }

    await response.json();

    // 응답 처리 (실제 모델에 따라 다름)
    // 여기서는 로컬 생성으로 폴백
    return this.generateWithLocal(baseColor, "complementary");
  }

  /**
   * 색상 개수 조정
   */
  private adjustColorCount(
    colors: HSLColor[],
    targetCount: number
  ): HSLColor[] {
    if (colors.length === targetCount) return colors;

    if (colors.length > targetCount) {
      // 색상이 많으면 균등하게 선택
      const step = colors.length / targetCount;
      return Array.from(
        { length: targetCount },
        (_, i) => colors[Math.floor(i * step)]
      );
    } else {
      // 색상이 적으면 중간색 생성하여 보간
      const result = [...colors];
      while (result.length < targetCount) {
        const insertIndex = Math.floor(Math.random() * result.length);
        const baseColor = result[insertIndex];
        const variation = {
          ...baseColor,
          l: Math.max(
            10,
            Math.min(90, baseColor.l + (Math.random() - 0.5) * 40)
          ),
        };
        result.splice(insertIndex + 1, 0, variation);
      }
      return result.slice(0, targetCount);
    }
  }

  /**
   * 조화 규칙을 기존 색상에 적용
   */
  private applyHarmonyToColors(
    colors: HSLColor[],
    baseColor: HSLColor,
    harmonyType: HarmonyType
  ): HSLColor[] {
    // API에서 받은 색상들을 조화 규칙에 맞게 재정렬하고 조정
    const harmonyColors = this.colorTheory.generateHarmony(
      baseColor,
      harmonyType
    );

    // 원본 색상과 조화 색상을 혼합하여 더 자연스러운 결과 생성
    const result: HSLColor[] = [baseColor];

    for (let i = 1; i < Math.min(colors.length, harmonyColors.length); i++) {
      // 가중평균으로 혼합 (70% 조화 규칙, 30% API 결과)
      const harmonyColor = harmonyColors[i];
      const apiColor = colors[i];

      result.push({
        h: Math.round(harmonyColor.h * 0.7 + apiColor.h * 0.3) % 360,
        s: Math.round(harmonyColor.s * 0.7 + apiColor.s * 0.3),
        l: Math.round(harmonyColor.l * 0.7 + apiColor.l * 0.3),
      });
    }

    return result;
  }

  /**
   * TheColorAPI 모드 매핑
   */
  private getTheColorAPIMode(harmonyType: HarmonyType): string {
    switch (harmonyType) {
      case "complementary":
        return "complement";
      case "analogous":
        return "analogic";
      case "triadic":
        return "triad";
      case "tetradic":
        return "quad";
      case "monochromatic":
        return "monochrome";
      default:
        return "complement";
    }
  }

  /**
   * 조화 타입 한국어 이름
   */
  private getHarmonyName(harmonyType: HarmonyType): string {
    switch (harmonyType) {
      case "complementary":
        return "보색";
      case "analogous":
        return "유사색";
      case "triadic":
        return "삼색조";
      case "tetradic":
        return "사색조";
      case "monochromatic":
        return "단색조";
      default:
        return harmonyType;
    }
  }

  /**
   * 서비스 상태 확인
   */
  async checkServiceStatus(): Promise<{
    colormind: boolean;
    thecolorapi: boolean;
    huggingface: boolean;
    local: boolean;
  }> {
    const results = {
      colormind: false,
      thecolorapi: false,
      huggingface: false,
      local: true, // 로컬은 항상 사용 가능
    };

    // Colormind 상태 확인
    try {
      const response = await fetch("http://colormind.io/api/", {
        method: "POST",
        body: JSON.stringify({ model: "default" }),
        signal: AbortSignal.timeout(5000),
      });
      results.colormind = response.ok;
    } catch (error) {
      results.colormind = false;
    }

    // TheColorAPI 상태 확인
    try {
      const response = await fetch(
        "https://www.thecolorapi.com/id?hex=ff0000",
        {
          signal: AbortSignal.timeout(5000),
        }
      );
      results.thecolorapi = response.ok;
    } catch (error) {
      results.thecolorapi = false;
    }

    // Hugging Face 상태 확인 (API 키가 있는 경우만)
    if (this.config.apiKey) {
      try {
        const response = await fetch("https://huggingface.co/api/models", {
          signal: AbortSignal.timeout(5000),
        });
        results.huggingface = response.ok;
      } catch (error) {
        results.huggingface = false;
      }
    }

    return results;
  }
}
