import { test, expect } from '@playwright/test';

test.describe('DayBit UI/UX Comprehensive Check', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should have proper typography and contrast', async ({ page }) => {
    await page.goto('/');
    
    // Check main heading
    const title = page.getByText('DayBit');
    await expect(title).toBeVisible();
    await expect(title).toHaveClass(/font-bold/);
    
    // Check subtitle
    const subtitle = page.getByText('One Word, Every Day');
    await expect(subtitle).toBeVisible();
    
    // Check Recent Words heading
    const recentWordsHeading = page.getByText('Recent Words');
    await expect(recentWordsHeading).toBeVisible();
    
    // Check heatmap heading
    const heatmapHeading = page.getByText('Your Year at a Glance');
    await expect(heatmapHeading).toBeVisible();
  });

  test('should have proper input field styling and functionality', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder("How's your day?");
    const button = page.getByRole('button', { name: 'Log Word' });
    
    // Check input is visible and accessible
    await expect(input).toBeVisible();
    await expect(input).toBeFocused(); // Should have autofocus
    
    // Check character counter
    await expect(page.getByText('0/20')).toBeVisible();
    
    // Test typing
    await input.fill('testing');
    await expect(page.getByText('7/20')).toBeVisible();
    
    // Check button styling
    await expect(button).toBeVisible();
    await expect(button).toHaveClass(/bg-green-600/);
    
    // Test input validation styling
    await input.fill('word with spaces');
    await expect(button).toBeDisabled();
    
    await input.fill('validword');
    await expect(button).toBeEnabled();
  });

  test('should display heatmap with proper grid layout', async ({ page }) => {
    await page.goto('/');
    
    // Check heatmap container
    const heatmapContainer = page.locator('.heatmap-container').first();
    await expect(heatmapContainer).toBeVisible();
    
    // Check for month labels
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (const month of monthLabels) {
      await expect(page.getByText(month).first()).toBeVisible();
    }
    
    // Check for day labels
    const dayLabels = ['Mon', 'Wed', 'Fri'];
    for (const day of dayLabels) {
      await expect(page.getByText(day).first()).toBeVisible();
    }
    
    // Check legend
    await expect(page.getByText('Less')).toBeVisible();
    await expect(page.getByText('More')).toBeVisible();
  });

  test('should show proper empty state', async ({ page }) => {
    await page.goto('/');
    
    // Check empty state in Recent Words
    await expect(page.getByText('No entries yet!')).toBeVisible();
    await expect(page.getByText('Start by logging your first word above.')).toBeVisible();
    
    // Check footer shows 0 words
    await expect(page.getByText('0 words logged')).toBeVisible();
  });

  test('should handle word entry flow with proper UI feedback', async ({ page }) => {
    await page.goto('/');
    
    const input = page.getByPlaceholder("How's your day?");
    const button = page.getByRole('button', { name: 'Log Word' });
    
    // Enter a word
    await input.fill('productive');
    await button.click();
    
    // Check for toast notification
    await expect(page.getByText('Logged: productive')).toBeVisible();
    
    // Wait for toast to disappear
    await page.waitForTimeout(3500);
    
    // Check input cleared
    await expect(input).toHaveValue('');
    
    // Check placeholder updated
    await expect(page.getByPlaceholder('Today: "productive"')).toBeVisible();
    
    // Check button text changed
    await expect(page.getByRole('button', { name: 'Update Today' })).toBeVisible();
    
    // Check Recent Words updated
    await expect(page.getByText('productive')).toBeVisible();
    await expect(page.getByText('Today')).toBeVisible();
    
    // Check footer updated
    await expect(page.getByText('1 words logged')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // All main components should be visible on mobile
    await expect(page.getByText('DayBit')).toBeVisible();
    await expect(page.getByText('One Word, Every Day')).toBeVisible();
    await expect(page.getByPlaceholder("How's your day?")).toBeVisible();
    await expect(page.getByText('Your Year at a Glance')).toBeVisible();
    await expect(page.getByText('Recent Words')).toBeVisible();
    
    // Input should be properly sized
    const input = page.getByPlaceholder("How's your day?");
    await expect(input).toBeVisible();
    
    // Heatmap should scroll horizontally on mobile
    const heatmapContainer = page.locator('.overflow-x-auto').first();
    await expect(heatmapContainer).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check layout adapts properly
    await expect(page.getByText('DayBit')).toBeVisible();
    await expect(page.getByText('Your Year at a Glance')).toBeVisible();
    
    // Components should have proper spacing
    const input = page.getByPlaceholder("How's your day?");
    await expect(input).toBeVisible();
  });

  test('should be responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    
    // Check desktop layout with side-by-side arrangement
    await expect(page.getByText('DayBit')).toBeVisible();
    await expect(page.getByText('Your Year at a Glance')).toBeVisible();
    
    // Should have proper grid layout on desktop
    const heatmapContainer = page.locator('.heatmap-container').first();
    await expect(heatmapContainer).toBeVisible();
  });

  test('should handle hover interactions', async ({ page }) => {
    await page.goto('/');
    
    // Add an entry first
    const input = page.getByPlaceholder("How's your day?");
    const button = page.getByRole('button', { name: 'Log Word' });
    
    await input.fill('hover');
    await button.click();
    await page.waitForTimeout(1000);
    
    // Test button hover state
    const updateButton = page.getByRole('button', { name: 'Update Today' });
    await updateButton.hover();
    
    // Heatmap squares should be hoverable (has cursor-pointer class)
    const heatmapSquares = page.locator('.cursor-pointer').first();
    await expect(heatmapSquares).toBeVisible();
  });

  test('should have proper accessibility features', async ({ page }) => {
    await page.goto('/');
    
    // Check form labels and ARIA attributes
    const input = page.getByPlaceholder("How's your day?");
    await expect(input).toHaveAttribute('maxlength', '20');
    await expect(input).toHaveAttribute('type', 'text');
    
    // Check button accessibility
    const button = page.getByRole('button', { name: 'Log Word' });
    await expect(button).toHaveAttribute('type', 'submit');
    
    // Check headings hierarchy
    const mainHeading = page.getByRole('heading', { name: 'DayBit' });
    await expect(mainHeading).toBeVisible();
  });

  test('should have proper color scheme and branding', async ({ page }) => {
    await page.goto('/');
    
    // Check green theme colors
    const button = page.getByRole('button', { name: 'Log Word' });
    await expect(button).toHaveClass(/bg-green-600/);
    
    // Check consistent spacing and borders
    const recentWordsSection = page.locator('.bg-white').first();
    await expect(recentWordsSection).toHaveClass(/rounded-lg/);
    await expect(recentWordsSection).toHaveClass(/border/);
  });

  test('should take final verification screenshots', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    
    // Take empty state screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/final-empty-state.png',
      fullPage: true 
    });
    
    // Add an entry and take screenshot
    await page.getByPlaceholder("How's your day?").fill('beautiful');
    await page.getByRole('button', { name: 'Log Word' }).click();
    await page.waitForTimeout(3500); // Wait for toast
    
    await page.screenshot({ 
      path: 'tests/screenshots/final-with-entry.png',
      fullPage: true 
    });
    
    // Mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: 'tests/screenshots/final-mobile.png',
      fullPage: true 
    });
    
    console.log('Final verification screenshots saved successfully!');
  });
});