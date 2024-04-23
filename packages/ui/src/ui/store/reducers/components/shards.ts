import _ from 'lodash';
// @ts-expect-error
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {
    CLOSE_SHARD_NAME_EDITOR,
    GET_SHARDS,
    OPEN_SHARD_NAME_EDITOR,
    SET_SHARD_NAME,
} from '../../../constants/components/shards';
import type {ActionD} from '../../../types';

const prepareShards = (shards: RawShard[]): Shard[] => {
    return _.reduce(
        shards,
        (res: Shard[], value) => {
            const attributes = ypath.getValue(value, '/@');
            res.push(attributes);
            return res;
        },
        [],
    );
};

type RawShard = any;

export type Shard = {
    id: string;
    name: string;
    total_account_statistics: {
        node_count: number;
    };
};

export type ShardsState = {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData: any;
    shards: Shard[];

    nameId: string;
    nameVisible: boolean;
    nameLoading: boolean;
    nameLoaded: boolean;
    nameError: boolean;
    nameErrorData: any;
};

const initialState: ShardsState = {
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

const reducer = (state: ShardsState = initialState, action: ShardsAction) => {
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

export type ShardsAction =
    | ActionD<typeof SET_SHARD_NAME.REQUEST, undefined>
    | ActionD<typeof SET_SHARD_NAME.SUCCESS, undefined>
    | ActionD<typeof SET_SHARD_NAME.FAILURE, {error: any}>
    | ActionD<typeof SET_SHARD_NAME.CANCELLED, undefined>
    | ActionD<typeof GET_SHARDS.REQUEST, undefined>
    | ActionD<typeof GET_SHARDS.SUCCESS, {shards: RawShard[]}>
    | ActionD<typeof GET_SHARDS.FAILURE, {error: any}>
    | ActionD<typeof GET_SHARDS.CANCELLED, undefined>
    | ActionD<typeof OPEN_SHARD_NAME_EDITOR, {id: string}>
    | ActionD<typeof CLOSE_SHARD_NAME_EDITOR, undefined>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
