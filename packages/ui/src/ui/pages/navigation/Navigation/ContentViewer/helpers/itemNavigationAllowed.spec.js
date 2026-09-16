import {itemNavigationAllowed} from './itemNavigationAllowed';

describe('itemNavigationAllowed', () => {
    it.each(['map_node', 'table', 'transaction', 'transaction_map', 'portal_entrance'])(
        'allows navigation to %s',
        (type) => {
            expect(itemNavigationAllowed({type})).toBe(true);
        },
    );

    it('allows navigation when node attributes are inaccessible', () => {
        expect(itemNavigationAllowed({type: undefined})).toBe(true);
    });

    it('rejects unsupported node types', () => {
        expect(itemNavigationAllowed({type: 'unsupported_node'})).toBe(false);
    });

    it('rejects missing nodes and invalid paths', () => {
        expect(itemNavigationAllowed(undefined)).toBe(false);
        expect(
            itemNavigationAllowed({type: 'map_node', parsedPathError: {message: 'Invalid path'}}),
        ).toBe(false);
    });

    it.each([true, {$value: true}])('rejects broken links (%j)', (targetPathBroken) => {
        expect(itemNavigationAllowed({type: 'link', targetPathBroken})).toBe(false);
    });

    it.each([false, {$value: false}])('allows valid links (%j)', (targetPathBroken) => {
        expect(itemNavigationAllowed({type: 'link', targetPathBroken})).toBe(true);
    });
});
