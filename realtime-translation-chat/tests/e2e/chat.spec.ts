import { test, expect } from '@playwright/test'

test.describe('Chat Interface', () => {
  // Mock auth state로 테스트 (실제 Firebase 인증 없이)
  test.beforeEach(async ({ page }) => {
    // localStorage에 mock user 데이터 설정
    await page.addInitScript(() => {
      const mockUser = {
        uid: 'test-user-id',
        displayName: '테스트 사용자',
        email: 'test@example.com',
        preferredLanguage: 'ko'
      }
      localStorage.setItem('chatUser', JSON.stringify(mockUser))
    })
    
    await page.goto('/')
  })

  test('채팅방 목록 표시', async ({ page }) => {
    // 채팅방이 없을 때의 기본 상태
    await expect(page.getByText('참여 중인 방이 없습니다')).toBeVisible()
    await expect(page.getByText('첫 방 만들기')).toBeVisible()
  })

  test('새 방 만들기 기능', async ({ page }) => {
    // 새 방 만들기 버튼 클릭
    await page.getByText('새 방 만들기').first().click()
    
    // 프롬프트가 나타나는지 확인 (브라우저 alert는 자동으로 처리)
    // 실제 구현에서는 modal이나 form으로 대체해야 함
  })

  test('메시지 입력 인터페이스', async ({ page }) => {
    // 메시지 입력 영역이 있는지 확인
    await expect(page.getByPlaceholder('메시지를 입력하세요...')).toBeVisible()
    await expect(page.getByRole('button').filter({ hasText: '번역 언어' })).toBeVisible()
  })

  test('번역 언어 선택', async ({ page }) => {
    // 번역 언어 선택 버튼 클릭
    await page.getByRole('button').filter({ hasText: '번역 언어' }).click()
    
    // 언어 선택 드롭다운 표시 확인
    await expect(page.getByText('번역할 언어 선택:')).toBeVisible()
    await expect(page.getByText('English')).toBeVisible()
    await expect(page.getByText('한국어')).toBeVisible()
    await expect(page.getByText('日本語')).toBeVisible()
  })

  test('메시지 길이 제한', async ({ page }) => {
    const longMessage = 'a'.repeat(1001) // 1000자 초과
    
    await page.getByPlaceholder('메시지를 입력하세요...').fill(longMessage)
    
    // 글자 수 카운터 확인
    await expect(page.getByText('1001/1000')).toBeVisible()
    
    // 글자 수 초과 시 색상 변경 확인
    const counter = page.getByText('1001/1000')
    await expect(counter).toHaveClass(/text-destructive/)
  })

  test('반응형 레이아웃', async ({ page }) => {
    // 데스크탑 뷰
    await page.setViewportSize({ width: 1024, height: 768 })
    await expect(page.locator('.md\\:flex')).toBeVisible()
    
    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 })
    
    // 모바일에서는 사이드바가 숨겨지고 햄버거 메뉴가 표시
    await expect(page.getByRole('button').filter({ hasText: 'Menu' })).toBeVisible()
  })

  test('다크모드 지원', async ({ page }) => {
    // 시스템 다크모드 설정
    await page.emulateMedia({ colorScheme: 'dark' })
    
    // 다크모드 스타일이 적용되는지 확인
    const body = page.locator('body')
    await expect(body).toHaveClass(/dark/)
  })
})