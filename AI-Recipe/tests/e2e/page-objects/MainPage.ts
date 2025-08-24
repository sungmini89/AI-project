import { type Locator, type Page } from "@playwright/test";

export class MainPage {
  readonly page: Page;
  readonly logo: Locator;
  readonly mainTitle: Locator;
  readonly mainDescription: Locator;
  readonly generateRecipeButton: Locator;
  readonly searchRecipeButton: Locator;
  readonly navigationHome: Locator;
  readonly navigationSearch: Locator;
  readonly navigationGenerate: Locator;
  readonly navigationFavorites: Locator;
  readonly navigationSettings: Locator;
  readonly darkModeToggle: Locator;
  readonly categoryButtons: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header elements
    this.logo = page.locator('a:has-text("AI Recipe")').first();
    this.darkModeToggle = page.locator(
      'button:has([class*="lucide-moon"]), button:has([class*="lucide-sun"])'
    );

    // Navigation elements
    this.navigationHome = page.locator('nav a[href="/"]').first();
    this.navigationSearch = page.locator('nav a[href="/search"]').first();
    this.navigationGenerate = page.locator('nav a[href="/generate"]').first();
    this.navigationFavorites = page.locator('nav a[href="/favorites"]').first();
    this.navigationSettings = page.locator('nav a[href="/settings"]').first();

    // Main content elements
    this.mainTitle = page.locator('h1:has-text("AI Recipe")').first();
    this.mainDescription = page.locator("text=AI가 추천하는 맞춤형 레시피로");
    this.generateRecipeButton = page
      .locator('a[href="/generate"]')
      .filter({ hasText: "AI 레시피 생성" });
    this.searchRecipeButton = page
      .locator('a[href="/search"]')
      .filter({ hasText: "레시피 검색" });

    // Category buttons
    this.categoryButtons = page.locator(
      'a:has-text("한식"), a:has-text("양식"), a:has-text("일식")'
    );
  }

  async goto() {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }

  async clickGenerateRecipe() {
    await this.generateRecipeButton.click();
    await this.page.waitForURL("/generate");
  }

  async clickSearchRecipe() {
    await this.searchRecipeButton.click();
    await this.page.waitForURL("/search");
  }

  async navigateToSettings() {
    await this.navigationSettings.click();
    await this.page.waitForURL("/settings");
  }

  async navigateToFavorites() {
    await this.navigationFavorites.click();
    await this.page.waitForURL("/favorites");
  }

  async toggleDarkMode() {
    await this.darkModeToggle.click();
  }

  async clickCategory(category: string) {
    await this.page.locator(`a:has-text("${category}")`).click();
  }

  async isLogoVisible() {
    return await this.logo.isVisible();
  }

  async isMainContentVisible() {
    return (
      (await this.mainTitle.isVisible()) &&
      (await this.mainDescription.isVisible())
    );
  }

  async areNavigationLinksVisible() {
    return (
      (await this.navigationHome.isVisible()) &&
      (await this.navigationSearch.isVisible()) &&
      (await this.navigationGenerate.isVisible()) &&
      (await this.navigationFavorites.isVisible()) &&
      (await this.navigationSettings.isVisible())
    );
  }
}
