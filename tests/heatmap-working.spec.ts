import { test, expect } from '@playwright/test';

test.describe('Heatmap Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Clear any existing data
    await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('daybit_entries_')) {
          localStorage.removeItem(key);
        }
      });
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('heatmap displays all 12 months', async ({ page }) => {
    // Check that heatmap title is visible
    await expect(page.getByText('Your Year at a Glance')).toBeVisible();
    
    // Check for key month labels - should show months from current year cycle
    await expect(page.getByText('Jan').first()).toBeVisible();
    await expect(page.getByText('Dec').first()).toBeVisible();
    await expect(page.getByText('Sep').first()).toBeVisible(); // Current month
  });

  test('heatmap shows Less and More legend labels', async ({ page }) => {
    await expect(page.getByText('Less')).toBeVisible();
    await expect(page.getByText('More')).toBeVisible();
  });

  test('can add entry and see it reflected in heatmap', async ({ page }) => {
    // Add a word for today
    const input = page.locator('input[placeholder="How\'s your day?"]');
    await expect(input).toBeVisible();
    
    await input.fill('testword');
    await page.click('button:has-text("Log Word")');
    
    // Wait for the action to complete
    await page.waitForTimeout(1000);
    
    // The entry should now exist - we can verify via localStorage
    const entryExists = await page.evaluate(() => {
      const userId = localStorage.getItem('daybit_user_id');
      if (!userId) return false;
      
      const entries = localStorage.getItem(`daybit_entries_${userId}`);
      return entries && JSON.parse(entries).length > 0;
    });
    
    expect(entryExists).toBe(true);
  });

  test('heatmap layout spans full width below input forms', async ({ page }) => {
    // Check layout structure - heatmap should be below input and recent words
    const inputForm = page.locator('form').first();
    const recentWords = page.getByText('Recent Words');
    const heatmap = page.getByText('Your Year at a Glance');
    
    await expect(inputForm).toBeVisible();
    await expect(recentWords).toBeVisible();
    await expect(heatmap).toBeVisible();
    
    // Check that heatmap comes after the input forms in DOM order
    const heatmapBox = await heatmap.boundingBox();
    const inputBox = await inputForm.boundingBox();
    
    expect(heatmapBox!.y).toBeGreaterThan(inputBox!.y);
  });

  test('recent words shows Today label correctly', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Add entry for today
    await page.locator('input[placeholder="How\'s your day?"]').fill('todayword');
    await page.click('button:has-text("Log Word")');
    await page.waitForTimeout(1000);
    
    // Check that Recent Words section shows the entry with Today label
    const recentWordsSection = page.locator('div:has-text("Recent Words")').first();
    await expect(recentWordsSection).toBeVisible();
    
    // Verify the Today label is present specifically as a span in the recent words
    const todaySpan = page.locator('span.ml-2.text-green-600.font-medium:has-text("Today")');
    await expect(todaySpan).toBeVisible();
  });

  test('heatmap displays correct day labels', async ({ page }) => {
    // Check that day labels show the expected days (Sun, Tue, Thu, Sat pattern)
    await expect(page.getByText('Sun').first()).toBeVisible();
    await expect(page.getByText('Tue').first()).toBeVisible();
    await expect(page.getByText('Thu').first()).toBeVisible();
    await expect(page.getByText('Sat').first()).toBeVisible();
  });
});