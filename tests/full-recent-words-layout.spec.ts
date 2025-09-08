import { test, expect } from '@playwright/test';

test.describe('Full Recent Words Layout', () => {
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
  });

  test('layout handles 7 recent entries gracefully', async ({ page }) => {
    const today = new Date();
    const entries = [];
    
    // Create 7 consecutive entries (full Recent Words)
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      entries.push({
        date: date.toISOString().split('T')[0],
        word: `word${i + 1}`
      });
    }
    
    // Add entries via localStorage
    await page.evaluate((entries) => {
      const userId = localStorage.getItem('daybit_user_id') || 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('daybit_user_id', userId);
      
      const storageKey = `daybit_entries_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(entries));
    }, entries);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that all components are still visible and properly arranged
    await expect(page.getByRole('heading', { name: 'DayBit' })).toBeVisible();
    await expect(page.getByText('Recent Words')).toBeVisible();
    await expect(page.getByText('Your Year at a Glance')).toBeVisible();
    
    // Check that Recent Words shows all entries
    const recentWordsSection = page.locator('div:has-text("Recent Words")').first();
    await expect(recentWordsSection).toBeVisible();
    
    // Verify layout order is maintained
    const header = page.getByRole('heading', { name: 'DayBit' });
    const inputForm = page.locator('form').first();
    const recentWords = page.getByText('Recent Words');
    const heatmap = page.getByText('Your Year at a Glance');
    
    const headerBox = await header.boundingBox();
    const inputBox = await inputForm.boundingBox();
    const recentBox = await recentWords.boundingBox();
    const heatmapBox = await heatmap.boundingBox();
    
    // Verify vertical stacking order
    expect(headerBox!.y).toBeLessThan(inputBox!.y);
    expect(inputBox!.y).toBeLessThan(heatmapBox!.y);
    
    // On desktop, input and recent words should be side by side
    // Recent Words should be constrained and not push heatmap too far down
    expect(heatmapBox!.y - Math.max(inputBox!.y, recentBox!.y)).toBeLessThan(450); // Adjusted for optimized layout
  });

  test('mobile layout with full recent words', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const today = new Date();
    const entries = [];
    
    // Create 7 consecutive entries
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      entries.push({
        date: date.toISOString().split('T')[0],
        word: `mobileword${i + 1}`
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
    
    // On mobile, components stack vertically
    // Check they're all visible and accessible
    await expect(page.getByRole('heading', { name: 'DayBit' })).toBeVisible();
    await expect(page.getByText('Recent Words')).toBeVisible();
    await expect(page.getByText('Your Year at a Glance')).toBeVisible();
    
    // Check that we can scroll to see heatmap if needed
    const heatmap = page.getByText('Your Year at a Glance');
    await heatmap.scrollIntoViewIfNeeded();
    await expect(heatmap).toBeVisible();
  });

  test('recent words section has appropriate height limits', async ({ page }) => {
    // Create maximum entries to test height
    const today = new Date();
    const entries = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      entries.push({
        date: date.toISOString().split('T')[0],
        word: `verylongwordname${i + 1}` // Test with longer words
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
    
    const recentWordsSection = page.locator('div:has-text("Recent Words")').first();
    const recentWordsBox = await recentWordsSection.boundingBox();
    
    // Recent Words section should be constrained by max-height (320px + padding)
    expect(recentWordsBox!.height).toBeLessThan(400); // max-h-80 (320px) + padding
    
    // All entries should still be visible within the section
    await expect(page.getByText('verylongwordname1')).toBeVisible();
    await expect(page.getByText('verylongwordname7')).toBeVisible();
  });
});