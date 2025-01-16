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
            '.meta-table-item__value_key_tags .node-meta__tags .elements-label': 'some tag',
        });
        await this.replaceBreadcrumbsByTitle(hostname, HOST_MASK);
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

    await components(page).replaceBreadcrumbsTestDir();

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
        '.meta-table-item__value_key_version': 'XX.XXXXXXXXX-xxxxx-xx~xXXXXXXXX',
        '.meta-table-item__value_key_job_proxy_build_version': 'XX.XXXXXXXXX-xxxxx-xx~xXXXXXXXX'
    });

    await expect(page).toHaveScreenshot();
});

test('Components - Tablets', async ({page}) => {
    await page.goto(makeClusterUrl(`components/nodes?contentMode=tablets`));
    await page.waitForSelector('.elements-table');
    await replaceInnerHtml(page, {
        '.yt-host .g-link': 'local:XXX',
        '.g-progress__text': '0 B / X.00 GiB',
    });
    await expect(page).toHaveScreenshot();
});

test('Components - HTTP-Proxies', async ({page}) => {
    await page.goto(makeClusterUrl(`components/http_proxies`));
    await page.waitForSelector('.elements-table');

    await replaceInnerHtml(page, {
        '.components-proxies__table-item_type_host .elements-monospace': 'localhost',
        '.yt-node-columns__text-content': 'XX.X.X-local-os~XXXXXXXXXXXXXXXX+distbuild',
        '.components-proxies__table-item_type_load-average span': '5.00',
        '.components-proxies__table-item_type_network-load span': '0.00',
    });
    replaceInnerHtmlForDateTime(page, ['.components-proxies__table-item_type_updated-at span']);
    await expect(page).toHaveScreenshot();
});

test('Components - RPC-Proxies', async ({page}) => {
    await page.goto(makeClusterUrl(`components/rpc_proxies`));
    await page.waitForSelector('.elements-page__content');

    await expect(page).toHaveScreenshot();
});

test('Components - Versions', async ({page}) => {
    await page.goto(makeClusterUrl(`components/versions?detailsSort=asc-true,field-type`));
    await page.waitForSelector('.versions-summary');

    await replaceInnerHtml(page, {
        '.yt-host__tooltip': 'local:XXX',
        '.version-cell__text': 'XX.X.X-local-os~XXXXXXXXXXXXXXXX+distbuild',
        '.data-table__td[title="Online"]': 'XX',
    });
    replaceInnerHtmlForDateTime(page, ['td.components-versions__table-item_type_start-time span']);

    await expect(page).toHaveScreenshot();
});

test('Components - Shards', async ({page}) => {
    await page.goto(makeClusterUrl(`components/shards`));
    await page.waitForSelector('.elements-table');

    await replaceInnerHtml(page, {
        '.components-shards__node-count': 'XXX',
    });

    await expect(page).toHaveScreenshot();
});
