import {getAccountQuotaSources, isTopLevelAccount, prepareAccountsTree} from './accounts-tree';

interface Account {
    name: string;
    parent?: string;
}

function makeAccount(name: string, parent?: string): Account {
    return {name, parent};
}

describe('account tree helpers', () => {
    describe('isTopLevelAccount', () => {
        it('recognizes accounts without a parent and children of the root account', () => {
            expect(isTopLevelAccount(makeAccount('top'))).toBe(true);
            expect(isTopLevelAccount(makeAccount('top', 'root'))).toBe(true);
            expect(isTopLevelAccount(makeAccount('child', 'top'))).toBe(false);
        });
    });

    describe('prepareAccountsTree', () => {
        it('builds an account tree and attaches missing parents to the root', () => {
            const accounts = {
                top: makeAccount('top'),
                child: makeAccount('child', 'top'),
                orphan: makeAccount('orphan', 'missing'),
            };

            const tree = prepareAccountsTree(accounts);

            expect(tree.top.children.map(({name}) => name)).toEqual(['child']);
            expect(tree['<Root>'].children.map(({name}) => name)).toEqual(['top', 'orphan']);
            expect(tree.orphan.parent).toBe('<Root>');
        });
    });

    describe('getAccountQuotaSources', () => {
        it('returns every other account from the same top-level subtree', () => {
            const accounts = {
                top: makeAccount('top'),
                parent: makeAccount('parent', 'top'),
                current: makeAccount('current', 'parent'),
                child: makeAccount('child', 'current'),
                sibling: makeAccount('sibling', 'parent'),
                cousin: makeAccount('cousin', 'top'),
                anotherTop: makeAccount('anotherTop'),
                outside: makeAccount('outside', 'anotherTop'),
            };
            const tree = prepareAccountsTree(accounts);

            expect(getAccountQuotaSources('current', tree)).toEqual([
                'child',
                'cousin',
                'parent',
                'sibling',
                'top',
            ]);
        });

        it('returns descendants only for a top-level account', () => {
            const accounts = {
                top: makeAccount('top'),
                child: makeAccount('child', 'top'),
                nested: makeAccount('nested', 'child'),
                anotherTop: makeAccount('anotherTop'),
            };
            const tree = prepareAccountsTree(accounts);

            expect(getAccountQuotaSources('top', tree)).toEqual(['child', 'nested']);
        });

        it('returns an empty list for an unknown account', () => {
            const tree = prepareAccountsTree({top: makeAccount('top')});

            expect(getAccountQuotaSources('missing', tree)).toEqual([]);
        });
    });
});
