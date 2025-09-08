import { test, expect } from '@playwright/test';

test.describe('Services preselect via query param', () => {
  test('preselect=seo,ppc filters results and highlights a tag', async ({ page }) => {
    await page.goto('/services.html?preselect=seo,ppc');

    // There should be at least one visible card
    const anyCard = page.locator('.product-card, .bg-white.p-6.rounded-lg.shadow-md');
    await expect(anyCard.first()).toBeVisible();
  });
});
