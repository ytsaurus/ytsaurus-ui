import React from 'react';
import {type Locator} from '@playwright/test';

import {YTApiId} from '../../../../../../../shared/constants/yt-api-id';

import {expect, test} from '../../../../../../playwright-components/core/ytApiFixtures';
import {mockYTApi} from '../../../../../../playwright-components/core/mockYTApi';
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

const [parent, child, usableOnly, hidden] = defaultAccounts;

test.setTimeout(30_000);
test.use({settings: {'local::test-cluster::accounts::favourites': [{path: 'child'}]}});

function row(component: Locator, name: string) {
    return component.getByRole('row', {name: new RegExp(`^${name}(?:\\s|$)`)});
}

function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => {
        resolve = done;
    });
    return {promise, resolve};
}

test('AccountsLoading: modes show the right branches and resource values', async ({
    mount,
    router,
    ytApiRequests,
}) => {
    const accounts = [...defaultAccounts];
    const usable = [...defaultUsable];

    await router.use(
        mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
        mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
        mockYTApi(YTApiId.accountsNodes, {data: {}}),
        mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
        mockYTApi(YTApiId.accountsSelectedMetadata, {
            data: accountBatch([child, parent, usableOnly]),
        }),
    );
    const component = await mount(<Tree />);
    await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
    await expect(row(component, 'usable-only').getByText('22', {exact: true})).toBeVisible();
    await expect(row(component, 'parent').getByText('90', {exact: true})).toBeVisible();
    await expect(row(component, 'hidden')).toHaveCount(0);
    expect(
        ytApiRequests.filter(({id}) => id === YTApiId.accountsSelectedMetadata)[0].parameters
            .requests,
    ).toHaveLength(3);

    await test.step('Favourites keeps its parent and hides other children', async () => {
        await router.use(
            mockYTApi(YTApiId.accountsSelectedMetadata, {data: accountBatch([child, parent])}),
        );
        await component.getByRole('radio', {name: 'Favourites', exact: true}).check();
        await expect(row(component, 'usable-only')).toHaveCount(0);
        await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
        await expect(row(component, 'parent').getByText('90', {exact: true})).toBeVisible();
    });

    await test.step('All includes resources of the hidden child', async () => {
        await router.use(mockYTApi(YTApiId.accountsData, () => Response.json(accounts)));
        await component.getByRole('radio', {name: 'All', exact: true}).check();
        await component.getByTestId('account-tree-toggle-parent').click();
        await expect(row(component, 'hidden').getByText('57', {exact: true})).toBeVisible();
    });
});

test('AccountsLoading: removing the last favourite removes its parent', async ({
    mount,
    router,
    ytApiRequests,
}) => {
    const accounts = [...defaultAccounts];
    const usable = [...defaultUsable];

    await router.use(
        mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
        mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
        mockYTApi(YTApiId.accountsNodes, {data: {}}),
        mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
        mockYTApi(YTApiId.accountsSelectedMetadata, {
            data: accountBatch([child, parent]),
        }),
    );
    const component = await mount(<Tree initialMode="favourites" />);
    const childRow = row(component, 'child');
    await expect(childRow.getByText('11', {exact: true})).toBeVisible();
    await childRow.getByTestId('account-favourite-child').click();
    await expect(component.getByText('No items to show')).toBeVisible();
    await expect(row(component, 'parent')).toHaveCount(0);
    const batches = ytApiRequests.filter(({id}) => id === YTApiId.accountsSelectedMetadata);
    expect(batches).toHaveLength(1);
});

