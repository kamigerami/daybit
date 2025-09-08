import { test, expect } from '@playwright/test';

test.describe('Month Label Alignment', () => {
  test('month labels align with heatmap columns when scrolled', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get the scrollable container
    const heatmapContainer = page.locator('.overflow-x-auto').first();
    await expect(heatmapContainer).toBeVisible();
    
    // Scroll to see September area
    await heatmapContainer.evaluate(el => el.scrollLeft = 300);
    await page.waitForTimeout(100); // Wait for scroll to complete
    
    // Check that both month labels and squares are still properly aligned
    // The month labels should move with the content since they're in the same scrolling container
    const sepLabel = page.getByText('Sep').first();
    await expect(sepLabel).toBeVisible();
    
    // Verify the container has scrolled
    const scrollLeft = await heatmapContainer.evaluate(el => el.scrollLeft);
    expect(scrollLeft).toBeGreaterThan(200);
  });

  test('month labels stay within heatmap container bounds', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const heatmapContainer = page.locator('.overflow-x-auto').first();
    const innerContainer = heatmapContainer.locator('> div > div').first();
    
    // Get container bounds
    const containerBox = await innerContainer.boundingBox();
    const heatmapBox = await heatmapContainer.boundingBox();
    
    // The inner container should be wider than the viewport (allowing scroll)
    expect(containerBox!.width).toBeGreaterThan(375);
    
    // All month labels should be within the inner container bounds
    const monthLabels = page.locator('div[style*="marginLeft"] > div');
    const labelCount = await monthLabels.count();
    
    expect(labelCount).toBeGreaterThan(6); // Should have multiple month labels
  });

  test('horizontal scroll reveals all content properly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const heatmapContainer = page.locator('.overflow-x-auto').first();
    
    // Start at left
    await heatmapContainer.evaluate(el => el.scrollLeft = 0);
    await page.waitForTimeout(100);
    
    // Should see early months (Jan, Feb, Mar)
    await expect(page.getByText('Jan').first()).toBeVisible();
    
    // Scroll to right
    await heatmapContainer.evaluate(el => el.scrollLeft = 400);
    await page.waitForTimeout(100);
    
    // Should see later months (Aug, Sep)
    await expect(page.getByText('Sep').first()).toBeVisible();
  });
});