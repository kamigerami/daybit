import { test, expect } from '@playwright/test';

test.describe('Simple Heatmap Test', () => {
  test('can load the page and see heatmap', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that page title loads
    await expect(page.getByRole('heading', { name: 'DayBit' })).toBeVisible();
    
    // Check that heatmap section is present
    await expect(page.getByText('Your Year at a Glance')).toBeVisible();
    
    // Check that we can see at least one month label
    await expect(page.getByText('Jan').first()).toBeVisible();
  });
});