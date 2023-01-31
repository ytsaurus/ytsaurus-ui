import _ from 'lodash';

import {initialState} from './index';
import {RootState} from '../../../store/reducers';
import produce from 'immer';
import {updateIfChanged} from '../../../utils/utils';

export const tabletsBundlesParams = {
    activeBundle: {
        stateKey: 'tablet_cell_bundles.activeBundle',
        initialState: initialState.activeBundle,
    },
};

export function getTabletsBundlesPreparedState(
    state: RootState,
    {query}: {query: RootState},
): RootState {
    const queryTcb = query.tablet_cell_bundles;
    return produce(state, (draft) => {
        const draftTcb = draft.tablet_cell_bundles;

        updateIfChanged(draftTcb, 'activeBundle', queryTcb.activeBundle);
        updateIfChanged(draftTcb, 'bundlesNameFilter', queryTcb.bundlesNameFilter);
        updateIfChanged(draftTcb, 'bundlesAccountFilter', queryTcb.bundlesAccountFilter);
        updateIfChanged(draftTcb, 'bundlesTagNodeFilter', queryTcb.bundlesTagNodeFilter);
        updateIfChanged(draftTcb, 'bundlesSort', queryTcb.bundlesSort);
        updateIfChanged(draftTcb, 'bundlesTableMode', queryTcb.bundlesTableMode);
    });
}

export const tabletsAllBundlesParams = {
    ...tabletsBundlesParams,
    name: {
        stateKey: 'tablet_cell_bundles.bundlesNameFilter',
        initialState: initialState.bundlesNameFilter,
    },
    account: {
        stateKey: 'tablet_cell_bundles.bundlesAccountFilter',
        initialState: initialState.bundlesAccountFilter,
    },
    tag: {
        stateKey: 'tablet_cell_bundles.bundlesTagNodeFilter',
        initialState: initialState.bundlesTagNodeFilter,
    },
    sortBy: {
        stateKey: 'tablet_cell_bundles.bundlesSort',
        initialState: initialState.bundlesSort,
        type: 'object',
    },
    mode: {
        stateKey: 'tablet_cell_bundles.bundlesTableMode',
        initialState: initialState.bundlesTableMode,
    },
};

export const tabletsTabletCellsParams = {
    ...tabletsBundlesParams,

    id: {
        stateKey: 'tablet_cell_bundles.cellsIdFilter',
        initialState: initialState.cellsIdFilter,
    },
    name: {
        stateKey: 'tablet_cell_bundles.cellsBundleFilter',
        initialState: initialState.cellsBundleFilter,
    },
    host: {
        stateKey: 'tablet_cell_bundles.cellsHostFilter',
        initialState: initialState.cellsHostFilter,
    },
    sortBy: {
        stateKey: 'tablet_cell_bundles.cellsSort',
        initialState: initialState.cellsSort,
        type: 'object',
    },
};

export function getTabletsCellsPreparedState(
    state: RootState,
    {query}: {query: RootState},
): RootState {
    const queryTcb = query.tablet_cell_bundles;
    return produce(state, (draft) => {
        const draftTcb = draft.tablet_cell_bundles;

        updateIfChanged(draftTcb, 'activeBundle', queryTcb.activeBundle);
        updateIfChanged(draftTcb, 'cellsIdFilter', queryTcb.cellsIdFilter);
        updateIfChanged(draftTcb, 'cellsBundleFilter', queryTcb.cellsBundleFilter);
        updateIfChanged(draftTcb, 'cellsHostFilter', queryTcb.cellsHostFilter);
        updateIfChanged(draftTcb, 'cellsSort', queryTcb.cellsSort);
    });
}
