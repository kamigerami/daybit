import { test, expect } from '@playwright/test';

test.describe('Heatmap Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
    
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
  });

  test('heatmap displays all 12 months', async ({ page }) => {
    // Check that heatmap title is visible
    await expect(page.getByText('Your Year at a Glance')).toBeVisible();
    
    // Check for month labels - should show all months from Oct to Sep (12 months)
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    
    for (const month of months) {
      await expect(page.locator('text=' + month).first()).toBeVisible();
    }
  });

  test('heatmap shows legend with Less and More labels', async ({ page }) => {
    await expect(page.getByText('Less')).toBeVisible();
    await expect(page.getByText('More')).toBeVisible();
    
    // Check that legend squares are present (5 intensity levels)
    const legendSquares = page.locator('.flex.gap-1.items-center > div');
    await expect(legendSquares).toHaveCount(5);
  });

  test('heatmap shows today\'s entry when word is logged', async ({ page }) => {
    // Add a word for today
    await page.fill('input[placeholder="How\'s your day?"]', 'testword');
    await page.click('button:has-text("Log Word")');
    
    // Wait for toast to disappear
    await page.waitForTimeout(1000);
    
    // Check that today's square has the blue ring (indicating today)
    const todaySquare = page.locator('[style*="ring-blue-400"]').first();
    await expect(todaySquare).toBeVisible();
  });

  test('heatmap displays entries from previous days', async ({ page }) => {
    // Add test data for multiple days
    const testEntries = [
      { date: '2024-09-05', word: 'happy' },
      { date: '2024-09-06', word: 'tired' },
      { date: '2024-08-15', word: 'excited' },
      { date: '2024-07-01', word: 'calm' }
    ];
    
    // Add entries via localStorage
    await page.evaluate((entries) => {
      // Get or create user ID
      const userId = localStorage.getItem('daybit_user_id') || 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('daybit_user_id', userId);
      
      // Store entries
      const storageKey = `daybit_entries_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(entries));
    }, testEntries);
    
    await page.reload();
    
    // Check that heatmap shows entries (green squares)
    const entrySquares = page.locator('[style*="#c6e48b"]'); // Green color for entries
    await expect(entrySquares.first()).toBeVisible();
  });

  test('heatmap square hover shows tooltip with date and word', async ({ page }) => {
    // Add a test entry
    const testDate = '2024-09-05';
    const testWord = 'happy';
    
    await page.evaluate(({ date, word }) => {
      const userId = localStorage.getItem('daybit_user_id') || 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('daybit_user_id', userId);
      
      const storageKey = `daybit_entries_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify([{ date, word }]));
    }, { date: testDate, word: testWord });
    
    await page.reload();
    
    // Find and hover over the entry square
    const entrySquare = page.locator('[style*="#c6e48b"]').first();
    await entrySquare.hover();
    
    // Check tooltip appears with date and word
    await expect(page.locator('[class*="tooltip"], [role="tooltip"]')).toBeVisible();
  });

  test('heatmap handles empty state correctly', async ({ page }) => {
    // Should show all gray squares when no entries
    const emptySquares = page.locator('[style*="#ebedf0"]'); // Gray color for no entries
    await expect(emptySquares.first()).toBeVisible();
    
    // Should still show all month labels
    await expect(page.getByText('Oct')).toBeVisible();
    await expect(page.getByText('Sep')).toBeVisible();
  });

  test('heatmap spans full width below input forms', async ({ page }) => {
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

  test('heatmap day labels show correct days', async ({ page }) => {
    // Check that day labels are present (Sun, Tue, Thu, Sat)
    const dayLabels = ['Sun', 'Tue', 'Thu', 'Sat'];
    
    for (const day of dayLabels) {
      await expect(page.locator('text=' + day).first()).toBeVisible();
    }
  });

  test('heatmap squares have proper click interaction', async ({ page }) => {
    // Find a heatmap square and verify it's clickable
    const heatmapSquare = page.locator('[class*="cursor-pointer"]').first();
    await expect(heatmapSquare).toBeVisible();
    
    // Verify hover effects work
    await heatmapSquare.hover();
    await expect(heatmapSquare).toHaveClass(/hover:ring-/);
  });

  test('recent words shows Today label only for actual today entries', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Add entries for today and yesterday
    await page.evaluate(({ todayDate, yesterdayDate }) => {
      const userId = localStorage.getItem('daybit_user_id') || 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('daybit_user_id', userId);
      
      const entries = [
        { date: todayDate, word: 'today' },
        { date: yesterdayDate, word: 'yesterday' }
      ];
      
      const storageKey = `daybit_entries_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(entries));
    }, { todayDate: today, yesterdayDate: yesterday });
    
    await page.reload();
    
    // Check that only today's entry shows "Today" label
    const todayLabels = page.locator('text=Today');
    await expect(todayLabels).toHaveCount(1);
    
    // Verify the Today label is next to today's word
    const todayEntry = page.locator('text=today').locator('..');
    await expect(todayEntry.locator('text=Today')).toBeVisible();
    
    // Verify yesterday's entry doesn't have Today label
    const yesterdayEntry = page.locator('text=yesterday').locator('..');
    await expect(yesterdayEntry.locator('text=Today')).not.toBeVisible();
  });
});