import {ActionD, YTError} from '../../../types';
import {Action} from 'redux';
import {
    SUPPORTED_FEATURES_FAILURE,
    SUPPORTED_FEATURES_REQUEST,
    SUPPORTED_FEATURES_SUCCESS,
} from '../../../constants/global';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import type {StatisticInfo} from '../../../components/StatisticTable';

export interface SupportedFeaturesState {
    loaded: boolean;
    loading: boolean;
    error: YTError | undefined;

    featuresCluster: string;
    features: {
        compression_codecs?: Array<string>;
        erasure_codecs?: Array<string>;
        primitive_types?: Array<string>;
        operation_statistics_descriptions?: Record<string, OperationStatisticInfo>;
        require_password_in_authentication_commands?: boolean;
        query_memory_limit_in_tablet_nodes?: boolean;
    };

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
