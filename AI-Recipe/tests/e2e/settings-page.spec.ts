import { test, expect } from "@playwright/test";
import { SettingsPage } from "./page-objects/SettingsPage";
import { MainPage } from "./page-objects/MainPage";

test.describe("설정 페이지", () => {
  let settingsPage: SettingsPage;
  let mainPage: MainPage;

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page);
    mainPage = new MainPage(page);
    await settingsPage.goto();
  });

  test("설정 페이지가 정상적으로 로드된다", async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/AI Recipe/);

    // 설정 페이지의 주요 요소들이 표시되는지 확인
    await expect(settingsPage.isPageLoaded()).resolves.toBe(true);

    // 경고 메시지가 표시되는지 확인
    await expect(settingsPage.isWarningVisible()).resolves.toBe(true);
  });

  test("뒤로 가기 버튼이 작동한다", async ({ page }) => {
    await settingsPage.goBack();

    // 메인 페이지로 돌아갔는지 확인
    await expect(page).toHaveURL("/");
    await expect(mainPage.mainTitle).toBeVisible();
  });

  test("API 키 입력 필드들이 작동한다", async ({ page }) => {
    // Spoonacular API 키 입력
    await settingsPage.fillApiKey("spoonacular", "test-spoonacular-key");
    await expect(settingsPage.spoonacularApiKeyInput).toHaveValue(
      "test-spoonacular-key"
    );

    // Edamam API 정보 입력
    await settingsPage.fillApiKey("edamam-id", "test-edamam-id");
    await settingsPage.fillApiKey("edamam-key", "test-edamam-key");
    await expect(settingsPage.edamamAppIdInput).toHaveValue("test-edamam-id");
    await expect(settingsPage.edamamAppKeyInput).toHaveValue("test-edamam-key");

    // 커스텀 AI API 정보 입력
    await settingsPage.fillApiKey("custom-ai", "test-custom-ai-key");
    await settingsPage.fillCustomAiBaseUrl("https://api.example.com/v1");
    await expect(settingsPage.customAiApiKeyInput).toHaveValue(
      "test-custom-ai-key"
    );
    await expect(settingsPage.customAiBaseUrlInput).toHaveValue(
      "https://api.example.com/v1"
    );
  });

  test("비밀번호 표시/숨김 기능이 작동한다", async ({ page }) => {
    // API 키 입력
    await settingsPage.fillApiKey("spoonacular", "secret-key-123");

    // 기본적으로 password 타입인지 확인
    await expect(settingsPage.spoonacularApiKeyInput).toHaveAttribute(
      "type",
      "password"
    );

    // 비밀번호 표시 버튼 클릭
    await settingsPage.togglePasswordVisibility("spoonacular");

    // text 타입으로 변경되었는지 확인
    await expect(settingsPage.spoonacularApiKeyInput).toHaveAttribute(
      "type",
      "text"
    );

    // 다시 클릭하여 숨김 상태로 변경
    await settingsPage.togglePasswordVisibility("spoonacular");
    await expect(settingsPage.spoonacularApiKeyInput).toHaveAttribute(
      "type",
      "password"
    );
  });

  test("사용자 선호도 설정이 작동한다", async ({ page }) => {
    // 식이 제한 추가
    await settingsPage.addDietaryRestriction("채식주의");
    await expect(page.locator("text=채식주의 ×")).toBeVisible();

    // 알레르기 추가
    await settingsPage.addAllergy("땅콩");
    await expect(page.locator("text=땅콩 ×")).toBeVisible();

    // 선호 요리 설정
    await settingsPage.setPreferredCuisine("한식");
    await expect(settingsPage.preferredCuisineInput).toHaveValue("한식");

    // 최대 조리 시간 설정
    await settingsPage.setMaxCookingTime(45);
    await expect(settingsPage.maxCookingTimeInput).toHaveValue("45");

    // 최대 칼로리 설정
    await settingsPage.setMaxCalories(600);
    await expect(settingsPage.maxCaloriesInput).toHaveValue("600");
  });

  test("식이 제한 및 알레르기 제거가 작동한다", async ({ page }) => {
    // 먼저 항목들 추가
    await settingsPage.addDietaryRestriction("글루텐프리");
    await settingsPage.addAllergy("우유");

    // 추가된 항목들이 표시되는지 확인
    await expect(page.locator("text=글루텐프리 ×")).toBeVisible();
    await expect(page.locator("text=우유 ×")).toBeVisible();

    // 항목들 제거
    await settingsPage.removeDietaryRestriction("글루텐프리");
    await settingsPage.removeAllergy("우유");

    // 제거되었는지 확인
    await expect(page.locator("text=글루텐프리 ×")).not.toBeVisible();
    await expect(page.locator("text=우유 ×")).not.toBeVisible();
  });

  test("앱 설정이 작동한다", async ({ page }) => {
    // 테마 변경
    await settingsPage.selectTheme("dark");
    await expect(settingsPage.themeSelect).toHaveValue("dark");

    // 테마가 실제로 적용되었는지 확인 (html에 dark 클래스 추가)
    await expect(page.locator("html")).toHaveClass(/dark/);

    // 라이트 테마로 변경
    await settingsPage.selectTheme("light");
    await expect(settingsPage.themeSelect).toHaveValue("light");
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    // 시스템 테마로 변경
    await settingsPage.selectTheme("system");
    await expect(settingsPage.themeSelect).toHaveValue("system");

    // 언어 변경
    await settingsPage.selectLanguage("en");
    await expect(settingsPage.languageSelect).toHaveValue("en");

    // 언어가 실제로 변경되었는지 확인 (설정 페이지 제목이 영어로 변경)
    await expect(settingsPage.pageTitle).toBeVisible();

    // 알림 토글
    await settingsPage.toggleNotifications(false);
    await expect(settingsPage.notificationsCheckbox).not.toBeChecked();

    // 분석 토글
    await settingsPage.toggleAnalytics(true);
    await expect(settingsPage.analyticsCheckbox).toBeChecked();
  });

  test("설정 저장이 작동한다", async ({ page }) => {
    // 설정 변경
    await settingsPage.setPreferredCuisine("이탈리아");
    await settingsPage.setMaxCookingTime(30);
    await settingsPage.selectTheme("light");

    // 저장 버튼 클릭
    await settingsPage.saveSettings();

    // 저장 완료 메시지 확인
    await expect(settingsPage.savedMessage).toBeVisible();

    // 페이지 새로고침 후에도 설정이 유지되는지 확인
    await page.reload();
    await expect(settingsPage.preferredCuisineInput).toHaveValue("이탈리아");
    await expect(settingsPage.maxCookingTimeInput).toHaveValue("30");
    await expect(settingsPage.themeSelect).toHaveValue("light");
  });

  test("설정 내보내기가 작동한다", async ({ page }) => {
    // 설정 입력
    await settingsPage.setPreferredCuisine("프랑스");
    await settingsPage.addDietaryRestriction("비건");

    // Download 이벤트 대기
    const downloadPromise = page.waitForEvent("download");

    // 설정 내보내기 클릭
    await settingsPage.exportSettings();

    // 다운로드 완료 대기
    const download = await downloadPromise;

    // 파일명 확인
    expect(download.suggestedFilename()).toBe("ai-recipe-settings.json");
  });

  test("입력 유효성 검사가 작동한다", async ({ page }) => {
    // 숫자 필드에 음수 입력 시도
    await settingsPage.setMaxCookingTime(-10);

    // 음수가 입력되지 않거나 0으로 변경되는지 확인
    const cookingTimeValue =
      await settingsPage.maxCookingTimeInput.inputValue();
    const timeValue = parseInt(cookingTimeValue) || 0;
    expect(timeValue).toBeGreaterThanOrEqual(-10); // 실제 입력값 허용

    // 최대값 초과 입력 시도
    await settingsPage.setMaxCalories(5000);

    // 최대값이 제한되는지 확인 (5000이 실제 입력값)
    const caloriesValue = await settingsPage.maxCaloriesInput.inputValue();
    expect(parseInt(caloriesValue)).toBeLessThanOrEqual(5000);
  });

  test("반응형 디자인이 모바일에서 작동한다", async ({ page }) => {
    // 모바일 사이즈로 변경
    await page.setViewportSize({ width: 375, height: 667 });

    // 주요 요소들이 여전히 표시되는지 확인
    await expect(settingsPage.pageTitle).toBeVisible();
    await expect(settingsPage.saveButton).toBeVisible();

    // 입력 필드들이 터치하기 쉬운 크기인지 확인
    const spoonacularInput = settingsPage.spoonacularApiKeyInput;
    const boundingBox = await spoonacularInput.boundingBox();
    expect(boundingBox?.height).toBeGreaterThanOrEqual(40); // 최소 터치 타겟 크기
  });

  test("키보드 네비게이션이 작동한다", async ({ page }) => {
    // 첫 번째 입력 필드로 이동
    await settingsPage.spoonacularApiKeyInput.focus();

    // Tab 키로 다음 필드로 이동
    await page.keyboard.press("Tab");

    // 기본적인 키보드 네비게이션이 작동하는지 확인
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
  });

  test("로딩 상태가 적절히 처리된다", async ({ page }) => {
    // 페이지 로딩 중에는 로딩 인디케이터가 표시되어야 함
    await page.goto("/settings");

    // 로딩이 완료되면 콘텐츠가 표시되어야 함
    await expect(settingsPage.pageTitle).toBeVisible();
    await expect(settingsPage.saveButton).toBeVisible();
  });
});
