import {produce} from 'immer';

import type {RootState} from '../../../../../store/reducers';
import {initialState} from '../../../../../store/reducers/navigation/tabs/tablet-errors/tablet-errors-background';
import {initialState as initialStateByPath} from '../../../../../store/reducers/navigation/tabs/tablet-errors/tablet-errors-by-path';
import {LocationParameters} from '../../../../../store/location';
import {
    makeTimeRangeSerialization,
    parseSerializeArrayString,
} from '../../../../../utils/parse-serialize';
import {updateByLocationParams} from '../../../../../utils/utils';

export const navigationTabletErrorsParams: LocationParameters = {
    teMode: {
        stateKey: 'navigation.tabs.tabletErrorsBackground.viewMode',
        initialState: initialState.viewMode,
    },
    teTime: {
        stateKey: 'navigation.tabs.tabletErrorsByPath.timeRangeFilter',
        initialState: initialStateByPath.timeRangeFilter,
        options: makeTimeRangeSerialization(initialStateByPath.timeRangeFilter),
    },
    tePage: {
        stateKey: 'navigation.tabs.tabletErrorsByPath.pageFilter',
        initialState: initialStateByPath.pageFilter,
        type: 'number',
    },
    teTabletId: {
        stateKey: 'navigation.tabs.tabletErrorsByPath.tabletIdFilter',
        initialState: initialStateByPath.tabletIdFilter,
    },
    teMethods: {
        stateKey: 'navigation.tabs.tabletErrorsByPath.methodsFilter',
        initialState: initialStateByPath.methodsFilter,
        options: parseSerializeArrayString,
    },
};

export function getNavigationTabletErrorsPreparedState(
    state: RootState,
    {query}: {query: RootState},
) {
    return produce(state, (draft) => {
        return updateByLocationParams({draft, query}, navigationTabletErrorsParams);
    });
}
