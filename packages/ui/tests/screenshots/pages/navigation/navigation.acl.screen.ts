import {expect, test} from '@playwright/test';
import {E2E_DIR, MOCK_DATE, makeClusterUrl} from '../../../utils';
import {navigationPage} from '../../../widgets/NavigationPage';

test('Navigation/ACL: main_permissions', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`navigation?navmode=acl&path=${E2E_DIR}/tmp`));

    await test.step('Add a permission for scheduler', async () => {
        await page.getByText('Add ACL').click();
        await page
            .locator('.df-dialog')
            .getByText('Register queue consumer vital')
            .click({force: true});
        await page.getByText('Enter user name or login...').click({force: true});
        await page.getByRole('option').getByText('scheduler').click({force: true});
        await page.getByText('Current path').click({force: true});

        await navigationPage(page).replaceACLInputPath();
        await navigationPage(page).replaceBreadcrumbsTestDir();
        await expect(page).toHaveScreenshot();

        await page.getByText('Confirm').click();
        await page
            .locator('.navigation-acl__object-permissions')
            .getByText('scheduler')
            .waitFor({state: 'visible'});

        await navigationPage(page).replaceBreadcrumbsTestDir();
        await expect(page).toHaveScreenshot();
    });

    await test.step('Remove a permission for scheduler', async () => {
        await page
            .locator('.navigation-acl__object-permissions')
            .getByTestId('acl:delete-role')
            .click();

        await page.getByText("Yes, I'm sure").click();
        await page.locator('.g-modal').getByTestId('modal-confirm').click();
        await page.mouse.move(0, 0);
        await expect(page).toHaveScreenshot();
    });
});

test('Navigation/ACL: column_permissions', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(
        makeClusterUrl(`navigation?navmode=acl&path=${E2E_DIR}/tmp&aclMode=column_permissions`),
    );

    await test.step('Add a column for scheduler', async () => {
        await page.getByText('Add columns ACL').click();
        await page.locator('.df-dialog textarea').fill('column1\nКолонка1');

        await page.getByText('Enter user name or login...').click({force: true});
        await page.getByRole('option').getByText('scheduler').click({force: true});
        await page.getByText('Current path').click({force: true});

        await navigationPage(page).replaceBreadcrumbsTestDir();
        await navigationPage(page).replaceACLInputPath();
        await expect(page).toHaveScreenshot();

        await page.getByText('Confirm').click();
        await page
            .locator('.navigation-acl__object-permissions')
            .getByText('scheduler')
            .waitFor({state: 'visible'});

        await expect(page).toHaveScreenshot();
    });

    await test.step('Remove a permission for scheduler', async () => {
        await page
            .locator('.navigation-acl__object-permissions')
            .getByTestId('acl:delete-role')
            .click();

        await page.getByText("Yes, I'm sure").click();
        await page.locator('.g-modal').getByTestId('modal-confirm').click();
        await page.mouse.move(0, 0);
        await expect(page).toHaveScreenshot();
    });
});

test.skip('Navigation/ACL: row_permissions', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(
        makeClusterUrl(`navigation?navmode=acl&path=${E2E_DIR}/tmp&aclMode=row_permissions`),
    );

    await test.step('Add a column for scheduler', async () => {
        await page.getByText('Add rows ACL').click();
        await page.locator('.df-dialog textarea').fill('column1\nКолонка1');

        await page.getByText('Enter user name or login...').click({force: true});
        await page.getByRole('option').getByText('scheduler').click({force: true});
        await page.getByText('Current path').click({force: true});

        await navigationPage(page).replaceBreadcrumbsTestDir();
        await navigationPage(page).replaceACLInputPath();
        await expect(page).toHaveScreenshot();

        await page.getByText('Confirm').click();
        await page
            .locator('.navigation-acl__object-permissions')
            .getByText('scheduler')
            .waitFor({state: 'visible'});

        await expect(page).toHaveScreenshot();
    });

    await test.step('Remove a permission for scheduler', async () => {
        await page
            .locator('.navigation-acl__object-permissions')
            .getByTestId('acl:delete-role')
            .click();

        await page.getByText("Yes, I'm sure").click();
        await page.locator('.g-modal').getByTestId('modal-confirm').click();
        await page.mouse.move(0, 0);
        await expect(page).toHaveScreenshot();
    });
});
