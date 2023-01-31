import {produce} from 'immer';

import {initialState as mapNodeInitialState} from '../../../../../store/reducers/navigation/content/map-node/map-node';
import {NAVIGATION_MAP_NODE_TABLE_ID} from '../../../../../constants/navigation';
import {initialState as tableSortState} from '../../../../../store/reducers/tables';
import {parseSortState} from '../../../../../utils';
import {RootState} from '../../../../../store/reducers';
import {updateIfChanged} from '../../../../../utils/utils';

export const mapNodeParams = {
    contentMode: {
        stateKey: 'navigation.content.mapNode.contentMode',
        initialState: mapNodeInitialState.contentMode,
    },
    filter: {
        stateKey: 'navigation.content.mapNode.filter',
        initialState: mapNodeInitialState.filter,
    },
    medium: {
        stateKey: 'navigation.content.mapNode.mediumType',
        initialState: mapNodeInitialState.mediumType,
    },
    sort: {
        stateKey: `tables.${NAVIGATION_MAP_NODE_TABLE_ID}`,
        initialState: {...tableSortState[NAVIGATION_MAP_NODE_TABLE_ID]},
        options: {parse: parseSortState},
        type: 'object',
    },
};

export function getNavigationMapNodePreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        const draftMapNode = draft.navigation.content.mapNode;
        const queryMapNode = query.navigation.content.mapNode;

        updateIfChanged(draftMapNode, 'contentMode', queryMapNode.contentMode);
        updateIfChanged(draftMapNode, 'filter', queryMapNode.filter);
        updateIfChanged(draftMapNode, 'mediumType', queryMapNode.mediumType);

        updateIfChanged(
            draft.tables,
            NAVIGATION_MAP_NODE_TABLE_ID,
            query.tables[NAVIGATION_MAP_NODE_TABLE_ID],
        );
    });
}
