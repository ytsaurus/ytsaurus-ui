import {type PreparedTab, type TabDescription, insertTab} from './tabs';

describe('insertTab', () => {
    it('inserts after the anchor and preserves display metadata', () => {
        const tabs: Array<PreparedTab> = [
            {value: 'monitor', title: 'Monitoring'},
            {value: 'acl', title: 'ACL'},
        ];
        const health: TabDescription = {
            value: 'health',
            title: 'Health',
            text: 'Bundle health',
            caption: 'Last five days',
            position: {after: 'monitor'},
        };

        insertTab(tabs, health);

        expect(tabs).toEqual([
            {value: 'monitor', title: 'Monitoring'},
            {
                value: 'health',
                title: 'Health',
                text: 'Bundle health',
                caption: 'Last five days',
            },
            {value: 'acl', title: 'ACL'},
        ]);
        expect(health.position).toEqual({after: 'monitor'});
    });

    it('converts a shortcut to tab hotkey settings without changing the description', () => {
        const tabs: Array<PreparedTab> = [];
        const extraTab = {
            value: 'extra_health',
            title: 'Health',
            hotkey: 'alt+h',
            component: () => null,
        };

        insertTab(tabs, extraTab);

        expect(tabs).toEqual([
            {
                value: 'extra_health',
                title: 'Health',
                hotkey: [{keys: 'alt+h', tab: 'extra_health', scope: 'all'}],
            },
        ]);
        expect(extraTab.hotkey).toBe('alt+h');
    });

    it('inserts before the first tab', () => {
        const tabs = [{value: 'monitor'}];

        insertTab(tabs, {value: 'health', title: 'Health', position: {before: 'monitor'}});

        expect(tabs.map(({value}) => value)).toEqual(['health', 'monitor']);
    });

    it('appends without a position and does not assign an absent or empty shortcut', () => {
        const tabs: Array<PreparedTab> = [];

        insertTab(tabs, {value: 'monitor', title: 'Monitoring'});
        insertTab(tabs, {value: 'health', title: 'Health', hotkey: ''});

        expect(tabs.map(({value}) => value)).toEqual(['monitor', 'health']);
        expect(tabs.every(({hotkey}) => hotkey === undefined)).toBe(true);
    });

    it('does not insert when the anchor is missing', () => {
        const tabs = [{value: 'acl'}];

        insertTab(tabs, {value: 'health', title: 'Health', position: {after: 'monitor'}});

        expect(tabs).toEqual([{value: 'acl'}]);
    });

    it('can position a tab relative to a previously inserted tab', () => {
        const tabs = [{value: 'monitor'}, {value: 'acl'}];

        insertTab(tabs, {value: 'health', title: 'Health', position: {after: 'monitor'}});
        insertTab(tabs, {value: 'usage', title: 'Usage', position: {after: 'health'}});

        expect(tabs.map(({value}) => value)).toEqual(['monitor', 'health', 'usage', 'acl']);
    });
});
