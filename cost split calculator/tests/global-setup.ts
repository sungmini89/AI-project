import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('Starting global test setup...')
  
  // Launch browser for pre-test setup
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // Visit the application to ensure it's running
    await page.goto(config.projects[0].use?.baseURL || 'http://localhost:5173')
    
    // Wait for the main content to load
    await page.waitForSelector('[data-testid="main-content"], .main-content, main', { 
      timeout: 30000,
      state: 'visible'
    })
    
    // Setup test data in IndexedDB if needed
    await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('CostSplitCalculator', 1)
        
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const db = request.result
          
          // Create test data
          const testCalculations = [
            {
              id: 'test-calculation-1',
              name: 'Test 점심 모임',
              description: '테스트용 계산 데이터',
              totalAmount: 25000,
              participants: [
                { id: '1', name: '김철수', email: 'kim@test.com' },
                { id: '2', name: '이영희', email: 'lee@test.com' }
              ],
              items: [
                { id: '1', name: '불고기', price: 15000, quantity: 1 },
                { id: '2', name: '냉면', price: 10000, quantity: 1 }
              ],
              splitMethod: 'equal',
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-15'),
              tags: ['점심', '한식']
            },
            {
              id: 'test-calculation-2',
              name: 'Test 저녁 회식',
              description: '테스트용 계산 데이터 2',
              totalAmount: 80000,
              participants: [
                { id: '1', name: '김철수', email: 'kim@test.com' },
                { id: '2', name: '이영희', email: 'lee@test.com' },
                { id: '3', name: '박민수', email: 'park@test.com' }
              ],
              items: [
                { id: '1', name: '삼겹살', price: 30000, quantity: 2 },
                { id: '2', name: '소주', price: 4000, quantity: 5 }
              ],
              splitMethod: 'itemBased',
              createdAt: new Date('2024-01-10'),
              updatedAt: new Date('2024-01-10'),
              tags: ['저녁', '회식', '한식']
            }
          ]
          
          // Only add test data if calculations store exists
          if (db.objectStoreNames.contains('calculations')) {
            const transaction = db.transaction(['calculations'], 'readwrite')
            const store = transaction.objectStore('calculations')
            
            // Clear existing test data and add new test data
            const clearRequest = store.clear()
            clearRequest.onsuccess = () => {
              testCalculations.forEach(calc => {
                store.add(calc)
              })
              resolve(db)
            }
            clearRequest.onerror = () => resolve(db)
          } else {
            resolve(db)
          }
        }
        
        request.onupgradeneeded = (event) => {
          const db = request.result
          
          // Create object stores if they don't exist
          if (!db.objectStoreNames.contains('calculations')) {
            const calculationsStore = db.createObjectStore('calculations', { keyPath: 'id' })
            calculationsStore.createIndex('createdAt', 'createdAt')
            calculationsStore.createIndex('name', 'name')
            calculationsStore.createIndex('tags', 'tags', { multiEntry: true })
          }
          
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' })
          }
          
          if (!db.objectStoreNames.contains('templates')) {
            db.createObjectStore('templates', { keyPath: 'id' })
          }
        }
      })
    })
    
    console.log('✅ Global setup completed successfully')
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup