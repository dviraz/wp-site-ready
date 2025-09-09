#!/usr/bin/env node
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.APP_URL || process.env.TARGET_URL || 'https://wp-marketng-store2.vercel.app';
const PAGES = (process.env.PAGES || '/,/services.html,/service-detail.html,/roi-calculator.html')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const OUT_DIR = 'reports/lh';
if (!existsSync('reports')) mkdirSync('reports');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR);

const formatName = (urlPath) => urlPath.replace(/[\/#:?&=]+/g, '_').replace(/^_+|_+$/g, '') || 'home';

function pct(x) { return Math.round(((x || 0) * 100)); }

async function run() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'] });
  const opts = { logLevel: 'error', output: 'html', port: chrome.port, onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] };

  const results = [];
  for (const path of PAGES) {
    const url = `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
    const runnerResult = await lighthouse(url, opts);
    const html = runnerResult.report;
    const name = formatName(path);
    const outPath = join(OUT_DIR, `${name}.html`);
    writeFileSync(outPath, html);
    const cats = runnerResult.lhr.categories;
    const summary = {
      url,
      performance: pct(cats.performance?.score),
      accessibility: pct(cats.accessibility?.score),
      bestPractices: pct(cats['best-practices']?.score),
      seo: pct(cats.seo?.score),
      report: outPath
    };
    results.push(summary);
    console.log(`LH ${name}: P${summary.performance} A${summary.accessibility} BP${summary.bestPractices} SEO${summary.seo} -> ${outPath}`);
  }

  await chrome.kill();
  const avg = (key) => Math.round(results.reduce((a, r) => a + (r[key] || 0), 0) / results.length);
  console.log(`\nLighthouse sweep complete for ${results.length} page(s). Avg: P${avg('performance')} A${avg('accessibility')} BP${avg('bestPractices')} SEO${avg('seo')}`);
}

run().catch((e) => { console.error('Lighthouse sweep failed:', e); process.exit(1); });

