import {expect, test} from '@playwright/test';
import {E2E_DIR, MOCK_DATE, makeClusterUrl} from '../../../utils';
import {mockYTApi} from '../../../utils/network';
import {FAKE_ID, replaceInnerHtml} from '../../../utils/dom';
import {navigationPage} from '../../../widgets/NavigationPage';
import {waitForStoreWithoutActions} from '../../../utils/store';

test('Navigation - opaque attributes', async ({page}) => {
    await mockYTApi(
        page,
        'navigationAttribute',
        [
            'annotation',
            'annotation_path',
            'effective_acl',
            'effective_expiration',
            'effective_inheritable_attributes',
            'estimated_creation_time',
            'immediate_annotation',
            'locks',
            'native_content_revision',
            'opaque_attribute_keys',
            'path',
            'recursive_resource_usage',
            'sequoia_acl',
            'touch_time',
            'transferable_effective_inheritable_attributes',
            'user_attributes',
            'wrong_door_async',
            'wrong_door_sync',
        ].map((name) => ({$type: 'string', $value: name})),
        {arrays: 'replace'},
    );
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`navigation?navmode=attributes&path=${E2E_DIR}`));

    await page.locator('.g-ru-table__row_key_id').waitFor({state: 'visible'});
    await waitForStoreWithoutActions(page); // wait for virtualization to settle

    await page.mouse.wheel(0, 1000);
    await page.waitForSelector('.g-ru-table__row_key_opaque_attribute_keys');

    const loadButton = await page.locator(
        '.g-ru-table__row_key_opaque_attribute_keys [data-qa="load-button"]',
    );
    await loadButton.waitFor({state: 'visible'});
    await loadButton.click();
    await loadButton.waitFor({state: 'hidden'});
    await page.evaluate(() => window.scrollTo(0, 1000));

    await waitForStoreWithoutActions(page); // wait for virtualization to settle
    await replaceInnerHtml(page, {
        '.g-ru-table__row_key_parent_id .g-ru-cell__value': FAKE_ID,
    });
    await navigationPage(page).replaceBreadcrumbsTestDir();
    await expect(page).toHaveScreenshot();
});
