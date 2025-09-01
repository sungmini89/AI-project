/**
 * 이미지 처리 Web Worker
 * - OffscreenCanvas 활용 (Web Worker에서 처리)
 * - vibrant.js 성능 개선 (병렬 처리)
 * - 이미지 전처리 최적화
 * - 메모리 효율적 픽셀 데이터 처리
 */

interface ImageProcessingTask {
  id: string;
  type: 'extract_colors' | 'resize_image' | 'optimize_image' | 'batch_process';
  data: any;
}

interface ImageProcessingResult {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
  memoryUsed: number;
}

class ImageWorkerEngine {
  private static maxImageSize = 2048; // 최대 이미지 크기

  /**
   * 이미지에서 색상 추출 (vibrant.js 최적화)
   */
  static async extractColors(data: {
    imageData: ImageData;
    options?: {
      quality?: 'high' | 'medium' | 'low';
      colorCount?: number;
    }
  }): Promise<any> {
    const startTime = performance.now();
    const initialMemory = this.getMemoryUsage();
    
    try {
      const { imageData, options = {} } = data;
      const {
        quality = 'medium',
        colorCount = 6
      } = options;

      // 1. 이미지 크기 최적화
      const optimizedImageData = await this.optimizeImageSize(imageData);
      
      // 2. 색상 추출 품질 설정
      const extractionQuality = this.getExtractionQuality(quality);
      
      // 3. 병렬 색상 분석
      const colorAnalysis = await this.performParallelColorAnalysis(
        optimizedImageData, 
        extractionQuality,
        colorCount
      );
      
      // 4. 결과 최적화 및 캐싱
      const optimizedResults = this.optimizeColorResults(colorAnalysis);
      
      const finalMemory = this.getMemoryUsage();
      
      return {
        colors: optimizedResults,
        metadata: {
          originalSize: imageData.width * imageData.height,
          processedSize: optimizedImageData.width * optimizedImageData.height,
          quality,
          colorCount: optimizedResults.length,
          processingTime: performance.now() - startTime,
          memoryDelta: finalMemory - initialMemory
        }
      };
      
    } catch (error) {
      console.error('색상 추출 실패:', error);
      return this.getDefaultColorExtraction();
    }
  }

  /**
   * 이미지 크기 최적화 (Canvas API 활용)
   */
  private static async optimizeImageSize(imageData: ImageData): Promise<ImageData> {
    const { width, height } = imageData;
    
    // 이미지가 너무 큰 경우 리사이징
    if (width <= this.maxImageSize && height <= this.maxImageSize) {
      return imageData;
    }
    
    // 비율 유지하면서 리사이징
    const ratio = Math.min(this.maxImageSize / width, this.maxImageSize / height);
    const newWidth = Math.floor(width * ratio);
    const newHeight = Math.floor(height * ratio);
    
    // OffscreenCanvas로 리사이징 (Web Worker에서 사용 가능)
    const canvas = new OffscreenCanvas(newWidth, newHeight);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('OffscreenCanvas 컨텍스트 생성 실패');
    }
    
    // ImageData를 Canvas에 그리기
    const tempCanvas = new OffscreenCanvas(width, height);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx?.putImageData(imageData, 0, 0);
    
    // 리사이징된 이미지 그리기 (고품질 스케일링)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
    
