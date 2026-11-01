import {accountPathToTopLevel} from './accountPathToTopLevel';

describe('accountPathToTopLevel', () => {
    it('extracts the top-level account from its Cypress path', () => {
        expect(accountPathToTopLevel('//sys/account_tree/top/parent/account')).toBe('top');
    });

    it('rejects paths outside account_tree', () => {
        expect(accountPathToTopLevel('//sys/accounts/account')).toBeUndefined();
        expect(accountPathToTopLevel('')).toBeUndefined();
    });
});
