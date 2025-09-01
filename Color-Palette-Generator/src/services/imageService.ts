import { ImageColorExtractor } from '../algorithms/imageColorExtractor';
import { ColorService } from './colorService';
import { HSLColor, ColorPalette, HarmonyType } from '../types/color';

export interface ImageAnalysisResult {
  extractedColors: {
    dominant: HSLColor;
    vibrant: HSLColor;
    muted: HSLColor;
    darkVibrant: HSLColor;
    darkMuted: HSLColor;
    lightVibrant: HSLColor;
    lightMuted: HSLColor;
  };
  generatedPalettes: {
    [key in HarmonyType]: ColorPalette;
  };
  imageMetadata: {
    filename: string;
    size: number;
    dimensions?: { width: number; height: number };
    format: string;
  };
  dominantColorAnalysis: {
    colorHarmonyRecommendation: HarmonyType;
    accessibilityScore: number;
    moodAnalysis: string[];
  };
}

export interface ProcessingOptions {
  enabledHarmonies?: HarmonyType[];
  quality?: 'low' | 'medium' | 'high';
  colorCount?: number;
  enableMoodAnalysis?: boolean;
}

export class ImageService {
  private imageColorExtractor: ImageColorExtractor;
  private colorService: ColorService;

  constructor(colorService: ColorService) {
    this.imageColorExtractor = new ImageColorExtractor();
    this.colorService = colorService;
  }

  async processImage(
    imageFile: File,
    options: ProcessingOptions = {}
  ): Promise<ImageAnalysisResult> {
    // Set default options
    const {
      enabledHarmonies = ['complementary', 'analogous', 'triadic', 'tetradic', 'monochromatic'],
      quality: _quality = 'medium',
      colorCount = 5,
      enableMoodAnalysis = true
    } = options;

    // Extract colors from image
    const extractedPalette = await this.imageColorExtractor.extractPalette(imageFile);

    // Get image metadata
    const imageMetadata = await this.getImageMetadata(imageFile);

    // Generate palettes for each harmony type
    const generatedPalettes: Partial<{[key in HarmonyType]: ColorPalette}> = {};
    
    for (const harmonyType of enabledHarmonies) {
      try {
        const paletteResult = await this.colorService.generatePalette({
          baseColor: extractedPalette.dominant,
          harmonyType,
          colorCount: colorCount
        });
        generatedPalettes[harmonyType] = paletteResult.palette;
      } catch (error) {
        console.warn(`Failed to generate ${harmonyType} palette:`, error);
      }
    }

    // Analyze dominant color and provide recommendations
    const dominantColorAnalysis = this.analyzeDominantColor(
      extractedPalette.dominant,
      extractedPalette,
      enableMoodAnalysis
    );

    return {
      extractedColors: extractedPalette,
      generatedPalettes: generatedPalettes as {[key in HarmonyType]: ColorPalette},
      imageMetadata,
      dominantColorAnalysis
    };
  }


  private async getImageMetadata(imageFile: File): Promise<ImageAnalysisResult['imageMetadata']> {
    const metadata: ImageAnalysisResult['imageMetadata'] = {
      filename: imageFile.name,
      size: imageFile.size,
      format: imageFile.type
    };

    try {
      // Get image dimensions
      const dimensions = await this.getImageDimensions(imageFile);
      metadata.dimensions = dimensions;
    } catch (error) {
      console.warn('Could not get image dimensions:', error);
    }

    return metadata;
  }

  private getImageDimensions(imageFile: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageFile);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  private analyzeDominantColor(
    dominantColor: HSLColor,
    extractedColors: ImageAnalysisResult['extractedColors'],
    enableMoodAnalysis: boolean
  ): ImageAnalysisResult['dominantColorAnalysis'] {
    // Recommend best harmony type based on color characteristics
    const colorHarmonyRecommendation = this.recommendHarmonyType(dominantColor);

    // Calculate accessibility score
    const accessibilityScore = this.calculateImageAccessibilityScore(extractedColors);

    // Analyze mood if enabled
    const moodAnalysis = enableMoodAnalysis 
      ? this.analyzeMood(dominantColor, extractedColors)
      : [];

    return {
      colorHarmonyRecommendation,
      accessibilityScore,
      moodAnalysis
    };
  }

  private recommendHarmonyType(dominantColor: HSLColor): HarmonyType {
    const { s, l } = dominantColor;

    // Highly saturated colors work well with complementary schemes
    if (s > 80) {
      return 'complementary';
    }

    // Neutral or low saturation colors benefit from analogous schemes
    if (s < 30) {
      return 'analogous';
    }

    // Medium saturation colors work well with triadic schemes
    if (s >= 30 && s <= 80) {
      // Consider lightness for final decision
      if (l > 70 || l < 30) {
        return 'monochromatic'; // Extreme lightness values
      }
      return 'triadic';
    }

    // Default fallback
    return 'complementary';
  }

