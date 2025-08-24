import { test, expect } from "@playwright/test";
import { MainPage } from "./page-objects/MainPage";

test.describe("메인 페이지", () => {
  let mainPage: MainPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    await mainPage.goto();
  });

  test("메인 페이지가 정상적으로 로드된다", async ({ page }) => {
    // 페이지 제목 확인
    await expect(page).toHaveTitle(/AI Recipe/);

    // 로고가 표시되는지 확인
    await expect(mainPage.isLogoVisible()).resolves.toBe(true);

    // 메인 콘텐츠가 표시되는지 확인
    await expect(mainPage.isMainContentVisible()).resolves.toBe(true);

    // 네비게이션 링크들이 모두 표시되는지 확인
    await expect(mainPage.areNavigationLinksVisible()).resolves.toBe(true);
  });

  test("AI 레시피 생성 버튼이 작동한다", async ({ page }) => {
    await mainPage.clickGenerateRecipe();

    // URL이 변경되었는지 확인
    await expect(page).toHaveURL("/generate");

    // 페이지가 로드되었는지 확인 (실제 페이지 구조에 맞게)
    await expect(page.locator('h1:has-text("AI 레시피 생성")')).toBeVisible();
  });

  test("레시피 검색 버튼이 작동한다", async ({ page }) => {
    await mainPage.clickSearchRecipe();

    // URL이 변경되었는지 확인
    await expect(page).toHaveURL("/search");

    // 페이지가 로드되었는지 확인 (실제 페이지 구조에 맞게)
    await expect(
      page.locator('h3:has-text("레시피를 검색해보세요")')
    ).toBeVisible();
  });

  test("네비게이션 메뉴가 정상적으로 작동한다", async ({ page }) => {
    // 설정 페이지로 이동
    await mainPage.navigateToSettings();
    await expect(page).toHaveURL("/settings");

    // 홈으로 다시 이동
    await page.goBack();
    await expect(page).toHaveURL("/");

    // 즐겨찾기 페이지로 이동
    await mainPage.navigateToFavorites();
    await expect(page).toHaveURL("/favorites");
  });

  test("카테고리 버튼들이 검색 페이지로 연결된다", async ({ page }) => {
    // 한식 카테고리 클릭
    await mainPage.clickCategory("한식");

    // 검색 페이지로 이동하고 카테고리 파라미터가 있는지 확인 (URL 인코딩 고려)
    await expect(page).toHaveURL(/\/search\?category=/);
    const url = page.url();
    expect(url).toContain("category=");
  });

  test("기본 네비게이션이 작동한다", async ({ page }) => {
    // 홈페이지로 이동
    await mainPage.goto();

    // 기본 요소들이 표시되는지 확인
    await expect(mainPage.mainTitle).toBeVisible();
    await expect(mainPage.generateRecipeButton).toBeVisible();
    await expect(mainPage.searchRecipeButton).toBeVisible();
  });
});
