import { KeywordMapper } from '../algorithms/keywordMapper';
import { ColorService } from './colorService';
import { HSLColor, ColorPalette, HarmonyType } from '../types/color';

export interface KeywordSearchResult {
  keyword: string;
  matchType: 'exact' | 'fuzzy' | 'contextual' | 'semantic';
  confidence: number;
  color: HSLColor;
  category: string;
  culturalContext?: string;
}

export class KeywordService {
  private keywordMapper: KeywordMapper;
  private colorService: ColorService;

  constructor(colorService: ColorService) {
    this.keywordMapper = new KeywordMapper();
    this.colorService = colorService;
  }

  async processKeyword(
    keyword: string,
    harmonyType: HarmonyType = 'complementary',
    options: {
      includeAlternatives?: boolean;
      maxAlternatives?: number;
      culturalContext?: string;
    } = {}
  ): Promise<{
    primary: KeywordSearchResult;
    palette: ColorPalette;
    alternatives?: KeywordSearchResult[];
  }> {
    // Primary keyword processing
    const primaryResult = await this.searchKeyword(keyword, options.culturalContext);
    
    // Generate palette from primary color
    const paletteResult = await this.colorService.generatePalette({
      baseColor: primaryResult.color,
      harmonyType,
      keyword,
      colorCount: 5
    });

    // Find alternatives if requested
    let alternatives: KeywordSearchResult[] | undefined;
    if (options.includeAlternatives) {
      alternatives = await this.findAlternativeKeywords(
        keyword,
        options.maxAlternatives || 3,
        options.culturalContext
      );
    }

    return {
      primary: primaryResult,
      palette: paletteResult.palette,
      alternatives
    };
  }

  private async searchKeyword(
    keyword: string,
    culturalContext?: string
  ): Promise<KeywordSearchResult> {
    try {
      // KeywordMapper의 mapKeywordToColor 메서드 사용
      const color = this.keywordMapper.mapKeywordToColor(keyword);
      
      return {
        keyword,
        matchType: 'exact',
        confidence: 1.0,
        color,
        category: 'mapped',
        culturalContext
      };
    } catch (error) {
      console.warn('키워드 색상 매핑 실패:', error);
      
      // Semantic fallback - generate based on word characteristics
      const semanticColor = this.generateSemanticColor(keyword);
      return {
        keyword,
        matchType: 'semantic',
        confidence: 0.5,
        color: semanticColor,
        category: 'generated',
        culturalContext
      };
    }
  }


  private blendColors(colors: HSLColor[]): HSLColor {
    if (colors.length === 0) {
      return { h: 0, s: 50, l: 50 };
    }

    if (colors.length === 1) {
      return colors[0];
    }

    // Average hue (handling circular nature)
    let x = 0, y = 0;
    let totalS = 0, totalL = 0;

    colors.forEach(color => {
      const radians = (color.h * Math.PI) / 180;
      x += Math.cos(radians);
      y += Math.sin(radians);
      totalS += color.s;
      totalL += color.l;
    });

    const avgHue = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
    const avgSaturation = totalS / colors.length;
    const avgLightness = totalL / colors.length;

    return {
      h: Math.round(avgHue),
      s: Math.round(avgSaturation),
      l: Math.round(avgLightness)
    };
  }

  private generateSemanticColor(keyword: string): HSLColor {
    // Generate color based on word characteristics
    let hash = 0;
    for (let i = 0; i < keyword.length; i++) {
      const char = keyword.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Use hash to generate HSL values
    const hue = Math.abs(hash) % 360;
    
    // Adjust saturation based on word length and characteristics
    let saturation = 50 + (keyword.length * 5) % 50;
    if (keyword.includes('bright') || keyword.includes('vivid')) saturation += 20;
    if (keyword.includes('pale') || keyword.includes('light')) saturation -= 20;
    
    // Adjust lightness based on semantic meaning
    let lightness = 50;
    if (keyword.includes('dark') || keyword.includes('deep')) lightness -= 20;
    if (keyword.includes('light') || keyword.includes('bright')) lightness += 20;

    return {
      h: hue,
      s: Math.max(0, Math.min(100, saturation)),
      l: Math.max(0, Math.min(100, lightness))
    };
  }

  private async findAlternativeKeywords(
    originalKeyword: string,
    maxCount: number,
    culturalContext?: string
  ): Promise<KeywordSearchResult[]> {
    const alternatives: KeywordSearchResult[] = [];
    
    // 간단한 대안 키워드 생성 (예시)
    const sampleAlternatives = ['빨강', '파랑', '초록', '노랑', '보라'];
    
    for (let i = 0; i < Math.min(maxCount, sampleAlternatives.length); i++) {
      const altKeyword = sampleAlternatives[i];
      if (altKeyword === originalKeyword) continue;
      
      try {
        const color = this.keywordMapper.mapKeywordToColor(altKeyword);
        alternatives.push({
          keyword: altKeyword,
          matchType: 'semantic',
          confidence: 0.7,
          color,
          category: 'alternative',
          culturalContext
        });
      } catch (error) {
        continue;
      }
    }

    return alternatives;
  }


  async generatePaletteFromMultipleKeywords(
    keywords: string[],
    harmonyType: HarmonyType = 'complementary'
  ): Promise<{
    combinedPalette: ColorPalette;
    individualResults: Array<{
      keyword: string;
      result: KeywordSearchResult;
      palette: ColorPalette;
    }>;
  }> {
    const individualResults = [];
    const baseColors: HSLColor[] = [];

    // Process each keyword
    for (const keyword of keywords) {
      const result = await this.processKeyword(keyword, harmonyType, {
        includeAlternatives: false
      });
      
      individualResults.push({
        keyword,
        result: result.primary,
        palette: result.palette
      });
      
      baseColors.push(result.primary.color);
    }

    // Create combined palette from blended base colors
    const blendedBaseColor = this.blendColors(baseColors);
    const paletteResult = await this.colorService.generatePalette({
      keyword: 'blended',
      baseColor: blendedBaseColor,
      harmonyType,
      colorCount: 5
    });

    return {
      combinedPalette: {
        ...paletteResult.palette,
        confidence: 0.8
      },
      individualResults
    };
  }
}