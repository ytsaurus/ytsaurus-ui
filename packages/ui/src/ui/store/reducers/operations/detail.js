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
import {prepareActions} from '../../../utils/operations/details-ts';
import {mergeStateOnClusterChange} from '../utils';

const initialState = {
    loading: true,
    loaded: false,
    error: false,
    errorData: {
        message: '',
        details: null,
    },
    /** @type {import('../../../pages/operations/selectors').DetailedOperationSelector} */
    operation: {
        $value: undefined,
    },
    /** @type {ReturnType<typeof prepareActions>} */
    actions: [],
    details: {
        /** @type {Array<{alert_type: string, time: string, error: YTError}>} */
        alert_events: [], // Array<{alert_type: string, time: string, error: YTError}>
    },

    resourcesStatus: LOADING_STATUS.UNINITIALIZED,
    resources: {},

    monitorChartStates: {}, // {[name: string]: boolean}, whether a chart is finished to render
};

function reducer(state = initialState, action) {
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
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data,
            };

        case GET_OPERATION.CANCELLED: {
            const error = action.data;
            const operationStatus = LOADING_STATUS.CANCELLED;

            return {...state, operationStatus, error};
        }

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
