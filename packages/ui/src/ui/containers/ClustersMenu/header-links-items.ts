import compact_ from 'lodash/compact';
import i18n from './i18n';

export interface HeaderLinkItem {
    href: string;
    text: string;
    routed?: boolean;
    getVisible?: () => Promise<boolean>;
}

export const LINKS_ITEM_CLUSTERS: HeaderLinkItem = {
    href: '/',
    get text() {
        return i18n('value_clusters');
    },
    routed: true,
};

export const ALL_LINKS_ITEMS: Array<HeaderLinkItem> = compact_([LINKS_ITEM_CLUSTERS]);

export function registerHeaderLink(item: HeaderLinkItem) {
    const found = ALL_LINKS_ITEMS.find(({href}) => item.href === href);
    if (found) {
        throw new Error(`Header link with href '${item.href}' already exist`);
    }
    ALL_LINKS_ITEMS.push(item);
}
