import {
    ACCOUNTS_COLUMN_SETS,
    columnsItems,
    diskSpaceColumnsItems,
} from '../../utils/accounts/tables';
import hammer from '../../common/hammer';

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

function genRadioButtonProps(choicesStrs: Array<string>, options = {}) {
    const items = makeReadableItems(choicesStrs);
    return {
        items,
        ...options,
    };
}

function getContentModeOptions() {
    const choices = Object.keys(ACCOUNTS_COLUMN_SETS);
    return map_(choices, (value) => {
        return {value, content: hammer.format.ReadableField(value)};
    });
}
export const ACCOUNTS_CONTENT_MODE_ITEMS = getContentModeOptions();

export function genRadioButtonVisibleAccounts(allowAll: boolean) {
    const choices = ['usable', 'favourites'];
    if (allowAll) {
        choices.splice(0, 0, 'all');
    }
    const name = 'accounts-dashboard-visible';
    return genRadioButtonProps(choices, {name});
}
