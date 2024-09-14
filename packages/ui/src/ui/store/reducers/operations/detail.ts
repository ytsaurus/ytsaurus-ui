import {
    GET_OPERATION,
    LOAD_RESOURCE_USAGE,
    OPERATION_DETAIL_PARTIAL,
} from '../../../constants/operations/detail';
import {LOADING_STATUS} from '../../../constants/index';

import {mergeStateOnClusterChange} from '../utils';

import type {OperationAction} from '../../../utils/operations/detail';
import type {Action} from 'redux';
import type {DetailedOperationSelector} from '../../../pages/operations/selectors';
import type {YTError} from './../../../../@types/types';
import type {ActionD} from './../../../types/index';

export interface AlertEvent {
    time: unknown;
    alert_type: unknown;
    error: unknown;
}

export interface OperationDetailState {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData: {message: string; details?: YTError};
    operation: DetailedOperationSelector;
    actions: Array<OperationAction>;
    details: {
        alert_events: Array<AlertEvent>;
    };
    resourcesStatus: (typeof LOADING_STATUS)[keyof typeof LOADING_STATUS];
    resources: {intermediateResources?: unknown};
    monitorChartStates: Record<string, boolean>;
}

const initialState: OperationDetailState = {
    loading: true,
    loaded: false,
    error: false,
    errorData: {message: ''},
    operation: {$value: undefined} as unknown as DetailedOperationSelector,
    actions: [],
    details: {alert_events: []},
    resourcesStatus: LOADING_STATUS.UNINITIALIZED,
    resources: {},
    monitorChartStates: {},
};

export type OperationDetailActionType =
    | ActionD<typeof GET_OPERATION.REQUEST, {id: string; isAlias: boolean}>
    | ActionD<
          typeof GET_OPERATION.SUCCESS,
          Pick<OperationDetailState, 'operation' | 'actions' | 'details'>
      >
    | ActionD<typeof GET_OPERATION.FAILURE, OperationDetailState['errorData']>
    | Action<typeof LOAD_RESOURCE_USAGE.REQUEST>
    | ActionD<
          typeof LOAD_RESOURCE_USAGE.SUCCESS,
          Pick<OperationDetailState, 'resources'> &
              Pick<OperationDetailState['resources'], 'intermediateResources'>
      >
    | Action<typeof LOAD_RESOURCE_USAGE.FAILURE>
    | Action<typeof LOAD_RESOURCE_USAGE.CANCELLED>
    | ActionD<typeof OPERATION_DETAIL_PARTIAL, Pick<OperationDetailState, 'monitorChartStates'>>;

function reducer(state = initialState, action: OperationDetailActionType): OperationDetailState {
    switch (action.type) {
        case GET_OPERATION.REQUEST: {
            const {id, isAlias} = action.data;
            const currentId = state.operation.id;
            const alias = state.operation.alias;

            const isSameAlias = isAlias && id === alias;
            const isSameId = !isAlias && id === currentId;

            const stateSource = isSameAlias || isSameId ? state : initialState;

            return {...stateSource, loading: true};
        }
        case GET_OPERATION.SUCCESS: {
            return {
                ...state,
                ...action.data,
                loading: false,
                loaded: true,
                error: false,
            };
        }

        case GET_OPERATION.FAILURE:
            return {...state, loading: false, error: true, errorData: action.data};

        case LOAD_RESOURCE_USAGE.REQUEST:
            return {...state, resourcesStatus: LOADING_STATUS.LOADING};

        case LOAD_RESOURCE_USAGE.SUCCESS: {
            const {resources, intermediateResources} = action.data;
            const {details: prevDetails} = state;
            const details = {...prevDetails, intermediateResources};
            return {...state, resources, details, resourcesStatus: LOADING_STATUS.LOADED};
        }

        case LOAD_RESOURCE_USAGE.FAILURE:
            return {...state, resourcesStatus: LOADING_STATUS.ERROR};

        case LOAD_RESOURCE_USAGE.CANCELLED:
            return {...state, resourcesStatus: LOADING_STATUS.CANCELLED};

        case OPERATION_DETAIL_PARTIAL:
            return {...state, ...action.data};

        default:
            return state;
    }
}

export default mergeStateOnClusterChange(initialState, {}, reducer);
