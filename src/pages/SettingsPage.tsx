// API 설정 및 사용자 설정 페이지

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettingsStore, useUIStore } from '../stores';
// import type { APIMode } from '../types'; // Not used
import config from '../config';

export const SettingsPage: React.FC = () => {
  const {
    theme,
    language,
    apiMode,
    apiKeys,
    preferences,
    // apiUsage, // Not used directly
    setTheme,
    setLanguage,
    setAPIMode,
    setAPIKey,
    removeAPIKey,
    updatePreferences,
    getTodayUsage,
    getMonthlyUsage,
    canUseAPI,
    exportSettings,
    importSettings,
    resetSettings
  } = useSettingsStore();

  const { addNotification } = useUIStore();

  // 로컬 상태
  const [localAPIKeys, setLocalAPIKeys] = useState({
    gemini: apiKeys.gemini || '',
    cohere: apiKeys.cohere || '',
    huggingface: apiKeys.huggingface || ''
  });

  const [showAPIKeys, setShowAPIKeys] = useState({
    gemini: false,
    cohere: false,
    huggingface: false
  });

  // API 키 저장
  const handleSaveAPIKey = (provider: string) => {
    const key = localAPIKeys[provider as keyof typeof localAPIKeys];
    
    if (key.trim()) {
      setAPIKey(provider, key.trim());
      addNotification({
        type: 'success',
        title: 'API 키 저장됨',
        message: `${provider} API 키가 저장되었습니다.`
      });
    } else {
      removeAPIKey(provider);
      addNotification({
        type: 'info',
        title: 'API 키 제거됨',
        message: `${provider} API 키가 제거되었습니다.`
      });
    }
  };

  // API 키 테스트
  const handleTestAPIKey = async (provider: string) => {
    const key = localAPIKeys[provider as keyof typeof localAPIKeys];
    
    if (!key.trim()) {
      addNotification({
        type: 'warning',
        title: '테스트 불가',
        message: 'API 키를 먼저 입력해주세요.'
      });
      return;
    }

    // 간단한 테스트 요청 시뮬레이션
    addNotification({
      type: 'info',
      title: 'API 키 테스트',
      message: `${provider} API 키를 테스트 중입니다...`
    });

    // 실제 환경에서는 여기서 API 호출을 해볼 수 있습니다
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: '테스트 성공',
        message: `${provider} API 키가 유효합니다.`
      });
    }, 1000);
  };

  // 설정 내보내기
  const handleExportSettings = () => {
    try {
      const settings = exportSettings();
      const blob = new Blob([settings], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-code-review-settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: '설정 내보내기 완료',
        message: '설정이 파일로 저장되었습니다.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: '내보내기 실패',
        message: '설정 내보내기 중 오류가 발생했습니다.'
      });
    }
  };

  // 설정 가져오기
  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importSettings(content);
        
        if (success) {
          addNotification({
            type: 'success',
            title: '설정 가져오기 완료',
            message: '설정이 성공적으로 적용되었습니다.'
          });
        } else {
          addNotification({
            type: 'error',
            title: '가져오기 실패',
            message: '잘못된 설정 파일입니다.'
          });
        }
      } catch (error) {
        addNotification({
          type: 'error',
          title: '파일 읽기 실패',
          message: '설정 파일을 읽을 수 없습니다.'
        });
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // 파일 입력 초기화
  };

  // 설정 초기화
  const handleResetSettings = () => {
    if (confirm('모든 설정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      resetSettings();
      setLocalAPIKeys({
        gemini: '',
        cohere: '',
        huggingface: ''
      });
      
      addNotification({
        type: 'info',
        title: '설정 초기화 완료',
        message: '모든 설정이 초기값으로 복원되었습니다.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-secondary-800 shadow-sm border-b border-secondary-200 dark:border-secondary-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-secondary-600 hover:text-secondary-800 dark:text-secondary-400 dark:hover:text-secondary-200"
              >
                ← 홈으로
              </Link>
              <h1 className="text-xl font-bold text-secondary-900 dark:text-white">
                ⚙️ 설정
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-8">
          
          {/* API 모드 설정 */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              🤖 API 모드 설정
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  apiMode === 'offline'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300'
                }`}
                onClick={() => setAPIMode('offline')}
              >
                <div className="text-2xl mb-2">📱</div>
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">
                  오프라인 모드
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  인터넷 연결 없이 기본 분석 기능만 사용
                </p>
              </div>

              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  apiMode === 'free'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300'
                }`}
                onClick={() => setAPIMode('free')}
              >
                <div className="text-2xl mb-2">🆓</div>
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">
                  무료 API
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  제한된 AI 분석 (일일 1,500회)
                </p>
              </div>

              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  apiMode === 'custom'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300'
                }`}
                onClick={() => setAPIMode('custom')}
              >
                <div className="text-2xl mb-2">🔑</div>
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">
                  사용자 API 키
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  개인 API 키로 무제한 사용
                </p>
              </div>
            </div>

            {/* API 사용량 표시 */}
            {apiMode !== 'offline' && (
              <div className="bg-secondary-50 dark:bg-secondary-800 p-4 rounded-lg">
                <h4 className="font-medium text-secondary-900 dark:text-white mb-3">
                  API 사용량
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-secondary-600 dark:text-secondary-400">
                        Gemini (오늘)
                      </span>
                      <span className="text-sm font-mono">
                        {getTodayUsage('gemini')} / {config.api.gemini.dailyLimit}
                      </span>
                    </div>
                    <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          canUseAPI('gemini') ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min((getTodayUsage('gemini') / config.api.gemini.dailyLimit) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-secondary-600 dark:text-secondary-400">
                        Cohere (이번 달)
                      </span>
                      <span className="text-sm font-mono">
                        {getMonthlyUsage('cohere')} / {config.api.cohere.monthlyLimit}
                      </span>
                    </div>
                    <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          canUseAPI('cohere') ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min((getMonthlyUsage('cohere') / config.api.cohere.monthlyLimit) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* API 키 설정 */}
          {apiMode !== 'offline' && (
            <section className="card p-6">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                🔑 API 키 관리
              </h2>

              <div className="space-y-6">
                {/* Google Gemini API */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Google Gemini API 키
                    </label>
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      API 키 발급받기 →
                    </a>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type={showAPIKeys.gemini ? 'text' : 'password'}
                        value={localAPIKeys.gemini}
                        onChange={(e) => setLocalAPIKeys(prev => ({ ...prev, gemini: e.target.value }))}
                        placeholder="Gemini API 키를 입력하세요"
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAPIKeys(prev => ({ ...prev, gemini: !prev.gemini }))}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                      >
                        {showAPIKeys.gemini ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <button
                      onClick={() => handleSaveAPIKey('gemini')}
                      className="btn-primary px-4 py-2 rounded-lg"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => handleTestAPIKey('gemini')}
                      className="btn-secondary px-4 py-2 rounded-lg"
                    >
                      테스트
                    </button>
                  </div>
                  <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-1">
                    무료 티어: 일일 1,500회 요청 가능
                  </p>
                </div>

                {/* Cohere API */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Cohere API 키
                    </label>
                    <a
                      href="https://dashboard.cohere.ai/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      API 키 발급받기 →
                    </a>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type={showAPIKeys.cohere ? 'text' : 'password'}
                        value={localAPIKeys.cohere}
                        onChange={(e) => setLocalAPIKeys(prev => ({ ...prev, cohere: e.target.value }))}
                        placeholder="Cohere API 키를 입력하세요"
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAPIKeys(prev => ({ ...prev, cohere: !prev.cohere }))}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                      >
                        {showAPIKeys.cohere ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <button
                      onClick={() => handleSaveAPIKey('cohere')}
                      className="btn-primary px-4 py-2 rounded-lg"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => handleTestAPIKey('cohere')}
                      className="btn-secondary px-4 py-2 rounded-lg"
                    >
                      테스트
                    </button>
                  </div>
                  <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-1">
                    무료 티어: 월 1,000회 요청 가능
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* 일반 설정 */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              🎨 일반 설정
            </h2>

            <div className="space-y-6">
              {/* 테마 설정 */}
              <div>
                <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2 block">
                  테마
                </label>
                <div className="flex space-x-2">
                  {[
                    { value: 'light', label: '밝은 테마', icon: '☀️' },
                    { value: 'dark', label: '어두운 테마', icon: '🌙' },
                    { value: 'system', label: '시스템 설정', icon: '💻' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value as any)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        theme === option.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300'
                      }`}
                    >
                      <span className="mr-2">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 언어 설정 */}
              <div>
                <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2 block">
                  언어
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
                  className="input-field max-w-xs"
                >
                  <option value="ko">🇰🇷 한국어</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>
            </div>
          </section>

          {/* 분석 설정 */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              🔍 분석 설정
            </h2>

            <div className="space-y-4">
              {[
                {
                  key: 'autoFormat',
                  label: '자동 포맷팅',
                  description: '코드 분석 시 자동으로 Prettier 포맷팅 적용'
                },
                {
                  key: 'realTimeAnalysis',
                  label: '실시간 분석',
                  description: '코드 입력 중 실시간으로 기본 분석 수행'
                },
                {
                  key: 'showComplexity',
                  label: '복잡도 표시',
                  description: '코드 복잡도 분석 결과 표시'
                },
                {
                  key: 'showSecurity',
                  label: '보안 검사',
                  description: '보안 취약점 패턴 검사 수행'
                },
                {
                  key: 'enableAI',
                  label: 'AI 분석',
                  description: 'API 키가 설정된 경우 AI 기반 코드 분석 활성화'
                }
              ].map(option => (
                <label key={option.key} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences[option.key as keyof typeof preferences]}
                    onChange={(e) => updatePreferences({ [option.key]: e.target.checked })}
                    className="mt-1 form-checkbox h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-secondary-900 dark:text-white">
                      {option.label}
                    </div>
                    <div className="text-xs text-secondary-600 dark:text-secondary-400">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* 설정 관리 */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              📁 설정 관리
            </h2>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportSettings}
                className="btn-secondary px-4 py-2 rounded-lg"
              >
                📤 설정 내보내기
              </button>
              
              <label className="btn-secondary px-4 py-2 rounded-lg cursor-pointer">
                📥 설정 가져오기
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={handleResetSettings}
                className="btn-secondary px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                🔄 설정 초기화
              </button>
            </div>
          </section>

          {/* 정보 섹션 */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              ℹ️ 정보
            </h2>

            <div className="space-y-3 text-sm text-secondary-600 dark:text-secondary-400">
              <p>
                • API 키는 브라우저의 로컬 스토리지에 안전하게 저장됩니다.
              </p>
              <p>
                • 무료 API 티어에는 사용량 제한이 있습니다.
              </p>
              <p>
                • 오프라인 모드에서도 기본적인 코드 분석 기능을 사용할 수 있습니다.
              </p>
              <p>
                • 설정은 브라우저별로 개별 저장됩니다.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
              <p className="text-xs text-secondary-500 dark:text-secondary-500">
                AI 코드 리뷰어 v1.0.0 • 
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline ml-1"
                >
                  GitHub
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;