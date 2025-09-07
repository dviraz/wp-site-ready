import { test, expect } from '@playwright/test';

test.describe('Services Page', () => {
  test('renders products and filters work', async ({ page }) => {
    await page.goto('/services.html');

    // Wait for either product cards or the fallback to render
    const productCard = page.locator('.product-card').first();
    const fallbackCard = page.locator('.bg-white.rounded-lg.shadow-md').first();
    await expect(productCard.or(fallbackCard)).toBeVisible({ timeout: 15000 });

    // Results count updates and is readable
    const results = page.locator('.results-count');
    await expect(results).toContainText(/service/i);

    // Click category tag SEO and ensure cards are visible
    await page.getByRole('button', { name: /^SEO$/ }).click();
    const anyCard = page.locator('.product-card, .bg-white.p-6.rounded-lg.shadow-md');
    await expect(anyCard.first()).toBeVisible();

    // Switch to another category to ensure filter listeners are active
    await page.getByRole('button', { name: /^Email$/ }).click();
    const anyCardAgain = page.locator('.product-card, .bg-white.p-6.rounded-lg.shadow-md');
    await expect(anyCardAgain.first()).toBeVisible();
  });
});
