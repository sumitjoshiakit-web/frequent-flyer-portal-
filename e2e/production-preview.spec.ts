import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Task 2: Production Build Preview Verification (http://localhost:4173)', () => {
  const PREVIEW_URL = 'http://localhost:4173';

  test.beforeEach(async ({ page }) => {
    await page.goto(PREVIEW_URL);
    await page.evaluate(() => {
      window.localStorage.clear();
    });
    await page.reload();
  });

  test('Production Preview: Desktop & Mobile Viewport Layout Integrity', async ({ page }) => {
    const viewports = [
      { name: 'prod-desktop', width: 1280, height: 800 },
      { name: 'prod-mobile', width: 375, height: 667 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(PREVIEW_URL);
      await page.waitForLoadState('networkidle');

      // Check header and notice
      await expect(page.locator('h1')).toContainText(/frequent flyer portal/i);
      await expect(page.getByText('Notice: Data persistence is strictly browser-local')).toBeVisible();

      // Check no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll, `Horizontal overflow in production build at ${vp.name}`).toBe(false);

      // Verify screenshot in production mode
      await page.screenshot({ path: path.join('test-results', `${vp.name}.png`), fullPage: true });
    }
  });

  test('Production Preview: Full CRUD, Validation, Persistence & Console Error Audit', async ({ page }) => {
    const consoleErrors: string[] = [];
    const consoleLogs: string[] = [];

    page.on('pageerror', (err) => consoleErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
      consoleLogs.push(msg.text());
    });

    await page.goto(PREVIEW_URL);

    // 1. Empty state verification
    await expect(page.getByText('No data found')).toBeVisible();

    // 2. Form validation on missing fields
    await page.getByRole('button', { name: 'Add Passenger' }).click();
    await page.getByRole('button', { name: /save|create/i }).click();

    const nameInput = page.getByLabel(/full name/i);
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    await expect(nameInput).toHaveClass(/border-red-500/);

    // 3. Add valid passenger record
    await nameInput.fill('Wilbur Wright');
    await page.getByLabel(/email/i).fill('wilbur@flight.org');
    await page.getByLabel(/membership number/i).fill('FF-700001');
    await page.getByLabel(/tier/i).selectOption('Platinum');
    await page.getByLabel(/points/i).fill('120000');
    await page.getByLabel(/status/i).selectOption('Active');

    await page.getByRole('button', { name: /save|create/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify row rendered in production table
    await expect(page.getByRole('cell', { name: 'Wilbur Wright' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'FF-700001' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '120,000' })).toBeVisible();

    // Verify summary increment in production build
    const summaryCard = page.locator('div.rounded-lg').filter({ hasText: 'Total Passengers' }).first();
    await expect(summaryCard).toContainText('1');

    // 4. Edit passenger record
    await page.getByRole('button', { name: 'Edit Wilbur Wright' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toHaveValue('Wilbur Wright');

    await page.getByLabel(/points/i).fill('135000');
    await page.getByRole('button', { name: /save|create/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('cell', { name: '135,000' })).toBeVisible();

    // 5. Search filtering
    const searchInput = page.getByRole('textbox', { name: 'Search passengers' });
    await searchInput.fill('Wilbur');
    await expect(page.getByRole('cell', { name: 'Wilbur Wright' })).toBeVisible();

    await searchInput.fill('NonExistentPassenger');
    await expect(page.getByText('No data found')).toBeVisible();

    await searchInput.clear();
    await expect(page.getByRole('cell', { name: 'Wilbur Wright' })).toBeVisible();

    // 6. Persistence across reload
    await page.reload();
    await expect(page.getByRole('cell', { name: 'Wilbur Wright' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '135,000' })).toBeVisible();
    await expect(summaryCard).toContainText('1');

    // 7. Delete passenger record with confirmation
    page.once('dialog', (dialog) => {
      expect(dialog.message()).toContain('Wilbur Wright');
      dialog.accept();
    });
    await page.getByRole('button', { name: 'Delete Wilbur Wright' }).click();
    await expect(page.getByText('No data found')).toBeVisible();
    await expect(summaryCard).toContainText('0');

    // 8. Zero uncaught errors or console errors
    expect(consoleErrors).toHaveLength(0);

    // 9. Telemetry check
    const analyticsLogs = consoleLogs.filter((log) =>
      log.includes('[Analytics] User interacted with End-to-End Frequent Flyer Portal')
    );
    expect(analyticsLogs.length).toBeGreaterThan(0);
  });
});
