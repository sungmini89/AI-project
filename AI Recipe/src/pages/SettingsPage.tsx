import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/hooks/useSettings";
import {
  Settings,
  Key,
  Globe,
  Palette,
  Download,
  Upload,
  XCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Eye,
  EyeOff,
  RotateCcw,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SettingsPage() {
  const { t } = useTranslation();
  const {
    settings,
    loading,
    error,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
    validateApiKeys,
    saveSettings,
  } = useSettings();
  const [forceRender, setForceRender] = useState(0);

  // settingsChanged 이벤트 리스너 추가 - 헤더와 동기화
  useEffect(() => {
    const handleSettingsChanged = () => {
      // 상태 업데이트를 비동기로 처리하여 렌더링 중 업데이트 방지
      setTimeout(() => {
        setForceRender(prev => prev + 1);
      }, 0);
    };

    window.addEventListener("settingsChanged", handleSettingsChanged);
    return () => {
      window.removeEventListener("settingsChanged", handleSettingsChanged);
    };
  }, []);

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apiStatus, setApiStatus] = useState(validateApiKeys());
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [currentAllergy, setCurrentAllergy] = useState("");
  const [apiTesting, setApiTesting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setApiStatus(validateApiKeys());
  }, [settings, validateApiKeys]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = saveSettings(settings); // 현재 설정을 저장
      if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const addDietaryRestriction = () => {
    if (
      currentIngredient.trim() &&
      !settings.dietaryRestrictions.includes(currentIngredient.trim())
    ) {
      updateSetting("dietaryRestrictions", [
        ...settings.dietaryRestrictions,
        currentIngredient.trim(),
      ]);
      setCurrentIngredient("");
    }
  };

  const removeDietaryRestriction = (restriction: string) => {
    updateSetting(
      "dietaryRestrictions",
      settings.dietaryRestrictions.filter((r) => r !== restriction)
    );
  };

  const addAllergy = () => {
    if (
      currentAllergy.trim() &&
      !settings.allergies.includes(currentAllergy.trim())
    ) {
      updateSetting("allergies", [
        ...settings.allergies,
        currentAllergy.trim(),
      ]);
      setCurrentAllergy("");
    }
  };

  const removeAllergy = (allergy: string) => {
    updateSetting(
      "allergies",
      settings.allergies.filter((a) => a !== allergy)
    );
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importSettings(file);
    // 파일 입력 초기화
    event.target.value = "";
  };

  const testApiConnection = async (
    apiType: "spoonacular" | "edamam" | "customAI"
  ) => {
    setApiTesting((prev) => ({ ...prev, [apiType]: true }));

    try {
      let testUrl = "";
      let testHeaders: Record<string, string> = {};

      switch (apiType) {
        case "spoonacular":
          if (!settings.spoonacularApiKey) {
            alert(t("settings.alerts.spoonacularKeyRequired"));
            return;
          }
          // 개발 환경에서는 프록시 사용, 프로덕션에서는 직접 API 호출
          testUrl = import.meta.env.DEV
            ? `/api/spoonacular/recipes/complexSearch?apiKey=${settings.spoonacularApiKey}&number=1`
            : `https://api.spoonacular.com/recipes/complexSearch?apiKey=${settings.spoonacularApiKey}&number=1`;
          break;

        case "edamam":
          if (!settings.edamamAppId || !settings.edamamAppKey) {
            alert(t("settings.alerts.edamamKeysRequired"));
            return;
          }
          // 개발 환경에서는 프록시 사용
          testUrl = import.meta.env.DEV
            ? `/api/edamam/search?q=chicken&app_id=${settings.edamamAppId}&app_key=${settings.edamamAppKey}&from=0&to=1`
            : `https://api.edamam.com/search?q=chicken&app_id=${settings.edamamAppId}&app_key=${settings.edamamAppKey}&from=0&to=1`;
          break;

        case "customAI":
          if (!settings.customAiApiKey) {
            alert(t("settings.alerts.customAiKeyRequired"));
            return;
          }
          if (!settings.customAiBaseUrl) {
            alert(t("settings.alerts.customAiUrlRequired"));
            return;
          }
          testUrl =
            `${settings.customAiBaseUrl}/models` ||
            `${settings.customAiBaseUrl}/health`;
          testHeaders = {
            Authorization: `Bearer ${settings.customAiApiKey}`,
            "Content-Type": "application/json",
          };
          break;
      }

      const response = await fetch(testUrl, {
        method: "GET",
        headers: testHeaders,
      });

      if (response.ok) {
        alert(t("settings.alerts.apiTestSuccess"));
        // API 상태 업데이트
        setApiStatus((prev) => ({ ...prev, [apiType]: true }));
      } else {
        const errorText = await response.text();
        alert(
          t("settings.alerts.apiTestFailure", {
            status: response.status,
            statusText: response.statusText,
          }) + `\n${errorText}`
        );
        setApiStatus((prev) => ({ ...prev, [apiType]: false }));
      }
    } catch (error) {
      console.error(t("errors.apiTestFailed"), apiType, error);
      alert(
        t("settings.alerts.apiTestError", {
          error: error instanceof Error ? error.message : String(error),
        })
      );
      setApiStatus((prev) => ({ ...prev, [apiType]: false }));
    } finally {
      setApiTesting((prev) => ({ ...prev, [apiType]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t("settings.title")}
            </h1>
          </div>

          <p className="text-gray-600 dark:text-gray-300">
            {t("settings.title")} {t("settings.apiKeys")}
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <span className="text-red-800 dark:text-red-200">{error}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t("settings.apiKeys")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Spoonacular API */}
              <div>
                <Label
                  htmlFor="spoonacularApiKey"
                  className="flex items-center gap-2"
                >
                  {t("settings.spoonacularApiKey")}
                  {apiStatus.spoonacular ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="spoonacularApiKey"
                    type={showPasswords.spoonacular ? "text" : "password"}
                    value={settings.spoonacularApiKey}
                    onChange={(e) =>
                      updateSetting("spoonacularApiKey", e.target.value)
                    }
                    placeholder={t("placeholders.spoonacularApiKey")}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility("spoonacular")}
                  >
                    {showPasswords.spoonacular ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testApiConnection("spoonacular")}
                    disabled={apiTesting.spoonacular}
                  >
                    {apiTesting.spoonacular ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    {apiTesting.spoonacular
                      ? t("settings.testing")
                      : t("settings.testConnection")}
                  </Button>
                  <Badge
                    variant={apiStatus.spoonacular ? "default" : "destructive"}
                  >
                    {apiStatus.spoonacular
                      ? t("settings.connected")
                      : t("settings.disconnected")}
                  </Badge>
                </div>
              </div>

              {/* Edamam API */}
              <div>
                <Label
                  htmlFor="edamamAppId"
                  className="flex items-center gap-2"
                >
                  {t("settings.edamamAppId")}
                  {apiStatus.edamam ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </Label>
                <Input
                  id="edamamAppId"
                  type={showPasswords.edamamAppId ? "text" : "password"}
                  value={settings.edamamAppId}
                  onChange={(e) => updateSetting("edamamAppId", e.target.value)}
                  placeholder={t("placeholders.edamamAppId")}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => togglePasswordVisibility("edamamAppId")}
                  >
                    {showPasswords.edamamAppId ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="edamamAppKey">
                  {t("settings.edamamAppKey")}
                </Label>
                <Input
                  id="edamamAppKey"
                  type={showPasswords.edamamAppKey ? "text" : "password"}
                  value={settings.edamamAppKey}
                  onChange={(e) =>
                    updateSetting("edamamAppKey", e.target.value)
                  }
                  placeholder={t("placeholders.edamamAppKey")}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => togglePasswordVisibility("edamamAppKey")}
                  >
                    {showPasswords.edamamAppKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testApiConnection("edamam")}
                    disabled={apiTesting.edamam}
                  >
                    {apiTesting.edamam ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    {apiTesting.edamam
                      ? t("settings.testing")
                      : t("settings.testConnection")}
                  </Button>
                  <Badge variant={apiStatus.edamam ? "default" : "destructive"}>
                    {apiStatus.edamam
                      ? t("settings.connected")
                      : t("settings.disconnected")}
                  </Badge>
                </div>
              </div>

              {/* Custom AI API */}
              <div>
                <Label
                  htmlFor="customAiApiKey"
                  className="flex items-center gap-2"
                >
                  {t("settings.customAiApiKey")}
                  {apiStatus.customAI ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </Label>
                <Input
                  id="customAiApiKey"
                  type={showPasswords.customAiApiKey ? "text" : "password"}
                  value={settings.customAiApiKey}
                  onChange={(e) =>
                    updateSetting("customAiApiKey", e.target.value)
                  }
                  placeholder={t("placeholders.customAiApiKey")}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => togglePasswordVisibility("customAiApiKey")}
                  >
                    {showPasswords.customAiApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testApiConnection("customAI")}
                    disabled={apiTesting.customAI}
                  >
                    {apiTesting.customAI ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    {apiTesting.customAI
                      ? t("settings.testing")
                      : t("settings.testConnection")}
                  </Button>
                  <Badge
                    variant={apiStatus.customAI ? "default" : "destructive"}
                  >
                    {apiStatus.customAI
                      ? t("settings.connected")
                      : t("settings.disconnected")}
                  </Badge>
                </div>
              </div>

              <div>
                <Label htmlFor="customAiBaseUrl">
                  {t("settings.customAiBaseUrl")}
                </Label>
                <Input
                  id="customAiBaseUrl"
                  value={settings.customAiBaseUrl}
                  onChange={(e) =>
                    updateSetting("customAiBaseUrl", e.target.value)
                  }
                  placeholder={t("placeholders.customAiBaseUrl")}
                />
              </div>
            </CardContent>
          </Card>

          {/* 사용자 선호도 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("settings.userPreferences")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 식이 제한 */}
              <div>
                <Label>{t("settings.dietaryRestrictions")}</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder={t("settings.addRestriction")}
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addDietaryRestriction();
                      }
                    }}
                  />
                  <Button size="sm" onClick={addDietaryRestriction}>
                    {t("settings.add")}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settings.dietaryRestrictions.map((restriction) => (
                    <Badge
                      key={restriction}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeDietaryRestriction(restriction)}
                    >
                      {restriction} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 알레르기 */}
              <div>
                <Label>{t("settings.allergies")}</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder={t("settings.addAllergy")}
                    value={currentAllergy}
                    onChange={(e) => setCurrentAllergy(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addAllergy();
                      }
                    }}
                  />
                  <Button size="sm" onClick={addAllergy}>
                    {t("settings.add")}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settings.allergies.map((allergy) => (
                    <Badge
                      key={allergy}
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => removeAllergy(allergy)}
                    >
                      {allergy} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 선호 요리 */}
              <div>
                <Label htmlFor="preferredCuisine">
                  {t("settings.preferredCuisine")}
                </Label>
                <Input
                  id="preferredCuisine"
                  value={settings.preferredCuisine}
                  onChange={(e) =>
                    updateSetting("preferredCuisine", e.target.value)
                  }
                  placeholder={t("settings.cuisinePlaceholder")}
                />
              </div>

              {/* 최대 조리 시간 */}
              <div>
                <Label htmlFor="maxCookingTime">
                  {t("settings.maxCookingTime")}
                </Label>
                <Input
                  id="maxCookingTime"
                  type="number"
                  value={settings.maxCookingTime}
                  onChange={(e) =>
                    updateSetting(
                      "maxCookingTime",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="0"
                  max="300"
                />
              </div>

              {/* 최대 칼로리 */}
              <div>
                <Label htmlFor="maxCalories">{t("settings.maxCalories")}</Label>
                <Input
                  id="maxCalories"
                  type="number"
                  value={settings.maxCalories}
                  onChange={(e) =>
                    updateSetting("maxCalories", parseInt(e.target.value) || 0)
                  }
                  min="0"
                  max="2000"
                />
              </div>
            </CardContent>
          </Card>

          {/* 앱 설정 */}
          <Card key={`app-settings-${forceRender}-${settings.theme}-${settings.language}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t("settings.appSettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 테마 */}
              <div>
                <Label htmlFor="theme">{t("settings.theme")}</Label>
                <select
                  id="theme"
                  key={`theme-${settings.theme}`}
                  value={settings.theme}
                  onChange={(e) =>
                    updateSetting("theme", e.target.value as "light" | "dark")
                  }
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="light">{t("themes.light")}</option>
                  <option value="dark">{t("themes.dark")}</option>
                </select>
              </div>

              {/* 언어 */}
              <div>
                <Label htmlFor="language">{t("settings.language")}</Label>
                <select
                  id="language"
                  key={`language-${settings.language}`}
                  value={settings.language}
                  onChange={(e) =>
                    updateSetting("language", e.target.value as "ko" | "en")
                  }
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="ko">{t("languages.ko")}</option>
                  <option value="en">{t("languages.en")}</option>
                </select>
              </div>

              {/* 알림 */}
              <div className="flex items-center justify-between">
                <Label htmlFor="enableNotifications">
                  {t("settings.notifications")}
                </Label>
                <input
                  id="enableNotifications"
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) =>
                    updateSetting("enableNotifications", e.target.checked)
                  }
                  className="w-4 h-4"
                />
              </div>

              {/* 분석 */}
              <div className="flex items-center justify-between">
                <Label htmlFor="enableAnalytics">
                  {t("settings.analytics")}
                </Label>
                <input
                  id="enableAnalytics"
                  type="checkbox"
                  checked={settings.enableAnalytics}
                  onChange={(e) =>
                    updateSetting("enableAnalytics", e.target.checked)
                  }
                  className="w-4 h-4"
                />
              </div>
            </CardContent>
          </Card>

          {/* 데이터 관리 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                {t("settings.dataManagement")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={exportSettings} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  {t("settings.exportSettings")}
                </Button>
                <Button
                  onClick={() =>
                    document.getElementById("importSettings")?.click()
                  }
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t("settings.importSettings")}
                </Button>
                <input
                  id="importSettings"
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                />
              </div>

              <Button
                onClick={resetSettings}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("settings.resetSettings")}
              </Button>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-600 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                      {t("settings.warningTitle")}
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      {t("settings.warningText")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
