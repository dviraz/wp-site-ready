import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Robust Playwright Video Recorder (Windows-friendly)
 * ---------------------------------------------------
 * Usage:
 *   node record.mjs <url> <outDir> <outFile> <durationSec> <width> <height> [flags]
 *
 * Examples:
 *   node record.mjs https://www.bing.com recordings demo.webm 12 1280 720
 *   node record.mjs https://example.com recordings walk.webm 20 1366 768 --headful
 *   node record.mjs https://example.com recordings corp.webm 15 1280 720 --no-proxy
 *   node record.mjs https://example.com recordings ok.webm 12 1280 720 --insecure
 *
 * Flags:
 *   --headful   Open a visible browser and let you click around during the wait.
 *   --no-proxy  Force Chromium to bypass system proxies (helps on corp/VPN envs).
 *   --insecure  Ignore TLS cert errors (dev proxies, SSL interception).
 *   --nowait    Don’t wait for page load events; just start timing immediately.
 *
 * Notes:
 *   - We try navigation with 'networkidle' → 'load' → 'domcontentloaded'. If all fail,
 *     we keep recording on about:blank so you still get a video and a screenshot.
 *   - We log console messages and request failures to help debug network issues.
 */

const args = process.argv.slice(2);
const url        = args[0] ?? 'https://www.bing.com';        // use a widely reachable default
const outDir     = args[1] ?? 'recordings';
const outFile    = args[2] ?? 'session.webm';
const durationSec= Number(args[3] ?? 10);
const width      = Number(args[4] ?? 1280);
const height     = Number(args[5] ?? 720);
const headful    = args.includes('--headful');
const noProxy    = args.includes('--no-proxy');
const insecure   = args.includes('--insecure');
const noWait     = args.includes('--nowait');

await fs.mkdir(outDir, { recursive: true });

const launchArgs = [];
if (noProxy) launchArgs.push('--no-proxy-server', '--proxy-bypass-list=*');
if (insecure) launchArgs.push('--ignore-certificate-errors');

const browser = await chromium.launch({
  headless: !headful,
  args: launchArgs,
});

const context = await browser.newContext({
  viewport: { width, height },
  recordVideo: { dir: outDir, size: { width, height } },
  ignoreHTTPSErrors: insecure,
});
const page = await context.newPage();

// Helpful logging
page.on('console', msg => console.log('📝 console:', msg.type(), msg.text()));
page.on('requestfailed', req => console.warn('⚠️ request failed:', req.url(), req.failure()?.errorText));
page.on('pageerror', err => console.error('⚠️ page error:', err?.message));

async function tryNavigate(targetUrl) {
  if (noWait) return true; // user asked not to wait for load events
  const attempts = [
    { waitUntil: 'networkidle', label: 'networkidle' },
    { waitUntil: 'load',        label: 'load' },
    { waitUntil: 'domcontentloaded', label: 'domcontentloaded' },
  ];
  for (const a of attempts) {
    try {
      console.log(`▶️  Navigating (${a.label}) to ${targetUrl} ...`);
      await page.goto(targetUrl, { waitUntil: a.waitUntil, timeout: 60000 });
      console.log(`✅ Navigation success with waitUntil=${a.label}`);
      return true;
    } catch (err) {
      console.warn(`⏳ Navigation failed on waitUntil=${a.label}:`, err.message);
    }
  }
  return false;
}

let navigated = false;
try {
  navigated = await tryNavigate(url);
  if (!navigated) {
    console.warn('❗ Continuing without successful navigation (recording about:blank).');
  }

  if (headful && durationSec === 0) {
    console.log(`⏱️  Recording until browser window is closed — interact manually and close when done.`);
    // Wait indefinitely until browser is closed
    try {
      await new Promise((resolve, reject) => {
        page.on('close', resolve);
        browser.on('disconnected', resolve);
      });
    } catch (err) {
      console.log('Browser closed by user');
    }
  } else if (headful) {
    console.log(`⏱️  Recording for ${durationSec}s — you can interact manually.`);
    await page.waitForTimeout(durationSec * 1000);
  } else {
    console.log(`⏱️  Recording for ${durationSec}s (headless).`);
    // Minimal auto-interaction to create visual changes
    for (let i = 0; i < 2; i++) {
      await page.waitForTimeout(900);
      await page.mouse.wheel(0, 700);
    }
    await page.waitForTimeout(durationSec * 1000);
  }

  // Save still image
  const pngPath = path.join(outDir, 'screenshot.png');
  await page.screenshot({ path: pngPath, fullPage: true }).catch(() => {});
  console.log(`🖼️  Saved screenshot: ${pngPath}`);

  // Finalize video
  const video = page.video();
  await context.close();
  const actualPath = await video.path();
  const targetPath = path.join(outDir, outFile);
  await fs.rename(actualPath, targetPath);
  console.log(`✅ Saved video to: ${targetPath}`);
} catch (err) {
  console.error('❌ Error during recording:', err);
  try { await context.close(); } catch {}
} finally {
  try { await browser.close(); } catch {}
}
