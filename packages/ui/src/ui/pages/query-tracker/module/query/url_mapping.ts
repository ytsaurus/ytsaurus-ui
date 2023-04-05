import produce from 'immer';
import {updateIfChanged} from '../../../../utils/utils';
import {LocationParameters} from '../../../../store/location';
import {RootState} from '../../../../store/reducers';

export const draftQueryParameters: LocationParameters = {
    engine: {
        stateKey: 'queryTracker.query.params.engine',
    },
    path: {
        stateKey: 'queryTracker.query.params.path',
    },
    cluster: {
        stateKey: 'queryTracker.query.params.cluster',
    },
};

export function getDraftQueryParameters(state: RootState, props: {query: RootState}): RootState {
    const queryParams = props.query.queryTracker.query.params;
    return produce(state, (draft) => {
        updateIfChanged(draft.queryTracker.query.params, 'engine', queryParams.engine);
        updateIfChanged(draft.queryTracker.query.params, 'path', queryParams.path);
        updateIfChanged(draft.queryTracker.query.params, 'cluster', queryParams.cluster);
    });
}
