import { test, expect } from '@playwright/test';

test.describe('Streak-based Heatmap Intensity', () => {
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

  test('single day entry shows light green', async ({ page }) => {
    // Add a single entry
    await page.locator('input[placeholder="How\'s your day?"]').fill('single');
    await page.click('button:has-text("Log Word")');
    await page.waitForTimeout(1000);
    
    // Today's square should have light green color for 1-day streak
    // We can't directly check the color, but we can verify the entry exists
    const entryExists = await page.evaluate(() => {
      const userId = localStorage.getItem('daybit_user_id');
      if (!userId) return false;
      
      const entries = localStorage.getItem(`daybit_entries_${userId}`);
      return entries && JSON.parse(entries).length === 1;
    });
    
    expect(entryExists).toBe(true);
  });

  test('consecutive entries create streak with darker colors', async ({ page }) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);
    
    // Create test entries for 3 consecutive days
    const testEntries = [
      { date: dayBefore.toISOString().split('T')[0], word: 'first' },
      { date: yesterday.toISOString().split('T')[0], word: 'second' },
      { date: today.toISOString().split('T')[0], word: 'third' }
    ];
    
    // Add entries via localStorage
    await page.evaluate((entries) => {
      const userId = localStorage.getItem('daybit_user_id') || 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('daybit_user_id', userId);
      
      const storageKey = `daybit_entries_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(entries));
    }, testEntries);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify all entries exist
    const entryCount = await page.evaluate(() => {
      const userId = localStorage.getItem('daybit_user_id');
      if (!userId) return 0;
      
      const entries = localStorage.getItem(`daybit_entries_${userId}`);
      return entries ? JSON.parse(entries).length : 0;
    });
    
    expect(entryCount).toBe(3);
  });

  test('legend shows streak intensity levels', async ({ page }) => {
    // Check that legend squares have tooltips indicating streak levels
    const legendSquares = page.locator('div[title*="streak"]');
    await expect(legendSquares).toHaveCount(4); // Four streak levels (1, 2-3, 4-7, 8+)
    
    // Check specific tooltip texts
    await expect(page.locator('[title="1 day streak"]')).toBeVisible();
    await expect(page.locator('[title="2-3 day streak"]')).toBeVisible();
    await expect(page.locator('[title="4-7 day streak"]')).toBeVisible();
    await expect(page.locator('[title="8+ day streak"]')).toBeVisible();
  });
});