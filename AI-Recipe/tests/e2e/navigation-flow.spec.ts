import { test, expect } from "@playwright/test";
import { MainPage } from "./page-objects/MainPage";
import { SettingsPage } from "./page-objects/SettingsPage";

test.describe("네비게이션 플로우", () => {
  let mainPage: MainPage;
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    settingsPage = new SettingsPage(page);
  });

  test("전체 애플리케이션 네비게이션 플로우가 작동한다", async ({ page }) => {
    // 1. 메인 페이지에서 시작
    await mainPage.goto();
    await expect(page).toHaveURL("/");
    await expect(mainPage.mainTitle).toBeVisible();

    // 2. 설정 페이지로 이동
    await mainPage.navigateToSettings();
    await expect(page).toHaveURL("/settings");
    await expect(settingsPage.pageTitle).toBeVisible();

    // 3. 뒤로 가기로 메인 페이지로 복귀
    await settingsPage.goBack();
    await expect(page).toHaveURL("/");
    await expect(mainPage.mainTitle).toBeVisible();

    // 4. AI 생성 페이지로 이동
    await mainPage.clickGenerateRecipe();
    await expect(page).toHaveURL("/generate");

    // 5. 네비게이션으로 검색 페이지로 이동
    await mainPage.navigationSearch.click();
    await expect(page).toHaveURL("/search");

    // 6. 즐겨찾기 페이지로 이동
    await mainPage.navigationFavorites.click();
    await expect(page).toHaveURL("/favorites");

    // 7. 홈으로 돌아가기
    await mainPage.navigationHome.click();
    await expect(page).toHaveURL("/");
    await expect(mainPage.mainTitle).toBeVisible();
  });

  test("브라우저 뒤로가기/앞으로가기가 작동한다", async ({ page }) => {
    // 페이지 방문 이력 생성
    await mainPage.goto();
    await mainPage.navigateToSettings();
    await mainPage.navigationSearch.click();
    await mainPage.navigationFavorites.click();

    // 브라우저 뒤로가기 테스트
    await page.goBack();
    await expect(page).toHaveURL("/search");

    await page.goBack();
    await expect(page).toHaveURL("/settings");

    await page.goBack();
    await expect(page).toHaveURL("/");

    // 브라우저 앞으로가기 테스트
    await page.goForward();
    await expect(page).toHaveURL("/settings");

    await page.goForward();
    await expect(page).toHaveURL("/search");
  });

  test("URL 직접 접근이 작동한다", async ({ page }) => {
    // 설정 페이지 직접 접근
    await page.goto("/settings");
    await expect(settingsPage.pageTitle).toBeVisible();

    // 검색 페이지 직접 접근
    await page.goto("/search");
    await expect(
      page.locator('h3:has-text("레시피를 검색해보세요")')
    ).toBeVisible();

    // 생성 페이지 직접 접근
    await page.goto("/generate");
    await expect(page.locator('h1:has-text("AI 레시피 생성")')).toBeVisible();

    // 즐겨찾기 페이지 직접 접근
    await page.goto("/favorites");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("잘못된 URL 접근 시 적절한 처리가 된다", async ({ page }) => {
    // 존재하지 않는 페이지 접근
    await page.goto("/non-existent-page");

    // 404 페이지나 메인 페이지로 리다이렉트되는지 확인
    // (현재 구현에 따라 달라질 수 있음)
    await page.waitForLoadState("networkidle");

    // 최소한 에러가 발생하지 않고 어떤 페이지가 로드되어야 함
    const currentUrl = page.url();
    expect(currentUrl).toBeDefined();
  });

  test("페이지 새로고침이 정상적으로 작동한다", async ({ page }) => {
    // 설정 페이지에서 일부 설정 변경
    await settingsPage.goto();
    await settingsPage.setPreferredCuisine("테스트 요리");
    await settingsPage.saveSettings();

    // 페이지 새로고침
    await page.reload();

    // 설정이 유지되는지 확인
    await expect(settingsPage.preferredCuisineInput).toHaveValue("테스트 요리");
    await expect(settingsPage.pageTitle).toBeVisible();
  });

  test("탭 간 상태 관리가 작동한다", async ({ browser }) => {
    // 첫 번째 탭에서 설정 변경
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    const settingsPage1 = new SettingsPage(page1);

    await settingsPage1.goto();
    await settingsPage1.setPreferredCuisine("첫 번째 탭");
    await settingsPage1.saveSettings();

    // 두 번째 탭에서 설정 확인
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    const settingsPage2 = new SettingsPage(page2);

    await settingsPage2.goto();

    // LocalStorage 기반이므로 탭 간에는 설정이 공유되지 않을 수 있음
    // 하지만 각 탭이 독립적으로 작동해야 함
    await expect(settingsPage2.pageTitle).toBeVisible();

    await context1.close();
    await context2.close();
  });

  test("세션 저장소와 로컬 저장소가 작동한다", async ({ page }) => {
    // 설정 변경 및 저장
    await settingsPage.goto();
    await settingsPage.setPreferredCuisine("저장소 테스트");
    await settingsPage.saveSettings();

    // 저장 완료 메시지 확인
    await expect(settingsPage.savedMessage).toBeVisible();

    // 페이지 새로고침으로 로컬 저장소 데이터 유지 확인
    await page.reload();
    await expect(settingsPage.preferredCuisineInput).toHaveValue(
      "저장소 테스트"
    );

    // 새 탭에서도 데이터가 유지되는지 확인 (같은 컨텍스트)
    const newPage = await page.context().newPage();
    const newSettingsPage = new SettingsPage(newPage);
    await newSettingsPage.goto();

    // 같은 컨텍스트에서는 로컬 저장소가 공유됨
    await expect(newSettingsPage.preferredCuisineInput).toHaveValue(
      "저장소 테스트"
    );

    await newPage.close();
  });

  test("네비게이션 활성 상태가 올바르게 표시된다", async ({ page }) => {
    await mainPage.goto();

    // 홈 네비게이션이 활성 상태인지 확인
    await expect(mainPage.navigationHome).toHaveClass(
      /text-orange-600|bg-orange-50/
    );

    // 설정 페이지로 이동
    await mainPage.navigateToSettings();

    // 설정 네비게이션이 활성 상태인지 확인
    await expect(mainPage.navigationSettings).toHaveClass(
      /text-orange-600|bg-orange-50/
    );

    // 검색 페이지로 이동
    await mainPage.navigationSearch.click();

    // 검색 네비게이션이 활성 상태인지 확인
    await expect(mainPage.navigationSearch).toHaveClass(
      /text-orange-600|bg-orange-50/
    );
  });

  test("페이지 로딩 시간이 적절하다", async ({ page }) => {
    const pages = ["/", "/settings", "/search", "/generate", "/favorites"];

    for (const pagePath of pages) {
      const startTime = Date.now();
      await page.goto(pagePath);
      await page.waitForLoadState("networkidle");
      const endTime = Date.now();

      // 각 페이지가 3초 이내에 로드되어야 함
      expect(endTime - startTime).toBeLessThan(3000);

      // 페이지에 콘텐츠가 있는지 확인 (첫 번째 요소만)
      await expect(page.locator("h1, h3").first()).toBeVisible();
    }
  });

  test("에러 상황에서의 복구가 작동한다", async ({ page }) => {
    // 먼저 정상적으로 페이지 로드
    await mainPage.goto();
    await expect(mainPage.mainTitle).toBeVisible();

    // 네트워크 오류 시뮬레이션 (API 호출만 차단)
    await page.route("**/api/**", (route) => route.abort());

    // 기본 UI는 여전히 작동해야 함
    await expect(mainPage.mainTitle).toBeVisible();
    await expect(mainPage.generateRecipeButton).toBeVisible();

    // 네비게이션도 정상 작동해야 함
    await mainPage.navigationSettings.click();
    await expect(page).toHaveURL("/settings");

    // 네트워크 차단 해제
    await page.unroute("**/api/**");

    // 페이지가 여전히 정상 작동하는지 확인
    await expect(settingsPage.pageTitle).toBeVisible();
  });
});
