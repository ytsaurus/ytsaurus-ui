import {TABLE_MOUNT_CONFIG} from '../../../../../constants/navigation/content/table';
import {Action} from 'redux';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import {ActionD, YTError} from '../../../../../types';

export interface TableMountConfigState {
    loaded: boolean;
    loading: boolean;
    error: YTError | undefined;

    data: object | undefined;
}

const initialState: TableMountConfigState = {
    loaded: false,
    loading: false,
    error: undefined,

    data: undefined,
};

function reducer(state = initialState, action: TableMountConfigAction) {
    switch (action.type) {
        case TABLE_MOUNT_CONFIG.REQUEST:
            return {...initialState, loading: true};
        case TABLE_MOUNT_CONFIG.FAILURE:
            return {...state, ...action.data, loading: false, loaded: false};
        case TABLE_MOUNT_CONFIG.CANCELLED:
            return {...state, loading: false};
        case TABLE_MOUNT_CONFIG.SUCCESS:
            return {...state, ...action.data, loading: false, loaded: true};
    }
    return state;
}

export type TableMountConfigAction =
    | Action<typeof TABLE_MOUNT_CONFIG.REQUEST>
    | Action<typeof TABLE_MOUNT_CONFIG.CANCELLED>
    | ActionD<typeof TABLE_MOUNT_CONFIG.FAILURE, Pick<TableMountConfigState, 'error'>>
    | ActionD<typeof TABLE_MOUNT_CONFIG.SUCCESS, Pick<TableMountConfigState, 'data'>>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