  private calculateImageAccessibilityScore(
    extractedColors: ImageAnalysisResult['extractedColors']
  ): number {
    const colors = Object.values(extractedColors);
    const contrastRatios: number[] = [];

    // Calculate contrast ratios between different extracted colors
    for (let i = 0; i < colors.length - 1; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        // Using ColorService's contrast calculation would require circular dependency
        // Implementing simplified version here
        const ratio = this.calculateSimpleContrastRatio(colors[i], colors[j]);
        contrastRatios.push(ratio);
      }
    }

    // Average contrast ratio normalized to 0-1 scale
    const avgContrast = contrastRatios.reduce((sum, ratio) => sum + ratio, 0) / contrastRatios.length;
    return Math.min(1, avgContrast / 7); // Normalize against AAA standard (7:1)
  }

  private calculateSimpleContrastRatio(color1: HSLColor, color2: HSLColor): number {
    // Simplified contrast calculation
    const l1 = color1.l / 100;
    const l2 = color2.l / 100;
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private analyzeMood(
    dominantColor: HSLColor,
    extractedColors: ImageAnalysisResult['extractedColors']
  ): string[] {
    const moods: string[] = [];
    const { h, s, l } = dominantColor;

    // Analyze based on hue ranges
    if (h >= 0 && h < 30 || h >= 330) {
      moods.push('passionate', 'energetic', 'bold');
    } else if (h >= 30 && h < 60) {
      moods.push('cheerful', 'optimistic', 'creative');
    } else if (h >= 60 && h < 120) {
      moods.push('natural', 'fresh', 'calming');
    } else if (h >= 120 && h < 180) {
      moods.push('peaceful', 'balanced', 'harmonious');
    } else if (h >= 180 && h < 240) {
      moods.push('trustworthy', 'professional', 'cool');
    } else if (h >= 240 && h < 300) {
      moods.push('mysterious', 'luxurious', 'creative');
    } else {
      moods.push('romantic', 'feminine', 'playful');
    }

    // Adjust based on saturation
    if (s < 20) {
      moods.push('subtle', 'sophisticated', 'neutral');
    } else if (s > 80) {
      moods.push('vibrant', 'intense', 'dynamic');
    }

    // Adjust based on lightness
    if (l < 25) {
      moods.push('dramatic', 'formal', 'powerful');
    } else if (l > 75) {
      moods.push('light', 'airy', 'gentle');
    }

    // Analyze color diversity
    const colorValues = Object.values(extractedColors);
    const saturationVariance = this.calculateVariance(colorValues.map(c => c.s));
    const lightnessVariance = this.calculateVariance(colorValues.map(c => c.l));

    if (saturationVariance > 800) { // High variance
      moods.push('diverse', 'complex', 'rich');
    } else if (saturationVariance < 200) { // Low variance
      moods.push('cohesive', 'unified', 'consistent');
    }

    if (lightnessVariance > 800) {
      moods.push('contrasting', 'dynamic', 'striking');
    } else if (lightnessVariance < 200) {
      moods.push('balanced', 'smooth', 'harmonious');
    }

    // Remove duplicates and return top 6 moods
    return [...new Set(moods)].slice(0, 6);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  async batchProcessImages(
    imageFiles: File[],
    options: ProcessingOptions = {}
  ): Promise<ImageAnalysisResult[]> {
    const results: ImageAnalysisResult[] = [];
    const maxConcurrent = 3; // Limit concurrent processing

    for (let i = 0; i < imageFiles.length; i += maxConcurrent) {
      const batch = imageFiles.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(file => this.processImage(file, options));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Batch processing failed for images ${i}-${i + batch.length}:`, error);
        // Continue with next batch
      }
    }

    return results;
  }

  async generatePaletteFromColorPoints(
    colorPoints: { x: number; y: number }[],
    imageFile: File,
    harmonyType: HarmonyType = 'complementary'
  ): Promise<ColorPalette> {
    // Extract colors at specific points in the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    const img = new Image();
    const imageUrl = URL.createObjectURL(imageFile);
    
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        URL.revokeObjectURL(imageUrl);
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const colors: HSLColor[] = [];
        
        for (const point of colorPoints) {
          const x = Math.floor(point.x * img.width);
          const y = Math.floor(point.y * img.height);
          
          const imageData = ctx.getImageData(x, y, 1, 1);
          const [r, g, b] = imageData.data;
          
          // Convert to HSL
          const hsl = this.rgbToHsl({ r, g, b });
          colors.push(hsl);
        }

        // Use average color as base for palette generation
        const avgColor = this.averageColors(colors);
        
        try {
          const paletteResult = await this.colorService.generatePalette({
            baseColor: avgColor,
            harmonyType,
            colorCount: 5
          });
          resolve(paletteResult.palette);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Failed to load image'));
      };

      img.src = imageUrl;
    });
  }

  private rgbToHsl({ r, g, b }: { r: number; g: number; b: number }): HSLColor {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  private averageColors(colors: HSLColor[]): HSLColor {
    if (colors.length === 0) return { h: 0, s: 0, l: 50 };
    if (colors.length === 1) return colors[0];

    // Average hue using circular arithmetic
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

    return {
      h: Math.round(avgHue),
      s: Math.round(totalS / colors.length),
      l: Math.round(totalL / colors.length)
    };
  }
}