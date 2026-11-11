import {type TestInfo} from '@playwright/test';

import {expect, test} from '../../fixtures/navigation';
import {E2E_DIR, makeClusterUrl} from '../../utils';
import {ytApi} from '../../utils/yt-api';
import {table} from '../../widgets/TablePage';

test.slow();

const initialDescription = 'Original table description';
const parentDescription = 'Parent folder description';

function descriptionDirectory(testInfo: TestInfo) {
    return `${E2E_DIR}/description-${testInfo.testId.slice(-12)}-${testInfo.workerIndex}`;
}

test.beforeEach(async ({navigation}, testInfo) => {
    const directory = await navigation.create(descriptionDirectory(testInfo));
    await ytApi.set({path: `${directory}/@annotation`}, parentDescription);
    await ytApi.create({
        type: 'table',
        path: `${directory}/table`,
        attributes: {
            annotation: initialDescription,
            schema: [{name: 'value', type: 'string'}],
        },
    });
});

test('Navigation - Description: save YT annotation', async ({page, navigation}, testInfo) => {
    const path = `${descriptionDirectory(testInfo)}/table`;
    const description = 'Updated table description';
    const editor = page.getByRole('code');

    await test.step('Edit and save the annotation through the Description tab', async () => {
        await page.goto(makeClusterUrl(`navigation?path=${path}`));
        await page.getByRole('button', {name: 'Description', exact: true}).click();
        await expect(page.getByText(initialDescription, {exact: true})).toBeVisible();
        await page.getByRole('button', {name: 'Edit description', exact: true}).click();
        await editor.getByText(initialDescription, {exact: true}).click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.type(description);
        await expect(editor.getByText(description, {exact: true})).toBeVisible();
        await page.getByRole('button', {name: 'Save', exact: true}).click();

        await expect(editor).toBeHidden();
        await expect(page.getByText(description, {exact: true})).toBeVisible();
        expect(await navigation.get(`${path}/@annotation`)).toBe(description);
    });

    await test.step('Reload and verify the saved description and Content preview', async () => {
        await page.reload();
        await expect(page.getByText(description, {exact: true})).toBeVisible();
        await page.getByRole('button', {name: 'Edit description', exact: true}).click();
        await expect(editor).toBeVisible();
        await expect(page.getByText(description, {exact: true})).toBeVisible();
        await page.getByRole('button', {name: 'Cancel', exact: true}).click();
        await page.getByRole('button', {name: 'Content', exact: true}).click();
        await expect(page.getByTestId('navigation-description-preview-text')).toHaveText(
            description,
        );
    });
});

test('Navigation - Description: keep the panel while navigating and go to edit', async ({
    page,
}, testInfo) => {
    const directory = descriptionDirectory(testInfo);
    const path = `${directory}/table`;
    const panel = page.getByRole('region', {name: 'Full description', exact: true});

    await test.step('Open the full description and navigate to the parent folder', async () => {
        await page.goto(makeClusterUrl(`navigation?path=${path}`));
        await page.getByRole('link', {name: 'View full description'}).click();
        await expect(panel.getByText(initialDescription, {exact: true})).toBeVisible();
        await page.getByRole('link', {name: directory.split('/').pop(), exact: true}).click();

        await expect(page).toHaveURL((url) => url.searchParams.get('path') === directory);
        await expect(page.getByTestId('navigation-description-preview-text')).toHaveText(
            parentDescription,
        );
        await expect(panel.getByText(initialDescription, {exact: true})).toBeVisible();
        await expect(panel.getByText(parentDescription, {exact: true})).toBeHidden();
    });

    await test.step('Go to edit returns to the original table and closes the panel', async () => {
        await panel.getByRole('button', {name: 'Go to edit', exact: true}).click();

        await expect(page).toHaveURL(
            (url) =>
                url.searchParams.get('path') === path &&
                url.searchParams.get('navmode') === 'annotation',
        );
        await expect(panel).toBeHidden();
        await expect(page.getByText(initialDescription, {exact: true})).toBeVisible();
        await expect(
            page.getByRole('button', {name: 'Edit description', exact: true}),
        ).toBeVisible();
    });
});

test('Navigation - Description: confirm replacing a query draft', async ({page}, testInfo) => {
    const path = `${descriptionDirectory(testInfo)}/table`;
    const draft = 'SELECT 5836 AS description_draft;';
    const editor = page.getByRole('code');
    const panel = page.getByRole('region', {name: 'Full description', exact: true});
    const dialog = page.getByRole('dialog');
    const openDescription = page.getByRole('link', {name: 'View full description'});

    await test.step('Open Query Tracker and enter an unsaved draft', async () => {
        await page.goto(makeClusterUrl(`navigation?path=${path}`));
        await table(page).openQueriesWidget();
        await editor.getByRole('textbox', {name: 'Editor content'}).focus();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.type(draft);
        await expect(page.getByText(draft, {exact: true})).toBeVisible();
    });

    await test.step('Cancel replacement and keep the query draft', async () => {
        await openDescription.click();
        await expect(dialog.getByText('Close the side panel?', {exact: true})).toBeVisible();
        await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();

        await expect(dialog).toBeHidden();
        await expect(panel).toBeHidden();
        await expect(editor).toBeVisible();
        await expect(page.getByText(draft, {exact: true})).toBeVisible();
    });

    await test.step('Confirm replacement and show the full description', async () => {
        await openDescription.click();
        await dialog.getByRole('button', {name: 'Close and continue', exact: true}).click();

        await expect(dialog).toBeHidden();
        await expect(editor).toBeHidden();
        await expect(panel.getByText(initialDescription, {exact: true})).toBeVisible();
    });
});
