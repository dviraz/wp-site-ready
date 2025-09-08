import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,                 // keep small; rely on deterministic tests
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 5000 },
  use: {
    baseURL: process.env.APP_URL || (process.env.NODE_ENV === 'production' 
      ? 'https://wp-marketng-store2.vercel.app' 
      : 'http://localhost:3000'),
    headless: process.env.PLAYWRIGHT_HEADLESS !== '0',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: process.env.APP_START ? {
    command: process.env.APP_START,
    port: Number(process.env.APP_PORT || 3000),
    reuseExistingServer: true,
    timeout: 120_000
  } : undefined
});

