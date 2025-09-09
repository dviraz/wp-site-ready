#!/usr/bin/env node
import { chromium } from 'playwright';

const BASE = process.env.TARGET_URL || 'https://wp-marketng-store2.vercel.app';

function log(section, result) {
  const status = result.ok ? 'OK' : 'FAIL';
  console.log(`\n[${status}] ${section}`);
  if (result.details) {
    for (const [k, v] of Object.entries(result.details)) {
      console.log(` - ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`);
    }
  }
}

async function withPage(run) {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const consoleMsgs = [];
  page.on('console', (msg) => consoleMsgs.push({ type: msg.type(), text: msg.text() }));
  const requests = [];
  page.on('request', (req) => requests.push({ url: req.url(), method: req.method(), resourceType: req.resourceType() }));
  const responses = [];
  page.on('response', async (res) => {
    try {
      responses.push({ url: res.url(), status: res.status(), ok: res.ok(), fromCache: res.fromServiceWorker() || false });
    } catch (_) {}
  });
  try {
    const out = await run(page, { consoleMsgs, requests, responses });
    await browser.close();
    return out;
  } catch (e) {
    await browser.close();
    throw e;
  }
}

async function checkNavigation() {
  return withPage(async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: 'load' });

    // CTA link
    const cta = await page.locator('a', { hasText: /See Packages|Packages|Pricing/i }).first();
    const ctaHref = (await cta.count()) ? await cta.getAttribute('href') : null;

    // Header Services link
    const servicesLink = page.locator('header a', { hasText: /Services/i }).first();
    const servicesHref = (await servicesLink.count()) ? await servicesLink.getAttribute('href') : null;

    // About link and target section
    const aboutLink = page.locator('a[href^="#about"], a:has-text("About")').first();
    const aboutHref = (await aboutLink.count()) ? await aboutLink.getAttribute('href') : null;
    const aboutTargetExists = aboutHref && aboutHref.startsWith('#')
      ? (await page.locator(aboutHref).count()) > 0
      : null;

    const ok = !!ctaHref && !!servicesHref; // at least present
    return {
      ok,
      details: { ctaHref, servicesHref, aboutHref, aboutTargetExists }
    };
  });
}

async function checkServicesPage() {
  return withPage(async (page, ctx) => {
    await page.goto(`${BASE}/services.html`, { waitUntil: 'load' });

    // look for dynamic product cards or static cards
    const dynamicCount = await page.locator('.product-card').count();
    const staticCount = await page.locator('.bg-white.p-6.rounded-lg.shadow-md').count();

    // check for Tailwind CDN usage
    const html = await page.content();
    const usesCdnTailwind = /cdn\.tailwindcss\.com/.test(html);

    // try add to cart if dynamic buttons exist
    let cartWorked = null;
    const addBtn = page.locator('.product-card button:has-text("Add to Cart")').first();
    if (await addBtn.count()) {
      await addBtn.click();
      await page.waitForTimeout(800);
      const countText = await page.locator('.cart-count').first().textContent().catch(() => null);
      const storage = await page.evaluate(() => localStorage.getItem('marketboost_cart'));
      cartWorked = Boolean((countText && /\d+/.test(countText)) || (storage && JSON.parse(storage)?.items?.length));
    }

    // capture any CORS/auth failures hitting synergyx
    const synergyReqs = ctx.requests.filter(r => /synergyx\.digital\/wp-json\/.+\/wc\/v3/.test(r.url));
    const synergyRes = ctx.responses.filter(r => /synergyx\.digital\/wp-json\/.+\/wc\/v3/.test(r.url));

    const ok = dynamicCount > 0 || staticCount > 0; // page renders something
    return {
      ok,
      details: {
        dynamicCount,
        staticCount,
        cartWorked,
        usesCdnTailwind,
        apiRequests: synergyReqs.length,
        apiResponseStatuses: synergyRes.map(r => r.status)
      }
    };
  });
}

async function checkROIPage() {
  return withPage(async (page, ctx) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(String(err)));
    page.on('console', (msg) => {
      if (['error'].includes(msg.type())) errors.push(`[console] ${msg.text()}`);
    });

    await page.goto(`${BASE}/roi-calculator.html`, { waitUntil: 'load' });

    // try a calculation
    const exists = await page.locator('#roiForm').count();
    if (exists) {
      await page.fill('#monthly-visitors', '8000').catch(() => {});
      await page.fill('#conversion-rate', '2.5').catch(() => {});
      await page.fill('#average-order-value', '150').catch(() => {});
      await page.fill('#lead-to-customer', '25').catch(() => {});
      await page.fill('#monthly-budget', '2000').catch(() => {});
      const calc = page.getByRole('button', { name: /calculate/i });
      if (await calc.count()) await calc.click();
      await page.waitForTimeout(1000);
    }

    const resultsVisible = await page.locator('.results, #results, .roi-results, #roiResults').first().isVisible().catch(() => false);
    const ok = exists > 0 && (resultsVisible || errors.length === 0);
    return { ok, details: { resultsVisible, jsErrors: errors.slice(0, 5) } };
  });
}

