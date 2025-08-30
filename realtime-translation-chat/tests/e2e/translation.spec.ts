import { test, expect } from '@playwright/test'

test.describe('Translation Features', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user와 translation services
    await page.addInitScript(() => {
      const mockUser = {
        uid: 'test-user-id',
        displayName: '테스트 사용자',
        email: 'test@example.com',
        preferredLanguage: 'ko'
      }
      localStorage.setItem('chatUser', JSON.stringify(mockUser))

      // Mock translation API responses
      window.fetch = async (url, options) => {
        if (url.includes('mymemory.translated.net')) {
          return {
            json: async () => ({
              responseData: {
                translatedText: 'Hello World (translated)',
                match: 0.8
              },
              responseStatus: 200
            }),
            ok: true
          }
        }
        return { ok: false, status: 404 }
      }
    })
    
    await page.goto('/')
  })

  test('언어 감지 기능', async ({ page }) => {
    // 메시지 입력
    await page.getByPlaceholder('메시지를 입력하세요...').fill('Hello World')
    
    // 언어가 자동으로 감지되는지 확인
    // (실제로는 franc 라이브러리가 작동하는지 확인)
  })

  test('번역 언어 선택 UI', async ({ page }) => {
    // 번역 언어 버튼 클릭
    await page.getByRole('button').filter({ hasText: '번역 언어' }).click()
    
    // 여러 언어 선택
    await page.getByText('English').click()
    await page.getByText('日本語').click()
    
    // 선택된 언어 확인
    await expect(page.getByText('English')).toBeVisible()
    await expect(page.getByText('日本語')).toBeVisible()
  })

  test('번역 진행 상태 표시', async ({ page }) => {
    // Mock 메시지 데이터로 번역 상태 테스트
    await page.evaluate(() => {
      const mockMessage = {
        id: '1',
        userId: 'test-user-id',
        userName: '테스트 사용자',
        originalText: 'Hello World',
        originalLanguage: 'en',
        translations: {},
        timestamp: Date.now(),
        isTranslating: true,
        translationProgress: 1,
        translationTotal: 3
      }
      
      // Mock 메시지를 DOM에 추가하여 번역 상태 UI 테스트
      const event = new CustomEvent('mockMessage', { detail: mockMessage })
      document.dispatchEvent(event)
    })
    
    // 번역 진행 상태가 표시되는지 확인
    await expect(page.getByText('번역 중... (1/3)')).toBeVisible()
  })

  test('번역 오류 처리', async ({ page }) => {
    // 번역 오류 상태 모의
    await page.evaluate(() => {
      const mockMessage = {
        id: '1',
        userId: 'test-user-id',
        userName: '테스트 사용자',
        originalText: 'Hello World',
        originalLanguage: 'en',
        translations: {},
        timestamp: Date.now(),
        isTranslating: false,
        translationError: '번역 서비스 오류'
      }
      
      const event = new CustomEvent('mockMessage', { detail: mockMessage })
      document.dispatchEvent(event)
    })
    
    // 오류 메시지가 표시되는지 확인
    await expect(page.getByText('번역 오류: 번역 서비스 오류')).toBeVisible()
  })

  test('번역된 메시지 언어 전환', async ({ page }) => {
    // Mock 번역 완료 메시지
    await page.evaluate(() => {
      const mockMessage = {
        id: '1',
        userId: 'other-user-id',
        userName: '다른 사용자',
        originalText: 'Hello World',
        originalLanguage: 'en',
        translations: {
          'ko': '안녕 세상',
          'ja': 'こんにちは世界'
        },
        timestamp: Date.now(),
        isTranslating: false
      }
      
      const event = new CustomEvent('mockMessage', { detail: mockMessage })
      document.dispatchEvent(event)
    })
    
    // 언어 선택 버튼 클릭하여 다른 번역 확인
    await page.getByRole('button').filter({ hasText: 'Languages' }).click()
    await page.getByText('日本語').click()
    
    // 일본어 번역이 표시되는지 확인
    await expect(page.getByText('こんにちは世界')).toBeVisible()
  })

  test('번역 캐시 기능', async ({ page }) => {
    // 동일한 메시지를 두 번 번역할 때 캐시가 사용되는지 확인
    const message = 'Hello World'
    
    await page.getByPlaceholder('메시지를 입력하세요...').fill(message)
    
    // 번역 언어 선택
    await page.getByRole('button').filter({ hasText: '번역 언어' }).click()
    await page.getByText('한국어').click()
    
    // 메시지 전송 (첫 번째)
    await page.getByRole('button').filter({ hasText: 'Send' }).click()
    
    // 같은 메시지 다시 전송 (캐시 사용)
    await page.getByPlaceholder('메시지를 입력하세요...').fill(message)
    await page.getByRole('button').filter({ hasText: 'Send' }).click()
    
    // 캐시 히트 로그가 콘솔에 나타나는지 확인
    const consoleLogs = []
    page.on('console', msg => consoleLogs.push(msg.text()))
    
    // 'Translation cache hit' 메시지가 있는지 확인
    await expect(consoleLogs.some(log => log.includes('Translation cache hit'))).toBeTruthy()
  })
})