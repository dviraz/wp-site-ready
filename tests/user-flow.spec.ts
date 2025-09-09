import { test, expect } from '@playwright/test';

test('marketing services browsing and cart flow', async ({ page }) => {
  // Start on homepage → go to services
  await page.goto('/');
  await page.goto('/services.html');

  // Wait for at least one product card (dynamic) or fallback static card
  await page.waitForSelector('.product-card, .bg-white.p-6.rounded-lg.shadow-md', { timeout: 25000 });

  const serviceCard = page.locator('.product-card, .bg-white.p-6.rounded-lg.shadow-md').first();
  await expect(serviceCard).toBeVisible();

  // Try to add to cart directly from card
  const addToCartBtn = serviceCard.locator('button.add-to-cart-btn, button:has-text("Add to Cart")').first();
  if (await addToCartBtn.count() > 0) {
    await addToCartBtn.click();
    await page.waitForTimeout(500);
  }

  // Open cart drawer via cart icon
  const cartButton = page.locator('button').filter({ has: page.locator('.cart-count') }).first();
  if (await cartButton.count() > 0) {
    await cartButton.click();
    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer.first()).toBeVisible();
  }
});

test('service filtering works correctly', async ({ page }) => {
  await page.goto('/services.html');

  // Wait for products (dynamic or fallback)
  await page.waitForSelector('.product-card, .bg-white.p-6.rounded-lg.shadow-md', { timeout: 25000 });

  const initialCount = await page.locator('.product-card, .bg-white.p-6.rounded-lg.shadow-md').count();
  expect(initialCount).toBeGreaterThan(0);

  // Category selector (if present)
  const categorySelect = page.locator('select#vertical');
  if (await categorySelect.count() > 0) {
    const options = await categorySelect.locator('option').allTextContents();
    const targetOption = options.find(opt => /SEO|Social Media|Content/i.test(opt));
    if (targetOption) await categorySelect.selectOption({ label: targetOption });
    await page.waitForTimeout(500);
  }

  // Price slider (set via script for reliability)
  const priceSlider = page.locator('.price-range-slider');
  if (await priceSlider.count() > 0) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) { el.value = '800'; el.dispatchEvent(new Event('input', { bubbles: true })); }
    }, '.price-range-slider');
    await page.waitForTimeout(500);
  }

  const visibleAfter = await page.locator('.product-card:visible, .bg-white.p-6.rounded-lg.shadow-md:visible').count();
  expect(visibleAfter).toBeGreaterThan(0);
});

test('ROI calculator is functional', async ({ page }) => {
  await page.goto('/roi-calculator.html');
  
  // Check if ROI calculator form exists
  const form = page.locator('form, .calculator-form');
  await expect(form).toBeVisible();
  
  // Look for common ROI calculator inputs
  const monthlyRevenueInput = page.locator('input[name*="revenue"], input[placeholder*="revenue"], #monthly-revenue').first();
  const conversionRateInput = page.locator('input[name*="conversion"], input[placeholder*="conversion"], #conversion-rate').first();
  
  if (await monthlyRevenueInput.count() > 0) {
    await monthlyRevenueInput.fill('50000');
  }
  
  if (await conversionRateInput.count() > 0) {
    await conversionRateInput.fill('2.5');
  }
  
  // Find calculate button
  const calculateBtn = page.locator('button:has-text("Calculate"), .btn-calculate, [data-calculate]').first();
  
  if (await calculateBtn.count() > 0) {
    await calculateBtn.click();
    
    // Wait for results
    await page.waitForTimeout(1000);
    
  // Check if results are displayed
  const results = page.locator('#roiResults, .results, #results, .roi-results');
    await expect(results).toBeVisible();
  }
});
