import {parseAccountsDataSync} from '../../store/actions/accounts/accounts-ts';
import {accountTreeYsonToList} from './accountTreeYsonToList';

describe('account editor YSON helpers', () => {
    describe('accountTreeYsonToList', () => {
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
