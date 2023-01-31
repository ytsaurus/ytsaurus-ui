import {Action} from 'redux';
import {
    ACCOUNTS_USAGE_SNAPSHOTS_FAILED,
    ACCOUNTS_USAGE_SNAPSHOTS_REQUEST,
    ACCOUNTS_USAGE_SNAPSHOTS_SUCCESS,
} from '../../../../constants/accounts/accounts';
import {ActionD, YTError} from '../../../../types';

export interface AccountsSnapshotState {
    loaded?: boolean;
    loading?: boolean;
    error?: YTError;

    cluster: string;
    snapshot_timestamps: Array<number>;

    currentSnapshot?: number;
}

const initialState: AccountsSnapshotState = {
    cluster: '',
    snapshot_timestamps: [],
};

export default function reducer(state = initialState, action: AccountsSnapshotsAction) {
    switch (action.type) {
        case ACCOUNTS_USAGE_SNAPSHOTS_REQUEST:
            return {...state, loading: true};
        case ACCOUNTS_USAGE_SNAPSHOTS_SUCCESS:
            return {
                ...state,
                ...action.data,
                loaded: true,
                loading: false,
                error: undefined,
            };
        case ACCOUNTS_USAGE_SNAPSHOTS_FAILED:
            return {...state, ...action.data, loaded: false, loading: true};
    }
    return state;
}

export type AccountsSnapshotsAction =
    | Action<typeof ACCOUNTS_USAGE_SNAPSHOTS_REQUEST>
    | ActionD<
          typeof ACCOUNTS_USAGE_SNAPSHOTS_SUCCESS,
          Pick<AccountsSnapshotState, 'cluster' | 'snapshot_timestamps'>
      >
    | ActionD<
          typeof ACCOUNTS_USAGE_SNAPSHOTS_FAILED,
          Pick<AccountsSnapshotState, 'error' | 'cluster'>
      >;