test('AccountsLoading: selected account outside Favourites still has resources', async ({
    mount,
    router,
}) => {
    const accounts = [...defaultAccounts];
    const usable = [...defaultUsable];

    await router.use(
        mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
        mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
        mockYTApi(YTApiId.accountsNodes, {data: {}}),
        mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
        mockYTApi(YTApiId.accountPath, {data: '//sys/account_tree/parent/hidden'}),
        mockYTApi(YTApiId.accountsSubtreeMetadata, {data: accountTree(accounts, 'hidden')}),
    );
    const component = await mount(<Tree initialMode="favourites" activeAccount="hidden" />);
    await expect(row(component, 'hidden').getByText('57', {exact: true})).toBeVisible();
});

for (const mode of ['usable', 'favourites'] as const) {
    test(`AccountsLoading: empty ${mode} does not load resources`, async ({
        mount,
        router,
        ytApiRequests,
    }) => {
        const accounts = [...defaultAccounts];

        await router.use(
            mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
            mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
            mockYTApi(YTApiId.accountsNodes, {data: {}}),
            mockYTApi(YTApiId.listUsableAccounts, {data: []}),
        );
        const component = await mount(<Tree initialMode={mode} favourites={[]} />);
        await expect(component.getByText('No items to show')).toBeVisible();
        expect(ytApiRequests.some(({id}) => id === YTApiId.accountsSelectedMetadata)).toBe(false);
        expect(
            ytApiRequests.filter(
                ({id}) => id === YTApiId.accountsListData || id === YTApiId.accountsData,
            ),
        ).toHaveLength(1);
    });
}

test('AccountsLoading: a pending resource response leaves the value empty until it arrives', async ({
    mount,
    router,
}) => {
    const accounts = [...defaultAccounts];
    const usable = [...defaultUsable];

    const release = deferred();
    const started = deferred();

    await router.use(
        mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
        mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
        mockYTApi(YTApiId.accountsNodes, {data: {}}),
        mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
    );
    await router.use(
        mockYTApi(YTApiId.accountsSelectedMetadata, async () => {
            started.resolve();
            await release.promise;
            return Response.json(accountBatch([child, parent, usableOnly]));
        }),
    );
    const component = await mount(<Tree />);
    await started.promise;
    await expect(row(component, 'child')).toBeVisible();
    await expect(row(component, 'child').getByText('11', {exact: true})).toHaveCount(0);
    release.resolve();
    await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
});

test('AccountsLoading: usable failure stays filtered and recovers on refresh', async ({
    mount,
    router,
    ytApiRequests,
}) => {
    const accounts = [...defaultAccounts];
    const usable = [...defaultUsable];

    let fail = true;

    await router.use(
        mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
        mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
        mockYTApi(YTApiId.accountsNodes, {data: {}}),
    );
    await router.use(
        mockYTApi(YTApiId.listUsableAccounts, async () => {
            if (fail) {
                return Response.json({code: 500, message: 'Usable is unavailable'}, {status: 500});
            }
            return Response.json(usable);
        }),
    );
    const component = await mount(<Tree />);
    await expect(component.getByText('Usable is unavailable', {exact: true})).toBeVisible();
    await expect(row(component, 'hidden')).toHaveCount(0);
    expect(ytApiRequests.some(({id}) => id === YTApiId.accountsSelectedMetadata)).toBe(false);
    fail = false;
    await router.use(
        mockYTApi(YTApiId.accountsSelectedMetadata, {
            data: accountBatch([child, parent, usableOnly]),
        }),
    );

    await component.getByRole('button', {name: 'Refresh accounts'}).click();
    await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
    await expect(component.getByText('Usable is unavailable', {exact: true})).toHaveCount(0);
});

