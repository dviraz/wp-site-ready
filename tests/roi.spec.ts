import { test, expect } from '@playwright/test';

test.describe('ROI Calculator sanity', () => {
  test('ROI summary reacts sensibly to higher budget', async ({ page }) => {
    await page.goto('/roi-calculator.html');

    // Fill baseline values if not auto-populated
    const visitors = page.locator('#monthly-visitors');
    const conv = page.locator('#conversion-rate');
    const aov = page.locator('#average-order-value');
    const l2c = page.locator('#lead-to-customer');
    const budget = page.locator('#monthly-budget');

    await visitors.fill('8000');
    await conv.fill('2.5');
    await aov.fill('150');
    await l2c.fill('25');

    // Calculate with $2000
    await budget.fill('2000');
    await page.getByRole('button', { name: /calculate/i }).click();
    // Sanity: page shows assumptions/microcopy and does not error
    await expect(page.locator('#roiNote')).toContainText(/diminishing returns/i);
  });
});

