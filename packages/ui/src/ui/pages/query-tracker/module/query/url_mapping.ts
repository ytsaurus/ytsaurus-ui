import produce from 'immer';
import {updateIfChanged} from '../../../../utils/utils';
import {LocationParameters} from '../../../../store/location';
import {RootState} from '../../../../store/reducers';

export const draftQueryParameters: LocationParameters = {
    engine: {
        stateKey: 'queryTracker.query.params.engine',
    },
    query: {
        stateKey: 'queryTracker.query.params.query',
    },
};

export function getDraftQueryParameters(state: RootState, props: {query: RootState}): RootState {
    const queryParams = props.query.queryTracker.query.params;
    return produce(state, (draft) => {
        updateIfChanged(draft.queryTracker.query.params, 'engine', queryParams.engine);
        updateIfChanged(draft.queryTracker.query.params, 'query', queryParams.query);
    });
}
