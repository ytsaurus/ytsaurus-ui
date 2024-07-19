import {Page, expect, test} from '@playwright/test';
import {makeClusterUrl} from '../../../utils';
import {BasePage} from '../../../utils/BasePage';
import {replaceInnerHtml, replaceInnerHtmlForDateTime} from '../../../utils/dom';

const HOST_MASK = 'my-hostname:11111';

class ComponentsPage extends BasePage {
    async openSecondNode() {
        await this.page.click('tr:nth-child(2) .yt-host .g-link');
    }

    async openMemoryPopup() {
        await this.page.click('.meta-table-item__value_key_memory');
    }

    async getHostName() {
        return await this.page.innerText('.node-page__host');
    }

    async replaceHostName() {
        const hostname: string = await this.getHostName();
        await this.page.waitForTimeout(3000);
        await replaceInnerHtml(this.page, {
            '.node-page__host': {regex: hostname, replacement: HOST_MASK},
            '.meta-table-item__value_key_system_tags .node-meta__tags .elements-label': 'some tag',
            [`.g-breadcrumbs [title="${hostname}"] .g-link`]: {
                regex: hostname,
                replacement: HOST_MASK,
            },
        });
    }
}

const components = (page: Page) => new ComponentsPage({page});

test('Components - Nodes - Flavor', async ({page}) => {
    await page.goto(
        makeClusterUrl(
            `components/nodes?nodeType=data_nodes,exec_nodes,tablet_nodes&nodeSort=asc-false,field-user_tags`,
        ),
    );

    await page.waitForSelector('tr:nth-child(2) .yt-host');

    await replaceInnerHtml(page, {
        '.yt-host .g-link': 'local:XXX',
    });

    await replaceInnerHtmlForDateTime(page, [
        '.components-nodes__table-item_type_last-seen .elements-ellipsis',
    ]);

    await expect(page).toHaveScreenshot();
});

test('Components - Node - Memory popup', async ({page}) => {
    await page.goto(makeClusterUrl(`components/nodes?nodeSort=asc-false,field-user_tags`));

    await components(page).openSecondNode();

    await components(page).replaceBreadcrumbsTestDir;

    await components(page).replaceHostName();

    await components(page).openMemoryPopup();

    await replaceInnerHtmlForDateTime(page, ['.meta-table-item__value_key_last_seen']);

    await replaceInnerHtml(page, {
        '.g-progress__text': 'some / progress',
        '.g-progress__item': '',
        '.g-progress__stack': '',
        '.nodes-memory__category-data': 'XX.XX MiB / XX.XX GiB',
        '.meta-table-item__value_key_chunks': 'X',
        '.meta-table-item__value_key_sessions': 'X',
    });

    await expect(page).toHaveScreenshot();
});
