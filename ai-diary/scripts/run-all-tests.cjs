#!/usr/bin/env node

/**
 * 통합 테스트 실행 스크립트
 * 개발 서버를 시작하고 모든 테스트 스위트를 실행합니다.
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';

// 로그 설정
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',  // cyan
    success: '\x1b[32m', // green
    error: '\x1b[31m',   // red
    warning: '\x1b[33m', // yellow
    reset: '\x1b[0m'     // reset
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

// 프로세스 정리 함수
let devServer = null;
let testProcess = null;

const cleanup = () => {
  log('테스트 정리 중...', 'warning');
  
  if (testProcess) {
    testProcess.kill();
  }
  
  if (devServer) {
    devServer.kill();
  }
  
  process.exit();
};

// 시그널 핸들러 설정
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// 서버 상태 확인 함수
const checkServerHealth = async (url = 'http://localhost:3000', maxRetries = 30) => {
  const http = require('http');
  
  return new Promise((resolve) => {
    let retries = 0;
    
    const check = () => {
      const request = http.get(url, (res) => {
        if (res.statusCode === 200) {
          log('개발 서버가 준비되었습니다!', 'success');
          resolve(true);
        } else {
          retryCheck();
        }
      });
      
      request.on('error', () => {
        retryCheck();
      });
      
      request.setTimeout(2000, () => {
        request.abort();
        retryCheck();
      });
    };
    
    const retryCheck = () => {
      retries++;
      if (retries >= maxRetries) {
        log('개발 서버 시작 시간이 초과되었습니다.', 'error');
        resolve(false);
        return;
      }
      
      setTimeout(check, 1000);
    };
    
    check();
  });
};

// 테스트 실행 함수
const runTests = async () => {
  return new Promise((resolve) => {
    log('Playwright 테스트 시작...', 'info');
    
    const cmd = isWindows ? 'npx.cmd' : 'npx';
    const args = ['playwright', 'test', '--reporter=html'];
    
    testProcess = spawn(cmd, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        CI: 'true' // CI 모드로 실행
      }
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        log('모든 테스트가 성공적으로 완료되었습니다!', 'success');
        resolve(true);
      } else {
        log(`테스트가 실패했습니다. 종료 코드: ${code}`, 'error');
        resolve(false);
      }
    });
    
    testProcess.on('error', (error) => {
      log(`테스트 실행 오류: ${error.message}`, 'error');
      resolve(false);
    });
  });
};

// 메인 실행 함수
const main = async () => {
  try {
    log('AI 일기 앱 테스트 스위트 시작', 'info');
    log(`프로젝트 경로: ${projectRoot}`, 'info');
    
    // package.json 확인
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json 파일을 찾을 수 없습니다.');
    }
    
    // playwright.config.ts 확인
    const playwrightConfigPath = path.join(projectRoot, 'playwright.config.ts');
    if (!fs.existsSync(playwrightConfigPath)) {
      throw new Error('playwright.config.ts 파일을 찾을 수 없습니다.');
    }
    
    log('설정 파일 확인 완료', 'success');
    
    // 개발 서버 시작
    log('개발 서버 시작 중...', 'info');
    const cmd = isWindows ? 'npm.cmd' : 'npm';
    
    devServer = spawn(cmd, ['run', 'dev'], {
      cwd: projectRoot,
      stdio: 'pipe', // 출력 숨김
      env: {
        ...process.env,
        PORT: '3000'
      }
    });
    
    devServer.on('error', (error) => {
      log(`개발 서버 시작 실패: ${error.message}`, 'error');
      process.exit(1);
    });
    
    // 서버 준비 대기
    const serverReady = await checkServerHealth();
    if (!serverReady) {
      throw new Error('개발 서버를 시작할 수 없습니다.');
    }
    
    // 테스트 실행
    const testSuccess = await runTests();
    
    // 테스트 보고서 경로 출력
    const reportPath = path.join(projectRoot, 'playwright-report', 'index.html');
    if (fs.existsSync(reportPath)) {
      log(`테스트 보고서: file://${reportPath}`, 'info');
    }
    
    // 스크린샷 경로 출력
    const testResultsPath = path.join(projectRoot, 'test-results');
    if (fs.existsSync(testResultsPath)) {
      log(`테스트 결과: ${testResultsPath}`, 'info');
    }
    
    // 결과 요약
    if (testSuccess) {
      log('🎉 모든 테스트가 성공적으로 완료되었습니다!', 'success');
      log('📊 HTML 보고서를 확인하세요.', 'info');
      process.exit(0);
    } else {
      log('❌ 일부 테스트가 실패했습니다.', 'error');
      log('📋 자세한 내용은 보고서를 확인하세요.', 'warning');
      process.exit(1);
    }
    
  } catch (error) {
    log(`실행 오류: ${error.message}`, 'error');
    process.exit(1);
  }
};

// 도움말 출력
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
AI 일기 앱 테스트 스위트 실행기

사용법:
  node scripts/run-all-tests.js [옵션]

옵션:
  --help, -h     이 도움말을 표시합니다
  
기능:
  - 개발 서버 자동 시작
  - 서버 상태 확인
  - Playwright E2E 테스트 실행
  - 테스트 보고서 생성
  - 자동 정리 및 종료

테스트 범위:
  ✓ 홈페이지 기본 기능
  ✓ 일기 에디터 (Tiptap)
  ✓ 감정 분석 (한국어/영어)
  ✓ 데이터베이스 CRUD
  ✓ PWA 기능
  ✓ AI 서비스 통합
  ✓ 반응형 디자인
  ✓ 오류 처리

결과:
  - 테스트 보고서: playwright-report/index.html
  - 스크린샷: test-results/
  - 로그: 콘솔 출력
`);
  process.exit(0);
}

// 메인 실행
main();