import {mergeStateOnClusterChange} from '../../../store/reducers/utils';

import {GROUP_EDITOR_ACTION, GROUP_EDITOR_ACTION_DATA_FIELDS} from '../../../constants/groups';
import type {Action} from 'redux';
import type {ActionD, YTError} from '../../../types';
import type {PreparedRole} from '../../../utils/acl';

type EditorDataType = {
    $attributes?: Record<string, string>;
};

type IDMDataType = {
    group: {
        members: Array<PreparedRole>;
        responsible: Array<PreparedRole>;
        other_members: string[];
    };
    version: string;
};

type EphemeralStateType = {
    loaded: boolean;
    loading: boolean;
    error: YTError | null;
    data: EditorDataType;
    idmData: IDMDataType;
    showModal: boolean;
    groupName: string;
};

const ephemeralState: EphemeralStateType = {
    loaded: false,
    loading: false,
    error: null,
    data: {},
    idmData: {
        group: {
            members: [],
            responsible: [],
            other_members: [],
        },
        version: '',
    },
    showModal: false,
    groupName: '', // editable group name
};

type PersistantStateType = {};

const persistantState: PersistantStateType = {};

type GroupEditorStateType = EphemeralStateType & PersistantStateType;

export const groupEditorState: GroupEditorStateType = {
    ...ephemeralState,
    ...persistantState,
};

function reducer(state: GroupEditorStateType = groupEditorState, action: GroupsEditorAction) {
    switch (action.type) {
        case GROUP_EDITOR_ACTION.REQUEST: {
            return {...state, loading: true};
        }
        case GROUP_EDITOR_ACTION.SUCCESS: {
            return {
                ...state,
                loading: false,
                loaded: true,
                error: null,
                ...action.data,
            };
        }
        case GROUP_EDITOR_ACTION.FAILURE: {
            return {...state, loading: false, loaded: false};
        }
        case GROUP_EDITOR_ACTION.CANCELLED: {
            return {...state, loading: false, loaded: false, error: null};
        }
        case GROUP_EDITOR_ACTION_DATA_FIELDS: {
            return {...state, ...action.data};
        }
        default:
            return state;
    }
}

export type GroupsEditorAction =
    | Action<typeof GROUP_EDITOR_ACTION.REQUEST>
    | ActionD<
          typeof GROUP_EDITOR_ACTION.SUCCESS,
          {
              data: EditorDataType;
              idmData: IDMDataType;
          }
      >
    | ActionD<typeof GROUP_EDITOR_ACTION.FAILURE, {error: YTError}>
    | Action<typeof GROUP_EDITOR_ACTION.CANCELLED>
    | ActionD<
          typeof GROUP_EDITOR_ACTION_DATA_FIELDS,
          {
              groupName?: string;
              showModal?: boolean;
          }
      >;

export default mergeStateOnClusterChange(ephemeralState, persistantState, reducer);
