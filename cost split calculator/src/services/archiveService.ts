/**
 * 아카이브 저장 및 관리 서비스
 * localStorage를 사용하여 완료된 계산 기록을 아카이브에 영구 저장합니다.
 */

import { HistoryItem } from './historyService'

export interface ArchiveItem extends HistoryItem {
  archivedAt: number
  archivedDate: string
}

class ArchiveService {
  private readonly STORAGE_KEY = 'calculation_archive'
  
  /**
   * 모든 아카이브 항목 조회
   */
  getAll(): ArchiveItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []
      
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('아카이브 데이터 로딩 오류:', error)
      return []
    }
  }

  /**
   * 완료된 계산을 아카이브에 추가
   */
  add(historyItem: HistoryItem): ArchiveItem {
    // 완료된 상태가 아니면 에러
    if (historyItem.status !== 'completed') {
      throw new Error('완료된 계산만 아카이브할 수 있습니다.')
    }

    const archiveItem: ArchiveItem = {
      ...historyItem,
      archivedAt: Date.now(),
      archivedDate: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const archives = this.getAll()
    archives.unshift(archiveItem) // 최신 항목을 앞에 추가
    
    this.save(archives)
    return archiveItem
  }

  /**
   * ID로 아카이브 항목 조회
   */
  getById(id: string): ArchiveItem | null {
    const archives = this.getAll()
    return archives.find(item => item.id === id) || null
  }

  /**
   * 아카이브 항목 삭제
   */
  delete(id: string): boolean {
    const archives = this.getAll()
    const filteredArchives = archives.filter(item => item.id !== id)
    
    if (filteredArchives.length === archives.length) {
      return false // 삭제할 항목이 없음
    }
    
    this.save(filteredArchives)
    return true
  }

  /**
   * 여러 아카이브 항목 삭제
   */
  deleteMultiple(ids: string[]): number {
    const archives = this.getAll()
    const initialCount = archives.length
    const filteredArchives = archives.filter(item => !ids.includes(item.id))
    
    this.save(filteredArchives)
    return initialCount - filteredArchives.length
  }

  /**
   * 아카이브 데이터 저장
   */
  private save(archives: ArchiveItem[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(archives))
    } catch (error) {
      console.error('아카이브 데이터 저장 오류:', error)
      throw new Error('아카이브 저장 중 오류가 발생했습니다.')
    }
  }

  /**
   * 아카이브 통계 조회
   */
  getStats() {
    const archives = this.getAll()
    const totalAmount = archives.reduce((sum, item) => sum + item.total, 0)
    const totalParticipants = archives.reduce((sum, item) => sum + item.participants, 0)
    
    return {
      totalArchives: archives.length,
      totalAmount,
      averageAmount: archives.length > 0 ? Math.round(totalAmount / archives.length) : 0,
      totalParticipants: totalParticipants,
      averageParticipants: archives.length > 0 ? Math.round(totalParticipants / archives.length) : 0
    }
  }

  /**
   * 아카이브 전체 삭제 (주의: 복구 불가능)
   */
  clear(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      return true
    } catch (error) {
      console.error('아카이브 전체 삭제 오류:', error)
      return false
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const archiveService = new ArchiveService()
export default archiveService