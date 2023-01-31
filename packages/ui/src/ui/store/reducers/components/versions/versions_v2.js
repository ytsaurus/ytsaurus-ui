import _ from 'lodash';
import {mergeStateOnClusterChange} from '../../../../store/reducers/utils';
import {
    DISCOVER_VERSIONS,
    CHANGE_HOST_FILTER,
    CHANGE_VERSION_FILTER,
    CHANGE_TYPE_FILTER,
    CHANGE_STATE_FILTER,
    CHANGE_BANNED_FILTER,
    CHANGE_VERSION_SUMMARY_PARTIAL,
} from '../../../../constants/components/versions/versions_v2';

const prepareGroup = (group, version) => {
    const res = _.reduce(
        group,
        (acc, value, type) => {
            const {total, banned, offline} = value;

            acc[type] = total;
            acc.banned += banned;
            acc.offline += offline;
            acc.online += total - offline;

            return acc;
        },
        {banned: 0, offline: 0, online: 0, version},
    );

    return {
        ...res,
        banned: res.banned || undefined,
        offline: res.offline || undefined,
        online: res.online || undefined,
    };
};

const prepareSummary = ({total, error, ...versions}) => {
    const preparedTotal = prepareGroup(total, 'total');
    const preparedError = error && prepareGroup(error, 'error');
    const preparedVersions = _.map(versions, prepareGroup);

    return [...preparedVersions, preparedError, preparedTotal];
};

const prepareDetails = (details) =>
    _.map(details, (detail) => {
        const calculatedState = detail.offline ? 'offline' : 'online';
        detail.state = detail.state ? detail.state : calculatedState;
        if (detail.error) {
            detail.state = 'error';
        }

        detail.banned = Boolean(detail.banned);

        return detail;
    });

const ephemeralState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},

    details: [],
    summary: [],
};

const persistedState = {
    hostFilter: '',
    versionFilter: 'all',
    typeFilter: 'all',
    stateFilter: 'all',
    bannedFilter: 'all',
    summarySortState: {column: 'version', order: 'asc'},
    checkedHideOffline: true,
};

export const initialState = {
    ...ephemeralState,
    ...persistedState,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case DISCOVER_VERSIONS.REQUEST:
            return {...state, loading: true};

        case DISCOVER_VERSIONS.SUCCESS: {
            const {versions} = action.data;
            const summary = prepareSummary(versions.summary);
            const details = prepareDetails(versions.details);

            return {
                ...state,
                summary,
                details,
                loaded: true,
                loading: false,
                error: false,
            };
        }

        case DISCOVER_VERSIONS.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case CHANGE_HOST_FILTER:
            return {...state, hostFilter: action.data.hostFilter};

        case CHANGE_VERSION_FILTER:
            return {...state, versionFilter: action.data.versionFilter};

        case CHANGE_TYPE_FILTER:
            return {...state, typeFilter: action.data.typeFilter};

        case CHANGE_STATE_FILTER:
            return {...state, stateFilter: action.data.stateFilter};

        case CHANGE_BANNED_FILTER:
            return {...state, bannedFilter: action.data.bannedFilter};

        case CHANGE_VERSION_SUMMARY_PARTIAL:
            return {...state, ...action.data};

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
