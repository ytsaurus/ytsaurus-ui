import produce from 'immer';
import _ from 'lodash';
import {LocationParameters} from '../../store/location';
import {updateIfChanged} from '../../utils/utils';
import {RootState} from '.';

export const globalParams: LocationParameters = {
    rumdebug: {
        stateKey: 'global.rumDebug',
        initialState: undefined,
    },
    _ym_debug: {
        stateKey: 'global._ym_debug',
        initialState: undefined,
    },
};

export function getGlobalPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(draft.global, 'rumDebug', query.global.rumDebug);
        updateIfChanged(draft.global, '_ym_debug', query.global._ym_debug);
    });
}
