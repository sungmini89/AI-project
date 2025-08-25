import { test, expect } from '@playwright/test';

test.describe('Analysis Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyzer');
  });

  test('완전한 분석 플로우 - 로컬 분석', async ({ page }) => {
    // 1. 이력서 텍스트 입력
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    const testResumeText = `
      김개발 이력서
      
      경력사항:
      - React 개발 3년 경험
      - JavaScript, TypeScript 능숙
      - Node.js 백엔드 개발 2년
      - RESTful API 설계 및 개발
      
      학력:
      - 컴퓨터공학과 졸업 (2020년)
      
      기술스택:
      React, JavaScript, TypeScript, Node.js, Express, MongoDB, Git, AWS
      
      프로젝트:
      - 전자상거래 웹사이트 개발 (React, Node.js)
      - 실시간 채팅 애플리케이션 (Socket.io)
      - 반응형 웹 디자인 적용
    `;
    
    await resumeTextArea.fill(testResumeText);
    
    // 2. 채용공고 내용 입력
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    const testJobDescription = `
      프론트엔드 개발자 모집
      
      업무내용:
      - React 기반 웹 애플리케이션 개발
      - 반응형 UI/UX 구현
      - API 연동 및 데이터 처리
      - 코드 리뷰 및 팀 협업
      
      자격요건:
      - React 2년 이상 경험
      - JavaScript, TypeScript 능숙
      - HTML, CSS 능숙
      - Git 사용 경험
      
      우대사항:
      - Node.js 백엔드 개발 경험
      - AWS 클라우드 경험
      - 전자상거래 도메인 경험
      
      기술스택:
      React, JavaScript, TypeScript, HTML, CSS, Git, Node.js, AWS
    `;
    
    await jobTextArea.fill(testJobDescription);
    
    // 3. 분석 버튼이 활성화되었는지 확인
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    await expect(analyzeButton).toBeEnabled();
    
    // 4. 분석 버튼이 활성화되었는지 확인
    await expect(analyzeButton).toBeEnabled();
    
    // 5. 분석 시작
    await analyzeButton.click();
    
    // 6. 로딩 상태 확인
    await expect(page.locator('text=분석 중...')).toBeVisible();
    
    // 7. 분석 결과 대기 (최대 30초)
    await expect(page.locator('text=매칭 분석 결과')).toBeVisible({ timeout: 30000 });
    
    // 8. 결과 카드가 표시되는지 확인
    const resultCard = page.locator('[class*="rounded-xl"][class*="bg-gradient-to-br"]').last();
    await expect(resultCard).toBeVisible();
    
    // 9. 점수 확인 (0-100% 사이)
    const overallScore = page.locator('text=/전체 매칭 점수: \\d+%/');
    await expect(overallScore).toBeVisible();
    
    // 10. SVG 원형 진행률 바 확인
    const progressBars = page.locator('svg circle');
    await expect(progressBars.first()).toBeVisible();
    
    // 11. 세부 점수들 확인
    await expect(page.locator('p:has-text("키워드 매칭")')).toBeVisible();
    await expect(page.locator('p:has-text("스킬 매칭")')).toBeVisible();
    await expect(page.locator('p:has-text("ATS 호환성")')).toBeVisible();
    
    // 12. 매칭된 키워드 섹션 확인
    await expect(page.locator('text=매칭된 키워드')).toBeVisible();
    
    // 13. 개선 제안 섹션 확인
    await expect(page.locator('text=개선 제안')).toBeVisible();
  });

  test('입력 유효성 검사', async ({ page }) => {
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    
    // 초기에는 비활성화
    await expect(analyzeButton).toBeDisabled();
    
    // 이력서만 입력했을 때 알림 확인
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    await resumeTextArea.fill('테스트 이력서');
    
    // 여전히 비활성화
    await expect(analyzeButton).toBeDisabled();
    
    // 채용공고도 입력
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    await jobTextArea.fill('테스트 채용공고');
    
    // 이제 활성화
    await expect(analyzeButton).toBeEnabled();
  });

  test('빈 텍스트 입력 시 경고 메시지', async ({ page }) => {
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    
    // 공백만 있는 텍스트 입력
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    await resumeTextArea.fill('   ');
    
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    await jobTextArea.fill('   ');
    
    // 버튼이 여전히 비활성화되어야 함
    await expect(analyzeButton).toBeDisabled();
  });

  test('Magic UI 결과 애니메이션', async ({ page }) => {
    // 테스트 데이터 입력
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    await resumeTextArea.fill('React 개발자 3년 경험');
    
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    await jobTextArea.fill('React 개발자 모집');
    
    // 분석 실행
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    await analyzeButton.click();
    
    // 결과가 나타나면 Magic UI 요소들 확인
    await expect(page.locator('text=매칭 분석 결과')).toBeVisible({ timeout: 30000 });
    
    // 결과 카드의 MagicCard 래퍼 확인
    const resultMagicCard = page.locator('.magic-card').last();
    await expect(resultMagicCard).toBeVisible();
    
    // BorderBeam 애니메이션 확인 (지연 시간 2초)
    const resultBorderBeam = page.locator('[class*="border-beam"]').last();
    await expect(resultBorderBeam).toBeVisible();
    
    // 애니메이션 지연 클래스 확인
    const animatedElements = page.locator('[style*="animation-delay"]');
    await expect(animatedElements.first()).toBeVisible();
  });

  test('결과 데이터 정확성', async ({ page }) => {
    // 매칭률이 높은 테스트 케이스
    const resumeText = 'React JavaScript TypeScript Node.js 개발자 5년 경험';
    const jobText = 'React JavaScript TypeScript 개발자 모집 Node.js 우대';
    
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    await resumeTextArea.fill(resumeText);
    
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    await jobTextArea.fill(jobText);
    
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    await analyzeButton.click();
    
    // 결과 대기
    await expect(page.locator('text=매칭 분석 결과')).toBeVisible({ timeout: 30000 });
    
    // 매칭된 키워드가 결과 영역에서 표시되는지 확인 (첫 번째 요소만 확인하여 strict mode 위반 방지)
    await expect(page.locator('text=React').first()).toBeVisible();
    await expect(page.locator('text=JavaScript').first()).toBeVisible();
    await expect(page.locator('text=TypeScript').first()).toBeVisible();
    
    // 점수가 0% 이상인지 확인 (첫 번째 매칭 요소만 확인)
    const scoreText = await page.locator('text=/전체 매칭.*\\d+%/').first().textContent();
    expect(scoreText).toBeTruthy();
    
    const scoreMatch = scoreText?.match(/(\d+)%/);
    if (scoreMatch) {
      const score = parseInt(scoreMatch[1]);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  test('오류 처리', async ({ page }) => {
    // 네트워크 요청을 가로채서 오류 시뮬레이션
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // 테스트 데이터 입력
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    await resumeTextArea.fill('테스트 이력서');
    
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    await jobTextArea.fill('테스트 채용공고');
    
    // 분석 실행
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    await analyzeButton.click();
    
    // 로컬 분석은 API 호출 없이 진행되므로 결과가 나와야 함
    await expect(page.locator('text=매칭 분석 결과')).toBeVisible({ timeout: 30000 });
  });
});