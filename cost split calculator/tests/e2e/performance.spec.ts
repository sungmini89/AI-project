import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('page load performance', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    // Wait for the main content to be visible
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    // Check for performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      }
    })
    
    console.log('Performance Metrics:', performanceMetrics)
    
    // First Contentful Paint should be under 1.5 seconds
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1500)
  })

  test('OCR processing performance', async ({ page }) => {
    await page.goto('/')
    
    // Upload test image
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/sample-receipt.jpg')
    
    await page.locator('[data-testid="next-button"]').click()
    
    const ocrStartTime = Date.now()
    
    // Wait for OCR to complete
    await expect(page.locator('[data-testid="ocr-complete"]')).toBeVisible({ timeout: 30000 })
    
    const ocrEndTime = Date.now()
    const ocrTime = ocrEndTime - ocrStartTime
    
    console.log(`OCR Processing Time: ${ocrTime}ms`)
    
    // OCR should complete within 20 seconds for test images
    expect(ocrTime).toBeLessThan(20000)
  })

  test('memory usage during image processing', async ({ page, browser }) => {
    await page.goto('/')
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : null
    })
    
    if (initialMemory) {
      console.log('Initial Memory:', initialMemory)
      
      // Process multiple images to test memory management
      for (let i = 0; i < 3; i++) {
        const fileInput = page.locator('input[type="file"]')
        await fileInput.setInputFiles('tests/fixtures/sample-receipt.jpg')
        
        await page.locator('[data-testid="next-button"]').click()
        await expect(page.locator('[data-testid="ocr-complete"]')).toBeVisible({ timeout: 30000 })
        
        // Go back to upload new image
        await page.goBack()
        await page.goBack()
      }
      
      const finalMemory = await page.evaluate(() => {
        return {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        }
      })
      
      console.log('Final Memory:', finalMemory)
      
      // Memory increase should be reasonable (less than 50MB for multiple image processing)
      const memoryIncrease = finalMemory.used - initialMemory.used
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // 50MB
    }
  })

  test('bundle size analysis', async ({ page }) => {
    await page.goto('/')
    
    // Get all network requests
    const responses = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((entry: PerformanceResourceTiming) => ({
        name: entry.name,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize
      }))
    })
    
    // Calculate total bundle size
    const totalSize = responses
      .filter(r => r.name.includes('.js') || r.name.includes('.css'))
      .reduce((total, r) => total + (r.transferSize || 0), 0)
    
    console.log('Total Bundle Size:', (totalSize / 1024).toFixed(2) + 'KB')
    
    // Main bundle should be under 2MB
    expect(totalSize).toBeLessThan(2 * 1024 * 1024)
    
    // Log individual large files
    const largeFiles = responses
      .filter(r => (r.transferSize || 0) > 100 * 1024) // Files larger than 100KB
      .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
    
    console.log('Large Files:', largeFiles)
  })

  test('offline functionality performance', async ({ page, context }) => {
    await page.goto('/')
    
    // Store some calculations in IndexedDB
    await page.evaluate(() => {
      const testData = {
        id: 'perf-test-1',
        name: 'Performance Test',
        participants: ['User 1', 'User 2'],
        items: [
          { id: '1', name: 'Item 1', price: 1000, quantity: 1 },
          { id: '2', name: 'Item 2', price: 2000, quantity: 2 }
        ],
        createdAt: new Date()
      }
      
      return window.indexedDB.open('CostSplitCalculator', 1).then(db => {
        const transaction = db.transaction(['calculations'], 'readwrite')
        const store = transaction.objectStore('calculations')
        return store.add(testData)
      })
    })
    
    // Go offline
    await context.setOffline(true)
    
    const offlineStartTime = Date.now()
    
    // Navigate to history page
    await page.goto('/history')
    
    // Should load offline data quickly
    await expect(page.locator('[data-testid="history-item"]')).toBeVisible({ timeout: 5000 })
    
    const offlineLoadTime = Date.now() - offlineStartTime
    
    console.log(`Offline Load Time: ${offlineLoadTime}ms`)
    
    // Offline data should load within 2 seconds
    expect(offlineLoadTime).toBeLessThan(2000)
    
    // Go back online
    await context.setOffline(false)
  })

  test('UI animation performance', async ({ page }) => {
    await page.goto('/')
    
    // Enable performance monitoring
    await page.addInitScript(() => {
      window.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.entryType === 'measure') {
            console.log(`Animation: ${entry.name} took ${entry.duration}ms`)
          }
        })
      })
      window.performanceObserver.observe({ entryTypes: ['measure'] })
    })
    
    // Test page transitions
    await page.locator('[data-testid="history-nav-link"]').click()
    await expect(page.locator('[data-testid="history-page"]')).toBeVisible()
    
    await page.locator('[data-testid="calculator-nav-link"]').click()
    await expect(page.locator('[data-testid="calculator-page"]')).toBeVisible()
    
    // Test modal animations
    if (await page.locator('[data-testid="settings-button"]').isVisible()) {
      await page.locator('[data-testid="settings-button"]').click()
      await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible()
      
      await page.locator('[data-testid="close-modal-button"]').click()
      await expect(page.locator('[data-testid="settings-modal"]')).not.toBeVisible()
    }
  })
})