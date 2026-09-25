import {parseAccountsDataSync} from '../../../store/actions/accounts/accounts-ts';
import {accountPathToTopLevel, accountTreeYsonToList} from './accountTreeYsonToList';

describe('account editor YSON helpers', () => {
    describe('accountPathToTopLevel', () => {
        it('extracts the top-level account from its Cypress path', () => {
            expect(accountPathToTopLevel('//sys/account_tree/top/parent/account')).toBe('top');
        });

        it('rejects paths outside account_tree', () => {
            expect(accountPathToTopLevel('//sys/accounts/account')).toBeUndefined();
            expect(accountPathToTopLevel()).toBeUndefined();
        });
    });

    describe('accountTreeYsonToList', () => {
        it('returns an empty list without a response', () => {
            expect(accountTreeYsonToList('top')).toEqual([]);
        });

        it('flattens all levels and keeps attributes compatible with the existing parser', () => {
            const items = accountTreeYsonToList('top', {
                $attributes: {parent_name: 'root', abc: {id: 1, slug: 'top'}},
                $value: {
                    child: {
                        $attributes: {parent_name: 'top'},
                        $value: {
                            nested: {$attributes: {parent_name: 'child'}, $value: {}},
                        },
                    },
                },
            });

            expect(items).toEqual([
                {
                    $value: 'top',
                    $attributes: {parent_name: 'root', abc: {id: 1, slug: 'top'}},
                },
                {$value: 'child', $attributes: {parent_name: 'top'}},
                {$value: 'nested', $attributes: {parent_name: 'child'}},
            ]);

            const accounts = parseAccountsDataSync(items);

            expect(accounts.map(({name, parent}) => ({name, parent}))).toEqual([
                {name: 'top', parent: 'root'},
                {name: 'child', parent: 'top'},
                {name: 'nested', parent: 'child'},
            ]);
            expect(accounts[0].abc).toEqual({id: 1, slug: 'top'});
        });
    });
});
