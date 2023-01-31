import {ThunkAction} from 'redux-thunk';

import {RootState} from '../../../store/reducers';
import {
    SupportedFeaturesAction,
    SupportedFeaturesState,
} from '../../../store/reducers/global/supported-features';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {ytApiV3} from '../../../rum/rum-wrap-api';
import {
    SUPPORTED_FEATURES_FAILURE,
    SUPPORTED_FEATURES_REQUEST,
    SUPPORTED_FEATURES_SUCCESS,
} from '../../../constants/global';
import {getCluster} from '../../../store/selectors/global';

type SupportedFeaturesThunkAction = ThunkAction<any, RootState, any, SupportedFeaturesAction>;

const cancelHelper = new CancelHelper();

export function fetchSupportedFeatures(): SupportedFeaturesThunkAction {
    return (dispatch, getState) => {
        const featuresCluster = getCluster(getState());
        if (!featuresCluster) {
            return undefined;
        }

        dispatch({type: SUPPORTED_FEATURES_REQUEST});
        return ytApiV3
            .getSupportedFeatures({}, cancelHelper.removeAllAndSave)
            .then(({features}: Pick<SupportedFeaturesState, 'features'>) => {
                dispatch({
                    type: SUPPORTED_FEATURES_SUCCESS,
                    data: {featuresCluster, features},
                });
            })
            .catch((error) => {
                if (!isCancelled(error)) {
                    dispatch({
                        type: SUPPORTED_FEATURES_FAILURE,
                        data: {error},
                    });
                }
            });
    };
}
