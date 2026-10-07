import { expect, test } from '@playwright/test';

test.describe('foundation', () => {
  test('root falls back to Arabic (default locale) with RTL', async ({ browser }) => {
    const ctx = await browser.newContext({
      locale: 'fr-FR',
      extraHTTPHeaders: { 'Accept-Language': 'fr-FR' },
    });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/ar$/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await ctx.close();
  });

  test('root honours an English browser preference', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'en-US' });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
    await ctx.close();
  });

  test('English is LTR and the language toggle switches locale on the same route', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await page.waitForLoadState('networkidle'); // ensure hydration before interacting
    await page.getByRole('button', { name: 'Language' }).click();
    await expect(page).toHaveURL(/\/ar$/, { timeout: 15_000 });
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('theme toggle sets data-theme on <html> and persists', async ({ page }) => {
    await page.goto('/en');
    const html = page.locator('html');
    await page.waitForLoadState('networkidle');
    const before = await html.getAttribute('data-theme');
    await page.getByRole('button', { name: 'Theme' }).click();
    await expect(html).not.toHaveAttribute('data-theme', before ?? '');
    const after = await html.getAttribute('data-theme');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', after ?? '');
  });

  test('component gallery renders every section without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto('/en/dev/components');
    for (const id of [
      'Button',
      'InvoiceStatus',
      'ComplianceStatus',
      'DataGrid',
      'Stepper',
      'UsageMeter',
      'QrPanel',
    ]) {
      await expect(page.locator(`section#${id}`)).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test('gallery DataGrid search filters rows', async ({ page }) => {
    await page.goto('/en/dev/components#DataGrid');
    const grid = page.locator('section#DataGrid').locator('[lang="en"]').first();
    await grid.getByRole('searchbox').fill('Najd');
    await expect(grid.locator('tbody tr')).toHaveCount(1);
  });
});