test('AccountsLoading: partial batch keeps successful resources and recovers', async ({
    mount,
    router,
}) => {
    const accounts = [...defaultAccounts];
    const usable = [...defaultUsable];

    await router.use(
        mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
        mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
        mockYTApi(YTApiId.accountsNodes, {data: {}}),
        mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
    );
    await router.use(
        mockYTApi(YTApiId.accountsSelectedMetadata, {
            data: [
                {error: {code: 500, message: 'Child is unavailable'}},
                ...accountBatch([parent, usableOnly]),
            ],
        }),
    );
    const component = await mount(<Tree />);
    await expect(
        component.getByText('Failed to load account resources', {exact: true}),
    ).toBeVisible();
    await expect(row(component, 'parent').getByText('90', {exact: true})).toBeVisible();
    await expect(row(component, 'child').getByText('11', {exact: true})).toHaveCount(0);
    await router.use(
        mockYTApi(YTApiId.accountsSelectedMetadata, {
            data: accountBatch([child, parent, usableOnly]),
        }),
    );
    await component.getByRole('button', {name: 'Refresh accounts'}).click();
    await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
    await expect(
        component.getByText('Failed to load account resources', {exact: true}),
    ).toHaveCount(0);
});

for (const mode of ['all', 'usable'] as const) {
    test(`AccountsLoading: ${mode} metadata failure shows an error and can retry`, async ({
        mount,
        router,
    }) => {
        const accounts = [...defaultAccounts];
        const usable = [...defaultUsable];

        let fail = true;

        await router.use(
            mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
            mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
            mockYTApi(YTApiId.accountsNodes, {data: {}}),
            mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
        );
        await router.use(
            mockYTApi(
                mode === 'all' ? YTApiId.accountsData : YTApiId.accountsSelectedMetadata,
                async () => {
                    if (fail) {
                        return Response.json(
                            {code: 500, message: 'Resources are unavailable'},
                            {status: 500},
                        );
                    }
                    if (mode === 'all') {
                        return Response.json(accounts);
                    }
                    return Response.json(accountBatch([child, parent, usableOnly]));
                },
            ),
        );
        const component = await mount(<Tree initialMode={mode} />);
        await expect(component.getByText('Resources are unavailable', {exact: true})).toBeVisible();
        fail = false;
        await component.getByRole('button', {name: 'Refresh accounts'}).click();
        if (mode === 'all') {
            await component.getByTestId('account-tree-toggle-parent').click();
        }
        await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
        await expect(component.getByText('Resources are unavailable', {exact: true})).toHaveCount(
            0,
        );
    });
}

for (const finish of ['success', 'failure'] as const) {
    test(`AccountsLoading: ignores old ${finish} after switching modes`, async ({
        mount,
        router,
    }) => {
        let accounts = [...defaultAccounts];
        const usable = [...defaultUsable];

        const started = deferred();
        const release = deferred();
        const delivered = deferred();
        let pending = true;

        await router.use(
            mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
            mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
            mockYTApi(YTApiId.accountsNodes, {data: {}}),
            mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
        );
        await router.use(
            mockYTApi(YTApiId.accountsData, async () => {
                if (pending) {
                    pending = false;
                    const response = Response.json(accounts);
                    started.resolve();
                    await release.promise;
                    delivered.resolve();
                    return finish === 'success'
                        ? response
                        : Response.json({code: 500, message: 'Old failure'}, {status: 500});
                }
                return Response.json(accounts);
            }),
        );
        const component = await mount(<Tree initialMode="all" />);
        await started.promise;
        accounts = accounts.map((account) =>
            account.$value === 'child' ? makeAccount('child', 'parent', 33) : account,
        );

        await router.use(
            mockYTApi(YTApiId.accountsSelectedMetadata, {
                data: accountBatch([makeAccount('child', 'parent', 33), parent]),
            }),
        );
        await component.getByRole('radio', {name: 'Favourites', exact: true}).check();
        await expect(row(component, 'child').getByText('33', {exact: true})).toBeVisible();
        release.resolve();
        await delivered.promise;
        await expect(row(component, 'hidden')).toHaveCount(0);
        await expect(component.getByText('Old failure', {exact: true})).toHaveCount(0);
        await expect(row(component, 'child').getByText('33', {exact: true})).toBeVisible();
    });
}

