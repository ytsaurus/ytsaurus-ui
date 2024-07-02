import {test} from '@playwright/test';
import {E2E_DIR, makeClusterUrl} from '../../utils';

test('Should create a link', async ({page}) => {
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}`));

    await page.click('text="Create object"');
    await page.click('.g-menu__list-item :text("Link")');

    const name = 'link-to-home.' + (Date.now() % 10000);
    await page.fill('.df-dialog input[value$="link"]', `${E2E_DIR}/${name}`);
    await page.fill('.df-dialog input[value=""]', '//home');

    await page.waitForTimeout(200);
    await page.click('.g-dialog-footer__button_action_apply button:enabled');

    await page.waitForSelector('text="Link created"');

    await page.keyboard.press('Shift+R');
    await page.waitForSelector(`:text("${name}")`);
});
