import { test, expect } from '@playwright/test';

test.describe('Heatmap Scroll Alignment', () => {
  test('heatmap content scrolls as one unit on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find the scrollable heatmap container
    const scrollContainer = page.locator('.overflow-x-auto').first();
    await expect(scrollContainer).toBeVisible();
    
    // Verify that both month labels and heatmap squares are within the same scrollable container
    // This ensures they scroll together
    const monthLabelsContainer = scrollContainer.locator('div').first();
    await expect(monthLabelsContainer).toBeVisible();
    
    // The key is that everything is in the same scrolling context
    // so the month labels and squares move together
    const innerContent = scrollContainer.locator('> div > div').first();
    const contentBox = await innerContent.boundingBox();
    
    // Content should be wider than viewport (enabling scroll)
    expect(contentBox!.width).toBeGreaterThan(375);
    
    // Basic scroll functionality should work
    await scrollContainer.evaluate(el => el.scrollLeft = 100);
    const scrollLeft = await scrollContainer.evaluate(el => el.scrollLeft);
    expect(scrollLeft).toBeGreaterThan(0);
  });
});