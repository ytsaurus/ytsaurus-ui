import {mergeStateOnClusterChange} from '../../../store/reducers/utils';

import {GROUP_EDITOR_ACTION, GROUP_EDITOR_ACTION_DATA_FIELDS} from '../../../constants/groups';

const ephemeralState = {
    loaded: false,
    loading: false,
    error: null,
    data: {},
    idmData: {
        group: {
            members: [],
            responsibles: [],
        },
        version: '',
    },
    showModal: false,
    groupName: '', // editable group name
};

const persistantState = {};

export const groupEditorState = {
    ...ephemeralState,
    ...persistantState,
};

function reducer(state = groupEditorState, {type, data}) {
    switch (type) {
        case GROUP_EDITOR_ACTION.REQUEST: {
            return {...state, loading: true};
        }
        case GROUP_EDITOR_ACTION.SUCCESS: {
            return {
                ...state,
                loading: false,
                loaded: true,
                error: null,
                ...data,
            };
        }
        case GROUP_EDITOR_ACTION.FAILURE: {
            return {...state, loading: false, loaded: false};
        }
        case GROUP_EDITOR_ACTION.CANCELLED: {
            return {...state, loading: false, loaded: false, error: null};
        }
        case GROUP_EDITOR_ACTION_DATA_FIELDS: {
            return {...state, ...data};
        }
        default:
            return state;
    }
}

export default mergeStateOnClusterChange(ephemeralState, persistantState, reducer);
