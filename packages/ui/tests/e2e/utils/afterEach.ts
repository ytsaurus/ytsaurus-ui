import {test} from '@playwright/test';

test.afterEach(async ({page}, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
        console.log(`Finished ${testInfo.title} with status ${testInfo.status}`);
        console.log(`Did not run as expected, ended up at ${page.url()}`);
    }
});
