import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Archive, Calendar, Users, Coins, Download, Eye } from 'lucide-react'
import { archiveService, type ArchiveItem } from '@/services/archiveService'

export const ArchivePage = () => {
  const navigate = useNavigate()
  const [archivedItems, setArchivedItems] = useState<ArchiveItem[]>([])
  
  // 아카이브 데이터 로드
  useEffect(() => {
    const loadArchives = () => {
      const archives = archiveService.getAll()
      console.log('로드된 아카이브:', archives)
      setArchivedItems(archives)
    }
    
    loadArchives()
    
    // 페이지가 포커스될 때마다 다시 로드
    const handleFocus = () => loadArchives()
    window.addEventListener('focus', handleFocus)
    
    return () => window.removeEventListener('focus', handleFocus)
  }, [])
  const [downloadingIds, setDownloadingIds] = useState<string[]>([])
  const [exportingAll, setExportingAll] = useState(false)

  const downloadAsCSV = (item: ArchiveItem) => {
    const csvData = [
      ['항목명', '날짜', '참가자 수', '총 금액'],
      [item.name, item.date, item.participants.toString(), item.total.toString()]
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${item.name.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${item.date}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const viewArchiveDetail = (item: ArchiveItem) => {
    // 아카이브 항목의 상세보기 페이지로 이동
    navigate(`/result/${item.id}`)
  }

  const downloadAsJSON = (item: typeof archivedItems[0]) => {
    const jsonData = {
      name: item.name,
      date: item.date,
      participants: item.participants,
      amount: item.total,
      exportDate: new Date().toISOString(),
      format: 'archive-item'
    }
    
    const jsonContent = JSON.stringify(jsonData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${item.name.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${item.date}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownload = async (itemId: string) => {
    const item = archivedItems.find(i => i.id === itemId)
    if (!item) return
    
    setDownloadingIds(prev => [...prev, itemId])
    
    try {
      const format = confirm('어떤 형식으로 다운로드하시겠습니까?\n\nOK: CSV 형식\n취소: JSON 형식')
      
      // 다운로드 시뮬레이션을 위한 약간의 지연
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (format) {
        downloadAsCSV(item)
      } else {
        downloadAsJSON(item)
      }
      
      // 성공 피드백
      setTimeout(() => {
        alert(`"${item.name}" 다운로드가 완료되었습니다!`)
      }, 100)
      
    } catch (error) {
      alert('다운로드 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setDownloadingIds(prev => prev.filter(id => id !== itemId))
    }
  }

  const exportAllAsCSV = () => {
    const csvData = [
      ['항목명', '날짜', '참가자 수', '총 금액'],
      ...archivedItems.map(item => [
        item.name,
        item.date,
        item.participants.toString(),
        item.total.toString()
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `아카이브_전체_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportAllAsJSON = () => {
    const jsonData = {
      exportInfo: {
        title: '아카이브 전체 데이터',
        exportDate: new Date().toISOString(),
        totalItems: archivedItems.length,
        totalAmount: archivedItems.reduce((sum, item) => sum + item.total, 0)
      },
      items: archivedItems,
      summary: {
        oldestDate: archivedItems.reduce((oldest, item) => 
          item.date < oldest ? item.date : oldest, archivedItems[0]?.date || ''),
        newestDate: archivedItems.reduce((newest, item) => 
          item.date > newest ? item.date : newest, archivedItems[0]?.date || ''),
        averageAmount: Math.round(archivedItems.reduce((sum, item) => sum + item.total, 0) / archivedItems.length),
        averageParticipants: Math.round(archivedItems.reduce((sum, item) => sum + item.participants, 0) / archivedItems.length * 10) / 10
      }
    }
    
    const jsonContent = JSON.stringify(jsonData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `아카이브_전체_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportAll = async () => {
    if (archivedItems.length === 0) {
      alert('내보낼 아카이브 데이터가 없습니다.')
      return
    }

    setExportingAll(true)
    
    try {
      const format = confirm('전체 데이터를 어떤 형식으로 내보내시겠습니까?\n\nOK: CSV 형식 (스프레드시트용)\n취소: JSON 형식 (상세 정보 포함)')
      
      // 처리 시뮬레이션을 위한 약간의 지연
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (format) {
        exportAllAsCSV()
      } else {
        exportAllAsJSON()
      }
      
      // 성공 피드백
      setTimeout(() => {
        alert(`전체 아카이브 데이터 (${archivedItems.length}개 항목) 내보내기가 완료되었습니다!`)
      }, 100)
      
    } catch (error) {
      alert('내보내기 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setExportingAll(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl" data-testid="archive-page">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tech-title mb-2">아카이브</h1>
            <p className="text-muted-foreground tech-subtitle">보관된 계산 내역을 확인하고 관리하세요</p>
          </div>
          <Button 
            variant="industrial" 
            className="flex items-center space-x-2"
            onClick={handleExportAll}
            disabled={exportingAll}
          >
            <Download className={`h-4 w-4 ${exportingAll ? 'animate-spin' : ''}`} />
            <span>{exportingAll ? '내보내는 중...' : '전체 내보내기'}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="steel-panel">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">보관된 항목</p>
                  <p className="text-2xl font-bold text-primary">{archivedItems.length}</p>
                </div>
                <Archive className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="steel-panel">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 보관 기간</p>
                  <p className="text-2xl font-bold text-primary">6개월</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="steel-panel">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">보관된 총액</p>
                  <p className="text-2xl font-bold text-primary">₩{(archivedItems.reduce((sum, item) => sum + item.total, 0) / 1000).toFixed(0)}K</p>
                </div>
                <Coins className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {archivedItems.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <Archive className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">아카이브가 비어있습니다</h3>
                  <p className="text-muted-foreground">완료된 계산을 아카이브에 저장해보세요.</p>
                </div>
              </div>
            </Card>
          ) : (
            archivedItems.map((item) => (
              <Card key={item.id} className="steel-panel hud-element">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base tech-title">{item.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary">보관됨</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{item.participants}명</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Coins className="h-4 w-4 text-muted-foreground" />
                        <span>₩{item.total.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center space-x-1"
                        onClick={() => viewArchiveDetail(item)}
                      >
                        <Eye className="h-3 w-3" />
                        <span>보기</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center space-x-1"
                        onClick={() => handleDownload(item.id)}
                        disabled={downloadingIds.includes(item.id)}
                      >
                        <Download className={`h-3 w-3 ${downloadingIds.includes(item.id) ? 'animate-spin' : ''}`} />
                        <span>{downloadingIds.includes(item.id) ? '다운로드 중...' : '다운로드'}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="steel-panel">
          <CardHeader>
            <CardTitle className="tech-title">아카이브 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tech-display rounded p-4">
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">자동 보관:</span> 90일 후 자동으로 아카이브로 이동</p>
                <p><span className="text-muted-foreground">보관 기간:</span> 아카이브된 항목은 1년간 보관</p>
                <p><span className="text-muted-foreground">데이터 Export:</span> 언제든 CSV 또는 PDF로 다운로드 가능</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ArchivePage