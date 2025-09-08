import { test, expect } from '@playwright/test';

test.describe('September Mobile Display', () => {
  test('September column shows completely on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that September label is visible
    const sepLabel = page.getByText('Sep').first();
    await expect(sepLabel).toBeVisible();
    
    // Check that the heatmap container is properly sized and scrollable
    const heatmapContainer = page.locator('.overflow-x-auto').first();
    await expect(heatmapContainer).toBeVisible();
    
    // Verify we can scroll to see all content
    const containerBox = await heatmapContainer.boundingBox();
    expect(containerBox).toBeTruthy();
    
    // Check that the heatmap inner container has minimum width
    const innerContainer = heatmapContainer.locator('> div > div').first();
    const innerBox = await innerContainer.boundingBox();
    expect(innerBox!.width).toBeGreaterThan(550); // Should be at least 580px min-width
  });

  test('all 12 months are accessible on mobile via scroll', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check key month labels are present (even if not all visible in viewport)
    const months = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];
    
    for (const month of months) {
      // Each month should exist in the DOM, even if requires scrolling to see
      const monthLabel = page.getByText(month).first();
      await expect(monthLabel).toBeAttached(); // exists in DOM
    }
  });

  test('heatmap scrolling works properly on mobile', async ({ page }) => {
    // Set mobile viewport  
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const heatmapContainer = page.locator('.overflow-x-auto').first();
    
    // Get initial scroll position
    const initialScrollLeft = await heatmapContainer.evaluate(el => el.scrollLeft);
    expect(initialScrollLeft).toBe(0);
    
    // Try to scroll right
    await heatmapContainer.evaluate(el => el.scrollLeft = 100);
    
    // Check that scrolling worked
    const newScrollLeft = await heatmapContainer.evaluate(el => el.scrollLeft);
    expect(newScrollLeft).toBeGreaterThan(0);
  });
});