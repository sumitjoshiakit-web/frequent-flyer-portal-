import { test, expect } from '@playwright/test';

test.describe('Frequent Flyer Portal E2E Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each run
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/');
  });

  test('displays dashboard header, empty state when no passengers exist', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/frequent flyer portal/i);
    await expect(page.getByText('No data found')).toBeVisible();
  });

  test('creates a passenger, enforces duplicate validation, updates, and deletes record', async ({ page }) => {
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      consoleLogs.push(msg.text());
    });

    // 1. Click Add Passenger
    await page.getByRole('button', { name: /add passenger/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // 2. Submit empty to trigger validation
    await page.getByRole('button', { name: /save|create|submit/i }).click();
    const fullNameInput = page.getByLabel(/full name/i);
    await expect(fullNameInput).toHaveAttribute('aria-invalid', 'true');

    // 3. Fill valid details
    await fullNameInput.fill('Amelia Earhart');
    await page.getByLabel(/email/i).fill('amelia@aviation.org');
    await page.getByLabel(/membership number/i).fill('FF-900001');
    await page.getByLabel(/tier/i).selectOption('Platinum');
    await page.getByLabel(/points/i).fill('75000');
    await page.getByLabel(/status/i).selectOption('Active');

    // Submit form
    await page.getByRole('button', { name: /save|create|submit/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // 4. Verify passenger in table
    await expect(page.getByRole('cell', { name: 'Amelia Earhart' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'FF-900001' })).toBeVisible();

    // 5. Verify analytics logged
    const analyticsPing = consoleLogs.some((log) =>
      log.includes('[Analytics] User interacted with End-to-End Frequent Flyer Portal')
    );
    expect(analyticsPing).toBeTruthy();

    // 6. Test duplicate prevention
    await page.getByRole('button', { name: /add passenger/i }).click();
    await page.getByLabel(/full name/i).fill('Duplicate Test');
    await page.getByLabel(/email/i).fill('dup@aviation.org');
    await page.getByLabel(/membership number/i).fill('FF-900001'); // duplicate
    await page.getByRole('button', { name: /save|create|submit/i }).click();

    await expect(page.getByText(/unique|already exists/i)).toBeVisible();
    await page.keyboard.press('Escape');

    // 7. Search filter test
    const searchBox = page.getByRole('textbox', { name: /search/i });
    await searchBox.fill('UnknownPerson');
    await expect(page.getByText('No data found')).toBeVisible();

    await searchBox.clear();
    await expect(page.getByRole('cell', { name: 'Amelia Earhart' })).toBeVisible();

    // 8. Delete passenger
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /delete amelia earhart/i }).click();
    await expect(page.getByText('No data found')).toBeVisible();
  });
});
