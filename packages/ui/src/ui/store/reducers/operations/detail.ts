import {
    GET_OPERATION,
    LOAD_RESOURCE_USAGE,
    OPERATION_DETAIL_PARTIAL,
} from '../../../constants/operations/detail';
import {LOADING_STATUS} from '../../../constants/index';

import ypath from '../../../common/thor/ypath';

import {
    prepareCompletedUsage,
    prepareIntermediateUsage,
} from '../../../utils/operations/tabs/details/data-flow';
import {prepareSpecification} from '../../../utils/operations/tabs/details/specification/specification';
import {prepareOperationEvents} from '../../../utils/operations/tabs/details/events/events';
import {prepareRuntime} from '../../../utils/operations/tabs/details/runtime';
import {prepareAlerts} from '../../../utils/operations/tabs/details/alerts';
import {prepareError} from '../../../utils/operations/tabs/details/error';
import {OperationAction, prepareActions} from '../../../utils/operations/detail';
import {mergeStateOnClusterChange} from '../utils';

import type {Action} from 'redux';
import type {DetailedOperationSelector} from '../../../pages/operations/selectors';
import type {YTError} from './../../../../@types/types';
import type {ActionD} from './../../../types/index';

export interface OperationDetailState {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData: {message: string; details?: YTError};
    operation: DetailedOperationSelector;
    actions: Array<OperationAction>;
    details: {
        alert_events: {alert_type: string; time: string; error: YTError}[];
    };
    resourcesStatus: (typeof LOADING_STATUS)[keyof typeof LOADING_STATUS];
    resources: unknown;
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
    resources: [],
    monitorChartStates: {},
};

export type OperationDetailActionType =
    | ActionD<typeof GET_OPERATION.REQUEST, {id: string; isAlias: boolean}>
    | ActionD<
          typeof GET_OPERATION.SUCCESS,
          Pick<OperationDetailState, 'operation'> & {userTransactionAlive: boolean}
      >
    | ActionD<typeof GET_OPERATION.FAILURE, OperationDetailState['errorData']>
    | Action<typeof LOAD_RESOURCE_USAGE.REQUEST>
    | ActionD<typeof LOAD_RESOURCE_USAGE.SUCCESS, Pick<OperationDetailState, 'resources'>>
    | Action<typeof LOAD_RESOURCE_USAGE.FAILURE>
    | Action<typeof LOAD_RESOURCE_USAGE.CANCELLED>
    | ActionD<typeof OPERATION_DETAIL_PARTIAL, Pick<OperationDetailState, 'monitorChartStates'>>;

function reducer(state = initialState, action: OperationDetailActionType): OperationDetailState {
    switch (action.type) {
        case GET_OPERATION.REQUEST: {
            const {id, isAlias} = action.data;
            const currentId = ypath.getValue(state.operation);
            const alias = ypath.getValue(state.operation, '/@spec/alias');

            const isSameAlias = isAlias && id === alias;
            const isSameId = !isAlias && id === currentId;

            const stateSource = isSameAlias || isSameId ? state : initialState;

            return {...stateSource, loading: true};
        }
        case GET_OPERATION.SUCCESS: {
            const {operation, userTransactionAlive} = action.data;

            const actions = prepareActions(operation);

            const specification = prepareSpecification(operation, userTransactionAlive);
            const alerts = prepareAlerts(ypath.getValue(operation, '/@alerts'));
            const alert_events = ypath.getValue(operation, '/@alert_events');
            const error = prepareError(operation);
            const runtime = prepareRuntime(operation);
            const events = prepareOperationEvents(operation);
            const resources = prepareCompletedUsage(operation);

            const details = {
                specification,
                alerts,
                alert_events,
                error,
                runtime,
                events,
                resources,
            };

            return {
                ...state,
                operation,
                actions,
                details,
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
            const {resources} = action.data;
            const {operation, details: prevDetails} = state;

            const resourcesStatus = LOADING_STATUS.LOADED;
            const intermediateResources = prepareIntermediateUsage(operation, resources);
            const details = {...prevDetails, intermediateResources};

            return {...state, resources, details, resourcesStatus};
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
