import { test, expect } from '@playwright/test';

test('Take screenshots of DayBit application', async ({ page }) => {
  // Clear localStorage and start fresh
  await page.goto('http://localhost:3001');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  
  // Take screenshot of empty state
  await page.screenshot({ 
    path: 'tests/screenshots/daybit-empty-state.png',
    fullPage: true 
  });
  
  // Add a word entry
  await page.getByPlaceholder("How's your day?").fill('productive');
  await page.getByRole('button', { name: 'Log Word' }).click();
  
  // Wait for toast to appear and disappear
  await expect(page.getByText('Logged: productive')).toBeVisible();
  await page.waitForTimeout(3500); // Wait for toast to disappear
  
  // Take screenshot with entry
  await page.screenshot({ 
    path: 'tests/screenshots/daybit-with-entry.png',
    fullPage: true 
  });
  
  // Test mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ 
    path: 'tests/screenshots/daybit-mobile.png',
    fullPage: true 
  });
  
  // Add a few more entries to show heatmap activity
  await page.setViewportSize({ width: 1200, height: 800 });
  
  // Simulate adding entries for different dates by manipulating localStorage
  await page.evaluate(() => {
    const entries = [
      { date: '2025-09-06', word: 'happy' },
      { date: '2025-09-05', word: 'excited' },
      { date: '2025-09-04', word: 'calm' },
      { date: '2025-09-03', word: 'focused' },
      { date: '2025-09-02', word: 'energetic' },
      { date: '2025-09-01', word: 'motivated' }
    ];
    localStorage.setItem('daybit_entries', JSON.stringify(entries));
  });
  
  await page.reload();
  
  // Take final screenshot with multiple entries
  await page.screenshot({ 
    path: 'tests/screenshots/daybit-with-history.png',
    fullPage: true 
  });
  
  console.log('Screenshots saved successfully!');
});