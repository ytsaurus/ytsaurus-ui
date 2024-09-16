import {initialState as clustersMenuInitialState} from './clusters-menu';
import {initialState as tableSortState} from '../tables';

import {CLUSTER_MENU_TABLE_ID} from '../../../constants/tables';
import {parseSortState} from '../../../utils';
import {RootState} from '..';
import {updateIfChanged} from '../../../utils/utils';
import {produce} from 'immer';
import {LocationParameters} from '../../../store/location';

const initialMode = clustersMenuInitialState.viewMode;
const initialFilter = clustersMenuInitialState.clusterFilter;
const initialSort = {...tableSortState[CLUSTER_MENU_TABLE_ID]};

export const clustersMenuParams: LocationParameters = {
    mode: {
        stateKey: 'clustersMenu.viewMode',
        initialState: initialMode,
    },
    filter: {
        stateKey: 'clustersMenu.clusterFilter',
        initialState: initialFilter,
    },
    sort: {
        stateKey: `tables.${CLUSTER_MENU_TABLE_ID}`,
        options: {parse: parseSortState},
        initialState: initialSort,
        type: 'object',
    },
};

export function getClustersMenuPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(draft.clustersMenu, 'viewMode', query.clustersMenu.viewMode);
        updateIfChanged(draft.clustersMenu, 'clusterFilter', query.clustersMenu.clusterFilter);
        updateIfChanged(draft.tables, CLUSTER_MENU_TABLE_ID, query.tables[CLUSTER_MENU_TABLE_ID]);
    });
}
