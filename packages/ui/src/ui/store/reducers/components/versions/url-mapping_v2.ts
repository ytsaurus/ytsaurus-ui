import {produce} from 'immer';

import {initialState as versionsInitialState} from './versions_v2';
import {initialState as tableSortState} from '../../../../store/reducers/tables';

import {COMPONENTS_VERSIONS_DETAILED_TABLE_ID} from '../../../../constants/components/versions/versions_v2';
import {parseSortState} from '../../../../utils';
import {RootState} from '../../../../store/reducers';
import {updateIfChanged} from '../../../../utils/utils';
import {LocationParameters} from '../../../../store/location';

const initialHost = versionsInitialState.hostFilter;
const initialVersion = versionsInitialState.versionFilter;
const initialType = versionsInitialState.typeFilter;
const initialState = versionsInitialState.stateFilter;

const initialDetailsSortState = {
    ...tableSortState[COMPONENTS_VERSIONS_DETAILED_TABLE_ID],
};

export const versionsV2Params: LocationParameters = {
    host: {
        stateKey: 'components.versionsV2.hostFilter',
        initialState: initialHost,
    },
    version: {
        stateKey: 'components.versionsV2.versionFilter',
        options: {parse: (version: string) => decodeURIComponent(version)},
        initialState: initialVersion,
    },
    type: {
        stateKey: 'components.versionsV2.typeFilter',
        options: {parse: (type: string) => decodeURIComponent(type)},
        initialState: initialType,
    },
    state: {
        stateKey: 'components.versionsV2.stateFilter',
        options: {parse: (type: string) => decodeURIComponent(type)},
        initialState: initialState,
    },
    summarySort: {
        stateKey: 'components.versionsV2.summarySortState',
        initialState: versionsInitialState.summarySortState,
        type: 'object',
        options: {
            parse: parseSortState,
        },
    },
    detailsSort: {
        stateKey: `tables.${COMPONENTS_VERSIONS_DETAILED_TABLE_ID}`,
        initialState: initialDetailsSortState,
        options: {parse: parseSortState},
        type: 'object',
    },
};

export function getVersionsV2PreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(
            draft.tables,
            COMPONENTS_VERSIONS_DETAILED_TABLE_ID,
            query.tables[COMPONENTS_VERSIONS_DETAILED_TABLE_ID],
        );

        const draftVersions = draft.components.versionsV2;
        const queryVersions = query.components.versionsV2;

        updateIfChanged(draftVersions, 'hostFilter', queryVersions.hostFilter);
        updateIfChanged(draftVersions, 'versionFilter', queryVersions.versionFilter);
        updateIfChanged(draftVersions, 'typeFilter', queryVersions.typeFilter);
        updateIfChanged(draftVersions, 'stateFilter', queryVersions.stateFilter);
        updateIfChanged(draftVersions, 'summarySortState', queryVersions.summarySortState);
    });
}
