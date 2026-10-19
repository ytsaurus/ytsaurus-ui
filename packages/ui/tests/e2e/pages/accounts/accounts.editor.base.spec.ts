import {
    type Locator,
    type Page,
    type Request as PlaywrightRequest,
    type Route,
} from '@playwright/test';
import {expect, test} from '../../../fixtures/accounts';
import {makeClusterUrl} from '../../../utils';

test.setTimeout(30000);

async function openEditor(page: Page, account: string) {
    await page.goto(makeClusterUrl(`accounts/general?account=${account}`));
    await page.getByTestId(`edit-account-${account}`).click();

    const dialog = page.getByRole('dialog');
    await dialog.waitFor({state: 'visible'});
    await expect(dialog).toContainText(account);

    return dialog;
}

async function setLimit(dialog: Locator, value: string) {
    await dialog.getByTestId('quota-editor-new-limit').locator('input').fill(value);
    await dialog.getByTestId('quota-editor-save').click();
    await dialog.getByTestId('quota-editor-confirmation-yes').click();
}

for (const tab of ['general', 'acl']) {
    test(`Accounts editor - creation preserves ${tab} tab`, async ({page, accounts}) => {
        const parent = await accounts.create('parent');
        const account = accounts.name('created');
        const url = makeClusterUrl(`accounts/${tab}?account=${parent}`);

        await test.step('Create an account from the current tab', async () => {
            await page.goto(url);
            await page.getByRole('button', {name: 'Create account', exact: true}).click();

            const form = page.getByRole('dialog');
            await form.getByPlaceholder('Enter account name', {exact: true}).fill(account);
            await expect(form.getByRole('button', {name: parent, exact: true})).toBeVisible();

            await form.getByRole('button', {name: 'Confirm', exact: true}).click();
        });

        await test.step('Open the created account without leaving the tab', async () => {
            const editor = page.getByRole('dialog');
            await expect(editor).toContainText(account);
            await expect(editor.getByText('General', {exact: true})).toBeVisible();
            await expect(page).toHaveURL(url);
            await expect.poll(() => accounts.get(account, 'parent_name')).toBe(parent);

            await page.keyboard.press('Escape');
            await expect(editor).toHaveCount(0);
            await expect(page).toHaveURL(url);
        });
    });
}

test('Accounts editor - changes parent and refreshes the dialog', async ({page, accounts}) => {
    const first = await accounts.create('first');
    const second = await accounts.create('second');
    const account = await accounts.create('child', first, {node_count: 0});

    const editor = await openEditor(page, account);

    await test.step('Move the account to another parent', async () => {
        await editor.getByRole('button', {name: first, exact: true}).click();
        await page.getByText(second, {exact: true}).last().click();

        await expect.poll(() => accounts.get(account, 'parent_name')).toBe(second);
        await expect(editor.getByRole('button', {name: second, exact: true})).toBeEnabled();
    });

    await test.step('Keep the new parent after reopening', async () => {
        await page.keyboard.press('Escape');
        await expect(editor).toHaveCount(0);

        await page.getByTestId(`edit-account-${account}`).click();
        await expect(editor.getByRole('button', {name: second, exact: true})).toBeEnabled();
    });
});

test('Accounts editor - transfers and returns node quota', async ({page, accounts}) => {
    const parent = await accounts.create('parent');
    const account = await accounts.create('child', parent, {node_count: 10});
    const source = await accounts.create('source', parent, {node_count: 20});

    const editor = await openEditor(page, account);
    await editor.getByText('Nodes', {exact: true}).click();

    for (const limit of [12, 8]) {
        await test.step(`Set child quota to ${limit}`, async () => {
            await editor.locator('.account-quota__edit').click();
            await editor.getByRole('button', {name: parent, exact: true}).click();
            await page.getByText(source, {exact: true}).last().click();
            await setLimit(editor, String(limit));

            await expect
                .poll(() => accounts.get(account, 'resource_limits/node_count'))
                .toBe(limit);
            await expect
                .poll(() => accounts.get(source, 'resource_limits/node_count'))
                .toBe(30 - limit);
            await expect(editor.locator('.account-quota__progress')).toContainText(String(limit));
        });
    }

    await test.step('Keep the node quota after reopening', async () => {
        await page.keyboard.press('Escape');
        await expect(editor).toHaveCount(0);

        await page.getByTestId(`edit-account-${account}`).click();
        await editor.getByText('Nodes', {exact: true}).click();
        await editor.locator('.account-quota__edit').click();

        await expect(editor.getByTestId('quota-editor-new-limit').locator('input')).toHaveValue(
            '8',
        );
    });
});

