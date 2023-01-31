import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import {
    OPEN_RESOURCES_MODAL,
    CLOSE_RESOURCES_MODAL,
    SET_RESOURCES_LIMIT,
} from '../../../../../constants/components/nodes/actions/set-resources-limits';

const initialState = {
    host: '',
    resourcesLimit: {},
    resourcesLimitOverrides: {},
    visible: false,
    loading: false,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case OPEN_RESOURCES_MODAL: {
            const {host, resourcesLimit, resourcesLimitOverrides} = action.data.node;

            return {
                ...state,
                host,
                resourcesLimit,
                resourcesLimitOverrides,
                visible: true,
            };
        }

        case CLOSE_RESOURCES_MODAL:
            return {...state, visible: false};

        case SET_RESOURCES_LIMIT.REQUEST:
            return {...state, loading: true};

        case SET_RESOURCES_LIMIT.SUCCESS:
            return {...state, loading: false};

        case SET_RESOURCES_LIMIT.FAILURE:
            return {...state, loading: false};

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(initialState, {}, reducer);
