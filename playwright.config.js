import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./e2e',
  fullyParallel:false,
  forbidOnly:Boolean(process.env.CI),
  retries:process.env.CI?1:0,
  reporter:process.env.CI?'github':'list',
  use:{baseURL:'http://127.0.0.1:8765',trace:'retain-on-failure',screenshot:'only-on-failure',
       ...devices['Desktop Chrome']},
  webServer:{
    command:'python local_core/server.py',
    url:'http://127.0.0.1:8765/api/health',
    reuseExistingServer:!process.env.CI,
    timeout:20000
  }
});