async function checkSEOAndContent() {
  return withPage(async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: 'load' });
    const html = await page.content();

    // meta description
    const metaDesc = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
    const title = await page.title();

    // images alt
    const imgCount = await page.locator('img').count();
    let missingAlt = 0;
    for (let i = 0; i < imgCount; i++) {
      const alt = await page.locator('img').nth(i).getAttribute('alt').catch(() => null);
      if (alt === null || alt === undefined || alt.trim() === '') missingAlt++;
    }

    // copyright year
    const text = await page.textContent('body');
    const has2025 = /2025/.test(text || '');
    const has2024 = /2024/.test(text || '');

    // external resources and mixed content
    const reqs = [];
    page.on('requestfinished', (r) => reqs.push(r.url()));

    // quick check of tailwind cdn in HTML
    const usesCdnTailwind = /cdn\.tailwindcss\.com/.test(html);

    return {
      ok: true,
      details: { metaDesc: Boolean(metaDesc), title: Boolean(title), images: imgCount, missingAlt, has2025, has2024, usesCdnTailwind }
    };
  });
}

async function checkConsoleAndFavicon() {
  return withPage(async (page) => {
    const msgs = [];
    page.on('console', (msg) => msgs.push(`[${msg.type()}] ${msg.text()}`));
    await page.goto(`${BASE}/`, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const favicon404 = msgs.some(m => /favicon.*(404|failed)/i.test(m));
    const cdnWarning = msgs.some(m => /cdn\.tailwindcss\.com.*production/i.test(m));
    const ok = true;
    return { ok, details: { consoleCount: msgs.length, favicon404, cdnWarning, sample: msgs.slice(0, 5) } };
  });
}

async function checkAccessibilityBasics() {
  return withPage(async (page) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/`, { waitUntil: 'load' });
    const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    const skipLink = await page.locator('a.skip-link, a[href="#main-content"]').count();
    return { ok: true, details: { mobileOverflowX: overflowX, hasSkipLink: skipLink > 0 } };
  });
}

async function main() {
  console.log(`Retesting audit against: ${BASE}`);

  const results = [];
  results.push(['Navigation', await checkNavigation()]);
  results.push(['Services Page', await checkServicesPage()]);
  results.push(['Service Detail', await withPage(async (page) => {
    const res = await page.goto(`${BASE}/service-detail.html`, { waitUntil: 'load' });
    const status = res?.status();
    const hasTitle = await page.locator('h1, h2, .text-4xl').first().count() > 0;
    return { ok: status === 200 && hasTitle, details: { status, hasTitle } };
  })]);
  results.push(['ROI Calculator', await checkROIPage()]);
  results.push(['SEO/Content', await checkSEOAndContent()]);
  results.push(['Console/Favicon', await checkConsoleAndFavicon()]);
  results.push(['Accessibility', await checkAccessibilityBasics()]);
  results.push(['Dead Links', await withPage(async (page, ctx) => {
    await page.goto(`${BASE}/`, { waitUntil: 'load' });
    const links = await page.$$eval('a[href]', as => as.map(a => a.getAttribute('href') || ''));
    const dead = links.filter(href => href === '#' || href?.trim() === '' || href?.startsWith('javascript:'));
    return { ok: dead.length === 0, details: { totalLinks: links.length, deadCount: dead.length, examples: dead.slice(0, 5) } };
  })]);
  results.push(['External/Mixed Content', await withPage(async (page) => {
    const reqs = [];
    page.on('requestfinished', (r) => reqs.push(r.url()));
    await page.goto(`${BASE}/`, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const parsed = reqs.map(u => { try { return new URL(u); } catch { return null; } }).filter(Boolean);
    const domains = Array.from(new Set(parsed.map(u => u.origin)));
    const hasMixed = parsed.some(u => u.protocol === 'http:');
    return { ok: !hasMixed, details: { domains, hasMixed } };
  })]);
  results.push(['Performance (Home)', await withPage(async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: 'load' });
    const perf = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) {
        return {
          domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
          load: Math.round(nav.loadEventEnd),
          transferSize: nav.transferSize || null,
          resources: performance.getEntriesByType('resource').length
        };
      }
      return null;
    });
    const ok = !!perf;
    return { ok, details: perf || {} };
  })]);

  for (const [name, res] of results) log(name, res);

  // Exit with non-zero if any critical section failed
  const failed = results.some(([, r]) => r && r.ok === false);
  if (failed) process.exit(2);
}

main().catch((e) => {
  console.error('Audit retest failed to run:', e);
  process.exit(1);
});
