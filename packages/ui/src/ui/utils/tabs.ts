export type TabPosition = {before: string} | {after: string};

export type TabDescription = {
    value: string;
    title?: string;
    text?: string;
    caption?: string;
    hotkey?: string;
    position?: TabPosition;
};

export type PreparedTab = Omit<TabDescription, 'hotkey' | 'position'> & {
    hotkey?: Array<{keys: string; tab: string; scope: string}>;
};

export function insertTab(tabs: Array<PreparedTab>, tab: TabDescription): void {
    const {value, title, text, caption, hotkey, position} = tab;
    const item = {
        value,
        title,
        text,
        caption,
        hotkey: hotkey ? [{keys: hotkey, tab: value, scope: 'all'}] : undefined,
    };

    if (!position) {
        tabs.push(item);
        return;
    }

    const anchor = 'before' in position ? position.before : position.after;
    const index = tabs.findIndex(({value: tabValue}) => tabValue === anchor);
    if (index === -1) {
        return;
    }

    tabs.splice(index + ('after' in position ? 1 : 0), 0, item);
}
