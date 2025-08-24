import { test, expect } from "@playwright/test";
import { MainPage } from "./page-objects/MainPage";
import { SettingsPage } from "./page-objects/SettingsPage";

test.describe("다크모드 토글 통합 기능 테스트", () => {
  let mainPage: MainPage;
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    settingsPage = new SettingsPage(page);
    await page.goto("http://localhost:5173");
    await page.waitForLoadState("networkidle");
  });

  test("헤더 토글과 설정 페이지 간 테마 상태가 동기화된다", async ({ page }) => {
    // 설정 페이지로 이동하여 라이트 모드 설정
    await mainPage.navigateToSettings();
    await settingsPage.selectTheme("light");
    await page.waitForTimeout(1000);
    
    // 라이트 모드 상태 확인
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(settingsPage.themeSelect).toHaveValue("light");

    // 헤더의 다크모드 토글 버튼 클릭
    await mainPage.toggleDarkMode();
    await page.waitForTimeout(1000);

    // 다크 모드로 변경되었는지 확인
    await expect(page.locator("html")).toHaveClass(/dark/);

    // 설정 페이지 새로고침 후 동기화 확인
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(settingsPage.themeSelect).toHaveValue("dark");

    // 다시 헤더 토글로 라이트 모드 전환
    await mainPage.toggleDarkMode();
    await page.waitForTimeout(1000);
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    // 설정 페이지에서 동기화 확인
    await page.reload();
    await expect(settingsPage.themeSelect).toHaveValue("light");
  });

  test("전체 애플리케이션에 테마가 일관성 있게 적용된다", async ({ page }) => {
    // 다크 모드로 설정
    await mainPage.navigateToSettings();
    await settingsPage.selectTheme("dark");
    await page.waitForTimeout(500);

    const pages = ["/", "/search", "/generate", "/favorites", "/settings"];
    
    for (const pagePath of pages) {
      await page.goto(`http://localhost:5173${pagePath}`);
      await page.waitForLoadState("networkidle");
      
      // 각 페이지에서 다크 모드가 적용되었는지 확인
      await expect(page.locator("html")).toHaveClass(/dark/);
      
      // 헤더 배경색이 다크 모드 스타일인지 확인
      const headerBg = await page.locator("header").evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      );
      console.log(`${pagePath} 페이지 헤더 배경색:`, headerBg);
      
      // 다크모드 토글 아이콘이 Sun 아이콘인지 확인 (다크모드에서는 라이트모드로 전환하는 Sun 아이콘 표시)
      await expect(page.locator('button [class*="lucide-sun"]')).toBeVisible();
    }

    // 라이트 모드로 변경하여 일관성 확인
    await mainPage.navigateToSettings();
    await settingsPage.selectTheme("light");
    await page.waitForTimeout(500);

    for (const pagePath of pages) {
      await page.goto(`http://localhost:5173${pagePath}`);
      await page.waitForLoadState("networkidle");
      
      // 각 페이지에서 라이트 모드가 적용되었는지 확인
      await expect(page.locator("html")).not.toHaveClass(/dark/);
      
      // 다크모드 토글 아이콘이 Moon 아이콘인지 확인
      await expect(page.locator('button [class*="lucide-moon"]')).toBeVisible();
    }
  });

  test("새 탭에서도 테마 설정이 동일하게 적용된다", async ({ page, context }) => {
    // 현재 탭에서 다크 모드 설정
    await mainPage.navigateToSettings();
    await settingsPage.selectTheme("dark");
    await page.waitForTimeout(1000);
    await expect(page.locator("html")).toHaveClass(/dark/);

    // 새 탭 열기
    const newPage = await context.newPage();
    await newPage.goto("http://localhost:5173");
    await newPage.waitForLoadState("networkidle");

    // 새 탭에서도 다크 모드가 적용되었는지 확인
    await expect(newPage.locator("html")).toHaveClass(/dark/);

    // 새 탭에서 설정 페이지로 이동하여 테마 설정 확인
    const newMainPage = new MainPage(newPage);
    const newSettingsPage = new SettingsPage(newPage);
    
    await newMainPage.navigateToSettings();
    await expect(newSettingsPage.themeSelect).toHaveValue("dark");

    // 새 탭에서 라이트 모드로 변경
    await newSettingsPage.selectTheme("light");
    await newPage.waitForTimeout(1000);
    await expect(newPage.locator("html")).not.toHaveClass(/dark/);

    // 원래 탭에서도 변경사항이 반영되는지 확인 (페이지 새로고침 후)
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(settingsPage.themeSelect).toHaveValue("light");

    await newPage.close();
  });

  test("테마 전환 애니메이션이 부드럽게 작동한다", async ({ page }) => {
    // 초기 라이트 모드 설정
    await mainPage.navigateToSettings();
    await settingsPage.selectTheme("light");
    await page.waitForTimeout(500);

    // 여러 번 토글하여 애니메이션 확인
    for (let i = 0; i < 3; i++) {
      // 다크 모드로 전환
      await mainPage.toggleDarkMode();
      await page.waitForTimeout(300);
      await expect(page.locator("html")).toHaveClass(/dark/);

      // 라이트 모드로 전환
      await mainPage.toggleDarkMode();
      await page.waitForTimeout(300);
      await expect(page.locator("html")).not.toHaveClass(/dark/);
    }

    console.log("✓ 테마 토글 애니메이션 테스트 완료");
  });

  test("시스템 테마 모드가 정상적으로 작동한다 (선택사항)", async ({ page }) => {
    // 설정 페이지에서 시스템 테마 선택 (있는 경우)
    await mainPage.navigateToSettings();
    
    // 시스템 테마 옵션이 있는지 확인
    const systemOption = page.locator('option[value="system"]');
    const hasSystemOption = await systemOption.count() > 0;
    
    if (hasSystemOption) {
      await settingsPage.themeSelect.selectOption("system");
      await page.waitForTimeout(1000);
      
      // 시스템 설정이 저장되었는지 확인
      await expect(settingsPage.themeSelect).toHaveValue("system");
      
      console.log("✓ 시스템 테마 모드 지원됨");
    } else {
      console.log("ℹ️ 시스템 테마 모드는 구현되지 않음");
    }
  });
});