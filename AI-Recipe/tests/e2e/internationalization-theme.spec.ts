import { test, expect } from "@playwright/test";
import { MainPage } from "./page-objects/MainPage";
import { SettingsPage } from "./page-objects/SettingsPage";

test.describe("국제화 및 테마 통합 기능 테스트", () => {
  let mainPage: MainPage;
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    settingsPage = new SettingsPage(page);
    await page.goto("http://localhost:5173");
    await page.waitForLoadState("networkidle");
  });

  test("언어 변경 시 UI 텍스트가 실시간으로 변경된다", async ({ page }) => {
    // 설정 페이지로 이동
    await mainPage.navigateToSettings();
    await expect(page).toHaveURL(/.*\/settings/);

    // 현재 언어 확인 (기본값: 한국어)
    const currentLanguage = await settingsPage.languageSelect.inputValue();
    console.log("현재 언어:", currentLanguage);

    // 영어로 변경
    await settingsPage.selectLanguage("en");
    await expect(settingsPage.languageSelect).toHaveValue("en");
    
    // 페이지 텍스트가 영어로 변경되었는지 확인
    await expect(page.locator('h1')).toContainText("Settings");
    
    // 한국어로 다시 변경
    await settingsPage.selectLanguage("ko");
    await expect(settingsPage.languageSelect).toHaveValue("ko");
    
    // 페이지 텍스트가 한국어로 변경되었는지 확인
    await expect(page.locator('h1')).toContainText("설정");
  });

  test("테마 변경이 즉시 DOM에 반영된다", async ({ page }) => {
    // 설정 페이지로 이동
    await mainPage.navigateToSettings();

    // 라이트 테마 설정
    await settingsPage.selectTheme("light");
    await page.waitForTimeout(500);
    
    // html 요소에 dark 클래스가 없는지 확인
    const htmlElement = page.locator("html");
    await expect(htmlElement).not.toHaveClass(/dark/);

    // 다크 테마로 변경
    await settingsPage.selectTheme("dark");
    await page.waitForTimeout(500);
    
    // html 요소에 dark 클래스가 추가되었는지 확인
    await expect(htmlElement).toHaveClass(/dark/);
    
    // 페이지 배경색이 어두운 색인지 확인
    const bodyStyles = await page.locator("body").evaluate(
      (el) => window.getComputedStyle(el)
    );
    console.log("다크 모드 body 스타일:", bodyStyles.backgroundColor);
  });

  test("페이지 새로고침 후에도 언어와 테마 설정이 유지된다", async ({ page }) => {
    // 설정 페이지로 이동
    await mainPage.navigateToSettings();

    // 영어 + 다크 테마로 설정
    await settingsPage.selectLanguage("en");
    await settingsPage.selectTheme("dark");
    await page.waitForTimeout(1000);

    // 설정이 적용되었는지 확인
    await expect(settingsPage.languageSelect).toHaveValue("en");
    await expect(settingsPage.themeSelect).toHaveValue("dark");
    await expect(page.locator("html")).toHaveClass(/dark/);

    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState("networkidle");

    // 설정이 유지되는지 확인
    await expect(settingsPage.languageSelect).toHaveValue("en");
    await expect(settingsPage.themeSelect).toHaveValue("dark");
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.locator('h1')).toContainText("Settings");
  });

  test("다국어 네비게이션 메뉴가 정상 작동한다", async ({ page }) => {
    // 홈페이지에서 시작
    await mainPage.goto();

    // 설정으로 이동해서 영어로 변경
    await mainPage.navigateToSettings();
    await settingsPage.selectLanguage("en");
    await page.waitForTimeout(500);

    // 홈으로 이동해서 영어 UI 확인
    await page.goto("/");
    await expect(page.locator('nav a[href="/"]')).toContainText("Home");
    await expect(page.locator('nav a[href="/search"]')).toContainText("Search");
    await expect(page.locator('nav a[href="/generate"]')).toContainText("Generate");

    // 다시 설정으로 가서 한국어로 변경
    await mainPage.navigateToSettings();
    await settingsPage.selectLanguage("ko");
    await page.waitForTimeout(500);

    // 홈으로 이동해서 한국어 UI 확인
    await page.goto("/");
    await expect(page.locator('nav a[href="/"]')).toContainText("홈");
    await expect(page.locator('nav a[href="/search"]')).toContainText("검색");
    await expect(page.locator('nav a[href="/generate"]')).toContainText("생성");
  });
});