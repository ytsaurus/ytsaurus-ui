import {produce} from 'immer';

// tabs
import {
    consumerParams,
    getNavigationConsumerPreparedState,
} from '../../../store/reducers/navigation/tabs/consumer/url-mapping';
import {aclFiltersParams, getAclFiltersPreparedState} from '../acl/url-mapping';
import {
    getNavigationQueuePreparedState,
    queueParams,
} from '../../../store/reducers/navigation/tabs/queue/url-mapping';
import {
    getNavigationSchemaPreparedState,
    schemaParams,
} from '../../../store/reducers/navigation/tabs/schema/url-mapping';
import {
    getNavigationTabletsPreparedState,
    tabletsParams,
} from '../../../store/reducers/navigation/tabs/tablets/url-mapping';

// content
import {
    getNavigationTablePreparedState,
    tableParams,
} from '../../../store/reducers/navigation/content/table/url-mapping';
import {
    getNavigationMapNodePreparedState,
    mapNodeParams,
} from '../../../store/reducers/navigation/content/map-node/url-mapping';
import {
    getNavigationTransactionMapPreparedState,
    transactionMapParams,
} from '../../../store/reducers/navigation/content/transaction-map/url-mapping';

import {initialState} from '../../../store/reducers/navigation/navigation';
import {
    getNavigationAccessLogPreparedState,
    navigationAccessLogParams,
} from './tabs/access-log/url-mapping';
import {Tab} from '../../../constants/navigation';
import {RootState} from '../../../store/reducers';
import {updateIfChanged} from '../../../utils/utils';
import {LocationParameters} from '../../../store/location';
import {
    getNavigationTabletErrorsPreparedState,
    navigationTabletErrorsParams,
} from './tabs/tablet-errors/url-mapping';

import UIFactory from '../../../UIFactory';
import {
    getPrometheusDashbaordPreparedState,
    prometheusDashboardParams,
} from '../../../store/reducers/prometheusDashboard/url-mapping';

export const getNavigationParams = (): LocationParameters => {
    const params: LocationParameters = {
        ...tableParams,
        ...mapNodeParams,
        ...transactionMapParams,

        ...consumerParams,
        ...queueParams,
        ...aclFiltersParams,
        ...schemaParams,
        ...tabletsParams,

        ...navigationAccessLogParams,
        ...navigationTabletErrorsParams,

        ...prometheusDashboardParams,

        navmode: {
            stateKey: 'navigation.navigation.mode',
            initialState: initialState.mode,
            options: {shouldPush: true},
        },
        t: {
            stateKey: 'navigation.navigation.transaction',
            initialState: initialState.transaction,
            options: {shouldPush: true},
        },
        path: {
            stateKey: 'navigation.navigation.path',
            options: {
                shouldPush: true,
            },
        },
    };

    return UIFactory.getNavigationExtraTabs().reduce((acc, extraTab) => {
        if (extraTab.urlMapping) {
            const tabParams = extraTab.urlMapping.params;

            for (const key of Object.keys(tabParams)) {
                if (acc[key]) {
                    throw new Error(`Found duplicating param "${key}" in "${extraTab.value}" tab`);
                }
            }

            return {
                ...acc,
                ...tabParams,
            };
        }
        return acc;
    }, params);
};

const GET_PREPARED_STATE = [
    getNavigationMapNodePreparedState,
    getNavigationTablePreparedState,
    getNavigationTransactionMapPreparedState,
    getNavigationConsumerPreparedState,
    getNavigationQueuePreparedState,
    getAclFiltersPreparedState,
    getNavigationSchemaPreparedState,
    getNavigationTabletsPreparedState,
    getNavigationTabletErrorsPreparedState,
    getPrometheusDashbaordPreparedState,
];

function getNavigationNodeTypesPreparedState(state: RootState, location: {query: RootState}) {
    return GET_PREPARED_STATE.reduce(
        (acc, getPreparedState) => getPreparedState(acc, location),
        state,
    );
}

export function getNavigationPreparedState(state: RootState, location: {query: RootState}) {
    const {query} = location;
    let res = getNavigationNodeTypesPreparedState(state, location);

    UIFactory.getNavigationExtraTabs().forEach((extraTab) => {
        if (extraTab.urlMapping) {
            res = extraTab.urlMapping.getPreparedState(res, location);
        }
    });

    res = produce(res, (draft) => {
        updateIfChanged(draft.navigation.navigation, 'mode', query.navigation.navigation.mode);
        updateIfChanged(
            draft.navigation.navigation,
            'transaction',
            query.navigation.navigation.transaction,
        );
        updateIfChanged(draft.navigation.navigation, 'path', query.navigation.navigation.path);
    });

    if (location.query.navigation.navigation.mode === Tab.ACCESS_LOG) {
        return getNavigationAccessLogPreparedState(res, location);
    }

    return res;
}
