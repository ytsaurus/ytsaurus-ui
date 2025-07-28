import {GROUPS_TABLE, GROUPS_TABLE_DATA_FIELDS} from '../../../constants/groups';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import type {Action} from 'redux';
import type {ActionD, YTError} from '../../../types';
import type {OrderType} from '../../../utils/sort-helpers';

export type Group = {
    name: string;
    members?: string[];
    memberOf?: string[];
    idm?: boolean;
    externalSystem?: string;
};

type EphemeralStateType = {
    loaded: boolean;
    loading: boolean;
    error: YTError | null;
    groups: Group[];
    sort: {
        column: string;
        order: OrderType;
    };
    expanded: Record<string, boolean>;
};

const ephemeralState: EphemeralStateType = {
    loaded: false,
    loading: false,
    error: null,
    groups: [],
    sort: {
        column: 'name',
        order: 'asc',
    },
    expanded: {},
};

type PersistantStateType = {
    nameFilter: string;
};

const persistantState = {
    nameFilter: '',
};

type GroupsTableStateType = EphemeralStateType & PersistantStateType;

export const groupsTableState: GroupsTableStateType = {
    ...ephemeralState,
    ...persistantState,
};

function reducer(state: GroupsTableStateType = groupsTableState, action: GroupsTableAction) {
    switch (action.type) {
        case GROUPS_TABLE.REQUEST: {
            return {...state, loading: true};
        }
        case GROUPS_TABLE.SUCCESS: {
            return {
                ...state,
                loading: false,
                loaded: true,
                error: null,
                ...action.data,
            };
        }
        case GROUPS_TABLE.FAILURE: {
            return {...state, loading: false, loaded: false};
        }
        case GROUPS_TABLE.CANCELLED: {
            return {...state, loading: false, loaded: false, error: null};
        }
        case GROUPS_TABLE_DATA_FIELDS: {
            return {...state, ...action.data};
        }
        default:
            return state;
    }
}

export type GroupsTableAction =
    | Action<typeof GROUPS_TABLE.REQUEST>
    | ActionD<
          typeof GROUPS_TABLE.SUCCESS,
          {
              data: {
                  groups: Group[];
              };
          }
      >
    | ActionD<typeof GROUPS_TABLE.FAILURE, {error: YTError}>
    | Action<typeof GROUPS_TABLE.CANCELLED>
    | ActionD<
          typeof GROUPS_TABLE_DATA_FIELDS,
          {
              data: {
                  sort?: {
                      column: string;
                      order: string;
                  };
                  expanded?: Record<string, boolean>;
              };
          }
      >;

export default mergeStateOnClusterChange(ephemeralState, persistantState, reducer);
