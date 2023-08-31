import _ from 'lodash';
import produce from 'immer';

import {initialState as proxiesInitialState} from './proxies';
import {initialState as tableSortState} from '../../../../../store/reducers/tables';

import {COMPONENTS_PROXIES_TABLE_ID} from '../../../../../constants/components/proxies/proxies';
import {parseSortState} from '../../../../../utils';
import {updateIfChanged} from '../../../../../utils/utils';
import {RootState} from '../../../../../store/reducers';
import {LocationParameters} from '../../../../../store/location';

const initialHostFilter = proxiesInitialState.hostFilter;
const initialStateFilter = proxiesInitialState.stateFilter;

const initialSortState = {...tableSortState[COMPONENTS_PROXIES_TABLE_ID]};

export const proxiesParams: LocationParameters = {
    host: {
        stateKey: 'components.proxies.proxies.hostFilter',
        initialState: initialHostFilter,
    },
    state: {
        stateKey: 'components.proxies.proxies.stateFilter',
        initialState: initialStateFilter,
    },
    role: {
        stateKey: 'components.proxies.proxies.roleFilter',
        initialState: initialStateFilter,
    },
    banned: {
        stateKey: 'components.proxies.proxies.bannedFilter',
        initialState: proxiesInitialState.bannedFilter,
        type: 'bool',
    },
    proxySort: {
        stateKey: `tables.${COMPONENTS_PROXIES_TABLE_ID}`,
        initialState: initialSortState,
        options: {parse: parseSortState},
        type: 'object',
    },
};

export function getProxiesPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(
            draft.tables,
            COMPONENTS_PROXIES_TABLE_ID,
            query.tables[COMPONENTS_PROXIES_TABLE_ID],
        );

        const draftProxies = draft.components.proxies.proxies;
        const queryProxies = query.components.proxies.proxies;

        updateIfChanged(draftProxies, 'hostFilter', queryProxies.hostFilter);
        updateIfChanged(draftProxies, 'stateFilter', queryProxies.stateFilter);
        updateIfChanged(draftProxies, 'roleFilter', queryProxies.roleFilter);
        updateIfChanged(draftProxies, 'bannedFilter', queryProxies.bannedFilter);
    });
}
