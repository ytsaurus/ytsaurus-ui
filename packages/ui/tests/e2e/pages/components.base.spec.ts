import {test, expect} from '@playwright/test';
import {makeClusterUrl} from '../../utils';

test('Components: shortname', async ({page}) => {
    const url = makeClusterUrl(`components/nodes`);
    await page.goto(url);

    await test.step('first row', async () => {
        const first = await page.waitForSelector(
            '.elements-table tr:nth-child(1) td:nth-child(1) .yt-host a',
        );
        const textContent = await first.textContent();
        const [loca, port] = textContent?.split(':') ?? [];
        expect(loca).toBe('loca');
        expect(/^\d\d\d$/.test(port)).toBe(true);
    });

    await test.step('second row', async () => {
        const first = await page.waitForSelector(
            '.elements-table tr:nth-child(2) td:nth-child(1) .yt-host a',
        );
        const textContent = await first.textContent();
        const [loca, port] = textContent?.split(':') ?? [];
        expect(loca).toBe('loca');
        expect(/^\d+$/.test(port)).toBe(true);
    });
});