for (const count of [299, 300]) {
    test(`AccountsLoading: ${count} selected children count their parent toward the batch limit`, async ({
        mount,
        router,
        ytApiRequests,
    }) => {
        const usable = Array.from({length: count}, (_, index) => `child-${index}`);
        const children = usable.map((name) => makeAccount(name, 'parent'));
        const accounts = [parent, ...children];
        const [firstChild, ...otherChildren] = children;

        await router.use(
            mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
            mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
            mockYTApi(YTApiId.accountsNodes, {data: {}}),
            mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
        );

        if (count === 299) {
            await router.use(
                mockYTApi(YTApiId.accountsSelectedMetadata, {
                    data: accountBatch([firstChild, parent, ...otherChildren]),
                }),
            );
        } else {
            await router.use(mockYTApi(YTApiId.accountsData, () => Response.json(accounts)));
        }
        const component = await mount(<Tree />);
        await expect(row(component, 'child-0').getByText('7', {exact: true})).toBeVisible();
        const batches = ytApiRequests.filter(({id}) => id === YTApiId.accountsSelectedMetadata);
        if (count === 299) {
            expect(batches).toHaveLength(1);
            expect(batches[0].parameters.requests).toHaveLength(300);
            expect(
                ytApiRequests.filter(
                    ({id}) => id === YTApiId.accountsListData || id === YTApiId.accountsData,
                ),
            ).toHaveLength(1);
        } else {
            expect(batches).toHaveLength(0);
            expect(
                ytApiRequests.filter(
                    ({id}) => id === YTApiId.accountsListData || id === YTApiId.accountsData,
                ),
            ).toHaveLength(2);
        }
        await expect(component.getByRole('radio', {name: 'Usable', exact: true})).toBeChecked();
    });
}

for (const finish of ['success', 'failure'] as const) {
    test(`AccountsLoading: refresh with identical parameters ignores old batch ${finish}`, async ({
        mount,
        router,
    }) => {
        let accounts = [...defaultAccounts];
        const usable = [...defaultUsable];

        const started = deferred();
        const release = deferred();
        const delivered = deferred();
        let pending = true;

        await router.use(
            mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
            mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
            mockYTApi(YTApiId.accountsNodes, {data: {}}),
            mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
        );
        await router.use(
            mockYTApi(YTApiId.accountsSelectedMetadata, async () => {
                const response = Response.json(accountBatch([child, parent, usableOnly]));
                if (!pending) {
                    return Response.json(
                        accountBatch([makeAccount('child', 'parent', 33), parent, usableOnly]),
                    );
                }
                pending = false;
                started.resolve();
                await release.promise;
                delivered.resolve();
                return finish === 'success'
                    ? response
                    : Response.json({code: 500, message: 'Old batch failure'}, {status: 500});
            }),
        );
        const component = await mount(<Tree />);
        await started.promise;
        accounts = accounts.map((account) =>
            account.$value === 'child' ? makeAccount('child', 'parent', 33) : account,
        );
        await component.getByRole('button', {name: 'Refresh accounts'}).click();
        await expect(row(component, 'child').getByText('33', {exact: true})).toBeVisible();
        release.resolve();
        await delivered.promise;
        await expect(component.getByText('Old batch failure', {exact: true})).toHaveCount(0);
        await expect(row(component, 'child').getByText('11', {exact: true})).toHaveCount(0);
        await expect(row(component, 'child').getByText('33', {exact: true})).toBeVisible();
    });
}

const totalsHint = 'Totals include all child accounts, not just those shown.';

