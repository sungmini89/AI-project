import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle, Book, MessageCircle, Mail, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const HelpPage = () => {
  const handleEmailContact = () => {
    window.open('mailto:support@smartsplit.com', '_blank')
  }

  const handleWebsiteVisit = () => {
    window.open('https://smartsplit.example.com/help', '_blank')
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl" data-testid="help-page">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tech-title mb-2">도움말</h1>
          <p className="text-muted-foreground tech-subtitle">사용법 및 자주 묻는 질문</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="steel-panel hud-element">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Book className="h-5 w-5 text-primary glow-orange" />
                <CardTitle className="tech-title">사용 가이드</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="tech-display rounded p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-sm mb-2">1단계: 영수증 업로드</h3>
                    <p className="text-xs text-muted-foreground">영수증 사진을 찍거나 갤러리에서 선택하여 업로드하세요.</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-2">2단계: OCR 처리</h3>
                    <p className="text-xs text-muted-foreground">AI가 자동으로 영수증 내용을 인식하고 분석합니다.</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-2">3단계: 참가자 설정</h3>
                    <p className="text-xs text-muted-foreground">참가자를 추가하고 각 항목을 누구에게 할당할지 설정합니다.</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-2">4단계: 결과 확인</h3>
                    <p className="text-xs text-muted-foreground">계산 결과를 확인하고 저장 또는 공유합니다.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="steel-panel hud-element">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-primary glow-orange" />
                <CardTitle className="tech-title">자주 묻는 질문</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="tech-display rounded p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm mb-1">Q: OCR 인식이 정확하지 않아요</h3>
                    <p className="text-xs text-muted-foreground">영수증을 잘 보이도록 촬영하고, 조명이 충분한 곳에서 찍어보세요. 수동으로 항목을 수정할 수도 있습니다.</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-1">Q: 데이터가 저장되나요?</h3>
                    <p className="text-xs text-muted-foreground">모든 데이터는 기기 내에서만 저장되며, 외부로 전송되지 않습니다.</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-1">Q: 여러 명이 동시에 사용할 수 있나요?</h3>
                    <p className="text-xs text-muted-foreground">현재는 단일 기기에서만 사용 가능하며, 결과 공유 기능을 통해 다른 사람과 결과를 나눌 수 있습니다.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="steel-panel hud-element">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary glow-orange" />
              <CardTitle className="tech-title">지원 및 문의</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center justify-start space-x-2 h-auto p-4"
                onClick={handleEmailContact}
              >
                <Mail className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">이메일 문의</div>
                  <div className="text-sm text-muted-foreground">support@smartsplit.com</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-start space-x-2 h-auto p-4"
                onClick={handleWebsiteVisit}
              >
                <ExternalLink className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">온라인 도움말</div>
                  <div className="text-sm text-muted-foreground">웹사이트 방문</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="steel-panel">
          <CardHeader>
            <CardTitle className="tech-title">팁과 요령</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tech-display rounded p-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-sm">영수증 촬영 시 주의사항</h3>
                    <p className="text-xs text-muted-foreground mt-1">영수증 전체가 화면에 들어오도록 하고, 그림자가 지지 않도록 촬영하세요.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-sm">템플릿 활용하기</h3>
                    <p className="text-xs text-muted-foreground mt-1">자주 만나는 그룹의 분할 설정을 템플릿으로 저장해두면 매번 설정할 필요가 없어 편리합니다.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-sm">결과 저장하기</h3>
                    <p className="text-xs text-muted-foreground mt-1">계산 결과를 저장해두면 나중에 히스토리에서 다시 확인할 수 있습니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HelpPage