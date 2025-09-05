import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ShinyButton } from '@/components/magicui/shiny-button'
import { ChevronDown } from 'lucide-react'
import { historyService, type HistoryItem } from '@/services/historyService'

const HistoryPage = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [statusFilter, setStatusFilter] = useState<HistoryItem['status'] | 'all'>('all')

  // 히스토리 데이터 로드
  useEffect(() => {
    const loadHistory = () => {
      const items = historyService.getAll()
      setHistoryItems(items)
    }
    
    loadHistory()
    
    // 페이지가 포커스될 때마다 다시 로드 (새로 추가된 계산 반영)
    const handleFocus = () => loadHistory()
    window.addEventListener('focus', handleFocus)
    
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const filteredItems = historyItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }

  const deleteSelected = () => {
    if (selectedItems.length === 0) return
    
    const deletedCount = historyService.deleteMultiple(selectedItems)
    if (deletedCount > 0) {
      // 히스토리 다시 로드
      const updatedItems = historyService.getAll()
      setHistoryItems(updatedItems)
      setSelectedItems([])
      alert(`${deletedCount}개 항목이 삭제되었습니다.`)
    } else {
      alert('삭제할 항목이 없습니다.')
    }
  }

  const updateStatus = (id: string, newStatus: HistoryItem['status']) => {
    const success = historyService.update(id, { status: newStatus })
    if (success) {
      // 히스토리 다시 로드
      const updatedItems = historyService.getAll()
      setHistoryItems(updatedItems)
      
      const statusText = getStatusText(newStatus)
      alert(`상태가 '${statusText}'로 변경되었습니다.`)
    } else {
      alert('상태 변경에 실패했습니다.')
    }
  }

  const exportSelected = () => {
    const selectedItemsData = historyItems.filter(item => selectedItems.includes(item.id))
    alert(`${selectedItems.length}개 항목을 CSV/PDF로 내보내기합니다:\n${selectedItemsData.map(item => `- ${item.name} (${item.date})`).join('\n')}`)
  }

  const shareCalculation = (id: string) => {
    const item = historyItems.find(item => item.id === id)
    if (item) {
      if (navigator.share) {
        // 모바일 네이티브 공유 API 사용
        navigator.share({
          title: `${item.name} - 계산 결과`,
          text: `${item.name}\n날짜: ${item.date}\n총 금액: ${item.total.toLocaleString()}원\n참가자: ${item.participants}명`,
          url: `${window.location.origin}/result/${id}`
        }).catch(err => console.log('공유 실패:', err))
      } else {
        // 데스크톱에서 클립보드에 복사
        const shareText = `${item.name}\n날짜: ${item.date}\n총 금액: ${item.total.toLocaleString()}원\n참가자: ${item.participants}명\n링크: ${window.location.origin}/result/${id}`
        
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareText).then(() => {
            alert('계산 결과가 클립보드에 복사되었습니다!')
          }).catch(() => {
            alert('복사에 실패했습니다. 다시 시도해주세요.')
          })
        } else {
          // 클립보드 API를 사용할 수 없는 경우 fallback
          alert(`공유 정보:\n\n${shareText}`)
        }
      }
    }
  }

  const viewCalculation = (id: string) => {
    navigate(`/result/${id}`)
  }

  const getStatusColor = (status: HistoryItem['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-900/50 text-green-300'
      case 'shared': return 'bg-blue-900/50 text-blue-300'
      case 'pending': return 'bg-yellow-900/50 text-yellow-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: HistoryItem['status']) => {
    switch (status) {
      case 'completed': return '완료'
      case 'shared': return '공유됨'
      case 'pending': return '대기중'
      default: return '알 수 없음'
    }
  }

  // 키보드 네비게이션
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (filteredItems.length === 0) return
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex(prev => 
            prev < filteredItems.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex(prev => prev > 0 ? prev - 1 : prev)
          break
        case 'Enter':
          if (focusedIndex >= 0) {
            event.preventDefault()
            viewCalculation(filteredItems[focusedIndex].id)
          }
          break
        case ' ':
          if (focusedIndex >= 0) {
            event.preventDefault()
            toggleSelectItem(filteredItems[focusedIndex].id)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [filteredItems, focusedIndex])

  // Focus management - update DOM focus when focusedIndex changes
  React.useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < filteredItems.length) {
      const items = document.querySelectorAll('[data-testid="history-item"]')
      const focusedItem = items[focusedIndex] as HTMLElement
      if (focusedItem) {
        focusedItem.focus()
      }
    }
  }, [focusedIndex, filteredItems.length])

  return (
    <div className="container mx-auto p-4 max-w-6xl" data-testid="history-page">
      <div className="space-y-6">
        {/* 헤더 */}
        <Card className="steel-panel hud-element">
          <CardHeader>
            <CardTitle data-testid="history-title" className="tech-title">계산 히스토리</CardTitle>
            <p className="text-muted-foreground tech-subtitle">
              지금까지 {historyItems.length}개의 계산 기록이 있습니다.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <Input
                  data-testid="search-input"
                  placeholder="계산 이름이나 날짜로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="md:max-w-md"
                  aria-label="계산 기록 검색"
                />
                <div className="flex space-x-2">
                  <Button
                    variant="industrial"
                    data-testid="new-calculation-button"
                    onClick={() => navigate('/')}
                  >
                    + 새 계산
                  </Button>
                  {selectedItems.length > 0 && (
                    <>
                      <Button
                        data-testid="export-selected-button"
                        onClick={exportSelected}
                        variant="outline"
                      >
                        내보내기 ({selectedItems.length})
                      </Button>
                      <Button
                        data-testid="delete-selected-button"
                        onClick={deleteSelected}
                        variant="destructive"
                      >
                        삭제 ({selectedItems.length})
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {/* 상태 필터 */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">상태 필터:</span>
                <div className="flex gap-2">
                  <button
                    data-testid="filter-all"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    전체
                  </button>
                  <button
                    data-testid="filter-pending"
                    onClick={() => setStatusFilter('pending')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      statusFilter === 'pending'
                        ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-300'
                        : 'bg-muted text-muted-foreground hover:bg-yellow-50'
                    }`}
                  >
                    🟡 대기중
                  </button>
                  <button
                    data-testid="filter-shared"
                    onClick={() => setStatusFilter('shared')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      statusFilter === 'shared'
                        ? 'bg-blue-900/50 text-blue-300 border border-blue-300'
                        : 'bg-muted text-muted-foreground hover:bg-blue-50'
                    }`}
                  >
                    🔵 공유됨
                  </button>
                  <button
                    data-testid="filter-completed"
                    onClick={() => setStatusFilter('completed')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      statusFilter === 'completed'
                        ? 'bg-green-900/50 text-green-300 border border-green-300'
                        : 'bg-muted text-muted-foreground hover:bg-green-50'
                    }`}
                  >
                    🟢 완료
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 히스토리 목록 */}
        <div className="space-y-4" data-testid="history-list" role="list">
          {filteredItems.length === 0 ? (
            <Card data-testid="no-history" className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? '검색 결과가 없습니다.' : '아직 계산 기록이 없습니다.'}
              </p>
            </Card>
          ) : (
            filteredItems.map((item, index) => (
              <Card 
                key={item.id} 
                data-testid="history-item"
                className={`steel-panel hud-element transition-all ${selectedItems.includes(item.id) ? 'ring-2 ring-primary bg-primary/5' : ''} ${focusedIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                tabIndex={0}
                onFocus={() => setFocusedIndex(index)}
                role="listitem"
                aria-selected={selectedItems.includes(item.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <input
                        data-testid={`select-item-${index}`}
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                        className="w-4 h-4"
                        aria-label={`${item.name} 선택`}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {item.total.toLocaleString()}원
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.participants}명 · {item.items}개 항목
                        </p>
                      </div>
                      
                      <div className="relative">
                        <select
                          value={item.status}
                          onChange={(e) => updateStatus(item.id, e.target.value as HistoryItem['status'])}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer appearance-none pr-6 ${getStatusColor(item.status)}`}
                        >
                          <option value="pending">🟡 대기중</option>
                          <option value="shared">🔵 공유됨</option>
                          <option value="completed">🟢 완료</option>
                        </select>
                        <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          data-testid={`view-item-${index}`}
                          onClick={() => viewCalculation(item.id)}
                          variant="outline"
                          size="sm"
                        >
                          보기
                        </Button>
                        <Button
                          data-testid={`share-item-${index}`}
                          onClick={() => shareCalculation(item.id)}
                          variant="outline"
                          size="sm"
                        >
                          공유
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 통계 정보 */}
        <Card className="steel-panel">
          <CardHeader>
            <CardTitle className="tech-title">통계 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div data-testid="total-calculations" className="tech-display text-center p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">{historyItems.length}</p>
                <p className="text-sm text-muted-foreground">총 계산 횟수</p>
              </div>
              <div data-testid="completed-calculations" className="tech-display text-center p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {historyItems.filter(item => item.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">완료된 계산</p>
              </div>
              <div data-testid="completed-amount" className="tech-display text-center p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {historyItems.filter(item => item.status === 'completed').reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">완료된 계산 금액</p>
              </div>
              <div data-testid="average-amount" className="tech-display text-center p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {(() => {
                    const completedItems = historyItems.filter(item => item.status === 'completed');
                    return completedItems.length > 0 
                      ? Math.round(completedItems.reduce((sum, item) => sum + item.total, 0) / completedItems.length).toLocaleString()
                      : '0';
                  })()}
                </p>
                <p className="text-sm text-muted-foreground">완료된 계산 평균 금액</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HistoryPage