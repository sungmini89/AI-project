// 분석 결과 표시 컴포넌트

import React, { useState } from 'react';
import type { CodeAnalysis, ESLintResult, SecurityIssue, AIIssue } from '../../types';

interface AnalysisResultsProps {
  analysis: CodeAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  onRetry: () => void;
  onClearError: () => void;
}

type TabType = 'overview' | 'eslint' | 'complexity' | 'security' | 'ai' | 'prettier';

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  isAnalyzing,
  error,
  onRetry,
  onClearError
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // 로딩 상태
  if (isAnalyzing) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400 mb-2">코드 분석 중...</p>
          <p className="text-sm text-secondary-500 dark:text-secondary-500">
            잠시만 기다려주세요. 분석이 완료되면 결과를 표시합니다.
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            분석 실패
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            {error}
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={onRetry}
              className="btn-primary px-4 py-2 rounded-lg"
            >
              다시 시도
            </button>
            <button
              onClick={onClearError}
              className="btn-secondary px-4 py-2 rounded-lg"
            >
              에러 지우기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 분석 결과가 없는 상태
  if (!analysis) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
            분석 결과 대기 중
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            코드를 입력하고 분석 버튼을 클릭해주세요.
          </p>
        </div>
      </div>
    );
  }

  // 탭 목록 생성
  const tabs: Array<{ key: TabType; label: string; count?: number; available: boolean }> = [
    { key: 'overview', label: '개요', available: true },
    { 
      key: 'eslint', 
      label: 'ESLint', 
      count: analysis.results.eslint?.length || 0,
      available: !!analysis.results.eslint 
    },
    { 
      key: 'complexity', 
      label: '복잡도', 
      available: !!analysis.results.complexity 
    },
    { 
      key: 'security', 
      label: '보안', 
      count: analysis.results.security?.issues.length || 0,
      available: !!analysis.results.security 
    },
    { 
      key: 'ai', 
      label: 'AI', 
      count: analysis.results.ai?.issues.length || 0,
      available: !!analysis.results.ai 
    },
    { 
      key: 'prettier', 
      label: 'Prettier', 
      available: !!analysis.results.prettier 
    }
  ];

  const availableTabs = tabs.filter(tab => tab.available);

  return (
    <div className="h-full flex flex-col">
      {/* 탭 헤더 */}
      <div className="border-b border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
        <div className="flex space-x-1 p-2">
          {availableTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tab.key
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                }
              `}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key
                    ? 'bg-primary-200 dark:bg-primary-800 text-primary-800 dark:text-primary-200'
                    : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 내용 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && <OverviewTab analysis={analysis} />}
        {activeTab === 'eslint' && <ESLintTab results={analysis.results.eslint || []} />}
        {activeTab === 'complexity' && <ComplexityTab complexity={analysis.results.complexity} />}
        {activeTab === 'security' && <SecurityTab security={analysis.results.security} />}
        {activeTab === 'ai' && <AITab ai={analysis.results.ai} />}
        {activeTab === 'prettier' && <PrettierTab prettier={analysis.results.prettier} />}
      </div>
    </div>
  );
};

// 개요 탭
const OverviewTab: React.FC<{ analysis: CodeAnalysis }> = ({ analysis }) => {
  const { results } = analysis;
  
  const stats = {
    eslintIssues: results.eslint?.length || 0,
    complexityScore: results.complexity?.cyclomatic || 0,
    securityIssues: results.security?.issues.length || 0,
    aiScore: results.ai?.score || 0,
    prettierChanged: results.prettier?.changed || false
  };

  return (
    <div className="space-y-6">
      {/* 전체 요약 */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
          분석 요약
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.eslintIssues}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              ESLint 이슈
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.complexityScore}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              순환 복잡도
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.securityIssues}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              보안 이슈
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.aiScore}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              AI 점수
            </div>
          </div>
        </div>
      </div>

      {/* AI 요약 (있는 경우) */}
      {results.ai && (
        <div className="card p-6">
          <h4 className="text-md font-semibold text-secondary-900 dark:text-white mb-3">
            🤖 AI 분석 요약
          </h4>
          <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed">
            {results.ai.summary}
          </p>
        </div>
      )}

      {/* 주요 이슈 */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-secondary-900 dark:text-white">
          주요 이슈
        </h4>
        
        {stats.eslintIssues === 0 && stats.securityIssues === 0 && 
         (!results.ai || results.ai.issues.length === 0) ? (
          <div className="card p-6 text-center text-green-600 dark:text-green-400">
            ✅ 발견된 이슈가 없습니다!
          </div>
        ) : (
          <div className="space-y-2">
            {results.eslint?.slice(0, 3).map((issue, index) => (
              <IssueCard key={index} issue={issue} type="eslint" />
            ))}
            {results.security?.issues.slice(0, 3).map((issue, index) => (
              <IssueCard key={index} issue={issue} type="security" />
            ))}
            {results.ai?.issues.slice(0, 3).map((issue, index) => (
              <IssueCard key={index} issue={issue} type="ai" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ESLint 탭
const ESLintTab: React.FC<{ results: ESLintResult[] }> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">✅</div>
        <p className="text-secondary-600 dark:text-secondary-400">
          ESLint 이슈가 발견되지 않았습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result, index) => (
        <div key={index} className="card p-4">
          <div className="flex items-start space-x-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              result.severity === 'error' ? 'bg-red-500' :
              result.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            }`} />
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-mono text-sm text-secondary-600 dark:text-secondary-400">
                  줄 {result.line}:{result.column}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  result.severity === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  result.severity === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {result.severity}
                </span>
                <span className="text-xs text-secondary-500 dark:text-secondary-500">
                  {result.ruleId}
                </span>
              </div>
              
              <p className="text-secondary-700 dark:text-secondary-300 mb-2">
                {result.message}
              </p>
              
              <code className="text-xs bg-secondary-100 dark:bg-secondary-800 p-2 rounded block overflow-x-auto">
                {result.source}
              </code>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 복잡도 탭
