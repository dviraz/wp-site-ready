import { test, expect } from '@playwright/test';

test.describe('Homepage CTA and distractions', () => {
  test('Hero CTA present; sticky/social proof disabled', async ({ page }) => {
    await page.goto('/');

    // Headline updated
    await expect(page.locator('h1')).toHaveText(/U\.S\. SMB Marketing, Simplified/i);

    // Primary CTA points to services
    const cta = page.getByRole('link', { name: 'See Packages & Pricing' });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /services\.html$/);

    // Sticky CTA bar remains hidden (feature disabled)
    const sticky = page.locator('#sticky-cta');
    await expect(sticky).toHaveAttribute('class', /translate-y-full/);

    // Scroll to ensure it still doesn't appear
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(sticky).toHaveAttribute('class', /translate-y-full/);

    // Social proof toast remains off-screen
    const toast = page.locator('#social-proof-notification');
    await expect(toast).toHaveAttribute('class', /translate-x-\[-400px\]/);
    await expect(toast).not.toHaveAttribute('class', /translate-x-0/);
  });
});



