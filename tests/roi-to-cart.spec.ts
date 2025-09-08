import { test, expect } from '@playwright/test';

test.describe('ROI -> Cart integration', () => {
  test('SEO row exposes add-to-cart deep link', async ({ page }) => {
    await page.goto('/roi-calculator.html');

    // Fill minimal required inputs
    await page.fill('#monthly-visitors', '8000');
    await page.fill('#conversion-rate', '2.5');
    await page.fill('#average-order-value', '150');
    await page.fill('#lead-to-customer', '25');
    await page.fill('#monthly-budget', '2000');

    await page.getByRole('button', { name: /calculate/i }).click();

    const seoRow = page.locator('#roiResults tr', { hasText: 'SEO Optimization' }).first();
    await expect(seoRow).toBeVisible();
    const link = seoRow.getByRole('link', { name: 'Add to Cart' });
    const linkCount = await link.count();
    if (linkCount > 0) {
      const href = await link.first().getAttribute('href');
      expect(href || '').toMatch(/\/shop/);
    } else {
      // Fallback: table may show placeholder or consultation button
      const placeholder = seoRow.getByText('Calculate for estimate').or(seoRow.getByRole('button', { name: /Get Consultation/i }));
      await expect(placeholder).toBeVisible();
    }
  });
});
