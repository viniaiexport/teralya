import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./test/e2e',testMatch:'**/*.e2e.ts',fullyParallel:true,forbidOnly:!!process.env.CI,retries:process.env.CI?2:0,workers:process.env.CI?1:undefined,reporter:process.env.CI?'github':'list',timeout:30_000,
  use:{baseURL:'http://127.0.0.1:3000',trace:'on-first-retry',screenshot:'only-on-failure'},
  projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
  webServer:[
    {command:'node test/e2e/mock-api.mjs',url:'http://127.0.0.1:3001/health',reuseExistingServer:!process.env.CI,timeout:30_000},
    {command:'npm run dev -- --hostname 127.0.0.1',url:'http://127.0.0.1:3000',reuseExistingServer:!process.env.CI,timeout:60_000,env:{TERALYA_API_URL:'http://127.0.0.1:3001',NEXT_PUBLIC_SITE_URL:'http://127.0.0.1:3000'}},
  ],
});
