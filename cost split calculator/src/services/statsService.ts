/**
 * 통계 계산 서비스
 * 아카이브된 데이터를 기반으로 실제 통계를 계산합니다.
 */

import { archiveService, type ArchiveItem } from './archiveService'

export interface StatsData {
  // 기본 통계
  totalCalculations: number
  totalAmount: number
  averageAmount: number
  
  // 시간 기반 분석
  thisMonth: {
    calculations: number
    amount: number
  }
  lastMonth: {
    calculations: number
    amount: number
  }
  
  // 카테고리 분석
  categories: {
    [key: string]: {
      count: number
      amount: number
      percentage: number
    }
  }
  
  // 월별 추이 데이터 (최근 12개월)
  monthlyTrend: Array<{
    month: string
    calculations: number
    amount: number
  }>
  
  // 변화 비율
  changes: {
    calculationsChange: number  // 지난달 대비 계산 횟수 변화율
    amountChange: number       // 지난달 대비 금액 변화율
  }
}

class StatsService {

  /**
   * 아카이브된 데이터 가져오기 (완료된 계산들만)
   */
  private getArchivedData(): ArchiveItem[] {
    return archiveService.getAll()
  }
  
  /**
   * 전체 통계 데이터 계산
   */
  async calculateStats(): Promise<StatsData> {
    try {
      const archivedItems = this.getArchivedData()

      if (archivedItems.length === 0) {
        return this.getEmptyStats()
      }

      // 기본 통계 계산
      const totalCalculations = archivedItems.length
      const totalAmount = archivedItems.reduce((sum, item) => sum + item.total, 0)
      const averageAmount = totalAmount / totalCalculations

      // 시간 기반 분석
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

      const thisMonthItems = archivedItems.filter(item => {
        const itemDate = new Date(item.date)
        return itemDate >= thisMonthStart
      })
      
      const lastMonthItems = archivedItems.filter(item => {
        const itemDate = new Date(item.date)
        return itemDate >= lastMonthStart && itemDate < thisMonthStart
      })

      const thisMonth = {
        calculations: thisMonthItems.length,
        amount: thisMonthItems.reduce((sum, item) => sum + item.total, 0)
      }

      const lastMonth = {
        calculations: lastMonthItems.length,
        amount: lastMonthItems.reduce((sum, item) => sum + item.total, 0)
      }

      // 변화율 계산
      const calculationsChange = lastMonth.calculations > 0 
        ? ((thisMonth.calculations - lastMonth.calculations) / lastMonth.calculations) * 100 
        : thisMonth.calculations > 0 ? 100 : 0

      const amountChange = lastMonth.amount > 0 
        ? ((thisMonth.amount - lastMonth.amount) / lastMonth.amount) * 100 
        : thisMonth.amount > 0 ? 100 : 0

      // 카테고리 분석
      const categories = this.analyzeCategoriesFromArchivedItems(archivedItems)

      // 월별 추이 데이터
      const monthlyTrend = this.calculateMonthlyTrendFromArchive(archivedItems)

      return {
        totalCalculations,
        totalAmount,
        averageAmount,
        thisMonth,
        lastMonth,
        categories,
        monthlyTrend,
        changes: {
          calculationsChange,
          amountChange
        }
      }

    } catch (error) {
      console.error('통계 계산 중 오류 발생:', error)
      return this.getEmptyStats()
    }
  }

  /**
   * 개발 및 데모용 모의 통계 데이터
   */
  private getMockStats(): StatsData {
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
    const lastMonth = `${now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()}-${(now.getMonth() === 0 ? 12 : now.getMonth()).toString().padStart(2, '0')}`

    return {
      totalCalculations: 24,
      totalAmount: 369600,
      averageAmount: 15400,
      thisMonth: { calculations: 8, amount: 124800 },
      lastMonth: { calculations: 6, amount: 92400 },
      categories: {
        '식비': { count: 18, amount: 277200, percentage: 75 },
        '음료': { count: 8, amount: 61600, percentage: 16.7 },
        '디저트': { count: 4, amount: 30800, percentage: 8.3 }
      },
      monthlyTrend: [
        { month: lastMonth, calculations: 6, amount: 92400 },
        { month: thisMonth, calculations: 8, amount: 124800 }
      ],
      changes: {
        calculationsChange: 33.3,
        amountChange: 35.0
      }
    }
  }