for (const mode of ['usable', 'favourites'] as const) {
    test(`AccountsLoading: ${mode} totals hints follow immediate children and ignore collapsing`, async ({
        mount,
        router,
    }) => {
        const accounts = [...defaultAccounts];
        let usable = [...defaultUsable];

        accounts.push(makeAccount('grandchild', 'child', 5));
        usable = ['child', 'usable-only', 'hidden'];
        const favourites = ['child', 'usable-only', 'hidden'];

        await router.use(
            mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
            mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
            mockYTApi(YTApiId.accountsNodes, {data: {}}),
            mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
            mockYTApi(YTApiId.accountsSelectedMetadata, {
                data: accountBatch(
                    mode === 'usable'
                        ? [child, parent, usableOnly, hidden]
                        : [child, parent, hidden, usableOnly],
                ),
            }),
        );
        const component = await mount(<Tree initialMode={mode} favourites={favourites} />);

        await test.step('A hidden grandchild only adds a hint to its immediate parent', async () => {
            await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
            await expect(
                row(component, 'child').getByLabel(totalsHint, {exact: true}),
            ).toBeVisible();
            await expect(row(component, 'parent').getByLabel(/Totals include/)).toHaveCount(0);
            await expect(row(component, 'grandchild')).toHaveCount(0);
        });
        await test.step('Collapsing changes neither hint', async () => {
            await component.getByTestId('account-tree-toggle-parent').click();
            await expect(row(component, 'child')).toBeHidden();
            await expect(row(component, 'parent').getByLabel(/Totals include/)).toHaveCount(0);
            await component.getByTestId('account-tree-toggle-parent').click();
            await expect(
                row(component, 'child').getByLabel(totalsHint, {exact: true}),
            ).toBeVisible();
        });
        await test.step('Filtering out immediate children combines totals and parent explanations', async () => {
            await component.getByPlaceholder('Account...').fill('child');
            await expect(row(component, 'usable-only')).toHaveCount(0);
            const parentHint =
                mode === 'usable'
                    ? 'No "Use" permission. Shown as a parent of an account with this permission.'
                    : 'Not in Favourites. Shown as a parent of a favourite account.';
            await expect(
                row(component, 'parent').getByLabel(`${parentHint} ${totalsHint}`, {exact: true}),
            ).toBeVisible();
            await component.getByPlaceholder('Account...').fill('');
            await expect(row(component, 'parent').getByLabel(/Totals include/)).toHaveCount(0);
        });
    });

    test(`AccountsLoading: ${mode} selected subtree includes every level and aggregates its children`, async ({
        mount,
        router,
        ytApiRequests,
    }) => {
        const accounts = [...defaultAccounts];
        const usable = [...defaultUsable];

        accounts.push(makeAccount('grandchild', 'child', 5));

        await router.use(
            mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
            mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
            mockYTApi(YTApiId.accountsNodes, {data: {}}),
            mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
            mockYTApi(YTApiId.accountPath, {data: '//sys/account_tree/parent'}),
            mockYTApi(YTApiId.accountsSubtreeMetadata, () =>
                Response.json(accountTree(accounts, 'parent')),
            ),
        );
        const component = await mount(<Tree initialMode={mode} activeAccount="parent" />);

        await test.step('All descendants have resources and are expanded', async () => {
            await expect(row(component, 'grandchild').getByText('5', {exact: true})).toBeVisible();
            await expect(row(component, 'hidden').getByText('57', {exact: true})).toBeVisible();
            await expect(
                row(component, 'Aggregation').getByText('90', {exact: true}),
            ).toBeVisible();
            await expect(row(component, 'parent').getByLabel(/Totals include/)).toHaveCount(0);
            await expect(
                row(component, 'hidden').getByLabel(
                    mode === 'usable' ? 'No "Use" permission.' : 'Not in Favourites.',
                    {exact: true},
                ),
            ).toBeVisible();
            expect(ytApiRequests.some(({id}) => id === YTApiId.accountsSelectedMetadata)).toBe(
                false,
            );
        });
        await test.step('Name filtering still works inside the selected subtree', async () => {
            await component.getByPlaceholder('Account...').fill('grandchild');
            await expect(row(component, 'grandchild')).toBeVisible();
            await expect(row(component, 'hidden')).toHaveCount(0);
            await expect(row(component, 'parent').getByLabel(/Totals include/)).toBeVisible();
            await expect(
                row(component, 'Aggregation').getByText('11', {exact: true}),
            ).toBeVisible();
            await component.getByPlaceholder('Account...').fill('');
        });
        await test.step('Returning to the overview restores the selected mode', async () => {
            await router.use(
                mockYTApi(YTApiId.accountsSelectedMetadata, {
                    data: accountBatch(
                        mode === 'usable' ? [child, parent, usableOnly] : [child, parent],
                    ),
                }),
            );
            await component.update(<Tree initialMode={mode} />);
            await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
            await expect(row(component, 'grandchild')).toHaveCount(0);
            await expect(row(component, 'hidden')).toHaveCount(0);
            await expect(row(component, 'Aggregation')).toHaveCount(0);
        });
    });
}