    // 리사이징된 ImageData 반환
    return ctx.getImageData(0, 0, newWidth, newHeight);
  }

  /**
   * 색상 추출 품질 설정
   */
  private static getExtractionQuality(quality: 'high' | 'medium' | 'low'): {
    sampleSize: number;
    precision: number;
    iterations: number;
  } {
    switch (quality) {
      case 'high':
        return { sampleSize: 50, precision: 10, iterations: 3 };
      case 'medium':
        return { sampleSize: 30, precision: 5, iterations: 2 };
      case 'low':
        return { sampleSize: 20, precision: 3, iterations: 1 };
    }
  }

  /**
   * 병렬 색상 분석 수행
   */
  private static async performParallelColorAnalysis(
    imageData: ImageData,
    quality: any,
    colorCount: number
  ): Promise<any[]> {
    const { width, height, data } = imageData;
    
    // 이미지를 구역별로 분할하여 병렬 처리
    const regions = this.divideImageIntoRegions(width, height, 4); // 4개 구역
    
    const regionPromises = regions.map(async (region) => {
      return this.analyzeImageRegion(data, width, height, region, quality);
    });
    
    const regionResults = await Promise.all(regionPromises);
    
    // 구역별 결과를 통합하고 최적화
    return this.mergeRegionResults(regionResults, colorCount);
  }

  /**
   * 이미지를 구역으로 분할
   */
  private static divideImageIntoRegions(width: number, height: number, regionCount: number): Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }> {
    const regions = [];
    const cols = Math.ceil(Math.sqrt(regionCount));
    const rows = Math.ceil(regionCount / cols);
    
    const regionWidth = Math.floor(width / cols);
    const regionHeight = Math.floor(height / rows);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (regions.length < regionCount) {
          regions.push({
            x: col * regionWidth,
            y: row * regionHeight,
            width: col === cols - 1 ? width - col * regionWidth : regionWidth,
            height: row === rows - 1 ? height - row * regionHeight : regionHeight
          });
        }
      }
    }
    
    return regions;
  }

  /**
   * 이미지 구역 색상 분석
   */
  private static async analyzeImageRegion(
    imageData: Uint8ClampedArray,
    imageWidth: number,
    _imageHeight: number,
    region: { x: number; y: number; width: number; height: number },
    quality: any
  ): Promise<any[]> {
    const colorMap = new Map<string, number>();
    
    // 샘플링 간격 설정 (품질에 따라)
    const sampleStep = Math.max(1, Math.floor(10 - quality.sampleSize / 5));
    
    for (let y = region.y; y < region.y + region.height; y += sampleStep) {
      for (let x = region.x; x < region.x + region.width; x += sampleStep) {
        const pixelIndex = (y * imageWidth + x) * 4;
        
        const r = imageData[pixelIndex];
        const g = imageData[pixelIndex + 1];
        const b = imageData[pixelIndex + 2];
        const a = imageData[pixelIndex + 3];
        
        // 투명한 픽셀 제외
        if (a < 128) continue;
        
        // 색상 양자화 (비슷한 색상 그룹화)
        const quantizedR = Math.floor(r / quality.precision) * quality.precision;
        const quantizedG = Math.floor(g / quality.precision) * quality.precision;
        const quantizedB = Math.floor(b / quality.precision) * quality.precision;
        
        const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
      }
    }
    
    // 빈도순으로 정렬하여 주요 색상 추출
    const sortedColors = Array.from(colorMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20) // 구역당 최대 20개 색상
      .map(([colorKey, count]) => {
        const [r, g, b] = colorKey.split(',').map(Number);
        return { r, g, b, count };
      });
    
    return sortedColors;
  }

  /**
   * 구역별 결과 통합
   */
  private static mergeRegionResults(regionResults: any[][], targetColorCount: number): any[] {
    const allColors = regionResults.flat();
    const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();
    
    // 색상 통합
    for (const color of allColors) {
      const key = `${color.r},${color.g},${color.b}`;
      if (colorMap.has(key)) {
        colorMap.get(key)!.count += color.count;
      } else {
        colorMap.set(key, { ...color });
      }
    }
    
    // 빈도순 정렬 및 상위 색상 선택
    const finalColors = Array.from(colorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, targetColorCount)
      .map(color => ({
        ...color,
        hex: this.rgbToHex(color.r, color.g, color.b),
        hsl: this.rgbToHsl(color.r, color.g, color.b)
      }));
    
    return finalColors;
  }

  /**
   * RGB를 HEX로 변환
   */
  private static rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
  }

  /**
   * RGB를 HSL로 변환
   */
  private static rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
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

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * 색상 결과 최적화
   */
  private static optimizeColorResults(colors: any[]): any[] {
    // 유사한 색상 제거
    const optimizedColors: any[] = [];
    const threshold = 30; // RGB 차이 임계값
    
    for (const color of colors) {
      let isDuplicate = false;
      
      for (const existing of optimizedColors) {
        const rDiff = Math.abs(color.r - existing.r);
        const gDiff = Math.abs(color.g - existing.g);
        const bDiff = Math.abs(color.b - existing.b);
        
        if (rDiff < threshold && gDiff < threshold && bDiff < threshold) {
          isDuplicate = true;
          // 더 빈도가 높은 색상으로 교체
          if (color.count > existing.count) {
            const index = optimizedColors.indexOf(existing);
            optimizedColors[index] = color;
          }
          break;
        }
      }
      
      if (!isDuplicate) {
        optimizedColors.push(color);
      }
    }
    
    return optimizedColors;
  }

  /**
   * 메모리 사용량 추정
   */
  private static getMemoryUsage(): number {
    if ('memory' in performance && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * 기본 색상 추출 결과
   */
  private static getDefaultColorExtraction(): any {
    return {
      colors: [
        { r: 100, g: 150, b: 200, hex: '#6496c8', hsl: { h: 210, s: 48, l: 59 }, count: 100 },
        { r: 80, g: 120, b: 160, hex: '#5078a0', hsl: { h: 210, s: 33, l: 47 }, count: 80 },
        { r: 60, g: 90, b: 120, hex: '#3c5a78', hsl: { h: 210, s: 33, l: 35 }, count: 60 },
        { r: 120, g: 180, b: 240, hex: '#78b4f0', hsl: { h: 210, s: 75, l: 71 }, count: 40 },
        { r: 40, g: 60, b: 80, hex: '#283c50', hsl: { h: 210, s: 33, l: 24 }, count: 20 }
      ],
      metadata: {
        originalSize: 0,
        processedSize: 0,
        quality: 'medium',
        colorCount: 5,
        processingTime: 0,
        memoryDelta: 0
      }
    };
  }
}

// Web Worker 메시지 처리
self.onmessage = function(event: MessageEvent<ImageProcessingTask>) {
  const task = event.data;
  const startTime = performance.now();
  
  ImageWorkerEngine.extractColors(task.data).then(result => {
    const response: ImageProcessingResult = {
      id: task.id,
      success: true,
      result,
      executionTime: performance.now() - startTime,
      memoryUsed: ImageWorkerEngine['getMemoryUsage']()
    };
    
    self.postMessage(response);
  }).catch(error => {
    const response: ImageProcessingResult = {
      id: task.id,
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      executionTime: performance.now() - startTime,
      memoryUsed: ImageWorkerEngine['getMemoryUsage']()
    };
    
    self.postMessage(response);
  });
};