async function openCreateForm(page: Page, parent: string, account: string) {
    await page.goto(makeClusterUrl(`accounts/general?account=${parent}`));
    await page.getByRole('button', {name: 'Create account', exact: true}).click();
    const form = page.getByRole('dialog');
    await form.getByPlaceholder('Enter account name', {exact: true}).fill(account);
    return form;
}

async function getRequestParameters(request: PlaywrightRequest): Promise<{path?: string}> {
    const headers = await request.allHeaders();
    const encoded = Object.entries(headers)
        .filter(([name]) => name.startsWith('x-yt-parameters-'))
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([, value]) => value)
        .join('');
    return encoded
        ? JSON.parse(Buffer.from(encoded, 'base64').toString())
        : request.postDataJSON() || {};
}

async function failRequest(page: Page, command: string, path: string) {
    const pattern = new RegExp(`/api/v[34]/${command}(?:\\?.*)?$`);
    const handler = async (route: Route) => {
        const parameters = await getRequestParameters(route.request());
        if (parameters.path === path) {
            await route.fulfill({status: 500, json: {code: 1, message: 'Test request failure'}});
        } else {
            await route.fallback();
        }
    };
    await page.route(pattern, handler);
    return () => page.unroute(pattern, handler);
}

test('Accounts editor - creates an account with home', async ({page, accounts, navigation}) => {
    const parent = await accounts.create('parent');
    const account = accounts.name('home');
    const home = navigation.register(`//home/${account}`);

    await test.step('Create an account and its home through the dialog', async () => {
        const form = await openCreateForm(page, parent, account);
        await form.getByText('Create home directory', {exact: true}).click();
        await expect(form.getByRole('switch')).toBeChecked();

        await form.getByRole('button', {name: 'Confirm', exact: true}).click();

        await expect(page.getByRole('dialog').getByText('General', {exact: true})).toBeVisible();
        await expect(page.getByRole('dialog')).toContainText(account);
        await expect.poll(() => accounts.get(account, 'parent_name')).toBe(parent);
        await expect.poll(() => navigation.exists(home)).toBe(true);
        await expect.poll(() => navigation.get(`${home}/@account`)).toBe(account);
    });
});

test('Accounts editor - transfers and returns disk quota', async ({page, accounts}) => {
    const parent = await accounts.create('parent', 'root', {disk_space_per_medium: {default: 100}});
    const account = await accounts.create('child', parent, {disk_space_per_medium: {default: 10}});
    const source = await accounts.create('source', parent, {disk_space_per_medium: {default: 20}});

    const editor = await openEditor(page, account);

    for (const limit of [12, 8]) {
        await test.step(`Set default medium quota to ${limit} bytes`, async () => {
            await editor.getByText('Disk space', {exact: true}).click();
            await editor
                .locator('.account-quota')
                .filter({hasText: 'Default medium'})
                .locator('.account-quota__edit')
                .click();
            await editor.getByRole('button', {name: parent, exact: true}).click();
            await page.getByText(source, {exact: true}).last().click();
            await setLimit(editor, `${limit} B`);

            await expect
                .poll(() => accounts.get(account, 'resource_limits/disk_space_per_medium/default'))
                .toBe(limit);
            await expect
                .poll(() => accounts.get(source, 'resource_limits/disk_space_per_medium/default'))
                .toBe(30 - limit);
        });

        await test.step('Keep the disk quota after reopening', async () => {
            await page.keyboard.press('Escape');
            await expect(editor).toHaveCount(0);

            await page.getByTestId(`edit-account-${account}`).click();
            await editor.getByText('Disk space', {exact: true}).click();
            await editor
                .locator('.account-quota')
                .filter({hasText: 'Default medium'})
                .locator('.account-quota__edit')
                .click();

            await expect(editor.getByTestId('quota-editor-new-limit').locator('input')).toHaveValue(
                `${limit} B`,
            );

            await page.keyboard.press('Escape');
            await expect(editor).toHaveCount(0);
            await page.getByTestId(`edit-account-${account}`).click();
        });
    }
});

