// 번역 시스템 테스트 유틸리티

import { translationEngine } from '@/lib/services/translationEngine'

export async function testTranslationQuality() {
  console.log('🧪 번역 품질 테스트 시작...')
  
  const testCases = [
    { text: 'hello', target: 'ko', expected: '안녕' },
    { text: 'thank you', target: 'ko', expected: '감사' },
    { text: 'good morning', target: 'ko', expected: '좋은 아침' },
    { text: '안녕하세요', target: 'en', expected: 'hello' },
    { text: 'how are you?', target: 'ko', expected: '어떻게' },
  ]

  const results = []
  
  for (const testCase of testCases) {
    try {
      console.log(`\n🔄 테스트: "${testCase.text}" → ${testCase.target}`)
      
      const result = await translationEngine.translate(
        testCase.text, 
        testCase.target
      )
      
      const success = result.translatedText.toLowerCase().includes(testCase.expected)
      const quality = result.confidence || 0
      
      results.push({
        ...testCase,
        result: result.translatedText,
        provider: result.provider,
        confidence: quality,
        success,
        status: success ? '✅' : '❌'
      })
      
      console.log(`${success ? '✅' : '❌'} 결과: "${result.translatedText}"`)
      console.log(`📊 신뢰도: ${(quality * 100).toFixed(1)}% | 제공자: ${result.provider}`)
      
    } catch (error) {
      results.push({
        ...testCase,
        result: 'ERROR',
        provider: 'none',
        confidence: 0,
        success: false,
        status: '💥',
        error: error.message
      })
      console.log(`💥 오류: ${error.message}`)
    }
  }
  
  // 결과 요약
  const successRate = (results.filter(r => r.success).length / results.length) * 100
  console.log(`\n📈 전체 테스트 결과:`)
  console.log(`성공률: ${successRate.toFixed(1)}%`)
  console.log(`총 테스트: ${results.length}개`)
  console.log(`성공: ${results.filter(r => r.success).length}개`)
  console.log(`실패: ${results.filter(r => !r.success).length}개`)
  
  // 제공자별 통계
  const providerStats = results.reduce((stats, result) => {
    if (!stats[result.provider]) {
      stats[result.provider] = { total: 0, success: 0 }
    }
    stats[result.provider].total++
    if (result.success) stats[result.provider].success++
    return stats
  }, {} as Record<string, { total: number, success: number }>)
  
  console.log(`\n📊 제공자별 성능:`)
  for (const [provider, stats] of Object.entries(providerStats)) {
    const rate = (stats.success / stats.total) * 100
    console.log(`${provider}: ${rate.toFixed(1)}% (${stats.success}/${stats.total})`)
  }
  
  return results
}

// 브라우저 콘솔에서 사용할 수 있도록 전역에 추가
declare global {
  interface Window {
    testTranslation: typeof testTranslationQuality
  }
}

if (typeof window !== 'undefined') {
  window.testTranslation = testTranslationQuality
}