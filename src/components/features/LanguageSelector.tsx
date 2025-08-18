// 프로그래밍 언어 선택 컴포넌트

import React from 'react';
import type { SupportedLanguage } from '../../types';

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  disabled?: boolean;
  className?: string;
}

// 언어 정보와 아이콘
const LANGUAGES = [
  {
    value: 'javascript' as const,
    label: 'JavaScript',
    icon: '🟨',
    description: 'ECMAScript, 동적 웹 프로그래밍',
    extension: '.js'
  },
  {
    value: 'typescript' as const,
    label: 'TypeScript',
    icon: '🔷',
    description: '정적 타입 JavaScript',
    extension: '.ts'
  },
  {
    value: 'python' as const,
    label: 'Python',
    icon: '🐍',
    description: '범용 프로그래밍 언어',
    extension: '.py'
  },
  {
    value: 'java' as const,
    label: 'Java',
    icon: '☕',
    description: 'Write Once, Run Anywhere',
    extension: '.java'
  },
  {
    value: 'cpp' as const,
    label: 'C++',
    icon: '⚡',
    description: '시스템 프로그래밍',
    extension: '.cpp'
  },
  {
    value: 'csharp' as const,
    label: 'C#',
    icon: '🔵',
    description: 'Microsoft .NET 플랫폼',
    extension: '.cs'
  },
  {
    value: 'go' as const,
    label: 'Go',
    icon: '🐹',
    description: 'Google의 시스템 언어',
    extension: '.go'
  },
  {
    value: 'rust' as const,
    label: 'Rust',
    icon: '🦀',
    description: '메모리 안전 시스템 언어',
    extension: '.rs'
  },
  {
    value: 'php' as const,
    label: 'PHP',
    icon: '🐘',
    description: '웹 개발 스크립트 언어',
    extension: '.php'
  },
  {
    value: 'ruby' as const,
    label: 'Ruby',
    icon: '💎',
    description: '개발자 친화적 언어',
    extension: '.rb'
  },
  {
    value: 'swift' as const,
    label: 'Swift',
    icon: '🦉',
    description: 'Apple 플랫폼 개발',
    extension: '.swift'
  },
  {
    value: 'kotlin' as const,
    label: 'Kotlin',
    icon: '🎯',
    description: 'JVM 호환 현대적 언어',
    extension: '.kt'
  }
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  disabled = false,
  className = ''
}) => {
  const selectedLangInfo = LANGUAGES.find(lang => lang.value === selectedLanguage);

  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
        disabled={disabled}
        className={`
          input-field pr-10 min-w-[160px] appearance-none cursor-pointer
          ${disabled ? 'bg-secondary-100 cursor-not-allowed' : 'hover:border-primary-400'}
          ${className}
        `}
        title={selectedLangInfo?.description}
      >
        {LANGUAGES.map((language) => (
          <option key={language.value} value={language.value}>
            {language.icon} {language.label} ({language.extension})
          </option>
        ))}
      </select>

      {/* 커스텀 드롭다운 화살표 */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg 
          className="w-4 h-4 text-secondary-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </div>

      {/* 선택된 언어 정보 표시 (옵션) */}
      {selectedLangInfo && (
        <div className="mt-1 text-xs text-secondary-500">
          {selectedLangInfo.icon} {selectedLangInfo.description}
        </div>
      )}
    </div>
  );
};

// 언어별 설정 가져오기
export const getLanguageConfig = (language: SupportedLanguage) => {
  return LANGUAGES.find(lang => lang.value === language);
};

// 지원되는 모든 언어 목록
export const getSupportedLanguages = () => {
  return LANGUAGES.map(lang => lang.value);
};

// 언어별 Monaco Editor 언어 매핑
export const getMonacoLanguage = (language: SupportedLanguage): string => {
  const mapping: Record<SupportedLanguage, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    csharp: 'csharp',
    go: 'go',
    rust: 'rust',
    php: 'php',
    ruby: 'ruby',
    swift: 'swift',
    kotlin: 'kotlin'
  };

  return mapping[language] || 'plaintext';
};

// 언어별 파일 확장자 가져오기
export const getFileExtension = (language: SupportedLanguage): string => {
  const langInfo = LANGUAGES.find(lang => lang.value === language);
  return langInfo?.extension || '.txt';
};

export default LanguageSelector;