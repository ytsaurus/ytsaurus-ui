import Account from '../../../pages/accounts/selector';
import {parseAccountsData, parseAccountsListData} from './accounts-ts';

describe('parseAccountsData', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        Reflect.deleteProperty(window, 'scheduler');
    });

    it('checks elapsed time every 100 items and yields after 40 ms', async () => {
        const schedulerYield = jest.fn(() => Promise.resolve());
        Object.defineProperty(window, 'scheduler', {
            configurable: true,
            value: {yield: schedulerYield},
        });
        let time = 0;
        jest.spyOn(performance, 'now').mockImplementation(() => {
            time += 10;
            return time;
        });
        const data = Array.from({length: 1000}, (_, index) => ({
            $value: `account-${index}`,
            $attributes: {},
        }));

        const result = await parseAccountsData(data);

        expect(result).toHaveLength(1000);
        expect(result[999].name).toBe('account-999');
        expect(schedulerYield).toHaveBeenCalledTimes(2);
    });
});

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
