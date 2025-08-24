import { test, expect } from "@playwright/test";
import { MainPage } from "./page-objects/MainPage";

test.describe("핵심 네비게이션 흐름 테스트", () => {
  let mainPage: MainPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    await page.goto("http://localhost:5173");
    await page.waitForLoadState("networkidle");
  });

  test("모든 주요 페이지로의 네비게이션이 정상 작동한다", async ({ page }) => {
    // 홈페이지에서 시작 - 기본 요소들 확인
    await expect(page.locator('h1')).toBeVisible();
    await expect(mainPage.logo).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();

    // 레시피 검색 페이지로 이동
    await mainPage.navigationSearch.click();
    await expect(page).toHaveURL(/.*\/search/);
    await page.waitForLoadState("networkidle");
    await expect(page.locator('main')).toBeVisible();
    
    // 레시피 생성 페이지로 이동
    await mainPage.navigationGenerate.click();
    await expect(page).toHaveURL(/.*\/generate/);
    await page.waitForLoadState("networkidle");
    await expect(page.locator('main')).toBeVisible();

    // 즐겨찾기 페이지로 이동
    await mainPage.navigationFavorites.click();
    await expect(page).toHaveURL(/.*\/favorites/);
    await page.waitForLoadState("networkidle");
    await expect(page.locator('main')).toBeVisible();

    // 설정 페이지로 이동
    await mainPage.navigationSettings.click();
    await expect(page).toHaveURL(/.*\/settings/);
    await page.waitForLoadState("networkidle");
    await expect(page.locator('h1')).toContainText("설정");

    // 홈으로 다시 돌아가기
    await mainPage.navigationHome.click();
    await expect(page).toHaveURL(/.*\//);
    await expect(mainPage.logo).toBeVisible();
  });

  test("모바일 반응형 네비게이션이 작동한다", async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // 모바일에서 네비게이션 요소들 확인
    await expect(mainPage.logo).toBeVisible();
    await expect(mainPage.darkModeToggle).toBeVisible();

    // 모바일 네비게이션 메뉴 확인 (md:hidden 클래스로 숨겨진 메뉴들)
    const mobileNavLinks = page.locator('.md\\:hidden a[href]');
    await expect(mobileNavLinks.first()).toBeVisible();

    // 각 페이지로 모바일에서도 정상 이동 가능한지 확인
    await page.locator('.md\\:hidden a[href="/search"]').first().click();
    await expect(page).toHaveURL(/.*\/search/);
    
    await page.locator('.md\\:hidden a[href="/generate"]').first().click();
    await expect(page).toHaveURL(/.*\/generate/);
  });

  test("헤더가 모든 페이지에서 일관성 있게 표시된다", async ({ page }) => {
    const pages = ["/", "/search", "/generate", "/favorites", "/settings"];
    
    for (const pagePath of pages) {
      await page.goto(`http://localhost:5173${pagePath}`);
      await page.waitForLoadState("networkidle");
      
      // 모든 페이지에서 헤더 요소들이 존재하는지 확인
      await expect(mainPage.logo).toBeVisible();
      await expect(mainPage.darkModeToggle).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
      
      // 현재 페이지에 따른 active 상태 확인
      if (pagePath === "/") {
        await expect(page.locator('nav a[href="/"]')).toHaveClass(/text-orange-600/);
      } else {
        await expect(page.locator(`nav a[href="${pagePath}"]`)).toHaveClass(/text-orange-600/);
      }
      
      console.log(`✓ ${pagePath} 페이지 헤더 검증 완료`);
    }
  });

  test("페이지 로딩 성능이 적절한 수준이다", async ({ page }) => {
    const pages = [
      { path: "/", name: "홈페이지" },
      { path: "/search", name: "검색페이지" },
      { path: "/generate", name: "생성페이지" },
      { path: "/favorites", name: "즐겨찾기" },
      { path: "/settings", name: "설정페이지" }
    ];

    for (const pageInfo of pages) {
      const startTime = Date.now();
      
      await page.goto(`http://localhost:5173${pageInfo.path}`);
      await page.waitForLoadState("networkidle");
      
      const loadTime = Date.now() - startTime;
      console.log(`${pageInfo.name} 로딩 시간: ${loadTime}ms`);
      
      // 로딩 시간이 5초를 넘지 않는지 확인 (개발 환경 기준)
      expect(loadTime).toBeLessThan(5000);
      
      // 페이지 핵심 요소가 로딩되었는지 확인
      await expect(page.locator('main')).toBeVisible();
      await expect(mainPage.logo).toBeVisible();
    }
  });

  test("오류 페이지 처리가 정상적으로 작동한다", async ({ page }) => {
    // 존재하지 않는 페이지로 이동
    await page.goto("http://localhost:5173/nonexistent-page");
    
    // React Router의 기본 처리 또는 404 페이지 확인
    const pageContent = await page.textContent('body');
    console.log("404 페이지 내용:", pageContent?.substring(0, 200));
    
    // 최소한 빈 페이지가 아니라 어떤 내용이라도 표시되는지 확인
    await expect(page.locator('body')).not.toBeEmpty();
  });
});