test('AccountsLoading: ABC filter still narrows the selected subtree and marks hidden children', async ({
    mount,
    router,
}) => {
    let accounts = [...defaultAccounts];
    const usable = [...defaultUsable];

    accounts = [
        makeAccount('parent', 'root', 90),
        makeAccount('child', 'parent', 11, 'selected-service'),
        makeAccount('hidden', 'parent', 79, 'other-service'),
    ];

    await router.use(
        mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
        mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
        mockYTApi(YTApiId.accountsNodes, {data: {}}),
        mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
        mockYTApi(YTApiId.accountPath, {data: '//sys/account_tree/parent'}),
        mockYTApi(YTApiId.accountsSubtreeMetadata, () =>
            Response.json(accountTree(accounts, 'parent')),
        ),
    );
    const component = await mount(
        <Tree initialMode="favourites" activeAccount="parent" abcSlug="selected-service" />,
    );

    await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
    await expect(row(component, 'hidden')).toHaveCount(0);
    await expect(row(component, 'parent').getByLabel(/Totals include/)).toBeVisible();
    await expect(row(component, 'Aggregation').getByText('11', {exact: true})).toBeVisible();
});

for (const id of [YTApiId.accountPath, YTApiId.accountsSubtreeMetadata]) {
    test(`AccountsLoading: ${id} failure keeps aggregation and recovers on refresh`, async ({
        mount,
        router,
    }) => {
        const accounts = [...defaultAccounts];
        const usable = [...defaultUsable];

        let fail = true;

        await router.use(
            mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
            mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
            mockYTApi(YTApiId.accountsNodes, {data: {}}),
            mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
            mockYTApi(
                id === YTApiId.accountPath ? YTApiId.accountsSubtreeMetadata : YTApiId.accountPath,
                {
                    data:
                        id === YTApiId.accountPath
                            ? accountTree(accounts, 'parent')
                            : '//sys/account_tree/parent',
                },
            ),
        );
        await router.use(
            mockYTApi(id, async () => {
                if (fail) {
                    return Response.json(
                        {code: 500, message: 'Subtree is unavailable'},
                        {status: 500},
                    );
                }
                if (id === YTApiId.accountPath) {
                    return Response.json('//sys/account_tree/parent');
                }
                return Response.json(accountTree(accounts, 'parent'));
            }),
        );
        const component = await mount(<Tree activeAccount="parent" />);
        await expect(component.getByText('Subtree is unavailable', {exact: true})).toBeVisible();
        await expect(row(component, 'Aggregation')).toBeVisible();
        await expect(component.getByTestId('accounts-aggregation-loading')).toHaveCount(0);
        await expect(row(component, 'Aggregation').getByText('0', {exact: true})).toHaveCount(0);

        fail = false;
        await component.getByRole('button', {name: 'Refresh accounts'}).click();
        await expect(row(component, 'hidden').getByText('57', {exact: true})).toBeVisible();
        await expect(row(component, 'Aggregation').getByText('90', {exact: true})).toBeVisible();
        await expect(component.getByText('Subtree is unavailable', {exact: true})).toHaveCount(0);
    });
}

