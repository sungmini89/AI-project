// 오프라인 분석 도구 페이지

import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CodeEditor from '../components/features/CodeEditor';
import { useCodeStore, useUIStore } from '../stores';
import OfflineAnalysisService from '../services/offlineService';
import FormattingService from '../services/formattingService';
import type { 
  SupportedLanguage, 
  ESLintResult, 
  ComplexityAnalysis, 
  SecurityAnalysis,
  PrettierResult
} from '../types';

export const OfflinePage: React.FC = () => {
  const { 
    currentCode, 
    currentLanguage, 
    setCode, 
    setLanguage 
  } = useCodeStore();
  
  const { addNotification } = useUIStore();

  // 로컬 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    eslint?: ESLintResult[];
    complexity?: ComplexityAnalysis;
    security?: SecurityAnalysis;
    prettier?: PrettierResult;
  }>({});

  // 서비스 인스턴스
  const offlineService = new OfflineAnalysisService();
  const formattingService = FormattingService.getInstance();

  // 코드 변경 핸들러
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, [setCode]);

  // 언어 변경 핸들러
  const handleLanguageChange = useCallback((newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
  }, [setLanguage]);

  // 오프라인 분석 실행
  const handleAnalyze = useCallback(async () => {
    if (!currentCode.trim()) {
      addNotification({
        type: 'warning',
        title: '코드 없음',
        message: '분석할 코드를 입력해주세요.'
      });
      return;
    }

    setIsAnalyzing(true);
    const newResults: typeof results = {};

    try {
      // 병렬로 분석 실행
      const [eslintResults, complexityResults, securityResults] = await Promise.allSettled([
        offlineService.analyzeWithESLint(currentCode, currentLanguage),
        offlineService.calculateComplexity(currentCode, currentLanguage),
        offlineService.analyzeSecurityPatterns(currentCode, currentLanguage)
      ]);

      if (eslintResults.status === 'fulfilled') {
        newResults.eslint = eslintResults.value;
      }

      if (complexityResults.status === 'fulfilled') {
        newResults.complexity = complexityResults.value;
      }

      if (securityResults.status === 'fulfilled') {
        newResults.security = securityResults.value;
      }

      // Prettier 분석 (지원되는 언어만)
      if (formattingService.isLanguageSupported(currentLanguage)) {
        try {
          const prettierResult = await formattingService.formatCode(currentCode, currentLanguage);
          newResults.prettier = prettierResult;
        } catch (error) {
          console.warn('Prettier 분석 실패:', error);
        }
      }

      setResults(newResults);

      addNotification({
        type: 'success',
        title: '오프라인 분석 완료',
        message: '로컬 분석이 성공적으로 완료되었습니다.'
      });

    } catch (error) {
      console.error('오프라인 분석 실패:', error);
      addNotification({
        type: 'error',
        title: '분석 실패',
        message: '오프라인 분석 중 오류가 발생했습니다.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentCode, currentLanguage, offlineService, formattingService, addNotification]);

  // 코드 포맷팅
  const handleFormat = useCallback(async () => {
    if (!formattingService.isLanguageSupported(currentLanguage)) {
      addNotification({
        type: 'warning',
        title: '포맷팅 불가',
        message: `${currentLanguage}은(는) Prettier에서 지원되지 않습니다.`
      });
      return;
    }

    try {
      const result = await formattingService.formatCode(currentCode, currentLanguage);
      
      if (result.changed) {
        setCode(result.formatted);
        addNotification({
          type: 'success',
          title: '포맷팅 완료',
          message: '코드가 성공적으로 포맷팅되었습니다.'
        });
      } else {
        addNotification({
          type: 'info',
          title: '포맷팅 불필요',
          message: '코드가 이미 올바른 형식입니다.'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: '포맷팅 실패',
        message: '코드 포맷팅 중 오류가 발생했습니다.'
      });
    }
  }, [currentCode, currentLanguage, formattingService, setCode, addNotification]);

  // 샘플 코드 로드
  const loadSampleCode = useCallback(() => {
    const sampleCodes: Record<SupportedLanguage, string> = {
      javascript: `// JavaScript 샘플 - 보안 취약점과 복잡도 문제가 포함됨
var password = "admin123"; // 하드코딩된 패스워드
var userId = getUserId();

function processUser(userId) {
  if (userId == null) {
    console.log("사용자 없음");
    return false;
  }
  
  if (userId == "admin") {
    return true;
  } else if (userId == "user") {
    return checkPermissions();
  } else if (userId == "guest") {
    return false;
  } else {
    for (var i = 0; i < 10; i++) {
      if (i == 5) {
        if (checkSpecialCase()) {
          return true;
        }
      }
    }
  }
  
  eval("processSpecial" + userId + "()"); // 위험한 eval 사용
  return false;
}`,

      typescript: `// TypeScript 샘플
interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // 패스워드가 선택적이지만 위험할 수 있음
}

const API_KEY = "sk-1234567890abcdef"; // 하드코딩된 API 키

function createUser(data: any): User { // any 타입 사용
  let user = {} as User; // 타입 단언
  
  if(data.id==undefined||data.name==undefined) { // 포맷팅과 비교 연산자 문제
    throw new Error("필수 필드 누락");
  }
  
  user.id=data.id;
  user.name=data.name;
  user.email=data.email;
  
  // 복잡한 조건문
  if (data.role === "admin") {
    if (data.permissions) {
      if (data.permissions.includes("read")) {
        if (data.permissions.includes("write")) {
          if (data.permissions.includes("delete")) {
            console.log("전체 권한 사용자");
          }
        }
      }
    }
  }
  
  return user;
}`,

      python: `# Python 샘플 - 보안 및 품질 문제 포함
import os

password = "secret123"  # 하드코딩된 패스워드

def process_data(user_input):
    # 위험한 exec 사용
    exec(f"result = {user_input}")
    
    # 광범위한 예외 처리
    try:
        data = get_user_data()
    except:
        pass
    
    # 복잡한 중첩 조건
    if user_input:
        if len(user_input) > 0:
            if user_input.startswith("admin"):
                if check_admin_permissions():
                    if validate_admin_token():
                        if admin_action_allowed():
                            return process_admin_data()
    
    print("처리 완료")  # 프로덕션에서 print 사용
    return None`,

      java: `// Java 샘플
public class UserProcessor {
    private static final String SECRET_KEY = "mysecretkey123"; // 하드코딩
    
    public boolean processUser(String userId) {
        System.out.println("Processing: " + userId); // 프로덕션에서 System.out 사용
        
        // 복잡한 조건문
        if (userId != null) {
            if (userId.equals("admin")) {
                if (checkAdminPrivileges()) {
                    if (validateSession()) {
                        if (hasPermission("read")) {
                            if (hasPermission("write")) {
                                return true;
                            }
                        }
                    }
                }
            } else if (userId.equals("user")) {
                return checkUserAccess();
            } else if (userId.equals("guest")) {
                return false;
            }
        }
        
        return false;
    }
}`,

      cpp: `// C++ 샘플 코드
#include <iostream>
#include <string>

class UserManager {
private:
    std::string secret = "hardcoded123"; // 하드코딩된 비밀
    
public:
    bool processUser(const std::string& userId) {
        std::cout << "Processing: " << userId << std::endl; // 디버깅 출력
        
        if (userId.empty()) {
            return false;
        }
        
        // 복잡한 중첩 조건
        if (userId == "admin") {
            if (checkPermissions()) {
                if (validateToken()) {
                    return true;
                }
            }
        }
        
        return false;
    }
};`,

      csharp: `// C# 샘플 코드
using System;

public class UserProcessor
{
    private const string ApiKey = "secret_key_123"; // 하드코딩된 키
    
    public bool ProcessUser(string userId)
    {
        Console.WriteLine($"Processing: {userId}"); // 콘솔 출력
        
        if (string.IsNullOrEmpty(userId))
        {
            return false;
        }
        
        // 복잡한 조건문
        if (userId.Equals("admin"))
        {
            if (CheckAdminRights())
            {
                if (ValidateSession())
                {
                    return true;
                }
            }
        }
        
        return false;
    }
}`,

      go: `// Go 샘플 코드
package main

import (
    "fmt"
    "strings"
)

const secretKey = "hardcoded_secret" // 하드코딩된 비밀키

func processUser(userID string) bool {
    fmt.Println("Processing:", userID) // 디버그 출력
    
    if userID == "" {
        return false
    }
    
    // 복잡한 중첩 조건
    if strings.EqualFold(userID, "admin") {
        if checkPermissions() {
            if validateToken() {
                return true
            }
        }
    }
    
    return false
}

func main() {
    processUser("admin")
}`,

      rust: `// Rust 샘플 코드
const SECRET: &str = "hardcoded_secret"; // 하드코딩된 상수

struct UserProcessor;

impl UserProcessor {
    fn process_user(&self, user_id: &str) -> bool {
        println!("Processing: {}", user_id); // 디버그 출력
        
        if user_id.is_empty() {
            return false;
        }
        
        // 복잡한 조건문
        match user_id {
            "admin" => {
                if self.check_permissions() {
                    if self.validate_token() {
                        return true;
                    }
                }
                false
            }
            _ => false,
        }
    }
    
    fn check_permissions(&self) -> bool { true }
    fn validate_token(&self) -> bool { true }
}`,

      php: `<?php
// PHP 샘플 코드
class UserProcessor {
    private $secret = 'hardcoded123'; // 하드코딩된 비밀
    
    public function processUser($userId) {
        echo "Processing: " . $userId . PHP_EOL; // 디버그 출력
        
        if (empty($userId)) {
            return false;
        }
        
        // 복잡한 조건문
        if ($userId == 'admin') { // 느슨한 비교
            if ($this->checkPermissions()) {
                if ($this->validateToken()) {
                    return true;
                }
            }
        }
        
        return false;
    }
}
?>`,

      ruby: `# Ruby 샘플 코드
class UserProcessor
  SECRET = 'hardcoded_secret' # 하드코딩된 상수
  
  def process_user(user_id)
    puts "Processing: #{user_id}" # 디버그 출력
    
    return false if user_id.nil? || user_id.empty?
    
    # 복잡한 조건문
    if user_id == 'admin'
      if check_permissions?
        if validate_token?
          return true
        end
      end
    end
    
    false
  end
  
  private
  
  def check_permissions?
    true
  end
  
  def validate_token?
    true
  end
end`,

      swift: `// Swift 샘플 코드
import Foundation

class UserProcessor {
    private let secret = "hardcoded123" // 하드코딩된 비밀
    
    func processUser(_ userId: String) -> Bool {
        print("Processing: \\(userId)") // 디버그 출력
        
        guard !userId.isEmpty else {
            return false
        }
        
        // 복잡한 조건문
        if userId == "admin" {
            if checkPermissions() {
                if validateToken() {
                    return true
                }
            }
        }
        
        return false
    }
    
    private func checkPermissions() -> Bool { return true }
    private func validateToken() -> Bool { return true }
}`,

      kotlin: `// Kotlin 샘플 코드
class UserProcessor {
    companion object {
        private const val SECRET = "hardcoded123" // 하드코딩된 비밀
    }
    
    fun processUser(userId: String?): Boolean {
        println("Processing: $userId") // 디버그 출력
        
        if (userId.isNullOrEmpty()) {
            return false
        }
        
        // 복잡한 조건문
        return when (userId) {
            "admin" -> {
                if (checkPermissions()) {
                    if (validateToken()) {
                        true
                    } else false
                } else false
            }
            else -> false
        }
    }
    
    private fun checkPermissions(): Boolean = true
    private fun validateToken(): Boolean = true
}`
    };

    const code = sampleCodes[currentLanguage] || sampleCodes.javascript;
    setCode(code);
    
    addNotification({
      type: 'info',
      title: '샘플 코드 로드됨',
      message: `${currentLanguage} 샘플 코드가 로드되었습니다.`
    });
  }, [currentLanguage, setCode, addNotification]);

  const totalIssues = (results.eslint?.length || 0) + (results.security?.issues.length || 0);

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
                📱 오프라인 코드 분석
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded-full">
                오프라인 모드
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                무제한 사용
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* 설명 섹션 */}
        <div className="card p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">🔧</div>
            <div>
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                오프라인 코드 분석 도구
              </h2>
              <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                인터넷 연결 없이도 사용할 수 있는 로컬 코드 분석 도구입니다. 
                ESLint 규칙, 복잡도 분석, 보안 패턴 검사, Prettier 포맷팅을 제공합니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                  ✅ ESLint 검사
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                  📊 복잡도 분석
                </span>
                <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full">
                  🛡️ 보안 검사
                </span>
                <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded-full">
                  ✨ 코드 포맷팅
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
          {/* 코드 에디터 영역 */}
          <div className="card p-0 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* 컨트롤 패널 */}
              <div className="bg-secondary-50 dark:bg-secondary-800 p-4 border-b border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className={`btn-primary px-6 py-2 rounded-lg ${
                        isAnalyzing ? 'cursor-not-allowed opacity-50' : ''
                      }`}
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
                          <span>오프라인 분석</span>
                        </span>
                      )}
                    </button>

                    <button
                      onClick={handleFormat}
                      disabled={isAnalyzing}
                      className="btn-secondary px-4 py-2 rounded-lg"
                    >
                      ✨ 포맷팅
                    </button>

                    <button
                      onClick={loadSampleCode}
                      disabled={isAnalyzing}
                      className="btn-secondary px-4 py-2 rounded-lg"
                    >
                      📄 샘플 로드
                    </button>
                  </div>

                  {totalIssues > 0 && (
                    <span className="text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full">
                      {totalIssues}개 이슈 발견
                    </span>
                  )}
                </div>

                {/* AI 분석 안내 */}
                <div className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded">
                  💡 더 고급 분석을 원하시면 <Link to="/analyze" className="underline">AI 분석 페이지</Link>에서 
                  Google Gemini API를 사용해보세요!
                </div>
              </div>

              {/* 코드 에디터 */}
              <div className="flex-1">
                <CodeEditor
                  value={currentCode}
                  language={currentLanguage}
                  onChange={handleCodeChange}
                  onLanguageChange={handleLanguageChange}
                  height={500}
                />
              </div>
            </div>
          </div>

          {/* 분석 결과 영역 */}
          <div className="card overflow-hidden">
            <OfflineAnalysisResults
              results={results}
              isAnalyzing={isAnalyzing}
              language={currentLanguage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 오프라인 분석 결과 컴포넌트
const OfflineAnalysisResults: React.FC<{
  results: any;
  isAnalyzing: boolean;
  language: SupportedLanguage;
}> = ({ results, isAnalyzing, language: _language }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'eslint' | 'complexity' | 'security' | 'prettier'>('overview');

  if (isAnalyzing) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400">오프라인 분석 중...</p>
        </div>
      </div>
    );
  }

  const hasResults = Object.keys(results).length > 0;

  if (!hasResults) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔧</div>
          <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
            분석 준비 완료
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            코드를 입력하고 오프라인 분석을 시작해보세요.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'overview' as const, label: '개요', available: true },
    { key: 'eslint' as const, label: 'ESLint', available: !!results.eslint, count: results.eslint?.length },
    { key: 'complexity' as const, label: '복잡도', available: !!results.complexity },
    { key: 'security' as const, label: '보안', available: !!results.security, count: results.security?.issues.length },
    { key: 'prettier' as const, label: 'Prettier', available: !!results.prettier }
  ].filter(tab => tab.available);

  return (
    <div className="h-full flex flex-col">
      {/* 탭 헤더 */}
      <div className="border-b border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 p-2">
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 내용 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
              오프라인 분석 결과
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 card">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {results.eslint?.length || 0}
                </div>
                <div className="text-sm text-secondary-600 dark:text-secondary-400">ESLint 이슈</div>
              </div>
              
              <div className="text-center p-4 card">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {results.security?.issues.length || 0}
                </div>
                <div className="text-sm text-secondary-600 dark:text-secondary-400">보안 이슈</div>
              </div>
            </div>

            {results.complexity && (
              <div className="card p-4">
                <h4 className="font-semibold text-secondary-900 dark:text-white mb-2">
                  복잡도 정보
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className={`text-xl font-bold ${
                      results.complexity.cyclomatic <= 10 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {results.complexity.cyclomatic}
                    </div>
                    <div className="text-xs text-secondary-600 dark:text-secondary-400">순환 복잡도</div>
                  </div>
                  <div>
                    <div className={`text-xl font-bold ${
                      results.complexity.cognitive <= 15 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {results.complexity.cognitive}
                    </div>
                    <div className="text-xs text-secondary-600 dark:text-secondary-400">인지 복잡도</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-600">
                      {results.complexity.lines}
                    </div>
                    <div className="text-xs text-secondary-600 dark:text-secondary-400">총 줄 수</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 다른 탭들은 AnalysisResults 컴포넌트와 유사하게 구현 */}
        {activeTab === 'eslint' && results.eslint && (
          <div className="space-y-3">
            {results.eslint.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-secondary-600 dark:text-secondary-400">
                  ESLint 이슈가 발견되지 않았습니다!
                </p>
              </div>
            ) : (
              results.eslint.map((issue: ESLintResult, index: number) => (
                <div key={index} className="card p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      issue.severity === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-mono text-secondary-600 dark:text-secondary-400">
                          줄 {issue.line}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          issue.severity === 'error' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-secondary-700 dark:text-secondary-300 mb-2">
                        {issue.message}
                      </p>
                      <code className="text-xs bg-secondary-100 dark:bg-secondary-800 p-2 rounded block">
                        {issue.source}
                      </code>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 기타 탭 내용들 */}
      </div>
    </div>
  );
};

export default OfflinePage;