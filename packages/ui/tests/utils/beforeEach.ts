import {test} from '@playwright/test';

test.beforeEach(async ({page}) => {
    await page.clock.install({time: new Date('2025-12-01')});
});
