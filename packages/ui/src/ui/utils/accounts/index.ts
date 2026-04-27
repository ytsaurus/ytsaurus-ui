import {
    ACCOUNTS_COLUMN_SETS,
    columnsItems,
    diskSpaceColumnsItems,
} from '../../utils/accounts/tables';
import hammer from '../../common/hammer';
import i18n from './i18n';

import filter_ from 'lodash/filter';
import forEach_ from 'lodash/forEach';
import keys_ from 'lodash/keys';
import map_ from 'lodash/map';

type VisibleAccountsMode = 'favourites' | 'usable' | 'all';

export function filterFlattenTreeByViewContext(
    flattenTree = [],
    usableAccountsSet: Set<string>,
    mode: VisibleAccountsMode,
    favouriteAccountsSet: Set<string>,
    activeAccount?: string,
) {
    const isActive = !activeAccount
        ? () => false
        : (name: string) => {
              return name === activeAccount;
          };
    const isInFavourites = (item: {attributes: {name: string}}) => {
        const {
            attributes: {name},
        } = item;
        return isActive(name) || favouriteAccountsSet.has(name);
    };

    const isInUsable = (item: {attributes: {name: string}}) => {
        const {
            attributes: {name},
        } = item;
        return isActive(name) || usableAccountsSet.has(name);
    };

    if (mode === 'favourites') {
        return filter_(flattenTree, isInFavourites);
    }
    if (mode === 'usable') {
        return filter_(flattenTree, isInUsable);
    }

    return flattenTree;
}

export function sortAccounts(
    accounts: Array<unknown>,
    sortState: unknown,
    activeMediumFilter: unknown,
) {
    return hammer.utils.sort(accounts, sortState, {
        ...columnsItems,
        ...diskSpaceColumnsItems(activeMediumFilter),
    });
}

/**
 * TODO: It looks like the funciont should be removed because of 7a109cddaa0e44fc163be29c903a553621168e4d
 * @param accounts
 */
export function getResponsibleUsers(accounts: Array<{responsibleUsers: Array<string>}>) {
    const responsibleUsersMap: Record<string, boolean> = {};

    forEach_(accounts, (account) => {
        forEach_(account.responsibleUsers, (responsibleUser) => {
            responsibleUsersMap[responsibleUser] = true;
        });
    });

    const responsibleUsers = keys_(responsibleUsersMap);
    responsibleUsers.sort();

    return responsibleUsers;
}

export function makeReadableItems(items: Array<string>) {
    return map_(items, (item) => {
        const text = hammer.format['ReadableField'](item);
        return {
            value: item,
            text,
            content: text,
        };
    });
}

export function getContentModeOptions() {
    const choices = Object.keys(ACCOUNTS_COLUMN_SETS) as Array<keyof typeof ACCOUNTS_COLUMN_SETS>;
    const contentByKey: Record<keyof typeof ACCOUNTS_COLUMN_SETS, string> = {
        get default() {
            return i18n('value_default');
        },
        get disk_space() {
            return i18n('value_disk-space');
        },
        get nodes() {
            return i18n('value_nodes');
        },
        get chunks() {
            return i18n('value_chunks');
        },
        get tablets() {
            return i18n('value_tablets');
        },
        get tablets_memory() {
            return i18n('value_tablets-memory');
        },
        get master_memory() {
            return i18n('value_master-memory');
        },
        get master_memory_detailed() {
            return i18n('value_master-memory-detailed');
        },
    };
    return map_(choices, (value) => ({value, content: contentByKey[value]}));
}

export function genRadioButtonVisibleAccounts(allowAll: boolean) {
    const choices: Array<'usable' | 'favourites' | 'all'> = ['usable', 'favourites'];
    if (allowAll) {
        choices.splice(0, 0, 'all');
    }
    const name = 'accounts-dashboard-visible';
    const contentByValue: Record<'usable' | 'favourites' | 'all', string> = {
        get usable() {
            return i18n('value_usable');
        },
        get favourites() {
            return i18n('value_favourites');
        },
        get all() {
            return i18n('value_all');
        },
    };
    const items = choices.map((value) => ({
        value,
        text: contentByValue[value],
        content: contentByValue[value],
    }));
    return {items, name};
}
