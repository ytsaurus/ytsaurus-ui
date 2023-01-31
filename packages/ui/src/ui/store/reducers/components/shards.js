import _ from 'lodash';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {
    GET_SHARDS,
    SET_SHARD_NAME,
    OPEN_SHARD_NAME_EDITOR,
    CLOSE_SHARD_NAME_EDITOR,
} from '../../../constants/components/shards';

const prepareShards = (shards) => {
    return _.reduce(
        shards,
        (res, value) => {
            const attributes = ypath.getValue(value, '/@');
            res.push(attributes);
            return res;
        },
        [],
    );
};

const initialState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},
    shards: [],

    nameId: '',
    nameVisible: false,
    nameLoading: false,
    nameLoaded: false,
    nameError: false,
    nameErrorData: {},
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_SHARDS.REQUEST:
            return {...state, loading: true};

        case GET_SHARDS.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case GET_SHARDS.CANCELLED:
            return {...state, loading: false};

        case GET_SHARDS.SUCCESS: {
            const {shards} = action.data;

            return {
                ...state,
                shards: prepareShards(shards),
                loaded: true,
                loading: false,
                error: false,
            };
        }

        case OPEN_SHARD_NAME_EDITOR:
            return {...state, nameVisible: true, nameId: action.data.id};

        case CLOSE_SHARD_NAME_EDITOR:
            return {
                ...state,
                nameVisible: false,
                nameLoading: false,
                nameLoaded: false,
                nameError: false,
                nameId: '',
            };

        case SET_SHARD_NAME.REQUEST:
            return {...state, nameLoading: true};

        case SET_SHARD_NAME.FAILURE:
            return {
                ...state,
                nameLoading: false,
                nameError: true,
                nameErrorData: action.data.error,
            };

        case SET_SHARD_NAME.CANCELLED:
            return {...state, nameLoading: false};

        case SET_SHARD_NAME.SUCCESS: {
            return {
                ...state,
                nameLoaded: true,
                nameLoading: false,
                nameError: false,
            };
        }

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(initialState, {}, reducer);
