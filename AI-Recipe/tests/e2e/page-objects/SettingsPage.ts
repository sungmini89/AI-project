import { type Locator, type Page } from '@playwright/test';

export class SettingsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly backButton: Locator;
  readonly saveButton: Locator;
  readonly savedMessage: Locator;
  
  // API Settings
  readonly spoonacularApiKeyInput: Locator;
  readonly edamamAppIdInput: Locator;
  readonly edamamAppKeyInput: Locator;
  readonly customAiApiKeyInput: Locator;
  readonly customAiBaseUrlInput: Locator;
  readonly showPasswordButtons: Locator;
  readonly apiConnectionTestButtons: Locator;
  readonly apiStatusBadges: Locator;
  
  // User Preferences
  readonly dietaryRestrictionsInput: Locator;
  readonly addDietaryRestrictionButton: Locator;
  readonly dietaryRestrictionBadges: Locator;
  readonly allergiesInput: Locator;
  readonly addAllergyButton: Locator;
  readonly allergyBadges: Locator;
  readonly preferredCuisineInput: Locator;
  readonly maxCookingTimeInput: Locator;
  readonly maxCaloriesInput: Locator;
  
  // App Settings
  readonly themeSelect: Locator;
  readonly languageSelect: Locator;
  readonly notificationsCheckbox: Locator;
  readonly analyticsCheckbox: Locator;
  
  // Data Management
  readonly exportButton: Locator;
  readonly importButton: Locator;
  readonly resetButton: Locator;
  readonly warningMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Header elements
    this.pageTitle = page.locator('h1:has-text("설정")');
    this.backButton = page.locator('button:has-text("홈으로 돌아가기")');
    this.saveButton = page.locator('button:has-text("설정 저장")');
    this.savedMessage = page.locator('text=설정이 저장되었습니다');
    
    // API Settings
    this.spoonacularApiKeyInput = page.locator('#spoonacularApiKey');
    this.edamamAppIdInput = page.locator('#edamamAppId');
    this.edamamAppKeyInput = page.locator('#edamamAppKey');
    this.customAiApiKeyInput = page.locator('#customAiApiKey');
    this.customAiBaseUrlInput = page.locator('#customAiBaseUrl');
    this.showPasswordButtons = page.locator('button:has(svg)').filter({ hasText: /Eye/ });
    this.apiConnectionTestButtons = page.locator('button:has-text("연결 테스트")');
    this.apiStatusBadges = page.locator('.bg-green-100, .bg-red-100').locator('text=연결됨, text=연결 안됨');
    
    // User Preferences
    this.dietaryRestrictionsInput = page.locator('input[placeholder*="식이 제한"]');
    this.addDietaryRestrictionButton = this.dietaryRestrictionsInput.locator('..').locator('button:has-text("추가")');
    this.dietaryRestrictionBadges = page.locator('[variant="secondary"]');
    this.allergiesInput = page.locator('input[placeholder*="알레르기"]');
    this.addAllergyButton = this.allergiesInput.locator('..').locator('button:has-text("추가")');
    this.allergyBadges = page.locator('[variant="destructive"]');
    this.preferredCuisineInput = page.locator('#preferredCuisine');
    this.maxCookingTimeInput = page.locator('#maxCookingTime');
    this.maxCaloriesInput = page.locator('#maxCalories');
    
    // App Settings
    this.themeSelect = page.locator('#theme');
    this.languageSelect = page.locator('#language');
    this.notificationsCheckbox = page.locator('#enableNotifications');
    this.analyticsCheckbox = page.locator('#enableAnalytics');
    
    // Data Management
    this.exportButton = page.locator('button:has-text("설정 내보내기")');
    this.importButton = page.locator('button:has-text("설정 가져오기")');
    this.resetButton = page.locator('button:has-text("설정 초기화")');
    this.warningMessage = page.locator('text=API 키는 민감한 정보입니다');
  }

  async goto() {
    await this.page.goto('/settings');
    await this.page.waitForLoadState('networkidle');
  }

  async goBack() {
    await this.backButton.click();
    await this.page.waitForURL('/');
  }

  async fillApiKey(apiType: 'spoonacular' | 'edamam-id' | 'edamam-key' | 'custom-ai', value: string) {
    const inputMap = {
      'spoonacular': this.spoonacularApiKeyInput,
      'edamam-id': this.edamamAppIdInput,
      'edamam-key': this.edamamAppKeyInput,
      'custom-ai': this.customAiApiKeyInput
    };
    
    await inputMap[apiType].fill(value);
  }

  async fillCustomAiBaseUrl(value: string) {
    await this.customAiBaseUrlInput.fill(value);
  }

  async togglePasswordVisibility(apiType: string) {
    // Find the specific show/hide button for the API type
    const container = this.page.locator(`#${apiType}ApiKey`).locator('..');
    await container.locator('button:has(svg)').click();
  }

  async testApiConnection(apiType: string) {
    // Find the specific test button for the API type
    const container = this.page.locator(`#${apiType}ApiKey`).locator('../..');
    await container.locator('button:has-text("연결 테스트")').click();
  }

  async addDietaryRestriction(restriction: string) {
    await this.dietaryRestrictionsInput.fill(restriction);
    await this.addDietaryRestrictionButton.click();
  }

  async addAllergy(allergy: string) {
    await this.allergiesInput.fill(allergy);
    await this.addAllergyButton.click();
  }

  async removeDietaryRestriction(restriction: string) {
    await this.page.locator(`text=${restriction} ×`).click();
  }

  async removeAllergy(allergy: string) {
    await this.page.locator(`text=${allergy} ×`).click();
  }

  async setPreferredCuisine(cuisine: string) {
    await this.preferredCuisineInput.fill(cuisine);
  }

  async setMaxCookingTime(minutes: number) {
    await this.maxCookingTimeInput.fill(minutes.toString());
  }

  async setMaxCalories(calories: number) {
    await this.maxCaloriesInput.fill(calories.toString());
  }

  async selectTheme(theme: 'system' | 'light' | 'dark') {
    await this.themeSelect.selectOption(theme);
  }

  async selectLanguage(language: 'ko' | 'en') {
    await this.languageSelect.selectOption(language);
  }

  async toggleNotifications(enabled: boolean) {
    if (enabled !== await this.notificationsCheckbox.isChecked()) {
      await this.notificationsCheckbox.click();
    }
  }

  async toggleAnalytics(enabled: boolean) {
    if (enabled !== await this.analyticsCheckbox.isChecked()) {
      await this.analyticsCheckbox.click();
    }
  }

  async saveSettings() {
    await this.saveButton.click();
    await this.savedMessage.waitFor({ timeout: 5000 });
  }

  async exportSettings() {
    await this.exportButton.click();
  }

  async importSettings(filePath: string) {
    // This would need to be implemented with file upload handling
    await this.importButton.click();
  }

  async resetSettings() {
    await this.resetButton.click();
  }

  async isPageLoaded() {
    return await this.pageTitle.isVisible() && await this.saveButton.isVisible();
  }

  async isWarningVisible() {
    return await this.warningMessage.isVisible();
  }
}