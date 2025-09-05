/**
 * 계산 히스토리 저장 및 관리 서비스
 * localStorage를 사용하여 계산 기록을 영구 저장합니다.
 */

export interface HistoryItem {
  id: string
  name: string
  date: string
  total: number
  participants: number
  items: number
  status: 'completed' | 'pending' | 'shared'
  createdAt: number
  details?: {
    participantList: string[]
    itemList: { name: string; price: number; quantity: number }[]
    participantTotals: { [name: string]: number }
    participantEmails?: { [name: string]: string }
  }
}

class HistoryService {
  private readonly STORAGE_KEY = 'calculation_history'
  
  /**
   * 모든 히스토리 항목 조회
   */
  getAll(): HistoryItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return this.getInitialData()
      
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : this.getInitialData()
    } catch (error) {
      console.error('히스토리 데이터 로딩 오류:', error)
      return this.getInitialData()
    }
  }

  /**
   * 새 계산 결과 추가
   */
  add(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem {
    const newItem: HistoryItem = {
      ...item,
      id: this.generateId(),
      createdAt: Date.now()
    }

    const currentItems = this.getAll()
    const updatedItems = [newItem, ...currentItems]
    
    this.save(updatedItems)
    return newItem
  }

  /**
   * 특정 항목 업데이트
   */
  update(id: string, updates: Partial<HistoryItem>): boolean {
    const items = this.getAll()
    const index = items.findIndex(item => item.id === id)
    
    if (index === -1) return false
    
    items[index] = { ...items[index], ...updates }
    this.save(items)
    return true
  }

  /**
   * 특정 항목 삭제
   */
  delete(id: string): boolean {
    const items = this.getAll()
    const filteredItems = items.filter(item => item.id !== id)
    
    if (filteredItems.length === items.length) return false
    
    this.save(filteredItems)
    return true
  }

  /**
   * 여러 항목 삭제
   */
  deleteMultiple(ids: string[]): number {
    const items = this.getAll()
    const filteredItems = items.filter(item => !ids.includes(item.id))
    const deletedCount = items.length - filteredItems.length
    
    if (deletedCount > 0) {
      this.save(filteredItems)
    }
    
    return deletedCount
  }

  /**
   * 특정 항목 조회
   */
  getById(id: string): HistoryItem | null {
    return this.getAll().find(item => item.id === id) || null
  }

  /**
   * 검색
   */
  search(query: string): HistoryItem[] {
    const items = this.getAll()
    const lowerQuery = query.toLowerCase()
    
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.date.includes(query)
    )
  }

  /**
   * localStorage에 저장
   */
  private save(items: HistoryItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('히스토리 데이터 저장 오류:', error)
    }
  }

  /**
   * 고유 ID 생성
   */
  private generateId(): string {
    return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 초기 샘플 데이터 (기존 HistoryPage와 동일)
   */
  private getInitialData(): HistoryItem[] {
    const initialData = [
      {
        id: '1',
        name: '카페 모임',
        date: '2024-01-15',
        total: 45600,
        participants: 4,
        items: 8,
        status: 'completed' as const,
        createdAt: new Date('2024-01-15').getTime()
      },
      {
        id: '2', 
        name: '점심 회식',
        date: '2024-01-14',
        total: 128000,
        participants: 6,
        items: 12,
        status: 'shared' as const,
        createdAt: new Date('2024-01-14').getTime()
      },
      {
        id: '3',
        name: '알배달 주문',
        date: '2024-01-13',
        total: 32400,
        participants: 3,
        items: 5,
        status: 'pending' as const,
        createdAt: new Date('2024-01-13').getTime()
      },
      {
        id: '4',
        name: '노래방 모임',
        date: '2024-01-12',
        total: 67800,
        participants: 5,
        items: 7,
        status: 'completed' as const,
        createdAt: new Date('2024-01-12').getTime()
      },
      {
        id: '5',
        name: '마트 장보기',
        date: '2024-01-11',
        total: 156700,
        participants: 2,
        items: 15,
        status: 'shared' as const,
        createdAt: new Date('2024-01-11').getTime()
      },
      {
        id: '6',
        name: '치킨 야식',
        date: '2024-01-10',
        total: 89200,
        participants: 4,
        items: 6,
        status: 'completed' as const,
        createdAt: new Date('2024-01-10').getTime()
      },
      {
        id: '7',
        name: '술집 모임',
        date: '2024-12-28',
        total: 245000,
        participants: 8,
        items: 18,
        status: 'completed' as const,
        createdAt: new Date('2024-12-28').getTime()
      },
      {
        id: '8',
        name: '카페 스터디',
        date: '2024-12-25',
        total: 28900,
        participants: 3,
        items: 4,
        status: 'shared' as const,
        createdAt: new Date('2024-12-25').getTime()
      }
    ]

    // 최초 실행 시 샘플 데이터 저장
    this.save(initialData)
    return initialData
  }

  /**
   * 데이터 초기화 (개발/테스트용)
   */
  reset(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * 통계용 데이터 조회 (최근 12개월)
   */
  getStatsData(): HistoryItem[] {
    const items = this.getAll()
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    
    return items.filter(item => 
      new Date(item.date) >= twelveMonthsAgo
    )
  }
}

// 싱글톤 인스턴스 내보내기
export const historyService = new HistoryService()
export default historyService