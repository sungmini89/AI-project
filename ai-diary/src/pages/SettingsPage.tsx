import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { databaseService } from "../services/databaseService";
import { useApp } from "../contexts/AppContext";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, language, changeTheme, changeLanguage, isDark } = useApp();

  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30);
  const [notifications, setNotifications] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await databaseService.getSettings();
      console.log("로드된 설정:", settings); // 디버깅 로그
      setAutoSave(settings.autoSave ?? true);
      setAutoSaveInterval(settings.autoSaveInterval ?? 30);
      setNotifications(settings.notifications ?? true);
    } catch (error) {
      console.error("설정 로드 실패:", error);
      toast.error(
        language === "ko"
          ? "설정을 불러올 수 없습니다."
          : "Failed to load settings."
      );
    }
  };

  const handleSettingChange = async (
    setting: string,
    value: string | number | boolean
  ) => {
    try {
      console.log(`설정 변경: ${setting} = ${value}`); // 디버깅 로그

      // 즉시 로컬 상태 업데이트 (사용자 경험 개선)
      if (setting === "autoSave") setAutoSave(value as boolean);
      if (setting === "autoSaveInterval") setAutoSaveInterval(value as number);
      if (setting === "notifications") setNotifications(value as boolean);

      const currentSettings = await databaseService.getSettings();
      const updatedSettings = { ...currentSettings, [setting]: value };

      await databaseService.updateSettings(updatedSettings);
      console.log("설정 저장 완료:", updatedSettings); // 디버깅 로그

      toast.success(
        language === "ko"
          ? "설정이 저장되었습니다."
          : "Settings saved successfully."
      );
    } catch (error) {
      console.error("설정 저장 실패:", error);

      // 실패 시 원래 상태로 되돌리기
      if (setting === "autoSave") setAutoSave(!value as boolean);
      if (setting === "autoSaveInterval") setAutoSaveInterval(30);
      if (setting === "notifications") setNotifications(!value as boolean);

      toast.error(
        language === "ko"
          ? "설정 저장에 실패했습니다."
          : "Failed to save settings."
      );
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    await changeTheme(newTheme as any);
    toast.success(
      language === "ko"
        ? "테마가 변경되었습니다."
        : "Theme changed successfully."
    );
  };

  const handleLanguageChange = async (newLanguage: string) => {
    await changeLanguage(newLanguage as any);
    toast.success(
      language === "ko"
        ? "언어가 변경되었습니다."
        : "Language changed successfully."
    );
  };

  const exportData = async () => {
    setIsExporting(true);
    try {
      const data = await databaseService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
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
      toast.success(
        language === "ko"
          ? "데이터가 내보내기되었습니다."
          : "Data exported successfully."
      );
    } catch (error) {
      console.error("데이터 내보내기 실패:", error);
      toast.error(
        language === "ko"
          ? "데이터 내보내기에 실패했습니다."
          : "Failed to export data."
      );
    } finally {
      setIsExporting(false);
    }
  };

  const createBackup = async () => {
    setIsCreatingBackup(true);
    try {
      await databaseService.createBackup();
      toast.success(
        language === "ko"
          ? "백업이 생성되었습니다."
          : "Backup created successfully."
      );
    } catch (error) {
      console.error("백업 생성 실패:", error);
      toast.error(
        language === "ko"
          ? "백업 생성에 실패했습니다."
          : "Failed to create backup."
      );
    } finally {
      setIsCreatingBackup(false);
    }
  };

  return (
    <div
      className={`container mx-auto px-4 py-8 max-w-4xl ${
        isDark ? "dark" : "light"
      }`}
    >
      <div className="mb-8">
        <h1
          className={`text-3xl font-bold mb-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {language === "ko" ? "설정" : "Settings"}
        </h1>
        <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
          {language === "ko"
            ? "애플리케이션 설정을 관리하세요."
            : "Manage your application settings."}
        </p>
      </div>

      {/* 일반 설정 */}
      <div
        className={`rounded-lg shadow-md p-6 mb-6 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex items-center mb-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
              isDark ? "bg-blue-900" : "bg-blue-100"
            }`}
          >
            <svg
              className={`w-6 h-6 ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h2
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {language === "ko" ? "일반 설정" : "General Settings"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 테마 설정 */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {language === "ko" ? "테마" : "Theme"}
            </label>
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="light">
                {language === "ko" ? "밝은 테마" : "Light Theme"}
              </option>
              <option value="dark">
                {language === "ko" ? "어두운 테마" : "Dark Theme"}
              </option>
            </select>
          </div>

          {/* 언어 설정 */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {language === "ko" ? "언어" : "Language"}
            </label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* 자동 저장 설정 */}
      <div
        className={`rounded-lg shadow-md p-6 mb-6 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex items-center mb-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
              isDark ? "bg-green-900" : "bg-green-100"
            }`}
          >
            <svg
              className={`w-6 h-6 ${
                isDark ? "text-green-400" : "text-green-600"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {language === "ko" ? "자동 저장 설정" : "Auto Save Settings"}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoSave"
              checked={autoSave}
              onChange={(e) =>
                handleSettingChange("autoSave", e.target.checked)
              }
              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border rounded transition-colors ${
                isDark
                  ? "bg-gray-700 border-gray-600 focus:ring-blue-800"
                  : "bg-white border-gray-300 focus:ring-blue-500"
              }`}
            />
            <label
              htmlFor="autoSave"
              className={`ml-2 block text-sm cursor-pointer ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {language === "ko" ? "자동 저장 활성화" : "Enable Auto Save"}
            </label>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {language === "ko" ? "자동 저장 간격" : "Auto Save Interval"}
            </label>
            <select
              value={autoSaveInterval}
              onChange={(e) =>
                handleSettingChange(
                  "autoSaveInterval",
                  parseInt(e.target.value)
                )
              }
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value={15}>
                {language === "ko" ? "15초" : "15 seconds"}
              </option>
              <option value={30}>
                {language === "ko" ? "30초" : "30 seconds"}
              </option>
              <option value={60}>
                {language === "ko" ? "1분" : "1 minute"}
              </option>
              <option value={300}>
                {language === "ko" ? "5분" : "5 minutes"}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* 알림 설정 */}
      <div
        className={`rounded-lg shadow-md p-6 mb-6 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex items-center mb-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
              isDark ? "bg-yellow-900" : "bg-yellow-100"
            }`}
          >
            <svg
              className={`w-6 h-6 ${
                isDark ? "text-yellow-400" : "text-yellow-600"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM4.5 19.5L9 15H4.5l5-5v5z"
              />
            </svg>
          </div>
          <h2
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {language === "ko" ? "알림 설정" : "Notification Settings"}
          </h2>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="notifications"
            checked={notifications}
            onChange={(e) =>
              handleSettingChange("notifications", e.target.checked)
            }
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border rounded transition-colors ${
              isDark
                ? "bg-gray-700 border-gray-600 focus:ring-blue-800"
                : "bg-white border-gray-300 focus:ring-blue-500"
            }`}
          />
          <label
            htmlFor="notifications"
            className={`ml-2 block text-sm cursor-pointer ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {language === "ko"
              ? "푸시 알림 활성화"
              : "Enable Push Notifications"}
          </label>
        </div>
      </div>

      {/* 데이터 관리 */}
      <div
        className={`rounded-lg shadow-md p-6 mb-6 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex items-center mb-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
              isDark ? "bg-purple-900" : "bg-purple-100"
            }`}
          >
            <svg
              className={`w-6 h-6 ${
                isDark ? "text-purple-400" : "text-purple-600"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
              />
            </svg>
          </div>
          <h2
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {language === "ko" ? "데이터 관리" : "Data Management"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportData}
            disabled={isExporting}
            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {language === "ko" ? "내보내는 중..." : "Exporting..."}
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {language === "ko" ? "데이터 내보내기" : "Export Data"}
              </>
            )}
          </button>

          <button
            onClick={createBackup}
            disabled={isCreatingBackup}
            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isCreatingBackup ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {language === "ko" ? "백업 생성 중..." : "Creating backup..."}
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                {language === "ko" ? "백업 생성" : "Create Backup"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* 뒤로 가기 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          {language === "ko" ? "뒤로 가기" : "Go Back"}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
