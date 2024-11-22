import {expect, test} from '@playwright/test';
import {makeClusterTille, makeClusterUrl} from '../../utils';

test('Groups - create, rename and delete group', async ({page}) => {
    const pathWithParams = 'groups?groupFilter=e2e-group';

    await page.goto(makeClusterUrl(pathWithParams));

    await expect(page).toHaveTitle(makeClusterTille({page: 'Groups' }));

    await expect(page).toHaveURL(makeClusterUrl(pathWithParams));

    await expect(page.locator('.data-table__row')).toHaveCount(0);

    await page.click('text="Create new"');
    await page.fill('.df-dialog input[value=""]', 'e2e-group-to-rename');
    await page.click('text="Confirm"');
    await expect(page.locator('.data-table__row')).toHaveCount(1);
    await page.waitForSelector('.groups-page-table__group-name:text("e2e-group-to-rename")')


    await page.click('.groups-page-table__content_col_actions .yt-icon_name_pencil-alt');
    await page.fill('.df-dialog input[value="e2e-group-to-rename"]', 'e2e-group-renamed');
    await page.click('text="Confirm"');
    await expect(page.locator('.data-table__row')).toHaveCount(1);
    await page.waitForSelector('.groups-page-table__group-name:text("e2e-group-renamed")')

    
    await page.click('.groups-page-table__content_col_actions .yt-icon_name_trash-bin');
    await page.click('text="Confirm"');
    await expect(page.locator('.data-table__row')).toHaveCount(0);
});

test('Group - create group and users and another groups to it', async ({page}) => {
    const pathWithParams = 'groups?groupFilter=e2e-group';

    await page.goto(makeClusterUrl(pathWithParams));

    await expect(page).toHaveTitle(makeClusterTille({page: 'Groups' }));

    await expect(page).toHaveURL(makeClusterUrl(pathWithParams));

    await expect(page.locator('.data-table__row')).toHaveCount(0);

    await page.click('text="Create new"');
    await page.fill('.df-dialog input[value=""]', 'e2e-group');
    await page.click('.df-dialog :text("Members")');

    await page.click('.yt-subject-suggest :text("Enter user name or login...")');
    await page.click('[data-qa="select-popup"] :text("guest")');
    await page.keyboard.press('Escape');
	
    
    await page.click('.yt-subject-suggest :text("Enter group name...")');
    await page.click('[data-qa="select-popup"] :text("users")');
    await page.keyboard.press('Escape');

    await page.click('text="Confirm"');

    await expect(page.locator('.data-table__row')).toHaveCount(1);
    
    await page.waitForSelector('.groups-page-table__content_col_members :text("guest, superusers")')

    await page.click('.groups-page-table__content_col_actions .yt-icon_name_trash-bin');
    await page.click('text="Confirm"');
    await expect(page.locator('.data-table__row')).toHaveCount(0);
});