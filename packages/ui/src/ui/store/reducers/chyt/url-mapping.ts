import isEqual_ from 'lodash/isEqual';

import {initialState} from './list-filters';
import {RootState} from '../../../store/reducers';
import {produce} from 'immer';
import {updateIfChanged} from '../../../utils/utils';
import {LocationParameters} from '../../../store/location';
import {parseSortStateArray, serializeSortStateArray} from '../../../utils/url-mapping';

export const chytListParams: LocationParameters = {
    name: {
        stateKey: 'chyt.listFilters.name',
        initialState: initialState.name,
    },
    creator: {
        stateKey: 'chyt.listFilters.creator',
        initialState: initialState.creator,
    },
    state: {
        stateKey: 'chyt.listFilters.state',
        initialState: initialState.state,
    },
    sort: {
        stateKey: 'chyt.listFilters.sortState',
        initialState: initialState.sortState,
        options: {
            parse: parseSortStateArray,
            serialize: serializeSortStateArray,
        },
    },
};

export function getGhytListPreparedState(state: RootState, {query}: {query: RootState}): RootState {
    const queryData = query.chyt.listFilters;
    return produce(state, (draftState) => {
        const draft = draftState.chyt.listFilters;

        updateIfChanged(draft, 'name', queryData.name);
        updateIfChanged(draft, 'creator', queryData.creator);
        updateIfChanged(draft, 'state', queryData.state);
        updateIfChanged(draft, 'sortState', queryData.sortState, isEqual_);
    });
}
