import { test, expect } from '@playwright/test';

test.describe('Job Input Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyzer');
  });

  test('채용공고 입력 카드가 올바르게 표시됨', async ({ page }) => {
    // 카드 헤더 확인 - heading 태그로 더 구체적으로 선택
    await expect(page.locator('h3:has-text("채용공고 내용")')).toBeVisible();
    
    // 설명 텍스트 확인
    await expect(page.locator('text=분석할 채용공고 내용을 입력하세요')).toBeVisible();
    
    // 텍스트 영역 확인
    const textArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    await expect(textArea).toBeVisible();
  });

  test('채용공고 내용 입력 기능', async ({ page }) => {
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    
    const testJobDescription = `
      프론트엔드 개발자 모집
      
      자격요건:
      - React 3년 이상 경험
      - JavaScript, TypeScript 능숙
      - 반응형 웹 개발 경험
      - Git 사용 능숙
      
      우대사항:
      - Node.js 경험
      - AWS 클라우드 경험
      - 애자일 개발 경험
      
      기술스택:
      React, JavaScript, TypeScript, HTML, CSS, Git
    `;
    
    await jobTextArea.fill(testJobDescription);
    await expect(jobTextArea).toHaveValue(testJobDescription);
  });

  test('실시간 텍스트 카운트 (길이 확인)', async ({ page }) => {
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    
    // 짧은 텍스트 입력
    await jobTextArea.fill('짧은 채용공고');
    expect((await jobTextArea.inputValue()).length).toBeGreaterThan(0);
    
    // 긴 텍스트 입력
    const longJobDescription = 'A'.repeat(1000);
    await jobTextArea.fill(longJobDescription);
    expect((await jobTextArea.inputValue()).length).toBe(1000);
  });

  test('텍스트 영역 크기 조절 기능', async ({ page }) => {
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    
    // 텍스트 영역이 resize 가능한지 확인
    const resizeStyle = await jobTextArea.evaluate(el => getComputedStyle(el).resize);
    expect(resizeStyle).toBe('vertical');
  });

  test('Magic UI 애니메이션 적용', async ({ page }) => {
    // 두 번째 MagicCard (채용공고 입력) 확인
    const magicCards = page.locator('.magic-card');
    await expect(magicCards.nth(1)).toBeVisible();
    
    // BorderBeam 애니메이션 (지연 시간 1초) 확인
    const borderBeams = page.locator('[class*="border-beam"]');
    await expect(borderBeams.nth(1)).toBeVisible();
    
    // 카드 호버 효과 테스트
    await magicCards.nth(1).hover();
    await expect(magicCards.nth(1)).toBeVisible();
  });

  test('채용공고 입력 후 버튼 상태 변경', async ({ page }) => {
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    const analyzeButton = page.locator('button:has-text("매칭 분석 시작")');
    
    // 초기 상태는 비활성화
    await expect(analyzeButton).toBeDisabled();
    
    // 채용공고만 입력했을 때도 여전히 비활성화 (이력서도 필요)
    await jobTextArea.fill('프론트엔드 개발자 채용');
    await expect(analyzeButton).toBeDisabled();
  });

  test('텍스트 포맷팅 및 특수문자 처리', async ({ page }) => {
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    
    // 특수문자가 포함된 텍스트
    const specialText = `
      채용공고 제목: React 개발자 (신입~3년차)
      
      급여: 3,000만원 ~ 5,000만원
      특수기호: @#$%^&*()
      HTML 태그: <div>test</div>
      JSON: {"position": "frontend", "experience": "3+"}
    `;
    
    await jobTextArea.fill(specialText);
    const inputValue = await jobTextArea.inputValue();
    
    // 특수문자가 올바르게 입력되었는지 확인
    expect(inputValue).toContain('3,000만원');
    expect(inputValue).toContain('@#$%^&*()');
    expect(inputValue).toContain('<div>test</div>');
    expect(inputValue).toContain('{"position": "frontend", "experience": "3+"}');
  });

  test('줄바꿈 및 공백 처리', async ({ page }) => {
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    
    // 여러 줄바꿈이 있는 텍스트
    const multilineText = `라인 1

라인 3 (빈 줄 후)

    들여쓰기가 있는 라인
끝`;
    
    await jobTextArea.fill(multilineText);
    const inputValue = await jobTextArea.inputValue();
    
    // 줄바꿈이 보존되는지 확인
    expect(inputValue).toContain('\n\n');
    expect(inputValue).toContain('    들여쓰기');
  });

  test('한글 입력 처리', async ({ page }) => {
    const jobTextArea = page.locator('textarea[placeholder*="채용공고 내용을 입력하세요"]');
    
    // 한글 텍스트
    const koreanText = `
      안녕하세요. 저희 회사에서는 다음과 같은 인재를 찾고 있습니다.
      
      필수사항:
      • React 개발 경험 3년 이상
      • 팀워크가 좋은 분
      • 성장 의욕이 있는 분
    `;
    
    await jobTextArea.fill(koreanText);
    const inputValue = await jobTextArea.inputValue();
    
    // 한글이 올바르게 입력되었는지 확인
    expect(inputValue).toContain('안녕하세요');
    expect(inputValue).toContain('필수사항');
    expect(inputValue).toContain('•');
  });
});