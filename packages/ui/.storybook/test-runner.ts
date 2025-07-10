import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  async postVisit(page, context) {
    const elementHandle = await page.$('#storybook-root');
    if (elementHandle) {
      await elementHandle.screenshot({ path: `./screenshots/${context.id}.png` });
    }
  },
};

export default config;