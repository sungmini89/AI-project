import { useState } from "react";
import { useSettingsStore } from "@/stores";
import { useTranslation } from "@/hooks";
import { Button, Card, Input } from "@/components/ui";
import { Moon, Sun, Volume2, VolumeX, Bell, BellOff } from "lucide-react";

export default function SettingsPage() {
  const {
    theme,
    language,
    notifications,
    pomodoroSettings,
    aiSettings,
    updateTheme,
    updateLanguage,
    updateNotifications,
    updatePomodoroSettings,
    updateAISettings,
    resetToDefaults,
    exportSettings,
    importSettings,
  } = useSettingsStore();

  const { t } = useTranslation();
  const [importData, setImportData] = useState("");

  const handleExport = () => {
    const settings = exportSettings();
    navigator.clipboard.writeText(settings);
    alert(t("exportSuccess"));
  };

  const handleImport = () => {
    if (importSettings(importData)) {
      alert(t("importSuccess"));
      setImportData("");
    } else {
      alert(t("importError"));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("settingsTitle")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t("settingsDescription")}
        </p>
      </div>

      {/* 테마 설정 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("themeSection")}
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {t("themeTitle")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("themeDescription")}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => updateTheme("light")}
                className={`flex items-center space-x-2 ${
                  theme === "light"
                    ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                    : "text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Sun className="h-4 w-4" />
                <span>{t("themeLight")}</span>
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => updateTheme("dark")}
                className={`flex items-center space-x-2 ${
                  theme === "dark"
                    ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                    : "text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Moon className="h-4 w-4" />
                <span>{t("themeDark")}</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 언어 설정 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("languageSection")}
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {t("languageTitle")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("languageDescription")}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={language === "ko" ? "default" : "outline"}
              size="sm"
              onClick={() => updateLanguage("ko")}
              className={
                language === "ko"
                  ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                  : "text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }
            >
              {t("korean")}
            </Button>
            <Button
              variant={language === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => updateLanguage("en")}
              className={
                language === "en"
                  ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                  : "text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }
            >
              {t("english")}
            </Button>
          </div>
        </div>
      </Card>

      {/* 알림 설정 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("notificationsSection")}
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {t("notificationsTitle")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("notificationsDescription")}
              </p>
            </div>
            <Button
              variant={notifications.enabled ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateNotifications({ enabled: !notifications.enabled })
              }
              className={`flex items-center space-x-2 ${
                notifications.enabled
                  ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                  : "text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {notifications.enabled ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
              <span>
                {notifications.enabled
                  ? t("notificationsOn")
                  : t("notificationsOff")}
              </span>
            </Button>
          </div>

          {notifications.enabled && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {t("taskRemindersTitle")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("taskRemindersDescription")}
                  </p>
                </div>
                <Button
                  variant={notifications.taskReminders ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    updateNotifications({
                      taskReminders: !notifications.taskReminders,
                    })
                  }
                  className={
                    notifications.taskReminders
                      ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                      : "text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }
                >
                  {notifications.taskReminders
                    ? t("notificationsOn")
                    : t("notificationsOff")}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {t("pomodoroAlertsTitle")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("pomodoroAlertsDescription")}
                  </p>
                </div>
                <Button
                  variant={notifications.pomodoroAlerts ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    updateNotifications({
                      pomodoroAlerts: !notifications.pomodoroAlerts,
                    })
                  }
                  className={
                    notifications.pomodoroAlerts
                      ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                      : "text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }
                >
                  {notifications.pomodoroAlerts
                    ? t("notificationsOn")
                    : t("notificationsOff")}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* 포모도로 설정 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("pomodoroSection")}
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {t("workTimeLabel")}
              </label>
              <Input
                type="number"
                value={pomodoroSettings.workTime}
                onChange={(e) =>
                  updatePomodoroSettings({
                    workTime: parseInt(e.target.value) || 25,
                  })
                }
                min="1"
                max="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {t("shortBreakLabel")}
              </label>
              <Input
                type="number"
                value={pomodoroSettings.shortBreak}
                onChange={(e) =>
                  updatePomodoroSettings({
                    shortBreak: parseInt(e.target.value) || 5,
                  })
                }
                min="1"
                max="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {t("longBreakLabel")}
              </label>
              <Input
                type="number"
                value={pomodoroSettings.longBreak}
                onChange={(e) =>
                  updatePomodoroSettings({
                    longBreak: parseInt(e.target.value) || 15,
                  })
                }
                min="1"
                max="60"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {t("autoStartBreaksTitle")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("autoStartBreaksDescription")}
                </p>
              </div>
              <Button
                variant={
                  pomodoroSettings.autoStartBreaks ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  updatePomodoroSettings({
                    autoStartBreaks: !pomodoroSettings.autoStartBreaks,
                  })
                }
                className={
                  pomodoroSettings.autoStartBreaks
                    ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                    : "text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                }
              >
                {pomodoroSettings.autoStartBreaks
                  ? t("notificationsOn")
                  : t("notificationsOff")}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {t("autoStartPomodorosTitle")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("autoStartPomodorosDescription")}
                </p>
              </div>
              <Button
                variant={
                  pomodoroSettings.autoStartPomodoros ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  updatePomodoroSettings({
                    autoStartPomodoros: !pomodoroSettings.autoStartPomodoros,
                  })
                }
                className={
                  pomodoroSettings.autoStartPomodoros
                    ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                    : "text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                }
              >
                {pomodoroSettings.autoStartPomodoros
                  ? t("notificationsOn")
                  : t("notificationsOff")}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* AI 설정 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("aiSection")}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t("aiModeLabel")}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(["mock", "free", "offline", "userApiKey"] as const).map(
                (mode) => (
                  <Button
                    key={mode}
                    variant={aiSettings.mode === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateAISettings({ mode })}
                    className={`${
                      aiSettings.mode === mode
                        ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                        : "text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    } text-left justify-start h-auto py-3 px-4`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">
                        {mode === "offline"
                          ? t("aiModeOffline")
                          : mode === "mock"
                          ? t("aiModeMock")
                          : mode === "free"
                          ? t("aiModeFree")
                          : t("aiModeUserApiKey")}
                      </span>
                      <span className="text-xs opacity-75 mt-1">
                        {mode === "offline"
                          ? t("aiModeOfflineDesc")
                          : mode === "mock"
                          ? t("aiModeMockDesc")
                          : mode === "free"
                          ? t("aiModeFreeDesc")
                          : t("aiModeUserApiKeyDesc")}
                      </span>
                    </div>
                  </Button>
                )
              )}
            </div>
          </div>

          {/* API 키 입력 (사용자 API 키 모드일 때만 표시) */}
          {aiSettings.mode === "userApiKey" && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {t("apiKeyLabel")}
              </label>
              <Input
                type="password"
                placeholder={t("apiKeyPlaceholder")}
                value={aiSettings.apiKey || ""}
                onChange={(e) => updateAISettings({ apiKey: e.target.value })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("apiKeyHelp")}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {t("fallbackTitle")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("fallbackDescription")}
              </p>
            </div>
            <Button
              variant={aiSettings.fallbackToOffline ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateAISettings({
                  fallbackToOffline: !aiSettings.fallbackToOffline,
                })
              }
              className={
                aiSettings.fallbackToOffline
                  ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                  : "text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }
            >
              {aiSettings.fallbackToOffline
                ? t("notificationsOn")
                : t("notificationsOff")}
            </Button>
          </div>
        </div>
      </Card>

      {/* 설정 관리 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("settingsManagement")}
        </h2>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button
              onClick={handleExport}
              variant="outline"
              className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t("exportSettings")}
            </Button>
            <Button
              onClick={resetToDefaults}
              variant="outline"
              className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t("resetToDefaults")}
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t("importSettings")}
            </label>
            <div className="flex space-x-2">
              <Input
                placeholder={t("importPlaceholder")}
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleImport}
                disabled={!importData}
                className={
                  !importData
                    ? ""
                    : "bg-green-600 hover:bg-green-700 text-white border-green-600"
                }
              >
                {t("importButton")}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
