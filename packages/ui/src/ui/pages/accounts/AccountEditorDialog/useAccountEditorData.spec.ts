import {prepareAccountEditorData} from './prepareAccountEditorData';

describe('prepareAccountEditorData', () => {
    it('creates existing Account models and the shared account tree', () => {
        const data = prepareAccountEditorData('top', {
            $attributes: {parent_name: 'root'},
            $value: {
                child: {$attributes: {parent_name: 'top'}, $value: {}},
            },
        });

        expect(data.accounts.map(({name}) => name)).toEqual(['top', 'child']);
        expect(data.accountsByName.child.parent).toBe('top');
        expect(data.tree.top.children.map(({name}) => name)).toEqual(['child']);
        expect(data.accountsByName.top.getNodeCountProgressInfo).toEqual(expect.any(Function));
    });
});
