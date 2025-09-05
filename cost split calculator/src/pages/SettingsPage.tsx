import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, User, Bell, Shield, Download, Trash2, Brain, Key, Cpu } from 'lucide-react'
import { freeAIService, type AIServiceConfig } from '@/services/freeAIService'

export const SettingsPage = () => {
  const [config, setConfig] = useState<AIServiceConfig>(freeAIService.getConfig())
  const [customApiKey, setCustomApiKey] = useState('')
  const [usageInfo, setUsageInfo] = useState(freeAIService.getUsageInfo())
  
  // 개별 설정 상태들 추가
  const [notifications, setNotifications] = useState({
    calculation: true,
    settlement: true,
    updates: false
  })
  
  const [privacy, setPrivacy] = useState({
    autoBackup: true,
    analytics: false,
    cloudSync: false
  })
  
  useEffect(() => {
    const interval = setInterval(() => {
      setUsageInfo(freeAIService.getUsageInfo())
    }, 5000) // 5초마다 사용량 갱신
    
    return () => clearInterval(interval)
  }, [])

  const handleModeChange = (mode: AIServiceConfig['mode']) => {
    const newConfig = { ...config, mode }
    setConfig(newConfig)
    freeAIService.updateConfig(newConfig)
  }

  const handleApiKeyChange = (apiKey: string) => {
    setCustomApiKey(apiKey)
    if (config.mode === 'custom') {
      const newConfig = { ...config, apiKey }
      setConfig(newConfig)
      freeAIService.updateConfig(newConfig)
    }
  }

  const handleFallbackToggle = () => {
    const newConfig = { ...config, fallbackToOffline: !config.fallbackToOffline }
    setConfig(newConfig)
    freeAIService.updateConfig(newConfig)
  }

  const resetUsage = () => {
    freeAIService.resetUsage()
    setUsageInfo(freeAIService.getUsageInfo())
  }

  // 알림 설정 토글 핸들러들
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // 개인정보 설정 토글 핸들러들
  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // 데이터 관리 핸들러들
  const handleDataExport = () => {
    const mockData = {
      calculations: [],
      settings: { notifications, privacy, aiConfig: config },
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `smart-split-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleAppReset = () => {
    if (confirm('앱을 초기화하시겠습니까? 설정이 모두 기본값으로 되돌아갑니다.')) {
      setNotifications({ calculation: true, settlement: true, updates: false })
      setPrivacy({ autoBackup: true, analytics: false, cloudSync: false })
      const defaultConfig = { mode: 'offline' as const, fallbackToOffline: true }
      setConfig(defaultConfig)
      freeAIService.updateConfig(defaultConfig)
      alert('앱이 초기화되었습니다.')
    }
  }

  const handleDeleteAllData = () => {
    if (confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      if (confirm('마지막 확인: 계산 기록, 설정 등 모든 데이터가 영구 삭제됩니다.')) {
        localStorage.clear()
        sessionStorage.clear()
        alert('모든 데이터가 삭제되었습니다. 페이지가 새로고침됩니다.')
        window.location.reload()
      }
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl" data-testid="settings-page">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tech-title mb-2">설정</h1>
          <p className="text-muted-foreground tech-subtitle">앱 설정 및 환경설정</p>
        </div>

        <Card className="steel-panel hud-element">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary glow-orange" />
              <CardTitle className="tech-title">AI 분석 설정</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="tech-display rounded p-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">AI 분석 모드</label>
                  <Select value={config.mode} onValueChange={handleModeChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="AI 모드 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offline">
                        <div className="flex items-center space-x-2">
                          <Cpu className="h-4 w-4" />
                          <div>
                            <div>오프라인 모드</div>
                            <div className="text-xs text-muted-foreground">규칙 기반 분석 (무료)</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="mock">
                        <div className="flex items-center space-x-2">
                          <Settings className="h-4 w-4" />
                          <div>
                            <div>Mock 모드</div>
                            <div className="text-xs text-muted-foreground">개발/테스트용</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="free">
                        <div className="flex items-center space-x-2">
                          <Brain className="h-4 w-4" />
                          <div>
                            <div>무료 AI 모드</div>
                            <div className="text-xs text-muted-foreground">제한된 AI 분석</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="custom">
                        <div className="flex items-center space-x-2">
                          <Key className="h-4 w-4" />
                          <div>
                            <div>사용자 API 키</div>
                            <div className="text-xs text-muted-foreground">개인 API 키 사용</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.mode === 'custom' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Gemini API 키</label>
                    <Input
                      type="password"
                      placeholder="Google Gemini API 키를 입력하세요"
                      value={customApiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      API 키는 로컬에만 저장됩니다. Google AI Studio에서 발급받으실 수 있습니다.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">오프라인 대체 모드</span>
                    <p className="text-xs text-muted-foreground">API 실패 시 오프라인 모드로 대체</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleFallbackToggle}
                  >
                    {config.fallbackToOffline ? 'ON' : 'OFF'}
                  </Button>
                </div>

                {config.mode === 'free' && usageInfo.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">API 사용량</span>
                      <Button variant="ghost" size="sm" onClick={resetUsage}>
                        초기화
                      </Button>
                    </div>
                    {usageInfo.map((info) => (
                      <div key={info.service} className="text-xs space-y-1 mb-2">
                        <div className="flex justify-between">
                          <span className="capitalize">{info.service}</span>
                          <span>{info.dailyUsed}/{info.dailyLimit}</span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-1">
                          <div 
                            className="bg-primary h-1 rounded-full transition-all" 
                            style={{ width: `${(info.dailyUsed / info.dailyLimit) * 100}%` }}
                          />
                        </div>
                        <div className="text-muted-foreground">
                          리셋: {info.resetTime}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="steel-panel hud-element">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary glow-orange" />
              <CardTitle className="tech-title">계정 설정</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="tech-display rounded p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">사용자 이름</label>
                  <div className="mt-1 p-2 bg-muted/30 rounded text-sm">익명 사용자</div>
                </div>
                <div>
                  <label className="text-sm font-medium">언어</label>
                  <div className="mt-1 p-2 bg-muted/30 rounded text-sm">한국어</div>
                </div>
                <div>
                  <label className="text-sm font-medium">통화</label>
                  <div className="mt-1 p-2 bg-muted/30 rounded text-sm">KRW (₩)</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="steel-panel hud-element">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary glow-orange" />
              <CardTitle className="tech-title">알림 설정</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="tech-display rounded p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">계산 완료 알림</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleNotification('calculation')}
                    className={notifications.calculation ? 'bg-green-900/50 text-green-300' : ''}
                  >
                    {notifications.calculation ? 'ON' : 'OFF'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">정산 알림</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleNotification('settlement')}
                    className={notifications.settlement ? 'bg-green-900/50 text-green-300' : ''}
                  >
                    {notifications.settlement ? 'ON' : 'OFF'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">앱 업데이트 알림</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleNotification('updates')}
                    className={notifications.updates ? 'bg-green-900/50 text-green-300' : ''}
                  >
                    {notifications.updates ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="steel-panel hud-element">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary glow-orange" />
              <CardTitle className="tech-title">개인정보 및 보안</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="tech-display rounded p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">데이터 자동 백업</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => togglePrivacy('autoBackup')}
                    className={privacy.autoBackup ? 'bg-green-900/50 text-green-300' : ''}
                  >
                    {privacy.autoBackup ? 'ON' : 'OFF'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">분석 데이터 수집</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => togglePrivacy('analytics')}
                    className={privacy.analytics ? 'bg-green-900/50 text-green-300' : ''}
                  >
                    {privacy.analytics ? 'ON' : 'OFF'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">클라우드 동기화</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => togglePrivacy('cloudSync')}
                    className={privacy.cloudSync ? 'bg-green-900/50 text-green-300' : ''}
                  >
                    {privacy.cloudSync ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="steel-panel hud-element">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-primary glow-orange" />
              <CardTitle className="tech-title">데이터 관리</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleDataExport}
              >
                <Download className="h-4 w-4 mr-2" />
                데이터 내보내기
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleAppReset}
              >
                <Settings className="h-4 w-4 mr-2" />
                앱 초기화
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive"
                onClick={handleDeleteAllData}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                모든 데이터 삭제
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="steel-panel">
          <CardHeader>
            <CardTitle className="tech-title">앱 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tech-display rounded p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">버전</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">빌드</span>
                  <span>2024.01.15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">개발자</span>
                  <span>Smart Split Team</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage