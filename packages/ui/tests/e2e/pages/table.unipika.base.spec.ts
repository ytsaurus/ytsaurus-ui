import {expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterTille, makeClusterUrl} from '../../utils';

const PATH = `${E2E_DIR}/tagged-table`;

test('Unipika table: should display tagged types', async ({page}) => {
    const url = makeClusterUrl(`navigation?path=${PATH}`);
    await page.goto(url);

    await test.step('svgXmlSrc', async () => {
        const svgXmlSrc =
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9' +
            'IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMi' +
            'A3djNoM1Y3aC0zem0wIDB2M2gzVjdoLTN6bTQgMHYzaDNWN2gtM3pNNCAxMXYzaDN2LTNINHptOCAwdjNoM3YtM2gt' +
            'M3ptMCAwdjNoM3YtM2gtM3ptNCAwdjNoM3YtM2gtM3pNNCAxNXYzaDN2LTNINHptOCAwdjNoM3YtM2gtM3ptMCAwdj' +
            'NoM3YtM2gtM3pNOCA3djNoM1Y3SDh6bTAgMHYzaDNWN0g4em0wIDR2M2gzdi0zSDh6bTAgMHYzaDN2LTNIOHptMCA0' +
            'djNoM3YtM0g4em0wIDB2M2gzdi0zSDh6Ii8+PC9zdmc+Cg==';

        await page.waitForSelector(
            `.data-table__table-wrapper tr:nth-child(1) td:nth-child(2) img[src="${svgXmlSrc}"]`,
        );
    });

    await test.step('imageurl', async () => {
        const imageurlSrc =
            'https://h.yandex-team.ru/?https%3A%2F%2Fyastatic.net%2Fs3%2Fcloud%2Fyt%2Fstatic%2Ffreeze%2Fassets%2Fimages%2Fui-big.44e3fa56.jpg';

        await page.waitForSelector(
            `.data-table__table-wrapper tr:nth-child(1) td:nth-child(3) img[src="${imageurlSrc}"]`,
        );
    });

    await test.step('imageurlAsText', async () => {
        const imageurlAsText =
            'https://deny-yastatic.net/s3/cloud/yt/static/freeze/assets/images/ui-big.44e3fa56.jpg';

        await page.waitForSelector(
            `.data-table__table-wrapper tr:nth-child(1) td:nth-child(4) :text("${imageurlAsText}")`,
        );
    });

    await test.step('page title', async () => {
        await expect(page).toHaveTitle(
            makeClusterTille({page: 'Navigation', path: 'tagged-table'}),
        );
        await expect(page).toHaveURL(url);
    });
});
