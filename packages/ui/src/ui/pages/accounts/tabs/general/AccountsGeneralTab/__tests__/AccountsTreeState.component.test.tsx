import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core/ytApiFixtures';
import {mockYTApi} from '../../../../../../playwright-components/core/mockYTApi';
import {YTApiId} from '../../../../../../../shared/constants/yt-api-id';
import {Tree} from '../__stories__/AccountsGeneralTab.stories';
import {
    accountBatch,
    accountList,
    accountTree,
    defaultAccounts,
    defaultUsable,
    emptyTotals,
    makeAccount,
} from '../__stories__/mocks';
import {type Locator} from '@playwright/test';

const [parent, childAccount, usableOnly] = defaultAccounts;

test.setTimeout(30_000);

test.use({settings: {'local::test-cluster::accounts::favourites': [{path: 'child'}]}});

test('AccountsTreeState: initial expansion in all', async ({mount, router}) => {
    const accounts = [...defaultAccounts];
    const usable = [...defaultUsable];
    await router.use(
        mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
        mockYTApi(YTApiId.listUsableAccounts, () => Response.json(usable)),
        mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
        mockYTApi(YTApiId.accountsNodes, {data: {}}),
        mockYTApi(YTApiId.accountsData, {data: accounts}),
    );
    const component = await mount(<Tree initialMode="all" />);
    await expect(component.getByRole('link', {name: 'parent', exact: true})).toBeVisible();
    await expect(component.getByRole('link', {name: 'child', exact: true})).toBeHidden();
});

test('AccountsTreeState: keeps collapsed branches across refresh and filtered modes', async ({
    mount,
    router,
}) => {
    const accounts = [...defaultAccounts];
    const usable = [...defaultUsable];
    await router.use(
        mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
        mockYTApi(YTApiId.listUsableAccounts, () => Response.json(usable)),
        mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
        mockYTApi(YTApiId.accountsNodes, {data: {}}),
        mockYTApi(YTApiId.accountsSelectedMetadata, {
            data: accountBatch([childAccount, parent, usableOnly]),
        }),
    );
    const component = await mount(<Tree />);
    const child = component.getByRole('link', {name: 'child', exact: true});

    await test.step('Collapse the parent manually', async () => {
        await expect(child).toBeVisible();
        await component.getByTestId('account-tree-toggle-parent').click();
        await expect(child).toBeHidden();
    });

    await test.step('Refresh preserves the parent and expands a new branch', async () => {
        const newParent = makeAccount('new-parent');
        const newChild = makeAccount('new-child', 'new-parent');
        accounts.push(newParent, newChild);
        await router.use(
            mockYTApi(YTApiId.accountsSelectedMetadata, {
                data: accountBatch([childAccount, parent, usableOnly, newChild, newParent]),
            }),
        );
        usable.push('new-child');
        await component.getByRole('button', {name: 'Refresh accounts'}).click();
        await expect(component.getByRole('link', {name: 'new-child', exact: true})).toBeVisible();
        await expect(child).toBeHidden();
    });

    await test.step('Switch to Favourites without resetting shared branches', async () => {
        await router.use(
            mockYTApi(YTApiId.accountsSelectedMetadata, {
                data: accountBatch([childAccount, parent]),
            }),
        );
        await component.getByRole('radio', {name: 'Favourites', exact: true}).check();
        await expect(component.getByRole('radio', {name: 'Favourites', exact: true})).toBeChecked();
        await expect(child).toBeHidden();
        await expect(component.getByRole('link', {name: 'new-child', exact: true})).toBeHidden();
        await component.getByTestId('account-tree-toggle-parent').click();
        await expect(child).toBeVisible();
        await expect(component.getByRole('link', {name: 'usable-only', exact: true})).toBeHidden();
    });
});

