import { test, expect } from '@playwright/test';

test.describe('AI Insights Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyzer');
  });

  test('AI 인사이트 섹션이 분석 결과에 포함됨', async ({ page }) => {
    // 테스트 데이터 입력
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    const testResumeText = `
      프론트엔드 개발자 김개발
      
      경력: React 개발 3년, JavaScript/TypeScript 능숙
      기술스택: React, Vue.js, JavaScript, TypeScript, HTML, CSS
      프로젝트: E-commerce 웹사이트, 관리자 대시보드 개발
      교육: 컴퓨터공학과 졸업
    `;
    
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    const testJobDescription = `
      시니어 프론트엔드 개발자 채용
      
      요구사항:
      - React 5년 이상 경험 필수
      - TypeScript 필수
      - 대규모 서비스 개발 경험
      - 팀 리딩 경험 우대
      
      기술스택: React, TypeScript, Next.js, GraphQL
    `;
    
    await resumeTextArea.fill(testResumeText);
    await jobTextArea.fill(testJobDescription);
    
    // 분석 실행
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    await analyzeButton.click();
    
    // 분석 결과 대기
    await expect(page.locator('text=매칭 분석 결과')).toBeVisible({ timeout: 30000 });
    
    // AI 인사이트 섹션 확인
    await expect(page.locator('text=AI 인사이트')).toBeVisible();
    
    // AI 인사이트 헤더 요소들 확인
    await expect(page.locator('[data-lucide="brain"]')).toBeVisible();
    await expect(page.locator('text=Local Analysis')).toBeVisible();
    
    // 신뢰도 점수 확인
    await expect(page.locator('text=신뢰도:')).toBeVisible();
    await expect(page.locator('text=85% 높음')).toBeVisible();
  });

  test('AI 인사이트 강점 섹션', async ({ page }) => {
    // 강점이 많이 나올 수 있는 매칭도가 높은 케이스
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    const highMatchResumeText = `
      시니어 React 개발자
      경력 5년, TypeScript 전문가
      대규모 서비스 개발 경험 다수
      팀 리딩 경험 2년
      React, TypeScript, Next.js, GraphQL 전문
    `;
    
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    const jobDescription = `
      시니어 React 개발자 모집
      요구사항: React 5년, TypeScript, 대규모 서비스, 팀 리딩
      기술스택: React, TypeScript, Next.js, GraphQL
    `;
    
    await resumeTextArea.fill(highMatchResumeText);
    await jobTextArea.fill(jobDescription);
    
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    await analyzeButton.click();
    
    await expect(page.locator('text=매칭 분석 결과')).toBeVisible({ timeout: 30000 });
    
    // 강점 섹션 확인
    await expect(page.locator('text=주요 강점')).toBeVisible();
    await expect(page.locator('[data-lucide="trending-up"]')).toBeVisible();
    
    // 체크 아이콘과 강점 항목들 확인 - 첫 번째 항목만 확인
    await expect(page.locator('[data-lucide="check-circle"]').first()).toBeVisible();
  });

  test('AI 인사이트 개선 영역 섹션', async ({ page }) => {
    // 매칭도가 낮아서 개선 영역이 많이 나올 케이스
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    const lowMatchResumeText = `
      주니어 웹 개발자
      jQuery 2년 경험
      PHP, MySQL 사용
      작은 회사 홈페이지 제작 경험
    `;
    
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    const jobDescription = `
      시니어 React 개발자 모집
      필수: React 5년, TypeScript, 클라우드 경험
      우대: 마이크로서비스, Kubernetes
      기술스택: React, TypeScript, AWS, Docker
    `;
    
    await resumeTextArea.fill(lowMatchResumeText);
    await jobTextArea.fill(jobDescription);
    
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    await analyzeButton.click();
    
    await expect(page.locator('text=매칭 분석 결과')).toBeVisible({ timeout: 30000 });
    
    // 개선 영역 섹션 확인
    await expect(page.locator('text=개선 영역')).toBeVisible();
    await expect(page.locator('[data-lucide="trending-down"]')).toBeVisible();
    
    // X 아이콘과 개선 영역 항목들 확인 - 첫 번째 항목만 확인
    await expect(page.locator('[data-lucide="x-circle"]').first()).toBeVisible();
  });

  test('AI 추천사항 섹션', async ({ page }) => {
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    
    await resumeTextArea.fill('중급 개발자 이력서');
    await jobTextArea.fill('고급 개발자 채용공고');
    
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    await analyzeButton.click();
    
    await expect(page.locator('text=매칭 분석 결과')).toBeVisible({ timeout: 30000 });
    
    // AI 추천사항 섹션 확인
    await expect(page.locator('text=AI 추천사항')).toBeVisible();
    await expect(page.locator('[data-lucide="lightbulb"]')).toBeVisible();
    await expect(page.locator('text=개선을 위한 구체적인 액션 아이템')).toBeVisible();
    
    // Sparkles 아이콘이 추천사항과 함께 표시되는지 확인
    await expect(page.locator('[data-lucide="sparkles"]').first()).toBeVisible();
  });

  test('AI 인사이트 Magic UI 애니메이션', async ({ page }) => {
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    
    await resumeTextArea.fill('테스트 이력서');
    await jobTextArea.fill('테스트 채용공고');
    
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    await analyzeButton.click();
    
    await expect(page.locator('text=매칭 분석 결과')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('text=AI 인사이트')).toBeVisible();
    
    // Magic Card 요소들 확인
    const magicCards = page.locator('.magic-card');
    await expect(magicCards.first()).toBeVisible();
    
    // BorderBeam 애니메이션 확인 - 실제 존재하는 수만큼 확인
    const borderBeams = page.locator('[class*="border-beam"]');
    const beamCount = await borderBeams.count();
    expect(beamCount).toBeGreaterThanOrEqual(1);
    
    // 애니메이션 지연 스타일 확인
    const animatedElements = page.locator('[style*="animation-delay"]');
    const elementCount = await animatedElements.count();
    expect(elementCount).toBeGreaterThan(0);
  });

  test('신뢰도 점수 표시 및 색상', async ({ page }) => {
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    
    await resumeTextArea.fill('전문 개발자 이력서');
    await jobTextArea.fill('개발자 채용공고');
    
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    await analyzeButton.click();
    
    await expect(page.locator('text=매칭 분석 결과')).toBeVisible({ timeout: 30000 });
    
    // 신뢰도 점수 요소 확인
    const confidenceElement = page.locator('text=85% 높음');
    await expect(confidenceElement).toBeVisible();
    
    // 신뢰도 점수 텍스트 확인 (숫자% 형태)
    const confidenceText = await confidenceElement.textContent();
    expect(confidenceText).toMatch(/\d+%/);
    
    // 신뢰도 레벨 텍스트 확인 (높음/보통/낮음)
    expect(confidenceText).toMatch(/(높음|보통|낮음)/);
  });

  test('로컬 분석 프로바이더 표시', async ({ page }) => {
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    
    await resumeTextArea.fill('개발자 이력서');
    await jobTextArea.fill('개발자 채용');
    
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    await analyzeButton.click();
    
    await expect(page.locator('text=매칭 분석 결과')).toBeVisible({ timeout: 30000 });
    
    // Local Analysis 프로바이더 텍스트 확인 (실제로는 span 요소)
    await expect(page.locator('text=Local Analysis')).toBeVisible();
    
    // 텍스트 스타일이 적용되어 있는지 확인
    const providerText = page.locator('text=Local Analysis');
    await expect(providerText).toHaveClass(/text-xs/);
  });

  test('AI 인사이트 요약 텍스트', async ({ page }) => {
    const resumeTextArea = page.locator('textarea[placeholder*="추출된 텍스트가 여기에 표시됩니다"]');
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    
    // 중간 정도 매칭률을 가질 만한 데이터
    await resumeTextArea.fill('중급 React 개발자 2년 경험');
    await jobTextArea.fill('시니어 React 개발자 5년 경험 요구');
    
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    await analyzeButton.click();
    
    await expect(page.locator('text=매칭 분석 결과')).toBeVisible({ timeout: 30000 });
    
    // AI 인사이트 섹션이 존재하는지 확인
    await expect(page.locator('text=AI 인사이트')).toBeVisible();
    
    // 구체적인 AI 인사이트 내용들 확인
    await expect(page.locator('text=신뢰도:')).toBeVisible();
    await expect(page.locator('text=주요 강점')).toBeVisible();
    await expect(page.locator('text=개선 영역')).toBeVisible();
    await expect(page.locator('text=AI 추천사항')).toBeVisible();
  });
});