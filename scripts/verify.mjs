#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// Support both local dev and Vercel production
const APP_URL = process.env.APP_URL || (process.env.NODE_ENV === 'production' 
  ? 'https://wp-marketng-store2.vercel.app' 
  : 'http://localhost:3000');
const HEADLESS = process.env.PLAYWRIGHT_HEADLESS ?? '1'; // "0" to see the browser
const APP_START = process.env.APP_START || (process.env.NODE_ENV === 'production' ? '' : 'npm start');
const APP_PORT = process.env.APP_PORT || '3000';

const LOG_DIR = 'verify-logs';
if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR);
const logFile = join(LOG_DIR, `run-${Date.now()}.log`);
const out = createWriteStream(logFile);

const run = (cmd, args, opts = {}) =>
  new Promise((resolve) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: true, ...opts });
    p.stdout.on('data', (d) => out.write(d));
    p.stderr.on('data', (d) => out.write(d));
    p.on('close', (code) => resolve(code ?? 1));
  });

const steps = [
  { name: 'Build (optional)', cmd: 'npm', args: ['run', 'build'] },
  { name: 'Typecheck', cmd: 'npm', args: ['run', 'typecheck'] },
  { name: 'Lint', cmd: 'npm', args: ['run', 'lint'] },
  // E2E (webServer in Playwright config will start if APP_START is set)
  { name: 'E2E', cmd: 'npm', args: ['run', process.env.PLAYWRIGHT_HEADLESS === '0' ? 'test:e2e:headed' : 'test:e2e'] }
];

console.log(`=== VERIFY START ===
APP_URL=${APP_URL}
APP_START=${APP_START}
APP_PORT=${APP_PORT}
PLAYWRIGHT_HEADLESS=${HEADLESS}
Logs: ${logFile}
====================\n`);

process.env.APP_URL = APP_URL;
process.env.PLAYWRIGHT_HEADLESS = HEADLESS;
process.env.APP_START = APP_START;
process.env.APP_PORT = APP_PORT;

let failed = false;
const failures = [];

for (const s of steps) {
  console.log(`\n→ ${s.name}`);
  const code = await run(s.cmd, s.args);
  if (code !== 0) {
    failed = true;
    failures.push(`${s.name} failed with exit code ${code}`);
  }
}

console.log('\n=== FAILURES SUMMARY ===');
if (failed) {
  failures.forEach((f) => console.log('• ' + f));
  console.log(`\nSee detailed logs: ${logFile}`);
  process.exit(1);
} else {
  console.log('All checks passed ✅');
  console.log(`Logs: ${logFile}`);
  process.exit(0);
}