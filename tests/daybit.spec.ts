import { test, expect } from '@playwright/test';

test.describe('DayBit Application', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display the main components', async ({ page }) => {
    await page.goto('/');
    
    // Check header
    await expect(page.getByText('DayBit')).toBeVisible();
    await expect(page.getByText('One Word, Every Day')).toBeVisible();
    
    // Check input form
    await expect(page.getByPlaceholder("How's your day?")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log Word' })).toBeVisible();
    
    // Check recent words section (should show no entries)
    await expect(page.getByText('Recent Words')).toBeVisible();
    await expect(page.getByText('No entries yet!')).toBeVisible();
    
    // Check heatmap
    await expect(page.getByText('Your Year at a Glance')).toBeVisible();
  });

  test('should validate input correctly', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder("How's your day?");
    const button = page.getByRole('button', { name: 'Log Word' });
    
    // Empty input should disable button
    await expect(button).toBeDisabled();
    
    // Input with spaces should disable button
    await input.fill('hello world');
    await expect(button).toBeDisabled();
    
    // Valid single word should enable button
    await input.fill('happy');
    await expect(button).toBeEnabled();
    
    // Too long word should disable button
    await input.fill('verylongwordthatexceedstwentycharacters');
    await expect(button).toBeDisabled();
  });

  test('should successfully add a word entry', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder("How's your day?");
    const button = page.getByRole('button', { name: 'Log Word' });
    
    // Add a word
    await input.fill('productive');
    await button.click();
    
    // Check for success toast
    await expect(page.getByText('Logged: productive')).toBeVisible();
    
    // Check that input is cleared
    await expect(input).toHaveValue('');
    
    // Check that recent words section is updated
    await expect(page.getByText('No entries yet!')).not.toBeVisible();
    await expect(page.getByText('productive')).toBeVisible();
    
    // Check that today is marked
    await expect(page.getByText('Today')).toBeVisible();
  });

  test('should update existing entry for the same day', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder("How's your day?");
    const button = page.getByRole('button', { name: 'Log Word' });
    
    // Add first word
    await input.fill('happy');
    await button.click();
    await expect(page.getByText('Logged: happy')).toBeVisible();
    
    // Wait for toast to disappear
    await page.waitForTimeout(1000);
    
    // Add second word for the same day
    await input.fill('excited');
    await expect(button).toHaveText('Update Today');
    await button.click();
    
    // Check for update toast
    await expect(page.getByText("Updated today's word: excited")).toBeVisible();
    
    // Check that only the new word is shown
    await expect(page.getByText('excited')).toBeVisible();
    await expect(page.getByText('happy')).not.toBeVisible();
  });

  test('should display character count', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder("How's your day?");
    
    // Check initial character count
    await expect(page.getByText('0/20')).toBeVisible();
    
    // Type word and check count updates
    await input.fill('hello');
    await expect(page.getByText('5/20')).toBeVisible();
    
    // Fill to maximum
    await input.fill('12345678901234567890');
    await expect(page.getByText('20/20')).toBeVisible();
  });

  test('should show placeholder text when entry exists for today', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder("How's your day?");
    const button = page.getByRole('button', { name: 'Log Word' });
    
    // Add a word
    await input.fill('amazing');
    await button.click();
    
    // Wait for success and check placeholder changes
    await expect(page.getByText('Logged: amazing')).toBeVisible();
    await page.waitForTimeout(1000);
    
    // Placeholder should show today's word
    await expect(page.getByPlaceholder('Today: "amazing"')).toBeVisible();
  });

  test('should persist data across page reloads', async ({ page }) => {
    await page.goto('/');
    
    // Add a word
    await page.getByPlaceholder("How's your day?").fill('persistent');
    await page.getByRole('button', { name: 'Log Word' }).click();
    await expect(page.getByText('Logged: persistent')).toBeVisible();
    
    // Reload page
    await page.reload();
    
    // Check that data is still there
    await expect(page.getByText('persistent')).toBeVisible();
    await expect(page.getByPlaceholder('Today: "persistent"')).toBeVisible();
  });

  test('should show footer with entry count', async ({ page }) => {
    await page.goto('/');
    
    // Initially should show 0 words logged
    await expect(page.getByText('0 words logged')).toBeVisible();
    
    // Add a word
    await page.getByPlaceholder("How's your day?").fill('counted');
    await page.getByRole('button', { name: 'Log Word' }).click();
    await expect(page.getByText('Logged: counted')).toBeVisible();
    
    // Should now show 1 word logged
    await expect(page.getByText('1 words logged')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    
    // On desktop, components should be side by side
    const heatmap = page.getByText('Your Year at a Glance');
    await expect(heatmap).toBeVisible();
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // All components should still be visible on mobile
    await expect(page.getByText('DayBit')).toBeVisible();
    await expect(page.getByPlaceholder("How's your day?")).toBeVisible();
    await expect(page.getByText('Your Year at a Glance')).toBeVisible();
  });

  test('should take screenshot of the application', async ({ page }) => {
    await page.goto('/');
    
    // Add some test data
    await page.getByPlaceholder("How's your day?").fill('screenshot');
    await page.getByRole('button', { name: 'Log Word' }).click();
    await expect(page.getByText('Logged: screenshot')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/daybit-with-entry.png',
      fullPage: true 
    });
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder("How's your day?");
    const button = page.getByRole('button', { name: 'Log Word' });
    
    // Input should be focused on load (autofocus)
    await expect(input).toBeFocused();
    
    // Type and submit with Enter
    await input.fill('keyboard');
    await input.press('Enter');
    
    // Should submit successfully
    await expect(page.getByText('Logged: keyboard')).toBeVisible();
  });
});