test('Accounts editor - retries creation after a name conflict', async ({page, accounts}) => {
    const parent = await accounts.create('parent');
    const existing = await accounts.create('existing', parent);
    const account = accounts.name('created');

    const form = await openCreateForm(page, parent, existing);

    await test.step('Keep the form and existing account after the error', async () => {
        await form.getByRole('button', {name: 'Confirm', exact: true}).click();

        await expect(
            page.getByRole('heading', {name: `Failed to create account ${existing}`, exact: true}),
        ).toBeVisible();
        await expect(form.getByPlaceholder('Enter account name', {exact: true})).toHaveValue(
            existing,
        );
        await expect.poll(() => accounts.get(existing, 'parent_name')).toBe(parent);
        await expect.poll(() => accounts.get(existing, 'resource_limits/node_count')).toBe(100);
    });

    await test.step('Create successfully with a different name', async () => {
        await form.getByPlaceholder('Enter account name', {exact: true}).fill(account);
        await form.getByRole('button', {name: 'Confirm', exact: true}).click();

        await expect(form.getByText('General', {exact: true})).toBeVisible();
        await expect(form).toContainText(account);
        await expect.poll(() => accounts.get(account, 'parent_name')).toBe(parent);
    });
});

test('Accounts editor - opens the created account when home creation fails', async ({
    page,
    accounts,
    navigation,
}) => {
    const parent = await accounts.create('parent');
    const account = accounts.name('home-conflict');
    const home = await navigation.create(`//home/${account}`, parent);
    const originalId = await navigation.get(`${home}/@id`);

    const form = await openCreateForm(page, parent, account);

    await test.step('Report the home error and open the created account', async () => {
        await form.getByText('Create home directory', {exact: true}).click();
        await expect(form.getByRole('switch')).toBeChecked();

        await form.getByRole('button', {name: 'Confirm', exact: true}).click();

        await expect(
            page.getByRole('heading', {name: `Failed to create home for ${account}`, exact: true}),
        ).toBeVisible();
        await expect(form.getByText('General', {exact: true})).toBeVisible();
        await expect(form).toContainText(account);
        await expect.poll(() => accounts.get(account, 'parent_name')).toBe(parent);
        await expect.poll(() => navigation.get(`${home}/@id`)).toBe(originalId);
        await expect.poll(() => navigation.get(`${home}/@account`)).toBe(parent);
    });
});

test('Accounts editor - refuses deletion while resources are in use', async ({
    page,
    accounts,
    navigation,
}) => {
    const account = await accounts.create('busy');
    await navigation.create(`//tmp/${account}`, account);
    await expect.poll(() => accounts.get(account, 'recursive_resource_usage/node_count')).toBe(1);

    const editor = await openEditor(page, account);

    await test.step('Show used resources without offering confirmation', async () => {
        await editor.getByText('Delete', {exact: true}).click();
        const deleteButton = editor.getByTitle('Delete', {exact: true});
        await deleteButton.click();

        await expect(editor.getByText(/following resources are still used/)).toBeVisible();
        await expect(editor.getByText('node_count', {exact: true})).toBeVisible();
        await expect(editor.getByRole('button', {name: 'Yes', exact: true})).toHaveCount(0);
        await expect(deleteButton).toBeDisabled();
        await expect.poll(() => accounts.exists(account)).toBe(true);
    });
});

test('Accounts editor - retries opening after a loading error', async ({page, accounts}) => {
    const account = await accounts.create('load-error');
    const restore = await failRequest(page, 'get', `//sys/accounts/${account}/@path`);

    await page.goto(makeClusterUrl(`accounts/general?account=${account}`));
    const editButton = page.getByTestId(`edit-account-${account}`);

    await test.step('Report the loading error and enable retry', async () => {
        await editButton.click();

        await expect(
            page.getByRole('heading', {name: `Failed to load account ${account}`, exact: true}),
        ).toBeVisible();
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await expect(editButton).toBeEnabled();
    });

    await test.step('Open with a real response after the failed request', async () => {
        await restore();
        await editButton.click();

        await expect(page.getByRole('dialog')).toContainText(account);
        await expect(page.getByRole('dialog').getByText('General', {exact: true})).toBeVisible();
    });
});

