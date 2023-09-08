import {ActionD, YTError} from '@ytsaurus/ui/build/esm/ui/types';
import {AxiosError, Canceler} from 'axios';
import {
    ODIN_OVERVIEW_CANCELLED,
    ODIN_OVERVIEW_FAILED,
    ODIN_OVERVIEW_HIDDEN_METRICS,
    ODIN_OVERVIEW_PARTIAL,
    ODIN_OVERVIEW_REQUEST,
    ODIN_OVERVIEW_SUCCESS,
} from '../odin-constants';
import {Action} from 'redux';
import {mergeStateOnClusterChange} from '@ytsaurus/ui/build/esm/ui/store/reducers/utils';
import {MetricData, MetricListItem} from '../odin-utils';

export interface OdinOverviewState {
    error: YTError | AxiosError | null;
    loaded: boolean;
    loading: boolean;

    dataCluster: string;
    clusterMetrics: Array<MetricListItem>;
    data: {[metricName: string]: OdinOverviewStateDataItem};
    dateFrom: Date | null;
    dateTo: Date | null;

    hiddenMetrics: {[metricName: string]: boolean};
    showCreatePresetDialog: boolean;
    useDefaultPreset: boolean;

    presetToRemove: string | undefined;
}

export interface OdinOverviewStateDataItem {
    cancel?: Canceler;
    metricData?: Array<MetricData>;
    error?: any;
}

const initialState: OdinOverviewState = {
    error: null,
    loaded: false,
    loading: false,

    dataCluster: '', // the field is required to skip responces from another clusters
    clusterMetrics: [],
    data: {},
    dateFrom: null,
    dateTo: null,

    hiddenMetrics: {},
    showCreatePresetDialog: false,
    useDefaultPreset: true,

    presetToRemove: undefined,
};

function reducer(
    state: OdinOverviewState = initialState,
    action: OdinOverviewAction,
): OdinOverviewState {
    switch (action.type) {
        case ODIN_OVERVIEW_REQUEST:
            return {...state, loading: true};
        case ODIN_OVERVIEW_SUCCESS:
            return {
                ...state,
                ...action.data,
                loaded: true,
                loading: false,
                error: null,
            };
        case ODIN_OVERVIEW_PARTIAL:
            return {...state, ...action.data};
        case ODIN_OVERVIEW_FAILED:
            return {
                ...state,
                error: action.data,
                loaded: false,
                loading: false,
            };
        case ODIN_OVERVIEW_CANCELLED:
            return {...state, loading: false, loaded: false};
        case ODIN_OVERVIEW_HIDDEN_METRICS:
            return {
                ...state,
                hiddenMetrics: action.data.hiddenMetrics,
                useDefaultPreset: false,
            };
        default:
            return state;
    }
}

export type OdinOverviewAction =
    | Action<typeof ODIN_OVERVIEW_REQUEST>
    | ActionD<
          typeof ODIN_OVERVIEW_SUCCESS,
          Pick<OdinOverviewState, 'clusterMetrics' | 'dateFrom' | 'dateTo'>
      >
    | ActionD<
          typeof ODIN_OVERVIEW_PARTIAL,
          Partial<
              Omit<
                  OdinOverviewState,
                  'error' | 'loaded' | 'loading' | 'hiddenMetrics' | 'useDefaultPreset'
              >
          >
      >
    | ActionD<typeof ODIN_OVERVIEW_FAILED, OdinOverviewState['error']>
    | Action<typeof ODIN_OVERVIEW_CANCELLED>
    | ActionD<typeof ODIN_OVERVIEW_HIDDEN_METRICS, Pick<OdinOverviewState, 'hiddenMetrics'>>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
