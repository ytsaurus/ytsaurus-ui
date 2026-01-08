import {initialState} from './index';
import {RootState} from '../../../store/reducers';
import {produce} from 'immer';
import {updateIfChanged} from '../../../utils/utils';
import {aclFiltersParams, getAclFiltersPreparedState} from '../acl/url-mapping';
import {parseSortState} from '../../../utils';
import {
    getTabletErrorsByBundlereparedState,
    tabletErrorsByBundleParams,
} from '../tablet-errors/url-mapping';
import {prometheusDashboardParams} from '../../../store/reducers/prometheusDashboard/url-mapping';

export const tabletsBundlesParams = {
    activeBundle: {
        stateKey: 'tablet_cell_bundles.activeBundle',
        initialState: initialState.activeBundle,
    },
    ...tabletErrorsByBundleParams,
};

export function getTabletsBundlesPreparedState(
    state: RootState,
    {query}: {query: RootState},
): RootState {
    const queryTcb = query.tablet_cell_bundles;
    const res = produce(state, (draft) => {
        const draftTcb = draft.tablet_cell_bundles;

        updateIfChanged(draftTcb, 'activeBundle', queryTcb.activeBundle);
        updateIfChanged(draftTcb, 'bundlesNameFilter', queryTcb.bundlesNameFilter);
        updateIfChanged(draftTcb, 'bundlesAccountFilter', queryTcb.bundlesAccountFilter);
        updateIfChanged(draftTcb, 'bundlesTagNodeFilter', queryTcb.bundlesTagNodeFilter);
        updateIfChanged(draftTcb, 'bundlesSort', queryTcb.bundlesSort);
        updateIfChanged(draftTcb, 'bundlesTableMode', queryTcb.bundlesTableMode);
    });
    return getTabletErrorsByBundlereparedState(res, {query});
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
        options: {
            parse: parseSortState,
        },
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
        options: {
            parse: parseSortState,
        },
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

export const tabletsBundlesAclParams = {
    ...tabletsBundlesParams,
    ...aclFiltersParams,
};

export function getTabletsBundlesAclPreparedState(
    prevState: RootState,
    {query}: {query: RootState},
): RootState {
    const state = getAclFiltersPreparedState(prevState, {query});
    return produce(state, (draft) => {
        const queryTcb = query.tablet_cell_bundles;
        const draftTcb = draft.tablet_cell_bundles;
        updateIfChanged(draftTcb, 'activeBundle', queryTcb.activeBundle);
    });
}

export const bundlesPrometheusParams = {
    ...tabletsBundlesParams,
    ...prometheusDashboardParams,
};
