import {expect, test} from '@playwright/test';
import {CLUSTER_TITLE, makeUrl} from '../../utils';
import {basePage} from '../../widgets/BasePage';

const source = {
    cluster: 'test-cluster',
    path: '//home/ui/clusters-config.json',
};

const errors = [
    {
        message: 'Failed to load clusters configuration. Using the bundled configuration.',
        attributes: source,
        inner_errors: [{message: 'Invalid JSON in the configuration document'}],
    },
    {message: 'Another configuration error'},
];

test.describe('Application configuration errors', () => {
    test('shows a single toaster with details and does not repeat it on navigation', async ({
        page,
    }) => {
        await test.step('Open the application with configuration errors', async () => {
            await basePage(page).override_window__DATA__({}, {}, {configurationErrors: errors});
            await page.goto(makeUrl());
        });

        const toast = page
            .locator('[data-toast]')
            .filter({hasText: 'Application configuration error'});
        const dialog = page.getByRole('dialog');

        await test.step('Show a single toaster and open Details', async () => {
            await expect(toast).toHaveCount(1);
            await toast.getByRole('button', {name: 'Details', exact: true}).click();
        });

        await test.step('Show configuration errors and source attributes in the dialog', async () => {
            await expect(dialog).toContainText(
                'Failed to load clusters configuration. Using the bundled configuration.',
            );
            await expect(dialog).toContainText('Invalid JSON in the configuration document');
            await expect(dialog).toContainText('Another configuration error');

            await dialog
                .getByText(
                    'Failed to load clusters configuration. Using the bundled configuration.',
                    {exact: true},
                )
                .click();
            await expect(dialog).toContainText('test-cluster');
            await expect(dialog).toContainText('//home/ui/clusters-config.json');
        });

        await test.step('Close the error dialog', async () => {
            await page.keyboard.press('Escape');
            await expect(dialog).not.toBeVisible();
        });

        await test.step('Navigate without showing the toaster again', async () => {
            const clusterLink = page.getByRole('link').filter({
                has: page
                    .getByText(CLUSTER_TITLE ?? '', {exact: true})
                    .and(page.locator('.cluster-menu__item-heading')),
            });
            const clusterUrl = await clusterLink.evaluate((link: HTMLAnchorElement) => link.href);
            await clusterLink.click();
            await expect(page).toHaveURL((url) => url.href.startsWith(`${clusterUrl}/`));
            await expect(toast).toHaveCount(0);
        });
    });
});
