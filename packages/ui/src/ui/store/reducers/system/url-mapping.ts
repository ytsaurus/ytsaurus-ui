import produce from 'immer';

import {updateIfChanged} from '../../../utils/utils';
import {RootState} from '../../../store/reducers';

export const systemParams = {
    nodeType: {
        stateKey: 'settings.data.global::system::nodesNodeType',
        initialState: undefined,
    },
};

export function getSystemPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(
            draft.settings.data,
            'global::system::nodesNodeType',
            query.settings.data['global::system::nodesNodeType'],
        );
    });
}
