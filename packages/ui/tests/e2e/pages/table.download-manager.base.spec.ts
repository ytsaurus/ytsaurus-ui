import {expect, test} from '@playwright/test';
import fs from 'fs';
import crypto from 'crypto';

import {E2E_DIR, makeClusterUrl} from '../../utils';

const PATH = `${E2E_DIR}/static-table`;

test('Download manager: downloaded file should be equal to ideal', async ({page}) => {
    const url = makeClusterUrl(`navigation?path=${PATH}`);
    await page.goto(url);

    const firstRow = page.locator('.data-table__table-wrapper tr:nth-child(1) td:nth-child(2) :text("key0")');
    await firstRow.waitFor();

    const downloadButton = page.locator('.navigation-table-overview__download-manager [title="download"]');
    await downloadButton.waitFor();
    await downloadButton.click();

    const downloadButtonModal = page.getByTestId('download-static-table');
    await downloadButtonModal.waitFor();

    const downloadPromise = page.waitForEvent('download');
    await downloadButtonModal.click();

    const download = await downloadPromise;

    const toastTitle = page.locator('.g-toast__title');
    await toastTitle.waitFor();
    const text = await toastTitle.innerText();
    expect(text).toBe('Success');

    const destination = './downloads/' + download.suggestedFilename();
    await download.saveAs(destination);

    const fileHash = getFileHash(destination);
    const idealFileHash = getFileHash('./data/static-table/static-table');
    expect(fileHash).toEqual(idealFileHash);
});

function getFileHash(filePath: string) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
  
    return hashSum.digest('hex');
}
