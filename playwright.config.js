const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/browser',
  timeout: 30000,
  workers: 2,
  use: { browserName: 'chromium', locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', serviceWorkers: 'block', trace: 'retain-on-failure' },
  reporter: [['list']],
});
