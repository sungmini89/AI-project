/**
 * 최적화된 이미지 처리 훅
 * - OffscreenCanvas 활용
 * - Web Worker 기반 색상 추출
 * - 이미지 리사이징 최적화
 * - 메모리 효율적 처리
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { performanceMonitor } from '../../utils/performance/performanceMonitor';
import { memoryManager } from '../../utils/performance/memoryManager';

interface ImageProcessingOptions {
  maxSize?: number;
  quality?: 'high' | 'medium' | 'low';
  colorCount?: number;
  useWebWorker?: boolean;
  enableCache?: boolean;
}

interface ExtractedColor {
  r: number;
  g: number;
  b: number;
  hex: string;
  hsl: { h: number; s: number; l: number };
  dominance: number; // 0-1, 이미지 내 비율
}

interface ImageProcessingResult {
  colors: ExtractedColor[];
  metadata: {
    originalSize: { width: number; height: number };
    processedSize: { width: number; height: number };
    fileSize: number;
    processingTime: number;
    quality: string;
    colorCount: number;
    memoryUsed: number;
  };
  thumbnail?: string; // base64 썸네일
}

export const useImageOptimization = (options: ImageProcessingOptions = {}) => {
  const {
    maxSize = 2048,
    quality = 'medium',
    colorCount = 6,
    useWebWorker = true,
    enableCache = true
  } = options;

  const [result, setResult] = useState<ImageProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const cacheRef = useRef<Map<string, ImageProcessingResult>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Web Worker 초기화
  useEffect(() => {
    if (useWebWorker && typeof Worker !== 'undefined') {
      workerRef.current = new Worker(
        new URL('../../utils/workers/imageWorker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (event) => {
        const { success, result: workerResult, error: workerError, executionTime, memoryUsed } = event.data;
        
        if (success && workerResult) {
          const processedResult = enhanceWorkerResult(workerResult, executionTime, memoryUsed);
          setResult(processedResult);
        } else {
          setError(workerError || '이미지 처리 실패');
        }
        
        setIsProcessing(false);
        setProgress(100);
      };

      workerRef.current.onerror = (error) => {
        console.error('Image Worker 오류:', error);
        setError('이미지 처리 중 오류 발생');
        setIsProcessing(false);
      };
    }

    // 메모리 정리 작업 등록
    const cleanupId = `image-processor-${Date.now()}`;
    memoryManager.registerCleanupTask(cleanupId, () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      cacheRef.current.clear();
    }, 'medium');

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      memoryManager.unregisterCleanupTask(cleanupId);
    };
  }, [useWebWorker]);

  /**
   * Worker 결과 강화
   */
  const enhanceWorkerResult = useCallback((workerResult: any, executionTime: number, memoryUsed: number): ImageProcessingResult => {
    const { colors, metadata } = workerResult;

    return {
      colors: colors.map((color: any) => ({
        ...color,
        dominance: color.count / metadata.processedSize || 0
      })),
      metadata: {
        ...metadata,
        processingTime: executionTime,
        memoryUsed
      }
    };
  }, []);

  /**
   * 이미지 파일에서 색상 추출
   */
  const extractColorsFromImage = useCallback(async (file: File): Promise<ImageProcessingResult | null> => {
    // 이전 작업 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    const measureName = performanceMonitor.startImageProcessingMeasure(
      `${file.name}_${Date.now()}`
    );

    try {
      // 캐시 확인
      const cacheKey = `${file.name}_${file.size}_${file.lastModified}_${quality}_${colorCount}`;
      if (enableCache && cacheRef.current.has(cacheKey)) {
        const cachedResult = cacheRef.current.get(cacheKey)!;
        setResult(cachedResult);
        setIsProcessing(false);
        setProgress(100);
        performanceMonitor.endImageProcessingMeasure(measureName);
        return cachedResult;
      }

      setProgress(10);

      // 파일 유효성 검사
      if (!file.type.startsWith('image/')) {
        throw new Error('이미지 파일만 지원됩니다.');
      }

      // 파일 크기 제한 (10MB)
      const maxFileSize = 10 * 1024 * 1024;
      if (file.size > maxFileSize) {
        throw new Error('파일 크기가 너무 큽니다. (최대 10MB)');
      }

      setProgress(20);

      // 이미지를 ImageData로 변환
      const imageData = await loadImageToImageData(file, maxSize);
      setProgress(40);

      // 썸네일 생성 (선택사항)
      const thumbnail = await generateThumbnail(file, 150);
      setProgress(50);

      if (useWebWorker && workerRef.current) {
        // Web Worker로 처리
        const taskId = `extract_${Date.now()}`;
        
        workerRef.current.postMessage({
          id: taskId,
          type: 'extract_colors',
          data: {
            imageData,
            options: {
              quality,
              colorCount,
              useCache: enableCache
            }
          }
        });

        // 진행률 시뮬레이션
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 5, 90));
        }, 500);

        // Worker 완료 시 정리
        setTimeout(() => {
          clearInterval(progressInterval);
        }, 10000);

      } else {
        // 메인 스레드에서 처리 (fallback)
        const extractionResult = await extractColorsSync(imageData, {
          quality,
          colorCount
        });

        const finalResult: ImageProcessingResult = {
          colors: extractionResult.colors,
          metadata: {
            originalSize: { width: imageData.width, height: imageData.height },
            processedSize: { width: imageData.width, height: imageData.height },
            fileSize: file.size,
            processingTime: performance.now(),
            quality,
            colorCount: extractionResult.colors.length,
            memoryUsed: 0
          },
          thumbnail
        };

        // 캐시 저장
        if (enableCache) {
          cacheRef.current.set(cacheKey, finalResult);
        }

        setResult(finalResult);
        setIsProcessing(false);
        setProgress(100);

        performanceMonitor.endImageProcessingMeasure(measureName);
        return finalResult;
      }

      // 웹워커를 사용하는 경우, onmessage 핸들러에서 결과를 처리하므로 여기서는 null 반환
      return null;

    } catch (error) {
      console.error('이미지 색상 추출 실패:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류');
      setIsProcessing(false);
      setProgress(0);
      performanceMonitor.endImageProcessingMeasure(measureName);
      return null;
    }
  }, [quality, colorCount, maxSize, useWebWorker, enableCache]);

  /**
   * 이미지를 ImageData로 변환
   */
  const loadImageToImageData = useCallback(async (file: File, maxSize: number): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas 컨텍스트 생성 실패'));
        return;
      }

      img.onload = () => {
        // 크기 계산 (비율 유지)
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // 고품질 리사이징
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // ImageData 추출
        const imageData = ctx.getImageData(0, 0, width, height);
        resolve(imageData);

        // 정리
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        reject(new Error('이미지 로드 실패'));
        URL.revokeObjectURL(img.src);
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  /**
   * 썸네일 생성
   */
  const generateThumbnail = useCallback(async (file: File, size: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas 컨텍스트 생성 실패'));
        return;
      }

      img.onload = () => {
        // 정사각형 썸네일
        canvas.width = size;
        canvas.height = size;

        const scale = Math.max(size / img.width, size / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        const offsetX = (size - scaledWidth) / 2;
        const offsetY = (size - scaledHeight) / 2;

        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

        // base64로 변환
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
        resolve(thumbnail);

        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        reject(new Error('썸네일 생성 실패'));
        URL.revokeObjectURL(img.src);
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  /**
   * 동기식 색상 추출 (fallback)
   */
  const extractColorsSync = useCallback(async (
    imageData: ImageData,
    options: { quality: string; colorCount: number }
  ): Promise<{ colors: ExtractedColor[] }> => {
    const { data, width, height } = imageData;
    const colorMap = new Map<string, number>();
    const sampleStep = options.quality === 'high' ? 1 : options.quality === 'medium' ? 2 : 4;

    // 색상 샘플링
    for (let y = 0; y < height; y += sampleStep) {
      for (let x = 0; x < width; x += sampleStep) {
        const pixelIndex = (y * width + x) * 4;
        
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const a = data[pixelIndex + 3];

        if (a < 128) continue; // 투명한 픽셀 제외

        // 색상 양자화
        const quantizedR = Math.floor(r / 16) * 16;
        const quantizedG = Math.floor(g / 16) * 16;
        const quantizedB = Math.floor(b / 16) * 16;

        const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
      }
    }

    // 상위 색상 추출
    const sortedColors = Array.from(colorMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, options.colorCount)
      .map(([colorKey, count]) => {
        const [r, g, b] = colorKey.split(',').map(Number);
        return {
          r,
          g,
          b,
          hex: `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`,
          hsl: rgbToHsl(r, g, b),
          dominance: count / (width * height / (sampleStep * sampleStep))
        };
      });

    return { colors: sortedColors };
  }, []);

  /**
   * RGB를 HSL로 변환
   */
  const rgbToHsl = useCallback((r: number, g: number, b: number) => {
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
  }, []);

  /**
   * 처리 취소
   */
  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
    setProgress(0);
  }, []);

  /**
   * 결과 초기화
   */
  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  /**
   * 캐시 관리
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const getCacheSize = useCallback(() => {
    return cacheRef.current.size;
  }, []);

  return {
    // 상태
    result,
    isProcessing,
    progress,
    error,

    // 액션
    extractColorsFromImage,
    cancelProcessing,
    clearResult,

    // 캐시 관리
    clearCache,
    getCacheSize
  };
};