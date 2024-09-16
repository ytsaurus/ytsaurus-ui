import {initialState as tabletInitialState} from './tablet';
import {initialState as tableSortState} from '../../../store/reducers/tables';

import {TABLET_PARTITIONS_TABLE_ID} from '../../../constants/tablet';
import {parseSortState} from '../../../utils';
import {produce} from 'immer';
import {updateIfChanged} from '../../../utils/utils';
import {RootState} from '../../../store/reducers';

export const tabletParams = {
    activeHistogram: {
        stateKey: 'tablet.tablet.activeHistogram',
        initialState: tabletInitialState.activeHistogram,
    },
    contentMode: {
        stateKey: 'tablet.tablet.contentMode',
        initialState: tabletInitialState.contentMode,
    },
    sortState: {
        stateKey: `tables.${TABLET_PARTITIONS_TABLE_ID}`,
        initialState: {...tableSortState[TABLET_PARTITIONS_TABLE_ID]},
        options: {parse: parseSortState},
        type: 'object',
    },
};

export function getTabletPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(
            draft.tables,
            TABLET_PARTITIONS_TABLE_ID,
            query.tables[TABLET_PARTITIONS_TABLE_ID],
        );

        updateIfChanged(
            draft.tablet.tablet,
            'activeHistogram',
            query.tablet.tablet.activeHistogram,
        );
        updateIfChanged(draft.tablet.tablet, 'contentMode', query.tablet.tablet.contentMode);
    });
}