test('AccountsTreeState: resets expansion when switching through All on Dashboard', async ({
    mount,
    router,
}) => {
    const accounts = [...defaultAccounts];
    const usable = [...defaultUsable];
    await router.use(
        mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
        mockYTApi(YTApiId.listUsableAccounts, () => Response.json(usable)),
        mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
        mockYTApi(YTApiId.accountsNodes, {data: {}}),
        mockYTApi(YTApiId.accountsSelectedMetadata, {
            data: accountBatch([childAccount, parent, usableOnly]),
        }),
    );
    const component = await mount(<Tree viewContext="dashboard" />);
    const child = component.getByRole('link', {name: 'child', exact: true});

    await test.step('Collapse a branch in Usable', async () => {
        await expect(child).toBeVisible();
        await component.getByTestId('account-tree-toggle-parent').click();
        await expect(child).toBeHidden();
    });

    await test.step('All starts collapsed and supports manual expansion', async () => {
        await router.use(mockYTApi(YTApiId.accountsData, {data: accounts}));
        await component.getByRole('radio', {name: 'All', exact: true}).check();
        await expect(child).toBeHidden();
        await component.getByTestId('account-tree-toggle-parent').click();
        await expect(child).toBeVisible();
    });

    await test.step('Returning to Usable restores the expanded default', async () => {
        await component.getByRole('radio', {name: 'Usable', exact: true}).check();
        await expect(child).toBeVisible();
        await component.getByTestId('account-tree-toggle-parent').click();
        await expect(child).toBeHidden();
        await component.getByRole('radio', {name: 'All', exact: true}).check();
        await expect(child).toBeHidden();
        await router.use(
            mockYTApi(YTApiId.accountsSelectedMetadata, {
                data: accountBatch([childAccount, parent]),
            }),
        );
        await component.getByRole('radio', {name: 'Favourites', exact: true}).check();
        await expect(child).toBeVisible();
    });
});

function row(component: Locator, name: string) {
    return component.getByRole('row', {name: new RegExp(`^${name}(?:\\s|$)`)});
}

for (const mode of ['all', 'usable'] as const) {
    test(`AccountsTreeState: ${mode} selected subtree preserves collapsing on refresh and resets on navigation`, async ({
        mount,
        router,
    }) => {
        let accounts = [...defaultAccounts];
        const usable = [...defaultUsable];

        accounts.push(makeAccount('grandchild', 'child', 5));

        await router.use(
            mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
            mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
            mockYTApi(YTApiId.accountsNodes, {data: {}}),
            mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
        );

        if (mode === 'all') {
            await router.use(mockYTApi(YTApiId.accountsData, () => Response.json(accounts)));
        } else {
            await router.use(
                mockYTApi(YTApiId.accountPath, {data: '//sys/account_tree/parent'}),
                mockYTApi(YTApiId.accountsSubtreeMetadata, () =>
                    Response.json(accountTree(accounts, 'parent')),
                ),
            );
        }
        const component = await mount(<Tree initialMode={mode} activeAccount="parent" />);
        await expect(row(component, 'grandchild').getByText('5', {exact: true})).toBeVisible();

        await test.step('Refresh preserves a manually collapsed child', async () => {
            await component.getByTestId('account-tree-toggle-child').click();
            accounts = accounts.map((account) =>
                account.$value === 'child' ? makeAccount('child', 'parent', 13) : account,
            );
            await component.getByRole('button', {name: 'Refresh accounts'}).click();
            await expect(row(component, 'child').getByText('13', {exact: true})).toBeVisible();
            await expect(row(component, 'grandchild')).toBeHidden();
        });
        await test.step('Selecting another account starts with its subtree expanded', async () => {
            if (mode !== 'all') {
                await router.use(
                    mockYTApi(YTApiId.accountPath, {data: '//sys/account_tree/parent/child'}),
                    mockYTApi(YTApiId.accountsSubtreeMetadata, {
                        data: accountTree(accounts, 'child'),
                    }),
                );
            }
            await component.update(<Tree initialMode={mode} activeAccount="child" />);
            await expect(row(component, 'grandchild').getByText('5', {exact: true})).toBeVisible();
            if (mode !== 'all') {
                await router.use(
                    mockYTApi(YTApiId.accountPath, {data: '//sys/account_tree/parent'}),
                    mockYTApi(YTApiId.accountsSubtreeMetadata, () =>
                        Response.json(accountTree(accounts, 'parent')),
                    ),
                );
            }
            await component.update(<Tree initialMode={mode} activeAccount="parent" />);
            await expect(row(component, 'grandchild')).toBeVisible();
        });
    });
}
