import Account from '../../../pages/accounts/selector';
import {parseAccountsListData} from './accounts-ts';

describe('parseAccountsListData', () => {
    it('only prepares fields required for the initial accounts tree', async () => {
        const [data] = await parseAccountsListData([
            {
                $value: 'account-a',
                $attributes: {
                    abc: {id: 42, slug: 'service'},
                    parent_name: 'parent',
                },
            },
        ]);

        expect(data).toEqual({
            $value: 'account-a',
            name: 'account-a',
            $attributes: {
                abc: {id: 42, slug: 'service'},
                parent_name: 'parent',
            },
            abc: {id: 42, slug: 'service'},
            parent: 'parent',
            responsibleUsers: [],
            hasRecursiveResources: false,
            recursiveResources: {},
            perMedium: {},
            alertsCount: 0,
        });
        expect(data).not.toHaveProperty('totalNodeCount');
    });

    it('provides safe defaults for Account resource getters', async () => {
        const [data] = await parseAccountsListData([{$value: 'account-b'}]);
        const account = new Account(data);

        expect(account.getNodeCountProgressInfo()).toEqual({
            committed: undefined,
            uncommitted: undefined,
            total: undefined,
            limit: undefined,
            theme: undefined,
            progress: undefined,
            progressText: undefined,
        });
        expect(account.getDiskSpaceProgressInfo('default')).toEqual({});
    });
});
