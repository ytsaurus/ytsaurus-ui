import {type Page, expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterUrl} from '../../utils';

const path =
    process.env.E2E_MEDIA_PREVIEW_TABLE ?? `${E2E_DIR}/tmp/table.preview-limit.image-audio`;
const warning =
    'The cell content exceeds the preview limit of 16 MiB. Use the command below to download the full content.';

async function loadCellPreview(page: Page, column: 'image' | 'audio', size: number) {
    await page.goto(makeClusterUrl(`navigation?path=${path}`));

    const row = page.getByRole('row').filter({
        hasText: `image: ${size} MiB; audio: ${size} MiB`,
    });
    const cell = row.locator('td').nth(column === 'image' ? 1 : 2);

    const tag = column === 'image' ? 'image/jpeg' : 'audio/webm';
    await expect(cell.getByText(`Incomplete '${tag}' type`)).toBeVisible();

    await cell.hover();
    await cell.getByTestId('truncated-preview-button').click();

    return cell;
}

for (const column of ['image', 'audio'] as const) {
    test(`Navigation/Table: ${column} preview 10 MiB`, async ({page}) => {
        test.slow();

        const cell = await loadCellPreview(page, column, 10);

        const media = cell.locator(column === 'image' ? 'img' : 'audio');
        await expect
            .poll(() =>
                media.evaluate((element) =>
                    element.tagName === 'IMG'
                        ? (element as HTMLImageElement).naturalWidth
                        : (element as HTMLAudioElement).readyState,
                ),
            )
            .toBeGreaterThan(0);

        await expect(page.getByTestId('cell-preview-modal-content')).toBeHidden();
    });

    test(`Navigation/Table: ${column} preview 20 MiB`, async ({page}) => {
        test.slow();

        await loadCellPreview(page, column, 20);

        const preview = page.getByTestId('cell-preview-modal-content');
        await expect(preview.getByText(warning, {exact: true})).toBeVisible();
        await expect(preview.getByTestId('cell-preview-command')).toContainText('yt read-table');
        await expect(
            preview.locator('.cell-preview-modal__yson-container, img, audio'),
        ).toHaveCount(0);
    });
}
