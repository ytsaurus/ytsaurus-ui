import {produce} from 'immer';
import {RootState} from '..';
import {updateIfChanged} from '../../../utils/utils';
import {LocationParameters} from '../../../store/location';

import {initialState as filtersInitialState} from './filters';

export const mapNodeFlowParams: LocationParameters = {
    flowMode: {
        stateKey: 'flow.filters.flowViewMode',
        initialState: filtersInitialState.flowViewMode,
    },
};

export function getNavigationMapNodeFlowPreparedState(
    state: RootState,
    {query}: {query: RootState},
) {
    return produce(state, (draft: RootState) => {
        updateIfChanged(draft.flow.filters, 'flowViewMode', query.flow.filters.flowViewMode);
    });
}
