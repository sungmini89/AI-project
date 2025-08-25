import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertCircle, 
  CheckCircle, 
  Globe, 
  Key, 
  Settings, 
  Smartphone, 
  Wifi, 
  WifiOff,
  HelpCircle,
  ExternalLink 
} from 'lucide-react';
import { freeAIService, type APIMode, type AIServiceConfig, type UsageStats } from '@/services/freeAIService';

interface APISettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigUpdate?: () => void;
}

export function APISettingsDialog({ open, onOpenChange, onConfigUpdate }: APISettingsDialogProps) {
  const [config, setConfig] = useState<AIServiceConfig | null>(null);
  const [customApiKey, setCustomApiKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedMode, setSelectedMode] = useState<APIMode | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  useEffect(() => {
    if (open) {
      loadConfig();
    }
  }, [open]);

  const loadConfig = () => {
    const currentConfig = freeAIService.getConfig();
    const currentUsage = freeAIService.getUsage();
    setConfig(currentConfig);
    setSelectedMode(currentConfig.mode);
    setUsageStats(currentUsage);
    setCustomApiKey(currentConfig.apiKey || '');
  };

  const handleModeSelect = (mode: APIMode) => {
    setSelectedMode(mode);
  };

  const handleApplySettings = () => {
    if (!config || !selectedMode) return;
    
    const updatedConfig = { ...config, mode: selectedMode };
    setConfig(updatedConfig);
    freeAIService.updateConfig(updatedConfig);
    onConfigUpdate?.();
    onOpenChange(false);
  };

  const handleCustomKeySubmit = async () => {
    if (!customApiKey.trim()) {
      setTestResult({ success: false, message: 'API 키를 입력해주세요' });
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const success = freeAIService.setCustomAPIKey(selectedProvider, customApiKey);
      
      if (success) {
        setTestResult({ 
          success: true, 
          message: 'API 키가 성공적으로 설정되었습니다' 
        });
        loadConfig(); // 설정 새로고침
        onConfigUpdate?.();
      } else {
        setTestResult({ 
          success: false, 
          message: '유효하지 않은 API 키입니다' 
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: 'API 키 설정 중 오류가 발생했습니다' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuotaChange = (field: 'dailyLimit' | 'monthlyLimit', value: string) => {
    if (!config) return;
    
    const numValue = parseInt(value) || 0;
    const updatedConfig = { ...config, [field]: numValue };
    setConfig(updatedConfig);
    freeAIService.updateConfig(updatedConfig);
    onConfigUpdate?.();
  };

  const getModeInfo = (mode: APIMode) => {
    switch (mode) {
      case 'mock':
        return {
          icon: <Smartphone className="h-5 w-5" />,
          title: '개발 모드',
          description: '개발용 모의 데이터를 사용합니다. 실제 API 호출 없이 테스트할 수 있습니다.',
          pros: ['API 키 불필요', '무제한 테스트', '빠른 응답'],
          cons: ['실제 AI 분석 없음', '고정된 결과']
        };
      case 'offline':
        return {
          icon: <WifiOff className="h-5 w-5" />,
          title: '오프라인 모드',
          description: '로컬 알고리즘만 사용하여 분석합니다. 인터넷 연결이 불필요합니다.',
          pros: ['개인정보 보호', '비용 없음', '빠른 처리'],
          cons: ['제한된 인사이트', 'AI 기능 없음']
        };
      case 'free':
        return {
          icon: <Globe className="h-5 w-5" />,
          title: '무료 API',
          description: '무료 API 서비스를 사용합니다. 일일 사용량 제한이 있습니다.',
          pros: ['AI 인사이트', '비용 효율적', '쉬운 설정'],
          cons: ['사용량 제한', '대기 시간 가능']
        };
      case 'custom':
        return {
          icon: <Wifi className="h-5 w-5" />,
          title: '사용자 API',
          description: '사용자가 제공한 API 키를 사용합니다. 더 나은 성능과 높은 한도를 제공합니다.',
          pros: ['높은 한도', '빠른 응답', '고급 기능'],
          cons: ['API 키 필요', '비용 발생 가능']
        };
      default:
        return {
          icon: <HelpCircle className="h-5 w-5" />,
          title: '알 수 없음',
          description: '',
          pros: [],
          cons: []
        };
    }
  };

  const providerInfo = {
    openai: {
      name: 'OpenAI',
      description: 'GPT 모델을 사용한 고품질 분석',
      keyFormat: 'sk-proj-...',
      link: 'https://platform.openai.com/api-keys'
    },
    cohere: {
      name: 'Cohere',
      description: 'Cohere 분류 모델을 사용한 텍스트 분석',
      keyFormat: 'co-...',
      link: 'https://dashboard.cohere.ai/api-keys'
    },
    gemini: {
      name: 'Google Gemini',
      description: 'Google의 Gemini 모델을 사용한 분석',
      keyFormat: 'AI...',
      link: 'https://aistudio.google.com/app/apikey'
    },
    huggingface: {
      name: 'Hugging Face',
      description: '다양한 오픈소스 모델 사용',
      keyFormat: 'hf_...',
      link: 'https://huggingface.co/settings/tokens'
    }
  };

  if (!config) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>AI 분석 설정</span>
          </DialogTitle>
          <DialogDescription>
            분석 모드와 API 설정을 관리합니다
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="mode" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mode">분석 모드</TabsTrigger>
            <TabsTrigger value="apikey">API 키</TabsTrigger>
          </TabsList>

          <TabsContent value="mode" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['mock', 'offline', 'free', 'custom'] as APIMode[]).map((mode) => {
                const modeInfo = getModeInfo(mode);
                const isCurrentMode = config.mode === mode;
                const isSelectedMode = selectedMode === mode;
                
                return (
                  <Card 
                    key={mode} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelectedMode ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleModeSelect(mode)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {modeInfo.icon}
                          <CardTitle className="text-sm">{modeInfo.title}</CardTitle>
                        </div>
                        {isCurrentMode && (
                          <Badge variant="default" className="text-xs">
                            현재
                          </Badge>
                        )}
                        {isSelectedMode && !isCurrentMode && (
                          <Badge variant="secondary" className="text-xs">
                            선택됨
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs mb-3">
                        {modeInfo.description}
                      </CardDescription>
                      
                      {modeInfo.pros.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs text-green-600 dark:text-green-400">
                            장점:
                          </div>
                          <ul className="text-xs space-y-1">
                            {modeInfo.pros.map((pro, index) => (
                              <li key={index} className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 설정 적용 버튼 */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <Button 
                onClick={handleApplySettings}
                disabled={!selectedMode || selectedMode === config.mode}
              >
                설정 적용
              </Button>
            </div>

            {/* 사용량 제한 설정 */}
            {(config.mode === 'free' || config.mode === 'custom') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">사용량 제한 및 추적</CardTitle>
                  <CardDescription className="text-xs">
                    일일 및 월간 API 호출 제한을 설정하고 현재 사용량을 확인합니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 현재 사용량 표시 */}
                  {usageStats && (
                    <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">현재 사용량</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-xs">일일 사용량</div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {usageStats.daily} / {config.dailyLimit || 100}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {Math.round((usageStats.daily / (config.dailyLimit || 100)) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={(usageStats.daily / (config.dailyLimit || 100)) * 100} 
                            className="h-2"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs">월간 사용량</div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {usageStats.monthly} / {config.monthlyLimit || 1000}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {Math.round((usageStats.monthly / (config.monthlyLimit || 1000)) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={(usageStats.monthly / (config.monthlyLimit || 1000)) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        마지막 리셋: {usageStats.lastReset}
                      </div>
                    </div>
                  )}
                  
                  {/* 제한 설정 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dailyLimit" className="text-xs">일일 제한</Label>
                      <Input
                        id="dailyLimit"
                        type="number"
                        value={config.dailyLimit || 100}
                        onChange={(e) => handleQuotaChange('dailyLimit', e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyLimit" className="text-xs">월간 제한</Label>
                      <Input
                        id="monthlyLimit"
                        type="number"
                        value={config.monthlyLimit || 1000}
                        onChange={(e) => handleQuotaChange('monthlyLimit', e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  
                  {/* 한도 초과 경고 */}
                  {usageStats && (usageStats.daily >= (config.dailyLimit || 100) || usageStats.monthly >= (config.monthlyLimit || 1000)) && (
                    <div className="flex items-center space-x-2 p-2 rounded-md text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        {usageStats.daily >= (config.dailyLimit || 100) ? '일일 ' : ''}
                        {usageStats.monthly >= (config.monthlyLimit || 1000) ? '월간 ' : ''}
                        한도에 도달했습니다. 추가 요청은 오프라인 모드로 처리됩니다.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="apikey" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>API 키 설정</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  사용자 API 키를 설정하여 더 나은 분석 성능을 얻으세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider" className="text-xs">API 제공업체</Label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(providerInfo).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex flex-col">
                            <span className="font-medium">{info.name}</span>
                            <span className="text-xs text-muted-foreground">{info.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apikey" className="text-xs flex items-center justify-between">
                    <span>API 키</span>
                    <a
                      href={providerInfo[selectedProvider as keyof typeof providerInfo].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center space-x-1"
                    >
                      <span>키 발급받기</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Label>
                  <Input
                    id="apikey"
                    type="password"
                    placeholder={`예: ${providerInfo[selectedProvider as keyof typeof providerInfo].keyFormat}`}
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="text-xs"
                  />
                  <div className="text-xs text-muted-foreground">
                    API 키는 브라우저에 안전하게 저장되며, 서버로 전송되지 않습니다.
                  </div>
                </div>

                <Button 
                  onClick={handleCustomKeySubmit} 
                  disabled={loading || !customApiKey.trim()}
                  className="w-full text-xs"
                >
                  {loading ? '설정 중...' : 'API 키 설정'}
                </Button>

                {testResult && (
                  <div className={`flex items-center space-x-2 p-2 rounded-md text-xs ${
                    testResult.success 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>주의사항:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>API 키는 유료 서비스일 수 있습니다</li>
                    <li>사용량에 따라 요금이 부과될 수 있습니다</li>
                    <li>API 키는 안전하게 보관하고 타인과 공유하지 마세요</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </DialogContent>
    </Dialog>
  );
}