test('AccountsLoading: usable failure does not block the selected subtree', async ({
    mount,
    router,
}) => {
    const accounts = [...defaultAccounts];

    await router.use(
        mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
        mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
        mockYTApi(YTApiId.accountsNodes, {data: {}}),
        mockYTApi(YTApiId.accountPath, {data: '//sys/account_tree/parent'}),
        mockYTApi(YTApiId.accountsSubtreeMetadata, () =>
            Response.json(accountTree(accounts, 'parent')),
        ),
    );
    await router.use(
        mockYTApi(YTApiId.listUsableAccounts, {
            error: {code: 500, message: 'Usable is unavailable'},
        }),
    );
    const component = await mount(<Tree activeAccount="parent" />);

    await expect(component.getByText('Usable is unavailable', {exact: true})).toBeVisible();
    await expect(row(component, 'hidden').getByText('57', {exact: true})).toBeVisible();
    await expect(row(component, 'Aggregation').getByText('90', {exact: true})).toBeVisible();
});

for (const id of [YTApiId.accountPath, YTApiId.accountsSubtreeMetadata]) {
    for (const finish of ['success', 'failure'] as const) {
        test(`AccountsLoading: ignores old ${id} ${finish} after selecting another account`, async ({
            mount,
            router,
            ytApiRequests,
        }) => {
            let accounts = [...defaultAccounts];
            const usable = [...defaultUsable];

            const started = deferred();
            const release = deferred();
            const delivered = deferred();
            let pending = true;

            await router.use(
                mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
                mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
                mockYTApi(YTApiId.accountsNodes, {data: {}}),
                mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
                mockYTApi(
                    id === YTApiId.accountPath
                        ? YTApiId.accountsSubtreeMetadata
                        : YTApiId.accountPath,
                    {
                        data:
                            id === YTApiId.accountPath
                                ? accountTree(accounts, 'parent')
                                : '//sys/account_tree/parent',
                    },
                ),
            );
            await router.use(
                mockYTApi(id, async () => {
                    if (pending) {
                        pending = false;
                        const response =
                            id === YTApiId.accountPath
                                ? Response.json('//sys/account_tree/parent')
                                : Response.json(accountTree(accounts, 'parent'));
                        started.resolve();
                        await release.promise;
                        delivered.resolve();
                        return finish === 'success'
                            ? response
                            : Response.json(
                                  {code: 500, message: 'Old subtree failure'},
                                  {status: 500},
                              );
                    }
                    if (id === YTApiId.accountPath) {
                        return Response.json('//sys/account_tree/parent');
                    }
                    return Response.json(accountTree(accounts, 'parent'));
                }),
            );
            const component = await mount(<Tree activeAccount="parent" />);
            await started.promise;
            accounts = accounts.map((account) =>
                account.$value === 'child' ? makeAccount('child', 'parent', 33) : account,
            );
            await expect(row(component, 'Aggregation')).toBeVisible();
            await expect(component.getByTestId('accounts-aggregation-loading')).toBeVisible();
            await expect(row(component, 'Aggregation').getByText('0', {exact: true})).toHaveCount(
                0,
            );

            await router.use(
                mockYTApi(YTApiId.accountPath, {data: '//sys/account_tree/parent/child'}),
                mockYTApi(YTApiId.accountsSubtreeMetadata, {data: accountTree(accounts, 'child')}),
            );
            await component.update(<Tree activeAccount="child" />);
            await expect(row(component, 'child').getByText('33', {exact: true})).toBeVisible();
            release.resolve();
            await delivered.promise;
            await expect(component.getByText('Old subtree failure', {exact: true})).toHaveCount(0);
            await expect(row(component, 'parent')).toHaveCount(0);
            await expect(row(component, 'child').getByText('33', {exact: true})).toBeVisible();
            if (id === YTApiId.accountPath) {
                expect(
                    ytApiRequests.filter(
                        (item) =>
                            item.id === YTApiId.accountsSubtreeMetadata &&
                            item.parameters.path === '//sys/account_tree/parent',
                    ),
                ).toHaveLength(0);
            }
        });
    }
}

