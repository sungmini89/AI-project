// AI 코드 리뷰 홈페이지

import React from 'react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../stores';

export const HomePage: React.FC = () => {
  const { apiMode, preferences } = useSettingsStore();

  const features = [
    {
      icon: '🔍',
      title: 'ESLint 기반 코드 품질 검사',
      description: 'JavaScript/TypeScript 코드의 품질을 실시간으로 검사하고 개선 사항을 제안합니다.',
      available: true
    },
    {
      icon: '📊',
      title: 'McCabe 복잡도 분석',
      description: '순환 복잡도와 인지 복잡도를 계산하여 코드의 가독성과 유지보수성을 평가합니다.',
      available: true
    },
    {
      icon: '🛡️',
      title: '보안 패턴 검사',
      description: 'SQL 인젝션, XSS, 하드코딩된 인증정보 등 보안 취약점을 자동으로 탐지합니다.',
      available: true
    },
    {
      icon: '🤖',
      title: 'AI 기반 코드 리뷰',
      description: 'Google Gemini API를 활용한 지능형 코드 분석 및 개선 제안을 제공합니다.',
      available: preferences.enableAI && apiMode !== 'offline'
    },
    {
      icon: '✨',
      title: 'Prettier 코드 포맷팅',
      description: '일관된 코드 스타일을 위한 자동 포맷팅 기능을 제공합니다.',
      available: true
    },
    {
      icon: '🌐',
      title: '오프라인 모드',
      description: '인터넷 연결 없이도 기본적인 코드 분석 기능을 사용할 수 있습니다.',
      available: true
    }
  ];

  const supportedLanguages = [
    { name: 'JavaScript', icon: '🟨', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'TypeScript', icon: '🔷', color: 'bg-blue-100 text-blue-800' },
    { name: 'Python', icon: '🐍', color: 'bg-green-100 text-green-800' },
    { name: 'Java', icon: '☕', color: 'bg-orange-100 text-orange-800' },
    { name: 'C++', icon: '⚡', color: 'bg-purple-100 text-purple-800' },
    { name: 'C#', icon: '🔵', color: 'bg-indigo-100 text-indigo-800' },
    { name: 'Go', icon: '🐹', color: 'bg-cyan-100 text-cyan-800' },
    { name: 'Rust', icon: '🦀', color: 'bg-red-100 text-red-800' }
  ];

  const apiTiers = [
    {
      name: '오프라인 모드',
      price: '무료',
      features: [
        'ESLint 기반 코드 품질 검사',
        'McCabe 복잡도 분석',
        '보안 패턴 검사',
        'Prettier 포맷팅',
        '무제한 사용'
      ],
      current: apiMode === 'offline'
    },
    {
      name: 'Google Gemini 무료',
      price: '무료',
      features: [
        '모든 오프라인 기능',
        'AI 기반 코드 리뷰',
        '일일 1,500회 API 호출',
        '고급 분석 및 제안'
      ],
      current: apiMode === 'free' && preferences.enableAI
    },
    {
      name: '사용자 API 키',
      price: '사용자 부담',
      features: [
        '모든 기능 이용 가능',
        'API 사용량 제한 없음',
        '개인 API 키 사용',
        '최고 품질 분석'
      ],
      current: apiMode === 'custom'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-secondary-900 dark:to-secondary-800">
      {/* 헤더 */}
      <header className="bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm border-b border-secondary-200 dark:border-secondary-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🤖</div>
              <h1 className="text-xl font-bold text-secondary-900 dark:text-white">
                AI 코드 리뷰어
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {apiMode !== 'offline' && preferences.enableAI && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  AI 활성화
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full ${
                apiMode === 'offline' 
                  ? 'bg-gray-100 text-gray-800' 
                  : 'bg-primary-100 text-primary-800'
              }`}>
                {apiMode === 'offline' ? '오프라인' : 'API 모드'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-secondary-900 dark:text-white mb-6">
            AI 기반 코드 품질 분석
            <span className="block text-primary-600 dark:text-primary-400">
              무료로 시작하세요
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-secondary-600 dark:text-secondary-300 mb-8 max-w-2xl mx-auto">
            ESLint, 복잡도 분석, 보안 검사부터 AI 기반 코드 리뷰까지. 
            모든 기능을 브라우저에서 바로 사용할 수 있습니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/analyze"
              className="btn-primary text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              🚀 코드 분석 시작하기
            </Link>
            
            <Link
              to="/offline"
              className="btn-secondary text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              📱 오프라인으로 체험
            </Link>
          </div>

          {/* 실시간 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                12+
              </div>
              <div className="text-secondary-600 dark:text-secondary-400">
                지원 언어
              </div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                1,500
              </div>
              <div className="text-secondary-600 dark:text-secondary-400">
                일일 무료 API 호출
              </div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                100%
              </div>
              <div className="text-secondary-600 dark:text-secondary-400">
                브라우저 기반
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-secondary-900 dark:text-white mb-12">
          주요 기능
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`card p-6 hover:shadow-lg transition-shadow ${
                !feature.available ? 'opacity-60' : ''
              }`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                {feature.title}
              </h4>
              <p className="text-secondary-600 dark:text-secondary-300 mb-4">
                {feature.description}
              </p>
              {!feature.available && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  API 키 필요
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 지원 언어 */}
      <section className="container mx-auto px-4 py-16 bg-white/50 dark:bg-secondary-800/50 rounded-2xl mx-4">
        <h3 className="text-3xl font-bold text-center text-secondary-900 dark:text-white mb-12">
          지원 프로그래밍 언어
        </h3>
        
        <div className="flex flex-wrap justify-center gap-4">
          {supportedLanguages.map((lang, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full ${lang.color} font-medium`}
            >
              <span className="text-lg">{lang.icon}</span>
              <span>{lang.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 요금제 */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-secondary-900 dark:text-white mb-12">
          이용 방법
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {apiTiers.map((tier, index) => (
            <div
              key={index}
              className={`card p-8 text-center relative ${
                tier.current ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''
              }`}
            >
              {tier.current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm">
                    현재 사용 중
                  </span>
                </div>
              )}
              
              <h4 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
                {tier.name}
              </h4>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-6">
                {tier.price}
              </p>
              
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    <span className="text-secondary-600 dark:text-secondary-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              {!tier.current && (
                <Link
                  to="/settings"
                  className="btn-primary w-full"
                >
                  설정하기
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold text-secondary-900 dark:text-white mb-6">
            지금 바로 시작하세요
          </h3>
          <p className="text-lg text-secondary-600 dark:text-secondary-300 mb-8">
            설치나 회원가입 없이 브라우저에서 바로 코드 품질을 개선할 수 있습니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/analyze"
              className="btn-primary text-lg px-8 py-3 rounded-xl"
            >
              코드 분석 시작하기
            </Link>
            <Link
              to="/settings"
              className="btn-secondary text-lg px-8 py-3 rounded-xl"
            >
              API 설정하기
            </Link>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-secondary-800 dark:bg-secondary-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">AI 코드 리뷰어</h4>
              <p className="text-secondary-300">
                무료로 사용할 수 있는 AI 기반 코드 품질 분석 도구입니다.
                브라우저에서 바로 사용 가능하며 오프라인 모드도 지원합니다.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">주요 기능</h4>
              <ul className="space-y-2 text-secondary-300">
                <li>• ESLint 기반 코드 검사</li>
                <li>• McCabe 복잡도 분석</li>
                <li>• 보안 취약점 검사</li>
                <li>• AI 코드 리뷰</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">API 제공업체</h4>
              <ul className="space-y-2 text-secondary-300">
                <li>• Google Gemini API</li>
                <li>• Cohere API</li>
                <li>• 오프라인 정적 분석</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-secondary-700 mt-8 pt-8 text-center text-secondary-400">
            <p>© 2025 AI 코드 리뷰어. 모든 권리 보유.</p>
            <p className="text-sm mt-2">
              무료 API 제한: Gemini 1,500회/일, Cohere 1,000회/월
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;