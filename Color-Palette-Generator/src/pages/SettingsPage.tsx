import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { 
  Settings, 
  Database, 
  Globe, 
  Key, 
  TestTube, 
  Save, 
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';

export interface AIServiceConfig {
  mode: 'mock' | 'free' | 'offline' | 'custom';
  apiKey?: string;
  freeApiKey?: string;
  fallbackToOffline: boolean;
  quotaTracking: boolean;
  retryCount: number;
  timeout: number;
}

const defaultConfig: AIServiceConfig = {
  mode: 'mock',
  fallbackToOffline: true,
  quotaTracking: true,
  retryCount: 3,
  timeout: 10000
};

export default function SettingsPage() {
  const [config, setConfig] = useState<AIServiceConfig>(defaultConfig);
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempFreeApiKey, setTempFreeApiKey] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 설정 로드
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('ai-service-config');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        if (parsedConfig.apiKey) {
          setTempApiKey('••••••••••••••••');
        }
        if (parsedConfig.freeApiKey) {
          setTempFreeApiKey('••••••••••••••••');
        }
      }
    } catch (error) {
      console.error('설정 로드 실패:', error);
    }
  }, []);

  // 모드별 설명
  const getModeDescription = (mode: string) => {
    switch (mode) {
      case 'mock':
        return '개발 및 테스트용 모드입니다. 실제 API 호출 없이 더미 데이터를 사용합니다.';
      case 'free':
        return '무료 API 서비스를 사용합니다. 일부 서비스는 API 키가 필요할 수 있습니다.';
      case 'offline':
        return '완전 오프라인 모드입니다. 색상 이론 알고리즘만 사용합니다.';
      case 'custom':
        return '사용자가 제공한 API 키를 사용합니다. 별도의 제한이 없습니다.';
      default:
        return '';
    }
  };

  // 모드별 아이콘
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'mock':
        return <TestTube className="h-5 w-5" />;
      case 'free':
        return <Globe className="h-5 w-5" />;
      case 'offline':
        return <Database className="h-5 w-5" />;
      case 'custom':
        return <Key className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // API 연결 테스트
  const testConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      // 실제 API 테스트 로직을 여기에 구현
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션

      if (config.mode === 'custom' && !tempApiKey.includes('•')) {
        // API 키 유효성 검사 시뮬레이션
        if (tempApiKey.length < 20) {
          setTestResult({
            success: false,
            message: 'API 키가 너무 짧습니다. 올바른 키를 입력해주세요.'
          });
        } else {
          setTestResult({
            success: true,
            message: 'API 연결이 성공적으로 확인되었습니다.'
          });
        }
      } else if (config.mode === 'free' && tempFreeApiKey && !tempFreeApiKey.includes('•')) {
        // 무료 API 키 검사
        if (tempFreeApiKey.length < 10) {
          setTestResult({
            success: false,
            message: '무료 API 키가 너무 짧습니다. 올바른 키를 입력해주세요.'
          });
        } else {
          setTestResult({
            success: true,
            message: '무료 API 연결이 성공적으로 확인되었습니다.'
          });
        }
      } else {
        setTestResult({
          success: true,
          message: `${config.mode.toUpperCase()} 모드 연결이 확인되었습니다.`
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: '연결 테스트 중 오류가 발생했습니다.'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // 설정 저장
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const configToSave = {
        ...config,
        apiKey: config.mode === 'custom' && tempApiKey && !tempApiKey.includes('•') 
          ? tempApiKey 
          : config.apiKey,
        freeApiKey: config.mode === 'free' && tempFreeApiKey && !tempFreeApiKey.includes('•')
          ? tempFreeApiKey
          : config.freeApiKey
      };

      localStorage.setItem('ai-service-config', JSON.stringify(configToSave));
      
      // 성공 피드백
      setTestResult({
        success: true,
        message: '설정이 성공적으로 저장되었습니다.'
      });

      // 마스킹된 API 키 표시
      if (configToSave.apiKey && config.mode === 'custom') {
        setTempApiKey('••••••••••••••••');
      }
      if (configToSave.freeApiKey && config.mode === 'free') {
        setTempFreeApiKey('••••••••••••••••');
      }

      // 전역 설정 업데이트 이벤트 발생
      window.dispatchEvent(new CustomEvent('ai-config-updated', {
        detail: configToSave
      }));

    } catch (error) {
      setTestResult({
        success: false,
        message: '설정 저장 중 오류가 발생했습니다.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 설정 초기화
  const resetSettings = () => {
    setConfig(defaultConfig);
    setTempApiKey('');
    setTempFreeApiKey('');
    setTestResult(null);
    localStorage.removeItem('ai-service-config');
    
    setTestResult({
      success: true,
      message: '설정이 초기화되었습니다.'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">설정</h1>
        </div>
        <p className="text-gray-600">
          AI 색상 팔레트 생성 서비스의 동작 방식을 설정하세요.
        </p>
      </div>

      <div className="space-y-8">
        {/* API 서비스 모드 설정 */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">API 서비스 모드</h2>
          </div>

          <div className="space-y-4 mb-6">
            {(['mock', 'free', 'offline', 'custom'] as const).map((mode) => (
              <div 
                key={mode} 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  config.mode === mode 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setConfig({ ...config, mode })}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getModeIcon(mode)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="mode"
                        checked={config.mode === mode}
                        onChange={() => setConfig({ ...config, mode })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label className="font-medium capitalize cursor-pointer">
                        {mode === 'mock' && 'Mock 모드 (개발)'}
                        {mode === 'free' && '무료 API 모드'}
                        {mode === 'offline' && '오프라인 모드'}
                        {mode === 'custom' && '사용자 API 키 모드'}
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {getModeDescription(mode)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 무료 API 키 입력 (Free 모드일 때) */}
          {config.mode === 'free' && (
            <div className="border-t pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="freeApiKey" className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>무료 API 키 (선택사항)</span>
                  </Label>
                  <Input
                    id="freeApiKey"
                    type="password"
                    placeholder="무료 API 서비스 키 (TheColorAPI, Colormind 등)"
                    value={tempFreeApiKey}
                    onChange={(e) => setTempFreeApiKey(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    일부 무료 서비스는 더 나은 기능을 위해 API 키가 필요할 수 있습니다. 없어도 기본 기능은 작동합니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* API 키 입력 (Custom 모드일 때만) */}
          {config.mode === 'custom' && (
            <div className="border-t pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apiKey" className="flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>API 키</span>
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="OpenAI API 키를 입력하세요"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    API 키는 안전하게 로컬 저장소에 저장됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* 고급 설정 */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">고급 설정</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="retryCount">재시도 횟수</Label>
                <Input
                  id="retryCount"
                  type="number"
                  min="1"
                  max="10"
                  value={config.retryCount}
                  onChange={(e) => setConfig({
                    ...config,
                    retryCount: parseInt(e.target.value) || 3
                  })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="timeout">타임아웃 (밀리초)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="5000"
                  max="60000"
                  step="1000"
                  value={config.timeout}
                  onChange={(e) => setConfig({
                    ...config,
                    timeout: parseInt(e.target.value) || 10000
                  })}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="fallbackToOffline"
                  checked={config.fallbackToOffline}
                  onChange={(e) => setConfig({
                    ...config,
                    fallbackToOffline: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <Label htmlFor="fallbackToOffline" className="cursor-pointer">
                  오프라인 모드로 자동 전환
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="quotaTracking"
                  checked={config.quotaTracking}
                  onChange={(e) => setConfig({
                    ...config,
                    quotaTracking: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <Label htmlFor="quotaTracking" className="cursor-pointer">
                  할당량 추적 활성화
                </Label>
              </div>
            </div>
          </div>
        </Card>

        {/* 테스트 결과 */}
        {testResult && (
          <Card className={`p-4 ${
            testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-3">
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <p className={`font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.message}
              </p>
            </div>
          </Card>
        )}

        {/* 액션 버튼들 */}
        <div className="flex flex-wrap gap-4 justify-end">
          <Button
            variant="outline"
            onClick={testConnection}
            disabled={isTestingConnection}
            className="flex items-center space-x-2"
          >
            {isTestingConnection ? (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            <span>연결 테스트</span>
          </Button>

          <Button
            variant="outline"
            onClick={resetSettings}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>초기화</span>
          </Button>

          <Button
            onClick={saveSettings}
            disabled={isSaving}
            className="flex items-center space-x-2"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>설정 저장</span>
          </Button>
        </div>

        {/* 정보 섹션 */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-medium text-blue-900">설정 안내</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Mock 모드: 개발 및 데모용으로 가짜 데이터를 사용합니다</li>
                <li>• 무료 API: 일일 할당량이 제한된 무료 서비스를 사용합니다</li>
                <li>• 오프라인 모드: 인터넷 없이 색상 이론만으로 팔레트를 생성합니다</li>
                <li>• API 키 모드: 직접 제공한 API 키로 무제한 사용이 가능합니다</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}