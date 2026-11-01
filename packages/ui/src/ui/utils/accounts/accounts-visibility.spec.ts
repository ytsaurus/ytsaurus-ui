import {filterAccountBranches, getAccountNamesWithParents} from './accounts-visibility';
import {prepareAccountsTree} from './accounts-tree';
import {filterTree, flattenTree} from '../../common/hammer/tree-list';

const accounts = [
    {name: 'department', parent: 'root'},
    {name: 'team', parent: 'department'},
    {name: 'first', parent: 'team'},
    {name: 'second', parent: 'team'},
    {name: 'hidden', parent: 'department'},
    {name: 'descendant', parent: 'first'},
];

describe('account visibility', () => {
    it('includes every ancestor once without adding siblings or descendants', () => {
        const names = getAccountNamesWithParents(accounts, ['first', 'second', 'team']);

        expect([...names].sort()).toEqual(['department', 'first', 'second', 'team']);
    });

    it('handles empty selections, missing accounts and cycles', () => {
        expect([...getAccountNamesWithParents(accounts, [])]).toEqual([]);
        expect([...getAccountNamesWithParents(accounts, ['deleted'])]).toEqual(['deleted']);
        expect([
            ...getAccountNamesWithParents(
                [
                    {name: 'a', parent: 'b'},
                    {name: 'b', parent: 'a'},
                ],
                ['a'],
            ),
        ]).toEqual(['a', 'b']);
    });

    it('keeps tree levels and prunes hidden children without mutating the full tree', () => {
        const tree = prepareAccountsTree(Object.fromEntries(accounts.map((a) => [a.name, a])));
        const root = tree['<Root>'];
        const names = getAccountNamesWithParents(accounts, ['first']);
        const branches = flattenTree(filterAccountBranches(root, names));

        expect(branches.map(({name, level}) => [name, level])).toEqual([
            ['department', 0],
            ['team', 1],
            ['first', 2],
        ]);
        expect(
            branches.map((item) => (item.isLeafNode ? [] : item.children.map(({name}) => name))),
        ).toEqual([['team'], ['first'], []]);
        expect(tree.department.children?.map(({name}) => name)).toEqual(['team', 'hidden']);
        expect(filterAccountBranches(root, undefined)).toBe(root);
        const searched = filterTree(
            filterAccountBranches(root, names),
            (item: typeof root) => item.name === 'hidden',
        );
        expect(flattenTree(searched)).toEqual([]);
    });
});
