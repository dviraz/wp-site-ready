#!/usr/bin/env node
import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.APP_URL || process.env.TARGET_URL || 'https://wp-marketng-store2.vercel.app';
const PAGES = (process.env.PAGES || '/,/services.html,/service-detail.html,/roi-calculator.html')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const OUT_DIR = 'reports/axe';
if (!existsSync('reports')) mkdirSync('reports');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR);

const axeCdn = process.env.AXE_SRC || 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.9.1/axe.min.js';

const formatName = (urlPath) => urlPath.replace(/[\/#:?&=]+/g, '_').replace(/^_+|_+$/g, '') || 'home';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const results = [];
  for (const path of PAGES) {
    const url = `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
    const page = await ctx.newPage();
    const consoleMsgs = [];
    page.on('console', (m) => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
    await page.goto(url, { waitUntil: 'load' });

    // Inject axe
    await page.addScriptTag({ url: axeCdn });
    const res = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const r = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] });
      return {
        violations: r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length })),
        violationCount: r.violations.length,
        passes: r.passes?.length || 0,
        inapplicable: r.inapplicable?.length || 0
      };
    });

    const name = formatName(path);
    writeFileSync(join(OUT_DIR, `${name}.json`), JSON.stringify({ url, ...res, console: consoleMsgs }, null, 2));
    results.push({ path, url, count: res.violationCount });
    console.log(`AXE ${name}: ${res.violationCount} violation(s)`);
  }

  await browser.close();
  const total = results.reduce((a, b) => a + b.count, 0);
  console.log(`\nAXE sweep complete for ${results.length} page(s). Total violations: ${total}`);
}

run().catch((e) => { console.error('AXE sweep failed:', e); process.exit(1); });

