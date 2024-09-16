import {initialState} from './index';
import {RootState} from '../../../store/reducers';
import {produce} from 'immer';
import {updateIfChanged} from '../../../utils/utils';
import {LocationParameters} from '../../../store/location';
import {parseSortState} from '../../../utils/index';

export const chaosBundlesParams: LocationParameters = {
    activeBundle: {
        stateKey: 'chaos_cell_bundles.activeBundle',
        initialState: initialState.activeBundle,
    },
};

export function getChaosBundlesPreparedState(
    state: RootState,
    {query}: {query: RootState},
): RootState {
    const queryTcb = query.chaos_cell_bundles;
    return produce(state, (draft) => {
        const draftTcb = draft.chaos_cell_bundles;

        updateIfChanged(draftTcb, 'activeBundle', queryTcb.activeBundle);
        updateIfChanged(draftTcb, 'bundlesNameFilter', queryTcb.bundlesNameFilter);
        updateIfChanged(draftTcb, 'bundlesAccountFilter', queryTcb.bundlesAccountFilter);
        updateIfChanged(draftTcb, 'bundlesTagNodeFilter', queryTcb.bundlesTagNodeFilter);
        updateIfChanged(draftTcb, 'bundlesSort', queryTcb.bundlesSort);
        updateIfChanged(draftTcb, 'bundlesTableMode', queryTcb.bundlesTableMode);
    });
}

export const chaosAllBundlesParams: LocationParameters = {
    ...chaosBundlesParams,
    name: {
        stateKey: 'chaos_cell_bundles.bundlesNameFilter',
        initialState: initialState.bundlesNameFilter,
    },
    account: {
        stateKey: 'chaos_cell_bundles.bundlesAccountFilter',
        initialState: initialState.bundlesAccountFilter,
    },
    tag: {
        stateKey: 'chaos_cell_bundles.bundlesTagNodeFilter',
        initialState: initialState.bundlesTagNodeFilter,
    },
    sortBy: {
        stateKey: 'chaos_cell_bundles.bundlesSort',
        initialState: initialState.bundlesSort,
        type: 'object',
        options: {
            parse: parseSortState,
        },
    },
    mode: {
        stateKey: 'chaos_cell_bundles.bundlesTableMode',
        initialState: initialState.bundlesTableMode,
    },
};

export const chaosCellsParams = {
    ...chaosBundlesParams,

    id: {
        stateKey: 'chaos_cell_bundles.cellsIdFilter',
        initialState: initialState.cellsIdFilter,
    },
    name: {
        stateKey: 'chaos_cell_bundles.cellsBundleFilter',
        initialState: initialState.cellsBundleFilter,
    },
    host: {
        stateKey: 'chaos_cell_bundles.cellsHostFilter',
        initialState: initialState.cellsHostFilter,
    },
    sortBy: {
        stateKey: 'chaos_cell_bundles.cellsSort',
        initialState: initialState.cellsSort,
        type: 'object',
        options: {
            parse: parseSortState,
        },
    },
};

export function getChaosCellsPreparedState(
    state: RootState,
    {query}: {query: RootState},
): RootState {
    const queryTcb = query.chaos_cell_bundles;
    return produce(state, (draft) => {
        const draftTcb = draft.chaos_cell_bundles;

        updateIfChanged(draftTcb, 'activeBundle', queryTcb.activeBundle);
        updateIfChanged(draftTcb, 'cellsIdFilter', queryTcb.cellsIdFilter);
        updateIfChanged(draftTcb, 'cellsBundleFilter', queryTcb.cellsBundleFilter);
        updateIfChanged(draftTcb, 'cellsHostFilter', queryTcb.cellsHostFilter);
        updateIfChanged(draftTcb, 'cellsSort', queryTcb.cellsSort);
    });
}
