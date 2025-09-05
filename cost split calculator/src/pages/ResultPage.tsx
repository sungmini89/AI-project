import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ShinyButton } from '@/components/magicui/shiny-button'
import { BillItem, Participant } from '@/types'
import { historyService, type HistoryItem } from '@/services/historyService'
import { archiveService } from '@/services/archiveService'

const ResultPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  
  const [historyItem, setHistoryItem] = useState<HistoryItem | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // 히스토리 데이터 로드
  useEffect(() => {
    if (!id) {
      navigate('/history')
      return
    }
    
    const item = historyService.getById(id)
    if (!item) {
      alert('계산 기록을 찾을 수 없습니다.')
      navigate('/history')
      return
    }
    
    setHistoryItem(item)
    
    // details가 있으면 실제 데이터 사용, 없으면 기본 데이터 생성
    if (item.details) {
      const participantList: Participant[] = item.details.participantList.map((name, index) => ({
        id: `${index + 1}`,
        name,
        email: item.details?.participantEmails?.[name] || `${name.toLowerCase()}@example.com`,
        share: item.details!.participantTotals[name] || 0
      }))
      
      const itemList: BillItem[] = item.details.itemList.map((listItem, index) => ({
        id: `${index + 1}`,
        name: listItem.name,
        price: listItem.price,
        quantity: listItem.quantity,
        category: '기타',
        assignedParticipants: ['1'] // 기본적으로 첫 번째 참가자에게 할당
      }))
      
      setParticipants(participantList)
      setBillItems(itemList)
    } else {
      // details가 없으면 기본 정보로 참가자 생성
      const defaultParticipants: Participant[] = Array.from({ length: item.participants }, (_, index) => ({
        id: `${index + 1}`,
        name: `참가자 ${index + 1}`,
        email: `user${index + 1}@example.com`,
        share: Math.round(item.total / item.participants)
      }))
      
      const defaultItems: BillItem[] = [{
        id: '1',
        name: item.name,
        price: item.total,
        quantity: 1,
        category: '기타',
        assignedParticipants: defaultParticipants.map(p => p.id)
      }]
      
      setParticipants(defaultParticipants)
      setBillItems(defaultItems)
    }
    
    setLoading(false)
  }, [id, navigate])

  const [isShared, setIsShared] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  const [editingEmail, setEditingEmail] = useState<string | null>(null)
  const [tempEmail, setTempEmail] = useState('')
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendMethod, setSendMethod] = useState<'email' | 'kakao' | 'clipboard'>('clipboard')

  const calculateParticipantTotal = (participantId: string) => {
    // 저장된 participantTotals가 있으면 그것을 사용
    if (historyItem?.details?.participantTotals) {
      const participant = participants.find(p => p.id === participantId)
      if (participant) {
        return historyItem.details.participantTotals[participant.name] || 0
      }
    }
    
    // 기본 계산 로직 (details가 없는 경우)
    return billItems.reduce((sum, item) => {
      const isAssigned = item.assignedParticipants?.includes(participantId) || false
      if (isAssigned) {
        const assignedCount = item.assignedParticipants?.length || 1
        return sum + (item.price * item.quantity) / assignedCount
      }
      return sum
    }, 0)
  }

  // 저장된 총액이 있으면 그것을 사용, 없으면 계산
  const totalAmount = historyItem?.total || billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card>
          <CardContent className="p-8 text-center">
            <p>계산 결과를 불러오는 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 전송 방법 선택 모달 열기
  const openSendModal = () => {
    setShowSendModal(true)
  }

  // 통합 전송 기능
  const sendResults = async () => {
    if (!historyItem) return

    const participantDetails = participants.map(p => 
      `${p.name}: ${calculateParticipantTotal(p.id).toLocaleString()}원`
    ).join('\n')
    
    const shareText = `💰 ${historyItem.name} - 정산 결과\n\n` +
      `📅 날짜: ${historyItem.date}\n` +
      `💵 총 금액: ${totalAmount.toLocaleString()}원\n` +
      `👥 참가자: ${participants.length}명\n\n` +
      `📋 개별 정산 내역:\n${participantDetails}\n\n` +
      `🔗 자세한 내용: ${window.location.href}`

    setShowSendModal(false)

    try {
      switch (sendMethod) {
        case 'clipboard':
          await sendToClipboard(shareText)
          break
        case 'email':
          await sendToEmail(shareText, participantDetails)
          break
        case 'kakao':
          await sendToKakao(shareText)
          break
      }
    } catch (error) {
      console.error('전송 실패:', error)
      setShareMessage('전송 중 오류가 발생했습니다. 다시 시도해주세요.')
      setIsShared(true)
    }
  }

  // 클립보드로 복사
  const sendToClipboard = async (shareText: string) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText)
      setShareMessage('📋 정산 결과가 클립보드에 복사되었습니다!\n카카오톡, 문자메시지, 이메일 등에서 Ctrl+V로 붙여넣기 하세요.')
    } else {
      setShareMessage(shareText)
    }
    setIsShared(true)
    setTimeout(() => setIsShared(false), 5000)
  }

  // 이메일로 전송
  const sendToEmail = async (shareText: string, participantDetails: string) => {
    const participantsWithEmails = participants.filter(p => p.email && p.email.includes('@'))
    
    if (participantsWithEmails.length === 0) {
      setShareMessage('⚠️ 유효한 이메일 주소가 없습니다.\n참가자 이메일을 먼저 입력해주세요.')
      setIsShared(true)
      setTimeout(() => setIsShared(false), 4000)
      return
    }

    // 각 참가자별 개별 이메일 생성
    const notifications = participantsWithEmails.map(participant => {
      const amount = calculateParticipantTotal(participant.id)
      const personalMessage = `💰 ${historyItem.name} 정산 알림\n\n` +
        `안녕하세요! ${historyItem.name}에 대한 정산 결과를 알려드립니다.\n\n` +
        `📅 날짜: ${historyItem.date}\n` +
        `💵 총 금액: ${totalAmount.toLocaleString()}원\n\n` +
        `👤 ${participant.name}님의 정산 금액: ${amount.toLocaleString()}원\n\n` +
        `🔗 자세한 내용: ${window.location.href}\n\n` +
        `정산 담당자에게 ${amount.toLocaleString()}원을 송금해주세요.\n감사합니다! 😊`

      const mailtoLink = `mailto:${participant.email}` +
        `?subject=${encodeURIComponent(`${historyItem.name} - 정산 알림`)}` +
        `&body=${encodeURIComponent(personalMessage)}`

      return { participant, mailtoLink, amount }
    })

    // 이메일 클라이언트 열기
    notifications.forEach((notification, index) => {
      setTimeout(() => {
        window.open(notification.mailtoLink, '_blank')
      }, index * 500)
    })

    setShareMessage(`📧 ${notifications.length}명에게 이메일 클라이언트가 열렸습니다!\n각 이메일을 확인하고 전송해주세요.`)
    setIsShared(true)
    setTimeout(() => setIsShared(false), 5000)
  }

  // 카카오톡으로 전송 (웹 공유 API 사용)
  const sendToKakao = async (shareText: string) => {
    try {
      // 모바일에서 웹 공유 API 사용
      if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        await navigator.share({
          title: `${historyItem.name} - 정산 결과`,
          text: shareText,
          url: window.location.href
        })
        setShareMessage('📱 모바일 공유 완료!')
      } else {
        // 데스크톱에서는 카카오톡 웹 링크 생성
        const kakaoText = encodeURIComponent(shareText)
        const kakaoUrl = `https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(window.location.href)}&text=${kakaoText}`
        
        // 새 창에서 카카오톡 공유 페이지 열기
        window.open(kakaoUrl, '_blank', 'width=500,height=600')
        setShareMessage('📱 카카오톡 공유 창이 열렸습니다!')
      }
      setIsShared(true)
      setTimeout(() => setIsShared(false), 4000)
    } catch (error) {
      // 카카오톡 공유 실패 시 클립보드로 대체
      await sendToClipboard(shareText)
    }
  }

  const saveToArchive = () => {
    console.log('saveToArchive 함수 실행됨')
    console.log('historyItem:', historyItem)
    
    if (!historyItem) {
      alert('아카이브할 계산 데이터가 없습니다.')
      return
    }

    console.log('historyItem.status:', historyItem.status)

    // 상태별 처리
    if (historyItem.status === 'pending') {
      alert('대기중인 계산입니다. 먼저 완료 상태로 변경해주세요.')
      return
    }

    if (historyItem.status === 'shared') {
      alert('공유 상태인 계산입니다. 먼저 완료 상태로 변경해주세요.')
      return
    }

    if (historyItem.status === 'completed') {
      try {
        console.log('archiveService.add 시작')
        // 아카이브에 저장
        const archivedItem = archiveService.add(historyItem)
        console.log('archiveService.add 완료:', archivedItem)
        alert(`계산이 아카이브에 성공적으로 저장되었습니다.\n저장 시간: ${archivedItem.archivedDate}`)
        
        // 저장 후 아카이브 확인
        const allArchives = archiveService.getAll()
        console.log('현재 아카이브 목록:', allArchives)
      } catch (error) {
        console.error('아카이브 저장 오류:', error)
        alert(`아카이브 저장 중 오류가 발생했습니다: ${error}`)
      }
    } else {
      alert('알 수 없는 상태입니다. 먼저 완료 상태로 변경해주세요.')
    }
  }


  const startEditingEmail = (participantId: string, currentEmail: string) => {
    setEditingEmail(participantId)
    setTempEmail(currentEmail)
  }

  const cancelEditingEmail = () => {
    setEditingEmail(null)
    setTempEmail('')
  }

  const updateParticipantEmail = (participantId: string) => {
    if (!historyItem || !tempEmail.trim()) {
      cancelEditingEmail()
      return
    }

    // participants 배열 업데이트
    const updatedParticipants = participants.map(p => 
      p.id === participantId ? { ...p, email: tempEmail.trim() } : p
    )
    setParticipants(updatedParticipants)

    // 히스토리 서비스에 업데이트된 이메일 정보 저장
    if (historyItem.details) {
      const participantName = participants.find(p => p.id === participantId)?.name
      if (participantName) {
        const updatedDetails = {
          ...historyItem.details,
          participantEmails: {
            ...historyItem.details.participantEmails,
            [participantName]: tempEmail.trim()
          }
        }
        
        historyService.update(historyItem.id, { details: updatedDetails })
        
        // historyItem 상태도 업데이트
        setHistoryItem(prev => prev ? {
          ...prev,
          details: updatedDetails
        } : null)
      }
    }

    cancelEditingEmail()
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl" data-testid="result-page">
      <div className="space-y-6">
        {/* 결과 요약 */}
        <Card>
          <CardHeader>
            <CardTitle data-testid="result-title">{historyItem?.name} - 계산 결과</CardTitle>
            <p className="text-muted-foreground">
              {historyItem?.date} • 총 {totalAmount.toLocaleString()}원이 {participants.length}명에게 분할되었습니다.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((participant, index) => {
                const amount = calculateParticipantTotal(participant.id)
                return (
                  <Card key={participant.id} data-testid={`participant-result-${index}`} className="p-4 text-center">
                    <h3 className="font-semibold text-lg mb-2">{participant.name}</h3>
                    <Badge variant="outline" className="text-lg px-3 py-1" data-testid={`amount-${index}`}>
                      {amount.toLocaleString()}원
                    </Badge>
                    <div className="mt-2">
                      {editingEmail === participant.id ? (
                        <div className="flex flex-col gap-2">
                          <Input
                            type="email"
                            value={tempEmail}
                            onChange={(e) => setTempEmail(e.target.value)}
                            placeholder="이메일 주소 입력"
                            className="text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateParticipantEmail(participant.id)
                              } else if (e.key === 'Escape') {
                                cancelEditingEmail()
                              }
                            }}
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => updateParticipantEmail(participant.id)}
                              className="flex-1"
                            >
                              저장
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditingEmail}
                              className="flex-1"
                            >
                              취소
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditingEmail(participant.id, participant.email)}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {participant.email || '이메일 추가하기'}
                        </button>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 상세 내역 */}
        <Card>
          <CardHeader>
            <CardTitle>상세 내역</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billItems.map((item, index) => (
                <div key={item.id} data-testid={`item-detail-${index}`} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.price.toLocaleString()}원 x {item.quantity} = {(item.price * item.quantity).toLocaleString()}원
                      </p>
                    </div>
                    <Badge variant="secondary">{item.category}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">분담:</span>
                    {item.assignedParticipants?.map(participantId => {
                      const participant = participants.find(p => p.id === participantId)
                      const sharedAmount = (item.price * item.quantity) / (item.assignedParticipants?.length || 1)
                      return (
                        <Badge key={participantId} variant="outline" className="text-xs">
                          {participant?.name} ({sharedAmount.toLocaleString()}원)
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 결과 공유 */}
        {isShared && (
          <Card data-testid="share-confirmation" className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-blue-800">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  {shareMessage.includes('클립보드') ? '📋' : shareMessage.includes('모바일') ? '📱' : '📤'} 
                  공유 완료!
                </h3>
                <div className="text-sm bg-blue-100 p-3 rounded-lg whitespace-pre-wrap">
                  {shareMessage}
                </div>
                {shareMessage.includes('클립보드') && (
                  <div className="mt-2 text-xs text-blue-600">
                    💡 카카오톡, 문자메시지, 이메일 등에서 Ctrl+V로 붙여넣기 할 수 있습니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 액션 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ShinyButton
            data-testid="send-results-button"
            onClick={openSendModal}
            variant="default"
            className="h-12"
          >
            📤 정산 결과 전송
          </ShinyButton>
          
          <Button
            data-testid="save-to-archive-button"
            onClick={saveToArchive}
            variant="outline"
            className="h-12"
          >
            📦 아카이브에 저장
          </Button>
        </div>

        {/* 추가 옵션 */}
        <Card>
          <CardHeader>
            <CardTitle>추가 옵션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                data-testid="export-pdf-button"
                variant="outline"
                onClick={() => console.log('Exporting to PDF...')}
              >
                PDF로 내보내기
              </Button>
              <Button
                data-testid="new-calculation-button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                새 계산 시작
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 전송 방법 선택 모달 */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-center">📤 전송 방법 선택</CardTitle>
                <p className="text-sm text-muted-foreground text-center">
                  정산 결과를 어떻게 전송하시겠습니까?
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* 클립보드 복사 */}
                  <button
                    onClick={() => setSendMethod('clipboard')}
                    className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                      sendMethod === 'clipboard'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📋</div>
                      <div>
                        <div className="font-semibold">클립보드 복사</div>
                        <div className="text-sm text-muted-foreground">
                          복사 후 원하는 앱에서 붙여넣기
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* 이메일 전송 */}
                  <button
                    onClick={() => setSendMethod('email')}
                    className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                      sendMethod === 'email'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📧</div>
                      <div>
                        <div className="font-semibold">이메일 전송</div>
                        <div className="text-sm text-muted-foreground">
                          참가자별 개별 이메일 발송
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* 카카오톡 공유 */}
                  <button
                    onClick={() => setSendMethod('kakao')}
                    className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                      sendMethod === 'kakao'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">💬</div>
                      <div>
                        <div className="font-semibold">카카오톡 공유</div>
                        <div className="text-sm text-muted-foreground">
                          카카오톡으로 바로 공유하기
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowSendModal(false)}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={sendResults}
                    className="flex-1"
                  >
                    전송하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultPage