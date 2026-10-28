import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Phase 3 Comprehensive Browser, Edge-Case & Accessibility Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Clean state before each test run
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
    });
    await page.reload();
  });

  test('TASK A: Viewport Layouts & Responsive Integrity (Desktop, Tablet, Mobile)', async ({ page }) => {
    const viewports = [
      { name: 'desktop', width: 1280, height: 800 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify header is visible
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();

      // Check no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll, `Horizontal overflow detected at ${vp.name} (${vp.width}px)`).toBe(false);

      // Verify primary buttons are visible and not clipped
      const addBtn = page.getByRole('button', { name: 'Add Passenger' });
      await expect(addBtn).toBeVisible();

      // Take screenshot for visual audit
      await page.screenshot({ path: path.join('test-results', `viewport-${vp.name}.png`), fullPage: true });
    }
  });

  test('TASK B: Full 14-Scenario User Journey & Edge Case Audit', async ({ page }) => {
    const consoleLogs: string[] = [];
    const uncaughtErrors: string[] = [];

    page.on('console', (msg) => consoleLogs.push(msg.text()));
    page.on('pageerror', (err) => uncaughtErrors.push(err.message));

    await page.goto('/');

    // Scenario 1: Initial empty state & summary at 0
    await expect(page.getByText('No data found')).toBeVisible();
    await expect(page.getByText('Total Passengers')).toBeVisible();

    // Scenario 2: Add valid passenger, verify table row and summary KPI increment
    await page.getByRole('button', { name: 'Add Passenger' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel(/full name/i).fill('Charles Lindbergh');
    await page.getByLabel(/email/i).fill('charles@aviation.org');
    await page.getByLabel(/membership number/i).fill('FF-100001');
    await page.getByLabel(/tier/i).selectOption('Gold');
    await page.getByLabel(/points/i).fill('45000');
    await page.getByLabel(/status/i).selectOption('Active');

    await page.getByRole('button', { name: /save|create/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify row
    await expect(page.getByRole('cell', { name: 'Charles Lindbergh' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'FF-100001' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '45,000' })).toBeVisible();

    // Verify summary increment
    const summaryCard = page.locator('div.rounded-lg').filter({ hasText: 'Total Passengers' }).first();
    await expect(summaryCard).toContainText('1');

    // Scenario 3: Form submission with missing fields -> aria-invalid and red styling
    await page.getByRole('button', { name: 'Add Passenger' }).click();
    await page.getByRole('button', { name: /save|create/i }).click();

    const nameInput = page.getByLabel(/full name/i);
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    await expect(nameInput).toHaveClass(/border-red-500/);

    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');

    // Scenario 4: Submit invalid email & duplicate membership number
    await nameInput.fill('Bessie Coleman');
    await emailInput.fill('invalid-email-format');
    await page.getByLabel(/membership number/i).fill('FF-100001'); // duplicate!
    await page.getByRole('button', { name: /save|create/i }).click();

    await expect(page.getByText(/valid email address/i)).toBeVisible();
    await expect(page.getByText(/already in use|unique/i)).toBeVisible();

    // Correct details and submit 2nd passenger
    await emailInput.fill('bessie@aviation.org');
    await page.getByLabel(/membership number/i).fill('FF-100002');
    await page.getByLabel(/tier/i).selectOption('Silver');
    await page.getByLabel(/points/i).fill('20000');
    await page.getByLabel(/status/i).selectOption('Inactive');
    await page.getByRole('button', { name: /save|create/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await expect(page.getByRole('cell', { name: 'Bessie Coleman' })).toBeVisible();
    await expect(summaryCard).toContainText('2');

    // Scenario 5: Edit existing passenger & ensure other records remain unchanged
    await page.getByRole('button', { name: 'Edit Charles Lindbergh' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toHaveValue('Charles Lindbergh');

    await page.getByLabel(/points/i).fill('50000');
    await page.getByRole('button', { name: /save|create/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await expect(page.getByRole('cell', { name: '50,000' })).toBeVisible();
    // Bessie Coleman unchanged
    await expect(page.getByRole('cell', { name: 'Bessie Coleman' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '20,000' })).toBeVisible();

    // Scenario 6: Delete confirmation dialog behavior
    page.once('dialog', (dialog) => {
      expect(dialog.message()).toContain('Charles Lindbergh');
      dialog.dismiss(); // Cancel
    });
    await page.getByRole('button', { name: 'Delete Charles Lindbergh' }).click();
    await expect(page.getByRole('cell', { name: 'Charles Lindbergh' })).toBeVisible(); // Still present

    page.once('dialog', (dialog) => dialog.accept()); // Confirm deletion
    await page.getByRole('button', { name: 'Delete Charles Lindbergh' }).click();
    await expect(page.getByRole('cell', { name: 'Charles Lindbergh' })).not.toBeVisible();
    await expect(summaryCard).toContainText('1');

    // Scenario 7: Search by passenger name, email, and membership number
    const searchInput = page.getByRole('textbox', { name: 'Search passengers' });
    await searchInput.fill('Bessie');
    await expect(page.getByRole('cell', { name: 'Bessie Coleman' })).toBeVisible();

    await searchInput.fill('bessie@aviation.org');
    await expect(page.getByRole('cell', { name: 'Bessie Coleman' })).toBeVisible();

    await searchInput.fill('FF-100002');
    await expect(page.getByRole('cell', { name: 'Bessie Coleman' })).toBeVisible();

    // Scenario 8: Apply tier & status filters, combined search + filters
    await searchInput.clear();
    const tierSelect = page.getByRole('combobox', { name: 'Loyalty Level' });
    const statusSelect = page.getByRole('combobox', { name: 'Account State' });

    await tierSelect.selectOption('Silver');
    await expect(page.getByRole('cell', { name: 'Bessie Coleman' })).toBeVisible();

    await statusSelect.selectOption('Active');
    // Bessie is Inactive, so combination yields 0 matches
    await expect(page.getByText('No data found')).toBeVisible();

    // Scenario 9: Clear search and filters
    await tierSelect.selectOption('');
    await statusSelect.selectOption('');
    await expect(page.getByRole('cell', { name: 'Bessie Coleman' })).toBeVisible();

    // Scenario 10: Zero search matches
    await searchInput.fill('NonExistentQueryXYZ');
    await expect(page.getByText('No data found')).toBeVisible();
    await searchInput.clear();

    // Scenario 11: Page reload & persistence verification
    await page.reload();
    await expect(page.getByRole('cell', { name: 'Bessie Coleman' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'FF-100002' })).toBeVisible();

    // Scenario 12: Offline handling
    await page.context().setOffline(true);
    // Trigger offline event
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await expect(page.getByText(/offline/i)).toBeVisible();

    await page.context().setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));

    // Scenario 13: Zero uncaught exceptions or unhandled promise rejections
    expect(uncaughtErrors).toHaveLength(0);

    // Scenario 14: Analytics verification & PII protection
    const analyticsLogs = consoleLogs.filter((log) =>
      log.includes('[Analytics] User interacted with End-to-End Frequent Flyer Portal')
    );
    expect(analyticsLogs.length).toBeGreaterThan(0);

    // Check no passenger PII is logged in analytics
    for (const log of analyticsLogs) {
      expect(log).not.toContain('Bessie Coleman');
      expect(log).not.toContain('bessie@aviation.org');
      expect(log).not.toContain('Charles Lindbergh');
      expect(log).not.toContain('charles@aviation.org');
    }
  });

  test('TASK C: Accessibility (a11y) Semantics, Focus Management & Keyboard Trap', async ({ page }) => {
    await page.goto('/');

    // Check landmarks
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();

    // Open Modal via keyboard
    const addBtn = page.getByRole('button', { name: 'Add Passenger' });
    await addBtn.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Verify initial focus is within the dialog
    const activeElementTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON']).toContain(activeElementTag);

    // Press Escape to close modal and verify focus restores to Add Passenger button
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    const restoredFocusText = await page.evaluate(() => document.activeElement?.textContent);
    expect(restoredFocusText).toContain('Add Passenger');

    // Test form field label associations
    await addBtn.click();
    const labels = await page.$$eval('label', (lbls) =>
      lbls.map((l) => ({
        text: l.textContent?.trim(),
        htmlFor: l.getAttribute('for'),
      }))
    );

    const requiredLabels = ['Full Name', 'Email', 'Membership Number', 'Tier', 'Points', 'Status'];
    for (const req of requiredLabels) {
      const match = labels.find((l) => l.text?.includes(req));
      expect(match, `Label for ${req} should exist`).toBeDefined();
      expect(match?.htmlFor, `Label for ${req} should have htmlFor attribute`).toBeTruthy();
    }
  });

  test('TASK D: Performance & Navigation Timing Metrics', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const navTiming = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        dns: nav.domainLookupEnd - nav.domainLookupStart,
        tcp: nav.connectEnd - nav.connectStart,
        ttfb: nav.responseStart - nav.requestStart,
        domInteractive: nav.domInteractive,
        domComplete: nav.domComplete,
        loadEvent: nav.loadEventEnd - nav.startTime,
      };
    });

    console.log('Navigation Timing Metrics (ms):', JSON.stringify(navTiming, null, 2));

    // Performance assertion: First load on localhost should complete within reasonable threshold
    expect(navTiming.ttfb).toBeLessThan(1000);
    expect(navTiming.domInteractive).toBeLessThan(3000);
  });
});
