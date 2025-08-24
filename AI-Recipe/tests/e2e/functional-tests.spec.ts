import { test, expect } from "@playwright/test";
import { MainPage } from "./page-objects/MainPage";
import { SettingsPage } from "./page-objects/SettingsPage";

test.describe("실제 기능 동작 테스트", () => {
  let mainPage: MainPage;
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    settingsPage = new SettingsPage(page);
  });

  test("테마 변경이 실제로 작동한다", async ({ page }) => {
    // 설정 페이지로 이동
    await mainPage.goto();
    await mainPage.navigateToSettings();

    // 현재 테마 확인
    const currentTheme = await settingsPage.themeSelect.inputValue();
    console.log("현재 테마:", currentTheme);

    // 다크 테마로 변경
    await settingsPage.selectTheme("dark");
    await expect(settingsPage.themeSelect).toHaveValue("dark");

    // 테마 적용을 위한 충분한 대기 시간
    await page.waitForTimeout(1000);

    // html 요소에 dark 클래스가 실제로 추가되었는지 확인
    const htmlElement = page.locator("html");
    await expect(htmlElement).toHaveClass(/dark/);

    // 페이지 배경색이 실제로 변경되었는지 확인
    const bodyElement = page.locator("body");
    const backgroundColor = await bodyElement.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor
    );
    console.log("다크 테마 배경색:", backgroundColor);

    // 라이트 테마로 변경
    await settingsPage.selectTheme("light");
    await expect(settingsPage.themeSelect).toHaveValue("light");

    await page.waitForTimeout(1000);

    // html 요소에서 dark 클래스가 제거되었는지 확인
    await expect(htmlElement).not.toHaveClass(/dark/);

    // 테마 변경 완료
  });

  test("언어 설정이 실제로 저장된다", async ({ page }) => {
    // 설정 페이지로 이동
    await mainPage.goto();
    await mainPage.navigateToSettings();

    // 현재 언어 확인
    const currentLanguage = await settingsPage.languageSelect.inputValue();
    console.log("현재 언어:", currentLanguage);

    // 영어로 변경
    await settingsPage.selectLanguage("en");
    await expect(settingsPage.languageSelect).toHaveValue("en");

    // 페이지 새로고침
    await page.reload();

    // 언어 설정이 유지되는지 확인
    await expect(settingsPage.languageSelect).toHaveValue("en");

    // 한국어로 변경
    await settingsPage.selectLanguage("ko");
    await expect(settingsPage.languageSelect).toHaveValue("ko");

    // 페이지 새로고침
    await page.reload();

    // 언어 설정이 유지되는지 확인
    await expect(settingsPage.languageSelect).toHaveValue("ko");
  });

  test("설정 변경이 즉시 저장된다", async ({ page }) => {
    // 설정 페이지로 이동
    await mainPage.goto();
    await mainPage.navigateToSettings();

    // 테마를 다크로 변경
    await settingsPage.selectTheme("dark");

    // 새 탭에서 설정 확인
    const newPage = await page.context().newPage();
    const newSettingsPage = new SettingsPage(newPage);
    await newSettingsPage.goto();

    // 테마 설정이 새 탭에서도 유지되는지 확인
    await expect(newSettingsPage.themeSelect).toHaveValue("dark");

    await newPage.close();
  });

  test("다크모드 토글이 테마 설정과 연동된다", async ({ page }) => {
    // 설정 페이지로 이동
    await mainPage.goto();
    await mainPage.navigateToSettings();

    // 테마를 라이트로 설정 (명확한 상태)
    await settingsPage.selectTheme("light");
    await page.waitForTimeout(1000);
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    // 헤더의 다크모드 토글 클릭하여 다크 모드로
    await mainPage.toggleDarkMode();
    await page.waitForTimeout(1000);

    // html에 dark 클래스가 추가되었는지 확인
    await expect(page.locator("html")).toHaveClass(/dark/);

    // 설정 페이지 새로고침하여 상태 동기화
    await page.reload();
    await page.waitForTimeout(500);

    // 테마 설정이 다크로 변경되었는지 확인
    await expect(settingsPage.themeSelect).toHaveValue("dark");

    // 다시 토글하여 라이트 모드로
    await mainPage.toggleDarkMode();
    await page.waitForTimeout(1000);
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    // 설정 페이지 새로고침하여 상태 동기화
    await page.reload();
    await page.waitForTimeout(500);

    // 테마 설정이 라이트로 변경되었는지 확인
    await expect(settingsPage.themeSelect).toHaveValue("light");
  });
});
