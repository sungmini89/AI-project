#!/usr/bin/env node

/**
 * AI 일기 앱 헬스체크 스크립트
 * 개발 환경의 모든 구성 요소를 점검합니다.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');

// 색상 유틸리티
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const checkMark = `${colors.green}✓${colors.reset}`;
const crossMark = `${colors.red}✗${colors.reset}`;
const warningMark = `${colors.yellow}⚠${colors.reset}`;

// 검사 결과 저장
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

const addResult = (name, status, message = '') => {
  results.details.push({ name, status, message });
  if (status === 'pass') results.passed++;
  else if (status === 'fail') results.failed++;
  else if (status === 'warn') results.warnings++;
};

// 파일 존재 확인
const checkFile = (filePath, description, required = true) => {
  const fullPath = path.join(projectRoot, filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    log(`${checkMark} ${description}`, 'green');
    addResult(description, 'pass');
    return true;
  } else {
    const mark = required ? crossMark : warningMark;
    const status = required ? 'fail' : 'warn';
    log(`${mark} ${description} (${filePath})`, required ? 'red' : 'yellow');
    addResult(description, status, filePath);
    return false;
  }
};

// 패키지 의존성 확인
const checkDependencies = async () => {
  log('\n📦 의존성 확인', 'blue');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    
    // 핵심 의존성 확인
    const criticalDeps = [
      'react',
      'react-dom',
      'react-router-dom',
      '@tiptap/react',
      '@tiptap/starter-kit',
      'dexie',
      'sentiment',
      'chart.js',
      'react-chartjs-2',
      '@playwright/test'
    ];
    
    const installedDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    criticalDeps.forEach(dep => {
      if (installedDeps[dep]) {
        log(`${checkMark} ${dep} (${installedDeps[dep]})`, 'green');
        addResult(`Dependency: ${dep}`, 'pass', installedDeps[dep]);
      } else {
        log(`${crossMark} ${dep} - 누락됨`, 'red');
        addResult(`Dependency: ${dep}`, 'fail', 'Missing');
      }
    });
    
  } catch (error) {
    log(`${crossMark} package.json 읽기 실패: ${error.message}`, 'red');
    addResult('Package.json', 'fail', error.message);
  }
};

// Node.js 환경 확인
const checkNodeEnvironment = () => {
  log('\n🚀 Node.js 환경', 'blue');
  
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1));
  
  if (major >= 16) {
    log(`${checkMark} Node.js 버전: ${nodeVersion}`, 'green');
    addResult('Node.js Version', 'pass', nodeVersion);
  } else {
    log(`${warningMark} Node.js 버전: ${nodeVersion} (권장: v16+)`, 'yellow');
    addResult('Node.js Version', 'warn', `${nodeVersion} - Upgrade recommended`);
  }
  
  // npm 버전 확인
  return new Promise((resolve) => {
    exec('npm --version', (error, stdout) => {
      if (error) {
        log(`${crossMark} npm 버전 확인 실패`, 'red');
        addResult('npm Version', 'fail', error.message);
      } else {
        const npmVersion = stdout.trim();
        log(`${checkMark} npm 버전: ${npmVersion}`, 'green');
        addResult('npm Version', 'pass', npmVersion);
      }
      resolve();
    });
  });
};

// 프로젝트 구조 확인
const checkProjectStructure = () => {
  log('\n📁 프로젝트 구조', 'blue');
  
  const requiredFiles = [
    ['package.json', '프로젝트 설정 파일'],
    ['tsconfig.json', 'TypeScript 설정'],
    ['vite.config.ts', 'Vite 설정'],
    ['playwright.config.ts', 'Playwright 설정'],
    ['tailwind.config.js', 'Tailwind CSS 설정'],
    ['src/App.tsx', '메인 앱 컴포넌트'],
    ['src/main.tsx', '앱 진입점'],
    ['src/index.css', '전역 스타일'],
    ['public/manifest.json', 'PWA 매니페스트'],
    ['public/sw.js', '서비스 워커'],
  ];
  
  const optionalFiles = [
    ['src/components/debug/DebugTest.tsx', '기본 디버그 패널'],
    ['src/components/debug/ComprehensiveDebugPanel.tsx', '종합 디버그 패널'],
    ['tests/', '테스트 디렉토리'],
  ];
  
  requiredFiles.forEach(([file, desc]) => {
    checkFile(file, desc, true);
  });
  
  optionalFiles.forEach(([file, desc]) => {
    checkFile(file, desc, false);
  });
};

// 소스 코드 구조 확인
const checkSourceStructure = () => {
  log('\n🏗️ 소스 코드 구조', 'blue');
  
  const sourceDirectories = [
    ['src/components', '컴포넌트 디렉토리'],
    ['src/services', '서비스 디렉토리'],
    ['src/pages', '페이지 디렉토리'],
    ['src/hooks', '커스텀 훅 디렉토리'],
    ['src/constants', '상수 디렉토리'],
  ];
  
  sourceDirectories.forEach(([dir, desc]) => {
    const exists = fs.existsSync(path.join(projectRoot, dir));
    if (exists) {
      const files = fs.readdirSync(path.join(projectRoot, dir));
      log(`${checkMark} ${desc} (${files.length}개 파일)`, 'green');
      addResult(desc, 'pass', `${files.length} files`);
    } else {
      log(`${crossMark} ${desc}`, 'red');
      addResult(desc, 'fail', 'Directory missing');
    }
  });
};

// 핵심 서비스 파일 확인
const checkCoreServices = () => {
  log('\n⚙️ 핵심 서비스 파일', 'blue');
  
  const coreFiles = [
    ['src/services/databaseService.ts', 'IndexedDB 데이터베이스 서비스'],
    ['src/services/emotionAnalysisService.ts', '감정 분석 서비스'],
    ['src/services/freeAIService.ts', 'AI API 서비스'],
    ['src/components/editor/DiaryEditor.tsx', 'Tiptap 에디터 컴포넌트'],
    ['src/components/dashboard/EmotionChart.tsx', 'Chart.js 감정 차트'],
    ['src/components/dashboard/EmotionCalendar.tsx', '감정 캘린더 히트맵'],
  ];
  
  coreFiles.forEach(([file, desc]) => {
    checkFile(file, desc, true);
  });
};

// 테스트 파일 확인
const checkTestFiles = () => {
  log('\n🧪 테스트 파일', 'blue');
  
  const testFiles = [
    ['tests/homepage.spec.ts', '홈페이지 E2E 테스트'],
    ['tests/diary-editor.spec.ts', '일기 에디터 테스트'],
    ['tests/emotion-analysis.spec.ts', '감정 분석 테스트'],
    ['tests/database.spec.ts', '데이터베이스 테스트'],
    ['tests/pwa-features.spec.ts', 'PWA 기능 테스트'],
    ['tests/ai-services.spec.ts', 'AI 서비스 테스트'],
  ];
  
  testFiles.forEach(([file, desc]) => {
    checkFile(file, desc, false);
  });
};

// 빌드 시스템 확인
const checkBuildSystem = () => {
  log('\n🔧 빌드 시스템', 'blue');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    
    const requiredScripts = [
      'dev',
      'build', 
      'preview',
      'typecheck'
    ];
    
    requiredScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        log(`${checkMark} npm script: ${script}`, 'green');
        addResult(`Script: ${script}`, 'pass');
      } else {
        log(`${crossMark} npm script: ${script}`, 'red');
        addResult(`Script: ${script}`, 'fail');
      }
    });
    
  } catch (error) {
    log(`${crossMark} 빌드 스크립트 확인 실패`, 'red');
    addResult('Build Scripts', 'fail', error.message);
  }
};

// PWA 설정 확인
const checkPWAConfiguration = () => {
  log('\n📱 PWA 설정', 'blue');
  
  try {
    // 매니페스트 파일 확인
    const manifestPath = path.join(projectRoot, 'public', 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'icons'];
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length === 0) {
        log(`${checkMark} PWA 매니페스트 (모든 필수 필드 존재)`, 'green');
        addResult('PWA Manifest', 'pass');
        
        // 아이콘 확인
        if (manifest.icons && manifest.icons.length > 0) {
          log(`${checkMark} PWA 아이콘 (${manifest.icons.length}개)`, 'green');
          addResult('PWA Icons', 'pass', `${manifest.icons.length} icons`);
        }
      } else {
        log(`${warningMark} PWA 매니페스트 (누락: ${missingFields.join(', ')})`, 'yellow');
        addResult('PWA Manifest', 'warn', `Missing: ${missingFields.join(', ')}`);
      }
    }
    
    // 서비스 워커 확인
    checkFile('public/sw.js', '서비스 워커', false);
    
  } catch (error) {
    log(`${crossMark} PWA 설정 확인 실패: ${error.message}`, 'red');
    addResult('PWA Configuration', 'fail', error.message);
  }
};

// 브라우저 호환성 체크
const checkBrowserCompatibility = () => {
  log('\n🌐 브라우저 호환성', 'blue');
  
  // Playwright 설정에서 브라우저 확인
  try {
    if (fs.existsSync(path.join(projectRoot, 'playwright.config.ts'))) {
      log(`${checkMark} Playwright 다중 브라우저 테스트 설정됨`, 'green');
      addResult('Multi-browser Testing', 'pass');
    }
    
    // Browserslist 설정 확인
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    if (packageJson.browserslist) {
      log(`${checkMark} Browserslist 설정`, 'green');
      addResult('Browserslist', 'pass');
    } else {
      log(`${warningMark} Browserslist 설정 없음`, 'yellow');
      addResult('Browserslist', 'warn', 'Not configured');
    }
    
  } catch (error) {
    log(`${crossMark} 브라우저 호환성 확인 실패`, 'red');
    addResult('Browser Compatibility', 'fail', error.message);
  }
};

// 환경 변수 확인
const checkEnvironmentVariables = () => {
  log('\n🔐 환경 변수', 'blue');
  
  const envFiles = ['.env', '.env.local', '.env.development'];
  const hasEnvFile = envFiles.some(file => fs.existsSync(path.join(projectRoot, file)));
  
  if (hasEnvFile) {
    log(`${checkMark} 환경 변수 파일 존재`, 'green');
    addResult('Environment Files', 'pass');
  } else {
    log(`${warningMark} 환경 변수 파일 없음`, 'yellow');
    addResult('Environment Files', 'warn', 'No .env files found');
  }
  
  // 중요한 환경 변수들 확인 (실제 값은 표시하지 않음)
  const importantEnvVars = [
    'VITE_ENABLE_KOREAN_ANALYSIS',
    'VITE_API_KEY',
    'VITE_SERVICE_MODE'
  ];
  
  importantEnvVars.forEach(envVar => {
    const exists = process.env[envVar] !== undefined;
    const mark = exists ? checkMark : warningMark;
    const color = exists ? 'green' : 'yellow';
    log(`${mark} ${envVar} ${exists ? '설정됨' : '설정 안됨'}`, color);
    addResult(`Env: ${envVar}`, exists ? 'pass' : 'warn');
  });
};

// 성능 설정 확인
const checkPerformanceSettings = () => {
  log('\n⚡ 성능 설정', 'blue');
  
  try {
    // Vite 설정 확인
    if (fs.existsSync(path.join(projectRoot, 'vite.config.ts'))) {
      log(`${checkMark} Vite 번들러 설정`, 'green');
      addResult('Vite Configuration', 'pass');
    }
    
    // PWA 플러그인 확인
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    const hasPWAPlugin = packageJson.devDependencies && packageJson.devDependencies['vite-plugin-pwa'];
    
    if (hasPWAPlugin) {
      log(`${checkMark} PWA 플러그인 설정`, 'green');
      addResult('PWA Plugin', 'pass');
    } else {
      log(`${warningMark} PWA 플러그인 없음`, 'yellow');
      addResult('PWA Plugin', 'warn');
    }
    
  } catch (error) {
    log(`${crossMark} 성능 설정 확인 실패`, 'red');
    addResult('Performance Settings', 'fail', error.message);
  }
};

// 최종 보고서 출력
const printSummary = () => {
  log('\n📊 헬스체크 요약', 'bold');
  log('─'.repeat(50), 'blue');
  
  log(`${colors.green}✓ 통과: ${results.passed}${colors.reset}`);
  log(`${colors.yellow}⚠ 경고: ${results.warnings}${colors.reset}`);
  log(`${colors.red}✗ 실패: ${results.failed}${colors.reset}`);
  
  const total = results.passed + results.warnings + results.failed;
  const score = ((results.passed + results.warnings * 0.5) / total * 100).toFixed(1);
  
  log(`\n전체 점수: ${score}% (${total}개 항목 중)`, 'bold');
  
  if (results.failed > 0) {
    log('\n🚨 실패한 항목들:', 'red');
    results.details
      .filter(item => item.status === 'fail')
      .forEach(item => {
        log(`  • ${item.name}${item.message ? ` - ${item.message}` : ''}`, 'red');
      });
  }
  
  if (results.warnings > 0) {
    log('\n⚠️ 경고 항목들:', 'yellow');
    results.details
      .filter(item => item.status === 'warn')
      .forEach(item => {
        log(`  • ${item.name}${item.message ? ` - ${item.message}` : ''}`, 'yellow');
      });
  }
  
  log('\n✨ 권장사항:', 'blue');
  log('  • 모든 테스트를 실행하여 기능을 검증하세요');
  log('  • 종합 디버그 패널을 사용하여 실시간 상태를 확인하세요');
  log('  • PWA 기능이 올바르게 작동하는지 확인하세요');
  log('  • 다양한 브라우저에서 테스트하세요');
  
  return results.failed === 0;
};

// 메인 실행 함수
const main = async () => {
  log(`${colors.bold}🔍 AI 일기 앱 헬스체크${colors.reset}`, 'blue');
  log(`프로젝트 경로: ${projectRoot}`, 'blue');
  log('─'.repeat(50), 'blue');
  
  await checkNodeEnvironment();
  checkProjectStructure();
  checkSourceStructure();
  checkCoreServices();
  await checkDependencies();
  checkTestFiles();
  checkBuildSystem();
  checkPWAConfiguration();
  checkBrowserCompatibility();
  checkEnvironmentVariables();
  checkPerformanceSettings();
  
  const success = printSummary();
  
  process.exit(success ? 0 : 1);
};

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    console.error(`실행 오류: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main, results };