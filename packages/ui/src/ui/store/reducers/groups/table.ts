import {GROUPS_TABLE, GROUPS_TABLE_DATA_FIELDS} from '../../../constants/groups';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';

const ephemeralState = {
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

const persistantState = {
    nameFilter: '',
};

export const groupsTableState = {
    ...ephemeralState,
    ...persistantState,
};

function reducer(state = groupsTableState, {type, data}) {
    switch (type) {
        case GROUPS_TABLE.REQUEST: {
            return {...state, loading: true};
        }
        case GROUPS_TABLE.SUCCESS: {
            return {
                ...state,
                loading: false,
                loaded: true,
                error: null,
                ...data,
            };
        }
        case GROUPS_TABLE.FAILURE: {
            return {...state, loading: false, loaded: false};
        }
        case GROUPS_TABLE.CANCELLED: {
            return {...state, loading: false, loaded: false, error: null};
        }
        case GROUPS_TABLE_DATA_FIELDS: {
            return {...state, ...data};
        }
        default:
            return state;
    }
}

export default mergeStateOnClusterChange(ephemeralState, persistantState, reducer);