const ComplexityTab: React.FC<{ complexity?: any }> = ({ complexity }) => {
  if (!complexity) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600 dark:text-secondary-400">
          복잡도 분석 결과가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 전체 복잡도 */}
      <div className="card p-6">
        <h4 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
          전체 복잡도
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              complexity.cyclomatic <= 10 ? 'text-green-600' :
              complexity.cyclomatic <= 20 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {complexity.cyclomatic}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              순환 복잡도
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              complexity.cognitive <= 15 ? 'text-green-600' :
              complexity.cognitive <= 25 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {complexity.cognitive}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              인지 복잡도
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {complexity.lines}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              총 줄 수
            </div>
          </div>
        </div>
      </div>

      {/* 함수별 복잡도 */}
      {complexity.functions && complexity.functions.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
            함수별 복잡도
          </h4>
          <div className="space-y-3">
            {complexity.functions.map((func: any, index: number) => (
              <div key={index} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-semibold text-secondary-900 dark:text-white">
                      {func.name}
                    </span>
                    <span className="text-sm text-secondary-600 dark:text-secondary-400 ml-2">
                      줄 {func.line}
                    </span>
                  </div>
                  <div className="flex space-x-4">
                    <div className="text-right">
                      <div className={`font-bold ${
                        func.cyclomatic <= 10 ? 'text-green-600' : 
                        func.cyclomatic <= 20 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {func.cyclomatic}
                      </div>
                      <div className="text-xs text-secondary-500">순환</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        func.cognitive <= 15 ? 'text-green-600' : 
                        func.cognitive <= 25 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {func.cognitive}
                      </div>
                      <div className="text-xs text-secondary-500">인지</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 보안 탭
const SecurityTab: React.FC<{ security?: any }> = ({ security }) => {
  if (!security || security.issues.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🛡️</div>
        <p className="text-secondary-600 dark:text-secondary-400">
          보안 이슈가 발견되지 않았습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {security.issues.map((issue: SecurityIssue, index: number) => (
        <div key={index} className="card p-4">
          <div className="flex items-start space-x-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              issue.severity === 'critical' ? 'bg-red-500' :
              issue.severity === 'high' ? 'bg-orange-500' :
              issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
            }`} />
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-mono text-sm text-secondary-600 dark:text-secondary-400">
                  줄 {issue.line}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  issue.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  issue.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {issue.severity}
                </span>
                <span className="text-xs text-secondary-500 dark:text-secondary-500">
                  {issue.type}
                </span>
              </div>
              
              <p className="text-secondary-700 dark:text-secondary-300 mb-2">
                {issue.message}
              </p>
              
              {issue.suggestion && (
                <p className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                  💡 {issue.suggestion}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// AI 탭
const AITab: React.FC<{ ai?: any }> = ({ ai }) => {
  if (!ai) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🤖</div>
        <p className="text-secondary-600 dark:text-secondary-400">
          AI 분석 결과가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI 점수 */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-secondary-900 dark:text-white">
            AI 분석 점수
          </h4>
          <span className="text-xs text-secondary-500 dark:text-secondary-500">
            {ai.provider} • {ai.model}
          </span>
        </div>
        
        <div className="text-center">
          <div className={`text-4xl font-bold ${
            ai.score >= 90 ? 'text-green-600' :
            ai.score >= 70 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {ai.score}
          </div>
          <div className="text-sm text-secondary-600 dark:text-secondary-400">
            / 100 점 (신뢰도: {Math.round(ai.confidence * 100)}%)
          </div>
        </div>
      </div>

      {/* AI 이슈들 */}
      {ai.issues && ai.issues.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
            발견된 이슈
          </h4>
          <div className="space-y-3">
            {ai.issues.map((issue: AIIssue, index: number) => (
              <IssueCard key={index} issue={issue} type="ai" />
            ))}
          </div>
        </div>
      )}

      {/* AI 제안사항 */}
      {ai.suggestions && ai.suggestions.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
            개선 제안
          </h4>
          <div className="space-y-3">
            {ai.suggestions.map((suggestion: any, index: number) => (
              <div key={index} className="card p-4 border-l-4 border-blue-500">
                <div className="flex items-start space-x-3">
                  <span className="text-blue-500 text-lg">💡</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {suggestion.priority} priority
                      </span>
                      <span className="text-xs text-secondary-500 dark:text-secondary-500">
                        {suggestion.type}
                      </span>
                    </div>
                    
                    <p className="text-secondary-700 dark:text-secondary-300 mb-2">
                      {suggestion.description}
                    </p>
                    
                    {suggestion.example && (
                      <code className="text-xs bg-secondary-100 dark:bg-secondary-800 p-2 rounded block">
                        {suggestion.example}
                      </code>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Prettier 탭
const PrettierTab: React.FC<{ prettier?: any }> = ({ prettier }) => {
  if (!prettier) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600 dark:text-secondary-400">
          Prettier 분석 결과가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h4 className="text-md font-semibold text-secondary-900 dark:text-white mb-4">
          포맷팅 결과
        </h4>
        
        {prettier.changed ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">✨</div>
              <p className="text-secondary-700 dark:text-secondary-300">
                코드 포맷팅이 적용되었습니다.
              </p>
            </div>
            
            {prettier.diff && (
              <div className="bg-secondary-100 dark:bg-secondary-800 p-4 rounded">
                <h5 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                  변경 사항:
                </h5>
                <pre className="text-xs overflow-x-auto">
                  <code>{prettier.diff}</code>
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">✅</div>
            <p className="text-secondary-700 dark:text-secondary-300">
              코드가 이미 올바른 형식입니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// 이슈 카드 컴포넌트
const IssueCard: React.FC<{ issue: any; type: string }> = ({ issue, type }) => (
  <div className="card p-4">
    <div className="flex items-start space-x-3">
      <div className={`w-2 h-2 rounded-full mt-2 ${
        issue.severity === 'error' || issue.severity === 'critical' ? 'bg-red-500' :
        issue.severity === 'warning' || issue.severity === 'high' ? 'bg-yellow-500' : 'bg-blue-500'
      }`} />
      
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          {issue.line && (
            <span className="font-mono text-sm text-secondary-600 dark:text-secondary-400">
              줄 {issue.line}
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full ${
            issue.severity === 'error' || issue.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            issue.severity === 'warning' || issue.severity === 'high' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}>
            {issue.severity}
          </span>
          <span className="text-xs text-secondary-500 dark:text-secondary-500">
            {type}
          </span>
        </div>
        
        <p className="text-secondary-700 dark:text-secondary-300">
          {issue.message}
        </p>
      </div>
    </div>
  </div>
);

export default AnalysisResults;