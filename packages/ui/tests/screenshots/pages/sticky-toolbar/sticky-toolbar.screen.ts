import {Page, expect, test} from '@playwright/test';
import {E2E_DIR, MOCK_DATE, makeClusterUrl} from '../../../utils';
//import {replaceInnerHtml} from '../../../utils/dom';
import {TablePage} from '../../../widgets/TablePage';
import {navigationPage} from '../../../widgets/NavigationPage';
import {replaceInnerHtml} from '../../../utils/dom';
import {setUserSettings} from '../../../utils/settings';

function tablePage(page: Page) {
    return new TablePage({page});
}

test('StickyToolbar: navigation', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}/static-table`));
    await page.waitForLoadState('networkidle');

    await test.step('toolbar + table', async () => {
        await tablePage(page).waitForTableContent('.navigation-table', 10);
        await page.mouse.wheel(0, 720);
        await tablePage(page).replaceBreadcrumbsTestDir();
        await expect(page).toHaveScreenshot();
    });

    await test.step('table + QT-sidepanel', async () => {
        await page.getByTitle('Open Queries widget').click();
        await page.getByRole('presentation').click();
        await page.click(`:text('\`${E2E_DIR}/static-table\`')`, {force: true});
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Backspace');
        await page.addStyleTag({
            content: `
            .monaco-editor .cursor,
            .monaco-editor .cursors-layer > .cursor {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            }
            `,
        });

        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot();
    });

    await test.step('attributes + toolbar', async () => {
        const attrsEl = page.getByText('Attributes').first();
        await attrsEl.scrollIntoViewIfNeeded();
        await attrsEl.click();
        await page.mouse.wheel(0, 720);
        await page.waitForSelector(':text("shard_id")');
        await replaceInnerHtml(page, {'.structured-yson-virtualized__value': '###'});

        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot();
    });

    await test.step('map_node + toolbar', async () => {
        await navigationPage(page).gotToPath('//sys');
        await page.waitForSelector('.map-nodes-table tr:nth-child(8)');
        await page.mouse.move(100, 100);
        await page.mouse.wheel(0, 720);

        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot();
    });
});

test('StickyToolbar: components', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`components/nodes`));
    await page.waitForLoadState('networkidle');

    await page.waitForFunction(() => {
        const el = document.querySelector('.components-nodes__content') as HTMLElement;
        if (el) {
            el.style.paddingBottom = '1000px';
            return true;
        }
    });

    await setUserSettings(page, 'global::components::enableSideBar', true);

    await test.step('sticky toolbar', async () => {
        await page.mouse.wheel(0, 720);
        await expect(page).toHaveScreenshot();
    });

    await test.step('sticky toolbar + sidepanel', async () => {
        await page.mouse.wheel(0, -720);
        await page.click('tr:nth-child(1) .yt-host');
        await page.mouse.move(100, 100);
        await page.mouse.wheel(0, 720);

        await replaceInnerHtml(page, {'.node-card': '##the content is replaced##'});
        await expect(page).toHaveScreenshot();
    });
});

test('StickyToolbar: operations', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`operations`));
    await page.waitForLoadState('networkidle');

    await test.step('sticky toolbar', async () => {
        await page.waitForSelector('.operations-list__table tr:nth-child(1)');
        await page.waitForFunction(() => {
            const el = document.querySelector('.elements-table-wrapper') as HTMLElement;
            if (el) {
                el.style.paddingBottom = '1000px';
                return true;
            }
        });
        await page.mouse.wheel(0, 120);
        await expect(page).toHaveScreenshot();
    });
});
