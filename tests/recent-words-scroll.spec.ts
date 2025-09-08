import { test, expect } from '@playwright/test';

test.describe('Recent Words Scrolling', () => {
  test('recent words with 7 entries has scroll when needed', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Clear existing data
    await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('daybit_entries_')) {
          localStorage.removeItem(key);
        }
      });
    });
    
    const today = new Date();
    const entries = [];
    
    // Create 7 consecutive entries
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      entries.push({
        date: date.toISOString().split('T')[0],
        word: `testword${i + 1}`
      });
    }
    
    await page.evaluate((entries) => {
      const userId = localStorage.getItem('daybit_user_id') || 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('daybit_user_id', userId);
      
      const storageKey = `daybit_entries_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(entries));
    }, entries);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify all main components are visible
    await expect(page.getByText('Recent Words')).toBeVisible();
    await expect(page.getByText('Your Year at a Glance')).toBeVisible();
    
    // Check that recent words are displayed
    await expect(page.getByText('testword1')).toBeVisible();
    await expect(page.getByText('testword7')).toBeVisible();
    
    // Check for scroll container (if height exceeds max-h-60)
    const scrollContainer = page.locator('.max-h-60.overflow-y-auto').first();
    await expect(scrollContainer).toBeVisible();
  });

  test('layout remains stable with maximum entries', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Create maximum possible entries (should still only show 7)
    const today = new Date();
    const entries = [];
    
    for (let i = 0; i < 20; i++) { // Create more than the limit
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      entries.push({
        date: date.toISOString().split('T')[0],
        word: `word${i + 1}`
      });
    }
    
    await page.evaluate((entries) => {
      const userId = localStorage.getItem('daybit_user_id') || 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('daybit_user_id', userId);
      
      const storageKey = `daybit_entries_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(entries));
    }, entries);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should show "Showing last 7 entries" message
    await expect(page.getByText('Showing last 7 entries • 20 total')).toBeVisible();
    
    // Layout should still work - all main components visible
    await expect(page.getByText('Recent Words')).toBeVisible();
    await expect(page.getByText('Your Year at a Glance')).toBeVisible();
    
    // Should only show first 7 entries
    await expect(page.getByText('word1')).toBeVisible(); // Most recent
    await expect(page.getByText('word7')).toBeVisible(); // 7th entry
    await expect(page.getByText('word8')).not.toBeVisible(); // Should not show 8th
  });
});