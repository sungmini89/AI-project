// 분석 제어 컴포넌트

import React from 'react';
import type { APIMode } from '../../types';
import { useUIStore } from '../../stores';

interface AnalysisControlsProps {
  isAnalyzing: boolean;
  analysisOptions: {
    includeESLint: boolean;
    includeComplexity: boolean;
    includeSecurity: boolean;
    includeAI: boolean;
    includePrettier: boolean;
  };
  onAnalysisOptionsChange: (options: Partial<AnalysisControlsProps['analysisOptions']>) => void;
  onAnalyze: () => void;
  onFormat: () => void;
  onNew: () => void;
  apiMode: APIMode;
  className?: string;
}

export const AnalysisControls: React.FC<AnalysisControlsProps> = ({
  isAnalyzing,
  analysisOptions,
  onAnalysisOptionsChange,
  onAnalyze,
  onFormat,
  onNew,
  apiMode,
  className = ''
}) => {
  const { isLoading } = useUIStore();
  const isFormatting = isLoading('formatting');

  const handleOptionChange = (option: keyof typeof analysisOptions) => {
    onAnalysisOptionsChange({ [option]: !analysisOptions[option] });
  };

  return (
    <div className={`bg-secondary-50 dark:bg-secondary-800 p-4 ${className}`}>
      {/* 메인 액션 버튼들 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className={`
              btn-primary px-6 py-2 font-medium rounded-lg transition-all
              ${isAnalyzing ? 'cursor-not-allowed opacity-50' : 'hover:shadow-lg'}
            `}
          >
            {isAnalyzing ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>분석 중...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>🔍</span>
                <span>코드 분석</span>
              </span>
            )}
          </button>

          <button
            onClick={onFormat}
            disabled={isFormatting || isAnalyzing}
            className="btn-secondary px-4 py-2 rounded-lg"
            title="Prettier로 코드 포맷팅"
          >
            {isFormatting ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>포맷팅...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <span>✨</span>
                <span>포맷팅</span>
              </span>
            )}
          </button>

          <button
            onClick={onNew}
            disabled={isAnalyzing}
            className="btn-secondary px-4 py-2 rounded-lg"
            title="새로운 분석 시작"
          >
            <span className="flex items-center space-x-1">
              <span>📄</span>
              <span>새로 시작</span>
            </span>
          </button>
        </div>

        {/* API 모드 표시 */}
        <div className="text-sm text-secondary-600 dark:text-secondary-400">
          모드: {apiMode === 'offline' ? '오프라인' : `API (${apiMode})`}
        </div>
      </div>

      {/* 분석 옵션 */}
      <div className="border-t border-secondary-200 dark:border-secondary-700 pt-4">
        <div className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
          분석 옵션
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* ESLint 옵션 */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={analysisOptions.includeESLint}
              onChange={() => handleOptionChange('includeESLint')}
              disabled={isAnalyzing}
              className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700 dark:text-secondary-300">
              ESLint
            </span>
          </label>

          {/* 복잡도 분석 옵션 */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={analysisOptions.includeComplexity}
              onChange={() => handleOptionChange('includeComplexity')}
              disabled={isAnalyzing}
              className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700 dark:text-secondary-300">
              복잡도
            </span>
          </label>

          {/* 보안 분석 옵션 */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={analysisOptions.includeSecurity}
              onChange={() => handleOptionChange('includeSecurity')}
              disabled={isAnalyzing}
              className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700 dark:text-secondary-300">
              보안
            </span>
          </label>

          {/* AI 분석 옵션 */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={analysisOptions.includeAI}
              onChange={() => handleOptionChange('includeAI')}
              disabled={isAnalyzing || apiMode === 'offline'}
              className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className={`text-sm ${
              apiMode === 'offline' 
                ? 'text-secondary-400 dark:text-secondary-600' 
                : 'text-secondary-700 dark:text-secondary-300'
            }`}>
              AI 분석
            </span>
          </label>

          {/* Prettier 옵션 */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={analysisOptions.includePrettier}
              onChange={() => handleOptionChange('includePrettier')}
              disabled={isAnalyzing}
              className="form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-700 dark:text-secondary-300">
              Prettier
            </span>
          </label>
        </div>

        {/* 옵션 설명 */}
        {apiMode === 'offline' && (
          <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
            💡 오프라인 모드에서는 AI 분석을 사용할 수 없습니다. 
            API 설정을 통해 AI 기능을 활성화할 수 있습니다.
          </div>
        )}

        {analysisOptions.includeAI && apiMode !== 'offline' && (
          <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
            🤖 AI 분석이 활성화되었습니다. 
            무료 API 사용량에 제한이 있을 수 있습니다.
          </div>
        )}
      </div>

      {/* 단축키 안내 */}
      <div className="mt-4 text-xs text-secondary-500 dark:text-secondary-400 border-t border-secondary-200 dark:border-secondary-700 pt-3">
        <div className="flex flex-wrap gap-4">
          <span><kbd className="px-1 py-0.5 bg-secondary-200 dark:bg-secondary-700 rounded">Ctrl+Enter</kbd> 분석</span>
          <span><kbd className="px-1 py-0.5 bg-secondary-200 dark:bg-secondary-700 rounded">Ctrl+Shift+F</kbd> 포맷팅</span>
          <span><kbd className="px-1 py-0.5 bg-secondary-200 dark:bg-secondary-700 rounded">Ctrl+N</kbd> 새로 시작</span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisControls;