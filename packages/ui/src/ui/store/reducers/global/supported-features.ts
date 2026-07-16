import {type ActionD, type YTError} from '../../../types';
import {type Action} from 'redux';
import {
    SUPPORTED_FEATURES_FAILURE,
    SUPPORTED_FEATURES_REQUEST,
    SUPPORTED_FEATURES_SUCCESS,
} from '../../../constants/global';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {type StatisticInfo} from '../../../components/StatisticTable';
import {type SupportedFeatures} from '../../../../shared/yt-types';

export interface SupportedFeaturesState {
    loaded: boolean;
    loading: boolean;
    error: YTError | undefined;

    featuresCluster: string;
    features: SupportedFeatures;

    flow_pipelines?: {
        pipeline_list_enabled: boolean;
    };
}

export type OperationStatisticInfo = StatisticInfo;

const initialState: SupportedFeaturesState = {
    loaded: false,
    loading: false,
    error: undefined,

    featuresCluster: '',
    features: {},
};

function reducer(state = initialState, action: SupportedFeaturesAction) {
    switch (action.type) {
        case SUPPORTED_FEATURES_REQUEST:
            return {...state, loading: true};
        case SUPPORTED_FEATURES_SUCCESS:
            return {...state, ...action.data, loading: false, loaded: true};
        case SUPPORTED_FEATURES_FAILURE:
            return {...state, ...action.data, loading: false, loaded: false};
    }
    return state;
}

export type SupportedFeaturesAction =
    | Action<typeof SUPPORTED_FEATURES_REQUEST>
    | ActionD<
          typeof SUPPORTED_FEATURES_SUCCESS,
          Pick<SupportedFeaturesState, 'features' | 'featuresCluster'>
      >
    | ActionD<typeof SUPPORTED_FEATURES_FAILURE, Pick<SupportedFeaturesState, 'error'>>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
