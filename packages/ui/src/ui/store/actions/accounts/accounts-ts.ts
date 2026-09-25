import map_ from 'lodash/map';

import {type ThunkAction} from 'redux-thunk';
import {type RootState} from '../../../store/reducers';
import {ACCOUNTS_DATA_FIELDS_ACTION} from '../../../constants/accounts';
import {type AccountInput, parseAccountData} from '../../../utils/accounts/accounts-selector';

type AccountsThunkAction = ThunkAction<any, RootState, any, any>;

interface AccountListItem {
    $value: string;
    $attributes?: {
        abc?: unknown;
        parent_name?: string;
    };
}

interface SchedulerWithYield {
    yield?: () => Promise<void>;
}

type WindowWithScheduler = Window & {
    scheduler?: SchedulerWithYield;
};

const PARSE_TIME_CHECK_INTERVAL = 100;
const PARSE_CHUNK_TARGET_MS = 40;

function yieldToMainThread() {
    const scheduler = (window as WindowWithScheduler).scheduler;

    return scheduler?.yield?.() ?? new Promise<void>((resolve) => setTimeout(resolve, 0));
}

/**
 * see persistentState from src/ui/store/reducers/accounts/accounts/index.js
 * TODO: Get rid of this interface when the file is Rewritten with typescript
 */
export interface AccountsStateDataFields {
    masterMemoryContentMode?: 'total' | 'detailed' | 'chunk_host' | 'per_cell';
}

export function setAccountsStateDataFields(
    data: Partial<AccountsStateDataFields>,
): AccountsThunkAction {
    return (dispatch) => {
        dispatch({type: ACCOUNTS_DATA_FIELDS_ACTION, data});
    };
}

export async function parseAccountsData(data: Array<AccountInput>) {
    const result = [];
    let chunkStartedAt = performance.now();

    for (let index = 0; index < data.length; ++index) {
        result.push(parseAccountData(data[index]));

        const parsedCount = index + 1;
        if (
            parsedCount < data.length &&
            parsedCount % PARSE_TIME_CHECK_INTERVAL === 0 &&
            performance.now() - chunkStartedAt >= PARSE_CHUNK_TARGET_MS
        ) {
            await yieldToMainThread();
            chunkStartedAt = performance.now();
        }
    }

    return result;
}

export async function parseAccountsListData(data: Array<unknown>) {
    return map_(data, (value) => {
        const item = value as AccountListItem;
        const attributes = item.$attributes || {};
        const name = item.$value;

        return {
            $value: name,
            name,
            $attributes: attributes,
            abc: attributes.abc || {},
            parent: attributes.parent_name,
            responsibleUsers: [],
            hasRecursiveResources: false,
            recursiveResources: {},
            perMedium: {},
            alertsCount: 0,
        };
    });
}
