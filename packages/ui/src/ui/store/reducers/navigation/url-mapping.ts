import produce from 'immer';

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

export const navigationParams: LocationParameters = {
    ...tableParams,
    ...mapNodeParams,
    ...transactionMapParams,

    ...consumerParams,
    ...queueParams,
    ...aclFiltersParams,
    ...schemaParams,
    ...tabletsParams,

    ...navigationAccessLogParams,

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

function getNavigationNodeTypesPreparedState(state: RootState, location: {query: RootState}) {
    let res = getNavigationMapNodePreparedState(state, location);
    res = getNavigationTablePreparedState(res, location);
    res = getNavigationTransactionMapPreparedState(res, location);
    res = getNavigationConsumerPreparedState(res, location);
    res = getNavigationQueuePreparedState(res, location);
    res = getAclFiltersPreparedState(res, location);
    res = getNavigationSchemaPreparedState(res, location);
    res = getNavigationTabletsPreparedState(res, location);
    return res;
}

export function getNavigationPreparedState(state: RootState, location: {query: RootState}) {
    const {query} = location;
    let res = getNavigationNodeTypesPreparedState(state, location);

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
