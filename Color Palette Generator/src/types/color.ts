/**
 * @fileoverview 색상 시스템의 핵심 타입 정의
 * 
 * 이 파일은 Color Palette Generator 애플리케이션에서 사용하는
 * 모든 색상 관련 데이터 구조와 타입을 정의합니다.
 * 
 * @author AI Color Palette Generator Team
 * @version 1.0.0
 */

/**
 * HSL 색상 모델을 나타내는 인터페이스
 * 
 * HSL(색조, 채도, 밝기)은 색상을 직관적으로 표현할 수 있는 색상 모델입니다.
 * 색상 이론 계산과 사용자 친화적인 색상 조정에 특히 유용합니다.
 * 
 * @interface HSLColor
 * @example
 * ```typescript
 * const oceanBlue: HSLColor = { h: 200, s: 70, l: 50 };
 * const brightRed: HSLColor = { h: 0, s: 100, l: 50 };
 * ```
 */
export interface HSLColor {
  /** 색조 (Hue): 색상환에서의 위치 (0-360도) */
  h: number;
  
  /** 채도 (Saturation): 색상의 순수함 정도 (0-100%) */
  s: number;
  
  /** 명도 (Lightness): 색상의 밝기 정도 (0-100%) */
  l: number;
}

/**
 * RGB 색상 모델을 나타내는 인터페이스
 * 
 * RGB는 디지털 디스플레이에서 가장 널리 사용되는 색상 모델로,
 * 빨강, 초록, 파랑 광원의 조합으로 색상을 표현합니다.
 * 
 * @interface RGBColor
 * @example
 * ```typescript
 * const pureRed: RGBColor = { r: 255, g: 0, b: 0 };
 * const white: RGBColor = { r: 255, g: 255, b: 255 };
 * ```
 */
export interface RGBColor {
  /** 빨강 채널의 강도 (0-255) */
  r: number;
  
  /** 초록 채널의 강도 (0-255) */
  g: number;
  
  /** 파랑 채널의 강도 (0-255) */
  b: number;
}

/**
 * 색상 견본(swatch)을 나타내는 인터페이스
 * 
 * ColorSwatch는 하나의 색상에 대한 모든 정보를 담고 있는 복합 객체입니다.
 * 다양한 색상 모델과 메타데이터를 포함하여 색상을 완전히 기술합니다.
 * 
 * @interface ColorSwatch
 * @example
 * ```typescript
 * const swatch: ColorSwatch = {
 *   id: 'ocean-blue-1',
 *   hex: '#3498db',
 *   rgb: { r: 52, g: 152, b: 219 },
 *   hsl: { h: 200, s: 70, l: 53 },
 *   population: 1250,
 *   name: '오션 블루'
 * };
 * ```
 */
export interface ColorSwatch {
  /** 색상의 고유 식별자 */
  id: string;
  
  /** 16진수 색상 코드 (#RRGGBB 형식) */
  hex: string;
  
  /** RGB 색상 값 */
  rgb: RGBColor;
  
  /** HSL 색상 값 */
  hsl: HSLColor;
  
  /** 이미지에서 추출된 색상의 경우 해당 색상이 차지하는 픽셀 수 (선택사항) */
  population?: number;
  
  /** 색상의 사용자 친화적인 이름 (선택사항) */
  name?: string;
}

/**
 * 색상 조화(harmony) 이론의 타입 정의
 * 
 * 색상 이론에서 사용되는 주요 조화 규칙들을 나타냅니다.
 * 각 타입은 서로 다른 미학적 효과와 감정적 반응을 만들어냅니다.
 * 
 * @typedef {string} HarmonyType
 * 
 * - `complementary`: 보색 조화 - 색상환에서 정반대 위치의 색상들
 * - `analogous`: 유사색 조화 - 색상환에서 인접한 색상들  
 * - `triadic`: 삼원색 조화 - 색상환을 3등분한 위치의 색상들
 * - `tetradic`: 사원색 조화 - 색상환에서 직사각형 형태로 배치된 색상들
 * - `monochromatic`: 단색 조화 - 같은 색조의 다른 명도/채도 색상들
 * 
 * @example
 * ```typescript
 * const harmony: HarmonyType = 'complementary';
 * const palette = generatePalette(baseColor, harmony);
 * ```
 */
export type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic';

export interface ColorPalette {
  id: string;
  name?: string;
  colors: ColorSwatch[];
  harmonyType: HarmonyType;
  baseColor: HSLColor; // 필수 속성 추가
  confidence: number; // 필수 속성 추가 (0-1)
  keyword?: string;
  createdAt?: Date;
  accessibilityScore: number;
  source?: 'offline' | 'colormind' | 'thecolorapi' | 'huggingface' | 'image' | 'keyword';
}

export interface GeneratePaletteResult {
  palette: ColorPalette;
  baseColor: HSLColor;
  confidence: number;
  processingTime: number;
  source: 'local' | 'colormind' | 'thecolorapi' | 'huggingface';
  accessibilityScore?: {
    overall: number;
    minContrast: number;
    maxContrast: number;
  };
  accessibility?: {
    overallScore: number;
    averageContrast: number;
    wcagCompliance: 'AAA' | 'AA' | 'FAIL';
    recommendations: string[];
  };
  metadata?: {
    keyword?: string;
    harmonyType?: HarmonyType;
    mood?: string;
    tags?: string[];
  };
  error?: string;
}

export interface AccessibilityResult {
  contrastRatio: number;
  wcagAA: boolean; // 4.5:1 이상
  wcagAAA: boolean; // 7:1 이상
  recommendations?: string[];
}

export interface ExtractedPalette {
  dominant: HSLColor;
  vibrant: HSLColor;
  muted: HSLColor;
  darkVibrant: HSLColor;
  darkMuted: HSLColor;
  lightVibrant: HSLColor;
  lightMuted: HSLColor;
}