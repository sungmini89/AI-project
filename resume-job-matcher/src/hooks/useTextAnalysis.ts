import { useState, useCallback } from 'react';
import { TextAnalysisService } from '@/services/text-analysis';
import { aiEnhancedAnalysisService, type EnhancedAnalysisResult } from '@/services/ai-enhanced-analysis';
import type { AnalysisResult, AnalysisOptions } from '@/types/analysis';

interface AnalysisState {
  result: AnalysisResult | EnhancedAnalysisResult | null;
  analyzing: boolean;
  error: string | null;
}

export const useTextAnalysis = () => {
  const [state, setState] = useState<AnalysisState>({
    result: null,
    analyzing: false,
    error: null
  });

  const analyzeTexts = useCallback(async (
    resumeText: string,
    jobDescription: string,
    options: AnalysisOptions = {
      mode: 'mock',
      depth: 'standard',
      language: 'ko',
      analysisDepth: 'standard',
      useAI: true,
      includeATS: true
    }
  ) => {
    setState(prev => ({ ...prev, analyzing: true, error: null }));

    try {
      if (!resumeText.trim()) {
        throw new Error('이력서 텍스트가 비어있습니다.');
      }

      if (!jobDescription.trim()) {
        throw new Error('채용공고 내용이 비어있습니다.');
      }

      // 기본 분석 수행
      const baseResult = await TextAnalysisService.analyzeMatch(
        resumeText,
        jobDescription,
        options
      );

      // AI 향상 분석 수행 (useAI가 true인 경우)
      let finalResult: AnalysisResult | EnhancedAnalysisResult = baseResult;
      
      if (options.useAI) {
        try {
          finalResult = await aiEnhancedAnalysisService.enhancedAnalysis(
            resumeText,
            jobDescription,
            baseResult,
            options
          );
        } catch (aiError) {
          console.warn('AI enhanced analysis failed, using base analysis:', aiError);
          // AI 분석 실패 시 기본 결과 사용
        }
      }

      setState({
        result: finalResult,
        analyzing: false,
        error: null
      });

      return finalResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.';
      setState({
        result: null,
        analyzing: false,
        error: errorMessage
      });
      throw error;
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setState({
      result: null,
      analyzing: false,
      error: null
    });
  }, []);

  const retryAnalysis = useCallback((
    resumeText: string,
    jobDescription: string,
    options?: AnalysisOptions
  ) => {
    return analyzeTexts(resumeText, jobDescription, options);
  }, [analyzeTexts]);

  return {
    ...state,
    analyzeTexts,
    clearAnalysis,
    retryAnalysis,
    hasResult: !!state.result
  };
};