// vibrant.js 기반 이미지 주요 색상 추출 (완전 오프라인)

import Vibrant from 'node-vibrant';
import { ExtractedPalette, HSLColor } from '../types/color';

export class ImageColorExtractor {
  // 이미지에서 팔레트 추출
  async extractPalette(imageFile: File): Promise<ExtractedPalette> {
    try {
      // 1. 이미지를 URL로 변환
      const imageUrl = URL.createObjectURL(imageFile);

      // 2. Vibrant로 6가지 주요 색상 추출
      const palette = await Vibrant.from(imageUrl).getPalette();

      // 3. URL 정리
      URL.revokeObjectURL(imageUrl);

      // 4. 추출된 색상을 HSL로 변환하여 반환
      // dominant는 가장 강렬하거나 대표적인 색상 선택
      const dominantColor = palette.Vibrant || palette.DarkVibrant || palette.LightVibrant;
      
      return {
        dominant: this.rgbToHsl(dominantColor?.rgb || [0, 100, 200]),
        vibrant: this.rgbToHsl(palette.Vibrant?.rgb || [0, 100, 200]),
        muted: this.rgbToHsl(palette.Muted?.rgb || [100, 100, 100]),
        darkVibrant: this.rgbToHsl(palette.DarkVibrant?.rgb || [0, 50, 100]),
        darkMuted: this.rgbToHsl(palette.DarkMuted?.rgb || [50, 50, 50]),
        lightVibrant: this.rgbToHsl(palette.LightVibrant?.rgb || [100, 150, 255]),
        lightMuted: this.rgbToHsl(palette.LightMuted?.rgb || [200, 200, 200]),
      };
    } catch (error) {
      console.error('이미지 색상 추출 실패:', error);
      return this.getDefaultPalette();
    }
  }

  // Canvas API를 사용한 이미지 처리 (대안 방법)
  async extractPaletteViaCanvas(imageFile: File): Promise<ExtractedPalette> {
    try {
      const canvas = await this.loadImageToCanvas(imageFile);
      const ctx = canvas.getContext('2d')!;
      
      // 이미지 데이터 추출
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // 주요 색상 분석
      const colorFrequency = new Map<string, number>();
      
      // 픽셀 샘플링 (성능을 위해 10픽셀마다 샘플링)
      for (let i = 0; i < data.length; i += 40) { // RGBA이므로 4*10
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];
        
        // 투명하거나 너무 어둡거나 밝은 픽셀 제외
        if (alpha > 128 && (r + g + b) > 30 && (r + g + b) < 720) {
          const colorKey = `${Math.floor(r/32)},${Math.floor(g/32)},${Math.floor(b/32)}`;
          colorFrequency.set(colorKey, (colorFrequency.get(colorKey) || 0) + 1);
        }
      }
      
      // 상위 6개 색상 선택
      const topColors = Array.from(colorFrequency.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6)
        .map(([colorKey]) => {
          const [r, g, b] = colorKey.split(',').map(n => parseInt(n) * 32);
          return [r, g, b] as [number, number, number];
        });
      
      // 기본 팔레트 구성
      return {
        dominant: this.rgbToHsl(topColors[0] || [0, 100, 200]),
        vibrant: this.rgbToHsl(topColors[0] || [0, 100, 200]),
        muted: this.rgbToHsl(topColors[1] || [100, 100, 100]),
        darkVibrant: this.rgbToHsl(topColors[2] || [0, 50, 100]),
        darkMuted: this.rgbToHsl(topColors[3] || [50, 50, 50]),
        lightVibrant: this.rgbToHsl(topColors[4] || [100, 150, 255]),
        lightMuted: this.rgbToHsl(topColors[5] || [200, 200, 200]),
      };
      
    } catch (error) {
      console.error('Canvas 이미지 색상 추출 실패:', error);
      return this.getDefaultPalette();
    }
  }

  // 파일을 Canvas로 안전하게 로드
  private async loadImageToCanvas(file: File): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas 컨텍스트를 생성할 수 없습니다'));
        return;
      }

      img.onload = () => {
        // 성능을 위해 큰 이미지는 리사이징
        const maxSize = 500;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas);
      };

      img.onerror = () => reject(new Error('이미지 로드 실패'));
      img.src = URL.createObjectURL(file);
    });
  }

  // RGB를 HSL로 변환
  private rgbToHsl([r, g, b]: number[]): HSLColor {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

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

  // 기본 팔레트 반환
  private getDefaultPalette(): ExtractedPalette {
    return {
      dominant: { h: 200, s: 80, l: 50 },
      vibrant: { h: 200, s: 80, l: 50 },
      muted: { h: 200, s: 30, l: 60 },
      darkVibrant: { h: 200, s: 80, l: 30 },
      darkMuted: { h: 200, s: 30, l: 30 },
      lightVibrant: { h: 200, s: 80, l: 80 },
      lightMuted: { h: 200, s: 30, l: 80 },
    };
  }

  // 이미지 파일 유효성 검사
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // 파일 타입 검사
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'JPEG, PNG, WebP 형식만 지원됩니다.'
      };
    }

    // 파일 크기 검사 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: '파일 크기는 10MB 이하여야 합니다.'
      };
    }

    return { valid: true };
  }

  // 색상 점유율 분석
  async analyzeColorDominance(imageFile: File): Promise<Array<{
    color: HSLColor;
    percentage: number;
  }>> {
    try {
      const canvas = await this.loadImageToCanvas(imageFile);
      const ctx = canvas.getContext('2d')!;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      const colorMap = new Map<string, number>();
      const totalPixels = data.length / 4;
      
      // 모든 픽셀 분석 (성능을 위해 2픽셀마다)
      for (let i = 0; i < data.length; i += 8) {
        const r = data[i];
        const g = data[i + 1]; 
        const b = data[i + 2];
        const alpha = data[i + 3];
        
        if (alpha > 200) { // 불투명한 픽셀만
          // 색상을 16x16x16으로 양자화하여 비슷한 색상 그룹화
          const colorKey = `${Math.floor(r/16)},${Math.floor(g/16)},${Math.floor(b/16)}`;
          colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
        }
      }
      
      // 상위 색상들을 백분율과 함께 반환
      return Array.from(colorMap.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([colorKey, count]) => {
          const [r, g, b] = colorKey.split(',').map(n => parseInt(n) * 16);
          return {
            color: this.rgbToHsl([r, g, b]),
            percentage: Math.round((count / (totalPixels/2)) * 100 * 100) / 100
          };
        });
        
    } catch (error) {
      console.error('색상 점유율 분석 실패:', error);
      return [];
    }
  }
}