for (const truncation of ['incomplete', 'opaque'] as const) {
    test(`AccountsLoading: ${truncation} subtree response shows an error and recovers on refresh`, async ({
        mount,
        router,
    }) => {
        const accounts = [...defaultAccounts];
        const usable = [...defaultUsable];

        let truncate = true;

        await router.use(
            mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
            mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
            mockYTApi(YTApiId.accountsNodes, {data: {}}),
            mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
            mockYTApi(YTApiId.accountPath, {data: '//sys/account_tree/parent'}),
        );
        await router.use(
            mockYTApi(YTApiId.accountsSubtreeMetadata, async () => {
                const response = Response.json(accountTree(accounts, 'parent'));
                if (!truncate) {
                    return response;
                }
                const tree = await response.json();
                if (truncation === 'incomplete') {
                    tree.$attributes.incomplete = true;
                } else {
                    tree.$value.child = {$value: null};
                }
                return Response.json(tree);
            }),
        );
        const component = await mount(<Tree activeAccount="parent" />);
        await expect(
            component.getByText('The account subtree response is incomplete.', {exact: true}),
        ).toBeVisible();
        await expect(row(component, 'Aggregation')).toBeVisible();
        await expect(component.getByTestId('accounts-aggregation-loading')).toHaveCount(0);

        truncate = false;
        await component.getByRole('button', {name: 'Refresh accounts'}).click();
        await expect(row(component, 'Aggregation').getByText('90', {exact: true})).toBeVisible();
        await expect(
            component.getByText('The account subtree response is incomplete.', {exact: true}),
        ).toHaveCount(0);
    });
}

for (const id of [
    YTApiId.accountsListData,
    YTApiId.accountPath,
    YTApiId.accountsSubtreeMetadata,
] as const) {
    test(`AccountsLoading: aggregation shows loading during ${id} refresh`, async ({
        mount,
        router,
    }) => {
        const accounts = [...defaultAccounts];
        const usable = [...defaultUsable];

        await router.use(
            mockYTApi(YTApiId.accountsListData, () => Response.json(accountList(accounts))),
            mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
            mockYTApi(YTApiId.accountsNodes, {data: {}}),
            mockYTApi(YTApiId.listUsableAccounts, {data: usable}),
            mockYTApi(YTApiId.accountPath, {data: '//sys/account_tree/parent'}),
            mockYTApi(YTApiId.accountsSubtreeMetadata, () =>
                Response.json(accountTree(accounts, 'parent')),
            ),
        );
        const component = await mount(<Tree activeAccount="parent" />);
        await expect(row(component, 'Aggregation').getByText('90', {exact: true})).toBeVisible();
        await expect(component.getByTestId('accounts-aggregation-loading')).toHaveCount(0);

        const responseData = {
            [YTApiId.accountsListData]: accountList(accounts),
            [YTApiId.accountPath]: '//sys/account_tree/parent',
            [YTApiId.accountsSubtreeMetadata]: accountTree(accounts, 'parent'),
        };
        const started = deferred();
        const release = deferred();
        await router.use(
            mockYTApi(id, async () => {
                started.resolve();
                await release.promise;
                return Response.json(responseData[id]);
            }),
        );
        await component.getByRole('button', {name: 'Refresh accounts'}).click();
        await started.promise;
        await expect(row(component, 'Aggregation')).toBeVisible();
        await expect(component.getByTestId('accounts-aggregation-loading')).toBeVisible();

        release.resolve();
        await expect(component.getByTestId('accounts-aggregation-loading')).toHaveCount(0);
        await expect(row(component, 'Aggregation').getByText('90', {exact: true})).toBeVisible();
    });
}
