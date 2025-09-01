/**
 * 최적화된 팔레트 생성 훅
 * - React.memo, useMemo, useCallback 최적화
 * - Web Worker를 활용한 비동기 색상 계산
 * - 캐싱 및 메모이제이션
 * - 성능 모니터링 통합
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ColorCache } from '../../utils/performance/colorCache';
import { performanceMonitor } from '../../utils/performance/performanceMonitor';
import { memoryManager } from '../../utils/performance/memoryManager';

interface PaletteGenerationOptions {
  keyword: string;
  harmonyType: 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic';
  useWebWorker?: boolean;
  enableCache?: boolean;
  quality?: 'high' | 'medium' | 'low';
}

interface ColorInfo {
  h: number;
  s: number;
  l: number;
  rgb: [number, number, number];
  hex: string;
  accessibility?: {
    whiteContrast: number;
    blackContrast: number;
    wcagAA: boolean;
    wcagAAA: boolean;
  };
}

interface PaletteResult {
  colors: ColorInfo[];
  metadata: {
    keyword: string;
    harmonyType: string;
    generationTime: number;
    fromCache: boolean;
    quality: string;
    accessibilityScore: number;
  };
}

export const useOptimizedPalette = () => {
  const [palette, setPalette] = useState<PaletteResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const workerRef = useRef<Worker | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const generationCountRef = useRef(0);

  // Web Worker 초기화
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      workerRef.current = new Worker(
        new URL('../../utils/workers/colorWorker.ts', import.meta.url),
        { type: 'module' }
      );
      
      workerRef.current.onmessage = (event) => {
        const { success, result, error: workerError, executionTime } = event.data;
        
        if (success && result) {
          const optimizedResult = processWorkerResult(result, executionTime);
          setPalette(optimizedResult);
        } else {
          setError(workerError || '색상 생성 실패');
        }
        
        setIsGenerating(false);
      };

      workerRef.current.onerror = (error) => {
        console.error('Color Worker 오류:', error);
        setError('색상 생성 중 오류 발생');
        setIsGenerating(false);
      };
    }

    // 메모리 정리 작업 등록
    const cleanupId = `palette-generator-${Date.now()}`;
    memoryManager.registerCleanupTask(cleanupId, () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    }, 'medium');

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      memoryManager.unregisterCleanupTask(cleanupId);
    };
  }, []);

  /**
   * Worker 결과 처리 및 최적화
   */
  const processWorkerResult = useCallback((result: any, executionTime: number): PaletteResult => {
    const colors = result.colors || result;
    
    // 접근성 정보 계산
    const enhancedColors: ColorInfo[] = colors.map((color: any) => {
      const rgb = ColorCache.hslToRgb(color.h, color.s, color.l);
      const hex = ColorCache.rgbToHex(rgb[0], rgb[1], rgb[2]);
      
      const whiteContrast = ColorCache.getContrastRatio(hex, '#FFFFFF');
      const blackContrast = ColorCache.getContrastRatio(hex, '#000000');
      
      return {
        h: color.h,
        s: color.s,
        l: color.l,
        rgb,
        hex,
        accessibility: {
          whiteContrast,
          blackContrast,
          wcagAA: whiteContrast >= 4.5 || blackContrast >= 4.5,
          wcagAAA: whiteContrast >= 7 || blackContrast >= 7
        }
      };
    });

    // 접근성 점수 계산
    const accessibilityScore = enhancedColors.reduce((score, color) => {
      if (color.accessibility?.wcagAAA) return score + 3;
      if (color.accessibility?.wcagAA) return score + 2;
      return score + 1;
    }, 0) / (enhancedColors.length * 3);

    return {
      colors: enhancedColors,
      metadata: {
        keyword: result.keyword || '',
        harmonyType: result.harmonyType || '',
        generationTime: executionTime,
        fromCache: result.fromCache || false,
        quality: result.quality || 'medium',
        accessibilityScore
      }
    };
  }, []);

  /**
   * 팔레트 생성 (메모이제이션 및 캐싱 적용)
   */
  const generatePalette = useCallback(async (options: PaletteGenerationOptions) => {
    const {
      keyword,
      harmonyType,
      useWebWorker = true,
      enableCache = true,
      quality = 'medium'
    } = options;

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsGenerating(true);
    setError(null);

    // 성능 측정 시작
    const measureName = performanceMonitor.startColorGenerationMeasure(
      `${keyword}_${harmonyType}_${++generationCountRef.current}`
    );

    try {
      // 캐시 확인
      if (enableCache) {
        const cachedColors = ColorCache.getHarmonyColors({ keyword }, harmonyType);
        if (cachedColors && cachedColors.length > 0) {
          const cachedResult = processWorkerResult({
            colors: cachedColors,
            keyword,
            harmonyType,
            quality,
            fromCache: true
          }, 0);
          
          setPalette(cachedResult);
          setIsGenerating(false);
          performanceMonitor.endColorGenerationMeasure(measureName);
          return cachedResult;
        }
      }

      // Web Worker 사용
      if (useWebWorker && workerRef.current) {
        const taskId = `palette_${Date.now()}_${generationCountRef.current}`;
        
        workerRef.current.postMessage({
          id: taskId,
          type: 'generate_palette',
          data: {
            keyword,
            harmonyType,
            quality
          }
        });
      } else {
        // 메인 스레드에서 처리 (fallback)
        const result = await generatePaletteSync(options);
        const optimizedResult = processWorkerResult(result, 0);
        setPalette(optimizedResult);
        setIsGenerating(false);
      }

      performanceMonitor.endColorGenerationMeasure(measureName);

    } catch (error) {
      console.error('팔레트 생성 실패:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류');
      setIsGenerating(false);
      performanceMonitor.endColorGenerationMeasure(measureName);
    }
  }, [processWorkerResult]);

  /**
   * 동기식 팔레트 생성 (fallback)
   */
  const generatePaletteSync = useCallback(async (options: PaletteGenerationOptions) => {
    const { keyword, harmonyType } = options;
    
    // 키워드 기반 기본 색상 생성
    const baseColor = getBaseColorFromKeyword(keyword);
    
    // 조화 색상 생성
    const harmonyColors = ColorCache.getHarmonyColors(baseColor, harmonyType);
    
    return {
      colors: harmonyColors,
      keyword,
      harmonyType,
      quality: options.quality,
      fromCache: false
    };
  }, []);

  /**
   * 키워드에서 기본 색상 추출
   */
  const getBaseColorFromKeyword = useMemo(() => {
    const keywordColorMap: { [key: string]: { h: number; s: number; l: number } } = {
      평온함: { h: 200, s: 70, l: 60 },
      열정: { h: 0, s: 80, l: 50 },
      행복: { h: 50, s: 90, l: 60 },
      자연: { h: 120, s: 60, l: 40 },
      신뢰: { h: 220, s: 70, l: 50 },
      숲: { h: 120, s: 80, l: 30 },
      바다: { h: 200, s: 90, l: 40 },
      하늘: { h: 210, s: 70, l: 70 },
      노을: { h: 15, s: 85, l: 60 },
      꽃: { h: 320, s: 70, l: 70 },
      봄: { h: 100, s: 60, l: 70 },
      여름: { h: 180, s: 80, l: 50 },
      가을: { h: 30, s: 70, l: 50 },
      겨울: { h: 210, s: 30, l: 80 },
      에너지: { h: 45, s: 100, l: 50 },
      미니멀: { h: 0, s: 0, l: 95 },
      럭셔리: { h: 280, s: 60, l: 30 }
    };

    return (keyword: string) => {
      return keywordColorMap[keyword] || { h: 200, s: 60, l: 60 };
    };
  }, []);

  /**
   * 현재 팔레트의 접근성 검증
   */
  const validateAccessibility = useCallback(() => {
    if (!palette) return null;

    const issues: string[] = [];
    const suggestions: string[] = [];

    palette.colors.forEach((color, index) => {
      if (!color.accessibility?.wcagAA) {
        issues.push(`색상 ${index + 1}: WCAG AA 기준 미달 (대비율: ${color.accessibility?.whiteContrast.toFixed(2)}:1)`);
        suggestions.push(`색상 ${index + 1}의 명도를 조정하여 대비율을 개선하세요.`);
      }
    });

    return {
      score: palette.metadata.accessibilityScore,
      issues,
      suggestions,
      wcagAACompliant: palette.colors.filter(c => c.accessibility?.wcagAA).length,
      wcagAAACompliant: palette.colors.filter(c => c.accessibility?.wcagAAA).length
    };
  }, [palette]);

  /**
   * 팔레트 색상 개별 업데이트 (최적화된 리렌더링)
   */
  const updateColor = useCallback((index: number, newColor: Partial<ColorInfo>) => {
    if (!palette) return;

    setPalette(prev => {
      if (!prev) return prev;

      const updatedColors = [...prev.colors];
      updatedColors[index] = { ...updatedColors[index], ...newColor };

      // RGB와 HEX 자동 계산
      if ('h' in newColor || 's' in newColor || 'l' in newColor) {
        const { h, s, l } = updatedColors[index];
        const rgb = ColorCache.hslToRgb(h, s, l);
        const hex = ColorCache.rgbToHex(rgb[0], rgb[1], rgb[2]);
        
        updatedColors[index] = {
          ...updatedColors[index],
          rgb,
          hex
        };
      }

      return {
        ...prev,
        colors: updatedColors
      };
    });
  }, [palette]);

  /**
   * 팔레트 초기화
   */
  const clearPalette = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setPalette(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  /**
   * 캐시 통계
   */
  const getCacheStats = useCallback(() => {
    return ColorCache.getCacheStats();
  }, []);

  return {
    // 상태
    palette,
    isGenerating,
    error,
    
    // 액션
    generatePalette,
    updateColor,
    clearPalette,
    
    // 검증
    validateAccessibility,
    
    // 유틸리티
    getCacheStats
  };
};