import { chromium, FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('Starting global test teardown...')
  
  // Launch browser for cleanup
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // Visit the application
    await page.goto(config.projects[0].use?.baseURL || 'http://localhost:5173')
    
    // Clean up test data from IndexedDB
    await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('CostSplitCalculator', 1)
        
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const db = request.result
          
          if (db.objectStoreNames.contains('calculations')) {
            const transaction = db.transaction(['calculations'], 'readwrite')
            const store = transaction.objectStore('calculations')
            
            // Remove test data (keep only non-test data)
            const getAllRequest = store.getAll()
            getAllRequest.onsuccess = () => {
              const allRecords = getAllRequest.result
              const testRecords = allRecords.filter(record => 
                record.id?.startsWith('test-') || 
                record.name?.includes('Test ') ||
                record.description?.includes('테스트용')
              )
              
              testRecords.forEach(record => {
                store.delete(record.id)
              })
              
              resolve(db)
            }
            getAllRequest.onerror = () => resolve(db)
          } else {
            resolve(db)
          }
        }
      })
    })
    
    // Clear any cached data or temporary files
    await page.evaluate(() => {
      // Clear localStorage test data
      Object.keys(localStorage).forEach(key => {
        if (key.includes('test') || key.includes('Test')) {
          localStorage.removeItem(key)
        }
      })
      
      // Clear sessionStorage test data
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('test') || key.includes('Test')) {
          sessionStorage.removeItem(key)
        }
      })
    })
    
    console.log('✅ Global teardown completed successfully')
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw error in teardown to avoid masking test failures
  } finally {
    await browser.close()
  }
}

export default globalTeardown