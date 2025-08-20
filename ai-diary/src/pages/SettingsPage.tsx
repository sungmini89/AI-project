import React, { useState, useEffect } from 'react';
import { 
  Settings,
  Moon,
  Sun,
  Bell,
  Shield,
  Download,
  Upload,
  Trash2,
  Database,
  Globe,
  Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { databaseService, AppSettings } from '../services/databaseService';
import { emotionAnalysisService } from '../services/emotionAnalysisService';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [usageStats, setUsageStats] = useState({
    daily: 0,
    monthly: 0,
    lastReset: ''
  });

  useEffect(() => {
    loadSettings();
    loadUsageStats();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await databaseService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('설정 로드 실패:', error);
      // 기본값 설정
      const defaultSettings: AppSettings = {
        theme: 'light',
        language: 'ko',
        autoSave: true,
        autoSaveInterval: 30000,
        backupEnabled: true,
        analysisMode: 'offline',
        reminderEnabled: false,
        reminderTime: '20:00',
        privacyMode: false,
        exportFormat: 'json',
      };
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsageStats = () => {
    const stats = emotionAnalysisService.getUsageStats();
    setUsageStats(stats);
  };

  const handleSettingChange = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await databaseService.updateSettings(settings);
      
      // 테마 적용
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      
      // AI 서비스 설정 업데이트
      emotionAnalysisService.updateConfig({
        mode: settings.analysisMode as any,
        fallbackToOffline: true,
      });
      
      toast.success('설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      toast.error('설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    try {
      const backupId = await databaseService.createBackup();
      const backup = await databaseService.db.backups.get(backupId);
      
      if (backup) {
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-diary-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        toast.success('데이터가 내보내기되었습니다.');
      }
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
      toast.error('데이터 내보내기에 실패했습니다.');
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);
      
      // 백업 데이터 검증
      if (!backupData.entries || !backupData.emotions) {
        throw new Error('잘못된 백업 파일 형식입니다.');
      }
      
      // 데이터 복원 확인
      if (!confirm('기존 데이터가 모두 삭제되고 백업 데이터로 복원됩니다. 계속하시겠습니까?')) {
        return;
      }
      
      // 백업 생성 후 복원
      const backupId = await databaseService.db.backups.add(backupData);
      await databaseService.restoreBackup(backupId);
      
      toast.success('데이터가 성공적으로 복원되었습니다.');
    } catch (error) {
      console.error('데이터 가져오기 실패:', error);
      toast.error('데이터 가져오기에 실패했습니다.');
    }
    
    // 파일 입력 초기화
    event.target.value = '';
  };

  const clearAllData = async () => {
    if (!confirm('모든 일기와 데이터가 영구적으로 삭제됩니다. 정말 계속하시겠습니까?')) {
      return;
    }
    
    if (!confirm('이 작업은 되돌릴 수 없습니다. 정말로 모든 데이터를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      await databaseService.clearAllData();
      emotionAnalysisService.resetUsage();
      toast.success('모든 데이터가 삭제되었습니다.');
      loadUsageStats();
    } catch (error) {
      console.error('데이터 삭제 실패:', error);
      toast.error('데이터 삭제에 실패했습니다.');
    }
  };

  const resetUsageStats = () => {
    emotionAnalysisService.resetUsage();
    loadUsageStats();
    toast.success('사용량 통계가 초기화되었습니다.');
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">설정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">설정</h1>
          <p className="text-gray-600 dark:text-gray-400">
            앱의 동작 방식과 개인 정보를 관리하세요
          </p>
        </div>

        <div className="space-y-6">
          {/* 일반 설정 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Settings className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                일반 설정
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 테마 설정 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {settings.theme === 'dark' ? (
                    <Moon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Sun className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">테마</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">앱의 외관을 설정합니다</p>
                  </div>
                </div>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value as 'light' | 'dark' | 'auto')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="light">라이트</option>
                  <option value="dark">다크</option>
                  <option value="auto">자동</option>
                </select>
              </div>

              {/* 언어 설정 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">언어</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">인터페이스 언어를 설정합니다</p>
                  </div>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value as 'ko' | 'en')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
              </div>

              {/* 자동 저장 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Save className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">자동 저장</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">일기 작성 중 자동으로 저장합니다</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.autoSave && (
                <div className="flex items-center justify-between pl-8">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">자동 저장 간격</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      현재: {settings.autoSaveInterval / 1000}초
                    </p>
                  </div>
                  <select
                    value={settings.autoSaveInterval}
                    onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value={15000}>15초</option>
                    <option value={30000}>30초</option>
                    <option value={60000}>1분</option>
                    <option value={120000}>2분</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 감정 분석 설정 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Database className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
                감정 분석
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 분석 모드 */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">분석 모드</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">감정 분석 방식을 선택합니다</p>
                </div>
                <select
                  value={settings.analysisMode}
                  onChange={(e) => handleSettingChange('analysisMode', e.target.value as 'offline' | 'free' | 'premium')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="offline">오프라인 (무료, 기본)</option>
                  <option value="free">무료 API (제한적)</option>
                  <option value="premium">프리미엄 API (유료)</option>
                </select>
              </div>

              {/* API 사용량 통계 */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">API 사용량</h4>
                  <button
                    onClick={resetUsageStats}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    초기화
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">오늘: </span>
                    <span className="font-medium text-gray-900 dark:text-white">{usageStats.daily}/100</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">이번 달: </span>
                    <span className="font-medium text-gray-900 dark:text-white">{usageStats.monthly}/1000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 알림 설정 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Bell className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
                알림
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 일기 알림 */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">일기 작성 알림</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">매일 정해진 시간에 알림을 받습니다</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reminderEnabled}
                    onChange={(e) => handleSettingChange('reminderEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.reminderEnabled && (
                <div className="flex items-center justify-between pl-8">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">알림 시간</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">매일 이 시간에 알림을 받습니다</p>
                  </div>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 개인정보 보호 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Shield className="w-6 h-6 mr-2 text-red-600 dark:text-red-400" />
                개인정보 보호
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 프라이버시 모드 */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">프라이버시 모드</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    모든 일기를 기본적으로 비공개로 설정합니다
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacyMode}
                    onChange={(e) => handleSettingChange('privacyMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* 데이터 저장 위치 */}
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">🔒 데이터 보안</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  모든 일기 데이터는 귀하의 브라우저에 로컬로 저장됩니다. 
                  외부 서버로 전송되지 않으며, 개인정보가 완전히 보호됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 데이터 관리 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Database className="w-6 h-6 mr-2 text-gray-600 dark:text-gray-400" />
                데이터 관리
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 백업 활성화 */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">자동 백업</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    정기적으로 데이터를 백업합니다
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.backupEnabled}
                    onChange={(e) => handleSettingChange('backupEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* 내보내기/가져오기 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={exportData}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-5 h-5 mr-2" />
                  데이터 내보내기
                </button>
                
                <label className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 mr-2" />
                  데이터 가져오기
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
              </div>

              {/* 위험 구역 */}
              <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4">
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-3">⚠️ 위험 구역</h4>
                <button
                  onClick={clearAllData}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  모든 데이터 삭제
                </button>
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  이 작업은 되돌릴 수 없습니다. 모든 일기와 설정이 영구적으로 삭제됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <div className="loading-spinner w-5 h-5 mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {isSaving ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;