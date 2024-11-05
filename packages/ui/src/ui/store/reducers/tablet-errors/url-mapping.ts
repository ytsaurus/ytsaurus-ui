import {produce} from 'immer';

import type {RootState} from '../../../store/reducers';
import {initialState} from './tablet-errors-by-bundle';
import {LocationParameters} from '../../../store/location';
import {
    makeTimeRangeSerialization,
    parseSerializeArrayString,
} from '../../../utils/parse-serialize';
import {updateByLocationParams} from '../../../utils/utils';

export const tabletErrorsByBundleParams: LocationParameters = {
    teTime: {
        stateKey: 'tabletErrors.tabletErrorsByBundle.timeRangeFilter',
        initialState: initialState.timeRangeFilter,
        options: makeTimeRangeSerialization(initialState.timeRangeFilter),
    },
    tePage: {
        stateKey: 'tabletErrors.tabletErrorsByBundle.pageFilter',
        initialState: initialState.pageFilter,
        type: 'number',
    },
    teMethods: {
        stateKey: 'tabletErrors.tabletErrorsByBundle.methodsFilter',
        initialState: initialState.methodsFilter,
        options: parseSerializeArrayString,
    },
};

export function getTabletErrorsByBundlereparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        return updateByLocationParams({draft, query}, tabletErrorsByBundleParams);
    });
}
