import React, { useState, useEffect } from "react";
import {
  Settings,
  Palette,
  Globe,
  Save,
  Bell,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Database,
  Trash2,
  Clock,
  Smartphone,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { AppSettings } from "../services/databaseService";
import { databaseService } from "../services/databaseService";

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    theme: "auto",
    language: "ko",
    autoSave: true,
    autoSaveInterval: 30000,
    notifications: true,
    backupEnabled: true,
    backupInterval: 7,
  });

  const [backups, setBackups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    loadBackups();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const loadedSettings = await databaseService.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error("설정 로드 실패:", error);
      toast.error("설정을 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadBackups = async () => {
    try {
      const backupList = await databaseService.getBackups();
      setBackups(backupList);
    } catch (error) {
      console.error("백업 목록 로드 실패:", error);
    }
  };

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      await databaseService.updateSettings(settings);
      toast.success("설정이 저장되었습니다.");
    } catch (error) {
      console.error("설정 저장 실패:", error);
      toast.error("설정 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      await databaseService.createBackup();
      toast.success("백업이 생성되었습니다.");
      loadBackups();
    } catch (error) {
      console.error("백업 생성 실패:", error);
      toast.error("백업 생성에 실패했습니다.");
    }
  };

  const handleRestoreBackup = async (backupId: number) => {
    if (
      !confirm(
        "정말로 이 백업을 복원하시겠습니까? 현재 데이터는 모두 삭제됩니다."
      )
    ) {
      return;
    }

    try {
      await databaseService.restoreBackup(backupId);
      toast.success("백업이 복원되었습니다.");
      loadSettings();
      loadBackups();
    } catch (error) {
      console.error("백업 복원 실패:", error);
      toast.error("백업 복원에 실패했습니다.");
    }
  };

  const handleDeleteBackup = async (backupId: number) => {
    if (!confirm("정말로 이 백업을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await databaseService.deleteBackup(backupId);
      toast.success("백업이 삭제되었습니다.");
      loadBackups();
    } catch (error) {
      console.error("백업 삭제 실패:", error);
      toast.error("백업 삭제에 실패했습니다.");
    }
  };

  const handleExportData = async () => {
    try {
      const data = await databaseService.exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-diary-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("데이터가 내보내졌습니다.");
    } catch (error) {
      console.error("데이터 내보내기 실패:", error);
      toast.error("데이터 내보내기에 실패했습니다.");
    }
  };

  const handleImportData = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      !confirm(
        "정말로 이 데이터를 가져오시겠습니까? 현재 데이터는 모두 삭제됩니다."
      )
    ) {
      return;
    }

    try {
      const text = await file.text();
      await databaseService.importData(text);
      toast.success("데이터가 가져와졌습니다.");
      loadSettings();
      loadBackups();
    } catch (error) {
      console.error("데이터 가져오기 실패:", error);
      toast.error("데이터 가져오기에 실패했습니다.");
    }
  };

  const handleClearAllData = async () => {
    if (
      !confirm(
        "정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      return;
    }

    try {
      await databaseService.clearAllData();
      toast.success("모든 데이터가 삭제되었습니다.");
      setSettings({
        theme: "auto",
        language: "ko",
        autoSave: true,
        autoSaveInterval: 30000,
        notifications: true,
        backupEnabled: true,
        backupInterval: 7,
      });
      setBackups([]);
    } catch (error) {
      console.error("데이터 삭제 실패:", error);
      toast.error("데이터 삭제에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">설정을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Settings className="w-8 h-8 mr-3 text-gray-600" />
          설정
        </h1>
        <p className="text-lg text-gray-600">
          애플리케이션 설정을 관리하고 데이터를 백업할 수 있습니다.
        </p>
      </div>

      <div className="space-y-8">
        {/* 일반 설정 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Palette className="w-6 h-6 mr-2 text-blue-600" />
              일반 설정
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  테마
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange("theme", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="light">밝은 테마</option>
                  <option value="dark">어두운 테마</option>
                  <option value="auto">시스템 설정</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  언어
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    handleSettingChange("language", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 자동 저장 설정 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-green-600" />
              자동 저장 설정
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="autoSave"
                checked={settings.autoSave}
                onChange={(e) =>
                  handleSettingChange("autoSave", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="autoSave"
                className="text-sm font-medium text-gray-900"
              >
                자동 저장 활성화
              </label>
            </div>

            {settings.autoSave && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자동 저장 간격
                </label>
                <select
                  value={settings.autoSaveInterval}
                  onChange={(e) =>
                    handleSettingChange(
                      "autoSaveInterval",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10000}>10초</option>
                  <option value={30000}>30초</option>
                  <option value={60000}>1분</option>
                  <option value={300000}>5분</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Bell className="w-6 h-6 mr-2 text-yellow-600" />
              알림 설정
            </h2>
          </div>

          <div className="p-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="notifications"
                checked={settings.notifications}
                onChange={(e) =>
                  handleSettingChange("notifications", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="notifications"
                className="text-sm font-medium text-gray-900"
              >
                브라우저 알림 활성화
              </label>
            </div>
          </div>
        </div>

        {/* 백업 설정 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Database className="w-6 h-6 mr-2 text-purple-600" />
              백업 설정
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="backupEnabled"
                checked={settings.backupEnabled}
                onChange={(e) =>
                  handleSettingChange("backupEnabled", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="backupEnabled"
                className="text-sm font-medium text-gray-900"
              >
                자동 백업 활성화
              </label>
            </div>

            {settings.backupEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  백업 간격
                </label>
                <select
                  value={settings.backupInterval}
                  onChange={(e) =>
                    handleSettingChange(
                      "backupInterval",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>매일</option>
                  <option value={7}>매주</option>
                  <option value={30}>매월</option>
                </select>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleCreateBackup}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Database className="w-4 h-4" />
                <span>백업 생성</span>
              </button>

              <button
                onClick={handleExportData}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>데이터 내보내기</span>
              </button>

              <label className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>데이터 가져오기</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* 백업 목록 */}
        {backups.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">백업 목록</h2>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(backup.timestamp).toLocaleString("ko-KR")}
                      </div>
                      <div className="text-sm text-gray-600">
                        v{backup.version}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRestoreBackup(backup.id)}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        복원
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 위험 영역 */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200">
          <div className="p-6 border-b border-red-200">
            <h2 className="text-xl font-semibold text-red-900 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-red-600" />
              데이터 관리
            </h2>
          </div>

          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                ⚠️ 위험 영역
              </h3>
              <p className="text-red-700 text-sm">
                이 작업들은 되돌릴 수 없습니다. 신중하게 진행해주세요.
              </p>
            </div>

            <button
              onClick={handleClearAllData}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>모든 데이터 삭제</span>
            </button>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? "저장 중..." : "설정 저장"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