test('Accounts editor - retries changing Parent after a request error', async ({
    page,
    accounts,
}) => {
    const first = await accounts.create('first');
    const second = await accounts.create('second');
    const account = await accounts.create('child', first, {node_count: 0});
    const restore = await failRequest(page, 'set', `//sys/accounts/${account}/@parent_name`);

    const editor = await openEditor(page, account);

    await test.step('Keep the original Parent and usable dialog after failure', async () => {
        await editor.getByRole('button', {name: first, exact: true}).click();
        await page.getByText(second, {exact: true}).last().click();

        await expect(
            page.getByRole('heading', {name: `Failed to set Parent for ${account}`, exact: true}),
        ).toBeVisible();
        await expect(editor.getByRole('button', {name: first, exact: true})).toBeEnabled();
        await expect.poll(() => accounts.get(account, 'parent_name')).toBe(first);
    });

    await test.step('Retry and keep the updated Parent after reopening', async () => {
        await restore();
        await editor.getByRole('button', {name: first, exact: true}).click();
        await page.getByText(second, {exact: true}).last().click();

        await expect.poll(() => accounts.get(account, 'parent_name')).toBe(second);
        await expect(editor.getByRole('button', {name: second, exact: true})).toBeEnabled();

        await page.keyboard.press('Escape');
        await expect(editor).toHaveCount(0);

        await page.getByTestId(`edit-account-${account}`).click();
        await expect(editor.getByRole('button', {name: second, exact: true})).toBeEnabled();
    });
});

test('Accounts editor - ignores a late response after leaving the page', async ({
    page,
    accounts,
}) => {
    const account = await accounts.create('late');

    let release!: () => void;
    let markRequested!: () => void;
    let markResponded!: () => void;
    const gate = new Promise<void>((resolve) => {
        release = resolve;
    });
    const requested = new Promise<void>((resolve) => {
        markRequested = resolve;
    });
    const responded = new Promise<void>((resolve) => {
        markResponded = resolve;
    });
    const pattern = /\/api\/v4\/get(?:\?.*)?$/;
    const handler = async (route: Route) => {
        const {path} = await getRequestParameters(route.request());
        if (path !== `//sys/account_tree/${account}`) {
            await route.fallback();
            return;
        }
        const response = await route.fetch();
        markRequested();
        await gate;
        await route.fulfill({response});
        markResponded();
    };
    await page.route(pattern, handler);

    try {
        await test.step('Leave Accounts while the editor is loading', async () => {
            await page.goto(makeClusterUrl(`accounts/general?account=${account}`));
            await page.getByTestId(`edit-account-${account}`).click();
            await requested;

            await page.getByRole('link', {name: 'Navigation', exact: true}).click();
            await expect(page).toHaveURL(/\/navigation/);

            release();
            await responded;
            await expect(page.getByRole('dialog')).toHaveCount(0);
        });

        await test.step('Open the account again after returning', async () => {
            await page.unroute(pattern, handler);
            await openEditor(page, account);
        });
    } finally {
        release();
    }
});

test('Accounts editor - deletes an unused account', async ({page, accounts}) => {
    const account = await accounts.create('deleted');
    const editor = await openEditor(page, account);

    await test.step('Confirm account deletion', async () => {
        await editor.getByText('Delete', {exact: true}).click();
        await editor.getByTitle('Delete', {exact: true}).click();
        await editor.getByRole('button', {name: 'Yes', exact: true}).click();
    });

    await test.step('Close the editor and remove the account on the backend', async () => {
        await expect(editor).toHaveCount(0);
        await expect(
            page.getByRole('heading', {name: `Successfully deleted ${account}`, exact: true}),
        ).toBeVisible();
        await expect.poll(() => accounts.exists(account)).toBe(false);
    });
});
