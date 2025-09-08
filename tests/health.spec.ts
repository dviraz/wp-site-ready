import { test, expect } from '@playwright/test';

test('home renders without critical errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (['error', 'warning'].includes(msg.type())) {
      consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  await page.goto('/');
  await expect(page).toHaveTitle(/.+/); // title exists
  const hasRoot = await page.locator('body').count();
  expect(hasRoot).toBeGreaterThan(0);

  // Check for hero section (from index.html)
  await expect(page.locator('h1')).toBeVisible();

  // Fails test if there are console errors (adjust allowlist if needed)
  const allowlist = [
    /DevTools failed to load/, 
    /favicon.ico 404/, 
    /Failed to load resource.*favicon/,
    /cdn\.tailwindcss\.com should not be used in production/
  ];
  const realErrors = consoleErrors.filter(e => !allowlist.some(rx => rx.test(e)));
  expect(realErrors, `Console noise:\n${realErrors.join('\n')}`).toHaveLength(0);
});

test('services page loads with products from SynergyX API', async ({ page }) => {
  await page.goto('/services.html');
  
  // Wait for dynamic products to load (using correct selector)
  await page.waitForSelector('.product-card', { timeout: 20000 });
  
  // Check if products are displayed
  const products = await page.locator('.product-card').count();
  expect(products).toBeGreaterThan(0);
  
  // Check if filter functionality exists (correct selectors based on HTML)
  await expect(page.locator('select#vertical')).toBeVisible();
  await expect(page.locator('.price-range-slider')).toBeVisible();
  
  // Verify API connection is working by checking for actual product data
  const firstProduct = page.locator('.product-card').first();
  await expect(firstProduct.locator('h3')).not.toBeEmpty();
  await expect(firstProduct.locator('.text-2xl.font-bold.text-red-500')).toBeVisible(); // price
});

test('cart functionality is accessible on services page', async ({ page }) => {
  await page.goto('/services.html');
  
  // Wait for products to load and cart UI to initialize
  await page.waitForSelector('.product-card', { timeout: 10000 });
  
  // Check if cart button exists (dynamically created) - simpler approach
  const cartButton = page.locator('button').filter({ has: page.locator('svg') });
  await expect(cartButton.first()).toBeVisible();
  
  // Look specifically for cart functionality by trying to add a product to cart first
  const addToCartBtn = page.locator('.product-card').first().locator('button:has-text("Add to Cart")');
  if (await addToCartBtn.count() > 0) {
    await addToCartBtn.click();
    await page.waitForTimeout(1000); // Wait for cart to update
    
    // Now look for cart indicator or drawer
    const cartIndicator = page.locator('.cart-count').or(page.locator('button:has(svg)'));
    await expect(cartIndicator.first()).toBeVisible();
  }
});