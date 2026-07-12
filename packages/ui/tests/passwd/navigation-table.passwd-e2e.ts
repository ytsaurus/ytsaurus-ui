import {expect, test} from '@playwright/test';
import fs from 'fs';
import crypto from 'crypto';

import {makeClusterUrl} from '../utils';

test('TableCreateUpload: Should create, upload and download', async ({page}) => {
    test.slow();

    const workdir = `//tmp`;
    const tableName = `table-to-upload-${Date.now()}`;

    await page.goto(
        makeClusterUrl(`navigation?sort=asc-false,field-creation_time&path=${workdir}`),
    );

    await test.step('Create table', async () => {
        await page.getByText('Create object').click();
        await page.getByRole('menuitem').getByText('Table').click();

        await page.fill(
            `.df-dialog input[value$="${workdir}/new_table"]`,
            `${workdir}/${tableName}`,
        );

        await page.waitForTimeout(200);
        await page.click('.create-table-tab-field__add-column button:enabled');

        await page.waitForTimeout(200);
        await page.click('.g-dialog-footer__button_action_apply button:enabled');

        await page.waitForSelector('text="Table created"');
        await page.click('.g-toast__btn-close');
    });

    await test.step('Upload table', async () => {
        await page.getByTestId('map-node-filter').getByRole('textbox').fill(tableName);
        await page.click(`.map-node__content :text("${tableName}")`);

        await page.click('button[title="Upload"]');

        await page.setInputFiles('input.yt-file-picker__input', 'data/table-upload.txt');
        await page.click('button[title="Upload"].upload-manager__confirm:enabled');
    });

    await test.step('Wait for table content', async () => {
        await page.waitForSelector('td :text("false")');
        await page.waitForSelector('td :text("true")');
    });

    await test.step('Download table', async () => {
        await page.click('button[title=download]');
        await page.click(':text("JSON Lines")');

        const downloadButtonModal = page.getByTestId('download-static-table');
        await downloadButtonModal.waitFor();

        const downloadPromise = page.waitForEvent('download');
        await downloadButtonModal.click();
        const download = await downloadPromise;

        const destination = './downloads/' + download.suggestedFilename();
        await download.saveAs(destination);

        const fileHash = getFileHash(destination);
        const idealFileHash = getFileHash('data/table-upload.txt');
        expect(fileHash).toEqual(idealFileHash);
    });
});

function getFileHash(filePath: string) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);

    return hashSum.digest('hex');
}