  /**
   * 빈 통계 데이터 반환
   */
  private getEmptyStats(): StatsData {
    return {
      totalCalculations: 0,
      totalAmount: 0,
      averageAmount: 0,
      thisMonth: { calculations: 0, amount: 0 },
      lastMonth: { calculations: 0, amount: 0 },
      categories: {},
      monthlyTrend: [],
      changes: { calculationsChange: 0, amountChange: 0 }
    }
  }

  /**
   * 아카이브 아이템에서 카테고리 분석
   */
  private analyzeCategoriesFromArchivedItems(archivedItems: ArchiveItem[]) {
    const categoryStats: { [key: string]: { count: number; amount: number } } = {}

    archivedItems.forEach(item => {
      // 아이템명을 기반으로 카테고리 추정
      const category = this.categorizeItem(item.name)
      
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, amount: 0 }
      }
      
      categoryStats[category].count += 1
      categoryStats[category].amount += item.total
    })

    // 비율 계산
    const totalAmount = Object.values(categoryStats).reduce((sum, cat) => sum + cat.amount, 0)
    const categories: StatsData['categories'] = {}

    Object.entries(categoryStats).forEach(([category, stats]) => {
      categories[category] = {
        ...stats,
        percentage: totalAmount > 0 ? (stats.amount / totalAmount) * 100 : 0
      }
    })

    return categories
  }

  /**
   * 항목명을 기반으로 카테고리 추정
   */
  private categorizeItem(itemName: string): string {
    const name = itemName.toLowerCase()

    // 음료 카테고리
    if (name.includes('음료') || name.includes('커피') || name.includes('차') || 
        name.includes('콜라') || name.includes('사이다') || name.includes('주스') ||
        name.includes('물') || name.includes('맥주') || name.includes('소주')) {
      return '음료'
    }

    // 디저트 카테고리
    if (name.includes('케이크') || name.includes('아이스크림') || name.includes('과자') || 
        name.includes('초콜릿') || name.includes('캔디') || name.includes('디저트') ||
        name.includes('빙수') || name.includes('팥빙수')) {
      return '디저트'
    }

    // 주식 카테고리
    if (name.includes('밥') || name.includes('국밥') || name.includes('비빔밥') ||
        name.includes('덮밥') || name.includes('볶음밥') || name.includes('라면') ||
        name.includes('국수') || name.includes('우동') || name.includes('파스타')) {
      return '주식'
    }

    // 안주/반찬 카테고리
    if (name.includes('안주') || name.includes('치킨') || name.includes('튀김') ||
        name.includes('전') || name.includes('구이') || name.includes('조림') ||
        name.includes('나물') || name.includes('김치')) {
      return '안주/반찬'
    }

    // 기본은 식비로 분류
    return '식비'
  }

  /**
   * 아카이브 기반 최근 12개월 월별 추이 계산
   */
  private calculateMonthlyTrendFromArchive(archivedItems: ArchiveItem[]): StatsData['monthlyTrend'] {
    const monthlyData: { [key: string]: { calculations: number; amount: number } } = {}

    // 최근 12개월 초기화
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      monthlyData[key] = { calculations: 0, amount: 0 }
    }

    // 아카이브 기록을 월별로 집계
    archivedItems.forEach(item => {
      const date = new Date(item.date)
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      
      if (monthlyData[key]) {
        monthlyData[key].calculations += 1
        monthlyData[key].amount += item.total
      }
    })

    // 배열로 변환하고 정렬
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        calculations: data.calculations,
        amount: data.amount
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  /**
   * 특정 기간의 통계 계산 (아카이브 데이터 기반)
   */
  async calculateStatsForPeriod(startDate: string, endDate: string): Promise<Partial<StatsData>> {
    const archivedItems = archiveService.getAll()
    
    const filteredItems = archivedItems.filter(item => {
      const itemDate = item.date
      return itemDate >= startDate && itemDate <= endDate
    })

    if (filteredItems.length === 0) {
      return { totalCalculations: 0, totalAmount: 0, averageAmount: 0 }
    }

    const totalCalculations = filteredItems.length
    const totalAmount = filteredItems.reduce((sum, item) => sum + item.total, 0)
    const averageAmount = totalAmount / totalCalculations

    return {
      totalCalculations,
      totalAmount,
      averageAmount
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const statsService = new StatsService()
export default statsService