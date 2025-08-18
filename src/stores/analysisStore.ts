// 코드 분석 결과 상태 스토어

import { create } from 'zustand';
import type { 
  CodeAnalysis, 
  SupportedLanguage, 
  ServiceStatus,
  ESLintResult,
  ComplexityAnalysis,
  SecurityAnalysis,
  AIAnalysisResult
} from '../types';

interface AnalysisState {
  // 현재 분석 상태
  isAnalyzing: boolean;
  currentAnalysis: CodeAnalysis | null;
  analysisHistory: CodeAnalysis[];
  
  // 서비스 상태
  serviceStatus: ServiceStatus | null;
  
  // 에러 상태
  error: string | null;
  
  // 액션들
  startAnalysis: () => void;
  completeAnalysis: (analysis: CodeAnalysis) => void;
  failAnalysis: (error: string) => void;
  clearError: () => void;
  
  // 분석 결과 업데이트
  updateESLintResults: (results: ESLintResult[]) => void;
  updateComplexityResults: (results: ComplexityAnalysis) => void;
  updateSecurityResults: (results: SecurityAnalysis) => void;
  updateAIResults: (results: AIAnalysisResult) => void;
  
  // 히스토리 관리
  saveToHistory: () => void;
  loadFromHistory: (id: string) => void;
  deleteFromHistory: (id: string) => void;
  clearHistory: () => void;
  
  // 서비스 상태 관리
  updateServiceStatus: (status: ServiceStatus) => void;
  
  // 유틸리티
  getAnalysisById: (id: string) => CodeAnalysis | undefined;
  getRecentAnalyses: (limit?: number) => CodeAnalysis[];
  getAnalysesByLanguage: (language: SupportedLanguage) => CodeAnalysis[];
  getAnalysisStats: () => {
    total: number;
    byLanguage: Record<string, number>;
    byMode: Record<string, number>;
    avgScore: number;
  };
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  // 초기 상태
  isAnalyzing: false,
  currentAnalysis: null,
  analysisHistory: [],
  serviceStatus: null,
  error: null,

  // 분석 라이프사이클
  startAnalysis: () => {
    set({
      isAnalyzing: true,
      error: null
    });
  },

  completeAnalysis: (analysis: CodeAnalysis) => {
    set({
      isAnalyzing: false,
      currentAnalysis: analysis,
      error: null
    });
  },

  failAnalysis: (error: string) => {
    set({
      isAnalyzing: false,
      error
    });
  },

  clearError: () => {
    set({ error: null });
  },

  // 분석 결과 부분 업데이트
  updateESLintResults: (results: ESLintResult[]) => {
    set((state) => {
      if (!state.currentAnalysis) return state;
      
      return {
        currentAnalysis: {
          ...state.currentAnalysis,
          results: {
            ...state.currentAnalysis.results,
            eslint: results
          }
        }
      };
    });
  },

  updateComplexityResults: (results: ComplexityAnalysis) => {
    set((state) => {
      if (!state.currentAnalysis) return state;
      
      return {
        currentAnalysis: {
          ...state.currentAnalysis,
          results: {
            ...state.currentAnalysis.results,
            complexity: results
          }
        }
      };
    });
  },

  updateSecurityResults: (results: SecurityAnalysis) => {
    set((state) => {
      if (!state.currentAnalysis) return state;
      
      return {
        currentAnalysis: {
          ...state.currentAnalysis,
          results: {
            ...state.currentAnalysis.results,
            security: results
          }
        }
      };
    });
  },

  updateAIResults: (results: AIAnalysisResult) => {
    set((state) => {
      if (!state.currentAnalysis) return state;
      
      return {
        currentAnalysis: {
          ...state.currentAnalysis,
          results: {
            ...state.currentAnalysis.results,
            ai: results
          }
        }
      };
    });
  },

  // 히스토리 관리
  saveToHistory: () => {
    const state = get();
    if (!state.currentAnalysis) return;

    set((prevState) => ({
      analysisHistory: [
        state.currentAnalysis!,
        ...prevState.analysisHistory.slice(0, 49) // 최대 50개 저장
      ]
    }));
  },

  loadFromHistory: (id: string) => {
    const state = get();
    const analysis = state.analysisHistory.find(a => a.id === id);
    
    if (analysis) {
      set({ currentAnalysis: analysis });
    }
  },

  deleteFromHistory: (id: string) => {
    set((state) => ({
      analysisHistory: state.analysisHistory.filter(a => a.id !== id)
    }));
  },

  clearHistory: () => {
    set({ analysisHistory: [] });
  },

  // 서비스 상태 관리
  updateServiceStatus: (status: ServiceStatus) => {
    set({ serviceStatus: status });
  },

  // 유틸리티 함수들
  getAnalysisById: (id: string) => {
    const state = get();
    return state.analysisHistory.find(a => a.id === id);
  },

  getRecentAnalyses: (limit = 10) => {
    const state = get();
    return state.analysisHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  },

  getAnalysesByLanguage: (language: SupportedLanguage) => {
    const state = get();
    return state.analysisHistory
      .filter(a => a.language === language)
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  getAnalysisStats: () => {
    const state = get();
    const { analysisHistory } = state;

    if (analysisHistory.length === 0) {
      return {
        total: 0,
        byLanguage: {},
        byMode: {},
        avgScore: 0
      };
    }

    // 언어별 통계
    const byLanguage = analysisHistory.reduce((acc, analysis) => {
      acc[analysis.language] = (acc[analysis.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 모드별 통계
    const byMode = analysisHistory.reduce((acc, analysis) => {
      acc[analysis.mode] = (acc[analysis.mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 평균 점수 계산
    const totalScore = analysisHistory.reduce((sum, analysis) => {
      return sum + (analysis.results.ai?.score || 0);
    }, 0);
    const avgScore = totalScore / analysisHistory.length;

    return {
      total: analysisHistory.length,
      byLanguage,
      byMode,
      avgScore: Math.round(avgScore)
    };
  }
}));