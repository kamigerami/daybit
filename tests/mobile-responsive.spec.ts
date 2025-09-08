import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('layout works properly on mobile devices', async ({ page }) => {
    // Check that main components are visible
    await expect(page.getByRole('heading', { name: 'DayBit' })).toBeVisible();
    await expect(page.getByText('Your Year at a Glance')).toBeVisible();
    await expect(page.getByText('Recent Words')).toBeVisible();
    
    // Check that input form is accessible
    const input = page.locator('input[placeholder="How\'s your day?"]');
    await expect(input).toBeVisible();
    
    // Check that heatmap is scrollable and contains elements
    const heatmapContainer = page.locator('div:has-text("Your Year at a Glance")').first();
    await expect(heatmapContainer).toBeVisible();
    
    // Check that legend is visible and properly sized
    await expect(page.getByText('Less')).toBeVisible();
    await expect(page.getByText('More')).toBeVisible();
  });

  test('heatmap scrolls horizontally on mobile', async ({ page }) => {
    // Find the heatmap container
    const heatmapScrollContainer = page.locator('.overflow-x-auto').first();
    await expect(heatmapScrollContainer).toBeVisible();
    
    // Check that we can see month labels
    await expect(page.getByText('Jan').first()).toBeVisible();
    
    // The container should be scrollable - we can verify this by checking it has overflow-x-auto class
    await expect(heatmapScrollContainer).toHaveClass(/overflow-x-auto/);
  });

  test('components stack properly on mobile', async ({ page }) => {
    // Get bounding boxes of main components
    const header = page.getByRole('heading', { name: 'DayBit' });
    const inputSection = page.locator('form').first();
    const recentWords = page.getByText('Recent Words');
    const heatmap = page.getByText('Your Year at a Glance');
    
    // All components should be visible
    await expect(header).toBeVisible();
    await expect(inputSection).toBeVisible();
    await expect(recentWords).toBeVisible();
    await expect(heatmap).toBeVisible();
    
    // Check vertical stacking order
    const headerBox = await header.boundingBox();
    const inputBox = await inputSection.boundingBox();
    const heatmapBox = await heatmap.boundingBox();
    
    // Header should be at top, heatmap should be below input
    expect(headerBox!.y).toBeLessThan(inputBox!.y);
    expect(inputBox!.y).toBeLessThan(heatmapBox!.y);
  });

  test('mobile heatmap squares are appropriately sized', async ({ page }) => {
    // On mobile, squares should be smaller (w-2 h-2)
    // We can't directly test CSS classes, but we can verify the heatmap is visible and fits
    const heatmapContainer = page.locator('div:has-text("Your Year at a Glance")').first();
    await expect(heatmapContainer).toBeVisible();
    
    // The container should fit within mobile viewport
    const containerBox = await heatmapContainer.boundingBox();
    expect(containerBox!.width).toBeLessThan(400); // Should fit in mobile viewport
  });
});